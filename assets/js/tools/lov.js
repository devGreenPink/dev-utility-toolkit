// ── LOV QUERY BROWSER ──
let _lovDirHandle = null;
let _lovFiles = [];
let _lovSkipped = 0;
let _lovCanWrite = false;
let _lovRecent = []; // folders opened before, most recent first: { label, handle, path?, lastOpened }
let _lovEdit = null; // open editor: { entry (null = new file), model, dirty, showPaste, pasteSql, saving }
let _lovFormat = 'v8'; // template-query version of the open folder (LOV_FORMATS key)
const LOV_RECENT_MAX = 10;

// Two template-query versions are in use. Both read the same SQL parts; they differ in the sort keys,
// the `use` enum case, extra keys, file names and the REST route (checked against the 10.1.0 jar's model).
const LOV_FORMATS = {
  v8: { // src/main/resources/template/query, cdgs-template-designer 2.1.1: cdgs-extension 8.x and the forks built on it
    name: 'cdgs-extension 8.x', short: '8.x', usedBy: 'LED 8.1.x, BDE EIA 8.2.0, BDE bde-0.x, DLPW 0.2.0-dlpw',
    prio: 'piority', auto: 'auto', optional: 'optional',
    route: 'query/template', type: 'SimpleLovContainer',
    like: 'String.Like', equal: 'String.Equal', in: 'String.In', idType: 'Long',
  },
  v10: { // src/main/resources/queries (filters: Like/Equal/In, String.* also accepted)
    name: 'cdgs-extension 10.1.0', short: '10.1.0', usedBy: 'EWFUND',
    prio: 'priority', auto: 'AUTO', optional: 'OPTIONAL',
    route: 'template/query', type: 'SimpleQuery',
    like: 'Like', equal: 'Equal', in: 'In', idType: 'Integer',
  },
};

// Version badge: the short name, with what that version means for the file on hover
function lovVersionBadge(fmt, extraClass = '') {
  const f = LOV_FORMATS[fmt];
  const tip = `${f.name} (${f.usedBy}) · sort: ${f.prio} + ${f.optional}/${f.auto} · filter: ${f.like}/${f.equal}/${f.in}`
    + ` · ไฟล์ ${lovIdToFileName('getFooBar', fmt)} · GET <root-path>/${f.route}/<id>`;
  return `<span class="lov-ver${extraClass}" title="${lovAttr(tip)}">LOV ${lovHtml(f.short)}</span>`;
}

// null when the file has nothing that tells the versions apart (no sorts, no 10.1.0-only keys)
function lovFileFormat(json) {
  if (!json || typeof json !== 'object') return null;
  if (['publicApi', 'roles', 'permissions', 'cdgsPrivilege'].some(k => k in json) || json.type === 'SimpleQuery') return 'v10';
  const obj = v => ((v && typeof v === 'object') ? v : {});
  const orders = [...Object.values(obj(json.order)), ...Object.values(obj(json.select)).map(c => obj(c).order)];
  for (const o of orders.filter(o => o && typeof o === 'object')) {
    if ('priority' in o || /^[A-Z]+$/.test(o.use || '')) return 'v10';
    if ('piority' in o || /^[a-z]+$/.test(o.use || '')) return 'v8';
  }
  // Column `visible` is no sign of 10.1.0: some BDE (8.x) files carry it too
  return null;
}

// Majority of the files decides; an empty or undecided folder goes by its name (EWFUND's is "queries")
function lovDetectFormat(files, dirName) {
  const votes = { v8: 0, v10: 0 };
  files.forEach(f => {
    const fmt = lovFileFormat(f.json);
    if (fmt) votes[fmt]++;
    else if (f.fileName === lovIdToFileName(f.json.id || '', 'v10') && f.fileName !== lovIdToFileName(f.json.id || '', 'v8')) votes.v10++;
    else if (f.fileName === lovIdToFileName(f.json.id || '', 'v8') && f.fileName !== lovIdToFileName(f.json.id || '', 'v10')) votes.v8++;
  });
  if (votes.v10 !== votes.v8) return votes.v10 > votes.v8 ? 'v10' : 'v8';
  return dirName === 'queries' ? 'v10' : 'v8';
}

function lovIdbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('esan-devtools-fsah', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('handles'); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function lovIdbGet(key) {
  try {
    const db = await lovIdbOpen();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return null; }
}
async function lovIdbPut(key, value) {
  try {
    const db = await lovIdbOpen();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(value, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {}
}
async function lovIdbDelete(key) {
  try {
    const db = await lovIdbOpen();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {}
}

// Up to v1.21 only one folder was kept, under `lastDir` — it becomes the first recent entry
async function lovRecentLoad() {
  let list = await lovIdbGet('recentDirs');
  if (!Array.isArray(list)) {
    const last = await lovIdbGet('lastDir');
    list = last ? [{ label: last.name, handle: last, lastOpened: Date.now() }] : [];
    if (last) {
      await lovIdbPut('recentDirs', list);
      await lovIdbDelete('lastDir');
    }
  }
  _lovRecent = list.filter(r => r && r.handle);
}

async function lovRecentSave() {
  await lovIdbPut('recentDirs', _lovRecent);
}

function lovRecentFind(handle) {
  return _lovRecent.find(r => r.handle === handle) || null;
}

// A freshly picked handle is a new object even for a folder already in the list
async function lovRecentMatch(handle) {
  const known = lovRecentFind(handle);
  if (known) return known;
  for (const r of _lovRecent.slice()) {
    try { if (await r.handle.isSameEntry(handle)) return r; } catch (e) {}
  }
  return null;
}

// The API never exposes a path and the query folder is "query"/"queries" in every repo, so picking the repo
// itself is what names a chip. cdgs-extension 8.x repos keep templates in template/query, 10.1.0 ones in queries.
const LOV_QUERY_DIRS = ['src/main/resources/template/query', 'src/main/resources/queries'];

async function lovFindQueryDir(root) {
  for (const path of LOV_QUERY_DIRS) {
    try {
      let dir = root;
      for (const part of path.split('/')) dir = await dir.getDirectoryHandle(part);
      return { dir, path };
    } catch (e) {}
  }
  return null;
}

function lovFreeLabel(label, skip) {
  const taken = l => _lovRecent.some(r => r !== skip && r.label === l);
  if (!taken(label)) return label;
  let n = 2;
  while (taken(`${label} ${n}`)) n++;
  return `${label} ${n}`;
}

async function lovVerifyPermission(handle, mode, requestIfNeeded) {
  try {
    const opts = { mode };
    if (await handle.queryPermission(opts) === 'granted') return true;
    if (requestIfNeeded && await handle.requestPermission(opts) === 'granted') return true;
    return false;
  } catch (e) { return false; }
}

// Saving/deleting asks for write access on demand (needs the click/keypress that triggered it)
async function lovEnsureWrite() {
  if (!_lovDirHandle) return false;
  if (!_lovCanWrite) {
    _lovCanWrite = await lovVerifyPermission(_lovDirHandle, 'readwrite', true);
    lovUpdateStatus();
  }
  return _lovCanWrite;
}

function lovSetStatus(msg) {
  const el = document.getElementById('lov-status');
  if (el) el.textContent = msg;
}

function lovUpdateStatus() {
  if (!_lovDirHandle) return;
  const entry = lovRecentFind(_lovDirHandle);
  const skipNote = _lovSkipped ? ` (ข้าม ${_lovSkipped} ไฟล์ที่อ่านไม่ได้)` : '';
  const mode = _lovCanWrite ? '✏️ แก้ไขได้' : '🔒 อ่านอย่างเดียว (จะขอสิทธิ์ตอนบันทึก/ลบ)';
  lovSetStatus(`โฟลเดอร์: ${entry ? entry.label : _lovDirHandle.name} · พบ ${_lovFiles.length} query${skipNote} · ${mode}`);
  lovShowVersion(_lovFormat);
}

// The open folder's LOV version, shown in front of the status line (null hides it)
function lovShowVersion(fmt) {
  const el = document.getElementById('lov-version');
  if (!el) return;
  el.innerHTML = fmt ? lovVersionBadge(fmt) : '';
  el.style.display = fmt ? '' : 'none';
}

// Status text plus one action button (re-grant access, drop a missing folder, ...)
function lovSetStatusAction(msg, btnText, onclick) {
  lovSetStatus(msg);
  const btn = document.createElement('button');
  btn.className = 'btn btn-ghost';
  btn.textContent = btnText;
  btn.onclick = onclick;
  document.getElementById('lov-status').appendChild(btn);
}

async function lovPickFolder() {
  if (!lovCloseEditor()) return;
  try {
    // Read access is enough to browse; write access is asked for on the first save/delete (lovEnsureWrite)
    const picked = await window.showDirectoryPicker();
    const found = await lovFindQueryDir(picked);
    const handle = found ? found.dir : picked;
    const known = await lovRecentMatch(handle);
    let label = known ? known.label : null;
    if (found) {
      label = lovFreeLabel(picked.name, known); // also renames a chip added from the query folder itself
    } else if (!known) {
      const def = lovFreeLabel(handle.name);
      const input = prompt(`ตั้งชื่อเรียกโฟลเดอร์ "${handle.name}" (เช่น ชื่อรีโป)\nถ้าเลือกโฟลเดอร์รีโปแทน จะหา template/query หรือ queries และตั้งชื่อให้เอง`, def);
      label = lovFreeLabel((input || '').trim() || def);
    }
    await lovOpenFolder(handle, label, found ? `${picked.name}/${found.path}` : undefined);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    showToast('✗ ไม่สามารถเปิดโฟลเดอร์ได้');
    console.error(err);
  }
}

// Opens a folder and moves it to the front of the recent list (keeps its label/path unless new ones are given)
async function lovOpenFolder(handle, label, path) {
  _lovDirHandle = handle;
  const canWrite = await lovVerifyPermission(handle, 'readwrite', false);
  const entry = await lovRecentMatch(handle) || { label: handle.name };
  if (_lovDirHandle !== handle) return; // another folder was opened meanwhile
  _lovCanWrite = canWrite;
  Object.assign(entry, { handle, lastOpened: Date.now() }, label ? { label } : {}, path ? { path } : {});
  // Move by object, not index: the list may have changed during the awaits (e.g. a double click)
  _lovRecent = [entry, ..._lovRecent.filter(r => r !== entry)].slice(0, LOV_RECENT_MAX);
  lovRenderRecent();
  await lovRecentSave();
  await lovLoadFiles();
}

// The chip click is the user gesture requestPermission needs, so ask before reading anything.
// Read only — write access is still asked for on the first save/delete (lovEnsureWrite).
async function lovOpenRecent(i) {
  const entry = _lovRecent[i];
  if (!entry || !lovCloseEditor()) return;
  if (!await lovVerifyPermission(entry.handle, 'read', true)) {
    showToast('✗ ไม่ได้รับสิทธิ์เข้าถึงโฟลเดอร์');
    return;
  }
  await lovOpenFolder(entry.handle);
}

// Only drops the entry from the list — nothing on disk is touched
async function lovRemoveRecent(i) {
  const entry = _lovRecent[i];
  if (!entry) return;
  if (entry.handle === _lovDirHandle) { await lovForgetFolder(); return; }
  _lovRecent.splice(i, 1);
  lovRenderRecent();
  await lovRecentSave();
}

async function lovRenameFolder() {
  const entry = lovRecentFind(_lovDirHandle);
  if (!entry) return;
  const input = prompt(`ตั้งชื่อเรียกโฟลเดอร์ "${entry.handle.name}" (เช่น ชื่อรีโป)`, entry.label);
  if (input === null) return;
  entry.label = lovFreeLabel(input.trim() || entry.handle.name, entry);
  lovRenderRecent();
  lovUpdateStatus();
  await lovRecentSave();
}

function lovRenderRecent() {
  const box = document.getElementById('lov-recent');
  if (!box) return;
  box.style.display = _lovRecent.length ? '' : 'none';
  document.getElementById('lov-recent-list').innerHTML = _lovRecent.map((r, i) => {
    const active = r.handle === _lovDirHandle;
    const where = r.path || (r.label === r.handle.name ? '' : `โฟลเดอร์ ${r.handle.name}`);
    const title = [r.label, where,
      `เปิดล่าสุด ${new Date(r.lastOpened).toLocaleString('th-TH')}`].filter(Boolean).join(' · ');
    return `<span class="lov-recent-chip${active ? ' lov-recent-active' : ''}">
      <button class="lov-recent-open" title="${lovAttr(title)}"${active ? ' aria-current="true"' : ''} onclick="lovOpenRecent(${i})">📁 ${lovHtml(r.label)}</button>
      <button class="lov-recent-x" title="เอาออกจากรายการ (ไม่ลบไฟล์)" aria-label="เอา ${lovAttr(r.label)} ออกจากรายการ (ไม่ลบไฟล์)" onclick="lovRemoveRecent(${i})">✕</button>
    </span>`;
  }).join('');
}

// Back to "no folder open"; the recent list is kept
function lovClearView(msg) {
  _lovDirHandle = null;
  _lovFiles = [];
  _lovCanWrite = false;
  lovSetStatus(msg);
  lovShowVersion(null);
  const search = document.getElementById('lov-search');
  if (search) { search.value = ''; search.disabled = true; }
  ['lov-refresh-btn', 'lov-rename-btn', 'lov-forget-btn', 'lov-new-btn'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  lovRenderList([]);
  lovRenderRecent();
}

async function lovRefresh() {
  if (!_lovDirHandle) return;
  await lovLoadFiles();
}

// Forgets the open folder: closes it and drops it from the recent list
async function lovForgetFolder() {
  if (!lovCloseEditor()) return;
  const entry = lovRecentFind(_lovDirHandle);
  if (entry) _lovRecent.splice(_lovRecent.indexOf(entry), 1);
  lovClearView('ยังไม่ได้เลือกโฟลเดอร์');
  await lovRecentSave();
}

// The folder was moved or deleted after it was saved
function lovFolderUnreadable(dir) {
  const entry = lovRecentFind(dir);
  // Sent to the back so the next page load restores a folder that still works
  if (entry) {
    _lovRecent = [..._lovRecent.filter(r => r !== entry), entry];
    lovRecentSave();
  }
  lovClearView('');
  const msg = `เปิดโฟลเดอร์ ${entry ? entry.label : dir.name} ไม่ได้ — อาจถูกย้ายหรือลบไปแล้ว`;
  if (!entry) { lovSetStatus(msg); return; }
  lovSetStatusAction(`${msg} — `, '✕ เอาออกจากรายการ', async () => {
    await lovRemoveRecent(_lovRecent.indexOf(entry));
    lovSetStatus('ยังไม่ได้เลือกโฟลเดอร์');
  });
}

async function lovRestoreFolder() {
  await lovRecentLoad();
  lovRenderRecent();
  const last = _lovRecent[0];
  if (!last) return;
  if (await lovVerifyPermission(last.handle, 'read', false)) {
    await lovOpenFolder(last.handle);
  } else {
    lovSetStatusAction(`โฟลเดอร์ล่าสุด: ${last.label} — `, '🔓 ขอสิทธิ์เข้าถึงโฟลเดอร์อีกครั้ง',
      () => lovOpenRecent(_lovRecent.indexOf(last)));
  }
}

// designerFormat: re-serializing gives the same bytes, i.e. saving won't reformat the whole file
function lovMakeEntry(fileName, handle, raw, lastModified) {
  const json = JSON.parse(raw);
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const trailingNewline = /\r?\n$/.test(raw);
  return {
    fileName, handle, raw, json, eol, trailingNewline, lastModified,
    id: json.id || '(no id)', description: json.description,
    designerFormat: lovJacksonStringify(json, eol) === raw.replace(/\r?\n$/, ''),
    built: lovBuildSql(json),
  };
}

async function lovLoadFiles() {
  const dir = _lovDirHandle;
  if (!dir) return;
  lovSetStatus('กำลังโหลดไฟล์...');
  lovShowVersion(null);
  const files = [];
  let skipped = 0;
  try {
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind !== 'file') continue; // flat-only: subfolders intentionally not recursed
      if (!name.toLowerCase().endsWith('.json')) continue;
      try {
        const file = await handle.getFile();
        files.push(lovMakeEntry(name, handle, await file.text(), file.lastModified));
      } catch (e) {
        console.warn('LOV: skip malformed file', name, e);
        skipped++;
      }
    }
  } catch (err) {
    console.error(err);
    if (_lovDirHandle === dir) lovFolderUnreadable(dir);
    return;
  }
  if (_lovDirHandle !== dir) return; // another folder was opened while this one was loading
  files.sort((a, b) => a.id.localeCompare(b.id));
  _lovFiles = files;
  _lovSkipped = skipped;
  _lovFormat = lovDetectFormat(files, dir.name);
  lovUpdateStatus();
  const search = document.getElementById('lov-search');
  if (search) search.disabled = false;
  ['lov-refresh-btn', 'lov-rename-btn', 'lov-forget-btn', 'lov-new-btn'].forEach(id => { document.getElementById(id).style.display = ''; });
  lovFilter(search ? search.value : '');
}

// 8.x spells it `piority`, 10.1.0 `priority`
const lovOrderPrio = o => ('piority' in o ? o.piority : o.priority);
// `auto`/`optional` in 8.x, `AUTO`/`OPTIONAL` in 10.1.0
const lovIsAuto = use => String(use || '').toLowerCase() === 'auto';

// Mirrors the backend: global `order` first, then column orders, stable-sorted by priority ascending
function lovCollectOrders(json) {
  const out = [];
  const order = (json.order && typeof json.order === 'object') ? json.order : {};
  Object.entries(order).forEach(([key, o]) => {
    if (o && typeof o === 'object') out.push({ key, sql: o.sql || key, type: o.type || 'ASC', use: o.use, prio: lovOrderPrio(o) });
    else if (o) out.push({ key, sql: key, type: String(o), use: 'auto', prio: 100 });
  });
  const select = (json.select && typeof json.select === 'object') ? json.select : {};
  Object.entries(select).forEach(([key, c]) => {
    if (c && typeof c === 'object' && c.order && typeof c.order === 'object') {
      out.push({ key, sql: c.sql, type: c.order.type || 'ASC', use: c.order.use, prio: lovOrderPrio(c.order) });
    }
  });
  const prio = o => (Number.isFinite(Number(o.prio)) ? Number(o.prio) : 100);
  return out.sort((a, b) => prio(a) - prio(b));
}

function lovBuildSql(json) {
  const select = (json.select && typeof json.select === 'object') ? json.select : {};
  const cols = Object.entries(select).map(([alias, def]) => `${(def && typeof def === 'object' ? def.sql : def) || ''} AS ${alias}`);
  const where = (json.where && typeof json.where === 'object') ? json.where : {};
  const main = (typeof where.main === 'string' && where.main.trim()) ? where.main.trim() : '';
  const groupBy = (typeof json.groupByAndHaving === 'string') ? json.groupByAndHaving.trim() : '';
  const orders = lovCollectOrders(json);
  const auto = orders.filter(o => lovIsAuto(o.use));
  const baseSql = [
    `SELECT${json.distinct ? ' DISTINCT' : ''} ${cols.join(',\n  ') || '*'}`,
    `FROM ${json.from || ''}`,
    main ? `WHERE ${main}` : '',
    groupBy,
    auto.length ? 'ORDER BY ' + auto.map(o => `${o.sql} ${o.type}`).join(', ') : '',
  ].filter(Boolean).join('\n');

  const alt = (where.alternate && typeof where.alternate === 'object') ? where.alternate : {};
  const cases = Object.keys(alt).map(key => {
    const c = alt[key];
    const caseSql = typeof c === 'string' ? c : ((c && typeof c.sql === 'string') ? c.sql : '');
    const params = (c && typeof c === 'object' && c.parameter && typeof c.parameter === 'object')
      ? Object.keys(c.parameter) : Object.keys(lovFindParameter(caseSql).parameter);
    return { key, sql: `AND ${caseSql.trim()}`, params };
  });
  const parameter = (json.parameter && typeof json.parameter === 'object') ? Object.keys(json.parameter) : [];
  return { baseSql, cases, sortKeys: orders.map(o => o.key), parameter };
}

// GET query string the UI sends: an alternate only runs when its name is in `alternates`
function lovRequestExample(id, built) {
  const qs = [];
  const seen = new Set();
  const addParam = p => { if (!seen.has(p)) { seen.add(p); qs.push(`${p}=…`); } };
  built.parameter.forEach(addParam);
  built.cases.forEach(c => { qs.push(`alternates=${c.key}`); c.params.forEach(addParam); });
  if (built.sortKeys.length) qs.push(`orders=${built.sortKeys[0]}[ASC]`);
  qs.push('offset=0', 'limit=10');
  return `GET <root-path>/${LOV_FORMATS[_lovFormat].route}/${id}?${qs.join('&')}`;
}

// 10.1.0 takes the route from config (framework default api/query); every EWFUND repo sets /template/query
function lovRouteNote() {
  return _lovFormat === 'v10' ? 'path ตาม cdgs.template.query.root-path ใน application.properties' : '';
}

// Both versions write with Jackson INDENT_OUTPUT. File names: cdgs-template-designer 2.1.1 (8.x) turns
// id "getFooBar" into get.foo.bar.lov.json; 10.1.0 keeps the id as is (getFooBar.lov.json)
const LOV_JSON_ESC = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r' };

function lovJsonString(s) {
  return '"' + s.replace(/["\\\u0000-\u001f]/g, c =>
    LOV_JSON_ESC[c] || '\\u' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')) + '"';
}

function lovJacksonStringify(value, eol = '\r\n', level = 0) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return lovJsonString(value);
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    return value.length ? `[ ${value.map(v => lovJacksonStringify(v, eol, level)).join(', ')} ]` : '[ ]';
  }
  const keys = Object.keys(value).filter(k => value[k] !== undefined);
  if (!keys.length) return '{ }';
  const pad = '  '.repeat(level + 1);
  return '{' + eol
    + keys.map(k => `${pad}${lovJsonString(k)} : ${lovJacksonStringify(value[k], eol, level + 1)}`).join(',' + eol)
    + eol + '  '.repeat(level) + '}';
}

function lovIdToFileName(id, fmt = _lovFormat) {
  return (fmt === 'v10' ? id : id.replace(/[A-Z]/g, c => '.' + c.toLowerCase())) + '.lov.json';
}

function lovToCamelCase(str) {
  return str.trim().toLowerCase().replace(/_(.)/g, (_, c) => c.toUpperCase());
}

// `:name` or `:{{ name | Type }}` → sql with `:name` + { name: { type } }; `::cast` is not a parameter
function lovFindParameter(sql) {
  const parameter = {};
  if (!sql) return { sql: sql || '', parameter };
  const out = sql.replace(/(^|[^\w:]):(?:\{\{\s*([\w.]+)\s*\|\s*([^}]*?)\s*\}\}|([\w.]+))/g, (_, pre, tplName, tplType, name) => {
    const paramName = tplName || name;
    parameter[paramName] = { type: tplType || 'Any' };
    return `${pre}:${paramName}`;
  });
  return { sql: out, parameter };
}

// Drop -- and /* */ comments outside quotes; a -- left in WHERE main would swallow the alternates appended after it
function lovStripComments(sql) {
  let out = '', quote = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i], next = sql[i + 1];
    if (quote) { if (ch === quote) quote = null; out += ch; continue; }
    if (ch === "'" || ch === '"') { quote = ch; out += ch; continue; }
    if (ch === '-' && next === '-') { const nl = sql.indexOf('\n', i); if (nl < 0) break; i = nl - 1; continue; }
    if (ch === '/' && next === '*') { const end = sql.indexOf('*/', i + 2); out += ' '; if (end < 0) break; i = end + 1; continue; }
    out += ch;
  }
  return out;
}

