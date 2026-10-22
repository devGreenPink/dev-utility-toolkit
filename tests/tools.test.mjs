// Self-checks for the pure parsers / converters in assets/js/tools. Run: node tests/tools.test.mjs
// The tool files are classic browser scripts, so they're loaded into one vm context like <script defer> tags.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto'; // global `crypto` only from Node 19

const root = fileURLToPath(new URL('..', import.meta.url));
const ctx = vm.createContext({ console, Intl, BigInt, atob, btoa, TextDecoder, TextEncoder, URLSearchParams, setTimeout, clearTimeout, crypto: webcrypto,
  debounced: f => f }); // core.js is not loaded; jwt.js wires its encoder with it at load
for (const f of ['refdocs', 'db2-errors', 'java-exceptions', 'java-internals', 'thai-tools', 'json2type', 'props-yaml', 'stacktrace', 'home', 'k8s-ref', 'jenkins', 'gateway', 'qr', 'cron', 'sql-ref', 'ngrx', 'http-status', 'cheatsheets', 'angular', 'mock-data', 'lov', 'changelog', 'jwt']) {
  vm.runInContext(readFileSync(`${root}assets/js/tools/${f}.js`, 'utf8'), ctx, { filename: f + '.js' });
}
// JSON round-trip brings values into this realm so deepEqual compares structure, not prototypes
const run = code => { const v = vm.runInContext(code, ctx); return v !== null && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v; };
let passed = 0;
const t = (name, fn) => { try { fn(); passed++; } catch (e) { console.error('FAIL', name, '\n ', e.message); process.exitCode = 1; } };

// ── BAHTTEXT ──
const baht = {
  0: 'ศูนย์บาทถ้วน', 1: 'หนึ่งบาทถ้วน', 10: 'สิบบาทถ้วน', 11: 'สิบเอ็ดบาทถ้วน', 20: 'ยี่สิบบาทถ้วน',
  21: 'ยี่สิบเอ็ดบาทถ้วน', 101: 'หนึ่งร้อยเอ็ดบาทถ้วน', 110: 'หนึ่งร้อยสิบบาทถ้วน',
  '1250.75': 'หนึ่งพันสองร้อยห้าสิบบาทเจ็ดสิบห้าสตางค์', '0.5': 'ห้าสิบสตางค์', '12.01': 'สิบสองบาทหนึ่งสตางค์',
  1000000: 'หนึ่งล้านบาทถ้วน', 1000001: 'หนึ่งล้านเอ็ดบาทถ้วน', 21000000: 'ยี่สิบเอ็ดล้านบาทถ้วน',
  '99.995': 'หนึ่งร้อยบาทถ้วน', '1,234,567.89': 'หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์',
  '-5': 'ลบห้าบาทถ้วน', '-0': 'ศูนย์บาทถ้วน',
};
for (const [n, want] of Object.entries(baht)) t(`bahtText(${n})`, () => assert.equal(run(`bahtText(${JSON.stringify(n)})`), want));
t('bahtText rejects text', () => assert.throws(() => run(`bahtText('12a')`)));

// ── Thai 13-digit ID ──
t('thai ID: generated IDs validate, a changed check digit fails', () => {
  for (let i = 0; i < 200; i++) {
    const id = run(`thaiIdRandom(${i % 2 ? "'0'" : 'null'})`);
    assert.equal(run(`thaiIdInfo('${id}').ok`), true, id);
    const bad = id.slice(0, 12) + ((+id[12] + 1) % 10);
    assert.equal(run(`thaiIdInfo('${bad}').ok`), false, bad);
  }
});
t('thai ID: formatting, type and length check', () => {
  const r = run(`thaiIdInfo('0105556000013')`);
  assert.equal(r.formatted, '0-1055-56000-01-3');
  assert.match(r.type, /นิติบุคคล/);
  assert.match(run(`thaiIdInfo('123').reason`), /13 หลัก/);
});

