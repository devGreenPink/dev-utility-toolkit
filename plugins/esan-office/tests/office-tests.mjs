// End-to-end tests for the esan-office bridge (see README "การพัฒนาและทดสอบ").
// Start the bridge first with test settings:
//   ESAN_OFFICE_PERM_WAIT_MS=8000 ESAN_OFFICE_MAX=1 ESAN_OFFICE_LAN=1 ESAN_OFFICE_PLUGIN_DIR=<this plugin folder> node scripts/bridge.js
// Then: node tests/office-tests.mjs            (full run, spends a little quota on Haiku)
//       ONLY_FREE=1 node tests/office-tests.mjs (fake events and API checks only, no tokens)
// Set ESAN_OFFICE_PORT (and ESAN_OFFICE_DATA) for both commands to test a second bridge next to the one you use.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORK = path.join(os.tmpdir(), 'esan-office-tests');
const PORT = Number(process.env.ESAN_OFFICE_PORT) || 4567;
const BASE = `http://127.0.0.1:${PORT}`;
const DATA = process.env.ESAN_OFFICE_DATA || path.join(os.homedir(), '.esan-office');
const TOKEN = fs.readFileSync(path.join(DATA, 'token'), 'utf8').trim();
const AGENTS_FILE = path.join(DATA, 'agents.json');
const STATUSLINE = path.resolve(HERE, '..', 'scripts', 'statusline.js');
const LAN_IP = Object.values(os.networkInterfaces()).flat().find((n) => n && n.family === 'IPv4' && !n.internal)?.address;
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };

async function post(p, body, headers = {}, base = BASE) {
  const r = await fetch(base + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(body || {}) });
  let j = null; try { j = await r.json(); } catch { /* not json */ }
  return { status: r.status, body: j };
}
const api = (p, body, base) => post(p, body, { 'X-Esan-Token': TOKEN }, base);
const hook = (ev) => post('/hook', ev, { 'X-Esan-Hook': '1' });
async function state() { return (await fetch(BASE + '/api/state')).json(); }
async function agent(id) { return (await state()).sessions.find((s) => s.agentId === id); }
async function waitFor(fn, ms, step = 700) { const end = Date.now() + ms; while (Date.now() < end) { const v = await fn(); if (v) return v; await sleep(step); } return null; }
const logText = (s) => (s && s.log ? s.log.map((l) => l.text).join(' | ') : '');
function mkdir(name) { const d = path.join(WORK, name); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); return d; }