// Blank out what is inside () and quotes (same length, outermost delimiters kept)
// so keyword/comma searches only see the top level
function lovMaskNested(sql) {
  let out = '', depth = 0, quote = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) { if (ch === quote) { quote = null; out += depth ? ' ' : ch; } else out += ' '; continue; }
    if (ch === "'" || ch === '"') { quote = ch; out += depth ? ' ' : ch; continue; }
    if (ch === '(') { out += depth ? ' ' : ch; depth++; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); out += depth ? ' ' : ch; continue; }
    out += depth ? ' ' : ch;
  }
  return out;
}

function lovSplitTopLevelCommas(sql) {
  const mask = lovMaskNested(sql);
  const parts = [];
  let start = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === ',') { parts.push(sql.slice(start, i)); start = i + 1; }
  }
  parts.push(sql.slice(start));
  return parts.map(p => p.trim()).filter(Boolean);
}

function lovSplitSqlClauses(sql) {
  let src = sql.trim().replace(/;\s*$/, '').replace(/^select\s+/i, '');
  const distinct = /^distinct\s+/i.test(src);
  if (distinct) src = src.replace(/^distinct\s+/i, '');
  const mask = lovMaskNested(src);
  const clauses = [['from', /\bfrom\b/i], ['where', /\bwhere\b/i], ['groupBy', /\bgroup\s+by\b/i],
    ['having', /\bhaving\b/i], ['orderBy', /\border\s+by\b/i]];
  const parts = { distinct, columns: '', from: null, where: null, groupBy: null, having: null, orderBy: null };
  let key = 'columns', pos = 0;
  for (const [name, re] of clauses) {
    const m = re.exec(mask.slice(pos));
    if (!m) continue;
    parts[key] = src.slice(pos, pos + m.index).trim();
    key = name;
    pos += m.index + m[0].length;
  }
  parts[key] = src.slice(pos).trim();
  return parts;
}

const LOV_SQL_WORDS = /^(and|as|asc|case|desc|else|end|from|in|is|like|not|null|or|then|when)$/i;

// Column id/type/filter guesses follow each version's designer: *id|*ref → Long (2.1.1) / Integer (10.1.0),
// *date → Date, else String
function lovToColumn(colSql, fmt = _lovFormat) {
  const f = LOV_FORMATS[fmt];
  let sql = colSql.trim(), id = '';
  // "<expr> AS alias" or "<expr> alias" — an implicit alias needs expr to end in ), a quote or a word
  const alias = sql.match(/^([\s\S]*?\S)\s+as\s+("?)(\w+)\2$/i) || sql.match(/^([\s\S]*\S)\s+("?)(\w+)\2$/);
  const exprEnd = alias ? lovMaskNested(alias[1]).trimEnd() : '';
  if (alias && !LOV_SQL_WORDS.test(alias[3]) && /[)'"\w]$/.test(exprEnd)) {
    sql = alias[1].trim();
    id = alias[3]; // kept as written — existing UIs read keys like "FY" or "iden_no1"
  } else {
    const last = sql.match(/(\w+)\W*$/);
    id = last && !LOV_SQL_WORDS.test(last[1]) ? last[1] : '';
    if (id.includes('_') || (id === id.toUpperCase() && /[A-Z]/.test(id))) id = lovToCamelCase(id);
  }
  let type = 'String', filter = f.like;
  if (/(id|ref)$/i.test(id)) { type = f.idType; filter = f.equal; }
  else if (/date$/i.test(id)) { type = 'Date'; filter = f.equal; }
  return { id, column: { order: null, sql, type, search: false, filter } };
}

