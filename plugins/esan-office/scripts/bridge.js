'use strict';
// ESAN AI AGENT bridge: receives Claude Code hook events on this machine, runs the office's own agents
// through `claude -p`, and serves the 8-bit office page.
// Run by scripts/start.js from the SessionStart hook, or by hand: node bridge.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');

const VERSION = '0.5.0';
const PORT = Number(process.env.ESAN_OFFICE_PORT) || 4567;
const LAN = process.env.ESAN_OFFICE_LAN === '1';
const MAX_RUNNING = Math.max(1, Number(process.env.ESAN_OFFICE_MAX) || 3);
const CLAUDE_BIN = process.env.ESAN_CLAUDE_BIN || 'claude';
const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'office', 'index.html');
// One data folder no matter who started the bridge (plugin hook, preview, or by hand), so agents and the token don't split
const DATA = process.env.ESAN_OFFICE_DATA || path.join(os.homedir(), '.esan-office');
const TEST_PLUGIN_DIR = process.env.ESAN_OFFICE_PLUGIN_DIR || ''; // test only: load a plugin folder into office runs
const ASLEEP_MS = 60 * 60 * 1000; // quiet sessions stay in the office, shown as asleep
const FORGET_MS = 12 * 60 * 60 * 1000; // only forget a session after this long with no events
const PERM_WAIT_MS = Number(process.env.ESAN_OFFICE_PERM_WAIT_MS) || 4 * 60 * 1000; // held tool calls answer "deny" after this
const PERM_WAIT_TEXT = PERM_WAIT_MS >= 60000 ? `${Math.round(PERM_WAIT_MS / 60000)} นาที` : `${Math.round(PERM_WAIT_MS / 1000)} วินาที`;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TOOLSET = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash', 'WebFetch', 'WebSearch', 'Task'];
const PERM_MODES = ['default', 'acceptEdits', 'plan', 'dontAsk'];
const MODELS = ['', 'haiku', 'sonnet', 'opus'];
// Tools Claude Code runs without asking; the office never holds these
const AUTO_OK = new Set(['Read', 'Grep', 'Glob', 'LS', 'TodoWrite', 'Task', 'Agent', 'NotebookRead', 'ExitPlanMode', 'EnterPlanMode', 'BashOutput', 'Skill', 'ToolSearch']);
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

try { fs.mkdirSync(DATA, { recursive: true }); } catch { /* fall back to no log */ }
function log(...parts) {
  try { fs.appendFileSync(path.join(DATA, 'bridge.log'), `${new Date().toISOString()} ${parts.join(' ')}\n`); } catch { /* ignore */ }
}

// ── TOKEN ── guards every endpoint that makes an agent do something; only injected into the page for local viewers
function loadToken() {
  const f = path.join(DATA, 'token');
  try { const t = fs.readFileSync(f, 'utf8').trim(); if (/^[a-f0-9]{32,}$/.test(t)) return t; } catch { /* create below */ }
  const t = crypto.randomBytes(24).toString('hex');
  try { fs.writeFileSync(f, t, { mode: 0o600 }); } catch { /* keep in memory */ }
  return t;
}
const TOKEN = loadToken();