// ── ZERO-TOKEN TESTS ──
console.log('── ไม่กิน token ──');
{
  const t0 = Date.now();
  const r = await hook({ hook_event_name: 'PermissionRequest', session_id: 'w-1', cwd: 'D:/work/shop-ui', tool_name: 'Bash', tool_input: { command: 'npm install' } });
  const ms = Date.now() - t0;
  const s = (await state()).sessions.find((x) => x.id === 'w-1');
  check('PermissionRequest ของ session ที่เปิดเองตอบทันที ไม่หน่วงหน้าต่างของผู้ใช้', r.status === 200 && ms < 500 && s && s.perm && s.perm.name === 'Bash', `${ms} ms`);
}
{
  await post('/status', { session_id: 'w-1', model: { id: 'claude-opus-5-5' }, context_window: { remaining_percentage: 61.2, context_window_size: 200000 },
    rate_limits: { five_hour: { used_percentage: 33.3, resets_at: 1 }, seven_day: { used_percentage: 12.5, resets_at: 2 } } }, { 'X-Esan-Hook': '1' });
  await sleep(300);
  const st = await state(), s = st.sessions.find((x) => x.id === 'w-1');
  check('statusline ส่ง context แบบค่าจริงและโควตา 5 ชม. กับรายสัปดาห์', s.ctx && s.ctx.exact && s.ctx.pct === 61 && st.rate && st.rate.five_hour.used_percentage === 33.3 && st.rate.seven_day.used_percentage === 12.5);
}
{
  const out = await new Promise((resolve) => {
    const p = spawn(process.execPath, [STATUSLINE]); let o = '';
    p.stdout.on('data', (d) => { o += d; }); p.on('close', () => resolve(o));
    p.stdin.end(JSON.stringify({ session_id: 'w-2', cwd: 'D:/work/docs', model: { display_name: 'Haiku' }, context_window: { remaining_percentage: 80 } }));
  });
  await sleep(300);
  const s = (await state()).sessions.find((x) => x.id === 'w-2');
  check('scripts/statusline.js พิมพ์บรรทัดสถานะและส่งต่อให้ bridge', /context เหลือ 80%/.test(out) && s && s.ctx && s.ctx.exact, out.trim());
}
{
  // fetch() can't override Host, so use a raw http request like a rebinding page would produce
  const http = await import('node:http');
  const code = await new Promise((resolve) => {
    const q = http.request({ host: '127.0.0.1', port: PORT, path: '/api/state', headers: { Host: `evil.test:${PORT}` } }, (r) => { r.resume(); resolve(r.statusCode); });
    q.on('error', () => resolve(0)); q.end();
  });
  check('Host แปลกปลอม (DNS rebinding) ถูกปฏิเสธ', code === 403, `HTTP ${code}`);
  const noHdr = await post('/hook', { hook_event_name: 'SessionStart', session_id: 'evil' });
  check('hook ที่ไม่มี header ถูกปฏิเสธ', noHdr.status === 403);
  const noTok = await post('/api/agents', { name: 'x' });
  check('สั่งงานโดยไม่มี token ถูกปฏิเสธ', noTok.status === 403);
  const stop = await post('/api/shutdown', {});
  const ping = await (await fetch(BASE + '/api/ping')).json();
  check('สั่งปิด bridge โดยไม่มี header ถูกปฏิเสธ และ ping บอก version กับ pid', stop.status === 403 && ping.version && Number.isInteger(ping.pid));
}
const lanUp = LAN_IP && await fetch(`http://${LAN_IP}:${PORT}/api/ping`).then(() => true, () => false);
if (!lanUp) console.log('SKIP  LAN: bridge ไม่ได้เปิดด้วย ESAN_OFFICE_LAN=1 หรือไม่เจอ IP ในวง LAN');
else {
  const lan = `http://${LAN_IP}:${PORT}`;
  const page = await (await fetch(lan + '/')).text();
  check('เปิดจาก IP ในวง LAN ได้หน้าออฟฟิศแบบไม่มี token', page.includes("const TOKEN=''") && !page.includes(TOKEN));
  const st = await fetch(lan + '/api/state');
  check('ดูสถานะผ่าน LAN ได้', st.status === 200);
  const cmd = await api('/api/agents', { name: 'x', cwd: HERE }, lan);
  check('สั่งงานผ่าน LAN ถูกปฏิเสธแม้มี token', cmd.status === 403);
  const lh = await post('/hook', { hook_event_name: 'SessionStart', session_id: 'lan' }, { 'X-Esan-Hook': '1' }, lan);
  check('ส่ง hook ผ่าน LAN ถูกปฏิเสธ', lh.status === 403);
}

