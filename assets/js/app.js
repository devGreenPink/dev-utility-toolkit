// ── TOPBAR META ──
const TAB_META = {
  'random-tab': { title: 'Mock Data Generator', sub: 'สร้างข้อมูลจำลองสำหรับทดสอบระบบ · รองรับภาษาไทย' },
  'sql-tab': { title: 'Java String → Clean SQL', sub: 'แยก SQL ออกจาก Java String, StringBuilder, Text Block, MyBatis' },
  'compare-tab': { title: 'เปรียบเทียบข้อความ / JSON', sub: 'แสดงความแตกต่างระดับตัวอักษรหรือระดับบรรทัด' },
  'json-tab': { title: 'JSON Tools', sub: 'จัดรูปแบบ · บีบอัด · Tree View · JSONPath Query' },
  'unix-tab': { title: 'Unix Timestamp Converter', sub: 'แปลง Unix timestamp เป็นวันที่และเวลา' },
  'base64-tab': { title: 'Base64 Encode / Decode', sub: 'รองรับ plain text, Unicode, ภาษาไทย และ URL-safe Base64' },
  'url-tab': { title: 'URL Encode / Decode', sub: 'encodeURIComponent / decodeURIComponent · รองรับ Unicode และภาษาไทย' },
  'hash-tab': { title: 'Hash Generator', sub: 'SHA-256 / SHA-512 / SHA-1 — คำนวณฝั่ง client ทั้งหมด' },
  'jwt-tab': { title: 'JWT Decoder', sub: 'แกะ JWT token ดู header, payload, signature · client-side ล้วน' },
  'cron-tab': { title: 'Cron Expression Builder', sub: 'สร้าง cron expression สำหรับ Linux, Spring @Scheduled, Quartz' },
  'regex-tab': { title: 'Regex Tester', sub: 'ทดสอบ Regular Expression พร้อม highlight และ capture groups' },
  'color-tab': { title: 'Color Picker', sub: 'Color Wheel · HSL/RGB/Alpha sliders · Hex ↔ RGB ↔ HSL' },
  'http-tab': { title: 'HTTP Status Code Reference', sub: '1xx · 2xx · 3xx · 4xx · 5xx — คำอธิบายและตัวอย่างการใช้งาน' },
  'kubectl-tab': { title: 'kubectl Cheatsheet', sub: 'คำสั่ง kubectl ที่ใช้บ่อย พร้อมคำอธิบายภาษาไทย' },
  'linux-tab': { title: 'Linux Command Cheatsheet', sub: 'คำสั่ง Linux ที่ใช้บ่อย — Ubuntu / Debian / RHEL' },
  'git-tab': { title: 'Git CLI Cheatsheet', sub: 'คำสั่ง Git ที่ใช้บ่อย — commit · branch · rebase · stash · undo' },
  'numbase-tab': { title: 'Number Base Converter', sub: 'แปลงเลขฐาน 10 ↔ 16 ↔ 2 ↔ 8' },
  'kopwang-tab': { title: 'ก๊อปวาง เอนจิ้น', sub: 'SQL → TypeScript / Java Entity Generator' },
  'rxjs-tab': { title: 'RxJS Reference', sub: 'Operator Explorer · Marble Diagrams · คำอธิบายภาษาไทย' },
  'angular-tab': { title: 'Angular Lifecycle', sub: '9 Lifecycle Hooks · Interactive Simulator · คำอธิบายภาษาไทย' },
};

// ── THEME ──
const STORAGE_KEY='isaan-devtools-theme';
const STORAGE_TAB='isaan-devtools-tab';
function setTheme(t,btn){
  document.body.setAttribute('data-theme',t==='default'?'':t);
  document.querySelectorAll('.theme-dot').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  try{localStorage.setItem(STORAGE_KEY,t);}catch(e){}
}
function restoreTheme(){
  let saved='default';
  try{saved=localStorage.getItem(STORAGE_KEY)||'default';}catch(e){}
  document.body.setAttribute('data-theme',saved==='default'?'':saved);
  document.querySelectorAll('.theme-dot').forEach(b=>{
    b.classList.toggle('active',b.getAttribute('data-theme-id')===saved);
  });
}

// ── SIDEBAR MOBILE ──
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

// ── NAV FILTER ──
const STORAGE_NAVSEARCH='isaan-devtools-navsearch';
function filterNav(q){
  const query=q.toLowerCase().trim();
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.style.display=!query||item.textContent.toLowerCase().includes(query)?'':'none';
  });
  document.querySelectorAll('.nav-section-label').forEach(label=>{
    label.style.display='';
  });
  try{localStorage.setItem(STORAGE_NAVSEARCH,q);}catch(e){}
}
function restoreNavSearch(){
  try{
    const q=localStorage.getItem(STORAGE_NAVSEARCH)||'';
    if(q){
      const el=document.getElementById('nav-search');
      if(el){el.value=q;filterNav(q);}
    }
  }catch(e){}
}

// ── NAV ──
let activeTabId='random-tab';
function openTab(evt,id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(evt&&evt.currentTarget)evt.currentTarget.classList.add('active');
  else document.querySelectorAll(`.nav-item[data-tab="${id}"]`).forEach(b=>b.classList.add('active'));
  activeTabId=id;
  const meta=TAB_META[id]||{title:'',sub:''};
  document.getElementById('topbar-title').textContent=meta.title;
  document.getElementById('topbar-sub').textContent=meta.sub;
  try{localStorage.setItem(STORAGE_TAB,id);}catch(e){}
  closeSidebar();
}
function restoreTab(){
  let saved='random-tab';
  try{saved=localStorage.getItem(STORAGE_TAB)||'random-tab';}catch(e){}
  const el=document.getElementById(saved);
  if(!el)return;
  openTab(null,saved);
}

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){
    e.preventDefault();
    switch(activeTabId){
      case'random-tab':generateAll();break;
      case'sql-tab':convertSQL();break;
      case'compare-tab':compareText();break;
      case'json-tab':formatJSON(4);break;
      case'unix-tab':convertUnix();break;
      case'base64-tab':b64Encode();break;
      case'cron-tab':parseCronManual();break;
      case'hash-tab':computeHash();break;
      case'jwt-tab':decodeJWT_UI();break;
      case'url-tab':urlEncode();break;
      case'regex-tab':runRegex();break;
      case'numbase-tab':numBaseConvert('dec',document.getElementById('nb-dec')?.value||'');break;
    }
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){
    e.preventDefault();
    document.getElementById('nav-search').focus();
    const searchMap={'kubectl-tab':'kubectl-search','linux-tab':'linux-search','git-tab':'git-search'};
    const el=document.getElementById(searchMap[activeTabId]);
    if(el){el.focus();el.select();}
  }
});