// ── ROLES ── optional roles.json in the data folder: { "D:/work/shop-ui": "Frontend" }, longest matching prefix wins
function loadRoles() {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, 'roles.json'), 'utf8')); } catch { return {}; }
}
const norm = (p) => String(p || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
function roleFor(cwd) {
  const c = norm(cwd);
  let best = null, bestLen = -1;
  for (const [k, v] of Object.entries(loadRoles())) {
    const nk = norm(k);
    if ((c === nk || c.startsWith(nk + '/')) && nk.length > bestLen) { best = String(v); bestLen = nk.length; }
  }
  return best;
}

// ── HELPERS ──
const short = (s, n) => {
  const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
function modelName(m) {
  if (!m) return null;
  if (typeof m === 'string') return m;
  return m.id || m.display_name || null;
}
function addLog(s, kind, text) {
  s.log.push({ t: Date.now(), kind, text });
  if (s.log.length > 60) s.log.shift();
}
function toolInfo(name, input) {
  const i = input || {};
  let k = name || 'Tool', d = '';
  if (k.startsWith('mcp__')) { d = k.split('__').slice(2).join('__'); k = 'MCP'; }
  else {
    switch (k) {
      case 'Bash': case 'PowerShell': d = i.command; break;
      case 'Read': case 'Edit': case 'Write': case 'NotebookEdit': d = i.file_path ? path.basename(String(i.file_path)) : ''; break;
      case 'Grep': case 'Glob': d = i.pattern; break;
      case 'WebFetch': try { d = new URL(i.url).hostname; } catch { d = i.url; } break;
      case 'WebSearch': d = i.query; break;
      case 'Task': case 'Agent': d = i.subagent_type || i.description; break;
      default: d = i.description || '';
    }
  }
  return { name: k, detail: short(d, 70) };
}
// Everything the user needs to judge an approval: full path, full command, full URL
function toolFull(name, input) {
  const i = input || {};
  const v = i.file_path || i.notebook_path || i.command || i.url || i.query || i.pattern || i.description || '';
  return short(v, 400);
}
function ctxFromUsage(u, model) {
  const used = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
  if (!used) return null;
  const win = /\[1m\]/i.test(String(model || '')) || used > 200000 ? 1000000 : 200000;
  return { used, window: win, pct: Math.max(0, Math.min(100, Math.round(100 - (used / win) * 100))), exact: false };
}

// ── WATCHED SESSIONS ── sessions the user opened themselves (terminal / desktop app), reported by the plugin hooks
const sessions = new Map();
let rate = null, rateSrc = null, rateAt = 0; // plan quota: { five_hour, seven_day } in statusline shape, plus where and when it came from
let letterN = 0;

// Merge quota windows from any source; the newest reading wins per window, a missing window keeps its last value
function setRate(r, src) {
  const next = {};
  for (const k of ['five_hour', 'seven_day']) if (r && r[k] && typeof r[k].used_percentage === 'number') next[k] = r[k];
  if (!Object.keys(next).length) return;
  rate = Object.assign({}, rate || {}, next);
  rateSrc = src; rateAt = Date.now();
  changed();
}
// `claude -p` stream-json emits rate_limit_event; utilization is a 0..1 fraction.
// unifiedWindows carries both windows; older builds only report the window that triggered the event.
function rateFromEvent(info) {
  if (!info) return null;
  const pct = (w) => (w && typeof w.utilization === 'number' ? { used_percentage: Math.round(w.utilization * 1000) / 10, resets_at: w.resetsAt } : null);
  const u = info.unifiedWindows || {}, out = {};
  if (pct(u.five_hour)) out.five_hour = pct(u.five_hour);
  if (pct(u.seven_day)) out.seven_day = pct(u.seven_day);
  if (!Object.keys(out).length && (info.rateLimitType === 'five_hour' || info.rateLimitType === 'seven_day')) {
    const w = pct({ utilization: info.utilization, resetsAt: info.resetsAt });
    if (w) out[info.rateLimitType] = w;
  }
  return out;
}

function getSession(ev) {
  const id = ev.session_id;
  if (!id) return null;
  let s = sessions.get(id);
  if (!s) {
    const cwd = ev.cwd || '';
    s = {
      id, letter: LETTERS[letterN++ % LETTERS.length], cwd,
      project: path.basename(String(cwd).replace(/[\\/]+$/, '')) || 'session',
      role: roleFor(cwd), model: null, state: 'idle', tool: null, perm: null, ctx: null,
      startedAt: Date.now(), lastSeen: Date.now(), prompt: null, reply: null, subs: {}, log: [],
      transcript: null, ctxAt: 0,
    };
    sessions.set(id, s);
  }
  s.lastSeen = Date.now();
  if (ev.transcript_path) s.transcript = ev.transcript_path;
  return s;
}

// estimate context from the transcript tail; replaced by exact numbers when the statusline forwarder is set up
function readCtx(s, force) {
  if (!s.transcript || (s.ctx && s.ctx.exact)) return;
  const now = Date.now();
  if (!force && now - s.ctxAt < 1500) return;
  s.ctxAt = now;
  try {
    const fd = fs.openSync(s.transcript, 'r');
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, 262144);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i].includes('"usage"')) continue;
      let o;
      try { o = JSON.parse(lines[i]); } catch { continue; }
      const m = o.message;
      if (!m || !m.usage || o.isSidechain) continue;
      const c = ctxFromUsage(m.usage, s.model);
      if (c) s.ctx = c;
      if (m.model) s.modelId = m.model;
      return;
    }
  } catch { /* transcript may be missing or mid-write */ }
}

function onEvent(ev) {
  if (ownedSids.has(ev.session_id)) return; // office agents report through their own stream
  const name = ev.hook_event_name;
  const s = getSession(ev);
  if (!s) return;
  let sub = null;
  if (ev.agent_id) {
    sub = s.subs[ev.agent_id] || (s.subs[ev.agent_id] = { id: ev.agent_id, type: ev.agent_type || 'subagent', tool: null, startedAt: Date.now() });
  }
  switch (name) {
    case 'SessionStart':
      s.state = 'idle'; s.endedAt = null; s.tool = null; s.perm = null;
      if (ev.model) s.model = modelName(ev.model);
      addLog(s, 'sys', ev.source === 'resume' ? 'เปิด session ต่อจากของเดิม' : ev.source === 'clear' ? 'ล้างบทสนทนา เริ่มใหม่' : 'เริ่ม session');
      readCtx(s, true);
      break;
    case 'UserPromptSubmit':
      s.state = 'working'; s.tool = null; s.perm = null; s.prompt = short(ev.prompt, 300);
      addLog(s, 'you', short(ev.prompt, 160));
      break;
    case 'PreToolUse': {
      const t = toolInfo(ev.tool_name, ev.tool_input);
      if (sub) sub.tool = t; else { s.state = 'working'; s.tool = t; }
      addLog(s, 'tool', (sub ? `[${sub.type}] ` : '') + t.name + (t.detail ? ' ' + t.detail : ''));
      break;
    }
    case 'PermissionRequest': {
      const t = toolInfo(ev.tool_name, ev.tool_input);
      s.perm = t; s.state = 'working';
      addLog(s, 'perm', 'ขออนุญาตใช้ ' + t.name + (t.detail ? ' ' + t.detail : ''));
      break;
    }
    case 'PostToolUse':
    case 'PostToolUseFailure':
      s.perm = null;
      if (name === 'PostToolUseFailure') addLog(s, 'sys', `${ev.tool_name || 'เครื่องมือ'} ทำงานไม่สำเร็จ`);
      readCtx(s);
      break;
    case 'Notification':
      if (ev.notification_type === 'idle_prompt') { s.state = 'idle'; s.perm = null; }
      if (ev.message && ev.notification_type !== 'permission_prompt') addLog(s, 'sys', short(ev.message, 140));
      break;
    case 'Stop':
      s.state = 'idle'; s.tool = null; s.perm = null;
      if (typeof ev.last_assistant_message === 'string') s.reply = short(ev.last_assistant_message, 400);
      addLog(s, 'agent', short(typeof ev.last_assistant_message === 'string' ? ev.last_assistant_message : 'ตอบเสร็จแล้ว', 160));
      readCtx(s, true);
      // the transcript is written asynchronously and can lag the Stop event
      setTimeout(() => { readCtx(s, true); changed(); }, 1500).unref();
      break;
    case 'StopFailure':
      s.state = 'idle'; s.tool = null; s.perm = null;
      addLog(s, 'sys', 'ตอบไม่สำเร็จ (API error)');
      break;
    case 'SubagentStart':
      if (sub) addLog(s, 'sys', `เรียก subagent ${sub.type}`);
      break;
    case 'SubagentStop':
      if (sub) { delete s.subs[ev.agent_id]; addLog(s, 'sys', `${sub.type} ทำเสร็จแล้ว`); }
      break;
    case 'PostCompact':
      addLog(s, 'sys', 'compact context แล้ว');
      if (s.ctx) s.ctx.exact = false;
      readCtx(s, true);
      break;
    case 'SessionEnd':
      s.state = 'ended'; s.endedAt = Date.now(); s.tool = null; s.perm = null; s.subs = {};
      addLog(s, 'sys', 'ปิด session');
      break;
    default:
      return;
  }
  changed();
}

