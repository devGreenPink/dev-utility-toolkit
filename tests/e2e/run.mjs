// End-to-end checks in a real browser: every tab, accessibility (axe), layout at phone width, and the
// features that only exist in the page (smart paste, remembered inputs, share link, file drop, QR, offline).
// Run: cd tests/e2e && npm ci && npx playwright install chromium && node run.mjs
// It serves the repository itself (no-cache, like .claude/launch.json) on a free port.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const AXE = await readFile(new URL('./node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url.endsWith('/')) url += 'index.html';
  const path = normalize(url).replace(/^([/\\])+/, '');
  if (path.startsWith('..')) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const failures = [];
let passed = 0;
// every check closes the contexts it opened: left open, a dozen of them broke the last (offline) check
const contexts = [];
async function check(name, fn) {
  try { await fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { failures.push(name); console.log('  FAIL ' + name + '\n       ' + String(e.message || e).split('\n').join('\n       ')); }
  finally { await Promise.all(contexts.splice(0).map(c => c.close().catch(() => {}))); }
}
function expect(cond, msg) { if (!cond) throw new Error(msg); }
async function newPage({ theme, ...opts } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', serviceWorkers: 'block',
    permissions: ['clipboard-read', 'clipboard-write'], ...opts });
  contexts.push(ctx);
  // a stored theme wins over the first-visit default (Dracula), e.g. 'mac' to follow colorScheme
  if (theme) await ctx.addInitScript(t => localStorage.setItem('esan-devtools-theme', t), theme);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'assert') page.errors.push(m.text()); });
  await page.goto(BASE);
  await page.waitForTimeout(400);
  return page;
}
const open = (page, id) => page.evaluate(async t => { openTab(null, t); await whenTab(t); }, id);
const noErrors = page => expect(!page.errors.length, 'page errors: ' + page.errors.join(' | '));