const dirA = mkdir('t-a'), dirB = mkdir('t-b');
{
  const r1 = await api('/api/agents', { name: 'ทดสอบ', cwd: 'Z:/no/such/folder' });
  check('สร้าง agent ด้วยโฟลเดอร์ที่ไม่มีอยู่ ขึ้น error ภาษาไทย', r1.status === 400 && /โฟลเดอร์/.test(r1.body.error));
  const r2 = await api('/api/agents', { name: '', cwd: dirA });
  check('สร้าง agent ไม่ใส่ชื่อ ขึ้น error', r2.status === 400 && /ชื่อ/.test(r2.body.error));
}
{
  await hook({ hook_event_name: 'SessionStart', session_id: 'w-3', cwd: 'D:/work/stale', source: 'startup' });
  const noTok = await post('/api/sessions/w-3/dismiss', {});
  const ok = await api('/api/sessions/w-3/dismiss', {});
  const gone = !(await state()).sessions.some((x) => x.id === 'w-3');
  const again = await api('/api/sessions/w-3/dismiss', {});
  check('เอา session ที่ค้างออกจากออฟฟิศ (ต้องมี token, ไม่เจอตอบ 404)', noTok.status === 403 && ok.status === 200 && gone && again.status === 404);
  await hook({ hook_event_name: 'UserPromptSubmit', session_id: 'w-3', cwd: 'D:/work/stale', prompt: 'ยังอยู่' });
  check('session ที่ถูกเอาออกกลับมาเองเมื่อมีเหตุการณ์ใหม่', (await state()).sessions.some((x) => x.id === 'w-3'));
  await hook({ hook_event_name: 'SessionEnd', session_id: 'w-3' });
}
{
  const empty = await api('/api/easy', { text: '  ' });
  const long = await api('/api/easy', { text: 'ก'.repeat(2001) });
  const noTok = await post('/api/easy', { text: 'x' });
  check('ถามด่วน: คำถามว่าง ยาวเกิน และไม่มี token ถูกปฏิเสธ', empty.status === 400 && long.status === 400 && noTok.status === 403);
}
if (process.env.ONLY_FREE) {
  for (const id of ['w-1', 'w-2']) await hook({ hook_event_name: 'SessionEnd', session_id: id });
  const f = results.filter((r) => !r.ok);
  console.log(`\nสรุป (เฉพาะชุดไม่กิน token): ผ่าน ${results.length - f.length}/${results.length}`);
  process.exit(f.length ? 1 : 0);
}
const A = (await api('/api/agents', { name: 'ทดสอบ A', role: 'Docs', cwd: dirA, prompt: 'ตอบสั้นที่สุดเป็นภาษาไทย', allowedTools: ['Read', 'Glob', 'Task'], model: 'haiku' })).body.id;
const B = (await api('/api/agents', { name: 'ทดสอบ B', role: 'QA', cwd: dirB, prompt: 'ตอบสั้นที่สุดเป็นภาษาไทย', allowedTools: ['Read'], model: 'haiku' })).body.id;
{
  const r = await api(`/api/agents/${A}/config`, { model: 'sonnet' });
  const saved = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')).find((a) => a.id === A);
  check('แก้การตั้งค่าแล้วบันทึกลง agents.json', r.status === 200 && saved.model === 'sonnet');
  await api(`/api/agents/${A}/config`, { model: 'haiku' });
  const empty = await api(`/api/agents/${A}/prompt`, { text: '   ' });
  check('ส่งงานว่าง ขึ้น error', empty.status === 400);
}