// Optional statusline forwarder (scripts/statusline.js) posts the exact numbers here
function onStatus(st) {
  if (st.session_id && !ownedSids.has(st.session_id)) {
    const s = getSession(st);
    const cw = st.context_window || {};
    if (typeof cw.remaining_percentage === 'number') {
      const win = cw.context_window_size || 200000;
      s.ctx = { used: Math.round(win * (100 - cw.remaining_percentage) / 100), window: win, pct: Math.round(cw.remaining_percentage), exact: true };
    }
    if (st.model) s.modelId = st.model.id || s.modelId;
  }
  setRate(st.rate_limits, 'statusline');
  changed();
}

// ── OFFICE AGENTS ── agents the office owns; each prompt runs `claude -p` in the agent's folder
const AGENTS_FILE = path.join(DATA, 'agents.json');
const agents = (() => { try { const a = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')); return Array.isArray(a) ? a : []; } catch { return []; } })();
const runtime = new Map();
const ownedSids = new Set();
const held = new Map(); // agent id → [{ key, res, timer, kind, perm }] tool calls waiting on the user, oldest first

function saveAgents() {
  try { fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2)); } catch (e) { log('save agents failed', e.message); }
}
function newRuntime() {
  return { state: 'idle', tool: null, perm: null, log: [], ctx: null, prompt: null, reply: null, cost: null, queue: [], child: null,
    subs: {}, taskTypes: {}, lastSeen: Date.now(), model: null, lastText: '', gotResult: false, stopping: false, stderr: '' };
}
agents.forEach((a) => { runtime.set(a.id, newRuntime()); if (a.sessionId) ownedSids.add(a.sessionId); });

function agentDir(id) {
  const d = path.join(DATA, 'agents', id);
  fs.mkdirSync(d, { recursive: true });
  return d;
}
function cleanConfig(input, base) {
  const out = Object.assign({}, base);
  const errors = [];
  if (input.name !== undefined) { out.name = short(input.name, 30); if (!out.name) errors.push('ต้องมีชื่อ agent'); }
  if (input.role !== undefined) out.role = short(input.role, 20);
  if (input.cwd !== undefined) {
    const cwd = String(input.cwd || '').trim();
    let ok = false;
    try { ok = !!cwd && path.isAbsolute(cwd) && fs.statSync(cwd).isDirectory(); } catch { ok = false; }
    if (!ok) errors.push('หาโฟลเดอร์ทำงานไม่เจอ ใส่ path เต็มของโฟลเดอร์ที่มีอยู่จริง เช่น D:/work/shop-ui');
    else out.cwd = path.resolve(cwd);
  }
  if (input.prompt !== undefined) out.prompt = String(input.prompt || '').slice(0, 4000);
  if (input.allowedTools !== undefined) out.allowedTools = (Array.isArray(input.allowedTools) ? input.allowedTools : []).filter((t) => TOOLSET.includes(t));
  if (input.permMode !== undefined) out.permMode = PERM_MODES.includes(input.permMode) ? input.permMode : 'default';
  if (input.model !== undefined) out.model = MODELS.includes(input.model) ? input.model : '';
  return { cfg: out, errors };
}
function createAgent(input) {
  const { cfg, errors } = cleanConfig(Object.assign({ name: '', cwd: '', role: '', prompt: '', allowedTools: ['Read', 'Grep', 'Glob'], permMode: 'default', model: '' }, input), {});
  if (errors.length) return { error: errors[0] };
  const a = Object.assign(cfg, { id: crypto.randomBytes(5).toString('hex'), sessionId: null, started: false, createdAt: Date.now() });
  agents.push(a);
  runtime.set(a.id, newRuntime());
  addLog(runtime.get(a.id), 'sys', 'เข้าออฟฟิศเป็นวันแรก พร้อมรับงาน');
  saveAgents();
  changed();
  return { id: a.id };
}
function runningCount() { let n = 0; for (const rt of runtime.values()) if (rt.child) n++; return n; }

// ── EASY RESEARCH ── the quick-ask box: one cheap, read-only agent, created on first use in its own data folder
const EASY = {
  name: 'Easy Research', role: 'Easy Research', model: 'haiku', permMode: 'dontAsk',
  allowedTools: ['Read', 'Grep', 'Glob', 'WebSearch', 'WebFetch'],
  prompt: 'คุณคือผู้ช่วยค้นข้อมูลแบบเร็ว ตอบคำถามสั้น ๆ เป็นภาษาไทยอ่านง่าย ไม่เกิน 6 บรรทัด ถ้าค้นจากเว็บให้แนบลิงก์ที่มา ห้ามแก้ไฟล์',
};
function easyAgent() {
  const found = agents.find((x) => x.easy);
  if (found) return found;
  const cwd = path.join(DATA, 'easy-research');
  fs.mkdirSync(cwd, { recursive: true });
  const r = createAgent(Object.assign({ cwd }, EASY));
  if (r.error) return null;
  const a = agents.find((x) => x.id === r.id);
  a.easy = true;
  saveAgents();
  return a;
}
function askEasy(text) {
  const a = easyAgent();
  if (!a) return null;
  const rt = runtime.get(a.id);
  // every quick question starts a fresh conversation so the context (and the bill) stays small
  if (!rt.child && !rt.queue.length && a.sessionId) { ownedSids.add(a.sessionId); a.sessionId = null; a.started = false; rt.ctx = null; saveAgents(); }
  return { id: a.id, status: submitPrompt(a, text) };
}

// Windows: npm installs `claude` as a .cmd shim, which spawn() can't run without a shell (ENOENT / EINVAL),
// so go through cmd.exe there and quote the arguments ourselves.
const WIN = process.platform === 'win32';
function winQuote(s) {
  s = String(s);
  if (/^[\w\-.,:/\\=@]+$/.test(s)) return s;
  return '"' + s.replace(/"/g, '').replace(/(\\+)$/, '$1$1') + '"';
}
function spawnClaude(args, opts) {
  if (!WIN) return spawn(CLAUDE_BIN, args, opts);
  return spawn([CLAUDE_BIN, ...args].map(winQuote).join(' '), [], Object.assign({}, opts, { shell: true }));
}
// With a shell in between, kill() would only stop cmd.exe and leave claude running
function killRun(child) {
  if (WIN && child.pid) {
    try { spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); return; } catch { /* fall back */ }
  }
  try { child.kill(); } catch { /* already gone */ }
}

// ── QUOTA REFRESH ── desktop-app sessions never run the statusline, so the page can ask for one tiny
// Haiku call and read the plan quota from its rate_limit_event. Manual only, at most once a minute.
const QUOTA_MIN_MS = 60 * 1000;
let quotaRun = null, quotaAt = 0, quotaErr = null;
function refreshQuota() {
  if (quotaRun) return { status: 'running' };
  const wait = QUOTA_MIN_MS - (Date.now() - quotaAt);
  if (wait > 0) return { error: `เพิ่งอัปเดตไป กดใหม่ได้ในอีก ${Math.ceil(wait / 1000)} วินาที`, code: 429 };
  quotaAt = Date.now();
  const dir = path.join(DATA, 'quota');
  fs.mkdirSync(dir, { recursive: true });
  const sid = crypto.randomUUID();
  ownedSids.add(sid); // its hooks must not walk into the office as a session
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--model', 'haiku', '--max-turns', '1',
    '--permission-mode', 'dontAsk', '--no-session-persistence', '--session-id', sid];
  let child;
  try { child = spawnClaude(args, { cwd: dir, env: process.env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); }
  catch (e) { return { error: 'เปิด claude ไม่ได้: ' + e.message, code: 500 }; }
  quotaRun = child; quotaErr = null;
  changed();
  let buf = '', got = false, stderr = '';
  const done = (why) => {
    if (quotaRun !== child) return;
    quotaRun = null;
    quotaErr = got ? null : (why || 'ไม่ได้ตัวเลขโควตากลับมา (บัญชีแบบ API key ไม่มีโควตานี้)');
    if (quotaErr) log('quota refresh failed', quotaErr, short(stderr, 200));
    changed();
  };
  child.stdin.on('error', () => { /* claude exited early */ });
  child.stdin.end('ตอบคำว่า ok คำเดียว');
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (o.type === 'rate_limit_event') { const r = rateFromEvent(o.rate_limit_info); if (r && Object.keys(r).length) { got = true; setRate(r, 'refresh'); } }
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (d) => { stderr = (stderr + d).slice(-2000); });
  child.on('error', (e) => done(e.code === 'ENOENT' ? 'หาโปรแกรม claude ไม่เจอ' : e.message));
  child.on('close', () => done());
  setTimeout(() => { if (quotaRun === child) { killRun(child); done('ช้าเกิน 90 วินาที ยกเลิกแล้ว'); } }, 90000).unref();
  return { status: 'started' };
}