// ── UTILS ──
function toggleKbPop(){const pop=document.getElementById('kb-pop');pop.classList.toggle('open');}
function scrollToTop(){document.querySelector('.content-area')?.scrollTo({top:0,behavior:'smooth'});}
document.addEventListener('click',e=>{const wrap=document.querySelector('.kb-pop-wrap');if(wrap&&!wrap.contains(e.target))document.getElementById('kb-pop')?.classList.remove('open');});
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg||'✓ Copied';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function copyText(txt){navigator.clipboard.writeText(txt).then(()=>showToast('✓ Copied')).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('✓ Copied');});}
function copyVal(id){const el=document.getElementById(id);if(el&&el.textContent&&el.textContent!=='—')copyText(el.textContent);}
function copyElText(id){const el=document.getElementById(id);if(el)copyText(el.value!==undefined?el.value:el.textContent);}
function copyArea(id){const el=document.getElementById(id);if(el)copyText(el.value||el.textContent);}
function highlightText(text,query){if(!query)return escHtml(text);const re=new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');return escHtml(text).replace(re,'<span class="cmd-highlight">$1</span>');}

// ── MOCK DATA ──
const MD={
  first:['มิกซ์', 'วิศรุต', 'ชัยพล', 'ณัฐกานต์', 'อภิสิทธิ์', 'สรวิชญ์', 'มิกค์', 'จ๊อบ', 'วิภาวี', 'เติ้ล', 'แสน', 'มอส', 'เอเทน', 'เจต', 'เจล', 'ข้าว', 'ขวัญข้าว', 'โอ๊ตข้าวตลอดไป', 'ธวัชชัย', 'แมน', 'แก๊ป', 'จิรสิน', 'จรรยพรพรหม', 'อิงค์', 'ตั้น', 'เจษฎากร', 'ศิรดา', 'สุทธิรา'],
  last:[
    'อินฟินิตลูป', 'ดีพลอยพัง', 'เมอร์จคอนฟลิกต์', 'แก้บั๊กวนไป', 
    'โลกล่ม', 'ดาต้าหาย', 'รีสตาร์ทเซอร์วิส', 'สแตกเทรซ',
    'เบิร์นเอาท์', 'เอาท์ออฟเมมโมรี่', 'ก๊อปวางอย่างเซียน', 'คีย์บอร์ดพัง', 'คอฟฟี่โอเวอร์โดส', 
    'โนสเปซเลฟต์', 'ซินแทกซ์เออร์เรอร์', 'เซมิโคลอนหาย', 'โลคอลโฮสต์รอด', 'เซิร์ฟเวอร์บึ้ม', 
    'เดดไลน์พรุ่งนี้', 'โนคอมเมนต์', 'สายมูเตลูโค้ด', 'ฟอนต์เพี้ยน', 'พาสเวิร์ดแฮกง่าย', 
    'กูเกิลคัตลอก', 'สแต็คโอเวอร์โฟลว์', 'บราวน์เซอร์ค้าง', 'คุกกี้เต็มพุง', 'คิวเอส่ายหัว'
],
  domain:['gmail.com','hotmail.com','yahoo.com','outlook.co.th','devmail.io'],
  prefix:['081','082','089','091','095','061','063','065'],
  gender:['ชาย','หญิง','ไม่ระบุ'],
  provinces:[
    {name:'กรุงเทพมหานคร',zip:'10100'},{name:'นนทบุรี',zip:'11000'},{name:'ปทุมธานี',zip:'12000'},
    {name:'สมุทรปราการ',zip:'10270'},{name:'ชลบุรี',zip:'20000'},{name:'ระยอง',zip:'21000'},
    {name:'อยุธยา',zip:'13000'},{name:'ลพบุรี',zip:'15000'},{name:'นครปฐม',zip:'73000'},
    {name:'เชียงใหม่',zip:'50000'},{name:'เชียงราย',zip:'57000'},{name:'ลำปาง',zip:'52000'},
    {name:'พิษณุโลก',zip:'65000'},{name:'นครสวรรค์',zip:'60000'},{name:'สุโขทัย',zip:'64000'},
    {name:'ขอนแก่น',zip:'40000'},{name:'นครราชสีมา',zip:'30000'},{name:'อุดรธานี',zip:'41000'},
    {name:'อุบลราชธานี',zip:'34000'},{name:'มหาสารคาม',zip:'44000'},{name:'สกลนคร',zip:'47000'},
    {name:'นครพนม',zip:'48000'},{name:'กาฬสินธุ์',zip:'46000'},{name:'บึงกาฬ',zip:'38000'},
    {name:'สงขลา',zip:'90000'},{name:'ภูเก็ต',zip:'83000'},{name:'สุราษฎร์ธานี',zip:'84000'},
    {name:'กระบี่',zip:'81000'},{name:'ตรัง',zip:'92000'},{name:'นราธิวาส',zip:'96000'},
  ],
  companies:[
    'บริษัท เทคโนโลยีไทย จำกัด','บริษัท ดิจิทัลโซลูชั่นส์ จำกัด (มหาชน)',
    'บริษัท อีสานซอฟต์แวร์ จำกัด','ห้างหุ้นส่วนจำกัด โค้ดดิ้งแล็บ',
    'บริษัท ไทยเดฟ จำกัด','บริษัท สยามไอที กรุ๊ป จำกัด',
    'บริษัท เน็กซ์เจน โซลูชั่น จำกัด','ห้างหุ้นส่วนจำกัด บิ๊กดาต้าไทย',
    'บริษัท คลาวด์เซอร์วิส ประเทศไทย จำกัด','บริษัท อีคอมเมิร์ซไทย จำกัด',
    'บริษัท ฟินเทค โซลูชั่น จำกัด','บริษัท โมบายแอป ไทยแลนด์ จำกัด',
    'บริษัท อะเมซิ่งเดฟ จำกัด','ห้างหุ้นส่วนจำกัด สตาร์ทอัพไทย',
    'บริษัท ซิลิคอนวัลเล่ย์ไทย จำกัด',
  ],
  jobs:[
    'Software Developer','Full Stack Developer','Backend Developer','Frontend Developer',
    'DevOps Engineer','QA Engineer','Project Manager','Business Analyst',
    'UX/UI Designer','Data Analyst','Database Administrator','System Analyst',
    'IT Manager','Tech Lead','Scrum Master','Mobile Developer','Cloud Engineer',
    'Security Engineer','นักพัฒนาซอฟต์แวร์','ผู้จัดการโครงการ',
  ],
  salaryRanges:[[15000,25000],[25000,40000],[40000,60000],[60000,90000],[90000,120000],[120000,180000]],
  nicknames:[
    'สายสู้ชีวิต แต่ชีวิตสู้กลับ','จอมขมังเวทย์ เสกโค้ดบ่ติด','นักสู้พันล้าน... บรรทัด',
    'เทพเจ้าแห่งความว่างเปล่า (ตื่นมาพบบั๊ก)','ผู้พิทักษ์โค้ดเน่า','ร่างทองตอนตีสอง',
    'ด็อกเตอร์ Stack Overflow','ฉลามวาฬกินคาเฟอีน','นักล้างแค้น... แก้วกาแฟ',
    'เซียนโกปี๊ ขยี้บั๊ก','หวานเจี๊ยบเฉียบคม','ผู้เปลี่ยนชาเย็นเป็นซอร์สโค้ด',
    'บ่าวหน้าคอม ดมกลิ่นกาแฟ','มือปราบหนอนไหม (แต่เจอหนอนยักษ์)','หมอพราหมณ์ทำพิธีล้างบั๊ก',
    'หน่วยกู้ภัยไฟลุกลาม','บิดาแห่งการ Copy & Paste','นักเลงคีย์บอร์ด (ปุ่ม Ctrl พัง)',
    'ผู้บ่าวโค้ดพัง ฝังใจกับบั๊ก','ร่างทรง "มันทำงานได้บนเครื่องผม"','จอมโจรลักลอก โค้ดชาวบ้าน',
    'นักพรางตัวในห้องมืด','ผู้ดับไฟด่วน (แต่ทำไฟลาม)','เซียนคอมพิวเตอร์ ยินดีซ่อมปริ้นเตอร์',
    'ขุนพล "ลองรีสตาร์ทดูยัง?"','ปรมาจารย์ มั่วจนรันผ่าน','เทพแห่งการ Commit สองวิสุดท้าย',
    'นักโบราณคดี ขุดโค้ดเก่า','วิศวกรผู้สร้าง บั๊กไร้พรมแดน','เจ้าชายร้อย Git Branch',
    'ท่านประธานบริษัท แผนกแก้คำผิด',
  ],
};
function r(a){return a[Math.floor(Math.random()*a.length)];}
function genDob(){
  const now=new Date();
  const age=18+Math.floor(Math.random()*48);
  const dob=new Date(now.getFullYear()-age,Math.floor(Math.random()*12),1+Math.floor(Math.random()*28));
  const dd=String(dob.getDate()).padStart(2,'0');
  const mm=String(dob.getMonth()+1).padStart(2,'0');
  const yyyy=dob.getFullYear();
  return{display:`${dd}/${mm}/${yyyy+543}`,iso:`${yyyy}-${mm}-${dd}`,age:Math.floor((now-dob)/31557600000)};
}
function genLuhnCard(prefix){
  let num=String(prefix);
  while(num.length<15)num+=Math.floor(Math.random()*10);
  let sum=0,odd=true;
  for(let i=num.length-1;i>=0;i--){let d=parseInt(num[i]);if(odd){d*=2;if(d>9)d-=9;}sum+=d;odd=!odd;}
  return(num+((10-(sum%10))%10)).replace(/(\d{4})(?=\d)/g,'$1-');
}
function genJuristicId(){
  let n='0';for(let i=0;i<12;i++)n+=Math.floor(Math.random()*10);
  return n.replace(/(\d)(\d{4})(\d{5})(\d{2})(\d)/,'$1-$2-$3-$4-$5');
}
function genOneMock(){
  let id='';
  for(let i=0;i<12;i++)id+=Math.floor(Math.random()*10);
  let sum=0;
  const digits=id.split('').map(Number);
  for(let i=0;i<12;i++)sum+=digits[i]*(13-i);
  id+=(11-(sum%11))%10;
  const first=r(MD.first),last=r(MD.last);
  const phone=r(MD.prefix)+'-'+String(Math.floor(Math.random()*9000000)+1000000).padStart(7,'0').replace(/(\d{3})(\d{4})/,'$1-$2');
  const EN_FIRST=['alex','sam','mike','jane','bob','alice','tom','lisa','john','kate','peter','anna','james','emma','chris','sara','david','amy','ryan','julia'];
  const EN_LAST=['smith','jones','brown','chen','lee','kim','garcia','miller','davis','wilson','taylor','anderson','thomas','jackson','white','harris','martin','walker','hall','allen'];
  const email=r(EN_FIRST)+'.'+r(EN_LAST)+Math.floor(Math.random()*999)+'@'+r(MD.domain);
  const uuid=crypto.randomUUID();
  const gender=r(MD.gender);
  const dob=genDob();
  const prov=r(MD.provinces);
  const company=r(MD.companies);
  const job=r(MD.jobs);
  const sr=r(MD.salaryRanges);
  const salary=Math.floor((sr[0]+Math.random()*(sr[1]-sr[0]))/500)*500;
  const cardType=Math.random()>0.5?{label:'Visa',prefix:'4'}:{label:'Mastercard',prefix:String(51+Math.floor(Math.random()*5))};
  const creditCard=genLuhnCard(cardType.prefix);
  const juristicId=genJuristicId();
  const nickname=r(MD.nicknames);
  return{id,name:`${first} ${last}`,nickname,gender,phone,email,uuid,dob:dob.display,dobIso:dob.iso,age:dob.age,province:prov.name,zip:prov.zip,company,juristicId,job,salary,creditCard,creditCardType:cardType.label};
}
function generateAll(){
  const m=genOneMock();
  document.getElementById('out-id').textContent=m.id;
  document.getElementById('out-name').textContent=m.name;
  document.getElementById('out-nickname').textContent=m.nickname;
  document.getElementById('out-gender').textContent=m.gender;
  document.getElementById('out-dob').textContent=`${m.dob}  (${m.age} ปี)`;
  document.getElementById('out-phone').textContent=m.phone;
  document.getElementById('out-email').textContent=m.email;
  document.getElementById('out-uuid').textContent=m.uuid;
  document.getElementById('out-province').textContent=m.province;
  document.getElementById('out-zip').textContent=m.zip;
  document.getElementById('out-company').textContent=m.company;
  document.getElementById('out-juristic').textContent=m.juristicId;
  document.getElementById('out-job').textContent=m.job;
  document.getElementById('out-salary').textContent=m.salary.toLocaleString('th-TH')+' บาท';
  const ccEl=document.getElementById('out-credit');
  ccEl.textContent=m.creditCard;
  ccEl.setAttribute('data-card-type',m.creditCardType);
  document.getElementById('out-card-type').textContent=m.creditCardType;
  document.getElementById('bulk-output-area').style.display='none';
}
function clearMock(){
  ['out-id','out-name','out-nickname','out-gender','out-dob','out-phone','out-email','out-uuid','out-province','out-zip','out-company','out-juristic','out-job','out-salary','out-credit'].forEach(id=>{document.getElementById(id).textContent='—';});
  document.getElementById('out-card-type').textContent='';
  document.getElementById('bulk-output-area').style.display='none';
  document.getElementById('bulk-json-output').value='';
}
function copyAllMock(){
  const g=id=>document.getElementById(id).textContent;
  const fields={บัตรประชาชน:g('out-id'),ชื่อนามสกุล:g('out-name'),ฉายา:g('out-nickname'),เพศ:g('out-gender'),วันเกิด:g('out-dob'),เบอร์โทร:g('out-phone'),อีเมล:g('out-email'),จังหวัด:g('out-province'),รหัสไปรษณีย์:g('out-zip'),บริษัท:g('out-company'),เลขนิติบุคคล:g('out-juristic'),ตำแหน่ง:g('out-job'),เงินเดือน:g('out-salary'),บัตรเครดิต:g('out-credit'),uuid:g('out-uuid')};
  if(Object.values(fields).every(v=>v==='—')){showToast('กรุณาสุ่มข้อมูลก่อน');return;}
  copyText(JSON.stringify(fields,null,2));
}
function exportBulkJSON(){
  const count=parseInt(document.getElementById('bulk-count').value)||10;
  const items=[];for(let i=0;i<count;i++)items.push(genOneMock());
  const json=JSON.stringify(items,null,2);
  document.getElementById('bulk-json-output').value=json;
  document.getElementById('bulk-output-area').style.display='block';
  const badge=document.getElementById('bulk-count-badge');if(badge)badge.textContent=`${count} records`;
}

// ── SQL PARSER ──
function unescapeJava(s){return s.replace(/\\\\/g,'\x00BS\x00').replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\r/g,'\r').replace(/\\"/g,'"').replace(/\\'/g,"'").replace(/\x00BS\x00/g,'\\');}
function extractStringLiterals(expr){const re=/"((?:[^"\\]|\\.)*)"/g;const parts=[];let m;while((m=re.exec(expr))!==null)parts.push(unescapeJava(m[1]));return parts.join('');}
const SQL_MODES={
  TEXTBLOCK:{label:'Text Block (Java 15+)',color:'#a78bfa'},
  APPEND:{label:'StringBuilder / append()',color:'#34d399'},
  CONCAT:{label:'String concat (+)',color:'#60a5fa'},
  MYBATIS:{label:'MyBatis / JPA (#{} / :param)',color:'#fbbf24'},
  ANNOTATION:{label:'@Query / prepareStatement',color:'#f472b6'},
  STRFORMAT:{label:'String.format()',color:'#fb923c'},
  MYBATIS_XML:{label:'MyBatis XML mapper',color:'#4ade80'},
  PLAIN:{label:'Plain SQL',color:'#94a3b8'},
};
function detectMode(input){
  if(/"""[\s\S]*?"""/.test(input)) return 'TEXTBLOCK';
  if(/<(?:select|insert|update|delete)[^>]*>[\s\S]*?<\/(?:select|insert|update|delete)>/i.test(input)) return 'MYBATIS_XML';
  if(/@Query\s*\(|\.(?:prepareStatement|queryForObject|queryForList|queryForMap)\s*\(/.test(input)) return 'ANNOTATION';
  if(/String\.format\s*\(/.test(input)) return 'STRFORMAT';
  if(/\.append\s*\(|new\s+(?:String(?:Builder|Buffer))\s*\(/.test(input)) return 'APPEND';
  if(/"[^"]*"\s*\+|\+=\s*"/.test(input)) return 'CONCAT';
  const noStrings=input.replace(/"(?:[^"\\]|\\.)*"/g,'""');
  if(/#\{[\w.]+\}/.test(noStrings)) return 'MYBATIS';
  if(/(?<![:/]):\b[a-zA-Z_]\w*\b/.test(noStrings)) return 'MYBATIS';
  return 'PLAIN';
}
function detectSqlMode(val){
  const badge=document.getElementById('sql-detect-badge');
  if(!val.trim()){badge.textContent='—';badge.style.color='var(--text-dim)';badge.style.borderColor='var(--border)';return;}
  const mode=detectMode(val);const info=SQL_MODES[mode];
  badge.textContent=info.label;badge.style.color=info.color;badge.style.borderColor=info.color+'66';
}
function _skipSqlLine(t){
  if(!t) return true;
  if(/^\s*(?:\/\/|\/\*|\*)/.test(t)) return true;
  if(/\b(?:conditions|params|criteria|paramMap|conditionMap)\s*\.(?:put|add|set|remove)\s*\(/.test(t)) return true;
  if(/^\s*(?:Map|HashMap|TreeMap|LinkedHashMap|List|ArrayList)\s*[<\s{]/.test(t)) return true;
  if(/^\s*(?:if|else|for|while|try|catch|finally|return|throw)\b/.test(t)) return true;
  if(/\b(?:log|logger|LOG|LOGGER)\s*\.|System\.out\./.test(t)) return true;
  if(/^\s*\{?\s*$|^\s*\}\s*$/.test(t)) return true;
  return false;
}
function parseAppend(block){
  const parts=[];
  for(const line of block.split('\n')){
    const t=line.trim();
    if(_skipSqlLine(t)) continue;
    // Constructor with SQL: new StringBuilder("sql...") — extract from arg
    const ctorFull=t.match(/new\s+(?:String(?:Builder|Buffer))\s*\(([^)]*)\)/);
    if(ctorFull){if(ctorFull[1].trim()){const s=extractStringLiterals(ctorFull[1]);if(s)parts.push(s);}continue;}
    // Multi-line constructor (closing ) on next line)
    if(/new\s+(?:String(?:Builder|Buffer))\s*\(/.test(t)){const s=extractStringLiterals(t);if(s)parts.push(s);continue;}
    // .append("sql")
    const apM=t.match(/\.append\s*\(([\s\S]*?)\)\s*;?\s*(?:\/\/.*)?$/);
    if(apM){const s=extractStringLiterals(apM[1]);if(s)parts.push(s);continue;}
    // Continuation string: starts with "
    if(/^"/.test(t)){const s=extractStringLiterals(t);if(s)parts.push(s);continue;}
    // sql += "..."
    const plusM=t.match(/^\w+\s*\+=\s*(.*?)\s*;?\s*$/);
    if(plusM){const s=extractStringLiterals(plusM[1]);if(s)parts.push(s);continue;}
    // String sql = "..."
    const strM=t.match(/^(?:(?:final|static|private|public|protected)\s+)*String\s+\w+\s*=\s*(.*?)\s*;?\s*$/);
    if(strM){const s=extractStringLiterals(strM[1]);if(s)parts.push(s);}
  }
  return parts.join('');
}
function splitAppendBlocks(input){
  const lines=input.split('\n');const blocks=[];let cur=[];
  for(const line of lines){
    const t=line.trim();
    if(/(?:StringBuilder|StringBuffer)\s+\w+\s*=\s*new\s+(?:StringBuilder|StringBuffer)/.test(t)&&cur.some(l=>l.trim())){blocks.push(cur.join('\n'));cur=[];}
    cur.push(line);
  }
  if(cur.some(l=>l.trim())) blocks.push(cur.join('\n'));
  return blocks.length?blocks:[input];
}
function parseConcat(block){
  const cleaned=block.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/^\s*(?:(?:private|public|protected|static|final)\s+)*String\s+\w+\s*=\s*/m,'')
    .replace(/;\s*$/,'').replace(/\\\s*\n/g,'');
  return extractStringLiterals(cleaned);
}
function splitConcatBlocks(input){
  const lines=input.split('\n');const blocks=[];let cur=[];
  for(const line of lines){
    const t=line.trim();
    if(/^(?:(?:private|public|protected|static|final)\s+)*String\s+\w+\s*=\s*"/.test(t)&&cur.some(l=>l.trim())){blocks.push(cur.join('\n'));cur=[];}
    cur.push(line);
  }
  if(cur.some(l=>l.trim())) blocks.push(cur.join('\n'));
  return blocks.length?blocks:[input];
}
function parseTextBlockContent(raw){
  let s=raw.replace(/^\n/,'');
  const lines=s.split('\n');const nonEmpty=lines.filter(l=>l.trim().length>0);
  if(nonEmpty.length>0){const minIndent=Math.min(...nonEmpty.map(l=>l.match(/^(\s*)/)[1].length));if(minIndent>0)s=lines.map(l=>l.slice(minIndent)).join('\n');}
  return unescapeJava(s).trimEnd();
}
function parseAnnotationQuery(input){
  const qm=input.match(/@Query\s*\(\s*(?:value\s*=\s*)?"((?:[^"\\]|\\.)*)"/);
  if(qm) return unescapeJava(qm[1]);
  const pm=input.match(/\.(?:prepareStatement|query|queryForObject|queryForList|queryForMap|update|execute)\s*\(\s*"((?:[^"\\]|\\.)*)"/);
  if(pm) return unescapeJava(pm[1]);
  return '';
}
function parseStringFormat(input){
  const m=input.match(/String\.format\s*\(\s*"((?:[^"\\]|\\.)*)"/);
  if(!m) return '';
  return unescapeJava(m[1]).replace(/%[sdfnxo%]/g,'?');
}
function parsePlain(input){
  const stripped=input.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'').trim();
  const hasQuotes=/"/.test(stripped);
  return hasQuotes?(extractStringLiterals(stripped)||stripped):stripped;
}
const _FMT_NL=['ORDER\\s+BY','GROUP\\s+BY','LEFT\\s+OUTER\\s+JOIN','RIGHT\\s+OUTER\\s+JOIN','FULL\\s+OUTER\\s+JOIN','LEFT\\s+JOIN','RIGHT\\s+JOIN','INNER\\s+JOIN','CROSS\\s+JOIN','FULL\\s+JOIN','UNION\\s+ALL','INSERT\\s+INTO','DELETE\\s+FROM','SELECT','FROM','WHERE','HAVING','LIMIT','OFFSET','UNION','UPDATE','VALUES','WITH'];
const _FMT_KW=['DISTINCT','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS\\s+NOT\\s+NULL','IS\\s+NULL','NULL','CASE','WHEN','THEN','ELSE','END','ON','SET','INTO','BY','ASC','DESC','COUNT','SUM','AVG','MAX','MIN','COALESCE','NULLIF','CAST','CONVERT','TRIM','UPPER','LOWER','LENGTH','SUBSTRING','REPLACE','NVL','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS','ALL'];
// ── SQL DBeaver-style Formatter ──
const _SQL_CLAUSE_KWS=[
  'LEFT OUTER JOIN','RIGHT OUTER JOIN','FULL OUTER JOIN',
  'LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN','FULL JOIN',
  'GROUP BY','ORDER BY','UNION ALL','INSERT INTO','DELETE FROM',
  'SELECT','FROM','WHERE','HAVING','LIMIT','OFFSET',
  'UNION','INTERSECT','EXCEPT','VALUES','SET','WITH','JOIN','UPDATE'
];
function _sqlSplitComma(str){
  const parts=[];let depth=0,cur='';
  for(const c of str){
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(c===','&&depth===0){parts.push(cur.trim());cur='';}else cur+=c;
  }
  if(cur.trim())parts.push(cur.trim());
  return parts;
}
function _sqlSplitAndOr(str){
  const parts=[];let depth=0,cur='',i=0;const u=str.toUpperCase();
  while(i<str.length){
    const c=str[i];
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(depth===0&&i>0&&/\s/.test(str[i-1])){
      if(u.startsWith('AND ',i)){if(cur.trim())parts.push(cur.trim());cur='AND ';i+=4;continue;}
      if(u.startsWith('OR ',i)){if(cur.trim())parts.push(cur.trim());cur='OR ';i+=3;continue;}
    }
    cur+=str[i];i++;
  }
  if(cur.trim())parts.push(cur.trim());
  return parts;
}
function _sqlFindOn(str){
  let depth=0;const u=str.toUpperCase();
  for(let i=0;i<str.length-3;i++){
    if(str[i]==='(')depth++;else if(str[i]===')')depth--;
    if(depth===0&&u.slice(i,i+4)===' ON ')return i;
  }
  return -1;
}
function _segmentSQL(sql){
  const s=sql.replace(/\s+/g,' ').trim();const u=s.toUpperCase();
  const segs=[];let cur='',curKw=null,i=0,depth=0;
  function matchKw(p){
    if(p>0&&!/[\s,)]/.test(s[p-1]))return null;
    for(const kw of _SQL_CLAUSE_KWS){
      if(u.startsWith(kw,p)){
        const nx=s[p+kw.length];
        if(!nx||/[\s(]/.test(nx))return kw;
      }
    }
    return null;
  }
  while(i<s.length){
    const c=s[i];
    if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;
    if(depth===0){
      const kw=matchKw(i);
      if(kw){
        if(curKw||cur.trim())segs.push({kw:curKw,body:cur.trim()});
        curKw=kw;cur='';i+=kw.length;continue;
      }
    }
    cur+=c;i++;
  }
  if(curKw||cur.trim())segs.push({kw:curKw,body:cur.trim()});
  return segs;
}
function formatSQLDBeaver(rawSql){
  const IND='    ';
  const JOIN_KWS=new Set(['LEFT OUTER JOIN','RIGHT OUTER JOIN','FULL OUTER JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN','FULL JOIN','JOIN']);
  const COMMA_KWS=new Set(['SELECT','GROUP BY','ORDER BY','SET','VALUES']);
  const ANDOR_KWS=new Set(['WHERE','HAVING']);
  let sql=rawSql.replace(/[\r\n\t]+/g,' ').replace(/ {2,}/g,' ').trim();
  const upPat=new RegExp('(?<![\\w\'"`])('+[..._FMT_NL,..._FMT_KW].join('|')+')(?![\\w\'"`])','gi');
  sql=sql.replace(upPat,(_,kw)=>kw.replace(/\s+/g,' ').toUpperCase());
  const segs=_segmentSQL(sql);
  const out=[];
  for(const {kw,body} of segs){
    if(!kw&&!body)continue;
    if(!kw){out.push(body);continue;}
    out.push(kw);
    if(!body)continue;
    if(COMMA_KWS.has(kw)){
      const items=_sqlSplitComma(body);
      items.forEach((item,idx)=>out.push(IND+item+(idx<items.length-1?',':'')));
    }else if(ANDOR_KWS.has(kw)){
      _sqlSplitAndOr(body).forEach(cond=>out.push(IND+cond));
    }else if(JOIN_KWS.has(kw)){
      const onIdx=_sqlFindOn(body);
      if(onIdx>-1){
        out.push(IND+body.slice(0,onIdx).trim());
        const onConds=_sqlSplitAndOr(body.slice(onIdx+4).trim());
        out.push(IND+'ON '+onConds[0]);
        for(let j=1;j<onConds.length;j++)out.push(IND+IND+onConds[j]);
      }else{
        out.push(IND+body);
      }
    }else{
      out.push(IND+body);
    }
  }
  return out.join('\n');
}
// ── SQL Highlighter ──
const _TBL_COLORS=['#60a5fa','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#22d3ee','#4ade80'];
const _SQL_RESERVED=new Set(['where','on','set','having','order','group','limit','offset','inner','left','right','cross','full','join','and','or','not','in','is','as','by','select','from','union','values','update','delete','insert','with','distinct','case','when','then','else','end']);
function analyzeSQL(sql){
  const aliasMap={};let m;
  const fromRe=/\bFROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\b/gi;
  while((m=fromRe.exec(sql))!==null){
    const tbl=m[1].toLowerCase();const alias=(m[2]||m[1]).toLowerCase();
    if(!_SQL_RESERVED.has(alias))aliasMap[alias]=tbl;
  }
  const joinRe=/\b(?:(?:LEFT|RIGHT|INNER|CROSS|FULL)(?:\s+OUTER)?\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\b/gi;
  while((m=joinRe.exec(sql))!==null){
    const tbl=m[1].toLowerCase();const alias=(m[2]||m[1]).toLowerCase();
    if(!_SQL_RESERVED.has(alias))aliasMap[alias]=tbl;
  }
  const tableNames=[...new Set(Object.values(aliasMap))];
  const colorMap={};
  tableNames.forEach((t,i)=>{colorMap[t]=_TBL_COLORS[i%_TBL_COLORS.length];});
  // Detect duplicate column names across different tables
  const colsByName={};
  const colRe=/\b(\w+)\.(\w+)\b/g;
  while((m=colRe.exec(sql))!==null){
    const alias=m[1].toLowerCase();const col=m[2].toLowerCase();
    if(!aliasMap[alias])continue;
    if(!colsByName[col])colsByName[col]=new Set();
    colsByName[col].add(aliasMap[alias]);
  }
  const dupCols=new Set(Object.entries(colsByName).filter(([,ts])=>ts.size>1).map(([c])=>c));
  return{aliasMap,colorMap,tableNames,dupCols};
}
function highlightSQLHtml(sql,aliasMap,colorMap){
  let html=escHtml(sql);
  // Highlight table names after FROM / JOIN
  const tableNames=[...new Set(Object.values(aliasMap))].sort((a,b)=>b.length-a.length);
  for(const tbl of tableNames){
    const color=colorMap[tbl];
    const re=new RegExp('(\\bFROM\\s+|\\bJOIN\\s+)('+tbl+')\\b','gi');
    html=html.replace(re,(_,prefix,name)=>`${prefix}<span style="color:${color};font-weight:600;opacity:.75">${name}</span>`);
  }
  // Highlight alias.column
  const aliases=Object.keys(aliasMap).sort((a,b)=>b.length-a.length);
  for(const alias of aliases){
    const color=colorMap[aliasMap[alias]];
    const re=new RegExp('\\b('+alias+')\\.(\\w+)\\b','gi');
    html=html.replace(re,(_,a,col)=>`<span style="color:${color};font-weight:500">${a}.<span style="opacity:.8">${col}</span></span>`);
  }
  return html;
}
function convertSQL(){
  const input=document.getElementById('sql-input').value.trim();
  const errEl=document.getElementById('sql-error');errEl.classList.remove('visible');errEl.textContent='';
  const resultsEl=document.getElementById('sql-results');resultsEl.innerHTML='';
  if(!input){showSqlErr('กรุณาวาง Java code หรือ SQL ก่อน');return;}
  const doFormat=document.getElementById('sql-format-check').checked;
  const mode=detectMode(input);
  let sqls=[];
  try{
    switch(mode){
      case'TEXTBLOCK':{const re=/"""([\s\S]*?)"""/g;let m;while((m=re.exec(input))!==null){const s=parseTextBlockContent(m[1]);if(s.trim())sqls.push(s);}break;}
      case'APPEND':{for(const b of splitAppendBlocks(input)){const s=parseAppend(b);if(s.trim())sqls.push(s);}break;}
      case'CONCAT':{for(const b of splitConcatBlocks(input)){const s=parseConcat(b);if(s.trim())sqls.push(s);}break;}
      case'ANNOTATION':{const s=parseAnnotationQuery(input);if(s.trim())sqls.push(s);break;}
      case'STRFORMAT':{const s=parseStringFormat(input);if(s.trim())sqls.push(s);break;}
      case'MYBATIS_XML':{const re=/<(?:select|insert|update|delete)[^>]*>([\s\S]*?)<\/(?:select|insert|update|delete)>/gi;let m;while((m=re.exec(input))!==null){const s=m[1].trim();if(s)sqls.push(s);}break;}
      default:{const s=parsePlain(input);if(s.trim())sqls.push(s);}
    }
  }catch(e){showSqlErr('Parse error: '+e.message);return;}
  if(!sqls.length){showSqlErr('ไม่พบ SQL string ในโค้ด');return;}
  if(doFormat) sqls=sqls.map(formatSQLDBeaver);
  const multi=sqls.length>1;
  sqls.forEach((sql,i)=>{
    const{aliasMap,colorMap,tableNames,dupCols}=analyzeSQL(sql);
    const hasHighlight=tableNames.length>0;
    const card=document.createElement('div');card.className='sql-result-card';
    // Header
    const hdr=document.createElement('div');hdr.className='sql-result-header';
    const lbl=document.createElement('span');lbl.className='sql-result-label';lbl.textContent=multi?`SQL #${i+1}`:'SQL';
    hdr.appendChild(lbl);
    // Table legend
    if(hasHighlight){
      const legend=document.createElement('div');legend.className='sql-legend';
      tableNames.forEach(t=>{
        const item=document.createElement('span');item.className='sql-legend-item';
        item.innerHTML=`<span class="sql-legend-dot" style="background:${colorMap[t]}"></span>${escHtml(t)}`;
        legend.appendChild(item);
      });
      hdr.appendChild(legend);
    }
    const btn=document.createElement('button');btn.className='btn btn-ghost btn-sm';btn.textContent='📋 Copy';
    hdr.appendChild(btn);
    // Body
    const pre=document.createElement('pre');pre.className='sql-result-body';
    if(hasHighlight){pre.innerHTML=highlightSQLHtml(sql,aliasMap,colorMap);}
    else{pre.textContent=sql;}
    btn.onclick=()=>copyText(pre.textContent);
    card.appendChild(hdr);card.appendChild(pre);
    resultsEl.appendChild(card);
  });
}
function showSqlErr(msg){const el=document.getElementById('sql-error');el.textContent=msg;el.classList.add('visible');}
function clearSQL(){
  document.getElementById('sql-input').value='';
  document.getElementById('sql-results').innerHTML='';
  document.getElementById('sql-error').classList.remove('visible');
  document.getElementById('sql-detect-badge').textContent='—';
}

// ── DIFF ──
let diffMode='char';
function diffModeChange(){diffMode=document.querySelector('input[name="diff-mode"]:checked').value;}
function compareText(){
  let l=document.getElementById('diff-left').value;
  let rr=document.getElementById('diff-right').value;
  try{l=JSON.stringify(JSON.parse(l),null,2);rr=JSON.stringify(JSON.parse(rr),null,2);}catch(e){}
  const res=document.getElementById('diff-result');
  const stats=document.getElementById('diff-stats');
  res.innerHTML='';
  let addedCount=0,removedCount=0;
  if(diffMode==='line'){
    const diff=Diff.diffLines(l,rr);
    diff.forEach(p=>{
      p.value.split('\n').forEach((line,li,arr)=>{
        if(li===arr.length-1&&line==='')return;
        const s=document.createElement('span');
        if(p.added){s.className='diff-line-added';addedCount++;s.textContent='+ '+line;}
        else if(p.removed){s.className='diff-line-removed';removedCount++;s.textContent='- '+line;}
        else{s.className='diff-line-equal';s.textContent='  '+line;}
        res.appendChild(s);
      });
    });
  }else{
    const diff=Diff.diffChars(l,rr);
    diff.forEach(p=>{
      const s=document.createElement('span');
      if(p.added){s.className='diff-added';addedCount+=p.value.length;}
      else if(p.removed){s.className='diff-removed';removedCount+=p.value.length;}
      s.textContent=p.value;
      res.appendChild(s);
    });
  }
  stats.style.display='flex';
  document.getElementById('diff-added-count').textContent='+'+(diffMode==='line'?addedCount+' lines added':addedCount+' chars added');
  document.getElementById('diff-removed-count').textContent='-'+(diffMode==='line'?removedCount+' lines removed':removedCount+' chars removed');
}
function clearDiff(){document.getElementById('diff-left').value='';document.getElementById('diff-right').value='';document.getElementById('diff-result').innerHTML='';document.getElementById('diff-stats').style.display='none';}

// ── JSON ──
let jsonLiveMode=true;
let currentJsonView='editor';
function switchJsonView(mode){
  currentJsonView=mode;
  ['editor','tree','split'].forEach(m=>{
    document.getElementById('json-'+m+'-pane').style.display=m===mode?'block':'none';
    document.getElementById('json-btn-'+m).classList.toggle('active',m===mode);
  });
  if(mode==='tree'||mode==='split')refreshJsonTree();
}
function toggleJsonLive(){jsonLiveMode=document.getElementById('json-live').checked;}
function onJsonInput(){
  const txt = document.getElementById('json-input');
  syncLineNumbers('json-input', 'json-gutter');
  const errEl=document.getElementById('json-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  if(txt.value.trim() === '') return;
  if(jsonLiveMode){
    try{
      JSON.parse(txt.value);
    } catch(e){
      renderJsonError(e, txt.value, 'json-error');
    }
  }
  if(currentJsonView==='tree')refreshJsonTree();
  runJsonPath();
}
function onJsonSplitInput(){
  const src=document.getElementById('json-input-split').value;
  syncLineNumbers('json-input-split', 'json-split-gutter');
  const errEl=document.getElementById('json-split-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  document.getElementById('json-input').value=src;
  syncLineNumbers('json-input', 'json-gutter');
  try{
    const obj=JSON.parse(src);
    document.getElementById('json-tree-split').innerHTML='';
    document.getElementById('json-tree-split').appendChild(buildTree(obj,null,0));
  }catch(e){
    renderJsonError(e, src, 'json-split-error');
    document.getElementById('json-tree-split').innerHTML='';
  }
}
function formatJSON(sp){
  const txt = document.getElementById('json-input');
  const errEl=document.getElementById('json-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  try{
    const val=JSON.stringify(JSON.parse(txt.value),null,sp||undefined);
    txt.value=val;
    syncLineNumbers('json-input', 'json-gutter');
    if(currentJsonView==='split'){
      document.getElementById('json-input-split').value=val;
      syncLineNumbers('json-input-split', 'json-split-gutter');
      onJsonSplitInput();
    }
    refreshJsonTree();runJsonPath();
  }catch(e){
    renderJsonError(e, txt.value, 'json-error');
    showToast('Invalid JSON ❌');
  }
}
function formatJSONSplit(sp){
  const txt = document.getElementById('json-input-split');
  try{
    const val=JSON.stringify(JSON.parse(txt.value),null,sp||undefined);
    txt.value=val;
    syncLineNumbers('json-input-split', 'json-split-gutter');
    onJsonSplitInput();
  }catch(e){
    renderJsonError(e, txt.value, 'json-split-error');
    showToast('Invalid JSON ❌');
  }
}
function clearJSON(){
  document.getElementById('json-input').value='';
  document.getElementById('json-error').style.display='none';
  document.getElementById('json-error').innerHTML='';
  document.getElementById('jsonpath-input').value='';
  document.getElementById('jsonpath-result').style.display='none';
  document.getElementById('json-tree-output').innerHTML='';
  document.getElementById('json-tree-stats').textContent='';
  if(document.getElementById('json-input-split'))document.getElementById('json-input-split').value='';
  if(document.getElementById('json-tree-split'))document.getElementById('json-tree-split').innerHTML='';
  syncLineNumbers('json-input', 'json-gutter');
  syncLineNumbers('json-input-split', 'json-split-gutter');
}
// ── JSON LINE NUMBERS & RICH ERROR RENDERERS ──
function syncLineNumbers(txtId, gutId) {
  const txt = document.getElementById(txtId);
  const gut = document.getElementById(gutId);
  if (!txt || !gut) return;
  const lines = txt.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += `<div>${i}</div>`;
  }
  gut.innerHTML = html;
  gut.scrollTop = txt.scrollTop;
}
function initJsonLineNumbers() {
  const pairs = [
    { txt: 'json-input', gut: 'json-gutter' },
    { txt: 'json-input-split', gut: 'json-split-gutter' }
  ];
  pairs.forEach(p => {
    const txt = document.getElementById(p.txt);
    const gut = document.getElementById(p.gut);
    if (!txt || !gut) return;
    const update = () => syncLineNumbers(p.txt, p.gut);
    txt.addEventListener('input', update);
    txt.addEventListener('scroll', () => { gut.scrollTop = txt.scrollTop; });
    txt.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = txt.selectionStart;
        const end = txt.selectionEnd;
        const val = txt.value;
        txt.value = val.substring(0, start) + '  ' + val.substring(end);
        txt.selectionStart = txt.selectionEnd = start + 2;
        txt.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    update();
  });
}
function renderJsonError(error, jsonText, elementId) {
  const errEl = document.getElementById(elementId);
  if (!errEl) return;
  if (!jsonText || !error) {
    errEl.style.display = 'none';
    errEl.innerHTML = '';
    return;
  }
  let lineNum = null;
  let colNum = null;
  const lineColMatch = error.message.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    lineNum = parseInt(lineColMatch[1], 10);
    colNum = parseInt(lineColMatch[2], 10);
  } else {
    const posMatch = error.message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const linesBefore = jsonText.substring(0, pos).split('\n');
      lineNum = linesBefore.length;
      colNum = linesBefore[linesBefore.length - 1].length + 1;
    }
  }
  let html = '';
  if (lineNum !== null) {
    const lines = jsonText.split('\n');
    const start = Math.max(0, lineNum - 3);
    const end = Math.min(lines.length - 1, lineNum + 1);
    let contextHtml = '';
    for (let i = start; i <= end; i++) {
      const isErrorLine = (i === lineNum - 1);
      const lineStr = String(i + 1).padStart(5, ' ');
      const content = escHtml(lines[i]);
      if (isErrorLine) {
        contextHtml += `<span class="json-error-line-active">${lineStr} | ${content}</span>`;
        if (colNum !== null && colNum > 0) {
          const padding = ' '.repeat(colNum - 1 + 8);
          contextHtml += `<span class="json-error-pointer">${padding}^ ${escHtml(error.message.split(' at ')[0])}</span>\n`;
        }
      } else {
        contextHtml += `${lineStr} | ${content}\n`;
      }
    }
    html = `
      <div class="json-error-card">
        <div class="json-error-title">⚠️ JSON รูปแบบไม่ถูกต้อง (บรรทัดที่ ${lineNum}, คอลัมน์ที่ ${colNum})</div>
        <div class="json-error-context">${contextHtml}</div>
      </div>
    `;
  } else {
    html = `
      <div class="json-error-card">
        <div class="json-error-title">⚠️ JSON รูปแบบไม่ถูกต้อง</div>
        <div style="font-family:var(--mono); font-size:.76rem; color:var(--text); margin-top: 4px;">${escHtml(error.message)}</div>
      </div>
    `;
  }
  errEl.innerHTML = html;
  errEl.style.display = 'block';
}
function refreshJsonTree(){
  const src=document.getElementById('json-input').value.trim();
  const outEl=document.getElementById('json-tree-output');
  const statsEl=document.getElementById('json-tree-stats');
  if(!src){outEl.innerHTML='';statsEl.textContent='';return;}
  try{
    const obj=JSON.parse(src);
    outEl.innerHTML='';
    const tree=buildTree(obj,null,0,true);
    outEl.appendChild(tree);
    const keys=countKeys(obj);
    statsEl.textContent=`${keys.total} nodes · depth ${keys.depth}`;
  }catch(e){outEl.innerHTML=`<span style="color:var(--danger);">⚠ ${escHtml(e.message)}</span>`;statsEl.textContent='';}
}
function countKeys(obj,d=0){
  if(obj===null||typeof obj!=='object')return{total:1,depth:d};
  let total=0,maxD=d;
  for(const v of Object.values(obj)){const r=countKeys(v,d+1);total+=r.total;maxD=Math.max(maxD,r.depth);}
  return{total:total+1,depth:maxD};
}
function buildTree(val,key,depth,isRoot){
  const wrap=document.createElement('div');
  wrap.className='tree-node'+(isRoot?' root-node':'');
  const type=val===null?'null':Array.isArray(val)?'array':typeof val;
  const isComplex=type==='object'||type==='array';
  const line=document.createElement('div');line.className='tree-line';
  if(isComplex){
    const toggle=document.createElement('span');toggle.className='tree-toggle';toggle.textContent='▼';
    toggle.onclick=function(){const ch=wrap.querySelector(':scope > .tree-children');const collapsed=ch.classList.toggle('collapsed');toggle.textContent=collapsed?'▶':'▼';};
    line.appendChild(toggle);
  }
  if(key!==null){const keyEl=document.createElement('span');keyEl.className='tree-key';keyEl.textContent=JSON.stringify(key)+':';line.appendChild(keyEl);}
  if(isComplex){
    const len=Array.isArray(val)?val.length:Object.keys(val).length;
    const openBracket=document.createElement('span');openBracket.className='tree-bracket';openBracket.textContent=Array.isArray(val)?'[':'{';line.appendChild(openBracket);
    const cnt=document.createElement('span');cnt.className='tree-count';cnt.textContent=Array.isArray(val)?len+' items':len+' keys';line.appendChild(cnt);
    const copyBtn=document.createElement('button');copyBtn.className='tree-copy-btn';copyBtn.textContent='copy';
    copyBtn.onclick=e=>{e.stopPropagation();copyText(JSON.stringify(val,null,2));};
    line.appendChild(copyBtn);wrap.appendChild(line);
    const children=document.createElement('div');children.className='tree-children';
    const entries=Array.isArray(val)?val.map((v,i)=>[i,v]):Object.entries(val);
    for(const[k,v]of entries)children.appendChild(buildTree(v,k,depth+1,false));
    const closeLine=document.createElement('div');closeLine.className='tree-line';
    const closeBracket=document.createElement('span');closeBracket.className='tree-bracket';closeBracket.textContent=Array.isArray(val)?']':'}';
    closeLine.appendChild(closeBracket);children.appendChild(closeLine);wrap.appendChild(children);
  }else{
    const colon=document.createElement('span');colon.className='tree-colon';colon.textContent='';
    const valEl=document.createElement('span');
    if(type==='string'){valEl.className='tree-val-string';valEl.textContent=JSON.stringify(val);}
    else if(type==='number'){valEl.className='tree-val-number';valEl.textContent=val;}
    else if(type==='boolean'){valEl.className='tree-val-boolean';valEl.textContent=val;}
    else{valEl.className='tree-val-null';valEl.textContent='null';}
    const copyBtn=document.createElement('button');copyBtn.className='tree-copy-btn';copyBtn.textContent='copy';
    copyBtn.onclick=e=>{e.stopPropagation();copyText(type==='string'?val:String(val));};
    line.appendChild(colon);line.appendChild(valEl);line.appendChild(copyBtn);wrap.appendChild(line);
  }
  return wrap;
}
function jsonTreeExpandAll(){document.querySelectorAll('#json-tree-output .tree-children').forEach(el=>el.classList.remove('collapsed'));document.querySelectorAll('#json-tree-output .tree-toggle').forEach(el=>el.textContent='▼');}
function jsonTreeCollapseAll(){document.querySelectorAll('#json-tree-output .tree-children').forEach(el=>el.classList.add('collapsed'));document.querySelectorAll('#json-tree-output .tree-toggle').forEach(el=>el.textContent='▶');}

// JSONPath
function runJsonPath(){
  const path=document.getElementById('jsonpath-input').value.trim();
  const el=document.getElementById('jsonpath-result');
  if(!path){el.style.display='none';return;}
  el.style.display='block';
  try{
    const obj=JSON.parse(document.getElementById('json-input').value);
    const results=jsonPathQuery(obj,path);
    el.textContent=results.length===1?JSON.stringify(results[0],null,2):JSON.stringify(results,null,2);
  }catch(e){el.textContent='⚠ '+e.message;}
}
function jsonPathQuery(root,path){
  if(!path||path==='$')return[root];
  let clean=path.startsWith('$')?path.slice(1):path;
  const tokens=[];
  const re=/\['([^']*)'\]|\["([^"]*)"\]|\[(\d+|\*)\]|\.\.([a-zA-Z_$*][a-zA-Z0-9_$]*)|\[(\d+|\*)\]|\.([a-zA-Z_$*][a-zA-Z0-9_$]*)/g;
  let m;
  while((m=re.exec(clean))!==null){
    if(m[1]!==undefined)tokens.push({type:'key',key:m[1]});
    else if(m[2]!==undefined)tokens.push({type:'key',key:m[2]});
    else if(m[3]!==undefined)tokens.push({type:m[3]==='*'?'wild':'index',index:parseInt(m[3])});
    else if(m[4]!==undefined)tokens.push({type:m[4]==='*'?'wild':'recursive',key:m[4]});
    else if(m[5]!==undefined)tokens.push({type:m[5]==='*'?'wild':'index',index:parseInt(m[5])});
    else if(m[6]!==undefined)tokens.push({type:m[6]==='*'?'wild':'key',key:m[6]});
  }
  function step(nodes,token){
    const results=[];
    for(const node of nodes){
      if(token.type==='key'){if(node&&typeof node==='object'&&!Array.isArray(node)&&node[token.key]!==undefined)results.push(node[token.key]);}
      else if(token.type==='index'){if(Array.isArray(node)&&node[token.index]!==undefined)results.push(node[token.index]);}
      else if(token.type==='wild'){if(Array.isArray(node))results.push(...node);else if(node&&typeof node==='object')results.push(...Object.values(node));}
      else if(token.type==='recursive'){
        (function recurse(n){
          if(!n||typeof n!=='object')return;
          if(n[token.key]!==undefined)results.push(n[token.key]);
          for(const v of Object.values(n))recurse(v);
        })(node);
      }
    }
    return results;
  }
  let nodes=[root];
  for(const t of tokens)nodes=step(nodes,t);
  return nodes;
}

// ── UNIX ──
function convertUnix(){
  const val=document.getElementById('unix-input').value.trim();
  if(!val){document.getElementById('unix-result').textContent='—';document.getElementById('unix-ms').textContent='';return;}
  const num=parseFloat(val);
  const ts=num>1e10?num:num*1000;
  const d=new Date(ts);
  if(isNaN(d)){document.getElementById('unix-result').textContent='ค่าไม่ถูกต้อง';return;}
  document.getElementById('unix-result').textContent=d.toLocaleString('th-TH',{dateStyle:'full',timeStyle:'long'});
  document.getElementById('unix-ms').textContent=`ms: ${ts} · ISO: ${d.toISOString()}`;
}
function nowUnix(){const n=Date.now();document.getElementById('unix-input').value=Math.floor(n/1000);convertUnix();}
function clearUnix(){document.getElementById('unix-input').value='';document.getElementById('unix-result').textContent='—';document.getElementById('unix-ms').textContent='';}

// ── BASE64 ──
function b64Encode(){
  const txt=document.getElementById('b64-input').value;const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    const encBytes=new TextEncoder().encode(txt);let encoded=btoa(String.fromCharCode(...encBytes));
    if(document.getElementById('b64-urlsafe').checked)encoded=encoded.replace(/\+/g,'-').replace(/\//g,'_');
    if(document.getElementById('b64-nopad').checked)encoded=encoded.replace(/=+$/,'');
    document.getElementById('b64-output').textContent=encoded;
  }catch(e){errEl.textContent='Encode error: '+e.message;errEl.style.display='block';}
}
function b64Decode(){
  const txt=document.getElementById('b64-input').value.trim();const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    let s=txt.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
    const rawBytes=atob(s);let decoded;
    try{decoded=decodeURIComponent(rawBytes.split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));}
    catch(e2){decoded=rawBytes;}
    document.getElementById('b64-output').textContent=decoded;
  }catch(e){errEl.textContent='Decode error: invalid Base64';errEl.style.display='block';}
}
function clearBase64(){document.getElementById('b64-input').value='';document.getElementById('b64-output').textContent='—';document.getElementById('b64-error').style.display='none';}

