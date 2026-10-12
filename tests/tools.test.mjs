// Self-checks for the pure parsers / converters in assets/js/tools. Run: node tests/tools.test.mjs
// The tool files are classic browser scripts, so they're loaded into one vm context like <script defer> tags.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const ctx = vm.createContext({ console, Intl, BigInt, atob, TextDecoder });
for (const f of ['refdocs', 'db2-errors', 'java-exceptions', 'thai-tools', 'json2type', 'props-yaml', 'stacktrace', 'home']) {
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
  assert.equal(run('stGuessApp(stParse(ST_SAMPLE).chain)'), 'th.co.cdgs.');
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
  'password': '', 'kubectl': '', 'hello world': '', '': '', '{not json': '',
};
for (const [text, want] of Object.entries(smart)) t(`spDetect(${JSON.stringify(text).slice(0, 40)})`, () => assert.equal(run(`(spDetect(${JSON.stringify(text)})[0]||{}).kind||''`), want));
t('spDetect: JSON also offers JSON → Type, an ID with a bad check digit is not an ID', () => {
  assert.deepEqual(run(`spDetect('{"a":1}').map(d=>d.kind)`), ['json', 'json2type']);
  assert.ok(!run(`spDetect('1234567890122').map(d=>d.kind)`).includes('thai-id'));
});

console.log(`${passed} passed${process.exitCode ? ', some failed' : ''}`);