function submitPrompt(a, text) {
  const rt = runtime.get(a.id);
  addLog(rt, 'you', short(text, 160));
  if (rt.child || runningCount() >= MAX_RUNNING) {
    rt.queue.push(text);
    addLog(rt, 'sys', rt.child ? 'รับทราบ ต่อคิวไว้ ทำหลังงานที่ทำอยู่' : `มี agent ทำงานพร้อมกันครบ ${MAX_RUNNING} ตัวแล้ว ต่อคิวไว้ก่อน`);
    changed();
    return 'queued';
  }
  startRun(a, rt, text);
  return 'started';
}

function startRun(a, rt, text) {
  const dir = agentDir(a.id);
  const settingsFile = path.join(dir, 'settings.json');
  const promptFile = path.join(dir, 'system-prompt.md');
  // Hooks only for this run. `claude -p` never fires PermissionRequest, so approval goes through PreToolUse:
  // the bridge holds a call that would need permission until the user answers in the office.
  const hook = { matcher: '*', hooks: [{ type: 'http', url: `http://127.0.0.1:${PORT}/hook`, timeout: 300, headers: { 'X-Esan-Hook': '1', 'X-Esan-Agent': a.id } }] };
  fs.writeFileSync(settingsFile, JSON.stringify({ hooks: { PreToolUse: [hook], PermissionRequest: [hook] } }));
  fs.writeFileSync(promptFile, a.prompt || '');
  if (!a.sessionId) { a.sessionId = crypto.randomUUID(); a.started = false; saveAgents(); }
  ownedSids.add(a.sessionId);

  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--settings', settingsFile, '--permission-mode', a.permMode || 'default'];
  if (a.prompt && a.prompt.trim()) args.push('--append-system-prompt-file', promptFile);
  if (a.model) args.push('--model', a.model);
  if (TEST_PLUGIN_DIR) args.push('--plugin-dir', TEST_PLUGIN_DIR);
  args.push(a.started ? '--resume' : '--session-id', a.sessionId);
  if (a.allowedTools && a.allowedTools.length) args.push('--allowedTools', a.allowedTools.join(','));

  let child;
  try {
    child = spawnClaude(args, { cwd: a.cwd, env: Object.assign({}, process.env, { ESAN_OFFICE_AGENT: a.id }), windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    addLog(rt, 'sys', 'เปิด claude ไม่ได้: ' + e.message);
    changed();
    return;
  }
  Object.assign(rt, { child, state: 'working', tool: null, perm: null, prompt: short(text, 300), lastText: '', gotResult: false, stopping: false, stderr: '', lastSeen: Date.now() });
  changed();
  child.stdin.on('error', () => { /* claude exited early */ });
  child.stdin.end(text); // prompt on stdin: avoids Windows argv quoting of Thai / multi-line text

  let buf = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) onStream(a, rt, line);
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (d) => { rt.stderr = (rt.stderr + d).slice(-4000); });
  child.on('error', (e) => {
    addLog(rt, 'sys', e.code === 'ENOENT' ? 'หาโปรแกรม claude ไม่เจอ ตั้ง ESAN_CLAUDE_BIN เป็น path ของ claude ก่อนรัน bridge' : 'เปิด claude ไม่ได้: ' + e.message);
    finishRun(a, rt);
  });
  child.on('close', (code) => {
    if (!rt.gotResult && !rt.stopping) {
      const err = short(rt.stderr, 220);
      if (/already in use/i.test(rt.stderr)) { a.started = true; saveAgents(); }
      // through cmd.exe a missing claude is an exit code, not an ENOENT error
      if (WIN && /is not recognized as an internal or external command/i.test(rt.stderr)) addLog(rt, 'sys', 'หาโปรแกรม claude ไม่เจอ ตั้ง ESAN_CLAUDE_BIN เป็น path ของ claude ก่อนรัน bridge');
      else addLog(rt, 'sys', `claude จบโดยไม่มีคำตอบ (code ${code})` + (err ? ': ' + err : ''));
    }
    finishRun(a, rt);
  });
}