// ── CRON ──
let currentCron='* * * * *';
let cronTz='Asia/Bangkok';
function onCronTzChange(){
  cronTz=document.getElementById('cron-tz').value;
  updateCronDisplay(currentCron);
  updateTzClock();
  try{localStorage.setItem('isaan-devtools-tz',cronTz);}catch(e){}
}
function updateTzClock(){
  const el=document.getElementById('cron-tz-now');if(!el)return;
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('th-TH',{timeZone:cronTz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const dateStr=now.toLocaleDateString('th-TH',{timeZone:cronTz,day:'2-digit',month:'short',year:'2-digit'});
    el.innerHTML=`<span style="font-size:.68rem;color:var(--text-muted);">ตอนนี้</span>&nbsp;<span style="color:var(--accent2);font-weight:600;">${timeStr}</span>&nbsp;<span style="color:var(--text-dim);font-size:.74rem;">${dateStr}</span>`;
  }
  catch(e){el.textContent='';}
}
function buildCron(){
  const m=document.getElementById('c-min').value,h=document.getElementById('c-hr').value,d=document.getElementById('c-dom').value,mo=document.getElementById('c-mon').value,dw=document.getElementById('c-dow').value;
  currentCron=`${m} ${h} ${d} ${mo} ${dw}`;updateCronDisplay(currentCron);
}
function parseCronManual(){const v=document.getElementById('cron-manual').value.trim();if(!v)return;currentCron=v;updateCronDisplay(v);}
function loadPreset(expr){document.getElementById('cron-manual').value=expr;currentCron=expr;updateCronDisplay(expr);}
function updateCronDisplay(expr){
  document.getElementById('cron-expr-display').textContent=expr;
  document.getElementById('cron-human').textContent=cronToHuman(expr);
  renderNextRuns(expr);
}
function cronToHuman(expr){
  const parts=expr.trim().split(/\s+/);if(parts.length<5)return'รูปแบบไม่ถูกต้อง';
  const[min,hr,dom,mon,dow]=parts;
  const THdays=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const THmons=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const p=[];
  if(min==='*')p.push('ทุกนาที');else if(min.startsWith('*/'))p.push('ทุก '+min.slice(2)+' นาที');else p.push('นาทีที่ '+min);
  if(hr!=='*'){if(hr.startsWith('*/'))p.push('ทุก '+hr.slice(2)+' ชั่วโมง');else if(hr.includes(','))p.push('เวลา '+hr.split(',').map(h=>`${h}:00`).join(', '));else p.push('เวลา '+hr+':'+(min==='*'?'00':min.padStart(2,'0'))+' น.');}
  if(dow!=='*'){if(dow==='1-5')p.push('เฉพาะวันทำงาน (จ–ศ)');else if(dow==='0,6')p.push('เฉพาะวันหยุด');else if(!dow.includes(',')&&!dow.includes('-'))p.push('วัน'+(THdays[parseInt(dow)]||dow));else p.push('วัน '+dow);}
  if(dom!=='*'){if(dom==='L')p.push('วันสุดท้ายของเดือน');else p.push('วันที่ '+dom+' ของเดือน');}
  if(mon!=='*'){if(!mon.includes(',')&&!mon.includes('-'))p.push('เดือน '+(THmons[parseInt(mon)]||mon));else p.push('เดือน '+mon);}
  return p.length?p.join(' · '):'ทุกนาที';
}
function copySpring(){copyText(`@Scheduled(cron = "${currentCron}")`);showToast('Copied @Scheduled ✓');}
function copyQuartz(){copyText(`@Scheduled(cron = "0 ${currentCron}")`);showToast('Copied Quartz ✓');}
function clearCron(){
  document.getElementById('cron-manual').value='';
  ['c-min','c-hr','c-dom','c-mon','c-dow'].forEach(id=>{document.getElementById(id).selectedIndex=0;});
  currentCron='* * * * *';updateCronDisplay('* * * * *');
}
function cronMatchField(val,field){
  if(field==='*'||field==='L')return true;
  if(field.startsWith('*/'))return(val%parseInt(field.slice(2)))===0;
  if(field.includes(',')){return field.split(',').some(f=>cronMatchField(val,f.trim()));}
  if(field.includes('-')){const[lo,hi]=field.split('-').map(Number);return val>=lo&&val<=hi;}
  return val===parseInt(field);
}
function cronNextRuns(expr,count=5){
  const parts=expr.trim().split(/\s+/);if(parts.length<5)return[];
  const[minF,hrF,domF,monF,dowF]=parts;
  const results=[];
  const now=new Date();now.setSeconds(0,0);now.setMinutes(now.getMinutes()+1);
  let iter=0;
  while(results.length<count&&iter<60*24*366){
    iter++;
    if(cronMatchField(now.getMinutes(),minF)&&cronMatchField(now.getHours(),hrF)&&cronMatchField(now.getDate(),domF)&&cronMatchField(now.getMonth()+1,monF)&&cronMatchField(now.getDay(),dowF))results.push(new Date(now));
    now.setMinutes(now.getMinutes()+1);
  }
  return results;
}
function renderNextRuns(expr){
  const list=document.getElementById('next-runs-list');if(!list)return;
  const runs=cronNextRuns(expr,5);
  if(!runs.length){list.innerHTML='<div style="color:var(--text-dim);font-size:.76rem;">ไม่สามารถคำนวณได้</div>';return;}
  const now=Date.now();
  list.innerHTML=runs.map((d,i)=>{
    const diff=d.getTime()-now;
    const rel=diff<60000?'< 1 นาที':diff<3600000?Math.floor(diff/60000)+' นาที':diff<86400000?Math.floor(diff/3600000)+' ชั่วโมง':Math.floor(diff/86400000)+' วัน';
    let tzStr='';
    try{tzStr=d.toLocaleString('th-TH',{timeZone:cronTz,dateStyle:'short',timeStyle:'short'});}
    catch(e){tzStr=d.toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'});}
    return`<div class="next-run-item"><span class="next-run-num">${i+1}.</span><span class="next-run-time">${tzStr}</span><span class="next-run-rel">อีก ${rel}</span></div>`;
  }).join('');
}

// ── REGEX ──
function loadRegex(pat,flags){document.getElementById('regex-pattern').value=pat;document.getElementById('regex-flags').value=flags||'g';runRegex();}
function runRegex(){
  const patStr=document.getElementById('regex-pattern').value;
  const flags=document.getElementById('regex-flags').value||'g';
  const input=document.getElementById('regex-input').value;
  const errEl=document.getElementById('regex-error'),hlEl=document.getElementById('regex-highlight'),grEl=document.getElementById('regex-groups'),cntEl=document.getElementById('regex-count');
  errEl.textContent='';
  if(!patStr){hlEl.textContent=input;grEl.innerHTML='';cntEl.textContent='0 matches';return;}
  let regex;
  try{const f=flags.includes('g')?flags:flags+'g';regex=new RegExp(patStr,f);}
  catch(e){errEl.textContent='⚠ '+e.message;hlEl.textContent=input;return;}
  const matches=[];let lastIndex=-1;
  const scanRe=new RegExp(patStr,flags.includes('g')?flags:flags+'g');let m;
  while((m=scanRe.exec(input))!==null){
    if(m[0].length===0&&m.index===lastIndex){scanRe.lastIndex++;continue;}
    lastIndex=m.index;
    matches.push({index:m.index,length:m[0].length,full:m[0],groups:Array.from(m).slice(1)});
    if(!scanRe.global)break;
  }
  cntEl.textContent=matches.length+' match'+(matches.length!==1?'es':'');
  let html='',pos=0;
  for(const match of matches){
    if(match.index>pos)html+=escHtml(input.slice(pos,match.index));
    html+=`<span class="regex-match">${escHtml(match.full)}</span>`;
    pos=match.index+match.length;
  }
  if(pos<input.length)html+=escHtml(input.slice(pos));
  hlEl.innerHTML=html||'<span style="color:var(--text-dim)">— ไม่มีข้อความ —</span>';
  if(!matches.length){grEl.innerHTML='<span style="color:var(--text-dim)">ไม่พบผลลัพธ์</span>';return;}
  let gHtml='';
  matches.slice(0,10).forEach((match,i)=>{
    gHtml+=`<div class="match-item">[${i+1}] "${escHtml(match.full)}" ที่ index ${match.index}</div>`;
    match.groups.forEach((g,gi)=>{if(g!==undefined)gHtml+=`<div class="group-item">group ${gi+1}: "${escHtml(g||'')}"</div>`;});
  });
  if(matches.length>10)gHtml+=`<div style="color:var(--text-dim);margin-top:4px;">... และอีก ${matches.length-10} matches</div>`;
  grEl.innerHTML=gHtml;
}
function clearRegex(){['regex-pattern','regex-flags','regex-input'].forEach(id=>document.getElementById(id).value='');document.getElementById('regex-highlight').innerHTML='';document.getElementById('regex-groups').innerHTML='';document.getElementById('regex-error').textContent='';document.getElementById('regex-count').textContent='0 matches';}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ── NUMBER BASE CONVERTER ──
function numBaseConvert(fromBase, rawVal) {
  const errEl = document.getElementById('nb-error');
  errEl.style.display = 'none';
  const val = rawVal.trim().toUpperCase().replace(/^0[XBO]/, '').replace(/\s/g, '');
  const setIf = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
  if (!val) {
    ['nb-dec','nb-hex','nb-bin','nb-oct'].forEach(id => { if (id !== 'nb-' + fromBase) setIf(id, ''); });
    return;
  }
  let dec;
  try {
    switch (fromBase) {
      case 'dec': if (!/^\d+$/.test(val)) throw new Error('ต้องเป็นตัวเลข 0-9'); dec = parseInt(val, 10); break;
      case 'hex': if (!/^[0-9A-F]+$/.test(val)) throw new Error('ต้องเป็น 0-9, A-F'); dec = parseInt(val, 16); break;
      case 'bin': if (!/^[01]+$/.test(val)) throw new Error('ต้องเป็น 0 หรือ 1 เท่านั้น'); dec = parseInt(val, 2); break;
      case 'oct': if (!/^[0-7]+$/.test(val)) throw new Error('ต้องเป็น 0-7'); dec = parseInt(val, 8); break;
      default: return;
    }
    if (isNaN(dec) || dec < 0) throw new Error('ค่าไม่ถูกต้อง');
    if (dec > Number.MAX_SAFE_INTEGER) throw new Error('ตัวเลขใหญ่เกิน MAX_SAFE_INTEGER');
  } catch (e) {
    errEl.textContent = '⚠ ' + e.message;
    errEl.style.display = 'block';
    return;
  }
  if (fromBase !== 'dec') setIf('nb-dec', dec.toString(10));
  if (fromBase !== 'hex') setIf('nb-hex', dec.toString(16).toUpperCase());
  if (fromBase !== 'bin') setIf('nb-bin', dec.toString(2));
  if (fromBase !== 'oct') setIf('nb-oct', dec.toString(8));
}
function numBaseSet(n) { const el = document.getElementById('nb-dec'); if (el) el.value = n; numBaseConvert('dec', String(n)); }
function clearNumBase() {
  ['nb-dec','nb-hex','nb-bin','nb-oct'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const errEl = document.getElementById('nb-error'); if (errEl) errEl.style.display = 'none';
}

// ── HASH ──
async function computeHash(){
  const input=document.getElementById('hash-input').value;
  const upper=document.getElementById('hash-uppercase').checked;
  const container=document.getElementById('hash-results');
  if(!input.trim()){container.innerHTML='';return;}
  const algos=[['SHA-256','SHA-256'],['SHA-512','SHA-512'],['SHA-1','SHA-1']];
  const enc=new TextEncoder().encode(input);
  let html='';
  for(const[label,algo]of algos){
    try{
      const buf=await crypto.subtle.digest(algo,enc);
      let hex=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
      if(upper)hex=hex.toUpperCase();
      html+=`<div class="hash-result-row"><div class="hash-algo"><span>${label}</span><button class="btn btn-ghost" onclick="copyText('${hex}')">Copy</button></div><div class="hash-value">${hex}</div></div>`;
    }catch(e){html+=`<div class="hash-result-row"><div class="hash-algo">${label}</div><div style="color:var(--danger);font-size:.76rem;">${e.message}</div></div>`;}
  }
  html+=`<div style="margin-top:8px;font-size:.72rem;color:var(--text-dim);font-family:var(--mono);">Input: ${enc.length} bytes · ${input.length} chars</div>`;
  container.innerHTML=html;
}
function clearHash(){document.getElementById('hash-input').value='';document.getElementById('hash-results').innerHTML='';}

// ── JWT ──
function b64urlDecode(str){
  str=str.trim().replace(/-/g,'+').replace(/_/g,'/');
  while(str.length%4)str+='=';
  if(!/^[A-Za-z0-9+/=]+$/.test(str))throw new Error('ข้อมูล base64 มีอักขระที่ไม่ถูกต้อง');
  const binary=atob(str);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const text=new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(text);
}
let _jwtHeader=null,_jwtPayload=null;
function copyJwtPart(part){const obj=part==='header'?_jwtHeader:_jwtPayload;if(obj)copyText(JSON.stringify(obj,null,2));}
function decodeJWT_UI(){
  let token=document.getElementById('jwt-input').value.trim();
  const container=document.getElementById('jwt-result');
  if(!token){container.innerHTML='';_jwtHeader=null;_jwtPayload=null;return;}
  token=token.replace(/^bearer\s+/i,'').replace(/\s+/g,'');
  try{
    const parts=token.split('.');
    if(parts.length<3)throw new Error('JWT ต้องมี 3 ส่วน คั่นด้วย "." (header.payload.signature)');
    if(parts.length>3)throw new Error('พบ "." มากเกินไป — ตรวจสอบว่า token ครบถ้วนและไม่มีช่องว่าง');
    if(!parts[0])throw new Error('Header ว่างเปล่า');
    if(!parts[1])throw new Error('Payload ว่างเปล่า');
    const header=b64urlDecode(parts[0]);
    const payload=b64urlDecode(parts[1]);
    const sig=parts[2];
    _jwtHeader=header;_jwtPayload=payload;
    const alg=header.alg||'ไม่ระบุ';
    const algColor=alg.startsWith('HS')?'#60a5fa':alg.startsWith('RS')?'#a78bfa':alg.startsWith('ES')?'#34d399':'#94a3b8';
    let meta='';
    if(payload.iat!=null)meta+=`<span>iat: <b>${new Date(payload.iat*1000).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})}</b></span>`;
    if(payload.nbf!=null)meta+=`<span>nbf: <b>${new Date(payload.nbf*1000).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})}</b></span>`;
    if(payload.exp!=null){
      const expDate=new Date(payload.exp*1000);const now=new Date();const expired=expDate<now;const diffMs=expDate-now;
      const diffText=expired?'หมดอายุแล้ว':diffMs<3600000?'อีก ~'+Math.floor(diffMs/60000)+' นาที':diffMs<86400000?'อีก ~'+Math.floor(diffMs/3600000)+' ชั่วโมง':'อีก ~'+Math.floor(diffMs/86400000)+' วัน';
      meta+=`<span>exp: <b style="color:${expired?'var(--danger)':'var(--success)'};">${expDate.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})} (${diffText})</b></span>`;
    }
    if(payload.sub!=null)meta+=`<span>sub: <b>${escHtml(String(payload.sub))}</b></span>`;
    if(payload.iss!=null)meta+=`<span>iss: <b>${escHtml(String(payload.iss))}</b></span>`;
    if(payload.aud!=null)meta+=`<span>aud: <b>${escHtml(Array.isArray(payload.aud)?payload.aud.join(', '):String(payload.aud))}</b></span>`;
    const tokenBytes=new TextEncoder().encode(token).length;
    container.innerHTML=`
      <div class="jwt-section">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid ${algColor}44;color:${algColor};background:${algColor}18;">ALG: ${escHtml(alg)}</span>
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid var(--border);color:var(--text-dim);">TYPE: ${escHtml(header.typ||'JWT')}</span>
          <span style="font-family:var(--mono);font-size:.72rem;color:var(--text-dim);margin-left:auto;">${tokenBytes} bytes</span>
        </div>
        ${meta?`<div class="jwt-meta">${meta}</div>`:''}
      </div>
      <div class="jwt-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="jwt-section-title">HEADER</div>
          <button class="btn btn-ghost" onclick="copyJwtPart('header')">Copy</button>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(header,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="jwt-section-title">PAYLOAD</div>
          <button class="btn btn-ghost" onclick="copyJwtPart('payload')">Copy</button>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(payload,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div class="jwt-section-title">SIGNATURE (ไม่มีการยืนยัน)</div>
        <div class="jwt-sig">${escHtml(sig)}</div>
      </div>`;
  }catch(e){
    let hint='';
    if(e.message.includes('3 ส่วน'))hint='<div style="margin-top:6px;font-size:.74rem;color:var(--text-dim);">💡 JWT มีรูปแบบ: eyXXX.eyXXX.XXXXX — วาง token ทั้งก้อน หรือลบ "Bearer " ออก</div>';
    container.innerHTML=`<div class="jwt-error">⚠ ${escHtml(e.message)}${hint}</div>`;
  }
}
function clearJWT(){document.getElementById('jwt-input').value='';document.getElementById('jwt-result').innerHTML='';_jwtHeader=null;_jwtPayload=null;}

// ── JWT ENCODER ──
function b64urlEncodeBytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
async function jwtEncode() {
  const payloadStr = document.getElementById('jwt-enc-payload').value.trim();
  const secret = document.getElementById('jwt-enc-secret').value;
  const outEl = document.getElementById('jwt-enc-output');
  const errEl = document.getElementById('jwt-enc-error');
  errEl.style.display = 'none';
  outEl.textContent = '—';
  if (!payloadStr) { errEl.textContent = '⚠ กรอก payload JSON'; errEl.style.display = 'block'; return; }
  if (!secret) { errEl.textContent = '⚠ กรอก secret key'; errEl.style.display = 'block'; return; }
  let payload;
  try { payload = JSON.parse(payloadStr); } catch (e) { errEl.textContent = '⚠ payload ไม่ใช่ JSON ที่ถูกต้อง: ' + e.message; errEl.style.display = 'block'; return; }
  try {
    const enc = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(header)));
    const payloadB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(payload)));
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    outEl.textContent = `${data}.${b64urlEncodeBytes(new Uint8Array(sig))}`;
    showToast('JWT สร้างแล้ว ✓');
  } catch (e) {
    errEl.textContent = '⚠ Error: ' + e.message;
    errEl.style.display = 'block';
  }
}
function clearJwtEnc() {
  document.getElementById('jwt-enc-payload').value = '';
  document.getElementById('jwt-enc-secret').value = '';
  document.getElementById('jwt-enc-output').textContent = '—';
  document.getElementById('jwt-enc-error').style.display = 'none';
}

// ── URL ENCODE/DECODE ──
function urlEncode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?encodeURI(input):encodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';}
}
function urlDecode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?decodeURI(input):decodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){errEl.textContent='Decode error: '+e.message;errEl.style.display='block';}
}
function clearURL(){document.getElementById('url-input').value='';document.getElementById('url-output').textContent='—';document.getElementById('url-error').style.display='none';}

// ── COLOR PICKER (Figma-style HSV) ──
// Color math helpers
function hexToRgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');return{r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)};}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('').toUpperCase();}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2;if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
function hslToRgb(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return{r:Math.round(f(0)*255),g:Math.round(f(8)*255),b:Math.round(f(4)*255)};}
// HSV (for the SV square — more natural than HSL for this UI)
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){switch(max){case r:h=((g-b)/d+6)%6;break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;}}return{h:h/6*360,s:max?d/max:0,v:max};}
function hsvToRgb(h,s,v){h/=60;const i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);let r,g,b;switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;default:r=v;g=p;b=q;}return{r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)};}

// State
let currentRGB={r:99,g:102,b:241};
let currentHsv={h:239,s:0.59,v:0.95};
let currentAlpha=1.0;
let _cpDragging=null; // 'sv'|'hue'|'alpha'

// Preset swatches
const CP_PRESETS=['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6','#ffffff','#94a3b8','#1e293b'];

function initCpSwatches(){
  const el=document.getElementById('cp-swatches');if(!el)return;
  el.innerHTML=CP_PRESETS.map(hex=>`<div class="cp-swatch" style="background:${hex};" title="${hex}" onclick="onHexInput('${hex}')"></div>`).join('');
}

// Draw SV square (left=white, right=hue; top=bright, bottom=dark)
function drawSvSquare(){
  const canvas=document.getElementById('cp-sv-canvas');if(!canvas)return;
  const wrap=document.getElementById('cp-sv-wrap');
  canvas.width=wrap.offsetWidth||300;canvas.height=wrap.offsetHeight||195;
  const W=canvas.width,H=canvas.height;
  const ctx=canvas.getContext('2d');
  // Base hue color
  const hueRgb=hsvToRgb(currentHsv.h,1,1);
  // Horizontal: white → hue
  const gradH=ctx.createLinearGradient(0,0,W,0);
  gradH.addColorStop(0,'#ffffff');gradH.addColorStop(1,`rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b})`);
  ctx.fillStyle=gradH;ctx.fillRect(0,0,W,H);
  // Vertical: transparent → black
  const gradV=ctx.createLinearGradient(0,0,0,H);
  gradV.addColorStop(0,'rgba(0,0,0,0)');gradV.addColorStop(1,'rgba(0,0,0,1)');
  ctx.fillStyle=gradV;ctx.fillRect(0,0,W,H);
  // Position cursor
  const cur=document.getElementById('cp-sv-cursor');if(!cur)return;
  cur.style.left=(currentHsv.s*W)+'px';
  cur.style.top=((1-currentHsv.v)*H)+'px';
}

// Draw hue bar
function drawHueBar(){
  const canvas=document.getElementById('cp-hue-canvas');if(!canvas)return;
  const track=document.getElementById('cp-hue-track');
  canvas.width=track.offsetWidth||260;canvas.height=14;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  const grad=ctx.createLinearGradient(0,0,W,0);
  [0,60,120,180,240,300,360].forEach((h,i)=>{const rgb=hsvToRgb(h,1,1);grad.addColorStop(i/6,`rgb(${rgb.r},${rgb.g},${rgb.b})`);});
  ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(0,0,W,H,7);ctx.fill();
  const thumb=document.getElementById('cp-hue-thumb');if(!thumb)return;
  thumb.style.left=(currentHsv.h/360*100)+'%';
}

// Draw alpha bar
function drawAlphaBar(){
  const canvas=document.getElementById('cp-alpha-canvas');if(!canvas)return;
  const track=document.getElementById('cp-alpha-track');
  canvas.width=track.offsetWidth||260;canvas.height=14;
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
  // Checkerboard
  const sz=6;for(let y=0;y<H;y+=sz){for(let x=0;x<W;x+=sz){ctx.fillStyle=(Math.floor(x/sz)+Math.floor(y/sz))%2===0?'#888':'#bbb';ctx.fillRect(x,y,sz,sz);}}
  const{r,g,b}=currentRGB;
  const grad=ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,`rgba(${r},${g},${b},0)`);grad.addColorStop(1,`rgba(${r},${g},${b},1)`);
  ctx.beginPath();ctx.roundRect(0,0,W,H,7);ctx.fillStyle=grad;ctx.fill();
  const thumb=document.getElementById('cp-alpha-thumb');if(!thumb)return;
  thumb.style.left=(currentAlpha*100)+'%';
}

// Master UI update — source of truth is currentHsv + currentAlpha
function updateColorUI(rgb,alpha){
  if(rgb){
    currentRGB={r:Math.round(Math.max(0,Math.min(255,rgb.r))),g:Math.round(Math.max(0,Math.min(255,rgb.g))),b:Math.round(Math.max(0,Math.min(255,rgb.b)))};
    const hsv=rgbToHsv(currentRGB.r,currentRGB.g,currentRGB.b);
    // Preserve hue if color is grey (s≈0)
    if(hsv.s>0.01)currentHsv.h=hsv.h;
    currentHsv.s=hsv.s;currentHsv.v=hsv.v;
  }else{
    currentRGB=hsvToRgb(currentHsv.h,currentHsv.s,currentHsv.v);
  }
  if(alpha!==undefined)currentAlpha=Math.max(0,Math.min(1,alpha));
  const{r,g,b}=currentRGB;
  const hex=rgbToHex(r,g,b);
  const hsl=rgbToHsl(r,g,b);
  const a=currentAlpha;
  // Sync inputs
  const hexEl=document.getElementById('color-hex');if(hexEl&&document.activeElement!==hexEl)hexEl.value=hex;
  const pkEl=document.getElementById('color-picker');if(pkEl)pkEl.value=hex.toLowerCase();
  const setN=(id,v)=>{const el=document.getElementById(id);if(el&&document.activeElement!==el)el.value=v;};
  setN('rgb-r-n',r);setN('rgb-g-n',g);setN('rgb-b-n',b);
  setN('hsl-h-n',hsl.h);setN('hsl-s-n',hsl.s);setN('hsl-l-n',hsl.l);
  // Preview swatch
  const sw=document.getElementById('cp-swatch');if(sw)sw.style.background=`rgba(${r},${g},${b},${a})`;
  // Cursor glow matches color
  const svCur=document.getElementById('cp-sv-cursor');if(svCur)svCur.style.background=hex;
  // Copy boxes
  const $=id=>document.getElementById(id);
  if($('cv-hex'))$('cv-hex').textContent=hex;
  if($('cv-rgb'))$('cv-rgb').textContent=`rgb(${r}, ${g}, ${b})`;
  if($('cv-hsl'))$('cv-hsl').textContent=`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  if($('cv-rgba'))$('cv-rgba').textContent=`rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  if($('cv-css'))$('cv-css').textContent=`--color: ${hex};`;
  // Opacity variants
  const opVars=$('opacity-variants');
  if(opVars)opVars.innerHTML=[0.9,0.75,0.5,0.25].map(oa=>`<div class="cp-val-btn" onclick="copyText('rgba(${r},${g},${b},${oa})')" style="background:rgba(${r},${g},${b},0.12)">rgba(${r},${g},${b},${oa})</div>`).join('');
  // Redraw canvases
  drawSvSquare();drawHueBar();drawAlphaBar();
}

// ── SV Square interaction ──
function svGetXY(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  return{x:Math.max(0,Math.min(rect.width,src.clientX-rect.left)),y:Math.max(0,Math.min(rect.height,src.clientY-rect.top)),W:rect.width,H:rect.height};
}
function svApply(e,el){
  const{x,y,W,H}=svGetXY(e,el);
  currentHsv.s=x/W;currentHsv.v=1-y/H;
  updateColorUI(null);
}
function svDown(e){_cpDragging='sv';svApply(e,e.currentTarget);e.preventDefault();}
function svTouchDown(e){_cpDragging='sv';svApply(e,e.currentTarget);e.preventDefault();}

// ── Hue slider ──
function hueGetX(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  return Math.max(0,Math.min(1,(src.clientX-rect.left)/rect.width));
}
function hueApply(e,el){currentHsv.h=hueGetX(e,el)*360;updateColorUI(null);}
function hueDown(e){_cpDragging='hue';hueApply(e,e.currentTarget);e.preventDefault();}
function hueTouchDown(e){_cpDragging='hue';hueApply(e,e.currentTarget);e.preventDefault();}

// ── Alpha slider ──
function alphaApply(e,el){
  const rect=el.getBoundingClientRect();
  const src=e.touches?e.touches[0]:e;
  currentAlpha=Math.max(0,Math.min(1,(src.clientX-rect.left)/rect.width));
  updateColorUI(null,currentAlpha);
}
function alphaDown(e){_cpDragging='alpha';alphaApply(e,e.currentTarget);e.preventDefault();}
function alphaTouchDown(e){_cpDragging='alpha';alphaApply(e,e.currentTarget);e.preventDefault();}

// ── Global move/up ──
document.addEventListener('mousemove',e=>{
  if(!_cpDragging)return;
  if(_cpDragging==='sv'){const el=document.getElementById('cp-sv-wrap');svApply(e,el);}
  if(_cpDragging==='hue'){const el=document.getElementById('cp-hue-track');hueApply(e,el);}
  if(_cpDragging==='alpha'){const el=document.getElementById('cp-alpha-track');alphaApply(e,el);}
});
document.addEventListener('touchmove',e=>{
  if(!_cpDragging)return;
  if(_cpDragging==='sv'){const el=document.getElementById('cp-sv-wrap');svApply(e,el);e.preventDefault();}
  if(_cpDragging==='hue'){const el=document.getElementById('cp-hue-track');hueApply(e,el);e.preventDefault();}
  if(_cpDragging==='alpha'){const el=document.getElementById('cp-alpha-track');alphaApply(e,el);e.preventDefault();}
},{passive:false});
document.addEventListener('mouseup',()=>{_cpDragging=null;});
document.addEventListener('touchend',()=>{_cpDragging=null;});

