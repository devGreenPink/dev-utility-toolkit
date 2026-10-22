// ── CHANGELOG ── the "อัปเดต" tab and the latest-release line on the home tab
// Newest first. Every version bump adds an entry on top (see Versioning in CLAUDE.md); tests/tools.test.mjs
// fails when CHANGELOG[0].v is not the .app-version in index.html.
// date = release day YYYY-MM-DD (Asia/Bangkok). An item is a string, or [text, ...sub-bullets].
// `code` and **bold** are rendered; everything else is escaped.
const CHANGELOG=[
  {v:'2.7',date:'2026-10-22',items:[
    '**เปรียบเทียบ JWT แยกเป็นกลุ่ม HEADER / PAYLOAD / SIGNATURE**: ชื่อ claim สั้นลง (`role` แทน `payload.role`) หัวกลุ่มบอกว่าต่างกี่รายการ และเมื่อติ๊ก "เฉพาะที่ต่าง" กลุ่มที่ไม่มีอะไรต่างจะถูกซ่อน',
  ]},
  {v:'2.6',date:'2026-10-22',items:[
    ['**JWT Decoder เปรียบเทียบ token ได้แล้ว** (ส่วน "เปรียบเทียบ JWT" ในแท็บ JWT): วาง token ช่องละตัว Token #1, #2, ... เริ่มที่ 2 ช่อง กดเพิ่มหรือลบช่องได้',
      'ตารางแถวละ claim คอลัมน์ละช่อง หัวคอลัมน์ใช้เลขเดียวกับช่อง รายการที่ไม่ตรงกันมีป้าย "ต่าง" และช่องที่ต่างจากตัวตั้งถูกไฮไลต์',
      'ติ๊ก "เฉพาะที่ต่าง" เพื่อซ่อนรายการที่ตรงกันทุกตัว',
      'ใต้แต่ละช่องบอกว่าต่างจากตัวตั้งกี่รายการ หรือถอด token ไม่ได้เพราะอะไร',
      '`exp` / `iat` / `nbf` แสดงวันที่ด้วย และ token ในช่องเปรียบเทียบไม่ถูกจำหรือใส่ในลิงก์แชร์'],
  ]},
  {v:'2.5',date:'2026-10-19',items:[
    ['**QR Code Reader อ่าน barcode ได้แล้ว** (เปลี่ยนชื่อเป็น QR & Barcode Reader): EAN-13 / EAN-8 / UPC / Code 128 / Code 39 / ITF / Codabar / Data Matrix / PDF417 จากรูป คลิปบอร์ด หรือกล้อง',
      'บอกชนิดของ code ที่อ่านได้ และตรวจ check digit ของ EAN / UPC',
      '**barcode ชำระบิลข้ามธนาคาร** แยกเลขผู้เสียภาษี (ตรวจ check digit), Suffix, Ref 1, Ref 2 และจำนวนเงินจากสตางค์เป็นบาท',
      'ข้อมูลที่คั่นด้วย CR ขึ้นบรรทัดใหม่บนจอ ส่วนปุ่มคัดลอกยังให้ข้อความตรงตาม barcode ทุกตัว อักขระควบคุมอื่น (เช่น GS ของ GS1) แสดงเป็นป้ายชื่อ ไม่หายไปเฉยๆ',
      'ภาษาไทยใน Data Matrix / PDF417 ไม่เพี้ยน',
      'ใช้ได้บน Windows ด้วย: ถ้าเบราว์เซอร์ไม่มี BarcodeDetector จะโหลด ZXing มาอ่านแทนเมื่อใช้ครั้งแรก อ่าน barcode ที่วางแนวตั้งได้'],
  ]},
  {v:'2.4',date:'2026-10-15',items:[
    '**หน้าอัปเดตใหม่** (เมนู "อัปเดต" ใต้หน้าแรก) บอกว่าแต่ละรุ่นออกวันไหน และมีอะไรเปลี่ยนบ้าง',
    'หน้าแรกบอกรุ่นล่าสุดพร้อมวันที่ กดแล้วเปิดหน้าอัปเดต',
  ]},
  {v:'2.3',date:'2026-10-15',items:[
    ['**LOV Query Browser จำลอง response ได้**: ทุก query ทั้งในรายการและหน้าแก้ไขมีกล่อง "ตัวอย่าง response" แสดง `{ results, paginator }` 10 แถวจาก Mock Data Generator',
      'คอลัมน์จับคู่ตามชื่อ (email, phone, citizenId, birthDate, provinceName, salary, USER_NAME, ...) ที่เหลือสุ่มตาม type',
      'วันที่ออกมาแบบเดียวกับ backend (`2025-03-14T00:00:00.000+07:00`)',
      'กดสุ่มใหม่ได้ และส่งต่อไป JSON → Type เพื่อทำ interface ฝั่ง UI'],
    'LOV ค้นหาจากชื่อตาราง / คอลัมน์ใน SQL ได้ พิมพ์ค้นหาแล้ว query ที่เปิดดูอยู่ไม่ปิด และไม่หน่วงแม้โฟลเดอร์มีไฟล์เยอะ',
    'LOV editor กด Ctrl+S ทันทีหลังพิมพ์แล้วไฟล์ไม่มี `:{{ name | Type }}` ค้างหรือขาด parameter อีก บันทึกแล้วหน้าจอและ cursor อยู่ที่เดิม',
  ]},
  {v:'2.2',date:'2026-10-15',items:[
    ['**เครื่องมือใหม่ Claude Code Agentic & Security** (หมวด Claude Code) ต่อจาก Claude Code Patterns: ออกแบบ agentic workflow ที่คุมได้ แบ่งเป็น 5 หัวข้อ:',
      '**Loop** 6 แบบที่พลาดเมื่อปล่อย agent ทำเอง, animation Plan → Execute → Verify → Retry → Escalate, กลยุทธ์ Verify และ bounded retry',
      '**Workflow** subagent, event ของ hook และตัวอย่าง hook กันแก้ไฟล์, `claude -p` ใน CI, PR Review Agent / Auto Test Agent, Loop Canvas และ REVIEW.md',
      '**MCP** `claude mcp add`, `.mcp.json` กับสิทธิ์ของ tool, สร้าง server ด้วย FastMCP และเลือกระหว่าง Claude API / Agent SDK / MCP',
      '**Security** ความเสี่ยงเมื่อ agent เข้าถึงระบบองค์กร, guardrail 5 ชั้น (modes, rules, hooks, sandbox, managed settings) และการทดสอบแบบ Red / Blue',
      '**Skill · แผน** skill / plugin ของทีม, marketplace ภายในองค์กร, template แผน 30 วัน และสรุป 2 วัน'],
    'Claude Code Patterns มีปุ่มพาไปแท็บใหม่ท้ายหัวข้อ ทีม & Audit',
  ]},
  {v:'2.1',date:'2026-10-14',items:[
    ['**เครื่องมือใหม่ Claude Code Patterns** (หมวด Claude Code) วิธีใช้ Claude Code กับงานทีมแบบ Plan → Design → Build แบ่งเป็น 4 หัวข้อ:',
      '**แนวคิด** AI-native SDLC, 6 แบบที่พลาดเมื่อสั่งบรรทัดเดียว, วงจร 3 ระดับ, 12 play ของ Playbook และ animation ห่วงโซ่ไฟล์ที่ commit',
      '**ไฟล์งาน 5 ชิ้น** CLAUDE.md → intent.md → spec.md → plan.md → โค้ด + test แต่ละชิ้นบอกหัวข้อที่ต้องมี ใครอนุมัติ และมี template กดคัดลอกได้',
      '**เทคนิค** prompt แบบ RCTCF, กฎควรอยู่ที่ CLAUDE.md / skill / hook, plan mode, verifier subagent, การดูแล context, โหมดสิทธิ์ และการกัน PII',
      '**ทีม & Audit** บทบาท, trailer ท้าย commit (`Refs:` / `Accepted-by:` / `Approved-by:`), Decision Register และตัวชี้วัดที่นับจาก git'],
  ]},
  {v:'2.0',date:'2026-10-13',items:[
    '**หน้าตาใหม่** ทุกเครื่องมือใช้ layout เดียวกัน: ช่องกรอกซ้าย ผลลัพธ์ขวา อัปเดตทันทีที่พิมพ์ ไม่ต้องกดปุ่มแปลง',
    '**logo ใหม่** และ header ที่บอกหมวด ไอคอน และปุ่มรายการโปรดของเครื่องมือที่เปิดอยู่ · ธีมเริ่มต้นเป็น Dracula',
    '**Smart paste** บนหน้าแรกและใน `Ctrl + K` (วางข้อความหลายบรรทัดได้)',
    '**จำข้อมูลที่กรอกไว้** ทุกช่อง เปิดหน้าใหม่ก็ยังอยู่ (ไม่จำ JWT และ Secret) พร้อม **ประวัติ** 5 ค่าล่าสุดของช่องหลัก',
    '**ส่งต่อ** ผลลัพธ์ไปเครื่องมืออื่นที่อ่านได้ เช่น payload ของ JWT ไป JSON Tools',
    '**ลิงก์แชร์** ที่เปิดเครื่องมือเดิมพร้อมข้อมูลเดิมในเครื่องอื่น (บีบอัดไว้ใน URL, ไม่ใส่ JWT / secret)',
    '**แผนผังกดได้ 16 แบบ** ในหน้า Java Exceptions (ต้นไม้ลำดับชั้นของทุก exception ที่มีการ์ด, อ่าน Caused by, LazyInitialization), Java Internals (memory ของ JVM, จาก .java ถึงตอนรัน, ClassLoader, transaction), DB2 (อ่านข้อความ error, deadlock), SQL (JOIN), Docker & K8s (Pod ค้างตรงไหน, ใครสร้าง Pod), HTTP Status (ใครตอบ), Git, Cron และ Angular · กดส่วนไหนก็มีคำอธิบายลอยอยู่ล่างจอ และพาไปการ์ดที่เกี่ยวข้องได้',
    '**คัดลอกแล้วรู้ว่าคัดลอก** ปุ่มเปลี่ยนเป็น "คัดลอกแล้ว" และ toast แสดงสิ่งที่คัดลอก',
    '**เครื่องมือใหม่** QR Code Reader (PromptPay / Thai QR + ตรวจ CRC), Stack Trace Analyzer, JSON → Type, Properties ↔ YAML, K8s Secret Decoder, พ.ศ. · เลขบัตร · บาท',
    '**เนื้อหาใหม่** SQL & System Catalog, DB2 Error Codes, Java Exceptions, Java Internals, NgRx, Docker & K8s (ไฟล์ตัวอย่าง 32 ไฟล์อธิบายทีละบรรทัด + การ mount ไฟล์), Request Path, Jenkins CI/CD, CLI และ Git cheatsheet',
    '**ตรวจเนื้อหาทุกหน้า** แก้ข้อมูลที่ผิด เช่น Cron คำนวณรอบถัดไปตาม timezone ถูกแล้วและแปลงเป็น Spring / Quarkus `@Scheduled` (Quartz) ได้ถูกรูปแบบ, config ของ RabbitMQ / Redis ตรงกับ Quarkus ปัจจุบัน, รายละเอียดของ K8s, HTTP, RxJS และเพิ่มเนื้อหาที่ขาด (exception ของ JPA / security / POI, SQLCODE ที่เจอบ่อย, GC, virtual thread, NgRx Signals Store, `firstValueFrom`, Git tag)',
    '**ตั้งค่าตัวอักษร** ขนาด 4 ระดับ และเลือกฟอนต์ได้',
    '**ใช้ offline ได้ครบ** library จาก CDN ถูกเก็บไว้หลังเปิดออนไลน์ครั้งแรก ทุกเครื่องมือจึงใช้ได้ตอนไม่มีเน็ต',
    '**เปิดเร็วขึ้น** library และเครื่องมือขนาดใหญ่โหลดเมื่อเปิดใช้ครั้งแรก หน้าแรกโหลดเฉพาะตัวแอป',
    '**เอาเครื่องมือแปลภาษาออก** เพราะต้องส่งข้อความออกไปภายนอก ขัดกับหลัก privacy ของแอป',
  ]},
];