function onStream(a, rt, line) {
  let o;
  try { o = JSON.parse(line); } catch { return; }
  rt.lastSeen = Date.now();
  if (o.type === 'system' && o.subtype === 'init') {
    if (o.session_id && o.session_id !== a.sessionId) { ownedSids.add(o.session_id); a.sessionId = o.session_id; }
    a.started = true;
    saveAgents();
    if (o.model) rt.model = o.model;
    if (Array.isArray(o.plugins)) log('run init', a.id, 'plugins=' + o.plugins.map((p) => p.name).join(','));
  } else if (o.type === 'rate_limit_event') {
    setRate(rateFromEvent(o.rate_limit_info), 'agent');
    return;
  } else if (o.type === 'system' && o.subtype === 'api_retry') {
    addLog(rt, 'sys', `API ขัดข้อง กำลังลองใหม่ครั้งที่ ${o.attempt || '?'}`);
  } else if (o.type === 'assistant' && o.message) {
    const m = o.message, parent = o.parent_tool_use_id;
    for (const b of m.content || []) {
      if (b.type === 'tool_use') {
        const t = toolInfo(b.name, b.input);
        if (parent) {
          const s = rt.subs[parent] || (rt.subs[parent] = { id: parent, type: rt.taskTypes[parent] || 'subagent', tool: null });
          s.tool = t;
          addLog(rt, 'tool', `[${s.type}] ${t.name}${t.detail ? ' ' + t.detail : ''}`);
        } else {
          rt.tool = t;
          addLog(rt, 'tool', t.name + (t.detail ? ' ' + t.detail : ''));
          if (b.name === 'Task' || b.name === 'Agent') {
            const type = (b.input && b.input.subagent_type) || 'subagent';
            rt.taskTypes[b.id] = type;
            rt.subs[b.id] = { id: b.id, type, tool: null };
            addLog(rt, 'sys', `เรียก subagent ${type}`);
          }
        }
      } else if (b.type === 'text' && !parent && b.text && b.text.trim()) {
        rt.lastText = b.text;
      }
    }
    if (m.usage && !parent) { const c = ctxFromUsage(m.usage, m.model || rt.model); if (c) rt.ctx = c; }
    if (m.model && !parent) rt.model = m.model;
  } else if (o.type === 'user' && o.message && Array.isArray(o.message.content)) {
    for (const b of o.message.content) {
      if (b.type === 'tool_result' && rt.subs[b.tool_use_id]) { addLog(rt, 'sys', `${rt.subs[b.tool_use_id].type} ทำเสร็จแล้ว`); delete rt.subs[b.tool_use_id]; }
    }
  } else if (o.type === 'result') {
    rt.gotResult = true;
    const text = typeof o.result === 'string' ? o.result : rt.lastText;
    rt.reply = short(text, 600);
    if (typeof o.total_cost_usd === 'number') rt.cost = o.total_cost_usd;
    addLog(rt, o.is_error ? 'sys' : 'agent', short(text || (o.is_error ? 'ทำงานไม่สำเร็จ' : 'เสร็จแล้ว'), 200));
    const denied = Array.isArray(o.permission_denials) ? o.permission_denials.length : 0;
    if (denied) addLog(rt, 'sys', `มีคำขอที่ถูกปฏิเสธ ${denied} ครั้ง`);
  } else return;
  changed();
}