// ── REAL RUNS (Haiku) ──
console.log('── รัน Claude จริง (Haiku) ──');
{
  const p1 = await api(`/api/agents/${A}/prompt`, { text: 'จำคำว่า มะม่วง ไว้ แล้วตอบแค่ว่า จำแล้ว ห้ามใช้เครื่องมือ' });
  const p2 = await api(`/api/agents/${A}/prompt`, { text: 'คำที่ให้จำไว้เมื่อกี้คือคำว่าอะไร ตอบคำเดียว ห้ามใช้เครื่องมือ' });
  const p3 = await api(`/api/agents/${B}/prompt`, { text: 'ตอบคำว่า บี คำเดียว ห้ามใช้เครื่องมือ' });
  check('งานแรกเริ่มทันที งานที่สองของตัวเดียวกันต่อคิว', p1.body.status === 'started' && p2.body.status === 'queued');
  const sB = await agent(B);
  check('ครบจำนวนทำพร้อมกัน (1 ตัว) agent อีกตัวต่อคิว', p3.body.status === 'queued' && /พร้อมกันครบ 1 ตัว/.test(logText(sB)));
  const doneA = await waitFor(async () => { const s = await agent(A); return s.state === 'idle' && !s.queue && /มะม่วง/.test(s.reply || '') && s; }, 120000);
  check('ใช้บทสนทนาเดิมต่อ (--resume): งานที่สองจำคำว่า มะม่วง ได้', !!doneA, doneA ? doneA.reply : logText(await agent(A)));
  const doneB = await waitFor(async () => { const s = await agent(B); return s.state === 'idle' && s.reply && s; }, 90000);
  check('งานที่ต่อคิวของ agent อีกตัวเริ่มเองเมื่อมีที่ว่าง', !!doneB, doneB ? doneB.reply : '');
}
{
  const before = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')).find((a) => a.id === A).sessionId;
  await api(`/api/agents/${A}/reset`);
  await api(`/api/agents/${A}/prompt`, { text: 'ในบทสนทนานี้ มีคนให้คุณจำคำอะไรไว้ไหม ถ้าไม่มีให้ตอบว่า ไม่มี ห้ามใช้เครื่องมือ' });
  const s = await waitFor(async () => { const x = await agent(A); return x.state === 'idle' && x.reply && !/จำคำว่า มะม่วง/.test(x.prompt || '') && x; }, 90000);
  const after = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')).find((a) => a.id === A).sessionId;
  check('เริ่มบทสนทนาใหม่: ได้ session ใหม่และไม่เห็นบทสนทนาเก่า', s && after && after !== before && !/มะม่วง/.test(s.reply), s ? s.reply : '');
}
{
  await api(`/api/agents/${B}/prompt`, { text: 'สร้างไฟล์ x.txt ใส่คำว่า hi' });
  const held = await waitFor(async () => { const s = await agent(B); return s.perm && s; }, 60000);
  check('เครื่องมือนอกรายการถูกพักไว้รออนุญาต', !!held, held ? `${held.perm.name} ${held.perm.full}` : '');
  const denied = await waitFor(async () => { const s = await agent(B); return !s.perm && /ปฏิเสธอัตโนมัติ/.test(logText(s)) && s; }, 20000, 500);
  check('ไม่มีใครกดภายในเวลาที่กำหนด ปฏิเสธอัตโนมัติ', !!denied);
  await waitFor(async () => (await agent(B)).state === 'idle', 60000);
  check('ปฏิเสธแล้วไฟล์ไม่ถูกสร้าง', !fs.existsSync(path.join(dirB, 'x.txt')));
}
{
  await api(`/api/agents/${A}/prompt`, { text: 'เขียนตัวเลข 1 ถึง 600 ทีละบรรทัด ห้ามใช้เครื่องมือ' });
  await waitFor(async () => (await agent(A)).state === 'working', 20000);
  await sleep(2500);
  await api(`/api/agents/${A}/prompt`, { text: 'งานนี้ต้องถูกล้างทิ้งตอนกดหยุด' });
  const r = await api(`/api/agents/${A}/stop`);
  const s = await waitFor(async () => { const x = await agent(A); return x.state === 'idle' && x; }, 15000, 400);
  check('กดหยุด: agent หยุดทำงานและล้างคิว', r.status === 200 && s && !s.queue && /สั่งหยุดแล้ว/.test(logText(s)) && !/จบโดยไม่มีคำตอบ/.test(logText(s).split('สั่งหยุดแล้ว').pop()));
}
{
  fs.writeFileSync(path.join(dirA, 'note1.txt'), 'hello'); fs.writeFileSync(path.join(dirA, 'note2.txt'), 'world');
  await api(`/api/agents/${A}/prompt`, { text: 'ใช้ Task tool เรียก subagent ชนิด Explore ให้หาว่าในโฟลเดอร์นี้มีไฟล์ .txt อะไรบ้าง แล้วสรุปสั้น ๆ' });
  let sawSub = false;
  const s = await waitFor(async () => { const x = await agent(A); if (x.subs && x.subs.length) sawSub = true; return x.state === 'idle' && x.reply && x; }, 150000, 500);
  check('subagent ในงานของ agent ประจำออฟฟิศ โผล่แล้วหายตอนเสร็จ', sawSub && s && !s.subs.length, s ? s.reply : '');
}
{
  await api(`/api/agents/${B}/prompt`, { text: 'เขียนตัวเลข 1 ถึง 600 ทีละบรรทัด ห้ามใช้เครื่องมือ' });
  await waitFor(async () => (await agent(B)).state === 'working', 20000);
  await sleep(2000);
  const r = await api(`/api/agents/${B}/delete`);
  await sleep(800);
  check('ลบ agent ระหว่างทำงาน: หยุดงานและหายจากออฟฟิศ', r.status === 200 && !(await agent(B)));
}
{
  const owned = JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8')).map((a) => a.sessionId);
  const watched = (await state()).sessions.filter((s) => !s.owned).map((s) => s.id);
  check('hook ของ plugin จากงานของ agent ประจำออฟฟิศ ไม่ทำให้เกิด session ซ้ำ', !watched.some((id) => owned.includes(id)), `watched=${watched.join(',')}`);
}
await api(`/api/agents/${A}/delete`);
for (const id of ['w-1', 'w-2']) await hook({ hook_event_name: 'SessionEnd', session_id: id });
const failed = results.filter((r) => !r.ok);
console.log(`\nสรุป: ผ่าน ${results.length - failed.length}/${results.length}`);
process.exit(failed.length ? 1 : 0);