// Pure: '2026-10-15' → '15 ตุลาคม 2569' (built from parts: new Date('2026-10-15') is UTC midnight)
function clDate(iso){
  const [y,m,d]=iso.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('th-TH',{dateStyle:'long'});
}
function clInline(s){return refInline(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');}
// Pure: one entry → its <section>
function clEntryHtml(e,latest){
  const li=it=>Array.isArray(it)
    ?`<li>${clInline(it[0])}<ul>${it.slice(1).map(s=>`<li>${clInline(s)}</li>`).join('')}</ul></li>`
    :`<li>${clInline(it)}</li>`;
  const hid='cl-v'+e.v.replace(/\./g,'-');
  return `<section class="card cl-entry" aria-labelledby="${hid}">
    <h2 class="cl-head" id="${hid}"><span class="cl-v">v${e.v}</span><time datetime="${e.date}">${clDate(e.date)}</time>${latest?'<span class="cl-new">ล่าสุด</span>':''}</h2>
    <ul class="cl-items">${e.items.map(li).join('')}</ul>
  </section>`;
}
function clRender(){
  document.getElementById('cl-list').innerHTML=CHANGELOG.map((e,i)=>clEntryHtml(e,i===0)).join('')
    +`<p class="cl-older">รุ่นก่อน v2.0 ดูได้ที่ <a href="https://github.com/devgreenpink/dev-utility-toolkit/releases" target="_blank" rel="noopener">GitHub Releases</a></p>`;
}
// the line under the home search: latest version + date, opens this tab
function clHomeLine(){
  const el=document.getElementById('home-news'),e=CHANGELOG[0];
  if(el&&!el.innerHTML)el.innerHTML=`${ic('megaphone')}<span>อัปเดตล่าสุด <b>v${e.v}</b> · ${clDate(e.date)}</span><span class="home-news-go">ดูว่ามีอะไรใหม่${ic('chevron-right')}</span>`;
}