// ── JSON → Type ──
const sample = run('J2T_SAMPLE');
t('json2type: TypeScript', () => {
  const ts = run(`j2tGenerate(${JSON.stringify(sample)}, {lang:'ts'})`);
  assert.match(ts, /^export interface Root \{/);
  assert.match(ts, /citizen_id: string;/);
  assert.match(ts, /address: Address;/);
  assert.match(ts, /orders: Order\[\];/);
  assert.match(ts, /amount: number;/);
  assert.match(ts, /paidAt: string \| null;/);
  assert.match(ts, /note\?: string;/);
});
t('json2type: Java record', () => {
  const java = run(`j2tGenerate(${JSON.stringify(sample)}, {lang:'java', bigDecimal:true})`);
  assert.match(java, /import com\.fasterxml\.jackson\.annotation\.JsonProperty;/);
  assert.match(java, /import java\.time\.LocalDate;/);
  assert.match(java, /public record Root\(/);
  assert.match(java, /@JsonProperty\("citizen_id"\) String citizenId/);
  assert.match(java, /LocalDate birthDate/);
  assert.match(java, /BigDecimal amount/);           // 1200 and 850.75 merge to a decimal
  assert.match(java, /LocalDateTime paidAt/);
  assert.match(java, /List<Order> orders/);
});
t('json2type: identical shapes reuse one type', () => {
  const ts = run(`j2tGenerate('{"home":{"zip":"1"},"work":{"zip":"2"}}', {lang:'ts'})`);
  assert.equal((ts.match(/export interface/g) || []).length, 2);
  assert.match(ts, /work: Home;/);
});
t('json2type: invalid JSON throws', () => assert.throws(() => run(`j2tGenerate('{bad', {})`)));

// ── properties ↔ YAML ──
const props = run('PY_SAMPLE');
t('props → yaml keeps profiles, quoted keys and the ~ value', () => {
  const y = run(`pyPropsToYaml(${JSON.stringify(props)})`);
  assert.match(y, /^"%dev":$/m);
  assert.match(y, /^ {4}cors:\n {6}~: true\n {6}origins: /m);
  assert.match(y, /report-api:\n {6}url: /);
});
t('props → yaml → props round-trips', () => {
  const norm = list => Object.fromEntries(list.map(([k, v]) => [k.replace(/"([^".]*)"/g, '$1'), v]));
  const back = run(`pyParseProps(pyYamlToProps(pyPropsToYaml(${JSON.stringify(props)})))`);
  assert.deepEqual(norm(back), norm(run(`pyParseProps(${JSON.stringify(props)})`)));
});
t('yaml → props: lists, list of maps, block scalar, comments', () => {
  const yaml = 'a:\n  - x\n  - y   # note\nb:\n  - name: n1\n    url: u1\n  - name: n2\nmsg: |\n  line1\n  line2\nflow: [p, q]\n';
  const out = run(`pyYamlToProps(${JSON.stringify(yaml)})`);
  assert.match(out, /^a=x,y$/m);
  assert.match(out, /^b\[0\]\.name=n1$/m);
  assert.match(out, /^b\[0\]\.url=u1$/m);
  assert.match(out, /^b\[1\]\.name=n2$/m);
  assert.match(out, /^msg=line1\\nline2$/m);
  assert.match(out, /^flow=p,q$/m);
});
t('properties: continuation lines and escapes', () => {
  const r = run(`pyParseProps('a=one\\\\\\n  two\\nb\\\\ c=d\\nu=\\\\u0e01')`);
  assert.deepEqual(r, [['a', 'onetwo'], ['b c', 'd'], ['u', 'ก']]);
});

// ── stack trace ──
t('stacktrace: sample chain and root cause', () => {
  const c = run('stParse(ST_SAMPLE).chain');
  assert.equal(c.length, 3);
  assert.equal(c[0].type, 'jakarta.persistence.PersistenceException');
  assert.equal(c[2].type, 'com.ibm.db2.jcc.am.SqlIntegrityConstraintViolationException');
  assert.equal(c[1].more, 42);
  assert.equal(run('stGuessApp(stParse(ST_SAMPLE).chain)'), 'com.example.shop.');
  assert.equal(run('stFindDb2(ST_SAMPLE).b'), '-803');
});
t('stacktrace: package-aware reference lookup', () => {
  assert.match(run(`stFindRef('org.hibernate.exception.ConstraintViolationException').t`), /PersistenceException/);
  assert.equal(run(`stFindRef('jakarta.validation.ConstraintViolationException').s`), 'jakarta.validation');
  assert.equal(run(`stFindRef('java.lang.NullPointerException').t`), 'NullPointerException');
});
t('stacktrace: plain trace, module prefixes, suppressed frames', () => {
  const text = 'Exception in thread "main" java.lang.IllegalStateException: boom\n'
    + '\tat app//com.acme.App.run(App.java:12)\n\tat java.base/java.lang.Thread.run(Thread.java:1583)\n'
    + '\tSuppressed: java.io.IOException: close failed\n\t\tat com.acme.Res.close(Res.java:3)\n'
    + 'Caused by: java.lang.NullPointerException: Cannot invoke "String.length()" because "s" is null\n\tat com.acme.App.len(App.java:30)\n';
  const c = run(`stParse(${JSON.stringify(text)}).chain`);
  assert.equal(c.length, 2);
  assert.deepEqual(c[0].frames.map(f => f.cls), ['com.acme.App', 'java.lang.Thread']);
  assert.equal(c[0].frames[0].line, 12);
  assert.equal(c[1].type, 'java.lang.NullPointerException');
  assert.deepEqual(c[1].frames.map(f => f.method), ['len']);
});

// ── SMART PASTE (home) ── first guess per pasted text; '' = nothing detected
const smart = {
  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc': 'jwt',
  'Exception in thread "main" java.lang.IllegalStateException: boom\n\tat com.acme.App.run(App.java:12)': 'stacktrace',
  'apiVersion: v1\nkind: Secret\ndata:\n  a: YWJj': 'k8s-secret',
  'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: x': 'k8s-yaml',
  '{"a": [1, 2]}': 'json',
  'sb.append("SELECT * FROM T WHERE ID = ?");': 'sql-java',
  'select * from t': 'sql',
  'SQLCODE=-803, SQLSTATE=23505': 'db2code',
  '-805': 'db2code',
  'java.lang.NullPointerException': 'exception',
  'quarkus.http.port=8080\n%dev.quarkus.log.level=DEBUG': 'props',
  'quarkus:\n  http:\n    port: 8080': 'yaml',
  '1-2345-67890-12-1': 'thai-id',
  '1700000000': 'unix',
  '1700000000000': 'unix',
  '12/10/2569': 'be-date',
  '1,234.50': 'amount',
  '*/5 * * * *': 'cron',
  '0 0 12 * * ?': 'cron',
  '#ff8800': 'color',
  '404': 'http',
  'a%20b%E0%B8%81': 'url-enc',
  'SGVsbG8gV29ybGQ=': 'base64',
  'pipeline {\n  agent any\n  stages {\n    stage(\'Build\') { steps { sh \'mvn package\' } }\n  }\n}': 'jenkinsfile',
  "@Library('shop-lib@main') _\nbuildQuarkus(app: 'order-api')": 'jenkinsfile',
  'FROM eclipse-temurin:21-jre\nCOPY target/quarkus-app/ /app/\nENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]': 'dockerfile',
  'password': '', 'kubectl': '', 'hello world': '', '': '', '{not json': '',
};
for (const [text, want] of Object.entries(smart)) t(`spDetect(${JSON.stringify(text).slice(0, 40)})`, () => assert.equal(run(`(spDetect(${JSON.stringify(text)})[0]||{}).kind||''`), want));
t('spDetect: JSON also offers JSON → Type, an ID with a bad check digit is not an ID', () => {
  assert.deepEqual(run(`spDetect('{"a":1}').map(d=>d.kind)`), ['json', 'json2type']);
  assert.ok(!run(`spDetect('1234567890122').map(d=>d.kind)`).includes('thai-id'));
});

// ── LINE EXPLORER DATA ── every annotated file is well formed and explains something
t('explorer files: unique ids, a group, [code, note] lines, at least one note', () => {
  for (const name of ['K8S_MANIFESTS', 'JK_FILES']) {
    const files = run(name);
    assert.ok(files.length > 5, name);
    assert.equal(new Set(files.map(f => f.id)).size, files.length, name + ' ids');
    for (const f of files) {
      assert.ok(f.g && f.label && f.lang && f.intro, f.id);
      assert.ok(f.lines.every(l => Array.isArray(l) && l.length === 2 && typeof l[0] === 'string' && typeof l[1] === 'string'), f.id);
      assert.ok(f.lines.some(l => l[1]), f.id + ' has no note');
    }
  }
});
t('flow nodes and reference cards have what the renderers read', () => {
  for (const name of ['JK_FLOW', 'GW_NODES']) for (const n of run(name)) assert.ok(n.id && n.icon && n.t && n.d && n.err.length, name + ' ' + n.id);
  for (const id of ['k8s', 'jenkins', 'gateway']) for (const it of run(`REF_DOCS.${id}.items`)) assert.ok(it.g && it.t, id + ' ' + it.t);
});

// ── SHARE LINK / FILE DROP (home) ──
t('share link: base64url round-trips Thai and symbols', () => {
  const text = 'สวัสดี {"a":1} +/= ' + 'ก'.repeat(50);
  assert.equal(run(`b64uDecode(b64uEncode(${JSON.stringify(text)}))`), text);
  assert.ok(!/[+/=]/.test(run(`b64uEncode(${JSON.stringify(text)})`)));
});
t('share link: parse keeps only well-formed parts', () => {
  const st = { f: { 'b64-input': 'x', 'bad key!': 'y', n: 5 }, c: { 'b64-urlsafe': true, x: 'no' }, t: { 'b64-mode': 1, y: -1 }, x: { 'k8s-explorer': 'deploy' } };
  const hash = '#t=base64-tab&s=' + run(`b64uEncode(${JSON.stringify(JSON.stringify(st))})`);
  assert.deepEqual(run(`shareParse(${JSON.stringify(hash)})`), {
    tab: 'base64-tab', st: { f: { 'b64-input': 'x' }, c: { 'b64-urlsafe': true }, r: {}, t: { 'b64-mode': 1 }, x: { 'k8s-explorer': 'deploy' } } });
  assert.equal(run(`shareParse('#t=<img onerror=x>-tab')`), null);
  assert.equal(run(`shareParse('')`), null);
  assert.deepEqual(run(`shareParse('#t=jwt-tab&s=%%%').st.f`), {});
  // the decompressed JSON of a `z` link is handed in by applyShareLink
  assert.deepEqual(run(`shareParse('#t=url-tab&z=xx', '{"f":{"url-input":"a b"}}').st.f`), { 'url-input': 'a b' });
  assert.deepEqual(run(`shareParse('#t=url-tab&z=xx', '').st.f`), {});
});
t('file drop: the file name decides before the content', () => {
  const kinds = (name, text) => run(`spDetectFile(${JSON.stringify(name)}, ${JSON.stringify(text)}).map(d => d.kind)`);
  assert.equal(kinds('Dockerfile', 'FROM nginx:1.27\nCOPY . /app')[0], 'dockerfile');
  assert.equal(kinds('Jenkinsfile', "@Library('lib') _\nbuild()")[0], 'jenkinsfile');
  assert.equal(kinds('application.properties', 'quarkus.http.port=8080')[0], 'props');
  assert.equal(kinds('report.sql', 'select 1 from sysibm.sysdummy1')[0], 'sql');
  assert.equal(kinds('data.json', '{"a":1}')[0], 'json');
  assert.equal(kinds('server.log', 'Exception in thread "main" java.lang.IllegalStateException: x\n\tat a.B.c(B.java:1)')[0], 'stacktrace');
  assert.deepEqual(kinds('notes.txt', 'hello world'), []);
});

// ── CURL / HAR / XML ──
t('curl: quotes, continuations, headers and body', () => {
  const cmd = "curl -X POST 'https://shop.example.com/order-api/orders?page=2&q=a%20b' \\\n  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc' \\\n  -H \"Content-Type: application/json\" \\\n  --data-raw '{\"sku\":\"A-1\",\"qty\":2}'";
  const c = run(`spCurl(${JSON.stringify(cmd)})`);
  assert.equal(c.method, 'POST');
  assert.equal(c.url, 'https://shop.example.com/order-api/orders?page=2&q=a%20b');
  assert.equal(c.headers['content-type'], 'application/json');
  assert.equal(c.body, '{"sku":"A-1","qty":2}');
  assert.equal(c.bearer, 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.abc');
  assert.deepEqual(run(`spDetect(${JSON.stringify(cmd)}).map(d => d.kind)`), ['curl-jwt', 'curl-body', 'curl-url']);
  assert.equal(run(`spCurl('curl https://x.example.com/a').method`), 'GET');
  assert.equal(run(`spCurl('wget https://x')`), null);
});
t('HAR: detected before plain JSON, failures and slowest calls', () => {
  const har = JSON.stringify({ log: { entries: [
    { request: { method: 'GET', url: 'https://x/api/a' }, response: { status: 200 }, time: 120 },
    { request: { method: 'POST', url: 'https://x/api/b' }, response: { status: 500 }, time: 900 },
    { request: { method: 'GET', url: 'https://x/api/c' }, response: { status: 0 }, time: 30 } ] } });
  assert.equal(run(`spDetect(${JSON.stringify(har)})[0].kind`), 'har');
  const s = run(`harSummary(${JSON.stringify(har)})`);
  assert.equal(s.count, 3);
  assert.deepEqual(s.failed.map(r => r.status), [500, 0]);
  assert.equal(s.slow[0].url, 'https://x/api/b');
});
t('XML: recognised, MyBatis mapper still goes to the SQL parser', () => {
  assert.equal(run(`spDetect('<?xml version="1.0"?>\\n<order id="1"><item>A</item></order>')[0].kind`), 'xml');
  assert.equal(run(`spDetect('<note><to>A</to></note>')[0].kind`), 'xml');
  assert.equal(run(`spDetect('<select id="find">SELECT * FROM T WHERE ID = #{id}</select>')[0].kind`), 'sql-java');
});

// ── QR (EMVCo / PromptPay) ──
t('crc16: CRC-16/CCITT-FALSE check value', () => assert.equal(run(`crc16('123456789')`), '29B1'));
t('PromptPay QR: fields, phone number, amount and CRC', () => {
  const body = '000201010212' + '2937' + '0016A000000677010111' + '01130066812345678' + '5802TH' + '5303764' + '540550.00' + '6304';
  const qr = body + run(`crc16(${JSON.stringify(body)})`);
  const info = run(`emvInfo(${JSON.stringify(qr)})`);
  assert.equal(info.kind, 'PromptPay');
  assert.equal(info.crcOk, true);
  assert.deepEqual(info.target, { name: 'เบอร์มือถือ', value: '0812345678' });
  assert.equal(info.amount, '50.00');
  const tampered = qr.replace('540550.00', '540599.00');
  assert.equal(run(`emvInfo(${JSON.stringify(tampered)}).crcOk`), false);
  assert.equal(run(`emvInfo('https://shop.example.com')`), null);
  assert.equal(run(`emvParse('0002ABC')`), null);
});
t('barcode: GS1 check digit and format names', () => {
  for (const ok of ['4006381333931', '96385074', '036000291452', '8851234567898']) assert.equal(run(`gtinCheck('${ok}')`), true, ok);
  assert.equal(run(`gtinCheck('4006381333932')`), false);
  for (const no of ['12345', 'ABC12345', '']) assert.equal(run(`gtinCheck('${no}')`), null, no);
  assert.equal(run(`codeName('ean_13')`), 'EAN-13');        // BarcodeDetector
  assert.equal(run(`codeName('CODE_128')`), 'Code 128');    // ZXing
  assert.equal(run(`codeName('PDF_417')`), 'PDF417');
  assert.equal(run(`codeName('something_new')`), 'something_new');
});
t('barcode: Thai bill payment fields, amount from satang, tax ID check', () => {
  const bill = s => run(`billInfo(${JSON.stringify(s)})`);
  const b = bill('|010556123456000\rINV2026001\r0812345678\r150050'); // made-up tax ID with a valid check digit
  assert.deepEqual(b, { taxId: '0105561234560', suffix: '00', ref1: 'INV2026001', ref2: '0812345678', satang: '150050', amount: '1,500.50', taxOk: true });
  assert.equal(bill('|010556123456000\rINV1\r\r0').amount, '');           // 0 = the payer types the amount
  assert.equal(bill('|010556123456000\rINV1\r\r0').ref2, '');
  assert.equal(bill('|010556123456000\nINV1\nX\n100\n').amount, '1.00'); // LF and a trailing break too
  assert.equal(bill('|010556123456100\rINV1\rX\r100').taxOk, false);
  for (const no of ['8851234567898', '|0105561234560\rINV1\rX\r100', 'hello']) assert.equal(bill(no), null, no);
});
t('barcode: UTF-8 bytes read as Latin-1 are repaired, other text is left alone', () => {
  const utf8 = Buffer.from('SHOP-42 ข้อมูล', 'utf8');
  for (const enc of ['latin1', 'windows-1252']) { // browsers decode "iso-8859-1" as windows-1252: 0x82 is ‚ (U+201A)
    const wrong = enc === 'latin1' ? utf8.toString('latin1') : new TextDecoder('windows-1252').decode(utf8);
    assert.equal(run(`qrUtf8(${JSON.stringify(wrong)})`), 'SHOP-42 ข้อมูล', enc);
  }
  for (const keep of ['café', 'ข้อมูล', '“quoted” €5', 'ORDER 42', '']) assert.equal(run(`qrUtf8(${JSON.stringify(keep)})`), keep, keep);
});


// ── DIAGRAMS (refdocs dgShow data) ── well formed, and every q finds at least one card of its own tab
t('diagrams: kinds, parts and card links', () => {
  const bad = run(`(() => {
    const out = [], kinds = ['tree', 'boxes', 'timeline', 'anatomy', 'flow', 'venn'];
    const sources = Object.entries(REF_DOCS).map(([id, doc]) => [id, doc, doc.diagrams || []])
      .concat([['http', null, HTTP_DIAGRAMS], ['git', null, GIT_DIAGRAMS], ['cron', null, CRON_DIAGRAMS], ['angular', null, NG_DIAGRAMS]]);
    for (const [id, doc, list] of sources) for (const d of list) {
      const where = id + '/' + d.id, parts = [];
      if (!kinds.includes(d.kind) || !d.t || !d.intro) out.push(where + ': kind / t / intro');
      const walk = n => { parts.push(n); (n.kids || []).forEach(walk); };
      if (d.kind === 'tree' || d.kind === 'boxes') walk(d.root);
      if (d.kind === 'timeline') {
        d.lanes.forEach(l => l.bars.forEach(b => { parts.push(b); if (!(b.from >= 0 && b.to <= 100 && b.from < b.to)) out.push(where + ': bar ' + b.t); }));
        (d.marks || []).forEach(m => { parts.push(m); if (!(m.at >= 0 && m.at <= 100)) out.push(where + ': mark ' + m.t); });
      }
      if (d.kind === 'anatomy') d.lines.forEach(l => l.forEach(([t, note, tone, q]) => parts.push({ t, note, q })));
      if (d.kind === 'flow') d.nodes.forEach(n => { if (!n.d || !n.err || !n.err.length || !n.icon) out.push(where + ': node ' + n.id); });
      if (d.kind === 'venn') d.cases.forEach(c => { parts.push(c); if (!['inner', 'left', 'right', 'all', 'leftonly'].includes(c.shade)) out.push(where + ': shade ' + c.t); });
      for (const p of parts) {
        if (!p.t) out.push(where + ': part without t');
        if (p.q && doc) { const w = p.q.toLowerCase().split(/\\s+/); if (!doc.items.some(it => w.every(x => refHay(it).includes(x)))) out.push(where + ': q "' + p.q + '" finds no card'); }
      }
    }
    return out;
  })()`);
  assert.deepEqual(bad, []);
});

t('diagrams: every exception class with a card has a place in the Java Exceptions tree', () => {
  const missing = run(`(() => {
    const names = [], walk = n => { names.push(n.t); (n.kids || []).forEach(walk); };
    walk(REF_DOCS.javaex.diagrams.find(d => d.id === 'tree').root);
    const all = names.join(' | ');
    return [...new Set(REF_DOCS.javaex.items.flatMap(it => it.t.match(/[A-Z][A-Za-z0-9]*(?:Exception|Error)\\b/g) || []))]
      .filter(c => !new RegExp('\\\\b' + c + '\\\\b').test(all));
  })()`);
  assert.deepEqual(missing, []);
});

// ── CRON ── next runs in a fixed zone from a fixed instant; conversion for Spring / Quartz
const runs = (expr, n = 3) => run(`cronNextRuns(${JSON.stringify(expr)}, ${n}, new Date('2025-12-31T23:59:00Z'), 'UTC').map(d => d.toISOString().slice(0, 16))`);
t('cron: steps count from the field start', () => {
  assert.deepEqual(runs('0 0 1 */3 *'), ['2026-01-01T00:00', '2026-04-01T00:00', '2026-07-01T00:00']);
  assert.deepEqual(runs('0 0 */10 1 *'), ['2026-01-01T00:00', '2026-01-11T00:00', '2026-01-21T00:00']);
  assert.deepEqual(runs('*/20 9 * * *'), ['2026-01-01T09:00', '2026-01-01T09:20', '2026-01-01T09:40']);
});
t('cron: weekdays, names, 7 = Sunday, ranges with step', () => {
  // 2026-01-01 is a Thursday
  assert.deepEqual(runs('0 8 * * 1-5'), ['2026-01-01T08:00', '2026-01-02T08:00', '2026-01-05T08:00']);
  assert.deepEqual(runs('0 8 * * MON-FRI'), runs('0 8 * * 1-5'));
  assert.deepEqual(runs('0 0 * * 7', 1), runs('0 0 * * 0', 1));
  assert.deepEqual(runs('0 0 * JAN-MAR/2 SUN', 2), ['2026-01-04T00:00', '2026-01-11T00:00']);
});
t('cron: day of month OR day of week when both are set, L = last day', () => {
  // the 15th or any Monday
  assert.deepEqual(runs('0 0 15 * 1'), ['2026-01-05T00:00', '2026-01-12T00:00', '2026-01-15T00:00']);
  assert.deepEqual(runs('0 0 L * *'), ['2026-01-31T00:00', '2026-02-28T00:00', '2026-03-31T00:00']);
  assert.deepEqual(runs('0 0 29 2 *', 1), ['2028-02-29T00:00']);
});
t('cron: time zone and malformed input', () => {
  // 09:00 in Bangkok = 02:00 UTC; the result reads as Bangkok wall clock
  assert.deepEqual(run(`cronNextRuns('0 9 * * *', 1, new Date('2026-01-01T00:00:00Z'), 'Asia/Bangkok').map(d => d.toISOString().slice(0, 16))`), ['2026-01-01T09:00']);
  for (const bad of ['* * *', '60 * * * *', '0 24 * * *', '0 0 0 * *', '0 0 * 13 *', '0 0 * * 8', '*/0 * * * *', 'x * * * *']) assert.deepEqual(run(`cronNextRuns(${JSON.stringify(bad)})`), [], bad);
});
t('cron: Quartz keeps a seconds field, weekday names and one ?', () => {
  assert.deepEqual(run(`cronToQuartz('0 8 * * 1-5')`), { expr: '0 0 8 ? * MON-FRI', dropped: false });
  assert.deepEqual(run(`cronToQuartz('30 6 * * 0,6')`), { expr: '0 30 6 ? * SUN,SAT', dropped: false });
  assert.deepEqual(run(`cronToQuartz('0 0 1 * *')`), { expr: '0 0 0 1 * ?', dropped: false });
  assert.deepEqual(run(`cronToQuartz('0 0 15 * 1')`), { expr: '0 0 0 15 * ?', dropped: true });
  assert.equal(run(`cronToQuartz('bad')`), null);
});

// ── LOV (.lov.json) ── what the editor writes into the repo
t('lov: parameters from SQL, `:{{ name | Type }}` shorthand and `::cast`', () => {
  assert.deepEqual(run(`lovFindParameter("a = :{{ x | Long }} and b = :y and c::int and d = :user.name")`), {
    sql: 'a = :x and b = :y and c::int and d = :user.name',
    parameter: { x: { type: 'Long' }, y: { type: 'Any' }, 'user.name': { type: 'Any' } },
  });
});
t('lov: paste SQL → LOV parts', () => {
  const sql = `-- list users
SELECT DISTINCT U.USER_ID, U.USER_NAME AS userName, TO_CHAR(U.CREATE_DATE, 'YYYY') "FY", U.CREATE_DATE
FROM USERS U /* main */ JOIN ORG O ON O.ID = U.ORG_ID
WHERE U.ORG_ID = :{{ orgId | Long }} AND U.D > CAST(:since AS DATE)
GROUP BY U.USER_ID HAVING COUNT(*) > 1
ORDER BY 2 DESC, O.NAME;`;
  const l = run(`lovTransformLov(${JSON.stringify(sql)}, 'v8')`);
  assert.equal(l.distinct, true);
  assert.deepEqual(Object.keys(l.select), ['userId', 'userName', 'FY', 'createDate']);
  assert.deepEqual([l.select.userId.type, l.select.userId.filter], ['Long', 'String.Equal']);
  assert.deepEqual([l.select.createDate.type, l.select.FY.sql], ['Date', "TO_CHAR(U.CREATE_DATE, 'YYYY')"]);
  // ORDER BY 2 lands on the second column, an expression that is no column becomes a query-level order
  assert.deepEqual(l.select.userName.order, { type: 'DESC', use: 'auto', prio: 100 });
  assert.deepEqual(l.order, { order2: { sql: 'O.NAME', type: 'ASC', use: 'auto', prio: 101 } });
  assert.match(l.from, /^USERS U\s+JOIN ORG O ON O\.ID = U\.ORG_ID$/);
  assert.equal(l.where.main, 'U.ORG_ID = :orgId AND U.D > CAST(:since AS DATE)');
  assert.equal(l.groupByAndHaving, 'GROUP BY U.USER_ID\nHAVING COUNT(*) > 1');
  assert.deepEqual(l.parameter, { orgId: { type: 'Long' }, since: { type: 'Any' } });
});
t('lov: version and file name', () => {
  assert.deepEqual(run(`[lovFileFormat({select:{a:{order:{piority:1,use:'auto'}}}}), lovFileFormat({order:{o:{priority:1,use:'AUTO'}}}), lovFileFormat({publicApi:false}), lovFileFormat({id:'x'})]`), ['v8', 'v10', 'v10', null]);
  assert.equal(run(`lovIdToFileName('getFooBar', 'v8')`), 'get.foo.bar.lov.json');
  assert.equal(run(`lovIdToFileName('getFooBar', 'v10')`), 'getFooBar.lov.json');
});
t('lov: an untouched file saves back byte for byte, search covers the SQL', () => {
  const json = {
    id: 'getOrders', description: 'คำสั่งซื้อ "ล่าสุด"', type: 'SimpleLovContainer', autoDeclare: true, unitName: 'dlpw', custom: [1, 'a'],
    select: { orderId: { order: { type: 'ASC', use: 'optional', piority: 100 }, sql: 'O.ORDER_ID', type: 'Long', search: false, filter: 'String.Equal' } },
    from: 'ORDERS O', where: { main: 'O.SHOP = :shop', alternate: { byNo: { sql: 'O.NO = :no', parameter: { no: { type: 'String' } } } } },
    groupByAndHaving: null, order: { latest: { sql: 'O.CREATED', type: 'DESC', use: 'auto', piority: 1 } }, parameter: { shop: { type: 'Long' } },
  };
  const raw = run(`lovJacksonStringify(${JSON.stringify(json)}, '\\r\\n')`) + '\r\n';
  const e = run(`(() => { const e = lovMakeEntry('get.orders.lov.json', null, ${JSON.stringify(raw)}, 0); return { designerFormat: e.designerFormat, eol: e.eol, search: e.search }; })()`);
  assert.deepEqual([e.designerFormat, e.eol], [true, '\r\n']);
  assert.ok(e.search.includes('orders o') && e.search.includes('o.no = :no'), 'table and alternate SQL are searchable');
  assert.deepEqual(run(`lovJsonFromModel(lovModelFromJson(${JSON.stringify(json)}, 'v8'))`), json);
});
t('lov: params follow the SQL but declared ones are only removed by hand', () => {
  const list = run(`lovSyncParams([{ name: 'kept', orig: { type: 'Long' }, type: 'Long' }, { name: 'stale', orig: {}, type: 'Any' }], ['a = :{{ added | Date }} and b = :user.name'])`);
  assert.deepEqual(list.map(p => `${p.name}:${p.type}`), ['kept:Long', 'added:Date']);
});
t('lov: mock response fills columns from Mock Data Generator people', () => {
  const json = { select: {
    userId: { type: 'Long' }, USER_NAME: { type: 'String' }, firstName: {}, lastName: {}, email: { type: 'String' }, mobileNo: { type: 'String' },
    citizenId: { type: 'String' }, birthDate: { type: 'Date' }, dob: { type: 'String' }, age: { type: 'Integer' }, provinceName: { type: 'String' },
    zipCode: { type: 'String' }, salary: { type: 'BigDecimal' }, createDate: { type: 'Date' }, amount: { type: 'BigDecimal' },
    total: { type: 'Long' }, active: { type: 'Boolean' }, remark: { type: 'String' },
  } };
  const p = { id: '1101700230708', name: 'มิกซ์ อินฟินิตลูป', nickname: 'n', gender: 'ชาย', phone: '081-234-5678', email: 'a.b1@devmail.io', uuid: 'u-1',
    dob: '14/03/2533', dobIso: '1990-03-14', age: 36, province: 'ขอนแก่น', zip: '40000', company: 'บริษัท ไทยเดฟ จำกัด', juristicId: '0-1055-56000-01-3', job: 'Tech Lead', salary: 45000 };
  const code = `lovMockResponse(${JSON.stringify(json)}, ${JSON.stringify([p, { ...p, uuid: 'u-2' }])})`;
  const res = run(code);
  assert.deepEqual(res.paginator, { offset: 0, limit: 2, count: 2 });
  const [a, b] = res.results;
  assert.deepEqual(Object.keys(a), Object.keys(json.select));
  assert.deepEqual([a.userId, b.userId], [1, 2]);
  assert.deepEqual([a.USER_NAME, a.firstName, a.lastName], ['มิกซ์ อินฟินิตลูป', 'มิกซ์', 'อินฟินิตลูป']);
  assert.deepEqual([a.email, a.mobileNo, a.citizenId, a.provinceName, a.zipCode], [p.email, p.phone, p.id, p.province, p.zip]);
  assert.deepEqual([a.birthDate, a.dob, a.age, a.salary], ['1990-03-14T00:00:00.000+07:00', '14/03/2533', 36, 45000]);
  // no matching field: by type, the same for the same person on every call
  assert.match(a.createDate, /^\d{4}-\d{2}-\d{2}T00:00:00\.000\+07:00$/);
  assert.ok(Number.isInteger(a.total) && a.total >= 1 && a.total <= 1000);
  assert.ok(typeof a.amount === 'number' && Math.round(a.amount * 100) === a.amount * 100);
  assert.equal(typeof a.active, 'boolean');
  assert.deepEqual([a.remark, b.remark], ['remark-1', 'remark-2']);
  assert.deepEqual(run(code), res);
});
t('lov: every mock field the columns map to exists in genOneMock()', () => {
  assert.deepEqual(run(`(() => { const p = genOneMock(); return LOV_MOCK_FIELDS.map(f => f[1]).filter(f => !['firstName', 'lastName'].includes(f) && !(f in p)); })()`), []);
  const rows = run(`lovMockResponse({ select: { email: {}, birthDate: { type: 'Date' } } }, lovMockPeople(3)).results`);
  assert.equal(rows.length, 3);
  rows.forEach(r => { assert.match(r.email, /@/); assert.match(r.birthDate, /^\d{4}-\d{2}-\d{2}T/); });
});
t('lov: a save runs the syncs still waiting, opening another file drops them', () => {
  assert.deepEqual(run(`(() => { const hits = []; lovLater('a', () => hits.push('a1')); lovLater('b', () => hits.push('b')); lovLater('a', () => hits.push('a2')); lovFlushLater(true); return [hits, Object.keys(_lovTimers).length]; })()`), [['a2', 'b'], 0]);
  assert.deepEqual(run(`(() => { const hits = []; lovLater('a', () => hits.push('a')); lovFlushLater(false); return [hits, Object.keys(_lovTimers).length]; })()`), [[], 0]);
});

// ── JWT COMPARE ── one box per token, one row per claim; baseline = first token that decoded
const jwt = (h, p, sig = 'sig') => [h, p].map(o => Buffer.from(JSON.stringify(o)).toString('base64url')).join('.') + '.' + sig;
const cmp = (...boxes) => run(`jwtCompare(${JSON.stringify(boxes)})`);
const row = (r, key) => r.rows.find(x => x.path.join('.') === key);
t('jwt compare: identical tokens; Bearer, line breaks and empty boxes ignored, box numbers kept', () => {
  const a = jwt({ alg: 'HS256' }, { sub: 'somchai', role: 'admin' });
  const r = cmp('Bearer ' + a, '', '  ' + a.slice(0, 20) + '\n' + a.slice(20) + '\n');
  assert.deepEqual(r.cols.map(c => c.n), [1, 3]);
  assert.equal(r.base, 0);
  assert.deepEqual(r.rows.map(x => x.path.join('.')), ['header.alg', 'payload.sub', 'payload.role', 'signature']);
  assert.ok(r.rows.every(x => x.same && !x.diff.some(Boolean)));
});
t('jwt compare: changed, missing, null, 1 vs "1", nested objects, arrays as one value', () => {
  const r = cmp(
    jwt({ alg: 'HS256' }, { role: 'admin', n: 1, x: null, ra: { roles: ['a', 'b'] }, e: {} }),
    jwt({ alg: 'HS256' }, { role: 'user', n: '1', ra: { roles: ['a', 'b'] }, e: {}, extra: true }),
    jwt({ alg: 'RS256' }, { role: 'admin', n: 1, x: null, ra: { roles: ['b', 'a'] }, e: {} }, 'sig'));
  assert.deepEqual(row(r, 'payload.role').diff, [false, true, false]);
  assert.deepEqual(row(r, 'payload.n').vals, ['1', '"1"', '1']);
  assert.deepEqual(row(r, 'payload.x').vals, ['null', null, 'null']);
  assert.equal(row(r, 'payload.x').same, false);
  assert.deepEqual(row(r, 'payload.ra.roles').diff, [false, false, true]);
  assert.deepEqual(row(r, 'payload.e').vals, ['{}', '{}', '{}']);
  assert.deepEqual(row(r, 'payload.extra').vals, [null, 'true', null]);
  assert.deepEqual(row(r, 'header.alg').diff, [false, false, true]);
  assert.equal(row(r, 'signature').same, true);
  assert.equal(r.rows.at(-1).path[0], 'signature');
  assert.ok(r.rows.findIndex(x => x.path[0] === 'payload') > r.rows.findIndex(x => x.path[0] === 'header'));
});
t('jwt compare: a bad token is reported and the next good one is the baseline', () => {
  const r = cmp('not-a-jwt', jwt({ alg: 'HS256' }, { sub: 'a' }), jwt({ alg: 'HS256' }, { sub: 'b' }));
  assert.match(r.cols[0].error, /3 ส่วน/);
  assert.equal(r.base, 1);
  assert.deepEqual(row(r, 'payload.sub').vals, [null, '"a"', '"b"']);
  assert.deepEqual(row(r, 'payload.sub').diff, [false, false, true]);
  assert.equal(row(r, 'header.alg').same, true);
  assert.equal(cmp('x.y', 'a.b.c').base, -1);
});

// ── CHANGELOG ── a version bump without its entry fails here (same regex as the tag job in static.yml)
t('changelog: newest entry is the .app-version in index.html', () => {
  const ver = readFileSync(`${root}index.html`, 'utf8').match(/class="app-version">v([0-9][0-9.]*)</)[1];
  assert.equal(run('CHANGELOG[0].v'), ver, `index.html is v${ver}: add an entry on top of CHANGELOG in changelog.js`);
});
t('changelog: unique versions, newest first, real dates, no empty items', () => {
  const log = run('CHANGELOG'), num = v => v.split('.').map(Number);
  assert.equal(new Set(log.map(e => e.v)).size, log.length);
  log.forEach((e, i) => {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, e.v);
    assert.equal(new Date(e.date + 'T00:00:00Z').toISOString().slice(0, 10), e.date, e.v);
    assert.ok(e.items.length && e.items.flat().every(s => typeof s === 'string' && s.trim()), e.v);
    const prev = log[i - 1];
    if (prev) {
      assert.ok(prev.date >= e.date, `${prev.v} is dated before ${e.v}`);
      const [a, b] = [num(prev.v), num(e.v)];
      assert.ok(a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]), `${prev.v} is listed above ${e.v}`);
    }
  });
});
t('changelog: Thai date from the ISO day, no UTC shift', () => assert.equal(run(`clDate('2026-10-15')`), '15 ตุลาคม 2569'));

console.log(`${passed} passed${process.exitCode ? ', some failed' : ''}`);