// Paste-SQL → LOV parts. ORDER BY becomes use:"auto" (the backend applies only auto orders by default),
// attached to the matching select column when there is one, else a global order entry.
function lovTransformLov(sql, fmt = _lovFormat) {
  const parts = lovSplitSqlClauses(lovStripComments(sql || ''));
  const cols = lovSplitTopLevelCommas(parts.columns).map(c => lovToColumn(c, fmt));
  const select = {};
  cols.forEach(({ id, column }) => { select[id] = column; });
  const norm = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const order = {};
  if (parts.orderBy) {
    lovSplitTopLevelCommas(parts.orderBy).forEach((item, i) => {
      const dir = item.match(/\s+(asc|desc)$/i);
      const orderSql = dir ? item.slice(0, dir.index).trim() : item;
      const def = { type: dir && /desc/i.test(dir[1]) ? 'DESC' : 'ASC', use: 'auto', prio: 100 + i };
      const byPos = /^\d+$/.test(orderSql) ? cols[Number(orderSql) - 1] : null;
      const hit = byPos || cols.find(c => c.id === orderSql || norm(c.column.sql) === norm(orderSql));
      if (hit && !hit.column.order) hit.column.order = def;
      else order[`order${i + 1}`] = { sql: orderSql, ...def };
    });
  }
  let groupByAndHaving = parts.groupBy ? `GROUP BY ${parts.groupBy}` : null;
  if (parts.having) groupByAndHaving = groupByAndHaving ? `${groupByAndHaving}\nHAVING ${parts.having}` : `HAVING ${parts.having}`;
  const from = lovFindParameter(parts.from || '');
  const main = lovFindParameter(parts.where || '');
  return {
    distinct: parts.distinct, select, from: from.sql, where: { main: main.sql }, groupByAndHaving, order,
    parameter: { ...from.parameter, ...main.parameter },
  };
}

function lovCopyBlock(btn) {
  const code = btn.closest('.rxjs-code-block').querySelector('code');
  copyText(code.textContent);
}

function lovSqlBlockHtml(label, sql, params, note, lang = 'sql') {
  const paramsNote = (params && params.length) ? `<span class="lov-params-note">Params: ${escHtml(params.join(', '))}</span>` : '';
  const extraNote = note ? `<span class="lov-params-note">${escHtml(note)}</span>` : '';
  return `<div class="lov-sql-label-row">
      <span class="lov-sql-label">${escHtml(label)}</span>
      ${paramsNote}${extraNote}
    </div>
    <div class="rxjs-code-block">
      <button class="rxjs-copy-btn" onclick="lovCopyBlock(this)">⎘ copy</button>
      <pre class="rxjs-code"><code class="language-${lang}">${escHtml(sql)}</code></pre>
    </div>`;
}

function lovPreviewHtml(id, built) {
  const sortNote = built.sortKeys.length ? `sort ได้ (orders=key[ASC|DESC]): ${built.sortKeys.join(', ')}` : '';
  return lovSqlBlockHtml('SQL Query', built.baseSql, built.parameter, sortNote)
    + built.cases.map(c => lovSqlBlockHtml(`alternates=${c.key}`, c.sql, c.params)).join('\n')
    + lovSqlBlockHtml('ตัวอย่าง request', lovRequestExample(id, built), [], lovRouteNote(), 'plaintext');
}