function finishRun(a, rt) {
  if (!rt.child) return;
  rt.child = null;
  releaseAll(a.id, 'งานจบแล้ว');
  Object.assign(rt, { state: 'idle', tool: null, perm: null, subs: {}, taskTypes: {} });
  changed();
  pump();
}
// start queued prompts while there are free slots: an agent's own queue first, in the order agents were created
function pump() {
  for (const a of agents) {
    if (runningCount() >= MAX_RUNNING) return;
    const rt = runtime.get(a.id);
    if (rt && !rt.child && rt.queue.length) { addLog(rt, 'sys', 'เริ่มงานที่ต่อคิวไว้'); startRun(a, rt, rt.queue.shift()); }
  }
}
function stopAgent(a) {
  const rt = runtime.get(a.id);
  rt.queue = [];
  if (rt.child) {
    rt.stopping = true;
    addLog(rt, 'sys', 'สั่งหยุดแล้ว');
    killRun(rt.child);
  }
  changed();
}

// Would Claude Code have asked the user before running this tool in this agent's permission mode?
function needsApproval(a, tool) {
  if (a.permMode === 'plan' || a.permMode === 'dontAsk') return false; // Claude denies these itself
  if ((a.allowedTools || []).includes(tool) || AUTO_OK.has(tool)) return false;
  if (a.permMode === 'acceptEdits' && EDIT_TOOLS.has(tool)) return false;
  return true;
}
// Tool calls from office runs that need permission are held here until the user answers.
// Several can wait at once (two files in one turn, or a subagent and the main thread), oldest first.
function syncPerm(agentId) {
  const rt = runtime.get(agentId), list = held.get(agentId) || [];
  if (rt) rt.perm = list.length ? Object.assign({}, list[0].perm, { key: list[0].key, count: list.length }) : null;
}
function holdPermission(agentId, ev, res) {
  const a = agents.find((x) => x.id === agentId), rt = runtime.get(agentId);
  if (!a || !rt || !rt.child || !needsApproval(a, ev.tool_name)) return send(res, 200, 'application/json', '{}');
  const t = toolInfo(ev.tool_name, ev.tool_input);
  const entry = { key: String(ev.tool_use_id || crypto.randomUUID()), res, kind: ev.hook_event_name,
    perm: { name: t.name, detail: t.detail, full: toolFull(ev.tool_name, ev.tool_input), sub: ev.agent_type || null } };
  entry.timer = setTimeout(() => releaseHeld(agentId, false, `รอนานเกิน ${PERM_WAIT_TEXT} ปฏิเสธอัตโนมัติ`, entry.key), PERM_WAIT_MS);
  const list = held.get(agentId) || [];
  list.push(entry);
  held.set(agentId, list);
  addLog(rt, 'perm', `ขออนุญาตใช้ ${entry.perm.sub ? '[' + entry.perm.sub + '] ' : ''}${t.name} ${entry.perm.full}`.trim());
  res.on('close', () => {
    if (res.writableEnded) return;
    const l = held.get(agentId) || [], i = l.indexOf(entry);
    if (i >= 0) { clearTimeout(entry.timer); l.splice(i, 1); syncPerm(agentId); changed(); }
  });
  syncPerm(agentId);
  changed();
}
function releaseHeld(agentId, allow, reason, key) {
  const list = held.get(agentId) || [];
  const i = key ? list.findIndex((e) => e.key === key) : 0;
  const h = list[i];
  if (!h) return false;
  list.splice(i, 1);
  clearTimeout(h.timer);
  const why = allow ? 'อนุญาตจากหน้าออฟฟิศ ESAN AI AGENT' : (reason || 'ผู้ใช้ไม่อนุญาตจากหน้าออฟฟิศ');
  const out = h.kind === 'PreToolUse'
    ? { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: allow ? 'allow' : 'deny', permissionDecisionReason: why } }
    : { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: allow ? { behavior: 'allow' } : { behavior: 'deny', reason: why } } };
  try { send(h.res, 200, 'application/json', JSON.stringify(out)); } catch { /* run ended */ }
  const rt = runtime.get(agentId);
  if (rt) addLog(rt, 'sys', `${allow ? 'อนุญาต' : 'ไม่อนุญาต'} ${h.perm.name} ${h.perm.full}`.trim() + (allow ? '' : ` (${reason || 'คุณกดไม่อนุญาต'})`));
  syncPerm(agentId);
  changed();
  return true;
}
function releaseAll(agentId, reason) { while (releaseHeld(agentId, false, reason)) { /* deny every waiting call */ } }