// ── every tab ──
const tabs = await (await newPage()).evaluate(() => Object.keys(TAB_META));
await check(`all ${tabs.length} tabs open without errors`, async () => {
  const page = await newPage();
  for (const t of tabs) { await open(page, t); await page.waitForTimeout(150); }
  await page.waitForTimeout(800);
  noErrors(page);
});
await check('no CDN script loads with the first page', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const cdn = [];
  page.on('request', r => { if (/cdnjs|jsdelivr/.test(r.url())) cdn.push(r.url()); });
  await page.goto(BASE); await page.waitForTimeout(800);
  expect(!cdn.length, 'loaded at start: ' + cdn.join(', '));
  await ctx.close();
});
// the phone run catches what only narrow screens show, e.g. a code block that scrolls sideways but takes no focus
for (const [label, theme, scheme, width] of [['default, Dracula', null, 'dark'], ['dark', 'mac', 'dark'], ['light', 'mac', 'light'], ['phone 375 px', null, 'dark', 375]]) {
  await check(`axe: WCAG 2.2 AA on every tab (${label})`, async () => {
    const page = await newPage({ theme, colorScheme: scheme, reducedMotion: 'reduce', ...(width ? { viewport: { width, height: 812 } } : {}) });
    const found = [];
    for (const t of tabs) {
      await open(page, t); await page.waitForTimeout(250);
      if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: AXE });
      const v = await page.evaluate(async () => (await axe.run({ include: ['.tab-content.active', '.top-bar', '.sidebar'] },
        { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations
        .map(x => `${x.id}: ${x.nodes.slice(0, 2).map(n => n.target.join(' ')).join(', ')}`));
      v.forEach(x => found.push(`${t} ${x}`));
    }
    expect(!found.length, found.slice(0, 10).join('\n'));
  });
}
await check('no sideways scroll on any tab at 375 px', async () => {
  const page = await newPage({ viewport: { width: 375, height: 812 } });
  const wide = [];
  for (const t of tabs) {
    await open(page, t); await page.waitForTimeout(150);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (over > 1) wide.push(`${t} +${over}px`);
  }
  expect(!wide.length, wide.join(', '));
});

// ── features ──
await check('smart paste: JWT, YAML direction, curl parts, HAR summary, XML to JSON', async () => {
  const page = await newPage();
  const detect = async text => { await open(page, 'home-tab'); await page.fill('#sp-input', text); await page.waitForTimeout(250); };
  await detect('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(250);
  expect(await page.evaluate(() => activeTabId) === 'jwt-tab', 'JWT did not open the JWT tab');
  await detect('quarkus:\n  http:\n    port: 8080');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(400);
  expect((await page.textContent('#py-output')).includes('quarkus.http.port=8080'), 'YAML was not converted to properties');
  await detect("curl -X POST 'https://shop.example.com/api?q=a%20b' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc' --data-raw '{\"a\":1}'");
  expect((await page.$$('#sp-result button')).length === 3, 'curl should offer token, body and URL');
  await detect(JSON.stringify({ log: { entries: [{ request: { method: 'GET', url: 'https://x/a' }, response: { status: 500 }, time: 9 }] } }));
  expect((await page.textContent('#sp-result')).includes('ล้มเหลว 1'), 'HAR summary missing');
  await detect('<order id="7"><item>A</item></order>');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(400);
  expect(JSON.parse(await page.$eval('#json-input', e => e.value)).order['@id'] === '7', 'XML was not converted');
  noErrors(page);
});
await check('inputs are remembered across a reload; JWT and secrets never are', async () => {
  const page = await newPage();
  await open(page, 'base64-tab'); await page.fill('#b64-input', 'hello');
  await open(page, 'jwt-tab'); await page.fill('#jwt-input', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc');
  await page.waitForTimeout(500); await page.reload(); await page.waitForTimeout(500);
  expect(await page.$eval('#b64-input', e => e.value) === 'hello', 'base64 input not restored');
  const keys = await page.evaluate(() => Object.keys(localStorage).join(' '));
  expect(!/jwt-input|k8s-input|jwt-enc-secret/.test(keys), 'a secret field was stored: ' + keys);
});
await check('live converters: Base64, URL, K8s Secret, SQL, Diff, JWT encoder', async () => {
  const page = await newPage();
  await open(page, 'base64-tab'); await page.click('#b64-mode [data-v="enc"]'); await page.fill('#b64-input', 'สวัสดี');
  expect(await page.textContent('#b64-output') === '4Liq4Lin4Lix4Liq4LiU4Li1', 'base64 encode');
  await open(page, 'url-tab'); await page.click('#url-dir [data-v="enc"]'); await page.fill('#url-input', 'a b/ก');
  expect(await page.textContent('#url-output') === 'a%20b%2F%E0%B8%81', 'url encode');
  await open(page, 'k8s-secret-tab'); await page.fill('#k8s-input', 'kind: Secret\ndata:\n  USER: YWRtaW4=');
  await page.waitForTimeout(450);
  expect((await page.textContent('#k8s-output')).includes('admin'), 'k8s secret decode');
  await open(page, 'sql-tab'); await page.fill('#sql-input', 'sb.append("SELECT * FROM T ");'); await page.waitForTimeout(450);
  expect((await page.textContent('#sql-results')).includes('SELECT'), 'sql parse');
  await open(page, 'compare-tab'); await page.fill('#diff-left', 'hello world'); await page.fill('#diff-right', 'hello there');
  await page.waitForTimeout(1200);
  expect((await page.textContent('#diff-stats')).includes('+'), 'diff');
  await open(page, 'jwt-tab'); await page.fill('#jwt-enc-payload', '{"sub":"x"}'); await page.fill('#jwt-enc-secret', 's3cret');
  await page.waitForTimeout(600);
  expect((await page.textContent('#jwt-enc-output')).startsWith('eyJ'), 'jwt encode');
  noErrors(page);
});
await check('copy: the button says คัดลอกแล้ว and the clipboard holds the value', async () => {
  const page = await newPage();
  await open(page, 'url-tab'); await page.click('#url-dir [data-v="enc"]'); await page.fill('#url-input', 'x y');
  await page.click('#url-tab .field-act:has-text("คัดลอก")');
  await page.waitForTimeout(150);
  expect((await page.textContent('#url-tab .is-copied')).includes('คัดลอกแล้ว'), 'no copied state');
  expect(await page.evaluate(() => navigator.clipboard.readText()) === 'x%20y', 'clipboard content');
});
await check('share link: opens the same state elsewhere, compressed, without the JWT', async () => {
  const page = await newPage();
  await open(page, 'jwt-tab');
  await page.fill('#jwt-input', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc');
  await page.fill('#jwt-enc-payload', '{"sub":"x"}');
  await page.click('#share-btn'); await page.waitForTimeout(300);
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(/#t=jwt-tab&z=/.test(link), 'not a compressed link: ' + link.slice(0, 80));
  const fields = await page.evaluate(async l => { const h = '#' + l.split('#')[1]; return Object.keys(shareParse(h, await shareJson(h)).st.f); }, link);
  expect(!fields.includes('jwt-input'), 'the token went into the link');
  const other = await newPage();
  await other.goto(link); await other.waitForTimeout(800);
  expect(await other.$eval('#jwt-enc-payload', e => e.value) === '{"sub":"x"}', 'state not applied');
  expect(await other.evaluate(() => location.hash) === '', 'hash not cleared');
});
await check('file drop: Dockerfile, JSON, onto a field, binary refused', async () => {
  const page = await newPage();
  const drop = (sel, name, text, type = 'text/plain') => page.evaluate(([sel, name, text, type]) => {
    const dt = new DataTransfer(); dt.items.add(new File([text], name, { type }));
    const el = sel ? document.querySelector(sel) : document.body;
    for (const ev of ['dragenter', 'dragover', 'drop']) el.dispatchEvent(new DragEvent(ev, { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, [sel, name, text, type]);
  await drop(null, 'Dockerfile', 'FROM nginx:1.27-alpine\nCOPY dist /usr/share/nginx/html'); await page.waitForTimeout(400);
  expect(await page.evaluate(() => _yx['k8s-explorer'].cur) === 'nginx', 'Dockerfile did not open the nginx example');
  await drop(null, 'order.json', '{"id":1}'); await page.waitForTimeout(300);
  expect(await page.evaluate(() => activeTabId) === 'json-tab', 'JSON file did not open JSON Tools');
  await open(page, 'compare-tab'); await drop('#diff-left', 'a.txt', 'hello'); await page.waitForTimeout(200);
  expect(await page.$eval('#diff-left', e => e.value) === 'hello', 'drop onto a field');
  await drop(null, 'x.bin', 'a\u0000b'); await page.waitForTimeout(200);
  expect((await page.textContent('#toast .toast-msg')).includes('binary'), 'binary file was not refused');
});
await check('send to and history', async () => {
  const page = await newPage();
  await open(page, 'base64-tab'); await page.click('#b64-mode [data-v="dec"]'); await page.fill('#b64-input', 'eyJpZCI6MX0=');
  await page.click('#base64-tab button:has-text("ส่งต่อ")');
  await page.click('.field-menu .field-menu-item >> nth=0'); await page.waitForTimeout(300);
  expect(await page.evaluate(() => activeTabId) === 'json-tab', 'send to did not open JSON Tools');
  await open(page, 'url-tab');
  await page.fill('#url-input', 'first'); await page.locator('#url-input').blur();
  await page.fill('#url-input', 'second'); await page.locator('#url-input').blur();
  await page.click('#url-tab .hist-btn');
  expect((await page.$$eval('.field-menu .field-menu-item', b => b.map(x => x.textContent.trim()))).join() === 'second,first', 'history order');
});
await check('Ctrl+K: a multi-line paste is kept whole', async () => {
  const page = await newPage();
  const trace = 'Exception in thread "main" java.lang.IllegalStateException: boom\n\tat com.example.shop.App.run(App.java:12)';
  await page.evaluate(t => navigator.clipboard.writeText(t), trace);
  await page.keyboard.press('Control+k'); await page.keyboard.press('Control+v'); await page.waitForTimeout(200);
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  expect(await page.$eval('#st-input', e => e.value) === trace, 'trace was cut');
});
await check('QR: a PromptPay code is read, split and its CRC checked', async () => {
  const page = await newPage();
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js' }); // test-only QR generator
  const png = await page.evaluate(() => {
    const body = '000201010212' + '2937' + '0016A000000677010111' + '01130066812345678' + '5802TH' + '5303764' + '540550.00' + '6304';
    const q = qrcode(0, 'M'); q.addData(body + crc16(body)); q.make();
    const n = q.getModuleCount(), s = 8, m = 4, c = document.createElement('canvas');
    c.width = c.height = (n + 2 * m) * s;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000';
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (q.isDark(i, j)) x.fillRect((j + m) * s, (i + m) * s, s, s);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.evaluate(b64 => {
    const dt = new DataTransfer(); dt.items.add(new File([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], 'qr.png', { type: 'image/png' }));
    for (const ev of ['dragenter', 'dragover', 'drop']) document.body.dispatchEvent(new DragEvent(ev, { bubbles: true, cancelable: true, dataTransfer: dt }));
  }, png);
  await page.waitForFunction(() => document.querySelector('.qr-emv-sum'), null, { timeout: 15000 });
  expect((await page.textContent('.qr-emv-sum')).includes('0812345678'), 'PromptPay number');
  expect((await page.textContent('.qr-emv-head')).includes('CRC ถูกต้อง'), 'CRC');
  noErrors(page);
});
await check('offline: after one online visit every library still loads', async () => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => logs.push('failed: ' + r.url().slice(0, 90) + ' ' + (r.failure() || {}).errorText));
  await page.goto(BASE);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  // every library the page can load lazily is in the service worker's CDN cache
  await page.waitForFunction(async () => {
    const c = await caches.open('esan-devtools-cdn');
    return (await Promise.all(Object.values(LIBS).flat().map(p => c.match(libUrl(p))))).every(Boolean);
  }, null, { timeout: 60000, polling: 500 });
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(600);
  for (const t of ['rxjs-tab', 'k8sref-tab', 'compare-tab']) { await page.evaluate(async id => { openTab(null, id); await whenTab(id); }, t); await page.waitForTimeout(700); }
  const libs = await page.evaluate(() => ({ hljs: !!window.hljs, codemirror: !!window.CodeMirror, rxjs: !!window.rxjs, diff: !!window.Diff }));
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  expect(Object.values(libs).every(Boolean), `missing offline: ${JSON.stringify(libs)} controlled=${controlled}\n${logs.slice(-8).join('\n')}`);
  await ctx.close();
});

await browser.close();
server.close();
console.log(`\n${passed} passed, ${failures.length} failed${failures.length ? ': ' + failures.join('; ') : ''}`);
process.exitCode = failures.length ? 1 : 0;