const lovAttr = s => escHtml(s == null ? '' : String(s)).replace(/"/g, '&quot;');
const lovHtml = s => escHtml(s == null ? '' : String(s));

function lovRenderList(files) {
  const container = document.getElementById('lov-list');
  const empty = document.getElementById('lov-empty');
  container.innerHTML = '';
  if (!files.length) {
    empty.textContent = _lovFiles.length ? 'ไม่พบ query ที่ตรงกับคำค้น' : 'ไม่พบไฟล์ JSON ในโฟลเดอร์นี้';
    empty.style.display = _lovDirHandle ? '' : 'none';
    return;
  }
  empty.style.display = 'none';
  for (const entry of files) {
    const acc = document.createElement('div');
    acc.className = 'rxjs-acc';
    const file = lovAttr(entry.fileName);
    // Only a file that isn't the folder's version gets its own badge
    const fileFmt = lovFileFormat(entry.json);
    const odd = fileFmt && fileFmt !== _lovFormat ? ' ' + lovVersionBadge(fileFmt, ' lov-ver-odd') : '';
    acc.innerHTML = `<button class="rxjs-acc-hd" onclick="rxjsToggleAcc(this)">
      <span class="lov-acc-title">
        <span>${lovHtml(entry.id)} <span class="lov-acc-file">(${lovHtml(entry.fileName)})</span>${odd}</span>
        ${entry.description ? `<span class="lov-acc-desc">${lovHtml(entry.description)}</span>` : ''}
      </span>
      <span class="rxjs-acc-chevron">›</span>
    </button>
    <div class="rxjs-acc-bd" style="display:none;">
      <div class="toolbar lov-acc-actions">
        <button class="btn btn-ghost" data-file="${file}" onclick="lovEditFile(this.dataset.file)">✏️ แก้ไข</button>
        <button class="btn btn-ghost" data-file="${file}" onclick="lovCopyJson(this.dataset.file)">⎘ copy JSON</button>
        <button class="btn btn-danger" data-file="${file}" onclick="lovDeleteFile(this.dataset.file)">🗑 ลบ</button>
        ${entry.designerFormat ? '' : '<span class="lov-note">ไฟล์นี้ไม่ได้จัดรูปแบบแบบ designer — บันทึกครั้งแรกจะจัดรูปแบบใหม่ทั้งไฟล์</span>'}
      </div>
      ${lovPreviewHtml(entry.id, entry.built)}
    </div>`;
    container.appendChild(acc);
  }
  highlightCode('#lov-tab pre.rxjs-code code');
}

function lovFilter(q) {
  const query = (q || '').trim().toLowerCase();
  const filtered = !query ? _lovFiles : _lovFiles.filter(f =>
    (f.id || '').toLowerCase().includes(query) || f.fileName.toLowerCase().includes(query)
    || (typeof f.description === 'string' && f.description.toLowerCase().includes(query)));
  lovRenderList(filtered);
}

function lovFindEntry(fileName) {
  return _lovFiles.find(f => f.fileName === fileName) || null;
}

function lovCopyJson(fileName) {
  const entry = lovFindEntry(fileName);
  if (entry) copyText(entry.raw);
}

async function lovDeleteFile(fileName) {
  const entry = lovFindEntry(fileName);
  if (!entry) return;
  if (!await lovEnsureWrite()) { showToast('✗ ไม่ได้รับสิทธิ์แก้ไขไฟล์ในโฟลเดอร์นี้'); return; }
  if (!confirm(`ลบไฟล์ ${fileName} (id: ${entry.id}) ?\nกู้คืนได้จาก git เท่านั้น`)) return;
  try {
    await _lovDirHandle.removeEntry(fileName);
    if (_lovEdit && _lovEdit.entry && _lovEdit.entry.fileName === fileName) lovCloseEditor(true);
    await lovLoadFiles();
    showToast(`✓ ลบ ${fileName} แล้ว`);
  } catch (err) {
    showToast('✗ ลบไฟล์ไม่สำเร็จ');
    console.error(err);
  }
}

// ── LOV editor: model ↔ file JSON ──
// The model keeps each item's original object so saving an untouched file gives back the same bytes
// and keys the editor doesn't know about survive.

// Original key order first (unknown keys kept), then new keys in the given order; undefined drops a key
function lovPick(orig, fields) {
  const src = (orig && typeof orig === 'object') ? orig : {};
  const out = {};
  Object.keys(src).forEach(k => { out[k] = k in fields ? fields[k] : src[k]; });
  Object.keys(fields).forEach(k => { if (!(k in out)) out[k] = fields[k]; });
  Object.keys(out).forEach(k => { if (out[k] === undefined) delete out[k]; });
  return out;
}

function lovParamList(obj) {
  return Object.entries((obj && typeof obj === 'object') ? obj : {}).map(([name, p]) => {
    const orig = (p && typeof p === 'object') ? p : {};
    return { name, orig, type: orig.type };
  });
}

// 10.1.0 parameters carry `multiple` (the designer writes false); existing ones are left as they are
function lovParamObj(list, fmt) {
  const out = {};
  list.forEach(p => {
    const isNew = !Object.keys(p.orig).length;
    out[p.name] = lovPick(p.orig, fmt === 'v10' && isNew ? { type: p.type, multiple: false } : { type: p.type });
  });
  return out;
}

// One sort definition in the file's own spelling (`piority`/`priority`); new ones follow the file's version,
// with the keys in the order that version's designer writes them
function lovOrderFields(origOrder, o, fmt, withSql) {
  const f = LOV_FORMATS[fmt];
  const key = 'piority' in origOrder ? 'piority' : ('priority' in origOrder ? 'priority' : f.prio);
  const sql = withSql ? { sql: o.sql } : {};
  return fmt === 'v10'
    ? { ...sql, use: o.use, type: o.type, [key]: o.prio }
    : { ...sql, type: o.type, use: o.use, [key]: o.prio };
}

// fmt: the file's own version, or the folder's when the file doesn't show it
function lovModelFromJson(json, folderFmt = _lovFormat) {
  const obj = v => ((v && typeof v === 'object') ? v : {});
  const where = obj(json.where);
  const fmt = lovFileFormat(json) || folderFmt;
  return {
    orig: json, fmt,
    id: json.id, description: json.description, type: json.type, autoDeclare: json.autoDeclare,
    unitName: json.unitName, distinct: json.distinct, from: json.from, main: where.main,
    groupByAndHaving: json.groupByAndHaving,
    select: Object.entries(obj(json.select)).map(([id, c]) => {
      const col = (c && typeof c === 'object') ? c : { sql: c };
      const o = (col.order && typeof col.order === 'object') ? col.order : null;
      return {
        id, orig: obj(c), sql: col.sql, type: col.type, search: col.search, filter: col.filter,
        order: o ? { type: o.type, use: o.use, prio: lovOrderPrio(o) } : null,
      };
    }),
    alternate: Object.entries(obj(where.alternate)).map(([id, a]) => {
      if (typeof a === 'string') {
        const found = lovFindParameter(a);
        return { id, orig: {}, sql: found.sql, parameter: lovParamList(found.parameter) };
      }
      return { id, orig: obj(a), sql: obj(a).sql, parameter: lovParamList(obj(a).parameter) };
    }),
    order: Object.entries(obj(json.order)).map(([id, o]) => {
      const ord = (o && typeof o === 'object') ? o : { sql: id, type: String(o), use: LOV_FORMATS[fmt].auto, priority: 100 };
      return { id, orig: obj(o), sql: ord.sql, type: ord.type, use: ord.use, prio: lovOrderPrio(ord) };
    }),
    parameter: lovParamList(json.parameter),
  };
}

// Key order for new keys follows the designer: id, description, type, autoDeclare, unitName, distinct,
// select, from, where{main, alternate}, groupByAndHaving, order, parameter (10.1.0 files get theirs from
// lovNewTemplate). A new 10.1.0 column is written like its designer does: sql…filter, visible, order.
function lovJsonFromModel(m) {
  const o = (m.orig && typeof m.orig === 'object') ? m.orig : {};
  const ow = (o.where && typeof o.where === 'object') ? o.where : {};
  const select = {};
  m.select.forEach(c => {
    const origOrder = (c.orig.order && typeof c.orig.order === 'object') ? c.orig.order : {};
    const order = c.order ? lovPick(origOrder, lovOrderFields(origOrder, c.order, m.fmt, false)) : null;
    const fields = { sql: c.sql, type: c.type, search: c.search, filter: c.filter };
    select[c.id] = lovPick(c.orig, m.fmt === 'v10' && !Object.keys(c.orig).length
      ? { ...fields, visible: true, order } : { order, ...fields });
  });
  const alternate = {};
  m.alternate.forEach(a => { alternate[a.id] = lovPick(a.orig, { sql: a.sql, parameter: lovParamObj(a.parameter, m.fmt) }); });
  const order = {};
  m.order.forEach(r => { order[r.id] = lovPick(r.orig, lovOrderFields(r.orig, r, m.fmt, true)); });
  const where = lovPick(ow, { main: m.main, alternate: (m.alternate.length || 'alternate' in ow) ? alternate : undefined });
  return lovPick(o, {
    id: m.id, description: m.description, type: m.type, autoDeclare: m.autoDeclare, unitName: m.unitName,
    distinct: m.distinct, select, from: m.from,
    where: (Object.keys(where).length || 'where' in o) ? where : undefined,
    groupByAndHaving: m.groupByAndHaving,
    order: (m.order.length || 'order' in o) ? order : undefined,
    parameter: (m.parameter.length || 'parameter' in o) ? lovParamObj(m.parameter, m.fmt) : undefined,
  });
}

// unitName must match a key in the repo's QueryTemplateConfiguration, which this page can't see — so it only
// reports what the folder uses (folders can be inconsistent) instead of guessing a default
function lovFolderUnitNames() {
  const counts = {};
  _lovFiles.forEach(f => {
    const u = f.json && f.json.unitName;
    const key = (typeof u === 'string' && u) ? u : '(ว่าง)';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(name => ({ name, count: counts[name] }));
}

// Same defaults and key order as each version's designer writes a new file
function lovNewTemplate(fmt = _lovFormat) {
  const rest = { distinct: false, select: {}, from: '', where: { main: '1=1', alternate: {} }, groupByAndHaving: null, order: {}, parameter: {} };
  if (fmt === 'v10') {
    return {
      id: '', type: 'SimpleQuery', description: '', autoDeclare: true, publicApi: false, roles: [], permissions: [],
      cdgsPrivilege: { programs: [], permissions: [] }, unitName: null, ...rest,
    };
  }
  return { id: '', description: '', type: 'SimpleLovContainer', autoDeclare: true, unitName: null, ...rest };
}

function lovSqlParamNames(sqls) {
  const found = {};
  sqls.forEach(s => Object.assign(found, lovFindParameter(s || '').parameter));
  return found;
}

// Params follow the SQL: new ones get the detected type, existing ones keep theirs unless `:{{ name | Type }}` says
// otherwise. Params declared in the file are only removed by hand (the fw.user.permissions files declare `userName`
// while their SQL uses `:user.preferredUsername`), and dotted names are context values no file declares.
function lovSyncParams(list, sqls) {
  const found = lovSqlParamNames(sqls);
  const out = [];
  list.forEach(p => {
    if (p.name in found) out.push(found[p.name].type !== 'Any' ? { ...p, type: found[p.name].type } : p);
    else if (Object.keys(p.orig).length) out.push(p);
  });
  Object.keys(found).forEach(name => {
    if (!name.includes('.') && !out.some(p => p.name === name)) out.push({ name, orig: {}, type: found[name].type });
  });
  return out;
}

function lovTargetFileName(m, entry) {
  return entry && m.id === entry.json.id ? entry.fileName : lovIdToFileName(m.id || '');
}

function lovToInt(v) {
  const n = Number(v);
  return String(v).trim() !== '' && Number.isInteger(n) ? n : v;
}

// Also becomes the file name, so keep it to characters that are safe in one
const lovIdOk = s => typeof s === 'string' && /^[A-Za-z0-9_.$-]+$/.test(s);

function lovValidate(m, entry) {
  const errs = [];
  const prioName = LOV_FORMATS[m.fmt].prio;
  const badId = s => !lovIdOk(s);
  const blank = s => typeof s !== 'string' || !s.trim();
  const dupes = (rows, what) => {
    const seen = new Set();
    rows.forEach(r => { if (r.id && seen.has(r.id)) errs.push(`${what} id "${r.id}" ซ้ำ`); seen.add(r.id); });
  };
  if (badId(m.id)) errs.push('id ต้องไม่ว่าง และใช้ได้เฉพาะ A-Z a-z 0-9 _ . $ -');
  if (!m.select.length) errs.push('SELECT ต้องมีอย่างน้อย 1 คอลัมน์');
  m.select.forEach((c, i) => {
    const n = `คอลัมน์ที่ ${i + 1}${c.id ? ` (${c.id})` : ''}`;
    if (typeof c.id !== 'string' || !/^\S+$/.test(c.id)) errs.push(`${n}: id ต้องไม่ว่างและห้ามมีช่องว่าง`);
    if (blank(c.sql)) errs.push(`${n}: sql ว่าง`);
    if (typeof c.type !== 'string' || !/^\S+$/.test(c.type)) errs.push(`${n}: type ต้องไม่ว่างและห้ามมีช่องว่าง`);
    if (c.order && !Number.isInteger(c.order.prio)) errs.push(`${n}: ${prioName} ต้องเป็นจำนวนเต็ม`);
  });
  dupes(m.select, 'คอลัมน์');
  if (blank(m.from)) errs.push('FROM ต้องไม่ว่าง');
  m.alternate.forEach((a, i) => {
    const n = `alternate ที่ ${i + 1}${a.id ? ` (${a.id})` : ''}`;
    if (typeof a.id !== 'string' || !/^\S+$/.test(a.id)) errs.push(`${n}: ชื่อต้องไม่ว่างและห้ามมีช่องว่าง`);
    if (blank(a.sql)) errs.push(`${n}: sql ว่าง`);
  });
  dupes(m.alternate, 'alternate');
  m.order.forEach((r, i) => {
    const n = `order ที่ ${i + 1}${r.id ? ` (${r.id})` : ''}`;
    if (typeof r.id !== 'string' || !/^\S+$/.test(r.id)) errs.push(`${n}: id ต้องไม่ว่างและห้ามมีช่องว่าง`);
    if (blank(r.sql)) errs.push(`${n}: sql ว่าง`);
    if (!Number.isInteger(r.prio)) errs.push(`${n}: ${prioName} ต้องเป็นจำนวนเต็ม`);
  });
  dupes(m.order, 'order');
  if (!badId(m.id)) {
    // Windows file names are case-insensitive
    const isSelf = f => entry && f.fileName === entry.fileName;
    const target = lovTargetFileName(m, entry).toLowerCase();
    const clash = _lovFiles.find(f => !isSelf(f) && f.fileName.toLowerCase() === target);
    if (clash) errs.push(`มีไฟล์ ${clash.fileName} อยู่แล้วในโฟลเดอร์`);
    const sameId = _lovFiles.find(f => !isSelf(f) && f.json && f.json.id === m.id);
    if (sameId) errs.push(`id "${m.id}" ซ้ำกับไฟล์ ${sameId.fileName}`);
  }
  return errs;
}

// ── LOV editor: UI ──
const LOV_ROW_LISTS = { select: 'select', alt: 'alternate', order: 'order', param: 'parameter' };
const lovFilters = f => [['', '---'], [f.like, 'Like'], [f.equal, 'Equal'], [f.in, 'In']];
const LOV_ORDER_TYPES = [['ASC', 'ASC'], ['DESC', 'DESC']];
const lovEdFmt = () => LOV_FORMATS[_lovEdit.model.fmt];
const lovOrderUses = f => [[f.optional, f.optional], [f.auto, f.auto]];
const _lovTimers = {};

function lovLater(key, fn, ms = 600) {
  clearTimeout(_lovTimers[key]);
  _lovTimers[key] = setTimeout(fn, ms);
}

function lovOptions(values, current) {
  const cur = current == null ? '' : String(current);
  const list = values.some(([v]) => v === cur) ? values : [...values, [cur, cur]];
  return list.map(([v, label]) => `<option value="${lovAttr(v)}"${v === cur ? ' selected' : ''}>${lovHtml(label)}</option>`).join('');
}

function lovRows(text) {
  return Math.min(8, Math.max(1, String(text == null ? '' : text).split('\n').length));
}

function lovColRowHtml(c, i) {
  const o = c.order;
  const off = o ? '' : ' disabled';
  const f = lovEdFmt();
  return `<div class="lov-ed-row lov-ed-col" data-sec="select" data-i="${i}">
    <input type="text" data-f="id" value="${lovAttr(c.id)}" placeholder="id" aria-label="คอลัมน์ ${i + 1} id">
    <textarea data-f="sql" rows="${lovRows(c.sql)}" placeholder="sql เช่น U.USER_NAME" aria-label="คอลัมน์ ${i + 1} sql">${lovHtml(c.sql)}</textarea>
    <input type="text" data-f="type" list="lov-dl-coltype" value="${lovAttr(c.type)}" aria-label="คอลัมน์ ${i + 1} type">
    <select data-f="filter" aria-label="คอลัมน์ ${i + 1} filter">${lovOptions(lovFilters(f), c.filter)}</select>
    <label class="mode-label"><input type="checkbox" data-f="search"${c.search ? ' checked' : ''}> search</label>
    <div class="lov-ed-order">
      <label class="mode-label"><input type="checkbox" data-f="orderOn"${o ? ' checked' : ''}> sort</label>
      <select data-f="order.type" aria-label="คอลัมน์ ${i + 1} order type"${off}>${lovOptions(LOV_ORDER_TYPES, o ? o.type : 'ASC')}</select>
      <select data-f="order.use" aria-label="คอลัมน์ ${i + 1} order use"${off}>${lovOptions(lovOrderUses(f), o ? o.use : f.optional)}</select>
      <input type="number" data-f="order.prio" value="${lovAttr(o ? o.prio : 100)}" aria-label="คอลัมน์ ${i + 1} ${f.prio}"${off}>
    </div>
    <button class="btn btn-ghost lov-ed-del" onclick="lovEdRemove('select', ${i})" aria-label="ลบคอลัมน์ ${i + 1}">✕</button>
  </div>`;
}

function lovParamChipsHtml(list, sec, i, sqls) {
  if (!list.length) return '<span class="lov-ed-hint">ไม่มี parameter (พิมพ์ :ชื่อ ใน SQL แล้วจะขึ้นเอง)</span>';
  const inSql = lovSqlParamNames(sqls);
  return list.map((p, j) => {
    const unused = !(p.name in inSql);
    return `<span class="lov-ed-param${unused ? ' lov-ed-param-unused' : ''}" data-sec="${sec}" data-i="${i}" data-j="${j}">
      <label>:${lovHtml(p.name)} <input type="text" data-f="type" list="lov-dl-ptype" value="${lovAttr(p.type)}" aria-label="type ของ :${lovAttr(p.name)}"></label>
      ${unused ? `<span class="lov-ed-param-note">ไม่พบใน SQL</span>
        <button class="lov-ed-param-del" onclick="lovEdRemoveParam('${sec}', ${i}, ${j})" aria-label="ลบ parameter :${lovAttr(p.name)}">✕</button>` : ''}
    </span>`;
  }).join('');
}

function lovEdRemoveParam(sec, i, j) {
  const m = _lovEdit.model;
  (sec === 'altp' ? m.alternate[i].parameter : m.parameter).splice(j, 1);
  lovEdMarkDirty();
  lovRenderEdSection(sec === 'altp' ? 'alt' : 'param');
  lovEdRefreshPreview();
}

function lovAltRowHtml(a, i) {
  return `<div class="lov-ed-row lov-ed-alt" data-sec="alt" data-i="${i}">
    <input type="text" data-f="id" value="${lovAttr(a.id)}" placeholder="ชื่อ (alternates=…)" aria-label="alternate ${i + 1} ชื่อ">
    <textarea data-f="sql" rows="${lovRows(a.sql)}" placeholder="เช่น U.ID_CODE LIKE :idCode" aria-label="alternate ${i + 1} sql">${lovHtml(a.sql)}</textarea>
    <button class="btn btn-ghost lov-ed-del" onclick="lovEdRemove('alt', ${i})" aria-label="ลบ alternate ${i + 1}">✕</button>
    <div class="lov-ed-params" id="lov-ed-altp-${i}">${lovParamChipsHtml(a.parameter, 'altp', i, [a.sql])}</div>
  </div>`;
}

function lovOrderRowHtml(r, i) {
  const f = lovEdFmt();
  return `<div class="lov-ed-row lov-ed-ord" data-sec="order" data-i="${i}">
    <input type="text" data-f="id" value="${lovAttr(r.id)}" placeholder="id" aria-label="order ${i + 1} id">
    <textarea data-f="sql" rows="${lovRows(r.sql)}" placeholder="sql เช่น T.DATE DESC, T.NO" aria-label="order ${i + 1} sql">${lovHtml(r.sql)}</textarea>
    <select data-f="type" aria-label="order ${i + 1} type">${lovOptions(LOV_ORDER_TYPES, r.type)}</select>
    <select data-f="use" aria-label="order ${i + 1} use">${lovOptions(lovOrderUses(f), r.use)}</select>
    <input type="number" data-f="prio" value="${lovAttr(r.prio)}" aria-label="order ${i + 1} ${f.prio}">
    <button class="btn btn-ghost lov-ed-del" onclick="lovEdRemove('order', ${i})" aria-label="ลบ order ${i + 1}">✕</button>
  </div>`;
}

function lovRenderEdSection(sec) {
  const m = _lovEdit.model;
  if (sec === 'select') {
    document.getElementById('lov-ed-select-rows').innerHTML = m.select.map(lovColRowHtml).join('');
    document.getElementById('lov-ed-select-count').textContent = `${m.select.length} คอลัมน์`;
    document.getElementById('lov-ed-select-hd').style.visibility = m.select.length ? '' : 'hidden';
  } else if (sec === 'alt') {
    document.getElementById('lov-ed-alt-rows').innerHTML = m.alternate.map(lovAltRowHtml).join('')
      || '<span class="lov-ed-hint">ยังไม่มี alternate</span>';
  } else if (sec === 'order') {
    document.getElementById('lov-ed-order-rows').innerHTML = m.order.map(lovOrderRowHtml).join('')
      || '<span class="lov-ed-hint">ยังไม่มี order ระดับ query (sort ของคอลัมน์ตั้งที่ SELECT)</span>';
  } else if (sec === 'param') {
    document.getElementById('lov-ed-params').innerHTML = lovParamChipsHtml(m.parameter, 'param', 0, [m.from, m.main]);
  }
}

function lovRenderEditor() {
  const ed = _lovEdit, m = ed.model, f = lovEdFmt();
  const units = lovFolderUnitNames();
  const usedNote = units.length ? `ไฟล์ในโฟลเดอร์นี้ใช้: ${units.map(u => `${u.name} ×${u.count}`).join(', ')}` : '';
  // A repo rule, so it goes by the folder, not the file. 8.x repos (DLPW, LED, EIA) map unitName in
  // QueryTemplateConfiguration.java; BDE's bde-0.x forks set it up elsewhere.
  const unitHint = _lovFormat === 'v10' ? usedNote
    : 'ต้องตรงกับ persistence unit ที่รีโปนั้นตั้งไว้ (เช่น key ใน QueryTemplateConfiguration.java)' + (usedNote ? ` · ${usedNote}` : '');
  const unitValues = units.map(u => u.name).filter(n => n !== '(ว่าง)');
  const bool = (f, label) => `<label class="mode-label"><input type="checkbox" data-f="${f}"${m[f] ? ' checked' : ''}> ${label}</label>`;
  const text = (f, label, extra = '') => `<div class="lov-ed-field${extra}">
      <label class="field-label" for="lov-ed-${f}">${label}</label>
      <input type="text" id="lov-ed-${f}" data-f="${f}" value="${lovAttr(m[f])}"${f === 'unitName' ? ' list="lov-dl-unit"' : ''}${f === 'type' ? ' list="lov-dl-lovtype"' : ''}>
    </div>`;
  const area = (f, label, rows, hint = '') => `<div class="lov-ed-field">
      <label class="field-label" for="lov-ed-${f}">${label}</label>
      <textarea id="lov-ed-${f}" data-f="${f}" rows="${Math.max(rows, lovRows(m[f]))}">${lovHtml(m[f])}</textarea>
      ${hint ? `<div class="lov-ed-hint">${hint}</div>` : ''}
    </div>`;
  const dl = (id, values) => `<datalist id="${id}">${values.map(v => `<option value="${lovAttr(v)}">`).join('')}</datalist>`;

  document.getElementById('lov-editor').innerHTML = `
    ${dl('lov-dl-coltype', ['String', 'Long', 'Date', 'BigDecimal', 'Integer', 'Double', 'Boolean'])}
    ${dl('lov-dl-ptype', ['Any', 'String', 'Long', 'Date', 'BigDecimal'])}
    ${dl('lov-dl-unit', unitValues)}
    ${dl('lov-dl-lovtype', [...new Set([f.type, 'SimpleLovContainer'])])}
    <div class="card lov-ed-bar">
      <div class="lov-ed-head">
        <div>
          <div class="card-title">${ed.entry ? 'แก้ไข LOV' : 'สร้าง LOV ใหม่'} ${lovVersionBadge(m.fmt, m.fmt === _lovFormat ? '' : ' lov-ver-odd')} <span id="lov-ed-dirty" class="lov-ed-dirty"></span></div>
          <div class="lov-ed-file" id="lov-ed-file"></div>
        </div>
        <div class="toolbar">
          <button class="btn btn-ghost" onclick="lovCloseEditor()">← กลับรายการ</button>
          <button class="btn btn-ghost" onclick="lovTogglePaste()">📋 วาง SQL</button>
          ${ed.entry ? `<button class="btn btn-danger" data-file="${lovAttr(ed.entry.fileName)}" onclick="lovDeleteFile(this.dataset.file)">🗑 ลบ</button>` : ''}
          <button class="btn btn-primary" onclick="lovSaveEditor()">💾 บันทึก <span class="lov-ed-kbd">Ctrl+S</span></button>
        </div>
      </div>
      ${ed.entry && !ed.entry.designerFormat ? '<div class="lov-ed-warn">⚠️ ไฟล์นี้ไม่ได้จัดรูปแบบแบบ designer — บันทึกแล้วจะจัดรูปแบบใหม่ทั้งไฟล์ (ค่าเดิมไม่เปลี่ยน แต่ git diff จะใหญ่)</div>' : ''}
      ${m.fmt !== _lovFormat ? `<div class="lov-ed-warn">⚠️ ไฟล์นี้เป็น LOV ${lovHtml(f.short)} แต่โฟลเดอร์นี้เป็น LOV ${lovHtml(LOV_FORMATS[_lovFormat].short)} — แก้และบันทึกตามรูปแบบของไฟล์ (${lovHtml(f.prio)}, ${lovHtml(f.optional)}/${lovHtml(f.auto)})</div>` : ''}
      <div id="lov-ed-errors" class="lov-ed-errors" role="alert"></div>
    </div>

    <div class="card" id="lov-ed-paste"${ed.showPaste ? '' : ' style="display:none;"'}>
      <div class="card-title">วาง SQL → LOV</div>
      <textarea id="lov-ed-paste-sql" rows="8" placeholder="SELECT ... FROM ... WHERE ... ORDER BY ..." aria-label="SQL ที่จะแปลงเป็น LOV">${lovHtml(ed.pasteSql)}</textarea>
      <div class="lov-ed-hint">คอลัมน์ที่ id ตรงกับของเดิมจะเก็บ type / filter / search ไว้ · alias เก็บตามที่เขียน · ORDER BY → sort แบบ auto · comment และ ; ท้ายจะถูกตัดทิ้ง</div>
      <div class="toolbar lov-ed-actions"><button class="btn btn-primary" onclick="lovApplyPaste()">แปลงเป็น LOV</button></div>
    </div>

    <div class="card">
      <div class="card-title">ทั่วไป</div>
      <div class="lov-ed-grid">
        ${text('id', 'id')}
        <div class="lov-ed-field">
          <label class="field-label" for="lov-ed-unitName">unitName</label>
          <input type="text" id="lov-ed-unitName" data-f="unitName" list="lov-dl-unit" value="${lovAttr(m.unitName)}">
          <div class="lov-ed-hint">${lovHtml(unitHint)}</div>
        </div>
        ${text('description', 'description', ' lov-ed-span2')}
        ${text('type', 'type')}
        <div class="lov-ed-field lov-ed-checks">${bool('distinct', 'distinct')}${bool('autoDeclare', 'autoDeclare (GraphQL)')}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">SELECT <span class="lov-ed-count" id="lov-ed-select-count"></span></div>
      <div class="lov-ed-row lov-ed-col lov-ed-row-hd" id="lov-ed-select-hd" aria-hidden="true">
        <span>id</span><span>sql</span><span>type</span><span>filter</span><span></span><span>sort · type · use · ${f.prio}</span><span></span>
      </div>
      <div class="lov-ed-rows" id="lov-ed-select-rows"></div>
      <button class="btn btn-ghost" onclick="lovEdAdd('select')">＋ เพิ่มคอลัมน์</button>
    </div>

    <div class="card">
      <div class="card-title">FROM / WHERE</div>
      ${area('from', 'from', 3)}
      ${area('main', 'where.main', 2, 'alternate จะต่อท้ายด้วย AND ... เมื่อ UI ส่ง alternates=ชื่อ มา')}
      <div class="field-label">parameter (จาก from + where.main)</div>
      <div class="lov-ed-params" id="lov-ed-params"></div>
    </div>

    <div class="card">
      <div class="card-title">WHERE alternate</div>
      <div class="lov-ed-rows" id="lov-ed-alt-rows"></div>
      <button class="btn btn-ghost" onclick="lovEdAdd('alt')">＋ เพิ่ม alternate</button>
    </div>

    <div class="card">
      <div class="card-title">GROUP BY / HAVING · ORDER</div>
      ${area('groupByAndHaving', 'groupByAndHaving', 2, 'เขียนรวมคำว่า GROUP BY / HAVING ด้วย')}
      <div class="field-label">order ระดับ query</div>
      <div class="lov-ed-rows" id="lov-ed-order-rows"></div>
      <button class="btn btn-ghost" onclick="lovEdAdd('order')">＋ เพิ่ม order</button>
    </div>

    <div class="card">
      <div class="card-title">ตัวอย่างผลลัพธ์</div>
      <div id="lov-ed-preview"></div>
      <details class="lov-ed-json">
        <summary>JSON ที่จะบันทึก</summary>
        <div id="lov-ed-json"></div>
      </details>
    </div>`;
  ['select', 'alt', 'order', 'param'].forEach(lovRenderEdSection);
  lovEdRefreshPreview();
}

function lovEdRefreshPreview() {
  if (!_lovEdit) return;
  const { model: m, entry } = _lovEdit;
  const json = lovJsonFromModel(m);
  const built = lovBuildSql(json);
  document.getElementById('lov-ed-preview').innerHTML = lovPreviewHtml(m.id || '<id>', built);
  document.getElementById('lov-ed-json').innerHTML = lovSqlBlockHtml('', lovJacksonStringify(json, '\n'), [], '', 'json');
  let label;
  if (!lovIdOk(m.id)) {
    label = `ไฟล์: — (${m.id ? 'id ยังไม่ถูกต้อง' : 'ใส่ id ก่อน'})`;
  } else {
    const target = lovTargetFileName(m, entry);
    let note = '';
    if (entry && target !== entry.fileName) note = ` — เปลี่ยนชื่อจาก ${entry.fileName} (ไฟล์เดิมจะถูกลบ)`;
    else if (entry && entry.fileName !== lovIdToFileName(entry.json.id || '')) note = ' — ชื่อไฟล์เดิมไม่ตรงกฎของ designer จึงคงชื่อเดิมไว้';
    label = `ไฟล์: ${target}${note}`;
  }
  document.getElementById('lov-ed-file').textContent = label;
  document.getElementById('lov-ed-dirty').textContent = _lovEdit.dirty ? '● ยังไม่บันทึก' : '';
  highlightCode('#lov-tab pre.rxjs-code code');
}

function lovEdMarkDirty() {
  _lovEdit.dirty = true;
  document.getElementById('lov-ed-dirty').textContent = '● ยังไม่บันทึก';
}

function lovEdOnInput(e) {
  const ed = _lovEdit;
  const el = e.target;
  if (!ed) return;
  if (el.id === 'lov-ed-paste-sql') { ed.pasteSql = el.value; return; }
  const f = el.dataset && el.dataset.f;
  if (!f) return;
  const val = el.type === 'checkbox' ? el.checked : el.value;
  const m = ed.model;
  const row = el.closest('[data-sec]');
  if (!row) {
    m[f] = val;
    if (f === 'from' || f === 'main') lovLater('params', lovEdSyncGlobalParams);
  } else if (row.dataset.sec === 'altp' || row.dataset.sec === 'param') {
    const list = row.dataset.sec === 'altp' ? m.alternate[Number(row.dataset.i)].parameter : m.parameter;
    list[Number(row.dataset.j)].type = val;
  } else {
    const sec = row.dataset.sec, i = Number(row.dataset.i);
    const item = m[LOV_ROW_LISTS[sec]][i];
    if (f === 'orderOn') {
      if (val) item.order = item.lastOrder || { type: 'ASC', use: lovEdFmt().optional, prio: 100 };
      else { item.lastOrder = item.order; item.order = null; }
      row.querySelectorAll('[data-f^="order."]').forEach(x => { x.disabled = !val; });
    } else if (f.startsWith('order.')) {
      const k = f.slice(6);
      item.order[k] = k === 'prio' ? lovToInt(val) : val;
    } else if (f === 'prio') {
      item.prio = lovToInt(val);
    } else if (f === 'filter') {
      item.filter = val || null;
    } else {
      item[f] = val;
    }
    if (sec === 'select' && f === 'sql' && !item.id) lovLater(`colid-${i}`, () => lovEdAutoColumnId(item));
    if (sec === 'alt' && f === 'sql') lovLater(`altp-${i}`, () => lovEdSyncAltParams(item));
  }
  lovEdMarkDirty();
  lovLater('preview', lovEdRefreshPreview, 300);
}

// Like the designer: typing SQL into a column with no id fills the id in from the alias/column name.
// A new column still on default type/filter also gets the paste-SQL guesses (…_DATE → Date, …_ID → Long)
function lovEdAutoColumnId(item) {
  if (!_lovEdit || item.id || !item.sql) return;
  const i = _lovEdit.model.select.indexOf(item);
  if (i < 0) return;
  const guess = lovToColumn(item.sql, _lovEdit.model.fmt);
  const row = document.querySelector(`#lov-ed-select-rows [data-i="${i}"]`);
  item.id = guess.id;
  if (row) row.querySelector('[data-f="id"]').value = item.id;
  if (!Object.keys(item.orig).length && item.type === 'String' && item.filter == null) {
    item.type = guess.column.type;
    item.filter = guess.column.filter;
    if (row) {
      row.querySelector('[data-f="type"]').value = item.type;
      row.querySelector('[data-f="filter"]').value = item.filter;
    }
  }
  lovEdRefreshPreview();
}

// `:{{ name | Type }}` is authoring shorthand — rewrite it to `:name` once its type is taken
function lovEdRewriteTemplateParams(holder, key, selector) {
  const sql = holder[key];
  if (typeof sql !== 'string' || !sql.includes('{{')) return;
  holder[key] = lovFindParameter(sql).sql;
  const ta = document.querySelector(selector);
  if (ta) ta.value = holder[key];
}

function lovEdSyncGlobalParams() {
  if (!_lovEdit) return;
  const m = _lovEdit.model;
  m.parameter = lovSyncParams(m.parameter, [m.from, m.main]);
  lovEdRewriteTemplateParams(m, 'from', '#lov-ed-from');
  lovEdRewriteTemplateParams(m, 'main', '#lov-ed-main');
  lovRenderEdSection('param');
  lovEdRefreshPreview();
}

function lovEdSyncAltParams(item) {
  if (!_lovEdit) return;
  const i = _lovEdit.model.alternate.indexOf(item);
  if (i < 0) return;
  item.parameter = lovSyncParams(item.parameter, [item.sql]);
  lovEdRewriteTemplateParams(item, 'sql', `#lov-ed-alt-rows [data-i="${i}"] [data-f="sql"]`);
  document.getElementById(`lov-ed-altp-${i}`).innerHTML = lovParamChipsHtml(item.parameter, 'altp', i, [item.sql]);
  lovEdRefreshPreview();
}

function lovEdAdd(sec) {
  const m = _lovEdit.model;
  if (sec === 'select') m.select.push({ id: '', orig: {}, sql: '', type: 'String', search: false, filter: null, order: null });
  if (sec === 'alt') m.alternate.push({ id: '', orig: {}, sql: '', parameter: [] });
  if (sec === 'order') m.order.push({ id: '', orig: {}, sql: '', type: 'ASC', use: lovEdFmt().optional, prio: 100 });
  lovEdMarkDirty();
  lovRenderEdSection(sec);
  lovEdRefreshPreview();
  const rows = document.querySelectorAll(`#lov-ed-${sec}-rows .lov-ed-row`);
  const first = rows.length && rows[rows.length - 1].querySelector('input, textarea');
  if (first) first.focus();
}

function lovEdRemove(sec, i) {
  _lovEdit.model[LOV_ROW_LISTS[sec]].splice(i, 1);
  lovEdMarkDirty();
  lovRenderEdSection(sec);
  lovEdRefreshPreview();
}

function lovShowEditor(show) {
  document.getElementById('lov-browse').style.display = show ? 'none' : '';
  document.getElementById('lov-editor').style.display = show ? '' : 'none';
  document.getElementById('lov-toolbar').style.display = show ? 'none' : '';
}

function lovOpenEditor(entry) {
  _lovEdit = {
    entry, model: lovModelFromJson(entry ? entry.json : lovNewTemplate()),
    dirty: false, showPaste: !entry, pasteSql: '', saving: false,
  };
  lovShowEditor(true);
  lovRenderEditor();
  scrollToTop();
}

// Returns false when the user keeps unsaved changes; force skips the question
function lovCloseEditor(force) {
  if (!_lovEdit) return true;
  if (!force && _lovEdit.dirty && !confirm('มีการแก้ไขที่ยังไม่ได้บันทึก — ทิ้งการแก้ไขนี้?')) return false;
  _lovEdit = null;
  document.getElementById('lov-editor').innerHTML = '';
  lovShowEditor(false);
  return true;
}

function lovEditFile(fileName) {
  const entry = lovFindEntry(fileName);
  if (entry && lovCloseEditor()) lovOpenEditor(entry);
}

function lovNewFile() {
  if (_lovDirHandle && lovCloseEditor()) lovOpenEditor(null);
}

function lovTogglePaste() {
  const ed = _lovEdit;
  ed.showPaste = !ed.showPaste;
  const box = document.getElementById('lov-ed-paste');
  box.style.display = ed.showPaste ? '' : 'none';
  if (!ed.showPaste) return;
  const ta = document.getElementById('lov-ed-paste-sql');
  if (!ta.value.trim() && ed.model.select.length) {
    ed.pasteSql = lovBuildSql(lovJsonFromModel(ed.model)).baseSql;
    ta.value = ed.pasteSql;
  }
  ta.focus();
}

function lovApplyPaste() {
  const ed = _lovEdit;
  const sql = document.getElementById('lov-ed-paste-sql').value;
  if (!sql.trim()) { showToast('✗ ยังไม่ได้วาง SQL'); return; }
  const t = lovTransformLov(sql, ed.model.fmt);
  const cols = Object.entries(t.select);
  if (!cols.length || !t.from) { showToast('✗ อ่าน SELECT / FROM ไม่ได้'); return; }
  const m = ed.model;
  const auto = LOV_FORMATS[m.fmt].auto; // `auto` or `AUTO`, as this file's version spells it
  const hasOrderBy = Object.keys(t.order).length > 0 || cols.some(([, c]) => c.order);
  const prev = {};
  m.select.forEach(c => { prev[c.id] = c; });
  m.select = cols.map(([id, col]) => {
    const order = col.order ? { ...col.order, use: auto } : null;
    const old = prev[id];
    if (!old) return { id, orig: {}, sql: col.sql, type: col.type, search: col.search, filter: col.filter, order };
    // An ORDER BY replaces default sorts; UI-requested (optional) sorts on existing columns stay
    const keepOld = !hasOrderBy || (old.order && !lovIsAuto(old.order.use));
    return { ...old, sql: col.sql, order: order || (keepOld ? old.order : null) };
  });
  if (hasOrderBy) {
    m.order = Object.entries(t.order).map(([id, o]) => ({ id, orig: {}, sql: o.sql, type: o.type, use: auto, prio: o.prio }));
  }
  m.distinct = t.distinct;
  m.from = t.from;
  m.main = t.where.main;
  m.groupByAndHaving = t.groupByAndHaving;
  m.parameter = lovSyncParams(m.parameter, [m.from, m.main]);
  ed.showPaste = false;
  ed.dirty = true;
  lovRenderEditor();
  showToast('✓ แปลง SQL แล้ว — ตรวจ type / filter ก่อนบันทึก');
}

function lovShowErrors(errs) {
  document.getElementById('lov-ed-errors').innerHTML = errs.length
    ? `<div>บันทึกไม่ได้:</div><ul>${errs.map(e => `<li>${lovHtml(e)}</li>`).join('')}</ul>` : '';
}

async function lovSaveEditor() {
  const ed = _lovEdit;
  if (!ed || ed.saving) return;
  const { model: m, entry } = ed;
  const errs = lovValidate(m, entry);
  lovShowErrors(errs);
  if (errs.length) { showToast('✗ ยังบันทึกไม่ได้ — ดูรายการด้านบน'); scrollToTop(); return; }
  if (!await lovEnsureWrite()) { showToast('✗ ไม่ได้รับสิทธิ์แก้ไขไฟล์ในโฟลเดอร์นี้'); return; }
  ed.saving = true;
  try {
    if (entry) {
      const current = await entry.handle.getFile().catch(() => null);
      if (!current && !confirm(`ไม่พบไฟล์ ${entry.fileName} แล้ว (อาจถูกลบหรือย้าย) — บันทึกเป็นไฟล์ใหม่?`)) return;
      if (current && current.lastModified !== entry.lastModified
        && !confirm(`${entry.fileName} ถูกแก้จากที่อื่นหลังจากเปิดมา — บันทึกทับ?`)) return;
    }
    const json = lovJsonFromModel(m);
    const eol = entry ? entry.eol : '\r\n'; // the designer runs on Windows: Jackson writes CRLF
    const text = lovJacksonStringify(json, eol) + (entry && entry.trailingNewline ? eol : '');
    const target = lovTargetFileName(m, entry);
    const handle = await _lovDirHandle.getFileHandle(target, { create: true });
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    // Same name in another case is the same file on Windows — removing it would delete what was just written
    if (entry && target.toLowerCase() !== entry.fileName.toLowerCase()) {
      await _lovDirHandle.removeEntry(entry.fileName).catch(err => { if (err.name !== 'NotFoundError') throw err; });
    }
    ed.dirty = false;
    await lovLoadFiles();
    const saved = _lovFiles.find(f => f.fileName.toLowerCase() === target.toLowerCase());
    if (saved) lovOpenEditor(saved); else lovCloseEditor(true);
    showToast(`✓ บันทึก ${target} แล้ว`);
  } catch (err) {
    showToast('✗ บันทึกไม่สำเร็จ');
    console.error(err);
  } finally {
    ed.saving = false;
  }
}

function lovInit() {
  const supported = 'showDirectoryPicker' in window;
  document.getElementById('lov-unsupported').style.display = supported ? 'none' : '';
  document.getElementById('lov-main').style.display = supported ? '' : 'none';
  document.getElementById('lov-editor').addEventListener('input', lovEdOnInput);
  window.addEventListener('beforeunload', e => {
    if (_lovEdit && _lovEdit.dirty) { e.preventDefault(); e.returnValue = ''; }
  });
  if (supported) lovRestoreFolder();
}