// ── SNAPSHOT ──
function snapshot() {
  const now = Date.now();
  const watched = [...sessions.values()].map((s) => ({
    id: s.id, letter: s.letter, name: 'Claude ' + s.letter, project: s.project, cwd: s.cwd, role: s.role,
    model: s.modelId || s.model, state: s.state, asleep: s.state === 'idle' && now - s.lastSeen > ASLEEP_MS,
    tool: s.tool, perm: s.perm, ctx: s.ctx, prompt: s.prompt, reply: s.reply, startedAt: s.startedAt, lastSeen: s.lastSeen,
    subs: Object.values(s.subs).map((x) => ({ id: x.id, type: x.type, tool: x.tool })), log: s.log.slice(-25),
  }));
  const owned = agents.map((a) => {
    const rt = runtime.get(a.id);
    return {
      id: 'office:' + a.id, agentId: a.id, owned: true, name: a.name, project: path.basename(a.cwd), cwd: a.cwd, role: a.role,
      model: rt.model || a.model || null, state: rt.child ? 'working' : 'idle', tool: rt.tool, perm: rt.perm, ctx: rt.ctx,
      prompt: rt.prompt, reply: rt.reply, startedAt: a.createdAt, lastSeen: rt.lastSeen, queue: rt.queue.length, cost: rt.cost,
      hasSession: !!a.started, subs: Object.values(rt.subs).map((x) => ({ id: x.id, type: x.type, tool: x.tool })), log: rt.log.slice(-40),
      cfg: { prompt: a.prompt, allowedTools: a.allowedTools, permMode: a.permMode, model: a.model || '' },
    };
  });
  return { app: 'esan-office', version: VERSION, now, rate, quota: { src: rateSrc, at: rateAt, refreshing: !!quotaRun, error: quotaErr }, office: { max: MAX_RUNNING, running: runningCount() }, sessions: owned.concat(watched) };
}

// ── SSE ──
const clients = new Set();
let pending = null;
function changed() {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    const msg = `data: ${JSON.stringify(snapshot())}\n\n`;
    for (const res of clients) { try { res.write(msg); } catch { clients.delete(res); } }
  }, 120);
}