// ── Input handlers ──
function onHexInput(v){if(!/^#?[0-9a-fA-F]{6}$/.test(v.replace('#','')))return;try{updateColorUI(hexToRgb(v.startsWith('#')?v:'#'+v));}catch(e){}}
function onPickerInput(v){updateColorUI(hexToRgb(v));}
function onRgbNumInput(){updateColorUI({r:parseInt(document.getElementById('rgb-r-n').value)||0,g:parseInt(document.getElementById('rgb-g-n').value)||0,b:parseInt(document.getElementById('rgb-b-n').value)||0});}
function onHslNumInput(){const rgb=hslToRgb(parseInt(document.getElementById('hsl-h-n').value)||0,parseInt(document.getElementById('hsl-s-n').value)||0,parseInt(document.getElementById('hsl-l-n').value)||0);updateColorUI(rgb);}
// keep old stubs so other code doesn't break
function onRgbInput(){onRgbNumInput();}
function onHslInput(){onHslNumInput();}
function copyColorVal(id){copyText(document.getElementById(id).textContent);}
function pickRandom(){updateColorUI({r:Math.floor(Math.random()*256),g:Math.floor(Math.random()*256),b:Math.floor(Math.random()*256)});}
function resetColor(){currentAlpha=1;updateColorUI({r:99,g:102,b:241});}
function initColorWheel(){
  initCpSwatches();
  // Wait for layout so canvas dimensions are correct
  requestAnimationFrame(()=>{updateColorUI(currentRGB);});
}
function cpSetMode(mode){
  const isRgb=mode==='rgb';
  document.getElementById('cp-rgb-inputs').style.display=isRgb?'':'none';
  document.getElementById('cp-hsl-inputs').style.display=isRgb?'none':'';
  document.getElementById('cp-mode-rgb').classList.toggle('active',isRgb);
  document.getElementById('cp-mode-hsl').classList.toggle('active',!isRgb);
}
// ── KUBECTL ──
const KUBECTL_CMDS=[
  {group:'POD',cmd:'kubectl get pods',desc:'แสดงรายการ pod ทั้งหมดใน namespace ปัจจุบัน'},
  {group:'POD',cmd:'kubectl get pods -n <namespace>',desc:'แสดง pod ใน namespace ที่ระบุ'},
  {group:'POD',cmd:'kubectl get pods -A',desc:'แสดง pod ทุก namespace ในคลัสเตอร์'},
  {group:'POD',cmd:'kubectl get pods -o wide',desc:'แสดงข้อมูลเพิ่มเติม เช่น IP address และ Node'},
  {group:'POD',cmd:'kubectl describe pod <pod-name>',desc:'แสดงรายละเอียด pod รวมถึง events และสถานะ'},
  {group:'POD',cmd:'kubectl delete pod <pod-name>',desc:'ลบ pod (จะสร้างใหม่อัตโนมัติถ้า managed โดย Deployment)'},
  {group:'POD',cmd:'kubectl get pod <pod-name> -o yaml',desc:'ดู spec ของ pod ในรูปแบบ YAML'},
  {group:'LOGS',cmd:'kubectl logs <pod-name>',desc:'ดู log ของ pod'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> -f',desc:'ดู log แบบ follow (real-time stream)'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> --tail=100',desc:'ดู log 100 บรรทัดล่าสุด'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> -c <container>',desc:'ดู log ของ container ที่ระบุใน multi-container pod'},
  {group:'LOGS',cmd:'kubectl logs <pod-name> --previous',desc:'ดู log ของ container ที่ crash ไปแล้ว'},
  {group:'LOGS',cmd:'kubectl logs -l app=<label> --all-containers',desc:'ดู log ของทุก pod ที่มี label ตรงกัน'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec -it <pod-name> -- bash',desc:'เข้า shell ภายใน pod (bash)'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec -it <pod-name> -- sh',desc:'เข้า shell ภายใน pod (sh) สำหรับ Alpine image'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec <pod-name> -- env',desc:'แสดง environment variables ภายใน pod'},
  {group:'EXEC / DEBUG',cmd:'kubectl exec <pod-name> -- curl http://localhost:8080/health',desc:'เรียก endpoint จากภายใน pod โดยตรง'},
  {group:'EXEC / DEBUG',cmd:'kubectl port-forward pod/<pod> 8080:8080',desc:'forward port จาก pod มายัง localhost'},
  {group:'EXEC / DEBUG',cmd:'kubectl port-forward svc/<svc> 8080:80',desc:'forward port จาก service มายัง localhost'},
  {group:'DEPLOYMENT',cmd:'kubectl get deployments',desc:'แสดงรายการ deployment ทั้งหมด'},
  {group:'DEPLOYMENT',cmd:'kubectl describe deployment <name>',desc:'ดูรายละเอียดและ events ของ deployment'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout status deployment/<name>',desc:'ตรวจสอบสถานะการ deploy แบบ real-time'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout restart deployment/<name>',desc:'Restart deployment แบบ rolling update'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout undo deployment/<name>',desc:'Rollback deployment กลับ revision ก่อนหน้า'},
  {group:'DEPLOYMENT',cmd:'kubectl rollout history deployment/<name>',desc:'ดูประวัติการ deploy ทั้งหมด'},
  {group:'DEPLOYMENT',cmd:'kubectl scale deployment <name> --replicas=3',desc:'เพิ่มหรือลด replica ของ deployment'},
  {group:'DEPLOYMENT',cmd:'kubectl set image deployment/<name> <container>=<image>:<tag>',desc:'อัปเดต image ของ deployment'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get svc',desc:'แสดงรายการ service ทั้งหมด'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get ingress',desc:'แสดงรายการ ingress ทั้งหมด'},
  {group:'SERVICE & INGRESS',cmd:'kubectl describe svc <name>',desc:'ดูรายละเอียด service รวม endpoint'},
  {group:'SERVICE & INGRESS',cmd:'kubectl get endpoints <svc-name>',desc:'ดู IP:Port ของ pod ที่ service ชี้ถึง'},
  {group:'CONFIGMAP & SECRET',cmd:'kubectl get configmaps',desc:'แสดงรายการ configmap'},
  {group:'CONFIGMAP & SECRET',cmd:'kubectl get secrets',desc:'แสดงรายการ secret'},
  {group:'CONFIGMAP & SECRET',cmd:"kubectl get secret <name> -o jsonpath='{.data.<key>}' | base64 -d",desc:'อ่านค่า secret แล้ว decode จาก base64'},
  {group:'NAMESPACE',cmd:'kubectl get namespaces',desc:'แสดง namespace ทั้งหมดในคลัสเตอร์'},
  {group:'NAMESPACE',cmd:'kubectl config set-context --current --namespace=<ns>',desc:'เปลี่ยน default namespace ของ context ปัจจุบัน'},
  {group:'NODE & CLUSTER',cmd:'kubectl get nodes',desc:'แสดงรายการ node ทั้งหมดในคลัสเตอร์'},
  {group:'NODE & CLUSTER',cmd:'kubectl top nodes',desc:'ดู CPU/Memory usage ของแต่ละ node'},
  {group:'NODE & CLUSTER',cmd:'kubectl top pods',desc:'ดู CPU/Memory usage ของแต่ละ pod'},
  {group:'NODE & CLUSTER',cmd:'kubectl cluster-info',desc:'แสดงข้อมูล cluster และ API server endpoint'},
  {group:'APPLY & MANAGE',cmd:'kubectl apply -f <file.yaml>',desc:'สร้างหรืออัปเดต resource จาก YAML file'},
  {group:'APPLY & MANAGE',cmd:'kubectl apply -f <dir>/',desc:'Apply ทุก YAML file ใน directory'},
  {group:'APPLY & MANAGE',cmd:'kubectl delete -f <file.yaml>',desc:'ลบ resource ที่กำหนดใน YAML file'},
  {group:'APPLY & MANAGE',cmd:'kubectl diff -f <file.yaml>',desc:'เปรียบเทียบ YAML file กับ resource ที่รันอยู่'},
  {group:'APPLY & MANAGE',cmd:'kubectl get all -n <namespace>',desc:'แสดง resource ทุกประเภทใน namespace'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config get-contexts',desc:'แสดง context ทั้งหมดที่มีใน kubeconfig'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config use-context <name>',desc:'สลับไปใช้ context อื่น (เปลี่ยน cluster หรือ namespace)'},
  {group:'CONTEXT / CONFIG',cmd:'kubectl config current-context',desc:'แสดง context ที่กำลังใช้งานอยู่'},
];

function renderCmdList(cmds,containerId,searchQuery){
  const container=document.getElementById(containerId);container.innerHTML='';
  if(!cmds.length){const e=document.createElement('div');e.style.cssText='color:var(--text-dim);text-align:center;padding:40px;';e.textContent='ไม่พบคำสั่งที่ตรงกัน';container.appendChild(e);return;}
  const groups={};
  for(const c of cmds){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);}
  for(const[grp,items]of Object.entries(groups)){
    const gDiv=document.createElement('div');gDiv.className='kubectl-group';
    const gt=document.createElement('div');gt.className='kubectl-group-title';gt.textContent=grp;gDiv.appendChild(gt);
    for(const item of items){
      const card=document.createElement('div');card.className='cmd-card';
      const txt=document.createElement('div');txt.style.flex='1';
      const codeEl=document.createElement('div');codeEl.className='cmd-code';
      const descEl=document.createElement('div');descEl.className='cmd-desc';
      if(searchQuery&&searchQuery.trim()){
        codeEl.innerHTML=highlightText(item.cmd,searchQuery);
        descEl.innerHTML=highlightText(item.desc,searchQuery);
      }else{
        codeEl.textContent=item.cmd;descEl.textContent=item.desc;
      }
      txt.appendChild(codeEl);txt.appendChild(descEl);
      const copyBtn=document.createElement('button');copyBtn.className='btn btn-ghost';copyBtn.textContent='Copy';
      copyBtn.onclick=()=>copyText(item.cmd);
      card.appendChild(txt);card.appendChild(copyBtn);
      gDiv.appendChild(card);
    }
    container.appendChild(gDiv);
  }
}

function filterKubectl(q){
  const query=(q||'').trim().toLowerCase();
  const cmds=query?KUBECTL_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):KUBECTL_CMDS;
  renderCmdList(cmds,'kubectl-list',query);
}
function clearKubectl(){document.getElementById('kubectl-search').value='';renderCmdList(KUBECTL_CMDS,'kubectl-list','');}

// ── LINUX COMMANDS ──
const LINUX_CMDS=[
  {group:'FILE & DIRECTORY',cmd:'ls -la',desc:'แสดงไฟล์ทั้งหมดรวม hidden files พร้อมสิทธิ์'},
  {group:'FILE & DIRECTORY',cmd:'find /path -name "*.log" -mtime -7',desc:'ค้นหาไฟล์ .log ที่แก้ไขภายใน 7 วัน'},
  {group:'FILE & DIRECTORY',cmd:'find /path -type f -size +100M',desc:'ค้นหาไฟล์ที่มีขนาดใหญ่กว่า 100MB'},
  {group:'FILE & DIRECTORY',cmd:'du -sh /path/*',desc:'แสดงขนาดของไฟล์และ directory แต่ละรายการ'},
  {group:'FILE & DIRECTORY',cmd:'df -h',desc:'แสดงพื้นที่ disk ทั้งหมดในระบบ'},
  {group:'FILE & DIRECTORY',cmd:'cp -r src/ dest/',desc:'คัดลอก directory ทั้งหมดพร้อม recursive'},
  {group:'FILE & DIRECTORY',cmd:'tar -czf archive.tar.gz /path',desc:'บีบอัด directory เป็น .tar.gz'},
  {group:'FILE & DIRECTORY',cmd:'tar -xzf archive.tar.gz -C /target',desc:'แตก archive .tar.gz ไปยัง directory ที่ระบุ'},
  {group:'TEXT & SEARCH',cmd:'grep -rn "pattern" /path',desc:'ค้นหา text ใน file ทุกไฟล์แบบ recursive'},
  {group:'TEXT & SEARCH',cmd:'grep -v "pattern" file.log',desc:'แสดงบรรทัดที่ไม่ตรง pattern'},
  {group:'TEXT & SEARCH',cmd:'grep -E "error|warn|fatal" app.log',desc:'ค้นหาด้วย regex หลาย pattern พร้อมกัน'},
  {group:'TEXT & SEARCH',cmd:'tail -f /var/log/syslog',desc:'ดู log แบบ real-time (follow mode)'},
  {group:'TEXT & SEARCH',cmd:'tail -n 200 app.log',desc:'แสดง 200 บรรทัดล่าสุดของ log'},
  {group:'TEXT & SEARCH',cmd:"awk '{print $1}' file.txt",desc:'ดึงคอลัมน์แรกออกจาก file'},
  {group:'TEXT & SEARCH',cmd:"sed -i 's/old/new/g' file.txt",desc:'แทนที่ text ทุกตำแหน่งใน file'},
  {group:'PROCESS',cmd:'ps aux | grep <process>',desc:'ดู process ที่รันอยู่และกรองตามชื่อ'},
  {group:'PROCESS',cmd:'top',desc:'แสดง process แบบ real-time พร้อม CPU/Memory usage'},
  {group:'PROCESS',cmd:'htop',desc:'แสดง process แบบ interactive (ต้องติดตั้งก่อน)'},
  {group:'PROCESS',cmd:'kill -9 <pid>',desc:'บังคับหยุด process ด้วย PID (SIGKILL)'},
  {group:'PROCESS',cmd:'kill -15 <pid>',desc:'ขอให้ process หยุดอย่างนุ่มนวล (SIGTERM)'},
  {group:'PROCESS',cmd:'lsof -i :<port>',desc:'ดูว่า process ใดใช้ port ที่ระบุอยู่'},
  {group:'NETWORK',cmd:'netstat -tlnp',desc:'แสดง port ทั้งหมดที่กำลัง listen พร้อม PID'},
  {group:'NETWORK',cmd:'ss -tlnp',desc:'แสดง socket/port ที่เปิดอยู่ (ทางเลือกแทน netstat)'},
  {group:'NETWORK',cmd:'curl -v http://localhost:8080/health',desc:'ทดสอบ HTTP endpoint พร้อมแสดง header'},
  {group:'NETWORK',cmd:'ping -c 4 google.com',desc:'ทดสอบการเชื่อมต่อเครือข่าย 4 ครั้ง'},
  {group:'NETWORK',cmd:'traceroute google.com',desc:'ดูเส้นทาง network packet ไปยังปลายทาง'},
  {group:'NETWORK',cmd:'wget -O file.zip https://example.com/file.zip',desc:'ดาวน์โหลดไฟล์จาก URL'},
  {group:'NETWORK',cmd:'nmap -sV <host>',desc:'ตรวจสอบ port และ service version ของ host'},
  {group:'SERVICE (systemd)',cmd:'systemctl status <service>',desc:'ดูสถานะ service'},
  {group:'SERVICE (systemd)',cmd:'systemctl start <service>',desc:'เริ่ม service'},
  {group:'SERVICE (systemd)',cmd:'systemctl stop <service>',desc:'หยุด service'},
  {group:'SERVICE (systemd)',cmd:'systemctl restart <service>',desc:'รีสตาร์ท service'},
  {group:'SERVICE (systemd)',cmd:'systemctl enable <service>',desc:'ตั้งให้ service เริ่มอัตโนมัติเมื่อ boot'},
  {group:'SERVICE (systemd)',cmd:'journalctl -u <service> -f',desc:'ดู log ของ service แบบ real-time'},
  {group:'SERVICE (systemd)',cmd:'journalctl -u <service> --since "1 hour ago"',desc:'ดู log ย้อนหลัง 1 ชั่วโมง'},
  {group:'PERMISSION',cmd:'chmod 755 file.sh',desc:'ตั้งสิทธิ์ให้ owner rwx, group/others rx'},
  {group:'PERMISSION',cmd:'chmod +x script.sh',desc:'เพิ่มสิทธิ์ execute ให้ script'},
  {group:'PERMISSION',cmd:'chown user:group file',desc:'เปลี่ยน owner และ group ของไฟล์'},
  {group:'PERMISSION',cmd:'chown -R user:group /path',desc:'เปลี่ยน owner ทุกไฟล์ใน directory แบบ recursive'},
  {group:'PACKAGE (APT)',cmd:'apt update && apt upgrade',desc:'อัปเดตรายการ package และติดตั้งเวอร์ชันใหม่'},
  {group:'PACKAGE (APT)',cmd:'apt install <package>',desc:'ติดตั้ง package ใหม่'},
  {group:'PACKAGE (APT)',cmd:'apt remove <package>',desc:'ลบ package'},
  {group:'PACKAGE (APT)',cmd:'apt list --installed | grep <name>',desc:'ตรวจสอบว่า package ติดตั้งแล้วหรือยัง'},
  {group:'PACKAGE (YUM/DNF)',cmd:'yum install <package>',desc:'ติดตั้ง package บน RHEL/CentOS (yum)'},
  {group:'PACKAGE (YUM/DNF)',cmd:'dnf install <package>',desc:'ติดตั้ง package บน Fedora/RHEL 8+ (dnf)'},
  {group:'DISK & MEMORY',cmd:'free -h',desc:'แสดงการใช้งาน RAM และ swap'},
  {group:'DISK & MEMORY',cmd:'vmstat 1',desc:'แสดง CPU, memory, swap แบบ real-time ทุก 1 วินาที'},
  {group:'DISK & MEMORY',cmd:'iostat -x 1',desc:'ดู disk I/O usage แบบ real-time'},
  {group:'DISK & MEMORY',cmd:'lsblk',desc:'แสดง block device ทั้งหมดในระบบ'},
];

function filterLinux(q){
  const query=(q||'').trim().toLowerCase();
  const cmds=query?LINUX_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):LINUX_CMDS;
  renderCmdList(cmds,'linux-list',query);
}
function clearLinux(){document.getElementById('linux-search').value='';renderCmdList(LINUX_CMDS,'linux-list','');}

// ── GIT CLI ──
const GIT_CMDS=[
  // SETUP / CONFIG
  {group:'SETUP / CONFIG',cmd:'git config --global user.name "Name"',desc:'ตั้งชื่อผู้ใช้ระดับ global'},
  {group:'SETUP / CONFIG',cmd:'git config --global user.email "email"',desc:'ตั้งอีเมลระดับ global'},
  {group:'SETUP / CONFIG',cmd:'git config --global pull.rebase true',desc:'ทำให้ git pull ใช้ rebase แทน merge เป็น default'},
  {group:'SETUP / CONFIG',cmd:'git config --global push.autoSetupRemote true',desc:'push branch ใหม่โดยไม่ต้องพิมพ์ -u origin ทุกครั้ง'},
  {group:'SETUP / CONFIG',cmd:'git config --global rerere.enabled true',desc:'จำ conflict resolution ไว้ใช้ซ้ำอัตโนมัติ'},
  {group:'SETUP / CONFIG',cmd:'git config --global core.autocrlf input',desc:'แก้ปัญหา CRLF บน Windows (แนะนำ)'},
  {group:'SETUP / CONFIG',cmd:'git config --list',desc:'แสดง config ทั้งหมดที่ใช้งานอยู่'},
  {group:'SETUP / CONFIG',cmd:'git init',desc:'สร้าง Git repository ใหม่ในโฟลเดอร์ปัจจุบัน'},
  {group:'SETUP / CONFIG',cmd:'git clone <url>',desc:'clone repository จาก remote'},
  {group:'SETUP / CONFIG',cmd:'git clone <url> --depth 1',desc:'clone เฉพาะ commit ล่าสุด (เร็วกว่าสำหรับ repo ขนาดใหญ่)'},
  // BASIC
  {group:'BASIC',cmd:'git status',desc:'แสดงสถานะไฟล์ (staged / unstaged / untracked)'},
  {group:'BASIC',cmd:'git diff',desc:'ดูการเปลี่ยนแปลงที่ยังไม่ได้ stage'},
  {group:'BASIC',cmd:'git diff --staged',desc:'ดูการเปลี่ยนแปลงที่ stage แล้ว ก่อน commit'},
  {group:'BASIC',cmd:'git diff main..HEAD',desc:'ดูความต่างระหว่าง branch ปัจจุบันกับ main'},
  {group:'BASIC',cmd:'git add <file>',desc:'stage ไฟล์ที่ระบุ'},
  {group:'BASIC',cmd:'git add -p',desc:'เลือก stage ทีละ hunk — ควบคุมได้ละเอียดกว่า git add .'},
  {group:'BASIC',cmd:'git commit -m "message"',desc:'commit พร้อม message'},
  {group:'BASIC',cmd:'git commit --amend --no-edit',desc:'แก้ไข commit ล่าสุดโดยไม่เปลี่ยน message (ยังไม่ push เท่านั้น)'},
  {group:'BASIC',cmd:'git log --oneline --graph --all',desc:'แสดง history ทุก branch แบบกราฟ'},
  {group:'BASIC',cmd:'git log --oneline -10',desc:'แสดง 10 commit ล่าสุด'},
  {group:'BASIC',cmd:'git log -p <file>',desc:'ดู history ของไฟล์นั้นพร้อม diff ทุก commit'},
  {group:'BASIC',cmd:'git show <hash>',desc:'แสดงรายละเอียดและ diff ของ commit นั้น'},
  {group:'BASIC',cmd:'git blame <file>',desc:'แสดงว่าใคร / commit ไหนแก้แต่ละบรรทัด'},
  // BRANCH
  {group:'BRANCH',cmd:'git branch',desc:'แสดง branch ทั้งหมด (local)'},
  {group:'BRANCH',cmd:'git branch -a',desc:'แสดง branch ทั้งหมดรวม remote'},
  {group:'BRANCH',cmd:'git switch -c feature/xxx',desc:'สร้าง branch ใหม่แล้วสลับไปทันที (แนะนำกว่า checkout -b)'},
  {group:'BRANCH',cmd:'git switch main',desc:'สลับไป branch main'},
  {group:'BRANCH',cmd:'git switch -',desc:'สลับกลับ branch ก่อนหน้า'},
  {group:'BRANCH',cmd:'git branch -d feature/xxx',desc:'ลบ branch local (ป้องกันถ้ายังไม่ merge)'},
  {group:'BRANCH',cmd:'git branch -D feature/xxx',desc:'ลบ branch local แบบบังคับ'},
  {group:'BRANCH',cmd:'git merge feature/xxx',desc:'merge branch เข้า branch ปัจจุบัน'},
  {group:'BRANCH',cmd:'git merge --no-ff feature/xxx',desc:'merge พร้อมสร้าง merge commit เสมอ (เก็บ history)'},
  {group:'BRANCH',cmd:'git cherry-pick <hash>',desc:'เอาเฉพาะ commit นั้นมาใส่ branch ปัจจุบัน'},
  // REMOTE
  {group:'REMOTE',cmd:'git remote -v',desc:'แสดง remote URLs ทั้งหมด'},
  {group:'REMOTE',cmd:'git remote add origin <url>',desc:'เพิ่ม remote ชื่อ origin'},
  {group:'REMOTE',cmd:'git fetch',desc:'ดึงข้อมูลจาก remote โดยไม่ merge'},
  {group:'REMOTE',cmd:'git fetch --prune',desc:'ดึงข้อมูลและลบ remote-tracking branch ที่ถูกลบแล้ว'},
  {group:'REMOTE',cmd:'git pull --rebase',desc:'pull แบบ rebase — ไม่สร้าง merge commit เพิ่มเติม'},
  {group:'REMOTE',cmd:'git push -u origin <branch>',desc:'push และ set upstream ครั้งแรก'},
  {group:'REMOTE',cmd:'git push',desc:'push branch ปัจจุบันไป remote'},
  {group:'REMOTE',cmd:'git push --force-with-lease',desc:'force push แบบ safe — ยกเลิกถ้ามีคนอื่น push ก่อน'},
  {group:'REMOTE',cmd:'git push origin --delete <branch>',desc:'ลบ branch บน remote'},
  // UNDO / RESET
  {group:'UNDO / RESET',cmd:'git restore <file>',desc:'ยกเลิก unstaged changes ของไฟล์นั้น'},
  {group:'UNDO / RESET',cmd:'git restore --staged <file>',desc:'unstage ไฟล์ (เก็บการเปลี่ยนแปลงไว้)'},
  {group:'UNDO / RESET',cmd:'git revert <hash>',desc:'undo commit โดยสร้าง commit ใหม่ — safe สำหรับ shared branch'},
  {group:'UNDO / RESET',cmd:'git reset --soft HEAD~1',desc:'ย้อน 1 commit กลับมา staging area (เก็บ changes)'},
  {group:'UNDO / RESET',cmd:'git reset --mixed HEAD~1',desc:'ย้อน 1 commit กลับมา working tree (unstaged)'},
  {group:'UNDO / RESET',cmd:'git reset --hard HEAD~1',desc:'⚠️ ย้อน 1 commit และทิ้งการเปลี่ยนแปลงทั้งหมด'},
  {group:'UNDO / RESET',cmd:'git clean -fd',desc:'⚠️ ลบไฟล์ untracked ทั้งหมด (-f force, -d รวม directory)'},
  {group:'UNDO / RESET',cmd:'git reflog',desc:'ดู history ทุกการเคลื่อนไหวของ HEAD — ใช้กู้คืน commit ที่หายไป'},
  // STASH
  {group:'STASH',cmd:'git stash push -m "wip: xxx"',desc:'บันทึก work-in-progress ชั่วคราวพร้อม message'},
  {group:'STASH',cmd:'git stash list',desc:'แสดง stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash pop',desc:'คืนค่า stash ล่าสุดแล้วลบ stash นั้น'},
  {group:'STASH',cmd:'git stash apply stash@{1}',desc:'คืนค่า stash ที่ระบุโดยไม่ลบ'},
  {group:'STASH',cmd:'git stash drop stash@{0}',desc:'ลบ stash ที่ระบุ'},
  {group:'STASH',cmd:'git stash clear',desc:'ลบ stash ทั้งหมด'},
  {group:'STASH',cmd:'git stash push --include-untracked',desc:'stash รวม untracked files ด้วย'},
  // REBASE
  {group:'REBASE',cmd:'git rebase main',desc:'rebase branch ปัจจุบันบน main — ทำ history เป็นเส้นตรง'},
  {group:'REBASE',cmd:'git rebase -i HEAD~3',desc:'interactive rebase 3 commit ล่าสุด — squash / reorder / edit'},
  {group:'REBASE',cmd:'git rebase --continue',desc:'ดำเนินต่อหลังแก้ conflict'},
  {group:'REBASE',cmd:'git rebase --abort',desc:'ยกเลิก rebase และกลับสู่สถานะเดิม'},
  {group:'REBASE',cmd:'git rebase --skip',desc:'ข้าม commit ที่มี conflict แล้วดำเนินต่อ'},
  // SEARCH & INSPECT
  {group:'SEARCH & INSPECT',cmd:'git log --all -S "keyword"',desc:'ค้นหา commit ที่เพิ่มหรือลบ keyword นั้น'},
  {group:'SEARCH & INSPECT',cmd:'git log --all --grep="message"',desc:'ค้นหา commit ที่ message ตรงกับ pattern'},
  {group:'SEARCH & INSPECT',cmd:'git grep "pattern"',desc:'ค้นหา pattern ใน tracked files ทั้งหมด'},
  {group:'SEARCH & INSPECT',cmd:'git bisect start',desc:'เริ่มค้นหา commit ที่ทำให้ bug เกิด (binary search)'},
  {group:'SEARCH & INSPECT',cmd:'git bisect good <hash>',desc:'ระบุ commit ที่ยังไม่มี bug'},
  {group:'SEARCH & INSPECT',cmd:'git bisect bad <hash>',desc:'ระบุ commit ที่มี bug แล้ว (bisect จะ checkout กึ่งกลางให้)'},
  {group:'SEARCH & INSPECT',cmd:'git bisect reset',desc:'จบการใช้ bisect และกลับสู่ HEAD เดิม'},
  {group:'SEARCH & INSPECT',cmd:'git shortlog -sn',desc:'สรุปจำนวน commit ต่อคน เรียงจากมากไปน้อย'},
  {group:'SEARCH & INSPECT',cmd:'git ls-files',desc:'แสดงไฟล์ทั้งหมดที่ Git track อยู่'},
];
function filterGit(q){
  const query=(q||'').trim().toLowerCase();
  const cmds=query?GIT_CMDS.filter(c=>c.cmd.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.group.toLowerCase().includes(query)):GIT_CMDS;
  renderCmdList(cmds,'git-list',query);
}
function clearGit(){document.getElementById('git-search').value='';renderCmdList(GIT_CMDS,'git-list','');}

// ── HTTP STATUS CODES ──
const HTTP_CODES=[
  {code:100,name:'Continue',group:'1xx Informational',badgeClass:'s1xx',desc:'เซิร์ฟเวอร์ได้รับ request header แล้ว client สามารถส่ง body ต่อได้',example:'ใช้กับ Expect: 100-continue header ก่อนส่ง request body ขนาดใหญ่'},
  {code:101,name:'Switching Protocols',group:'1xx Informational',badgeClass:'s1xx',desc:'เซิร์ฟเวอร์กำลังเปลี่ยน protocol ตามที่ client ร้องขอ',example:'Upgrade จาก HTTP เป็น WebSocket'},
  {code:200,name:'OK',group:'2xx Success',badgeClass:'s2xx',desc:'คำขอสำเร็จ เซิร์ฟเวอร์ส่งผลลัพธ์กลับมาพร้อม response body',example:'GET /users → ส่งรายการ user กลับมา'},
  {code:201,name:'Created',group:'2xx Success',badgeClass:'s2xx',desc:'สร้าง resource ใหม่สำเร็จ มักมี Location header ชี้ไปยัง resource ที่สร้าง',example:'POST /users → สร้าง user ใหม่'},
  {code:204,name:'No Content',group:'2xx Success',badgeClass:'s2xx',desc:'คำขอสำเร็จ แต่ไม่มีข้อมูลส่งกลับ ไม่มี response body',example:'DELETE /users/1 → ลบสำเร็จ ไม่ต้องส่งอะไรกลับ'},
  {code:206,name:'Partial Content',group:'2xx Success',badgeClass:'s2xx',desc:'ส่งข้อมูลบางส่วนกลับมาตาม Range header ที่ขอ',example:'ดาวน์โหลดไฟล์แบบ resume หรือ video streaming'},
  {code:301,name:'Moved Permanently',group:'3xx Redirection',badgeClass:'s3xx',desc:'URL นี้ถูกย้ายถาวรไปยัง URL ใหม่ใน Location header',example:'example.com → www.example.com (เปลี่ยน domain)'},
  {code:302,name:'Found',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายชั่วคราวไปยัง URL อื่น ควร redirect ด้วย method เดิม',example:'Redirect หลัง login ไปยังหน้าหลัก'},
  {code:304,name:'Not Modified',group:'3xx Redirection',badgeClass:'s3xx',desc:'ข้อมูล cache ยังใช้ได้ ไม่ต้องดาวน์โหลดใหม่',example:'Browser cache hit โดยใช้ ETag หรือ Last-Modified'},
  {code:307,name:'Temporary Redirect',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายชั่วคราว รักษา HTTP method เดิม (POST ยังเป็น POST)',example:'Maintenance page redirect ชั่วคราว'},
  {code:308,name:'Permanent Redirect',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายถาวร รักษา HTTP method เดิม (เหมือน 301 แต่ method ไม่เปลี่ยน)',example:'Migration API v1 → v2 แบบ permanent'},
  {code:400,name:'Bad Request',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request ไม่ถูกต้อง เช่น JSON syntax ผิด หรือ parameter ขาด',example:'POST /users ส่ง JSON ขาด field required'},
  {code:401,name:'Unauthorized',group:'4xx Client Error',badgeClass:'s4xx',desc:'ต้องการ authentication แต่ไม่ได้ส่ง credentials หรือ token หมดอายุ',example:'เรียก API โดยไม่มี Authorization header'},
  {code:403,name:'Forbidden',group:'4xx Client Error',badgeClass:'s4xx',desc:'มีสิทธิ์เข้าถึงระบบ แต่ไม่มีสิทธิ์ทำ action นี้',example:'User ปกติพยายามเข้าถึง admin endpoint'},
  {code:404,name:'Not Found',group:'4xx Client Error',badgeClass:'s4xx',desc:'ไม่พบ resource ที่ร้องขอ อาจถูกลบหรือ URL ผิด',example:'GET /users/999 แต่ user id 999 ไม่มีในระบบ'},
  {code:405,name:'Method Not Allowed',group:'4xx Client Error',badgeClass:'s4xx',desc:'HTTP method ที่ใช้ไม่รองรับสำหรับ endpoint นี้',example:'ส่ง DELETE ไปที่ /users แต่รองรับแค่ GET, POST'},
  {code:409,name:'Conflict',group:'4xx Client Error',badgeClass:'s4xx',desc:'เกิดความขัดแย้งกับสถานะปัจจุบันของ resource',example:'สร้าง user ที่มี email ซ้ำในระบบ'},
  {code:410,name:'Gone',group:'4xx Client Error',badgeClass:'s4xx',desc:'Resource ถูกลบถาวรและไม่มีอีกต่อไป',example:'API endpoint เก่าที่ deprecated แล้ว'},
  {code:413,name:'Content Too Large',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request body ใหญ่เกินขีดจำกัดที่เซิร์ฟเวอร์รับได้',example:'อัปโหลดไฟล์เกิน limit ที่กำหนด'},
  {code:422,name:'Unprocessable Entity',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request format ถูกต้อง แต่ข้อมูลภายในไม่ผ่าน validation',example:'ส่งอีเมลไม่ถูกรูปแบบ หรือวันเกิดเป็น future date'},
  {code:429,name:'Too Many Requests',group:'4xx Client Error',badgeClass:'s4xx',desc:'ส่ง request เกิน rate limit ที่กำหนด',example:'เรียก API เกิน 100 ครั้ง/นาทีตามที่ตกลงไว้'},
  {code:500,name:'Internal Server Error',group:'5xx Server Error',badgeClass:'s5xx',desc:'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ที่ไม่ได้คาดไว้',example:'Exception ที่ไม่ถูก catch ใน application'},
  {code:501,name:'Not Implemented',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์ไม่รองรับ HTTP method ที่ร้องขอ',example:'ส่ง PATCH แต่ server ยังไม่ implement'},
  {code:502,name:'Bad Gateway',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์กลาง (proxy/gateway) ได้รับ response ที่ไม่ถูกต้องจาก upstream',example:'Nginx ไม่สามารถเชื่อมต่อกับ backend application'},
  {code:503,name:'Service Unavailable',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์ไม่พร้อมให้บริการชั่วคราว เช่น ปิดซ่อมหรือ overload',example:'Deploy ใหม่กำลังเริ่มขึ้น หรือ server load สูงเกิน'},
  {code:504,name:'Gateway Timeout',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์กลางรอ response จาก upstream นานเกินไป',example:'Backend ทำ query หนักๆ และ timeout'},
];
const HTTP_GROUPS=['ทั้งหมด','1xx Informational','2xx Success','3xx Redirection','4xx Client Error','5xx Server Error'];
let httpActiveGroup='ทั้งหมด';
function renderHttpList(codes,query){
  const container=document.getElementById('http-list');
  if(!codes.length){container.innerHTML='<div style="color:var(--text-dim);text-align:center;padding:40px;">ไม่พบ status code ที่ตรงกัน</div>';return;}
  const groups={};
  for(const c of codes){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);}
  let html='';
  for(const[grp,items]of Object.entries(groups)){
    html+=`<div class="kubectl-group"><div class="kubectl-group-title">${grp}</div>`;
    for(const item of items){
      const codeStr=String(item.code);
      const nameHl=query?highlightText(item.name,query):escHtml(item.name);
      const descHl=query?highlightText(item.desc,query):escHtml(item.desc);
      const exHl=query?highlightText(item.example,query):escHtml(item.example);
      const codeHl=query&&codeStr.includes(query)?`<span class="http-highlight">${codeStr}</span>`:codeStr;
      html+=`<div class="http-card">
        <div class="http-badge ${item.badgeClass}">${codeHl}</div>
        <div style="flex:1;min-width:0;">
          <div class="http-name">${nameHl}</div>
          <div class="http-desc">${descHl}</div>
          <div class="http-example">💡 ${exHl}</div>
        </div>
        <button class="btn btn-ghost" style="flex-shrink:0;" onclick="copyText('${item.code}')">Copy</button>
      </div>`;
    }
    html+='</div>';
  }
  container.innerHTML=html;
}
function filterHttp(q){
  const query=(q||'').trim().toLowerCase();
  let codes=HTTP_CODES;
  if(httpActiveGroup!=='ทั้งหมด')codes=codes.filter(c=>c.group===httpActiveGroup);
  if(query)codes=codes.filter(c=>String(c.code).includes(query)||c.name.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.example.toLowerCase().includes(query)||c.group.toLowerCase().includes(query));
  renderHttpList(codes,query);
}
function setHttpGroup(grp){
  httpActiveGroup=grp;
  document.querySelectorAll('.http-group-btn').forEach(b=>b.classList.toggle('active',b.dataset.grp===grp));
  filterHttp(document.getElementById('http-search').value);
}
function clearHttp(){document.getElementById('http-search').value='';httpActiveGroup='ทั้งหมด';document.querySelectorAll('.http-group-btn').forEach(b=>b.classList.toggle('active',b.dataset.grp==='ทั้งหมด'));filterHttp('');}
function initHttp(){
  const btnContainer=document.getElementById('http-group-btns');
  btnContainer.innerHTML=HTTP_GROUPS.map(g=>`<button class="http-group-btn${g==='ทั้งหมด'?' active':''}" data-grp="${g}" onclick="setHttpGroup('${g}')">${g}</button>`).join('');
  renderHttpList(HTTP_CODES,'');
}

// ── PWA ──
let _pwaPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();_pwaPrompt=e;
  setTimeout(()=>{if(_pwaPrompt)document.getElementById('pwa-banner').classList.add('show');},5000);
});
window.addEventListener('appinstalled',()=>{
  document.getElementById('pwa-banner').classList.remove('show');showToast('ติดตั้ง App สำเร็จ ✓');_pwaPrompt=null;
});
function pwsInstall(){
  if(!_pwaPrompt){showToast('เปิดใน Chrome/Edge แล้วลองใหม่');return;}
  _pwaPrompt.prompt();_pwaPrompt.userChoice.then(()=>{_pwaPrompt=null;document.getElementById('pwa-banner').classList.remove('show');});
}

// ── SPARKLE CLICK EFFECT ──
(function(){
  const COLORS=['#6366f1','#22d3ee','#f472b6','#fbbf24','#34d399','#a78bfa','#fb7185','#38bdf8'];
  const EMOJIS=['✨','⚡','💫','🌟','🔥','💎','🎯','⭐','🎪','🚀'];
  const SHAPES=['circle','star','square'];

  function createParticle(x,y){
    const el=document.createElement('div');
    el.className='sparkle-particle';
    const color=COLORS[Math.floor(Math.random()*COLORS.length)];
    const size=Math.random()*10+5;
    const angle=Math.random()*Math.PI*2;
    const dist=Math.random()*100+40;
    const tx=Math.cos(angle)*dist;
    const ty=Math.sin(angle)*dist;
    el.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size}px ${color};--tx:${tx}px;--ty:${ty}px;animation-duration:${0.5+Math.random()*0.5}s;border-radius:${Math.random()>0.5?'50%':'3px'};`;
    document.body.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  }

  function createEmojiPop(x,y){
    const el=document.createElement('div');
    el.className='sparkle-emoji';
    el.textContent=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    const offsetX=(Math.random()-0.5)*80;
    el.style.cssText=`left:${x+offsetX}px;top:${y}px;animation-duration:${0.7+Math.random()*0.4}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  }

  function createRipple(x,y){
    const el=document.createElement('div');
    el.className='click-ripple';
    el.style.cssText=`left:${x}px;top:${y}px;`;
    document.body.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  }

  document.addEventListener('click',function(e){
    const x=e.clientX, y=e.clientY;
    // create ripple
    createRipple(x,y);
    // create 10-15 particles
    const count=10+Math.floor(Math.random()*6);
    for(let i=0;i<count;i++) createParticle(x,y);
    // 1-2 emoji pops
    const emojiCount=1+Math.floor(Math.random()*2);
    for(let i=0;i<emojiCount;i++) createEmojiPop(x,y);
  });

  // logo click mega burst
  document.addEventListener('DOMContentLoaded',()=>{
    const logo=document.getElementById('logo-icon');
    if(logo){
      logo.addEventListener('click',function(e){
        e.stopPropagation();
        const rect=logo.getBoundingClientRect();
        const cx=rect.left+rect.width/2;
        const cy=rect.top+rect.height/2;
        for(let i=0;i<30;i++) createParticle(cx,cy);
        for(let i=0;i<5;i++) createEmojiPop(cx+((Math.random()-0.5)*60),cy);
      });
    }
  });
})();



// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE COLOR PICKER  —  Vanilla JS, production-ready v3
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(function () {
  'use strict';

  // ── State ──
  let _icpImage    = null;
  let _icpPicked   = null;   // { r, g, b, hex, rgb, hsl }
  let _icpCanvas   = null;
  let _icpCtx      = null;
  let _icpDragging = false;
  let _icpRafId    = null;   // rAF handle
  let _icpPendingE = null;   // queued pick coords
  let _icpZoom     = 11;     // loupe sample size (odd number)
  let _icpFmt      = 'hex';  // active copy format: hex | rgb | hsl | tw
  let _icpHistory  = [];     // max 10 recent hex values
  let _icpCursorX  = 0, _icpCursorY = 0; // last known cursor (for nudge)
  const _icpLoupeSize = 84;

  // ── Colour helpers ──
  function icpRgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'))
      .join('').toUpperCase();
  }

  function icpRgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function icpFormatValue(picked, fmt) {
    if (!picked) return '—';
    switch (fmt) {
      case 'rgb': return picked.rgb;
      case 'hsl': return picked.hsl;
      case 'tw':  return `bg-[${picked.hex.toLowerCase()}]`;
      default:    return picked.hex;
    }
  }

  // ── DOM helper ──
  function $id(id) { return document.getElementById(id); }

  function _icpIsMobile() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  function icpShowPanel(hasPick) {
    $id('icp-empty-hint').style.display       = hasPick ? 'none' : '';
    $id('image-color-preview').style.display  = hasPick ? '' : 'none';
    $id('icp-copy-fmt').style.display         = hasPick ? '' : 'none';
    $id('icp-values').style.display           = hasPick ? '' : 'none';
    $id('icp-btn-apply').style.display        = hasPick ? '' : 'none';
    $id('icp-btn-clear').style.display        = _icpImage ? '' : 'none';
    $id('icp-zoom-row').style.display         = hasPick && _icpIsMobile() ? '' : 'none';
    $id('icp-history-section').style.display  = _icpHistory.length ? '' : 'none';
    $id('icp-kbd-hint').style.display         = hasPick && !_icpIsMobile() ? '' : 'none';
  }

  // ── Draw image to canvas ──
  function drawImagePreview() {
    if (!_icpImage) return;
    _icpCanvas = $id('image-preview-canvas');
    _icpCtx    = _icpCanvas.getContext('2d');

    _icpCanvas.width  = _icpImage.naturalWidth;
    _icpCanvas.height = _icpImage.naturalHeight;
    _icpCtx.drawImage(_icpImage, 0, 0);

    // Pre-size loupe canvas once (avoid resize every frame)
    const lc = $id('icp-loupe-canvas');
    lc.width = lc.height = _icpLoupeSize;

    $id('image-preview-wrapper').style.display = '';
    $id('icp-img-toolbar').style.display       = '';
    $id('icp-placeholder').style.display       = 'none';
    $id('image-drop-zone').classList.add('has-image');
    $id('icp-img-info').textContent =
      `${_icpImage.naturalWidth} × ${_icpImage.naturalHeight}px — คลิกเพื่อดูดสี`;
    $id('icp-btn-clear').style.display = '';

    if (window.EyeDropper) $id('icp-eyedropper-btn').style.display = '';
  }

  // ── Core pick logic (called inside rAF) ──
  function _icpDoPickAt(clientX, clientY, isTouch) {
    const rect   = _icpCanvas.getBoundingClientRect();
    const scaleX = _icpCanvas.width  / rect.width;
    const scaleY = _icpCanvas.height / rect.height;

    const px = Math.round((clientX - rect.left) * scaleX);
    const py = Math.round((clientY - rect.top)  * scaleY);
    const cx = Math.max(0, Math.min(_icpCanvas.width  - 1, px));
    const cy = Math.max(0, Math.min(_icpCanvas.height - 1, py));

    const pixel = _icpCtx.getImageData(cx, cy, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    const hex = icpRgbToHex(r, g, b);
    const hsl = icpRgbToHsl(r, g, b);

    _icpPicked = { r, g, b, hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    };

    const marker = $id('image-picker-marker');
    const dispX  = clientX - rect.left;
    const dispY  = clientY - rect.top;

    if (isTouch) {
      // ── MOBILE: floating loupe ──
      const sampleR = Math.floor(_icpZoom / 2);
      const lc  = $id('icp-loupe-canvas');
      const lCtx = lc.getContext('2d');
      lCtx.imageSmoothingEnabled = false;
      lCtx.clearRect(0, 0, _icpLoupeSize, _icpLoupeSize);
      lCtx.drawImage(_icpCanvas,
        cx - sampleR, cy - sampleR, _icpZoom, _icpZoom,
        0, 0, _icpLoupeSize, _icpLoupeSize
      );
      marker.style.borderColor = hex;
      marker.style.boxShadow =
        `0 0 0 2px rgba(0,0,0,.5), 0 10px 28px rgba(0,0,0,.55), 0 0 0 5px ${hex}55`;
      const luma  = 0.299*r + 0.587*g + 0.114*b;
      const badge = $id('icp-loupe-hex');
      badge.textContent      = hex;
      badge.style.background = hex;
      badge.style.color      = luma > 140 ? '#000' : '#fff';
      const loupeTop = dispY - _icpLoupeSize - 20 < 6
        ? dispY + 20 : dispY - _icpLoupeSize - 20;
      marker.style.left = dispX + 'px';
      marker.style.top  = loupeTop + 'px';
    } else {
      // ── DESKTOP: small coloured dot ──
      marker.style.background  = hex;
      marker.style.borderColor = '#fff';
      marker.style.boxShadow   = `0 0 0 1.5px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.4)`;
      marker.style.left = dispX + 'px';
      marker.style.top  = dispY + 'px';
    }
    marker.style.display = 'block';

    // Update side panel
    $id('image-color-preview').style.background = hex;
    $id('image-color-hex').textContent          = hex;
    $id('image-color-rgb').textContent          = _icpPicked.rgb;
    $id('image-color-hsl').textContent          = _icpPicked.hsl;
    _icpUpdateActiveValue();
    icpShowPanel(true);
  }

  // ── rAF-throttled public pick entry ──
  function pickColorFromImage(e) {
    if (!_icpCanvas || !_icpCtx) return;
    e.stopPropagation();
    const touch = e.touches?.[0] ?? e.changedTouches?.[0] ?? null;
    const isTouch = !!touch;
    const clientX = isTouch ? touch.clientX : e.clientX;
    const clientY = isTouch ? touch.clientY : e.clientY;
    _icpPendingE = { clientX, clientY, isTouch };
    if (!_icpRafId) {
      _icpRafId = requestAnimationFrame(() => {
        _icpRafId = null;
        if (_icpPendingE) {
          const { clientX: cx, clientY: cy, isTouch: it } = _icpPendingE;
          _icpPendingE = null;
          _icpDoPickAt(cx, cy, it);
        }
      });
    }
  }

  // ── Arrow-key nudge (desktop) ──
  function _icpNudge(dx, dy) {
    if (!_icpCanvas || !_icpCtx) return;
    const rect = _icpCanvas.getBoundingClientRect();
    _icpCursorX = Math.max(rect.left, Math.min(rect.right,  _icpCursorX + dx));
    _icpCursorY = Math.max(rect.top,  Math.min(rect.bottom, _icpCursorY + dy));
    _icpDoPickAt(_icpCursorX, _icpCursorY, false);
  }

  // ── Copy format ──
  function icpSetFmt(fmt) {
    _icpFmt = fmt;
    $id('icp-copy-fmt').querySelectorAll('.icp-fmt-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.fmt === fmt);
    });
    _icpUpdateActiveValue();
  }

  function _icpUpdateActiveValue() {
    const val = icpFormatValue(_icpPicked, _icpFmt);
    const labels = { hex: 'HEX', rgb: 'RGB', hsl: 'HSL', tw: 'TW' };
    $id('icp-active-label').textContent = labels[_icpFmt] || 'HEX';
    $id('icp-active-value').textContent = val;
  }

  function icpCopyActive() {
    const val = icpFormatValue(_icpPicked, _icpFmt);
    if (val && val !== '—') copyPickedHex(val);
  }

  // ── Zoom slider ──
  function icpSetZoom(v) {
    _icpZoom = v;
    $id('icp-zoom-label').textContent = v + '×';
  }

  // ── History ──
  function _icpAddHistory(hex) {
    if (_icpHistory[0] === hex) return;
    _icpHistory = [hex, ..._icpHistory.filter(h => h !== hex)].slice(0, 10);
    _icpRenderHistory();
  }

  function _icpRenderHistory() {
    const row = $id('icp-history-row');
    row.innerHTML = '';
    _icpHistory.forEach(hex => {
      const s = document.createElement('div');
      s.className        = 'icp-history-swatch';
      s.style.background = hex;
      s.title            = hex;
      s.onclick          = () => copyPickedHex(hex);
      row.appendChild(s);
    });
    $id('icp-history-section').style.display = _icpHistory.length ? '' : 'none';
  }

  // ── EyeDropper API (desktop Chrome/Edge) ──
  async function icpUseEyeDropper() {
    if (!window.EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      const hex = result.sRGBHex.toUpperCase();
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const hsl = icpRgbToHsl(r, g, b);
      _icpPicked = { r, g, b, hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
      };
      $id('image-color-preview').style.background = hex;
      $id('image-color-hex').textContent          = hex;
      $id('image-color-rgb').textContent          = _icpPicked.rgb;
      $id('image-color-hsl').textContent          = _icpPicked.hsl;
      _icpUpdateActiveValue();
      _icpAddHistory(hex);
      icpShowPanel(true);
      showToast('ดูดสี ' + hex + ' จากหน้าจอ ✓');
    } catch (_) { /* user cancelled — no-op */ }
  }

  // ── Copy helpers ──
  function icpCopyValue(elemId) {
    const text = $id(elemId).textContent;
    if (!text || text === '—') return;
    copyPickedHex(text);
  }

  function copyPickedHex(text) {
    try {
      navigator.clipboard.writeText(text)
        .then(() => showToast('คัดลอก ' + text + ' แล้ว ✓'))
        .catch(() => fallbackCopy(text));
    } catch (_) { fallbackCopy(text); }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('คัดลอก ' + text + ' แล้ว ✓'); }
    catch (_) { showToast('⚠️ คัดลอกไม่ได้'); }
    ta.remove();
  }

  // ── Apply to main Color Picker ──
  function icpApplyToMainPicker() {
    if (!_icpPicked) return;
    if (typeof updateColorUI === 'function') {
      updateColorUI({ r: _icpPicked.r, g: _icpPicked.g, b: _icpPicked.b });
      showToast('นำสี ' + _icpPicked.hex + ' เข้า Color Picker ✓');
    } else {
      const hexInput = $id('color-hex');
      if (hexInput) {
        hexInput.value = _icpPicked.hex;
        hexInput.dispatchEvent(new Event('input', { bubbles: true }));
        showToast('นำสี ' + _icpPicked.hex + ' เข้า Color Picker ✓');
      }
    }
  }

  // ── Clear ──
  function icpClearImage() {
    _icpImage = _icpPicked = null;
    _icpDragging = false;
    if (_icpCanvas && _icpCtx)
      _icpCtx.clearRect(0, 0, _icpCanvas.width, _icpCanvas.height);
    $id('image-preview-wrapper').style.display = 'none';
    $id('icp-img-toolbar').style.display       = 'none';
    $id('icp-placeholder').style.display       = '';
    $id('image-picker-marker').style.display   = 'none';
    $id('image-drop-zone').classList.remove('has-image');
    $id('image-upload-input').value            = '';
    $id('icp-eyedropper-btn').style.display    = 'none';
    icpShowPanel(false);
    showToast('ล้างภาพแล้ว');
  }

  // ── File handling ──
  function handleImageFile(file) {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showToast('⚠️ รองรับเฉพาะ PNG, JPG, WEBP, GIF');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      _icpImage  = img;
      _icpPicked = null;
      URL.revokeObjectURL(url);
      drawImagePreview();
      icpShowPanel(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('⚠️ โหลดภาพไม่ได้ กรุณาลองใหม่');
    };
    img.src = url;
  }

  // ── Drag & Drop ──
  function icpDragOver(e)  { e.preventDefault(); $id('image-drop-zone').classList.add('dragover'); }
  function icpDragLeave()  { $id('image-drop-zone').classList.remove('dragover'); }
  function icpDrop(e) {
    e.preventDefault();
    $id('image-drop-zone').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
    else showToast('⚠️ ไม่พบไฟล์ในที่วาง');
  }

  function icpFileInputChange(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  }

  // ── Clipboard paste ──
  function handleImagePaste(e) {
    const colorTab = $id('color-tab');
    if (!colorTab?.classList.contains('active')) return;
    const items = (e.clipboardData || window.clipboardData).items;
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        e.preventDefault();
        handleImageFile(item.getAsFile());
        return;
      }
    }
  }

  // ── Init ──
  function initImageColorPicker() {
    document.addEventListener('paste', handleImagePaste);

    // FIX: global mouseup resets drag even if cursor leaves canvas
    document.addEventListener('mouseup', () => { _icpDragging = false; });

    // Track cursor for nudge baseline
    document.addEventListener('mousemove', (e) => {
      _icpCursorX = e.clientX;
      _icpCursorY = e.clientY;
    });

    // Keyboard shortcuts (desktop)
    document.addEventListener('keydown', (e) => {
      const colorTab = $id('color-tab');
      if (!colorTab?.classList.contains('active')) return;
      if (!_icpPicked) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // C = copy in active format
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        icpCopyActive();
        _icpAddHistory(_icpPicked.hex);
        return;
      }
      // Arrow keys = nudge 1px (Shift = 10px)
      const step = e.shiftKey ? 10 : 1;
      const nudgeMap = {
        ArrowLeft:  [-step, 0],
        ArrowRight: [ step, 0],
        ArrowUp:    [0, -step],
        ArrowDown:  [0,  step],
      };
      if (nudgeMap[e.key]) {
        e.preventDefault();
        const [dx, dy] = nudgeMap[e.key];
        _icpNudge(dx, dy);
      }
    });

    // Add to history on confirmed pick (mouseup / touchend)
    const canvas = $id('image-preview-canvas');
    if (canvas) {
      canvas.addEventListener('mouseup',  () => { if (_icpPicked) _icpAddHistory(_icpPicked.hex); });
      canvas.addEventListener('touchend', () => { if (_icpPicked) _icpAddHistory(_icpPicked.hex); });
    }

    // Expose globals for inline HTML handlers
    window.icpDragOver          = icpDragOver;
    window.icpDragLeave         = icpDragLeave;
    window.icpDrop              = icpDrop;
    window.icpFileInputChange   = icpFileInputChange;
    window.pickColorFromImage   = pickColorFromImage;
    window.icpCopyValue         = icpCopyValue;
    window.icpCopyActive        = icpCopyActive;
    window.icpSetFmt            = icpSetFmt;
    window.icpSetZoom           = icpSetZoom;
    window.icpApplyToMainPicker = icpApplyToMainPicker;
    window.icpClearImage        = icpClearImage;
    window.icpUseEyeDropper     = icpUseEyeDropper;
    window.copyPickedHex        = copyPickedHex;
    window.handleImageFile      = handleImageFile;
    window.handleImagePaste     = handleImagePaste;
    window.drawImagePreview     = drawImagePreview;
    window.rgbToHex             = icpRgbToHex;
    window.rgbToHsl             = (r, g, b) => icpRgbToHsl(r, g, b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageColorPicker);
  } else {
    initImageColorPicker();
  }
})();
// ── END IMAGE COLOR PICKER ──

// ── RXJS REFERENCE ──
const RXJS_CATS=[
  {id:'all',label:'ทั้งหมด',color:'var(--accent)'},
  {id:'creation',label:'Creation',color:'#a78bfa'},
  {id:'transformation',label:'Transformation',color:'#34d399'},
  {id:'filtering',label:'Filtering',color:'#60a5fa'},
  {id:'combination',label:'Combination',color:'#fbbf24'},
  {id:'error',label:'Error Handling',color:'#f87171'},
  {id:'utility',label:'Utility',color:'#fb923c'},
  {id:'multicasting',label:'Multicasting',color:'#f472b6'},
];
const RXJS_CC={creation:'#a78bfa',transformation:'#34d399',filtering:'#60a5fa',combination:'#fbbf24',error:'#f87171',utility:'#fb923c',multicasting:'#f472b6'};
const RXJS_OPS=[
// CREATION
{n:'of',c:'creation',s:'emit ค่าหลายตัวทีเดียว แล้ว complete',w:['สร้าง Observable จากค่าคงที่','mock/test ข้อมูล','wrap sync value'],a:['อยากได้ async ใช้ from + Promise แทน'],sig:'of<T>(...values: T[]): Observable<T>',code:"of(1, 2, 3).subscribe(console.log);\n// 1, 2, 3\n\nof('a','b').pipe(\n  map(s => s.toUpperCase())\n).subscribe(console.log);",rel:['from','range']},
{n:'from',c:'creation',s:'แปลง Array, Promise, Iterable เป็น Observable',w:['แปลง Promise เป็น Observable','แปลง array เป็น stream','รับ async/await ค่า'],a:[],sig:'from<T>(input: ObservableInput<T>): Observable<T>',code:"// จาก array\nfrom([1, 2, 3]).subscribe(console.log);\n\n// จาก Promise\nfrom(fetch('/api').then(r => r.json()))\n  .subscribe(data => render(data));",rel:['of','fromEvent']},
{n:'fromEvent',c:'creation',s:'แปลง DOM event เป็น Observable stream',w:['click / keyup / scroll events','WebSocket messages','input + debounce'],a:['ต้อง unsubscribe ตอน component destroy (ใช้ takeUntil)'],sig:'fromEvent<T>(target: EventTarget, event: string): Observable<T>',code:"const clicks$ = fromEvent(document, 'click');\nclicks$.pipe(\n  map(e => ({ x: e.clientX, y: e.clientY }))\n).subscribe(pos => console.log(pos));\n\n// search real-time\nfromEvent(input, 'input').pipe(\n  debounceTime(300),\n  map(e => e.target.value),\n  switchMap(term => searchApi(term))\n).subscribe(render);",rel:['debounceTime','switchMap']},
{n:'interval',c:'creation',s:'emit 0, 1, 2... ทุก X ms ไปเรื่อยๆ (ต้อง unsubscribe เอง)',w:['polling API ทุก N วินาที','animation counter','countdown'],a:['ต้อง unsubscribe ไม่งั้น memory leak'],sig:'interval(period: number): Observable<number>',code:"const sub = interval(5000).pipe(\n  switchMap(() => http.get('/api/status'))\n).subscribe(status => update(status));\n\nsub.unsubscribe(); // หยุดเมื่อไม่ต้องการ",rel:['timer','takeUntil']},
{n:'timer',c:'creation',s:'รอ X ms แล้ว emit (หรือ emit ทุก Y ms หลังรอ X ms)',w:['delay ก่อนทำงาน','polling ที่มี initial delay','timeout'],a:[],sig:'timer(dueTime?: number, interval?: number): Observable<number>',code:"// emit ครั้งเดียวหลัง 1 วินาที\ntimer(1000).subscribe(() => doWork());\n\n// emit ทุก 2s หลังรอ 5s แรก\ntimer(5000, 2000).subscribe(n => console.log(n));",rel:['interval','delay']},
{n:'range',c:'creation',s:'emit ตัวเลขต่อเนื่อง start ถึง count',w:['สร้างข้อมูลจำลอง','loop แบบ functional','generate sequence'],a:[],sig:'range(start: number, count?: number): Observable<number>',code:"range(1, 5).subscribe(console.log);\n// 1, 2, 3, 4, 5\n\nrange(0, 10).pipe(\n  filter(n => n % 2 === 0)\n).subscribe(console.log); // 0, 2, 4, 6, 8",rel:['of','from']},
{n:'EMPTY',c:'creation',s:'Observable ที่ complete ทันทีโดยไม่ emit อะไรเลย',w:['return เมื่อไม่มีข้อมูล (แทน null)','cancel ใน switchMap','absorb error ใน catchError'],a:[],sig:'EMPTY: Observable<never>',code:"search$.pipe(\n  switchMap(term =>\n    term.length < 2 ? EMPTY : searchApi(term)\n  )\n).subscribe(render);",rel:['throwError']},
{n:'throwError',c:'creation',s:'Observable ที่ error ทันทีโดยไม่ emit อะไร',w:['สร้าง error ใน pipe','re-throw หลัง log','test error handling'],a:[],sig:'throwError(() => new Error(msg))',code:"throwError(() => new Error('API failed'))\n  .pipe(\n    catchError(err => {\n      logError(err);\n      return EMPTY;\n    })\n  ).subscribe();",rel:['catchError','EMPTY']},
{n:'defer',c:'creation',s:'สร้าง Observable ใหม่ทุกครั้งที่ subscribe — lazy factory',w:['Observable ที่สร้างใหม่ทุก subscribe','wrap side-effectful creation','random / time-sensitive values'],a:[],sig:'defer<T>(factory: () => ObservableInput<T>): Observable<T>',code:"const now$ = defer(() => of(Date.now()));\nnow$.subscribe(t => console.log(t)); // 1000\nnow$.subscribe(t => console.log(t)); // 1050 (ต่างกัน)",rel:['of','from']},
{n:'iif',c:'creation',s:'เลือก Observable ตาม condition — ternary สำหรับ Observable',w:['routing logic ตาม state','เลือก API ตาม role','conditional stream'],a:[],sig:'iif(condition: () => boolean, trueObs, falseObs)',code:"const isLoggedIn = () => !!localStorage.getItem('token');\n\niif(\n  isLoggedIn,\n  http.get('/api/profile'),\n  of({ guest: true })\n).subscribe(user => renderUser(user));",rel:['defer','EMPTY']},
// TRANSFORMATION
{n:'map',c:'transformation',s:'แปลงทุกค่าใน stream (เหมือน Array.map)',w:['แปลง HTTP response','extract property จาก object','เปลี่ยน data shape'],a:[],sig:'map<T,R>(project: (value: T, index: number) => R)',code:"from([1, 2, 3]).pipe(\n  map(x => x * 2)\n).subscribe(console.log);\n// 2, 4, 6\n\nhttp.get('/api/users').pipe(\n  map(res => res.data),\n  map(users => users.filter(u => u.active))\n).subscribe(renderUsers);",rel:['switchMap','mergeMap','filter']},
{n:'switchMap',c:'transformation',s:'map เป็น Observable ใหม่ — cancel inner เดิมทันทีถ้ามีค่าใหม่',w:['Search autocomplete (พิมพ์ใหม่ = cancel request เก่า)','Route change + cancel pending HTTP','ป้องกัน race condition'],a:['ต้องการทุก result ใช้ mergeMap','ต้องการ order ใช้ concatMap'],sig:'switchMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"fromEvent(searchInput, 'input').pipe(\n  map(e => e.target.value),\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term =>\n    term ? http.get(`/api/search?q=${term}`) : EMPTY\n  )\n).subscribe(results => render(results));",rel:['mergeMap','concatMap','exhaustMap']},
{n:'mergeMap',c:'transformation',s:'map เป็น Observable — รัน inner ทุกตัวพร้อมกัน ไม่ cancel',w:['Upload หลายไฟล์พร้อมกัน','Parallel HTTP requests','ไม่สนใจ order แต่ต้องการทุก result'],a:['inner ไม่ complete อาจ memory leak','source emit เร็วมาก inner จะล้น'],sig:'mergeMap<T,R>(project: (value: T) => ObservableInput<R>, concurrent?: number)',code:"from(selectedFiles).pipe(\n  mergeMap(file => uploadService.upload(file))\n).subscribe({\n  next: r => console.log('uploaded:', r.name),\n  complete: () => showToast('upload ทั้งหมดสำเร็จ')\n});",rel:['switchMap','concatMap','exhaustMap']},
{n:'concatMap',c:'transformation',s:'map เป็น Observable — รอ inner ก่อนหน้า complete ก่อนเริ่มถัดไป',w:['Sequential API calls ที่ต้องการ order','Save ทีละรายการ','Animation queue'],a:['source emit เร็วมาก inner จะ queue ยาว lag','ไม่สนใจ order ใช้ mergeMap เร็วกว่า'],sig:'concatMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"from([step1, step2, step3]).pipe(\n  concatMap(step => saveStep(step))\n).subscribe({\n  next: s => console.log('saved:', s.id),\n  complete: () => console.log('ทุก step บันทึกแล้ว')\n});",rel:['switchMap','mergeMap','exhaustMap']},
{n:'exhaustMap',c:'transformation',s:'map เป็น Observable — ignore source ใหม่ถ้า inner ยังรันอยู่',w:['ปุ่ม Submit (ป้องกัน double submit)','Login (ignore click ซ้ำ)','ป้องกัน overlapping'],a:['ต้องการทุก click ใช้ mergeMap','ต้องการ cancel ใช้ switchMap'],sig:'exhaustMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"fromEvent(loginBtn, 'click').pipe(\n  exhaustMap(() => authService.login(creds))\n).subscribe({\n  next: user => router.navigate('/dashboard'),\n  error: err => showError(err.message)\n});",rel:['switchMap','mergeMap','concatMap']},
{n:'scan',c:'transformation',s:'สะสมค่าทีละ step แล้ว emit ทุกรอบ (เหมือน reduce แต่ไม่รอ complete)',w:['Running total / counter','State accumulator','undo/redo history'],a:[],sig:'scan<T,R>(accumulator: (acc: R, val: T) => R, seed?: R)',code:"fromEvent(btn, 'click').pipe(\n  scan(count => count + 1, 0)\n).subscribe(n => countEl.textContent = n);\n\nof(1,2,3).pipe(\n  scan((acc, v) => [...acc, v], [])\n).subscribe(console.log);\n// [1]  [1,2]  [1,2,3]",rel:['reduce','map']},
{n:'reduce',c:'transformation',s:'สะสมค่าทั้งหมด emit ครั้งเดียวตอน complete (เหมือน Array.reduce)',w:['รวมผลลัพธ์หลัง stream จบ','คำนวณ sum/max/count','collect แล้ว process'],a:['source ไม่ complete จะไม่ emit เลย — ใช้ scan แทน'],sig:'reduce<T,R>(accumulator: (acc: R, val: T) => R, seed?: R)',code:"from([1,2,3,4,5]).pipe(\n  reduce((sum, n) => sum + n, 0)\n).subscribe(total => console.log('Total:', total));\n// Total: 15",rel:['scan','toArray']},
{n:'buffer',c:'transformation',s:'รวม emissions เป็น array — flush เมื่อ notifier emit',w:['batch process events','รวม actions ก่อนส่ง','buffer real-time data'],a:[],sig:'buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>',code:"const source$ = interval(100);\nconst flush$ = interval(1000);\nsource$.pipe(\n  buffer(flush$)\n).subscribe(batch => {\n  console.log('Batch:', batch); // [0..9] ทุกวินาที\n});",rel:['bufferTime']},
{n:'bufferTime',c:'transformation',s:'รวม emissions เป็น array ทุก X ms',w:['batch analytics events','aggregate logs ก่อนส่ง','rate limiting'],a:[],sig:'bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]>',code:"fromEvent(document, 'click').pipe(\n  bufferTime(2000)\n).subscribe(clicks => {\n  if (clicks.length > 0)\n    sendAnalytics('clicks', clicks.length);\n});",rel:['buffer','throttleTime']},
{n:'groupBy',c:'transformation',s:'แยก stream เป็น GroupedObservable ตาม key',w:['จัดกลุ่มข้อมูล real-time','route messages ตาม type','aggregate ตาม category'],a:['ต้อง subscribe แต่ละ group ด้วย mergeMap'],sig:'groupBy<T,K>(keySelector: (val: T) => K)',code:"from([\n  {name:'ก้อง', dept:'dev'},\n  {name:'แบงค์', dept:'design'},\n  {name:'มิ้น', dept:'dev'}\n]).pipe(\n  groupBy(emp => emp.dept),\n  mergeMap(group$ => group$.pipe(toArray()))\n).subscribe(g => console.log(g));",rel:['mergeMap']},
{n:'toArray',c:'transformation',s:'รวมทุก emission เป็น array เดียวตอน complete',w:['รวมผลลัพธ์ก่อน render','แปลง stream เป็น array','collect แล้วค่อย process'],a:['source ไม่ complete จะไม่ emit เลย'],sig:'toArray<T>(): OperatorFunction<T, T[]>',code:"from([1,2,3,4,5]).pipe(\n  filter(n => n % 2 === 0),\n  toArray()\n).subscribe(evens => console.log(evens));\n// [2, 4]",rel:['reduce','buffer']},
{n:'pairwise',c:'transformation',s:'emit คู่ [ก่อนหน้า, ปัจจุบัน] ทุกครั้งที่ source emit',w:['คำนวณ delta ระหว่าง state','track mouse delta','ตรวจการเปลี่ยนแปลง'],a:[],sig:'pairwise<T>(): OperatorFunction<T, [T, T]>',code:"from([1,5,2,8]).pipe(\n  pairwise(),\n  map(([prev, curr]) => curr - prev)\n).subscribe(diff => console.log(diff));\n// 4, -3, 6",rel:['scan','distinctUntilChanged']},
// FILTERING
{n:'filter',c:'filtering',s:'กรองค่าที่ไม่ผ่าน condition ออก (เหมือน Array.filter)',w:['กรอง event ที่ต้องการ','ตรวจ condition ก่อน process','ลด noise ใน stream'],a:[],sig:'filter<T>(predicate: (value: T, index: number) => boolean)',code:"from([1,2,3,4,5,6]).pipe(\n  filter(n => n % 2 === 0)\n).subscribe(console.log); // 2, 4, 6\n\nfromEvent(document, 'click').pipe(\n  filter(e => e.target.matches('.btn-primary'))\n).subscribe(handleClick);",rel:['map','takeWhile','distinctUntilChanged']},
{n:'take',c:'filtering',s:'รับแค่ N ค่าแรก แล้ว complete',w:['รับค่าแรกจาก stream','จำกัดจำนวน result','one-shot Observable'],a:[],sig:'take<T>(count: number)',code:"interval(1000).pipe(\n  take(3)\n).subscribe(console.log);\n// 0, 1, 2 แล้ว complete\n\nfromEvent(btn, 'click').pipe(\n  take(1)\n).subscribe(handleFirstClick);",rel:['first','takeUntil','takeWhile']},
{n:'takeUntil',c:'filtering',s:'รับค่าจนกว่า notifier จะ emit แล้ว complete',w:['หยุด subscription เมื่อ component destroy','cancel เมื่อ navigate ออก','cleanup pattern ใน Angular'],a:['notifier ต้อง complete ด้วย ไม่งั้น takeUntil อาจไม่ทำงาน'],sig:'takeUntil<T>(notifier: ObservableInput<any>)',code:"class MyComponent implements OnDestroy {\n  private destroy$ = new Subject<void>();\n\n  ngOnInit() {\n    interval(1000).pipe(\n      takeUntil(this.destroy$)\n    ).subscribe(tick => update(tick));\n  }\n\n  ngOnDestroy() {\n    this.destroy$.next();\n    this.destroy$.complete();\n  }\n}",rel:['take','takeWhile','Subject']},
{n:'takeWhile',c:'filtering',s:'รับค่าตราบที่ condition เป็น true — หยุดทันทีที่ false',w:['รับค่าจนถึง threshold','หยุด poll เมื่อ status เปลี่ยน','process จนเงื่อนไขเปลี่ยน'],a:[],sig:'takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean)',code:"interval(2000).pipe(\n  switchMap(() => http.get('/api/job')),\n  takeWhile(job => job.status !== 'done')\n).subscribe(job => updateProgress(job));",rel:['take','takeUntil','filter']},
{n:'skip',c:'filtering',s:'ข้าม N ค่าแรก แล้ว emit ปกติ',w:['ข้าม initial value ของ BehaviorSubject','skip header row','ละค่าแรกที่ไม่ต้องการ'],a:[],sig:'skip<T>(count: number)',code:"const data$ = new BehaviorSubject(null);\n\ndata$.pipe(\n  skip(1) // ข้าม null initial value\n).subscribe(data => render(data));\n\ndata$.next({ users: [] });",rel:['skipUntil','take','filter']},
{n:'skipUntil',c:'filtering',s:'ข้าม emissions จนกว่า notifier จะ emit',w:['รอ init สำเร็จก่อน process','รอ user interaction ก่อนเริ่ม','gate-based filtering'],a:[],sig:'skipUntil<T>(notifier: Observable<any>)',code:"const ready$ = fromEvent(document, 'DOMContentLoaded');\n\nstream$.pipe(\n  skipUntil(ready$)\n).subscribe(processEvent);",rel:['skip','takeUntil']},
{n:'first',c:'filtering',s:'รับค่าแรก (หรือค่าแรกที่ตรง condition) แล้ว complete',w:['ต้องการค่าแรกจาก stream','one-time lookup','เหมือน take(1) แต่ใส่ predicate ได้'],a:['source complete ไม่มีค่าตาม predicate จะ error — ใส่ default ป้องกัน'],sig:'first<T>(predicate?: (val: T) => boolean, defaultValue?: T)',code:"from([3,5,7,2,4]).pipe(\n  first(n => n % 2 === 0)\n).subscribe(console.log); // 2\n\n// safe: ใส่ default\nfrom([1,3,5]).pipe(\n  first(n => n > 10, -1)\n).subscribe(console.log); // -1",rel:['take','last','filter']},
{n:'last',c:'filtering',s:'รับเฉพาะค่าสุดท้ายตอน source complete',w:['ผลสุดท้ายของ stream','HTTP response ที่ emit หลายครั้ง','คู่กับ reduce'],a:['source ไม่ complete จะไม่ emit','source ว่างไม่มี default จะ error'],sig:'last<T>(predicate?: (val: T) => boolean, defaultValue?: T)',code:"from([1,2,3,4,5]).pipe(\n  last()\n).subscribe(console.log); // 5\n\nfrom([1,2,3]).pipe(\n  last(n => n % 3 === 0)\n).subscribe(console.log); // 3",rel:['first','take','reduce']},
{n:'debounceTime',c:'filtering',s:'หน่วง X ms — reset ทุกครั้งที่มีค่าใหม่ emit เฉพาะค่าสุดท้ายหลังหยุด',w:['Search input (รอหยุดพิมพ์)','Form validation','resize/scroll handler'],a:['ต้องการ emit แล้วค่อย block ใช้ throttleTime'],sig:'debounceTime<T>(dueTime: number)',code:"fromEvent(searchInput, 'input').pipe(\n  map(e => e.target.value),\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term => searchApi(term))\n).subscribe(render);",rel:['throttleTime','distinctUntilChanged','switchMap']},
{n:'throttleTime',c:'filtering',s:'emit แล้ว block X ms — ป้องกัน emit ถี่เกินไป',w:['จำกัด rate analytics','scroll/resize handler','ป้องกัน API call ถี่'],a:['ต้องการค่าสุดท้ายหลังหยุด ใช้ debounceTime'],sig:'throttleTime<T>(duration: number)',code:"fromEvent(window, 'scroll').pipe(\n  throttleTime(100)\n).subscribe(() => updateScrollPos());",rel:['debounceTime']},
{n:'distinctUntilChanged',c:'filtering',s:'emit เฉพาะเมื่อค่าต่างจากค่าก่อนหน้า',w:['ป้องกัน re-render เมื่อ state ไม่เปลี่ยน','filter ค่าซ้ำจาก form','selector ใน state management'],a:[],sig:'distinctUntilChanged<T>(comparator?: (prev: T, curr: T) => boolean)',code:"from([1,1,2,2,3,1]).pipe(\n  distinctUntilChanged()\n).subscribe(console.log);\n// 1, 2, 3, 1\n\nstate$.pipe(\n  distinctUntilChanged((a,b) => a.userId === b.userId)\n).subscribe(renderUser);",rel:['distinct','debounceTime']},
{n:'distinct',c:'filtering',s:'emit เฉพาะค่าที่ไม่เคย emit มาก่อนใน stream ทั้งหมด',w:['กรอง duplicate ออก','deduplicate IDs','unique values เท่านั้น'],a:['เก็บ Set ทุกค่าที่เคย emit — memory leak ถ้า stream ยาวมาก'],sig:'distinct<T>(keySelector?: (val: T) => any)',code:"from([1,2,1,3,2,4]).pipe(\n  distinct()\n).subscribe(console.log);\n// 1, 2, 3, 4\n\nfrom(users).pipe(\n  distinct(u => u.id)\n).subscribe(renderUser);",rel:['distinctUntilChanged','filter']},
{n:'sampleTime',c:'filtering',s:'เก็บค่าล่าสุดทุก X ms (snapshot)',w:['sample real-time data ทุก N วินาที','ลด rate ของ stream ที่เร็วมาก','metric collection'],a:[],sig:'sampleTime<T>(period: number)',code:"fromEvent(document, 'mousemove').pipe(\n  sampleTime(200)\n).subscribe(e => track(e.clientX, e.clientY));",rel:['debounceTime','throttleTime']},
// COMBINATION
{n:'combineLatest',c:'combination',s:'รวม Observables หลายตัว — emit ทุกครั้งที่ตัวใดเปลี่ยน (รอทุกตัว emit ก่อน 1 รอบ)',w:['รวม filter/sort/page เป็น query เดียว','dashboard หลาย data source','ขึ้นอยู่กับหลาย stream'],a:['Observable ใดไม่ emit เลยจะไม่ emit','sync หลายตัวอาจ trigger เยอะ'],sig:'combineLatest<T>(sources: ObservableInput<T>[]): Observable<T[]>',code:"combineLatest([search$, sort$, page$]).pipe(\n  debounceTime(100),\n  switchMap(([search, sort, page]) =>\n    http.get('/api/data', { search, sort, page })\n  )\n).subscribe(renderTable);",rel:['merge','zip','withLatestFrom']},
{n:'merge',c:'combination',s:'รวม Observables หลายตัว emit ทุกค่าจากทุกตัวตามที่เกิด',w:['รวม event หลาย source','listen หลาย WebSocket','รวม action streams'],a:['ไม่รับประกัน order — ถ้าต้องการ order ใช้ concat'],sig:'merge<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"merge(\n  fromEvent(document, 'keydown'),\n  fromEvent(document, 'click'),\n  fromEvent(document, 'touchstart')\n).pipe(\n  throttleTime(100)\n).subscribe(resetIdleTimer);",rel:['combineLatest','concat','race']},
{n:'concat',c:'combination',s:'รัน Observables ต่อกัน — รอตัวแรก complete ก่อนเริ่มตัวถัดไป',w:['Sequential requests ที่ต้องการ order','initialization flow ทีละขั้น','playlist/queue'],a:['ตัวแรกไม่ complete จะไม่ไปตัวถัดไปเลย'],sig:'concat<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"concat(\n  of({ loading: true }),\n  http.get('/api/init'),\n  of({ loading: false })\n).subscribe(state => updateState(state));",rel:['merge','concatMap']},
{n:'zip',c:'combination',s:'จับคู่ค่าจากหลาย Observable ตาม index — รอทุกตัว emit ครั้งที่ N',w:['จับคู่ข้อมูลจาก 2 stream ตาม sequence','coordinates จาก x$ กับ y$','จับคู่ request กับ response'],a:['Observable ยาวไม่เท่ากัน ค่าส่วนเกินถูก ignore'],sig:'zip<T>(...sources: ObservableInput<T>[]): Observable<T[]>',code:"zip(of(1,2,3), of('a','b','c'))\n  .subscribe(([n, s]) => console.log(n, s));\n// 1 'a'\n// 2 'b'\n// 3 'c'",rel:['combineLatest','forkJoin']},
{n:'forkJoin',c:'combination',s:'รอทุก Observable complete แล้ว emit ค่าสุดท้ายของแต่ละตัวพร้อมกัน',w:['Parallel HTTP requests ที่ต้องการทุก result','โหลดหลายชุดข้อมูลก่อน render','รวม dependencies ก่อนเริ่ม'],a:['Observable ใด error ทั้งหมดจะ error','ไม่ควรใช้กับ infinite stream'],sig:'forkJoin(sources: { [key: string]: ObservableInput }): Observable',code:"forkJoin({\n  user: http.get('/api/user/1'),\n  posts: http.get('/api/posts'),\n  settings: http.get('/api/settings')\n}).subscribe(({ user, posts, settings }) =>\n  renderProfile(user, posts, settings)\n);",rel:['combineLatest','zip','merge']},
{n:'withLatestFrom',c:'combination',s:'เมื่อ source emit ดึงค่าล่าสุดจาก Observable อื่นมาด้วย',w:['รวม event กับ state ปัจจุบัน','แนบ user info กับ action','ใช้ค่าจาก BehaviorSubject ตอน event'],a:['other Observable ต้องมีค่าก่อน ไม่งั้นจะไม่ emit'],sig:'withLatestFrom<T,R>(...others: ObservableInput<R>[])',code:"fromEvent(deleteBtn, 'click').pipe(\n  withLatestFrom(currentUser$),\n  filter(([_, user]) => user.canDelete),\n  switchMap(([_, user]) => deleteItem(itemId, user.id))\n).subscribe(() => showToast('ลบสำเร็จ'));",rel:['combineLatest','switchMap']},
{n:'race',c:'combination',s:'ใช้ Observable แรกที่ emit ทิ้งตัวที่เหลือ',w:['ใช้ response จาก server เร็วสุด','timeout race pattern','fallback เมื่อ primary ช้า'],a:[],sig:'race<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"race(\n  http.get('https://api1.example.com/data'),\n  http.get('https://api2.example.com/data')\n).subscribe(data => render(data));",rel:['merge','forkJoin']},
{n:'startWith',c:'combination',s:'inject ค่าเริ่มต้นก่อน Observable จริง emit',w:['initial state ก่อนโหลด','loading skeleton','default value'],a:[],sig:'startWith<T>(...values: T[])',code:"http.get('/api/users').pipe(\n  map(data => ({ loading: false, data })),\n  startWith({ loading: true, data: null })\n).subscribe(state => renderState(state));",rel:['BehaviorSubject','combineLatest']},
// ERROR HANDLING
{n:'catchError',c:'error',s:'จับ error แล้วส่ง Observable อื่นแทน — ป้องกัน stream ตาย',w:['fallback เป็น cached data เมื่อ API fail','แสดง error แล้วดำเนินต่อ','absorb error ที่ไม่สำคัญ'],a:['return throwError อีกจะยัง error'],sig:'catchError<T,O>(selector: (err: any) => ObservableInput<O>)',code:"http.get('/api/data').pipe(\n  catchError(err => {\n    console.error('failed:', err.message);\n    return of([]); // fallback\n  })\n).subscribe(render);\n\n// rethrow หลัง log\nhttp.get('/api').pipe(\n  catchError(err => {\n    logError(err);\n    return throwError(() => err);\n  })\n).subscribe(next => {}, err => showError(err));",rel:['retry','finalize','throwError']},
{n:'retry',c:'error',s:'retry N ครั้งอัตโนมัติเมื่อ error ก่อน propagate',w:['HTTP request ที่อาจ fail ชั่วคราว','network instability','transient errors'],a:['อย่า retry infinitely','ควรเพิ่ม delay ระหว่าง retry'],sig:'retry(count?: number | RetryConfig)',code:"http.get('/api/data').pipe(\n  retry(3)\n).subscribe({\n  next: data => render(data),\n  error: err => showError('ล้มเหลวหลังลอง 3 ครั้ง')\n});\n\nhttp.get('/api').pipe(\n  retry({ count: 3, delay: 1000 })\n).subscribe(...);",rel:['catchError','retryWhen']},
{n:'retryWhen',c:'error',s:'retry ตาม logic กำหนด — ควบคุม timing และเงื่อนไข',w:['exponential backoff','retry เฉพาะ error บางประเภท','แสดง retry countdown'],a:['deprecated ใน RxJS 7+ — ใช้ retry({ delay }) แทน'],sig:'retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>)',code:"http.get('/api').pipe(\n  retryWhen(errors => errors.pipe(\n    delayWhen((_, i) => timer(2 ** i * 1000)),\n    take(3)\n  ))\n).subscribe(...);",rel:['retry','catchError','timer']},
{n:'finalize',c:'error',s:'ทำงานเมื่อ complete หรือ error (เหมือน finally ใน try/catch)',w:['ซ่อน loading spinner เสมอ','cleanup resources','logging'],a:[],sig:'finalize<T>(callback: () => void)',code:"showSpinner();\nhttp.get('/api/data').pipe(\n  finalize(() => hideSpinner())\n).subscribe({\n  next: data => render(data),\n  error: err => showError(err.message)\n});",rel:['catchError','tap']},
// UTILITY
{n:'tap',c:'utility',s:'ทำ side effect โดยไม่เปลี่ยนค่าใน stream (เดิมชื่อ do)',w:['logging / debugging','analytics events','debug pipe โดยไม่เปลี่ยนค่า'],a:['อย่าใช้ tap สำหรับ transform — ใช้ map แทน'],sig:'tap<T>(observerOrNext: Partial<Observer<T>> | ((val: T) => void))',code:"http.get('/api/users').pipe(\n  tap(data => console.log('raw:', data)),\n  map(data => data.users),\n  tap(users => analytics.track('loaded', { count: users.length })),\n  filter(users => users.length > 0)\n).subscribe(renderUsers);",rel:['map','finalize']},
{n:'delay',c:'utility',s:'หน่วง emit ทุกค่าออกไป X ms',w:['simulate latency ใน test','animation sequencing','ป้องกัน rapid UI update'],a:[],sig:'delay<T>(due: number | Date)',code:"of('hello').pipe(\n  delay(2000)\n).subscribe(msg => console.log(msg));\n// พิมพ์ 'hello' หลัง 2 วินาที",rel:['timer','debounceTime']},
{n:'timeout',c:'utility',s:'throw error ถ้า Observable ไม่ emit ภายใน X ms',w:['กำหนด SLA ให้ HTTP','ป้องกัน hang','UX timeout'],a:[],sig:'timeout<T>(config: number | TimeoutConfig<T>)',code:"http.get('/api').pipe(\n  timeout(5000),\n  catchError(err => {\n    if (err.name === 'TimeoutError')\n      return of({ error: 'timeout' });\n    return throwError(() => err);\n  })\n).subscribe(renderOrError);",rel:['race','catchError','timer']},
{n:'share',c:'utility',s:'share Observable เดียวกับ subscriber หลายตัว — multicasting hot',w:['ป้องกัน HTTP call ซ้ำ','event stream ที่ต้องการ share','ประหยัด resource'],a:['subscriber ใหม่ที่มาทีหลังไม่ได้ค่าก่อนหน้า — ใช้ shareReplay แทน'],sig:'share<T>()',code:"const data$ = http.get('/api/data').pipe(share());\n\n// HTTP call แค่ 1 ครั้ง\ndata$.subscribe(data => renderList(data));\ndata$.subscribe(data => renderChart(data));",rel:['shareReplay','Subject']},
{n:'shareReplay',c:'utility',s:'share + replay N ค่าล่าสุดให้ subscriber ใหม่',w:['cache HTTP response','share initial data load','subscriber ใหม่ได้ค่าล่าสุดทันที'],a:['ระวัง memory leak ใน Angular — ใส่ {refCount:true}'],sig:'shareReplay<T>(bufferSize?: number | ShareReplayConfig)',code:"const config$ = http.get('/api/config').pipe(\n  shareReplay({ bufferSize: 1, refCount: true })\n);\n\nconfig$.subscribe(renderHeader);\nconfig$.subscribe(renderSidebar);\n// HTTP call เกิดครั้งเดียว",rel:['share','BehaviorSubject']},
// MULTICASTING
{n:'Subject',c:'multicasting',s:'Observable + Observer ในตัวเดียว — ส่งค่าเข้า stream จากภายนอกได้',w:['event bus','bridge ระหว่าง callback กับ Observable world','trigger events ด้วยตนเอง'],a:['ไม่มี initial value ไม่ replay — ใช้ BehaviorSubject ถ้าต้องการ'],sig:'new Subject<T>()',code:"const action$ = new Subject();\n\nbtn.addEventListener('click', () => {\n  action$.next('clicked');\n});\n\naction$.pipe(\n  filter(a => a === 'clicked'),\n  throttleTime(1000)\n).subscribe(handleClick);\n\naction$.complete(); // cleanup",rel:['BehaviorSubject','ReplaySubject']},
{n:'BehaviorSubject',c:'multicasting',s:'Subject ที่มี initial value + replay ค่าล่าสุดให้ subscriber ใหม่ทันที',w:['State management (currentUser, cart, settings)','ค่าที่ต้องมี initial state','subscriber ใหม่ต้องได้ค่าทันที'],a:['ถ้าไม่ต้องการ initial value ใช้ Subject หรือ ReplaySubject(1)'],sig:'new BehaviorSubject<T>(initialValue: T)',code:"class CartService {\n  private cart$ = new BehaviorSubject([]);\n\n  addItem(item) {\n    const curr = this.cart$.getValue();\n    this.cart$.next([...curr, item]);\n  }\n\n  getCart() { return this.cart$.asObservable(); }\n}\n\ncartService.getCart().subscribe(renderCart);",rel:['Subject','ReplaySubject','shareReplay']},
{n:'ReplaySubject',c:'multicasting',s:'Subject ที่ replay N ค่าล่าสุดให้ subscriber ใหม่',w:['ต้องการ history N ค่าล่าสุด','undo/redo buffer','subscriber ใหม่ต้องได้ค่าก่อนหน้า'],a:[],sig:'new ReplaySubject<T>(bufferSize?: number, windowTime?: number)',code:"const history$ = new ReplaySubject(10);\n\ndispatch('LOGIN', user);\ndispatch('ADD_ITEM', item);\n\n// subscriber ใหม่ได้ 10 action ล่าสุดทันที\nhistory$.subscribe(a => console.log(a));",rel:['Subject','BehaviorSubject','shareReplay']},
{n:'AsyncSubject',c:'multicasting',s:'emit เฉพาะค่าสุดท้ายตอน complete เท่านั้น',w:['cache result ของ async operation','เหมือน Promise — emit ครั้งเดียวตอน done','lazy computation ที่ share result'],a:['ไม่ complete จะไม่ emit เลย'],sig:'new AsyncSubject<T>()',code:"const result$ = new AsyncSubject();\n\nfetchData().then(data => {\n  result$.next(data);\n  result$.complete();\n});\n\nresult$.subscribe(data => render(data));",rel:['Subject','BehaviorSubject']},
];

let rxjsCatActive='all',rxjsQ='';
let rxjsCurrentView='ref';

function initRxjs(){
  renderRxjsCats();
  renderRxjsOps();
  rxjsInitPlayground();
  if(window.hljs){
    document.querySelectorAll('#rxjs-tab pre.rxjs-code code, #angular-tab pre.rxjs-code code').forEach(el=>{
      if(!el.dataset.highlighted)window.hljs.highlightElement(el);
    });
  }
}

function renderRxjsCats(){
  const el=document.getElementById('rxjs-cat-filter');
  if(!el)return;
  el.innerHTML=RXJS_CATS.map(cat=>{
    const active=cat.id===rxjsCatActive;
    return `<button class="rxjs-chip${active?' rxjs-chip-active':''}" style="${active?`background:${cat.color}22;border-color:${cat.color};color:${cat.color}`:''}" onclick="rxjsSetCat('${cat.id}')">${cat.label}</button>`;
  }).join('');
}

function rxjsSetCat(cat){rxjsCatActive=cat;renderRxjsCats();renderRxjsOps();}

function rxjsSearch(q){rxjsQ=q.toLowerCase().trim();renderRxjsOps();}

function renderRxjsOps(){
  const el=document.getElementById('rxjs-op-list');
  if(!el)return;
  const ops=RXJS_OPS.filter(op=>{
    const matchCat=rxjsCatActive==='all'||op.c===rxjsCatActive;
    const matchQ=!rxjsQ||op.n.toLowerCase().includes(rxjsQ)||op.s.toLowerCase().includes(rxjsQ)||op.w.join(' ').toLowerCase().includes(rxjsQ);
    return matchCat&&matchQ;
  });
  const cnt=document.getElementById('rxjs-count');
  if(cnt)cnt.textContent=`${ops.length} operator${ops.length!==1?'s':''}`;
  if(!ops.length){el.innerHTML='<div class="rxjs-empty">ไม่พบ operator ที่ค้นหา — ลองเปลี่ยน keyword หรือ category</div>';return;}
  el.innerHTML=ops.map(op=>`<div class="rxjs-op-card">
  <div class="rxjs-op-top">
    <span class="rxjs-op-name">${op.n}</span>
    <span class="rxjs-op-badge rxjs-badge-${op.c}">${op.c}</span>
    <button class="rxjs-try-btn" onclick="rxjsTryOp('${op.n}')">▶ Try</button>
  </div>
  <div class="rxjs-op-summary">${escHtml(op.s)}</div>
  <div class="rxjs-op-when"><span class="rxjs-when-ok">✓ ใช้เมื่อ</span>${op.w.map(w=>`<div class="rxjs-when-item">• ${escHtml(w)}</div>`).join('')}${op.a.length?`<span class="rxjs-when-no">✗ หลีกเลี่ยง</span>${op.a.map(a=>`<div class="rxjs-when-item rxjs-avoid">• ${escHtml(a)}</div>`).join('')}`:''}</div>
  <details class="rxjs-details"><summary class="rxjs-details-sum"><span class="rxjs-sig-lbl">sig</span> <code class="rxjs-sig-code">${escHtml(op.sig)}</code></summary><div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code>${hlTS(op.code)}</code></pre></div></details>
  ${op.rel.length?`<div class="rxjs-op-rel">เทียบกับ: ${op.rel.map(r=>`<button class="rxjs-rel-btn" onclick="rxjsJumpTo('${r}')">${r}</button>`).join('')}</div>`:''}
</div>`).join('');
}

// Runnable versions of operator examples (override op.code for playground)
const RXJS_RUN_CODE={
'from':
`// from — แปลง array / Promise เป็น Observable
from([1, 2, 3]).subscribe(console.log);

// จาก Promise
from(Promise.resolve({ name: 'RxJS', version: 7 }))
  .subscribe(data => console.log('resolved:', JSON.stringify(data)));`,

'fromEvent':
`// จำลอง DOM events ด้วย Subject (ไม่ต้องการ element จริง)
const clicks$ = new Subject();

clicks$.pipe(
  map(pos => \`clicked at x:\${pos.x} y:\${pos.y}\`)
).subscribe(console.log);

clicks$.next({ x: 120, y: 45 });
clicks$.next({ x: 88,  y: 200 });
clicks$.next({ x: 300, y: 150 });
clicks$.complete();`,

'interval':
`// poll ทุก 300ms รับแค่ 5 ครั้ง
interval(300).pipe(
  take(5),
  switchMap(i => of({ tick: i, ok: i < 4 ? 'loading' : 'done' }))
).subscribe({
  next: s => console.log(\`poll #\${s.tick}:\`, s.ok),
  complete: () => console.log('หยุด poll')
});`,

'timer':
`// emit ครั้งเดียวหลัง 500ms
timer(500).subscribe(() => console.log('⏰ timer fired!'));

// emit ทุก 300ms หลังรอ 600ms
timer(600, 300).pipe(
  take(4),
  map(n => \`tick \${n}\`)
).subscribe(console.log);`,

'EMPTY':
`const search$ = new Subject();

search$.pipe(
  switchMap(term =>
    term.length < 2 ? EMPTY : of(\`results: "\${term}"\`).pipe(delay(100))
  )
).subscribe(r => console.log(r));

search$.next('a');   // ไม่ emit (EMPTY)
search$.next('rx');  // emit
search$.next('rxj'); // emit`,

'throwError':
`throwError(() => new Error('API failed')).pipe(
  catchError(err => {
    console.error('caught:', err.message);
    return EMPTY;
  })
).subscribe({
  next: v => console.log('next:', v),
  complete: () => console.log('complete')
});`,

'iif':
`const isLoggedIn = () => true;

iif(
  isLoggedIn,
  of({ user: 'สมชาย', role: 'admin' }),
  of({ guest: true })
).subscribe(u => console.log(JSON.stringify(u)));`,

'map':
`from([1, 2, 3]).pipe(
  map(x => x * 2)
).subscribe(console.log); // 2, 4, 6

// transform HTTP response shape
of({ data: [{ name: 'ก้อง', active: true }, { name: 'บิ๊ก', active: false }] }).pipe(
  map(res => res.data),
  map(users => users.filter(u => u.active))
).subscribe(u => console.log('active:', JSON.stringify(u)));`,

'switchMap':
`// search autocomplete: cancel request เก่าทันทีเมื่อมีคำใหม่
const search$ = new Subject();

search$.pipe(
  debounceTime(100),
  distinctUntilChanged(),
  switchMap(term =>
    term ? of(\`results for "\${term}"\`).pipe(delay(150)) : EMPTY
  )
).subscribe(r => console.log(r));

search$.next('a');
search$.next('an');
search$.next('ang');
setTimeout(() => search$.next('angular'), 200);`,

'mergeMap':
`// upload หลายไฟล์พร้อมกัน (parallel)
const files = ['photo.jpg', 'doc.pdf', 'data.csv'];

from(files).pipe(
  mergeMap(file => {
    const ms = Math.round(Math.random() * 150 + 100);
    return of(\`✅ uploaded: \${file}\`).pipe(delay(ms));
  })
).subscribe({
  next: r => console.log(r),
  complete: () => console.log('🎉 ทุกไฟล์ upload สำเร็จ')
});`,

'concatMap':
`// sequential steps — รอทีละขั้น
const steps = ['validate', 'save to DB', 'send email'];

from(steps).pipe(
  concatMap((step, i) =>
    of(\`✅ step \${i+1}: \${step}\`).pipe(delay(200))
  )
).subscribe({
  next: s => console.log(s),
  complete: () => console.log('🏁 ทุก step เสร็จ')
});`,

'exhaustMap':
`// ป้องกัน double submit
const loginClick$ = new Subject();

loginClick$.pipe(
  exhaustMap(() => {
    console.log('🔐 login started...');
    return of({ user: 'สมชาย', token: 'abc123' }).pipe(delay(300));
  })
).subscribe(u => console.log('✅ logged in:', u.user));

loginClick$.next(); // fires
loginClick$.next(); // ignored (login ยังรันอยู่)
loginClick$.next(); // ignored
console.log('3 clicks sent → only 1 login fires');`,

'scan':
`// running counter
from(['click','click','click','click']).pipe(
  scan(count => count + 1, 0),
  map(n => \`count: \${n}\`)
).subscribe(console.log);

// build array progressively
of(1, 2, 3).pipe(
  scan((acc, v) => [...acc, v], [])
).subscribe(arr => console.log(JSON.stringify(arr)));`,

'bufferTime':
`// จำลอง buffered events
interval(100).pipe(
  take(15),
  bufferTime(500)
).subscribe(batch => console.log('batch:', JSON.stringify(batch)));`,

'filter':
`from([1,2,3,4,5,6]).pipe(
  filter(n => n % 2 === 0)
).subscribe(console.log); // 2, 4, 6

// กรอง events ตาม type
from([
  { type: 'click', target: '.btn-primary' },
  { type: 'click', target: '.btn-secondary' },
  { type: 'click', target: '.btn-primary' }
]).pipe(
  filter(e => e.target === '.btn-primary')
).subscribe(e => console.log('handled:', e.target));`,

'take':
`interval(200).pipe(
  take(3)
).subscribe({
  next: n => console.log(n),
  complete: () => console.log('complete after 3')
});

// take(1) = first-only
const btn$ = new Subject();
btn$.pipe(take(1)).subscribe(() => console.log('first click only!'));
btn$.next(); // fires
btn$.next(); // ignored`,

'takeUntil':
`const destroy$ = new Subject();

interval(200).pipe(
  takeUntil(destroy$)
).subscribe({
  next: tick => console.log('tick:', tick)
});

// destroy หลัง 700ms
setTimeout(() => {
  destroy$.next();
  destroy$.complete();
  console.log('✅ unsubscribed!');
}, 700);`,

'takeWhile':
`const statuses = ['queued', 'processing', 'processing', 'done'];

from(statuses).pipe(
  concatMap((s, i) => of(s).pipe(delay(i * 150))),
  takeWhile(s => s !== 'done', true)
).subscribe({
  next: s => console.log('status:', s),
  complete: () => console.log('🏁 job complete!')
});`,

'skip':
`const state$ = new BehaviorSubject(null);

state$.pipe(
  skip(1) // ข้าม null initial value
).subscribe(data => console.log('got data:', JSON.stringify(data)));

state$.next({ users: ['ก้อง'] });
state$.next({ users: ['ก้อง', 'บิ๊ก'] });`,

'skipUntil':
`const ready$ = new Subject();

interval(100).pipe(
  take(10),
  skipUntil(ready$)
).subscribe(n => console.log('after ready:', n));

setTimeout(() => {
  console.log('🟢 ready!');
  ready$.next();
}, 350);`,

'debounceTime':
`const input$ = new Subject();

input$.pipe(
  tap(v => console.log('⌨️', v)),
  debounceTime(200),
  distinctUntilChanged()
).subscribe(v => console.log('🔍 search API:', v));

['a','an','ang','angu','angul','angular'].forEach((v, i) =>
  setTimeout(() => input$.next(v), i * 80)
);`,

'throttleTime':
`// scroll/event throttling
interval(50).pipe(
  take(20),
  throttleTime(200),
  map(n => \`event #\${n}\`)
).subscribe(console.log);`,

'distinctUntilChanged':
`from([1,1,2,2,3,1]).pipe(
  distinctUntilChanged()
).subscribe(console.log); // 1 2 3 1

// custom comparator
from([
  { userId: 1, name: 'ก้อง' },
  { userId: 1, name: 'ก้อง v2' }, // same id → skip
  { userId: 2, name: 'บิ๊ก' }
]).pipe(
  distinctUntilChanged((a, b) => a.userId === b.userId)
).subscribe(s => console.log(JSON.stringify(s)));`,

'distinct':
`from([1,2,1,3,2,4]).pipe(
  distinct()
).subscribe(console.log); // 1 2 3 4

from([{id:1,name:'ก้อง'},{id:2,name:'บิ๊ก'},{id:1,name:'ก้อง v2'}]).pipe(
  distinct(u => u.id)
).subscribe(u => console.log(JSON.stringify(u)));`,

'sampleTime':
`// snapshot ทุก 300ms จาก stream ที่ถี่
interval(60).pipe(
  take(20),
  map(n => ({ x: n * 5, y: Math.round(Math.random() * 100) })),
  sampleTime(300)
).subscribe(pos => console.log('sampled:', JSON.stringify(pos)));`,

'combineLatest':
`const filter$ = new BehaviorSubject('all');
const sort$   = new BehaviorSubject('name');
const page$   = new BehaviorSubject(1);

combineLatest([filter$, sort$, page$]).pipe(
  debounceTime(50),
  map(([f, s, p]) => \`filter=\${f} sort=\${s} page=\${p}\`)
).subscribe(q => console.log('query:', q));

filter$.next('active');
sort$.next('date');
page$.next(2);`,

'merge':
`const a$ = interval(200).pipe(take(3), map(i => \`A\${i}\`));
const b$ = interval(300).pipe(take(2), map(i => \`B\${i}\`));
const c$ = timer(500).pipe(map(() => 'C0'));

merge(a$, b$, c$).subscribe(e => console.log('event:', e));`,

'concat':
`concat(
  of('⏳ loading...'),
  of({ data: 'init', version: 2 }).pipe(
    delay(200),
    map(d => JSON.stringify(d))
  ),
  of('✅ ready!')
).subscribe(state => console.log(state));`,

'forkJoin':
`forkJoin({
  user:  of({ id: 1, name: 'สมชาย' }).pipe(delay(100)),
  posts: of([{ title: 'RxJS 101' }, { title: 'Angular Tips' }]).pipe(delay(150)),
  tags:  of(['rxjs', 'angular']).pipe(delay(80))
}).subscribe(({ user, posts, tags }) => {
  console.log('👤', user.name);
  console.log('📝', posts.length, 'posts');
  console.log('🏷️', tags.join(', '));
  console.log('✅ โหลดพร้อมกันทั้ง 3 APIs!');
});`,

'withLatestFrom':
`const user$ = new BehaviorSubject({ name: 'สมชาย', role: 'admin' });
const actions$ = new Subject();

actions$.pipe(
  withLatestFrom(user$),
  map(([action, user]) => ({
    action,
    user: user.name,
    allowed: user.role === 'admin' || action === 'view'
  }))
).subscribe(r => console.log(JSON.stringify(r)));

actions$.next('view');
actions$.next('delete');
user$.next({ name: 'บิ๊ก', role: 'viewer' });
actions$.next('delete'); // allowed: false`,

'race':
`const api1$ = of('api1 response').pipe(delay(300));
const api2$ = of('api2 response').pipe(delay(200)); // เร็วกว่า
const api3$ = of('api3 response').pipe(delay(400));

race(api1$, api2$, api3$).subscribe(
  winner => console.log('🏆 winner:', winner)
);`,

'startWith':
`of({ users: ['ก้อง', 'บิ๊ก', 'มิ้น'] }).pipe(
  delay(300),
  map(data => ({ loading: false, data })),
  startWith({ loading: true, data: null })
).subscribe(state => console.log(JSON.stringify(state)));`,

'catchError':
`throwError(() => new Error('500 Internal Server Error')).pipe(
  catchError(err => {
    console.log('❌ Error:', err.message);
    return of({ data: [], fromCache: true }); // fallback
  })
).subscribe(r => console.log('✅', JSON.stringify(r)));`,

'retry':
`let attempt = 0;

defer(() => {
  attempt++;
  console.log(\`attempt \${attempt}...\`);
  return attempt < 3
    ? throwError(() => new Error('fail'))
    : of('✅ success!');
}).pipe(
  retry(3)
).subscribe({
  next: v => console.log(v),
  error: e => console.log('❌', e.message)
});`,

'retryWhen':
`let tries = 0;

defer(() => {
  tries++;
  return tries < 3
    ? throwError(() => new Error(\`fail #\${tries}\`))
    : of('success');
}).pipe(
  retry({ count: 3, delay: 200 })
).subscribe({
  next: v => console.log('✅', v),
  error: e => console.log('❌', e.message)
});`,

'finalize':
`of('data').pipe(
  delay(200),
  finalize(() => console.log('🏁 finalize — always runs'))
).subscribe({
  next: v => console.log('next:', v),
  complete: () => console.log('complete')
});

throwError(() => new Error('oops')).pipe(
  catchError(e => { console.log('caught:', e.message); return EMPTY; }),
  finalize(() => console.log('🏁 finalize on error too'))
).subscribe();`,

'tap':
`from([1, 2, 3, 4, 5]).pipe(
  tap(v => console.log('📥 before filter:', v)),
  filter(v => v % 2 === 0),
  tap(v => console.log('✅ passed filter:', v)),
  map(v => v * 10)
).subscribe(v => console.log('📤 result:', v));`,

'timeout':
`// เร็วพอ
of('fast response').pipe(
  delay(100),
  timeout(500)
).subscribe({
  next: v => console.log('✅', v),
  error: e => console.log('❌', e.message)
});

// timeout
of('slow response').pipe(
  delay(600),
  timeout(300),
  catchError(err =>
    err.name === 'TimeoutError'
      ? of('⏱️ fallback data')
      : throwError(() => err)
  )
).subscribe(v => console.log(v));`,

'share':
`let callCount = 0;
const data$ = defer(() => {
  callCount++;
  console.log(\`HTTP call #\${callCount}\`);
  return of({ result: 'shared' }).pipe(delay(100));
}).pipe(share());

// 2 subscribers แต่ HTTP call แค่ครั้งเดียว
data$.subscribe(d => console.log('A:', JSON.stringify(d)));
data$.subscribe(d => console.log('B:', JSON.stringify(d)));`,

'shareReplay':
`let callCount = 0;
const config$ = defer(() => {
  callCount++;
  console.log(\`HTTP call #\${callCount}\`);
  return of({ theme: 'dark', lang: 'th' }).pipe(delay(100));
}).pipe(shareReplay({ bufferSize: 1, refCount: true }));

config$.subscribe(c => console.log('header:', JSON.stringify(c)));
config$.subscribe(c => console.log('sidebar:', JSON.stringify(c)));

setTimeout(() =>
  config$.subscribe(c => console.log('late (cached):', JSON.stringify(c))),
300);`,

'Subject':
`const action$ = new Subject();

action$.pipe(
  filter(a => a.type === 'click'),
  throttleTime(200)
).subscribe(a => console.log('handled:', a.type, '#' + a.id));

action$.next({ type: 'click', id: 1 });
action$.next({ type: 'hover', id: 2 }); // filtered out
action$.next({ type: 'click', id: 3 });
action$.complete();`,

'BehaviorSubject':
`const cart$ = new BehaviorSubject([]);

// subscriber A
cart$.subscribe(items => console.log('A cart:', items.length, 'items'));

cart$.next([{ name: 'MacBook', price: 50000 }]);
cart$.next([{ name: 'MacBook', price: 50000 }, { name: 'AirPods', price: 8000 }]);

// subscriber B มาทีหลัง — ได้ค่าล่าสุดทันที
cart$.subscribe(items => console.log('B (late):', items.length, 'items'));

const total = cart$.getValue().reduce((s, i) => s + i.price, 0);
console.log('total:', total.toLocaleString(), 'บาท');`,

'ReplaySubject':
`const history$ = new ReplaySubject(3); // buffer 3 ค่าล่าสุด

history$.next({ action: 'login' });
history$.next({ action: 'view', page: '/home' });
history$.next({ action: 'click', btn: 'buy' });
history$.next({ action: 'checkout' });

// subscriber ใหม่ได้ 3 ล่าสุดทันที
history$.subscribe(a => console.log(JSON.stringify(a)));`,

'AsyncSubject':
`const result$ = new AsyncSubject();

result$.subscribe(v => console.log('A:', v));

result$.next(1); // ยังไม่ emit
result$.next(2); // ยังไม่ emit
result$.next(3); // ยังไม่ emit

result$.complete(); // emit เฉพาะค่าสุดท้าย (3)
console.log('complete called');

// late subscriber ก็ได้ค่า 3
result$.subscribe(v => console.log('B (late):', v));`,
};

function rxjsTryOp(name){
  const op=RXJS_OPS.find(o=>o.n===name);
  if(!op)return;
  rxjsSwitchView('pg');
  rxjsPgSetCode(RXJS_RUN_CODE[name]||op.code);
  rxjsRunCode();
  document.getElementById('rxjs-pg-view').scrollIntoView({behavior:'smooth',block:'start'});
}

function rxjsCopyCode(btn){
  const code=btn.nextElementSibling.textContent;
  copyText(code);
  const old=btn.textContent;btn.textContent='✓ copied';setTimeout(()=>btn.textContent=old,1500);
}

function rxjsJumpTo(name){
  rxjsSwitchView('ref');
  rxjsQ=name.toLowerCase();rxjsCatActive='all';
  const inp=document.getElementById('rxjs-search');if(inp)inp.value=name;
  renderRxjsCats();renderRxjsOps();
  document.getElementById('rxjs-op-list').scrollIntoView({behavior:'smooth',block:'start'});
}

function clearRxjs(){
  if(rxjsCurrentView==='pg'){rxjsClearOutput();return;}
  rxjsQ='';rxjsCatActive='all';
  const inp=document.getElementById('rxjs-search');if(inp)inp.value='';
  renderRxjsCats();renderRxjsOps();
}

function rxjsUcClick(q){
  rxjsSwitchView('ref');
  rxjsCatActive='all';
  renderRxjsCats();
  const inp=document.getElementById('rxjs-search');
  if(inp)inp.value=q;
  rxjsSearch(q);
  document.getElementById('rxjs-op-list').scrollIntoView({behavior:'smooth',block:'start'});
}

function rxjsSwitchView(v){
  rxjsCurrentView=v;
  const ref=document.getElementById('rxjs-ref-view');
  const pg=document.getElementById('rxjs-pg-view');
  const tabRef=document.getElementById('rxjs-vtab-ref');
  const tabPg=document.getElementById('rxjs-vtab-pg');
  const clearBtn=document.getElementById('rxjs-clear-btn');
  if(!ref||!pg)return;
  ref.style.display=v==='ref'?'block':'none';
  pg.style.display=v==='pg'?'block':'none';
  tabRef.classList.toggle('rxjs-view-tab-active',v==='ref');
  tabPg.classList.toggle('rxjs-view-tab-active',v==='pg');
  if(clearBtn)clearBtn.textContent=v==='pg'?'✖ ล้าง output':'✖ ล้าง';
  if(v==='pg'&&rxjsPgEditor)setTimeout(()=>{rxjsPgEditor.refresh();rxjsPgEditor.focus();},0);
}

function rxjsToggleAcc(btn){
  const body=btn.nextElementSibling;
  const open=body.style.display!=='none';
  body.style.display=open?'none':'block';
  btn.classList.toggle('rxjs-acc-open',!open);
  if(!open){
    // animate marble dots on open
    body.querySelectorAll('.rxjs-marble').forEach((m,mi)=>{
      m.classList.remove('rxjs-marble-animated');
      void m.offsetWidth; // force reflow to restart animation
      m.classList.add('rxjs-marble-animated');
      // stagger dots by position within each marble
      m.querySelectorAll('.rxjs-mdot,.rxjs-mend').forEach((dot,di)=>{
        dot.style.animationDelay=(mi*0.05+di*0.08)+'s';
      });
    });
  }
}

// ── RxJS PLAYGROUND ──

const RXJS_PG_PRESETS={
'of':`// of — emit ค่าหลายตัวทีเดียว แล้วแปลงด้วย map
of(1, 2, 3, 4, 5).pipe(
  filter(x => x % 2 !== 0),
  map(x => 'เลขคี่ x²: ' + (x * x))
).subscribe(v => console.log(v));`,

'from':`// from — แปลง array เป็น stream
from(['Angular', 'React', 'Vue']).pipe(
  map((name, i) => \`\${i + 1}. \${name}\`),
  filter(s => !s.includes('Vue'))
).subscribe(v => console.log(v));`,

'interval':`// interval — emit ทุก 300ms รับแค่ 6 ค่า
interval(300).pipe(
  take(6),
  map(i => {
    const bars = '█'.repeat(i + 1);
    return \`[\${i}] \${bars}\`;
  })
).subscribe({
  next: v => console.log(v),
  complete: () => console.log('✅ complete!')
});`,

'scan':`// scan — running total (เหมือน reduce แต่ emit ทุกรอบ)
of(10, 5, 20, 3, 15).pipe(
  scan((acc, v) => ({ sum: acc.sum + v, last: v }), { sum: 0, last: 0 }),
  map(s => \`+\${s.last} → รวม: \${s.sum}\`)
).subscribe(v => console.log(v));`,

'switchMap':`// switchMap — cancel inner เดิม เมื่อมี source ใหม่
// จำลอง: พิมพ์ search term → cancel เก่า → fetch ใหม่
of('a', 'an', 'ang', 'angu', 'angul').pipe(
  concatMap((term, i) =>
    // เพิ่ม delay เพื่อให้เห็นว่า switchMap จะ cancel ของเก่า
    timer(i * 80).pipe(
      switchMap(() => {
        console.log('🔍 search:', term);
        return of(\`results for "\${term}": [\${term}1, \${term}2]\`);
      })
    )
  ),
  take(3) // รับแค่ 3 ตัวแรกที่ผ่าน
).subscribe(r => console.log('📦', r));`,

'combineLatest':`// combineLatest — emit ทุกครั้งที่ stream ใดเปลี่ยน
const price$ = of(100, 200, 350);
const discount$ = of(0, 10, 20);

combineLatest([price$, discount$]).pipe(
  map(([price, disc]) => ({
    price,
    discount: disc + '%',
    total: price * (1 - disc / 100)
  }))
).subscribe(order => console.log(JSON.stringify(order)));`,

'forkJoin':`// forkJoin — parallel requests (รอทุกตัว complete)
forkJoin({
  user: of({ id: 1, name: 'สมชาย' }).pipe(delay(100)),
  posts: of([{ title: 'RxJS เบื้องต้น' }, { title: 'Angular Tips' }]).pipe(delay(150)),
  tags: of(['rxjs', 'angular', 'typescript']).pipe(delay(80))
}).subscribe(({ user, posts, tags }) => {
  console.log('👤 user:', user.name);
  console.log('📝 posts:', posts.length + ' รายการ');
  console.log('🏷️ tags:', tags.join(', '));
  console.log('✅ โหลดพร้อมกันทั้ง 3 APIs!');
});`,

'BehaviorSubject':`// BehaviorSubject — state management
const count$ = new BehaviorSubject(0);

// subscriber A (มาตั้งแต่แรก)
count$.subscribe(v => console.log('A:', v));

count$.next(1);
count$.next(2);
count$.next(3);

// subscriber B (มาทีหลัง) → ได้ค่าล่าสุด (3) ทันที
count$.pipe(
  map(v => 'B (late): ' + v)
).subscribe(v => console.log(v));

count$.next(4);
console.log('ค่าปัจจุบัน:', count$.getValue());`,

'catchError':`// catchError — error handling + fallback
throwError(() => new Error('Network timeout')).pipe(
  tap(() => console.log('ถ้าสำเร็จจะเข้าบรรทัดนี้')),
  catchError(err => {
    console.log('❌ Error:', err.message);
    return of({ data: 'cached fallback', fromCache: true });
  }),
  finalize(() => console.log('🏁 finalize — ทำงานเสมอ ทั้ง success และ error'))
).subscribe(v => console.log('✅ result:', JSON.stringify(v)));`,

'tap':`// tap — side effects โดยไม่เปลี่ยนค่าใน stream (debug-friendly)
from([1, 2, 3, 4, 5]).pipe(
  tap(v => console.log('📥 before filter:', v)),
  filter(v => v % 2 === 0),
  tap(v => console.log('✅ passed filter:', v)),
  map(v => v * 10),
  tap(v => console.log('🔄 after map:', v))
).subscribe(v => console.log('📤 subscribe got:', v));`,

'debounceTime':`// debounceTime — จำลอง search input (รอหยุด emit 200ms ก่อน)
// emit ถี่ๆ แต่ debounce จะปล่อยแค่ค่าสุดท้ายหลังหยุด
const keystrokes$ = from(['a','ab','abc','abcd','abcde']).pipe(
  concatMap((v,i) => timer(i * 60).pipe(map(() => v)))
);

keystrokes$.pipe(
  tap(v => console.log('⌨️ keystroke:', v)),
  debounceTime(150),
).subscribe(v => console.log('🔍 search API called with:', v));`,

'withLatestFrom':`// withLatestFrom — ดึงค่าล่าสุดจาก stream อื่นตอน source emit
const user$ = new BehaviorSubject({ name: 'สมชาย', role: 'admin' });
const actions$ = of('view', 'edit', 'delete');

actions$.pipe(
  withLatestFrom(user$),
  map(([action, user]) => ({
    action,
    user: user.name,
    allowed: user.role === 'admin' || action === 'view'
  }))
).subscribe(r => console.log(JSON.stringify(r)));`
};

let rxjsPgActive=false,rxjsPgLogCount=0,rxjsPgStopHandle=null,rxjsPgInited=false,rxjsPgEditor=null;
const _origConsoleLog=console.log,_origConsoleWarn=console.warn,_origConsoleError=console.error;

const RXJS_PG_DEFAULT=`// โหลดตัวอย่างจาก "ตัวอย่าง" ด้านบน หรือกด ▶ Try ที่ operator card
// Ctrl+Enter = Run

of(1, 2, 3, 4, 5).pipe(
  filter(x => x % 2 !== 0),
  map(x => x * x)
).subscribe(v => console.log('value:', v));`;

function rxjsInitPlayground(){
  if(rxjsPgInited)return;
  rxjsPgInited=true;

  // init CodeMirror
  const wrap=document.getElementById('rxjs-pg-cm-wrap');
  if(wrap&&window.CodeMirror){
    rxjsPgEditor=CodeMirror(wrap,{
      value:RXJS_PG_DEFAULT,
      mode:'javascript',
      theme:'dracula',
      lineNumbers:true,
      lineWrapping:false,
      tabSize:2,
      indentWithTabs:false,
      autoCloseBrackets:true,
      matchBrackets:true,
      extraKeys:{
        'Ctrl-Enter':()=>rxjsRunCode(),
        'Cmd-Enter':()=>rxjsRunCode(),
        'Ctrl-/':cm=>cm.toggleComment(),
        'Tab':cm=>cm.replaceSelection('  ','end')
      }
    });
    rxjsPgEditor.setSize('100%','100%');
  }

  // patch console once — route to output panel when playground is active
  console.log=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'log');
    _origConsoleLog(...args);
  };
  console.warn=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'warn');
    _origConsoleWarn(...args);
  };
  console.error=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'error');
    _origConsoleError(...args);
  };
}

function rxjsPgGetCode(){
  return rxjsPgEditor?rxjsPgEditor.getValue():
    (document.getElementById('rxjs-pg-code')||{value:''}).value;
}
function rxjsPgSetCode(code){
  if(rxjsPgEditor){rxjsPgEditor.setValue(code);rxjsPgEditor.focus();}
  else{const ta=document.getElementById('rxjs-pg-code');if(ta)ta.value=code;}
}

function rxjsPgAppendLog(args,type){
  if(rxjsPgLogCount>=200)return;
  const out=document.getElementById('rxjs-pg-output');
  if(!out)return;
  const empty=out.querySelector('.rxjs-pg-empty');
  if(empty)empty.remove();
  rxjsPgLogCount++;

  if(type==='log'){
    const div=document.createElement('div');
    div.className='rxjs-pg-log rxjs-pg-log-entry';
    const idx=document.createElement('span');
    idx.className='rxjs-pg-log-idx';
    idx.textContent=rxjsPgLogCount;
    const val=document.createElement('span');
    const raw=args.map(a=>{
      if(typeof a==='object'&&a!==null){try{return JSON.stringify(a,null,2);}catch{return String(a);}}
      return String(a);
    }).join(' ');
    val.className='rxjs-pg-log-val'+(typeof args[0]==='number'&&args.length===1?' type-number':typeof args[0]==='string'&&args.length===1?' type-string':typeof args[0]==='boolean'&&args.length===1?' type-bool':'');
    val.textContent=raw;
    div.appendChild(idx);div.appendChild(val);
    out.appendChild(div);
    if(rxjsPgLogCount>=200){
      const lim=document.createElement('div');
      lim.className='rxjs-pg-log-complete';
      lim.textContent='… (ถึงขีดจำกัด 200 บรรทัด)';
      out.appendChild(lim);
      rxjsStopCode();
    }
  }else{
    const div=document.createElement('div');
    div.className=`rxjs-pg-log-${type} rxjs-pg-log-entry`;
    div.textContent=args.join(' ');
    out.appendChild(div);
  }
  out.scrollTop=out.scrollHeight;
}

function rxjsPgSetStatus(txt,running){
  const el=document.getElementById('rxjs-pg-status');
  if(!el)return;
  el.textContent=txt;
  el.className='rxjs-pg-status'+(running?' rxjs-pg-status-running':'');
  const stopBtn=document.getElementById('rxjs-pg-stop-btn');
  if(stopBtn)stopBtn.disabled=!running;
}

function rxjsRunCode(){
  if(!window.rxjs){showToast('กำลังโหลด RxJS...');return;}
  rxjsStopCode();

  const code=rxjsPgGetCode().trim();
  if(!code)return;

  const out=document.getElementById('rxjs-pg-output');
  if(out){out.innerHTML='';const div=document.createElement('div');div.className='rxjs-pg-log-divider';out.appendChild(div);}
  rxjsPgLogCount=0;
  rxjsPgActive=true;
  rxjsPgSetStatus('▶ Running…',true);

  // auto-stop safety after 15 seconds
  rxjsPgStopHandle=setTimeout(()=>{
    rxjsPgAppendLog(['⏱️ หยุดอัตโนมัติหลัง 15 วินาที'],'warn');
    rxjsStopCode();
  },15000);

  const {of,from,fromEvent,interval,timer,range,EMPTY,throwError,defer,iif,
    combineLatest,merge,concat,zip,forkJoin,race,Subject,BehaviorSubject,
    ReplaySubject,AsyncSubject,Observable,
    map,filter,take,takeUntil,takeWhile,skip,skipUntil,
    first,last,debounceTime,throttleTime,distinctUntilChanged,
    distinct,sampleTime,switchMap,mergeMap,concatMap,exhaustMap,
    scan,reduce,buffer,bufferTime,groupBy,toArray,pairwise,
    catchError,retry,retryWhen,finalize,tap,delay,timeout,
    share,shareReplay,startWith,withLatestFrom,pipe}=window.rxjs;

  try{
    new Function('of','from','fromEvent','interval','timer','range','EMPTY','throwError',
      'defer','iif','combineLatest','merge','concat','zip','forkJoin','race',
      'Subject','BehaviorSubject','ReplaySubject','AsyncSubject','Observable',
      'map','filter','take','takeUntil','takeWhile','skip','skipUntil',
      'first','last','debounceTime','throttleTime','distinctUntilChanged',
      'distinct','sampleTime','switchMap','mergeMap','concatMap','exhaustMap',
      'scan','reduce','buffer','bufferTime','groupBy','toArray','pairwise',
      'catchError','retry','retryWhen','finalize','tap','delay','timeout',
      'share','shareReplay','startWith','withLatestFrom','pipe',
      code
    )(of,from,fromEvent,interval,timer,range,EMPTY,throwError,
      defer,iif,combineLatest,merge,concat,zip,forkJoin,race,
      Subject,BehaviorSubject,ReplaySubject,AsyncSubject,Observable,
      map,filter,take,takeUntil,takeWhile,skip,skipUntil,
      first,last,debounceTime,throttleTime,distinctUntilChanged,
      distinct,sampleTime,switchMap,mergeMap,concatMap,exhaustMap,
      scan,reduce,buffer,bufferTime,groupBy,toArray,pairwise,
      catchError,retry,retryWhen,finalize,tap,delay,timeout,
      share,shareReplay,startWith,withLatestFrom,pipe);

    // if synchronous ops, mark done after a tick
    setTimeout(()=>{
      if(rxjsPgActive&&rxjsPgLogCount>0){
        rxjsPgSetStatus('✅ สำเร็จ ('+rxjsPgLogCount+' logs)',false);
        rxjsPgActive=false;
        clearTimeout(rxjsPgStopHandle);
      }else if(rxjsPgActive){
        rxjsPgSetStatus('▶ Running…',true);
      }
    },100);

  }catch(e){
    rxjsPgActive=false;
    clearTimeout(rxjsPgStopHandle);
    rxjsPgAppendLog(['❌ '+e.message],'error');
    rxjsPgSetStatus('❌ Error',false);
  }
}

function rxjsStopCode(){
  rxjsPgActive=false;
  clearTimeout(rxjsPgStopHandle);
  rxjsPgSetStatus('⏹ หยุดแล้ว',false);
}

function rxjsClearOutput(){
  rxjsStopCode();
  const out=document.getElementById('rxjs-pg-output');
  if(out){out.innerHTML='<div class="rxjs-pg-empty">กด ▶ Run เพื่อรันโค้ด</div>';}
  rxjsPgLogCount=0;
  rxjsPgSetStatus('⏸ พร้อม',false);
  document.querySelectorAll('.rxjs-pg-preset-btn').forEach(b=>b.classList.remove('rxjs-pg-preset-active'));
}

function rxjsPgPreset(name){
  const code=RXJS_PG_PRESETS[name];
  if(!code)return;
  rxjsPgSetCode(code);
  document.querySelectorAll('.rxjs-pg-preset-btn').forEach(b=>{
    b.classList.toggle('rxjs-pg-preset-active',b.getAttribute('onclick').includes("'"+name+"'"));
  });
}

// ── ANGULAR LIFECYCLE ──
const NG_HOOKS=[
  {id:'constructor',name:'constructor()',iface:null,phase:['create'],freq:'once',fires_on:['create'],
   desc:'สร้าง instance ของ component — Angular inject dependencies ที่นี่ก่อนสิ่งอื่นทั้งหมด',
   when:['inject services ผ่าน DI','initialize ค่าเริ่มต้นที่ไม่ต้องการ DOM หรือ @Input'],
   avoid:['เรียก HTTP requests — @Input ยังไม่พร้อม','เข้าถึง DOM — ยังไม่ render','logic ซับซ้อน — ย้ายไป ngOnInit'],
   tip:'ใช้แค่ inject dependencies + assign ค่าง่ายๆ เท่านั้น',
   code:'constructor(\n  private userService: UserService,\n  private router: Router\n) {\n  // inject เท่านั้น — ห้าม logic, HTTP call\n}'},
  {id:'ngOnChanges',name:'ngOnChanges(changes)',iface:'OnChanges',phase:['create','update'],freq:'on-input-change',fires_on:['create','update'],
   desc:'เรียกทุกครั้งที่ @Input property เปลี่ยน — รวมถึงครั้งแรกที่ create (ก่อน ngOnInit)',
   when:['react ต่อการเปลี่ยน @Input','เปรียบเทียบ previousValue กับ currentValue','reset state เมื่อ @Input เปลี่ยน'],
   avoid:['logic หนักโดยไม่ check firstChange','pass object/array แบบ mutate — reference เดิม Angular ตรวจไม่เจอ'],
   tip:"ใช้ changes['prop'].firstChange เพื่อแยก 'สร้างครั้งแรก' กับ 'update'",
   code:"ngOnChanges(changes: SimpleChanges): void {\n  if (changes['userId'] && !changes['userId'].firstChange) {\n    // @Input เปลี่ยนหลัง init — โหลดข้อมูลใหม่\n    this.loadUser(changes['userId'].currentValue);\n  }\n}"},
  {id:'ngOnInit',name:'ngOnInit()',iface:'OnInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง ngOnChanges ครั้งแรก — @Input พร้อม เหมาะที่สุดสำหรับ initialization',
   when:['fetch data จาก API','subscribe to Observables','initialize component state โดยใช้ @Input'],
   avoid:['เข้าถึง @ViewChild — DOM ยังไม่พร้อม','ใส่ logic ที่ต้องรู้ DOM'],
   tip:'Best place สำหรับ initialization ทั้งหมด — ย้าย HTTP call จาก constructor มาที่นี่เสมอ',
   code:"ngOnInit(): void {\n  // ✅ ที่ที่ดีที่สุดสำหรับ initialization\n  this.userId = this.route.snapshot.params['id'];\n  this.user$ = this.userService.getUser(this.userId).pipe(\n    takeUntil(this.destroy$)\n  );\n}"},
  {id:'ngDoCheck',name:'ngDoCheck()',iface:'DoCheck',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก Change Detection cycle — ใช้ detect การเปลี่ยนที่ Angular ตรวจไม่เจอเอง เช่น object mutate',
   when:['ต้องการ custom change detection','ตรวจ array/object ที่ mutate โดยไม่เปลี่ยน reference'],
   avoid:['logic หนักทุกชนิด — runs ทุก click, keystroke, async event','ส่วนใหญ่ใช้ ngOnChanges แทนได้และดีกว่า'],
   tip:'⚠️ hook ที่ run บ่อยที่สุด — ใส่แค่ early return + O(1) operation เท่านั้น',
   code:'ngDoCheck(): void {\n  // ⚠️ ทำงานทุก CD cycle — ต้องเร็วมาก\n  if (this.items.length !== this.prevLength) {\n    this.prevLength = this.items.length;\n    this.recalculate(); // O(1) เท่านั้น!\n  }\n}'},
  {id:'ngAfterContentInit',name:'ngAfterContentInit()',iface:'AfterContentInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง Angular project content จาก parent (<ng-content>) เข้า component เสร็จ',
   when:['เข้าถึง @ContentChild / @ContentChildren','init logic ที่ต้องรอ projected content พร้อม'],
   avoid:['component ที่ไม่มี <ng-content> — hook นี้ไม่มีประโยชน์'],
   tip:'Content = HTML ที่ parent ส่งมาผ่าน <ng-content> ไม่ใช่ template ของ component เอง',
   code:'@ContentChild(TabHeaderComponent)\nheader!: TabHeaderComponent;\n\nngAfterContentInit(): void {\n  // ✅ projected content พร้อมแล้ว\n  this.header.setActive(true);\n}'},
  {id:'ngAfterContentChecked',name:'ngAfterContentChecked()',iface:'AfterContentChecked',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก CD cycle หลัง Angular check projected content (<ng-content>) เสร็จ',
   when:['ต้องการ react หลัง content projection ถูก check และ update'],
   avoid:['เปลี่ยน @ContentChild properties ที่ผูกกับ template — ExpressionChangedAfterItHasBeenCheckedError','logic หนัก — runs ทุก CD cycle'],
   tip:'⚠️ ระวัง ExpressionChangedAfterItHasBeenCheckedError ถ้าเปลี่ยน binding ที่นี่',
   code:'ngAfterContentChecked(): void {\n  // ⚠️ ทำงานทุก CD cycle หลัง check content\n  // ห้ามเปลี่ยน bound properties — ExpressionChangedError\n}'},
  {id:'ngAfterViewInit',name:'ngAfterViewInit()',iface:'AfterViewInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง Angular render view ของ component และ child components เสร็จ — DOM พร้อมทั้งหมด',
   when:['เข้าถึง @ViewChild / @ViewChildren','init third-party DOM libraries (Chart.js, maps, D3)','measure DOM element sizes'],
   avoid:['ย้ายมาจาก ngOnInit เท่านั้น — ngOnInit DOM ยังไม่พร้อม'],
   tip:'First place ที่ DOM พร้อม 100% — @ViewChild ทุกตัว accessible ที่นี่',
   code:"@ViewChild('chart') chartRef!: ElementRef;\n\nngAfterViewInit(): void {\n  // ✅ DOM พร้อม 100% — เข้าถึง ViewChild ได้\n  this.chart = new Chart(\n    this.chartRef.nativeElement,\n    this.chartConfig\n  );\n}"},
  {id:'ngAfterViewChecked',name:'ngAfterViewChecked()',iface:'AfterViewChecked',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก CD cycle หลัง Angular check view ของ component และ child views เสร็จ',
   when:['ต้องการ react หลัง view update เสร็จทุกครั้ง — ใช้น้อยมากในทางปฏิบัติ'],
   avoid:['detectChanges() ที่นี่ — infinite loop','เปลี่ยน data binding — ExpressionChangedAfterItHasBeenCheckedError','heavy logic — runs บ่อยมาก'],
   tip:'⚠️ Hook อันตรายที่สุด — ส่วนใหญ่ไม่ควรใช้ ถ้าต้องใช้ ให้ early return เสมอ',
   code:'ngAfterViewChecked(): void {\n  // ⚠️ DANGER ZONE — ทำงานทุก CD cycle\n  // ห้ามเรียก detectChanges() — infinite loop\n  // ห้ามเปลี่ยน data binding — ExpressionChangedError\n}'},
  {id:'ngOnDestroy',name:'ngOnDestroy()',iface:'OnDestroy',phase:['destroy'],freq:'once',fires_on:['destroy'],
   desc:'เรียกก่อน Angular ทำลาย component — cleanup ทุกอย่างที่นี่เพื่อป้องกัน memory leak',
   when:['unsubscribe Observables','clearInterval / clearTimeout','remove event listeners','destroy third-party libraries'],
   avoid:['ลืม implement — memory leak ทันที'],
   tip:'ใช้ Subject + takeUntil pattern เพื่อ unsubscribe ทุก Observable ในคำสั่งเดียว',
   code:'private destroy$ = new Subject<void>();\n\nngOnInit(): void {\n  interval(1000).pipe(\n    takeUntil(this.destroy$)\n  ).subscribe(t => this.tick = t);\n}\n\nngOnDestroy(): void {\n  // ✅ cleanup ทุกอย่าง — ป้องกัน memory leak\n  this.destroy$.next();\n  this.destroy$.complete();\n}'}
];

const NG_SCENARIOS={
  create: ['constructor','ngOnChanges','ngOnInit','ngDoCheck','ngAfterContentInit','ngAfterContentChecked','ngAfterViewInit','ngAfterViewChecked'],
  update: ['ngOnChanges','ngDoCheck','ngAfterContentChecked','ngAfterViewChecked'],
  cd:     ['ngDoCheck','ngAfterContentChecked','ngAfterViewChecked'],
  destroy:['ngOnDestroy']
};
const NG_PC={'create':'#22d3ee','update':'#fbbf24','destroy':'#f87171'};
const NG_FC={'once':'#34d399','every-cd':'#f87171','on-input-change':'#fbbf24'};
const NG_FL={'once':'เรียกครั้งเดียว','every-cd':'ทุก CD cycle ⚠️','on-input-change':'ทุกครั้งที่ @Input เปลี่ยน'};
let ngTimer=null,ngQ='';

function hlTS(code){return window.hljs?window.hljs.highlight(code,{language:'typescript'}).value:escHtml(code);}

function initAngular(){renderNgTimeline();renderNgHooks();renderNgDetail(null);}

function ngPB(p){return 'ng-pb-'+p;}
function ngFB(f){return 'ng-fb-'+f.replace(/-/g,'-');}

function renderNgTimeline(){
  const el=document.getElementById('ng-timeline');
  if(!el)return;
  el.innerHTML=NG_HOOKS.map(h=>{
    const c=NG_PC[h.phase[0]];
    return `<div class="ng-hook-node" id="ngn-${h.id}" onclick="ngSelectHook('${h.id}')">
  <div class="ng-hook-dot" style="border-color:${c}"></div>
  <div class="ng-hook-info">
    <span class="ng-hook-name">${h.name}</span>
    <div class="ng-hook-badges">
      ${h.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
      <span class="ng-freq-badge ${ngFB(h.freq)}">${NG_FL[h.freq]}</span>
    </div>
  </div>
</div>`;
  }).join('');
}

function renderNgDetail(hook){
  const el=document.getElementById('ng-detail');
  if(!el)return;
  if(!hook){
    el.innerHTML=`<div class="ng-detail-empty"><div class="ng-detail-empty-icon">🎬</div><div>กด <strong>▶ Simulate</strong> เพื่อดู hooks ที่ fire ตามลำดับ</div><div class="ng-detail-empty-sub">หรือ click hook ในแผนภูมิซ้ายเพื่อดูรายละเอียด</div></div>`;
    return;
  }
  el.innerHTML=`<div class="ng-detail-content">
  <div class="ng-detail-name">${hook.name}</div>
  <div class="ng-detail-badges">
    ${hook.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
    <span class="ng-freq-badge ${ngFB(hook.freq)}">${NG_FL[hook.freq]}</span>
    ${hook.iface?`<span class="ng-iface-badge">implements ${hook.iface}</span>`:''}
  </div>
  <div class="ng-detail-desc">${hook.desc}</div>
  ${hook.tip?`<div class="ng-detail-tip">💡 ${escHtml(hook.tip)}</div>`:''}
  <div class="ng-detail-section"><div class="ng-detail-sec-title ng-sec-ok">✓ ใช้เมื่อ</div>${hook.when.map(w=>`<div class="ng-detail-item">• ${escHtml(w)}</div>`).join('')}</div>
  ${hook.avoid.length?`<div class="ng-detail-section"><div class="ng-detail-sec-title ng-sec-no">✗ หลีกเลี่ยง</div>${hook.avoid.map(a=>`<div class="ng-detail-item ng-avoid-item">• ${escHtml(a)}</div>`).join('')}</div>`:''}
  <div class="ng-detail-code-wrap"><button class="rxjs-copy-btn" onclick="event.stopPropagation();rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code>${hlTS(hook.code)}</code></pre></div>
</div>`;
}

function ngSelectHook(id){
  document.querySelectorAll('.ng-hook-node').forEach(n=>n.classList.remove('ng-node-selected'));
  const node=document.getElementById('ngn-'+id);
  if(node)node.classList.add('ng-node-selected');
  renderNgDetail(NG_HOOKS.find(h=>h.id===id)||null);
}

function ngSimulate(scenario){
  if(ngTimer){clearTimeout(ngTimer);ngTimer=null;}
  const hooks=NG_SCENARIOS[scenario];
  document.querySelectorAll('.ng-sim-btn').forEach(b=>b.classList.remove('ng-sim-active'));
  const ab=document.querySelector('.ng-sim-btn[data-scenario="'+scenario+'"]');
  if(ab)ab.classList.add('ng-sim-active');
  document.querySelectorAll('.ng-hook-node').forEach(node=>{
    node.classList.remove('ng-node-active','ng-node-done','ng-node-selected');
    node.classList.toggle('ng-node-dim',!hooks.includes(node.id.replace('ngn-','')));
  });
  let idx=0;
  function step(){
    if(idx>0){
      const pn=document.getElementById('ngn-'+hooks[idx-1]);
      if(pn){pn.classList.remove('ng-node-active');pn.classList.add('ng-node-done');}
    }
    if(idx>=hooks.length)return;
    const id=hooks[idx];
    const node=document.getElementById('ngn-'+id);
    if(node){node.classList.add('ng-node-active');node.scrollIntoView({behavior:'smooth',block:'nearest'});}
    renderNgDetail(NG_HOOKS.find(h=>h.id===id)||null);
    idx++;
    ngTimer=setTimeout(step,700);
  }
  step();
}

function ngReset(){
  if(ngTimer){clearTimeout(ngTimer);ngTimer=null;}
  document.querySelectorAll('.ng-hook-node').forEach(n=>n.classList.remove('ng-node-active','ng-node-done','ng-node-dim','ng-node-selected'));
  document.querySelectorAll('.ng-sim-btn').forEach(b=>b.classList.remove('ng-sim-active'));
  renderNgDetail(null);
}

function renderNgHooks(){
  const el=document.getElementById('ng-hook-list');
  if(!el)return;
  const q=ngQ.toLowerCase();
  const hooks=q?NG_HOOKS.filter(h=>h.name.toLowerCase().includes(q)||h.desc.toLowerCase().includes(q)||h.when.join(' ').toLowerCase().includes(q)):NG_HOOKS;
  const cnt=document.getElementById('ng-count');
  if(cnt)cnt.textContent=hooks.length+' hooks';
  if(!hooks.length){el.innerHTML='<div class="rxjs-empty">ไม่พบ hook ที่ค้นหา</div>';return;}
  el.innerHTML=hooks.map(h=>`<div class="ng-hook-card" onclick="ngSelectHook('${h.id}')">
  <div class="rxjs-op-top">
    <span class="rxjs-op-name">${h.name}</span>
    ${h.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
    <span class="ng-freq-badge ${ngFB(h.freq)}">${NG_FL[h.freq]}</span>
  </div>
  <div class="rxjs-op-summary">${escHtml(h.desc)}</div>
  <div class="rxjs-op-when">
    <span class="rxjs-when-ok">✓ ใช้เมื่อ</span>
    ${h.when.map(w=>`<div class="rxjs-when-item">• ${escHtml(w)}</div>`).join('')}
    ${h.avoid.length?'<span class="rxjs-when-no">✗ หลีกเลี่ยง</span>'+h.avoid.map(a=>`<div class="rxjs-when-item rxjs-avoid">• ${escHtml(a)}</div>`).join(''):''}
  </div>
  ${h.tip?`<div class="ng-hook-tip">💡 ${escHtml(h.tip)}</div>`:''}
  <details class="rxjs-details" onclick="event.stopPropagation()"><summary class="rxjs-details-sum"><span class="rxjs-sig-lbl">code</span> <code class="rxjs-sig-code">${escHtml(h.name)}</code></summary><div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="event.stopPropagation();rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code>${hlTS(h.code)}</code></pre></div></details>
</div>`).join('');
}

function ngSearch(q){ngQ=q;renderNgHooks();}

// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  restoreTheme();
  restoreTab();
  restoreNavSearch();

  // Restore saved timezone
  try{
    const savedTz=localStorage.getItem('isaan-devtools-tz');
    if(savedTz){
      cronTz=savedTz;
      const sel=document.getElementById('cron-tz');
      if(sel){
        const opt=Array.from(sel.options).find(o=>o.value===savedTz);
        if(opt)sel.value=savedTz;
      }
    }
  }catch(e){}

  renderCmdList(KUBECTL_CMDS,'kubectl-list','');
  renderCmdList(LINUX_CMDS,'linux-list','');
  renderCmdList(GIT_CMDS,'git-list','');
  updateCronDisplay('* * * * *');

  // Real-time clock — update every second
  updateTzClock();
  setInterval(updateTzClock, 1000);

  initColorWheel();
  initHttp();
  initRxjs();
  initAngular();
  initJsonLineNumbers();

  // Sync JSON Live checkbox state
  try {
    const liveChk = document.getElementById('json-live');
    if (liveChk) jsonLiveMode = liveChk.checked;
  } catch (e) {}

  // Auto-generate mock data on load
  generateAll();

  // Persist last input for key tools (restore on load, save on input)
  const PERSIST_FIELDS = [
    {id:'sql-input',     key:'isaan-devtools-sql-last'},
    {id:'b64-input',     key:'isaan-devtools-b64-last'},
    {id:'url-input',     key:'isaan-devtools-url-last'},
    {id:'hash-input',    key:'isaan-devtools-hash-last'},
    {id:'regex-pattern', key:'isaan-devtools-regex-pat'},
    {id:'regex-flags',   key:'isaan-devtools-regex-flg'},
    {id:'regex-input',   key:'isaan-devtools-regex-txt'},
  ];
  PERSIST_FIELDS.forEach(({id, key}) => {
    const el = document.getElementById(id);
    if (!el) return;
    try { const saved = localStorage.getItem(key); if (saved !== null) el.value = saved; } catch(e) {}
    el.addEventListener('input', () => { try { localStorage.setItem(key, el.value); } catch(e) {} });
  });
  // Trigger post-restore reactions for tools that need it
  try {
    if (localStorage.getItem('isaan-devtools-sql-last')) detectSqlMode(document.getElementById('sql-input').value);
    if (localStorage.getItem('isaan-devtools-hash-last')) computeHash();
    if (localStorage.getItem('isaan-devtools-regex-pat') || localStorage.getItem('isaan-devtools-regex-txt')) runRegex();
  } catch(e) {}

  // Register Service Worker for PWA offline support (HTTPS only)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Scroll-to-top button
  const _scrollBtn=document.getElementById('scroll-top-btn');
  const _contentArea=document.querySelector('.content-area');
  if(_contentArea&&_scrollBtn)_contentArea.addEventListener('scroll',()=>_scrollBtn.classList.toggle('visible',_contentArea.scrollTop>200),{passive:true});
});