// ── HTTP ──
const isLocal = (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
// Only answer to our own host names, so a DNS-rebinding page can't read prompts or file names from /api/state
function lanHosts() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal) out.push(`${n.address}:${PORT}`);
  return out;
}
function hostOk(req) {
  const h = String(req.headers.host || '').toLowerCase();
  if (h === `127.0.0.1:${PORT}` || h === `localhost:${PORT}` || h === `[::1]:${PORT}`) return true;
  return LAN && lanHosts().includes(h);
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function send(res, code, type, body) {
  if (res.writableEnded) return;
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}
const json = (res, code, obj) => send(res, code, 'application/json; charset=utf-8', JSON.stringify(obj));

async function handleAgentApi(req, res, url) {
  // Mutations: this machine only, with the token the page got from the same origin
  if (!isLocal(req) || req.headers['x-esan-token'] !== TOKEN) return json(res, 403, { error: 'สั่งงานได้เฉพาะจากหน้าออฟฟิศบนเครื่องนี้' });
  let body = {};
  try { body = JSON.parse((await readBody(req, 256 * 1024)) || '{}'); } catch { return json(res, 400, { error: 'ข้อมูลไม่ถูกต้อง' }); }
  // Take a watched session out of the office (e.g. a closed terminal that never sent SessionEnd).
  // It walks back in on its next hook event if it is still alive.
  const sm = url.pathname.match(/^\/api\/sessions\/([\w-]+)\/dismiss$/);
  if (sm) {
    if (!sessions.delete(sm[1])) return json(res, 404, { error: 'ไม่เจอ session นี้ อาจออกจากออฟฟิศไปแล้ว' });
    changed();
    return json(res, 200, { ok: true });
  }
  if (url.pathname === '/api/quota/refresh') {
    const r = refreshQuota();
    return r.error ? json(res, r.code || 500, { error: r.error }) : json(res, 200, r);
  }
  if (url.pathname === '/api/easy') {
    const text = String(body.text || '').trim();
    if (!text) return json(res, 400, { error: 'พิมพ์คำถามก่อน' });
    if (text.length > 2000) return json(res, 400, { error: 'คำถามยาวเกิน 2,000 ตัวอักษร ใช้ agent ประจำออฟฟิศแทน' });
    const r = askEasy(text);
    return r ? json(res, 200, r) : json(res, 500, { error: 'สร้าง Easy Research ไม่ได้ ดู bridge.log' });
  }
  if (url.pathname === '/api/agents') {
    const r = createAgent(body);
    return json(res, r.error ? 400 : 200, r);
  }
  const m = url.pathname.match(/^\/api\/agents\/([a-f0-9]+)\/(prompt|permission|stop|config|reset|delete)$/);
  const a = m && agents.find((x) => x.id === m[1]);
  if (!a) return json(res, 404, { error: 'ไม่เจอ agent ตัวนี้' });
  const rt = runtime.get(a.id);
  switch (m[2]) {
    case 'prompt': {
      const text = String(body.text || '').trim();
      if (!text) return json(res, 400, { error: 'พิมพ์งานที่ต้องการก่อน' });
      if (text.length > 20000) return json(res, 400, { error: 'ข้อความยาวเกิน 20,000 ตัวอักษร' });
      return json(res, 200, { status: submitPrompt(a, text) });
    }
    case 'permission':
      if (!releaseHeld(a.id, !!body.allow, body.allow ? '' : 'คุณกดไม่อนุญาต', body.id ? String(body.id) : undefined)) return json(res, 409, { error: 'ไม่มีคำขออนุญาตค้างอยู่แล้ว' });
      return json(res, 200, { ok: true });
    case 'stop':
      stopAgent(a);
      return json(res, 200, { ok: true });
    case 'config': {
      const { cfg, errors } = cleanConfig(body, a);
      if (errors.length) return json(res, 400, { error: errors[0] });
      Object.assign(a, cfg);
      saveAgents();
      addLog(rt, 'sys', 'อัปเดตการตั้งค่าแล้ว มีผลกับงานถัดไป');
      changed();
      return json(res, 200, { ok: true });
    }
    case 'reset':
      if (rt.child) return json(res, 409, { error: 'หยุดงานที่ทำอยู่ก่อน แล้วค่อยเริ่มบทสนทนาใหม่' });
      if (a.sessionId) ownedSids.add(a.sessionId); // keep ignoring hooks from the old conversation
      a.sessionId = null; a.started = false; rt.ctx = null; rt.cost = null;
      saveAgents();
      addLog(rt, 'sys', 'เริ่มบทสนทนาใหม่ งานถัดไปจะไม่เห็นบทสนทนาเก่า');
      changed();
      return json(res, 200, { ok: true });
    case 'delete':
      stopAgent(a);
      agents.splice(agents.indexOf(a), 1);
      runtime.delete(a.id);
      saveAgents();
      changed();
      return json(res, 200, { ok: true });
    default:
      return json(res, 404, { error: 'Not found' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!hostOk(req)) return send(res, 403, 'text/plain', 'Forbidden');
  try {
    if (req.method === 'POST' && (url.pathname === '/hook' || url.pathname === '/status')) {
      // Only hooks from this machine; the custom header blocks forged cross-site form posts
      if (!isLocal(req) || req.headers['x-esan-hook'] !== '1') return send(res, 403, 'application/json', '{}');
      const body = await readBody(req, 2 * 1024 * 1024);
      let ev = null;
      try { ev = JSON.parse(body); } catch { /* ignore bad JSON */ }
      const agentId = req.headers['x-esan-agent'];
      if (ev && agentId && url.pathname === '/hook' && (ev.hook_event_name === 'PreToolUse' || ev.hook_event_name === 'PermissionRequest')) {
        return holdPermission(String(agentId), ev, res);
      }
      if (ev && !agentId) { if (url.pathname === '/hook') onEvent(ev); else onStatus(ev); }
      // PermissionRequest from a watched session is never held: the user's own dialog must not be delayed
      return send(res, 200, 'application/json', '{}');
    }
    if (req.method === 'POST' && url.pathname === '/api/shutdown') {
      // A newer plugin version (scripts/start.js) asks this bridge to step aside so the update takes effect.
      // Same guard as hooks; never while an office agent is running or has queued work.
      if (!isLocal(req) || req.headers['x-esan-hook'] !== '1') return send(res, 403, 'application/json', '{}');
      if ([...runtime.values()].some((rt) => rt.child || rt.queue.length)) return json(res, 409, { error: 'agent ประจำออฟฟิศยังทำงานหรือมีคิวอยู่' });
      log('shutdown requested by a newer plugin version');
      json(res, 200, { ok: true });
      setTimeout(shutdown, 50);
      return;
    }
    if (req.method === 'POST' && (url.pathname.startsWith('/api/agents') || url.pathname.startsWith('/api/sessions/') || url.pathname === '/api/easy' || url.pathname === '/api/quota/refresh')) return handleAgentApi(req, res, url);
    if (req.method !== 'GET') return send(res, 405, 'text/plain', 'Method not allowed');
    if (url.pathname === '/api/ping') return json(res, 200, { app: 'esan-office', version: VERSION, pid: process.pid });
    if (url.pathname === '/api/state') return json(res, 200, snapshot());
    if (url.pathname === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write(`retry: 2000\ndata: ${JSON.stringify(snapshot())}\n\n`);
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    // app files for installing the office as a PWA
    const STATIC = { '/manifest.webmanifest': 'application/manifest+json', '/sw.js': 'text/javascript; charset=utf-8', '/icon-192.png': 'image/png', '/icon-512.png': 'image/png' };
    if (STATIC[url.pathname]) {
      const file = path.join(ROOT, 'office', url.pathname.slice(1));
      if (url.pathname === '/sw.js') res.setHeader('Service-Worker-Allowed', '/');
      return send(res, 200, STATIC[url.pathname], fs.readFileSync(file));
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // viewers on other devices get the page without the token, so they can watch but not command
      const html = fs.readFileSync(PAGE, 'utf8').replace('__ESAN_TOKEN__', isLocal(req) ? TOKEN : '');
      return send(res, 200, 'text/html; charset=utf-8', html);
    }
    return send(res, 404, 'text/plain', 'Not found');
  } catch (e) {
    log('request error', e && e.message);
    if (!res.headersSent) send(res, 500, 'text/plain', 'Error');
  }
});

// ── HOUSEKEEPING ── drop ended sessions, forget long-silent ones, keep SSE alive.
// The bridge never exits on its own: an open-but-quiet terminal session would otherwise hit refused hooks.
let wasAsleep = 0;
setInterval(() => {
  const now = Date.now();
  let dirty = false, asleep = 0;
  for (const [id, s] of sessions) {
    if (s.state === 'ended' && now - s.endedAt > 30000) { sessions.delete(id); dirty = true; }
    else if (now - s.lastSeen > FORGET_MS) { sessions.delete(id); dirty = true; }
    else if (s.state === 'idle' && now - s.lastSeen > ASLEEP_MS) asleep++;
  }
  if (asleep !== wasAsleep) { wasAsleep = asleep; dirty = true; }
  if (dirty) changed();
  for (const res of clients) { try { res.write(': ping\n\n'); } catch { clients.delete(res); } }
}, 20000);

function shutdown() {
  for (const rt of runtime.values()) if (rt.child) killRun(rt.child);
  if (quotaRun) killRun(quotaRun);
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') process.exit(0); // another bridge is already serving
  log('server error', e.message);
  process.exit(1);
});
server.listen(PORT, LAN ? '0.0.0.0' : '127.0.0.1', () => log(`listening on ${LAN ? '0.0.0.0' : '127.0.0.1'}:${PORT}`));
