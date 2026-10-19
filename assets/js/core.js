// ── TOPBAR META ──
const TAB_META = {
  'random-tab': { title: 'Mock Data Generator', sub: 'สร้างข้อมูลจำลองสำหรับทดสอบระบบ · รองรับภาษาไทย' },
  'sql-tab': { title: 'Java String → Clean SQL', sub: 'แยก SQL ออกจาก Java String, StringBuilder, Text Block, MyBatis' },
  'compare-tab': { title: 'เปรียบเทียบข้อความ / JSON', sub: 'แสดงความแตกต่างระดับตัวอักษรหรือระดับบรรทัด' },
  'json-tab': { title: 'JSON Tools', sub: 'จัดรูปแบบ · บีบอัด · Tree View · JSONPath Query' },
  'unix-tab': { title: 'Unix Timestamp Converter', sub: 'แปลง Unix timestamp เป็นวันที่และเวลา' },
  'base64-tab': { title: 'Base64 Encode / Decode', sub: 'รองรับ plain text, Unicode, ภาษาไทย และ URL-safe Base64' },
  'url-tab': { title: 'URL Encode / Decode', sub: 'encodeURIComponent / decodeURIComponent · รองรับ Unicode และภาษาไทย' },
  'hash-tab': { title: 'Hash Generator', sub: 'SHA-256 / SHA-512 / SHA-1: คำนวณฝั่ง client ทั้งหมด' },
  'k8s-secret-tab': { title: 'K8s Secret Decoder', sub: 'วาง Secret YAML / JSON แล้ว decode data: ทุก key · รองรับหลาย Secret (---)' },
  'jwt-tab': { title: 'JWT Decoder', sub: 'แกะ JWT token ดู header, payload, signature · client-side ล้วน' },
  'cron-tab': { title: 'Cron Expression Builder', sub: 'สร้าง cron expression สำหรับ Linux, Spring @Scheduled, Quartz' },
  'regex-tab': { title: 'Regex Tester', sub: 'ทดสอบ Regular Expression พร้อม highlight และ capture groups' },
  'color-tab': { title: 'Color Picker', sub: 'Color Wheel · HSL/RGB/Alpha sliders · Hex ↔ RGB ↔ HSL' },
  'http-tab': { title: 'HTTP Status Code Reference', sub: '1xx · 2xx · 3xx · 4xx · 5xx: คำอธิบายและตัวอย่างการใช้งาน' },
  'kubectl-tab': { title: 'kubectl Cheatsheet', sub: 'คำสั่ง kubectl ที่ใช้บ่อย พร้อมคำอธิบายภาษาไทย' },
  'linux-tab': { title: 'Linux Command Cheatsheet', sub: 'คำสั่ง Linux ที่ใช้บ่อย: Ubuntu / Debian / RHEL' },
  'git-tab': { title: 'Git CLI Cheatsheet', sub: 'คำสั่ง Git ที่ใช้บ่อย: commit · branch · rebase · stash · undo' },
  'numbase-tab': { title: 'Number Base Converter', sub: 'แปลงเลขฐาน 10 ↔ 16 ↔ 2 ↔ 8' },
  'rxjs-tab': { title: 'RxJS Reference', sub: 'Operator Explorer · Marble Diagrams · คำอธิบายภาษาไทย' },
  'angular-tab': { title: 'Angular Lifecycle', sub: 'Lifecycle Hooks · afterNextRender · Interactive Simulator · คำอธิบายภาษาไทย' },
  'mq-tab': { title: 'RabbitMQ · Redis · Quarkus', sub: 'Concepts · Animations · Code Examples สำหรับมือใหม่' },
  'storage-tab': { title: 'Browser Storage APIs', sub: 'localStorage · sessionStorage · IndexedDB · Cookies · Cache API · OPFS' },
  'lov-tab': { title: 'LOV Query Template Browser / Editor', sub: 'ดู · แก้ · สร้าง · ลบ .lov.json ในโฟลเดอร์ได้เลย ไม่ต้องเปิด cdgs-template-designer · ประกอบ SQL พร้อม copy' },
  'json2type-tab': { title: 'JSON → Type', sub: 'สร้าง TypeScript interface / Java record จาก JSON ตัวอย่าง' },
  'props-tab': { title: 'Properties ↔ YAML', sub: 'แปลง application.properties ของ Quarkus เป็น YAML และกลับกัน' },
  'thai-tab': { title: 'พ.ศ. · เลขบัตร · บาท', sub: 'แปลงวันที่ พ.ศ./ค.ศ. · ตรวจเลข 13 หลัก · จำนวนเงินเป็นตัวอักษร' },
  'sqlref-tab': { title: 'SQL & System Catalog', sub: 'ดึงข้อมูลระบบของ DB และฟังก์ชันที่ใช้บ่อย · DB2 / MariaDB' },
  'db2err-tab': { title: 'DB2 Error Codes', sub: 'ค้นหา SQLCODE / SQLSTATE พร้อมสาเหตุและวิธีแก้' },
  'stacktrace-tab': { title: 'Stack Trace Analyzer', sub: 'หาต้นเหตุ บรรทัดในโค้ดของเรา และวิธีแก้จาก stack trace' },
  'javaex-tab': { title: 'Java Exceptions', sub: 'exception ที่เจอบ่อยใน Java / Quarkus / Hibernate และวิธีแก้' },
  'javaint-tab': { title: 'Java Internals', sub: 'compile vs runtime · JVM memory · annotation · transaction' },
  'ngrx-tab': { title: 'NgRx / Redux', sub: 'Action · Reducer · Selector · Effect แบบเห็นภาพทีละขั้น' },
  'k8sref-tab': { title: 'Docker & K8s', sub: 'ไฟล์ตัวอย่างอ่านทีละบรรทัด · mount ไฟล์ · Helm · ArgoCD · แก้ปัญหา Pod' },
  'gateway-tab': { title: 'Request Path', sub: 'Browser → Load Balancer → Kong → Service → Pod · nginx' },
  'qr-tab': { title: 'QR & Barcode Reader', sub: 'อ่าน QR และ barcode (EAN · UPC · Code 128 · Code 39 …) จากรูป คลิปบอร์ด หรือกล้อง · แยกฟิลด์ PromptPay / Thai QR พร้อมตรวจ CRC' },
  'jenkins-tab': { title: 'Jenkins CI/CD', sub: 'Jenkinsfile ทีละบรรทัด · shared library · CD แบบ GitOps · แก้ปัญหา pipeline' },
  'clicheat-tab': { title: 'CLI Cheatsheets', sub: 'คำสั่ง Docker · DB2 CLP · Maven · pnpm ที่ใช้บ่อย' },
  'home-tab': { title: 'หน้าแรก', sub: 'วางอะไรก็ได้ แล้วจะเปิดเครื่องมือที่ใช่ให้ · เครื่องมือล่าสุด · รายการโปรด' },
  'changelog-tab': { title: 'อัปเดต', sub: 'แต่ละรุ่นออกวันไหน และมีอะไรใหม่' },
  'esan-agent-tab': { title: 'ESAN AI AGENT', sub: 'Claude Code plugin · ติดตั้ง · อัปเดต · เปิดใช้งานที่ localhost:4567 บนเครื่องตัวเอง' },
  'claude-patterns-tab': { title: 'Claude Code Patterns', sub: 'Plan → Design → Build · ไฟล์งาน 5 ชิ้น · RCTCF · plan mode · skill / hook · verifier' },
  'claude-agentic-tab': { title: 'Claude Code Agentic & Security', sub: 'Loop Engineering · subagent / hook / headless · MCP · guardrail 5 ชั้น · แผน 30 วัน' },
};

// inline SVG from the sprite in index.html
function ic(name,cls){return `<svg class="i${cls?' '+cls:''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;}
// segmented control (.json-view-toggle of data-v buttons): mark the chosen one
function setSegmented(id,val){document.querySelectorAll(`#${id} [data-v]`).forEach(b=>{const on=b.dataset.v===val;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});}

// ── THEME ──
// data-theme on <body>: '' = macOS Dark, 'light' = macOS Light, or a preset palette id.
// Appearance and accent belong to the macOS theme; presets carry their own palette.
const STORAGE_KEY='esan-devtools-theme';             // 'mac' | preset id
const STORAGE_APPEARANCE='esan-devtools-appearance'; // 'light' | 'dark' | 'auto'
const STORAGE_ACCENT='esan-devtools-accent';         // accent id | '#rrggbb'
const STORAGE_TAB='esan-devtools-tab';
const ACCENTS=[ // [id, name, light, dark] — macOS system accent colours
  ['blue','ฟ้า','#007aff','#0a84ff'],
  ['purple','ม่วง','#af52de','#bf5af2'],
  ['pink','ชมพู','#ff2d55','#ff375f'],
  ['red','แดง','#ff3b30','#ff453a'],
  ['orange','ส้ม','#ff9500','#ff9f0a'],
  ['yellow','เหลือง','#ffcc00','#ffd60a'],
  ['green','เขียว','#28cd41','#32d74b'],
  ['graphite','กราไฟต์','#8e8e93','#98989d'],
];
const PRESETS=[ // [id, name, swatch]
  ['matrix','Matrix','linear-gradient(135deg,#001200 55%,#00ff41 55%)'],
  ['nord','Nord','linear-gradient(135deg,#2e3440 55%,#88c0d0 55%)'],
  ['dracula','Dracula','linear-gradient(135deg,#282a36 55%,#bd93f9 55%)'],
  ['kitty','Kitty','linear-gradient(135deg,#fff5f9 55%,#e8549a 55%)'],
];
const ACCENT_VARS=['--accent','--accent-fg','--on-accent','--accent-glow','--btn-primary-bg','--btn-primary-text'];
const theme={id:'mac',appearance:'auto',accent:'blue'};
const darkMQ=window.matchMedia('(prefers-color-scheme: dark)');

function loadTheme(){
  let t=null,ap=null,ac=null;
  try{t=localStorage.getItem(STORAGE_KEY);ap=localStorage.getItem(STORAGE_APPEARANCE);ac=localStorage.getItem(STORAGE_ACCENT);}catch(e){}
  // before v2 the key held 'default' (dark) / 'light' / esan / cdg / south — the retired ones become macOS Dark
  if(t==='light'){t='mac';ap=ap||'light';}
  else if(t&&t!=='mac'&&!PRESETS.some(p=>p[0]===t)){t='mac';ap=ap||'dark';}
  theme.id=t||'dracula'; // first visit
  theme.appearance=['light','dark','auto'].includes(ap)?ap:'auto';
  theme.accent=ac&&(ACCENTS.some(a=>a[0]===ac)||/^#[0-9a-f]{6}$/i.test(ac))?ac:'blue';
}
function saveTheme(){
  try{
    localStorage.setItem(STORAGE_KEY,theme.id);
    localStorage.setItem(STORAGE_APPEARANCE,theme.appearance);
    localStorage.setItem(STORAGE_ACCENT,theme.accent);
  }catch(e){}
}
function isDark(){return theme.appearance==='auto'?darkMQ.matches:theme.appearance==='dark';}
function accentHex(){const a=ACCENTS.find(x=>x[0]===theme.accent);return a?(isDark()?a[3]:a[2]):theme.accent;}
function applyTheme(){
  const preset=theme.id!=='mac';
  document.body.setAttribute('data-theme',preset?theme.id:(isDark()?'':'light'));
  applyAccent(preset?null:accentHex());
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=getComputedStyle(document.body).getPropertyValue('--bg').trim();
  syncSettingsUI();
}
// cross-fade the whole window where the View Transitions API exists
function changeTheme(mutate){
  const run=()=>{mutate();saveTheme();applyTheme();};
  if(document.startViewTransition&&clickFx)document.startViewTransition(run);else run();
}
function setAppearance(ap){changeTheme(()=>{theme.id='mac';theme.appearance=ap;});}
function setAccent(ac){changeTheme(()=>{theme.id='mac';theme.accent=ac;});}
function setPreset(id){changeTheme(()=>{theme.id=id;});}
function restoreTheme(){
  loadTheme();
  renderThemePickers();
  applyTheme();
  darkMQ.addEventListener('change',()=>{if(theme.id==='mac'&&theme.appearance==='auto')applyTheme();});
}

// ── ACCENT CONTRAST ── WCAG 2 relative luminance; shade the accent until each text pair reaches 4.5:1
function hexRgb(h){const n=parseInt(h.replace('#',''),16);return[n>>16&255,n>>8&255,n&255];}
function rgbHex(c){return'#'+c.map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');}
function lum(hex){return hexRgb(hex).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function shade(hex,t){const k=t<0?0:255,f=Math.abs(t);return rgbHex(hexRgb(hex).map(v=>v+(k-v)*f));} // t<0 toward black, t>0 toward white
function accentVars(hex,surface){
  const dark=lum(surface)<.2,INK='#1d1d1f';
  // accent used as text on surfaces: lighten on dark, darken on light
  let fg=hex;for(let t=.04;contrast(fg,surface)<4.5&&t<=1;t+=.04)fg=shade(hex,dark?t:-t);
  // filled controls keep white text when a light darken gets there (the macOS look), else ink text
  let bg=hex,t=0;
  while(contrast(bg,'#ffffff')<4.5&&t<.25){t+=.02;bg=shade(hex,-t);}
  let text='#ffffff';
  if(contrast(bg,'#ffffff')<4.5){
    if(contrast(hex,INK)>=4.5){bg=hex;text=INK;}
    else while(contrast(bg,'#ffffff')<4.5&&t<1){t+=.02;bg=shade(hex,-t);}
  }
  const[r,g,b]=hexRgb(hex);
  return{'--accent':hex,'--accent-fg':fg,'--on-accent':contrast(hex,'#ffffff')>=contrast(hex,INK)?'#ffffff':INK,
    '--accent-glow':`rgba(${r},${g},${b},${dark?.3:.2})`,'--btn-primary-bg':bg,'--btn-primary-text':text};
}
// --surface2 is a constant per theme and never depends on the accent, so it is read once per theme;
// reading it on every accent change forced a whole-page style recalc each time (the picker lagged)
const _surfaceOf={};
function themeSurface(){
  const k=document.body.getAttribute('data-theme')||'';
  return _surfaceOf[k]||(_surfaceOf[k]=getComputedStyle(document.body).getPropertyValue('--surface2').trim());
}
function applyAccent(hex){
  const s=document.body.style;
  if(!hex){ACCENT_VARS.forEach(v=>s.removeProperty(v));return;}
  const surface=themeSurface();
  const vars=accentVars(hex,surface);
  console.assert(contrast(vars['--accent-fg'],surface)>=4.5&&contrast(vars['--btn-primary-bg'],vars['--btn-primary-text'])>=4.5,'accent contrast below 4.5:1',hex);
  Object.entries(vars).forEach(([k,v])=>s.setProperty(k,v));
}

// ── SETTINGS POPOVER ──
function renderThemePickers(){
  const ar=document.getElementById('accent-row');
  if(ar){
    ar.innerHTML=ACCENTS.map(([id,name,light])=>
      `<button type="button" class="accent-dot" role="radio" aria-checked="false" data-accent="${id}" style="--dot:${light}" title="${name}" aria-label="${name}" onclick="setAccent('${id}')"></button>`).join('')
      +'<span class="accent-dot accent-custom" data-accent="custom" title="กำหนดเอง"><input type="color" id="accent-custom-input" aria-label="สีเน้นกำหนดเอง"></span>';
    const ci=document.getElementById('accent-custom-input');
    // live while dragging: the picker fires several inputs per frame, so only the accent changes,
    // once per frame; saving and the full theme pass wait for the picker to close
    let raf=0;
    ci.addEventListener('input',()=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        raf=0;
        const fromPreset=theme.id!=='mac';
        theme.id='mac';theme.accent=ci.value.toLowerCase();
        if(fromPreset)applyTheme();else{applyAccent(theme.accent);syncSettingsUI();}
      });
    });
    ci.addEventListener('change',()=>{theme.id='mac';theme.accent=ci.value.toLowerCase();saveTheme();applyTheme();});
  }
  const pr=document.getElementById('preset-row');
  if(pr)pr.innerHTML=PRESETS.map(([id,name,sw])=>
    `<button type="button" class="preset-opt" role="radio" aria-checked="false" data-preset="${id}" onclick="setPreset('${id}')"><span class="preset-swatch" style="background:${sw}"></span>${name}</button>`).join('');
}
function syncSettingsUI(){
  const mac=theme.id==='mac',named=ACCENTS.find(a=>a[0]===theme.accent);
  document.querySelectorAll('.appearance-opt').forEach(b=>b.setAttribute('aria-checked',String(mac&&b.dataset.appearance===theme.appearance)));
  document.querySelectorAll('.accent-dot').forEach(b=>{
    const on=mac&&(named?b.dataset.accent===theme.accent:b.dataset.accent==='custom');
    b.classList.toggle('on',on);
    if(b.getAttribute('role')==='radio')b.setAttribute('aria-checked',String(on));
  });
  const ci=document.getElementById('accent-custom-input');
  if(ci&&!named)ci.value=theme.accent;
  const hint=document.getElementById('accent-hint');
  if(hint)hint.textContent=!mac?'ใช้ไม่ได้กับธีมพิเศษ เลือก สว่าง / มืด / อัตโนมัติ ด้านบนก่อน':named?named[1]:'กำหนดเอง '+theme.accent.toUpperCase();
  document.querySelectorAll('.preset-opt').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.preset===theme.id)));
  document.getElementById('fx-switch')?.setAttribute('aria-checked',String(clickFx));
  document.getElementById('remember-switch')?.setAttribute('aria-checked',String(rememberInputs));
  setSegmented('font-size-opt',textPref.size);
  setSegmented('font-family-opt',textPref.font);
  const fh=document.getElementById('font-hint');if(fh)fh.textContent=FONTS[textPref.font][2];
}

// ── POPOVERS ──
function setPopover(pop,open){
  pop.classList.toggle('open',open);
  document.querySelector(`[aria-controls="${pop.id}"]`)?.setAttribute('aria-expanded',String(open));
}
function togglePop(id){
  const pop=document.getElementById(id);
  if(!pop)return;
  const open=!pop.classList.contains('open');
  document.querySelectorAll('.popover.open').forEach(p=>setPopover(p,false));
  setPopover(pop,open);
}
document.addEventListener('click',e=>{
  document.querySelectorAll('.popover.open').forEach(p=>{if(!p.parentElement.contains(e.target))setPopover(p,false);});
});

// ── SIDEBAR MOBILE ──
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}
// phones: the sidebar is a bottom sheet; dragging its header down past 80px closes it
(function(){
  const sb=document.getElementById('sidebar'),hd=sb&&sb.querySelector('.sidebar-header');
  if(!hd)return;
  let y0=null;
  hd.addEventListener('touchstart',e=>{if(sb.classList.contains('open')){y0=e.touches[0].clientY;sb.classList.add('dragging');}},{passive:true});
  hd.addEventListener('touchmove',e=>{if(y0!==null)sb.style.transform=`translateY(${Math.max(0,e.touches[0].clientY-y0)}px)`;},{passive:true});
  hd.addEventListener('touchend',e=>{
    if(y0===null)return;
    const dy=e.changedTouches[0].clientY-y0;
    y0=null;sb.classList.remove('dragging');sb.style.transform='';
    if(dy>80)closeSidebar();
  });
})();

// ── FAVORITES STORE (persistence impl — swappable) ──
// Interface: load() -> Promise<string[]>, save(ids: string[]) -> Promise<void>
// วันหลังถ้าจะเก็บบน backend ก็เขียน impl ใหม่ที่มี 2 เมธอดนี้ แล้วเรียก
// setFavoritesStore(ApiFavoritesStore) ก่อน initFavorites() — ตัว feature ไม่ต้องแก้
const STORAGE_FAV='esan-devtools-favorites';

const LocalStorageFavoritesStore={
  name:'localStorage',
  load(){
    try{
      const raw=localStorage.getItem(STORAGE_FAV);
      const ids=raw?JSON.parse(raw):[];
      return Promise.resolve(Array.isArray(ids)?ids:[]);
    }catch(e){return Promise.resolve([]);}
  },
  save(ids){
    try{localStorage.setItem(STORAGE_FAV,JSON.stringify(ids));}catch(e){}
    return Promise.resolve();
  },
};

// ตัวอย่าง impl สำหรับ REST API (ยังไม่ได้ใช้ — เก็บไว้เป็นแบบ)
// const ApiFavoritesStore={
//   name:'api',
//   base:'/api/favorites',
//   load(){return fetch(this.base).then(r=>r.ok?r.json():[]).catch(()=>[]);},
//   save(ids){return fetch(this.base,{method:'PUT',headers:{'Content-Type':'application/json'},
//     body:JSON.stringify(ids)}).then(()=>{}).catch(()=>{});},
// };

let favoritesStore=LocalStorageFavoritesStore;
function setFavoritesStore(store){favoritesStore=store;}

// ── FAVORITES ──
let favorites=[];
function saveFavorites(){favoritesStore.save(favorites.slice()).catch(()=>{});}
function isFavorite(id){return favorites.includes(id);}
function navLabelOf(el){
  const lbl=el.querySelector('.nav-label');
  return (lbl?lbl.textContent:el.textContent).trim();
}
function srcNavItem(id){return document.querySelector(`#sidebar-nav .nav-item[data-tab="${id}"]:not(.nav-fav-item)`);}
function makeFavStar(id){
  const star=document.createElement('span');
  star.className='nav-fav-star'+(isFavorite(id)?' on':'');
  star.dataset.favFor=id;
  star.innerHTML=ic('star');
  star.title=isFavorite(id)?'เอาออกจากรายการโปรด':'เพิ่มเข้ารายการโปรด';
  star.onclick=e=>toggleFavorite(e,id);
  return star;
}
function toggleFavorite(evt,id){
  if(evt){evt.stopPropagation();evt.preventDefault();}
  const i=favorites.indexOf(id);
  if(i>=0)favorites.splice(i,1);else favorites.push(id);
  saveFavorites();
  renderFavorites();
  syncFavStars();
  const q=document.getElementById('nav-search');
  if(q&&q.value.trim())filterNav(q.value);
  showToast(i>=0?'เอาออกจากรายการโปรดแล้ว':'เพิ่มเข้ารายการโปรดแล้ว');
}
function clearFavorites(){
  if(!favorites.length)return;
  favorites=[];
  saveFavorites();
  renderFavorites();
  syncFavStars();
  showToast('ล้างรายการโปรดแล้ว');
}
function syncFavStars(){
  document.querySelectorAll('.nav-fav-star').forEach(s=>{
    const fav=isFavorite(s.dataset.favFor);
    s.classList.toggle('on',fav);
    s.title=fav?'เอาออกจากรายการโปรด':'เพิ่มเข้ารายการโปรด';
  });
  const tf=document.getElementById('topbar-fav');
  if(tf){
    const fav=isFavorite(activeTabId),label=fav?'เอาออกจากรายการโปรด':'เพิ่มเข้ารายการโปรด';
    tf.hidden=!srcNavItem(activeTabId)?.closest('.nav-group'); // tools only, not the home page
    tf.classList.toggle('on',fav);
    tf.setAttribute('aria-pressed',String(fav));
    tf.setAttribute('aria-label',label);
    tf.title=label;
  }
}
function renderFavorites(){
  const section=document.getElementById('nav-fav-section');
  const list=document.getElementById('nav-fav-list');
  if(!section||!list)return;
  // drop ids whose tool no longer exists (renamed/removed tabs)
  const valid=favorites.filter(id=>srcNavItem(id));
  if(valid.length!==favorites.length){favorites=valid;saveFavorites();}
  list.innerHTML='';
  section.style.display=favorites.length?'':'none';
  favorites.forEach(id=>{
    const src=srcNavItem(id);
    const icon=src.querySelector('.nav-icon');
    const item=document.createElement('div');
    item.className='nav-item nav-fav-item'+(id===activeTabId?' active':'');
    item.dataset.tab=id;
    item.onclick=e=>openTab(e,id);
    // clone the icon node so SVG icons survive too (textContent would drop them)
    item.appendChild(icon?icon.cloneNode(true):Object.assign(document.createElement('span'),{className:'nav-icon',innerHTML:ic('wrench')}));
    const lbl=document.createElement('span');lbl.className='nav-label';lbl.textContent=navLabelOf(src);item.appendChild(lbl);
    item.appendChild(makeFavStar(id));
    makeNavItemFocusable(item);
    list.appendChild(item);
  });
  if(activeTabId==='home-tab')homeRender();
}
function makeNavItemFocusable(item){
  item.setAttribute('role','button');
  item.setAttribute('tabindex','0');
  if(item.classList.contains('active'))item.setAttribute('aria-current','page');else item.removeAttribute('aria-current');
}
function injectFavStars(){
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item=>{
    const id=item.dataset.tab;
    if(!id||item.classList.contains('nav-fav-item')||'noFav' in item.dataset)return;
    // wrap the label text so the star can sit flush right
    if(!item.querySelector('.nav-label')){
      const icon=item.querySelector('.nav-icon');
      // เอาเฉพาะ text ที่ไม่ใช่ตัว icon ไม่งั้น label จะติด emoji มาด้วย → icon ซ้ำ 2 อัน
      const text=Array.from(item.childNodes).filter(n=>n!==icon).map(n=>n.textContent).join('').trim();
      item.innerHTML='';
      if(icon)item.appendChild(icon);
      const span=document.createElement('span');
      span.className='nav-label';
      span.textContent=text;
      item.appendChild(span);
    }
    item.appendChild(makeFavStar(id));
    makeNavItemFocusable(item);
  });
}
function isActivateKey(e){return e.key==='Enter'||e.key===' '||e.key==='Spacebar';}
// Enter/Space activates a focused .nav-item (static + favorites) or copies a focused mock value
document.addEventListener('keydown',e=>{
  if(!isActivateKey(e)||!e.target.closest)return;
  const item=e.target.closest('.nav-item, .mock-field-value[id]');
  if(!item)return;
  e.preventDefault();
  item.click();
});
function initFavorites(){
  injectFavStars();
  return favoritesStore.load().then(ids=>{
    favorites=Array.isArray(ids)?ids:[];
    renderFavorites();
    syncFavStars();
    const q=document.getElementById('nav-search');
    if(q&&q.value.trim())filterNav(q.value); // ให้รายการโปรดโดน filter ด้วยถ้ามีคำค้นค้างอยู่
  }).catch(()=>{});
}

// ── NAV FILTER ──
const STORAGE_NAVSEARCH='esan-devtools-navsearch';
function filterNav(q){
  const query=q.toLowerCase().trim();
  document.getElementById('sidebar-nav')?.classList.toggle('searching',!!query);
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item=>{
    item.style.display=!query||navLabelOf(item).toLowerCase().includes(query)?'':'none';
  });
  // hide groups whose items are all filtered out
  document.querySelectorAll('#sidebar-nav .nav-group').forEach(g=>{
    g.style.display=Array.from(g.querySelectorAll('.nav-item')).some(i=>i.style.display!=='none')?'':'none';
  });
  const favSec=document.getElementById('nav-fav-section');
  if(favSec){
    const anyFav=Array.from(document.querySelectorAll('#nav-fav-list .nav-item')).some(i=>i.style.display!=='none');
    favSec.style.display=favorites.length&&anyFav?'':'none';
  }
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

// ── NAV GROUPS (collapsible) ──
const STORAGE_NAVCOLLAPSED='esan-devtools-nav-collapsed';
function setNavGroup(g,collapsed){
  g.classList.toggle('collapsed',collapsed);
  g.querySelector('.nav-section-label')?.setAttribute('aria-expanded',String(!collapsed));
}
function toggleNavGroup(btn){
  const g=btn.closest('.nav-group');
  setNavGroup(g,!g.classList.contains('collapsed'));
  try{localStorage.setItem(STORAGE_NAVCOLLAPSED,JSON.stringify(Array.from(document.querySelectorAll('.nav-group.collapsed')).map(x=>x.dataset.group)));}catch(e){}
}
function restoreNavGroups(){
  let ids=[];
  try{ids=JSON.parse(localStorage.getItem(STORAGE_NAVCOLLAPSED)||'[]');}catch(e){}
  if(!Array.isArray(ids))return;
  document.querySelectorAll('.nav-group').forEach(g=>setNavGroup(g,ids.includes(g.dataset.group)));
}

// ── RECENT TOOLS (home page) ──
const STORAGE_RECENT='esan-devtools-recent';
function recentTabs(){
  try{const ids=JSON.parse(localStorage.getItem(STORAGE_RECENT)||'[]');return Array.isArray(ids)?ids.filter(id=>srcNavItem(id)):[];}catch(e){return[];}
}
function pushRecent(id){
  if(!rememberInputs)return; // the Settings switch covers history too
  try{localStorage.setItem(STORAGE_RECENT,JSON.stringify([id,...recentTabs().filter(x=>x!==id)].slice(0,8)));}catch(e){}
}

// ── NAV ──
let activeTabId='home-tab';
// Heavy per-tab setup (mostly highlight.js, ~360ms cold) runs on the tab's first open, not at page load.
// Arrow wrappers: the init functions live in tools/*.js, which load after this file
const TAB_INIT={
  'rxjs-tab':()=>{initRxjs();loadLib('rxjs');},
  'angular-tab':()=>loadLib('hljs').then(()=>{initAngular();highlightCode('#angular-tab pre.rxjs-code code');}),
  'compare-tab':()=>loadLib('diff'),
  'mq-tab':()=>highlightCode('#mq-tab pre.mq-code code'),
  'storage-tab':()=>{storIdbRender();storXssRender();storDtInit();storLocalRefresh();storInitHljs();},
  'cron-tab':()=>cronInit(),
  'http-tab':()=>initHttp(),
  'kubectl-tab':()=>renderCmdList(KUBECTL_CMDS,'kubectl-list',''),
  'linux-tab':()=>renderCmdList(LINUX_CMDS,'linux-list',''),
  'git-tab':()=>{dgInit('git',GIT_DIAGRAMS);renderCmdList(GIT_CMDS,'git-list','');},
  'lov-tab':()=>lovInit(),
  'sqlref-tab':()=>refInit('sqlref'),
  'db2err-tab':()=>refInit('db2err'),
  'javaex-tab':()=>refInit('javaex'),
  'javaint-tab':()=>refInit('javaint'),
  'k8sref-tab':()=>{yxInit('k8s-explorer',K8S_MANIFESTS,'deploy');refInit('k8s');},
  'gateway-tab':()=>{flowInit('gw-flow',GW_NODES,'kong',{label:'เส้นทางของ request',errLabel:'อาการที่เจอบ่อยที่ชั้นนี้'});refInit('gateway');},
  'jenkins-tab':()=>{flowInit('jk-flow',JK_FLOW,'ci',{label:'ขั้นของ CI/CD',errLabel:'พังบ่อยที่ขั้นนี้',lang:'groovy'});yxInit('jk-explorer',JK_FILES,'ci');refInit('jenkins');},
  'ngrx-tab':()=>{ngrxInit();refInit('ngrx');},
  'clicheat-tab':()=>cliInit(),
  'thai-tab':()=>thaiInit(),
  'unix-tab':()=>unixQuickRender(),
  'base64-tab':()=>setSegmented('b64-mode',_b64Mode),
  'url-tab':()=>setSegmented('url-dir',_urlMode),
  'props-tab':()=>pySetDir(recallOpt('py-dir','p2y')),
  'changelog-tab':()=>clRender(),
};
function openTab(evt,id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current');});
  const tabEl=document.getElementById(id);
  tabEl.classList.add('active');
  // heavy tabs ship as <template>: they become DOM on first open, which keeps the start-up DOM small
  const lazy=tabEl.querySelector(':scope > template.tab-lazy');
  if(lazy)tabEl.replaceChildren(lazy.content.cloneNode(true));
  // the biggest ones are not even in index.html: assets/tabs/<id>.html is fetched on first open
  const remote=tabEl.dataset.src&&!_tabLoads[id];
  if(remote)_tabLoads[id]=loadTabHtml(tabEl,id);
  // mark ทุก nav item ที่ชี้ tab นี้ (ตัวใน section ปกติ + ตัวใน รายการโปรด)
  document.querySelectorAll(`.nav-item[data-tab="${id}"]`).forEach(b=>{b.classList.add('active');b.setAttribute('aria-current','page');});
  activeTabId=id;
  // opening a tool (palette, favorites) inside a collapsed group expands that group
  const grp=srcNavItem(id)?.closest('.nav-group.collapsed');
  if(grp)toggleNavGroup(grp.querySelector('.nav-section-label'));
  if(!remote&&!_tabLoads[id])tabReady(tabEl,id,lazy); // a fetched tab does this once its markup has arrived
  setTopbar(id);
  try{localStorage.setItem(STORAGE_TAB,id);}catch(e){}
  if(id==='home-tab')homeRender();else pushRecent(id);
  closeSidebar();
}
// toolbar heading: the tool's sidebar icon and group, its title and line, and a favorite star
function setTopbar(id){
  const meta=TAB_META[id]||{title:'',sub:''},nav=srcNavItem(id);
  const group=nav?.closest('.nav-group')?.querySelector('.nav-section-label')?.textContent.trim();
  document.getElementById('topbar-title').textContent=meta.title;
  document.getElementById('topbar-sub').textContent=meta.sub;
  document.getElementById('topbar-icon').innerHTML=nav?.querySelector('.nav-icon')?.innerHTML||'';
  const g=document.getElementById('topbar-group');
  g.hidden=!group;
  g.innerHTML=group?escHtml(group)+ic('chevron-right'):'';
  syncFavStars();
}
const _tabLoads={};
// per-tab setup, once its markup is in the page: TAB_INIT, then the remembered inputs and history of its fields
function tabReady(tabEl,id,fresh){
  const init=TAB_INIT[id];
  if(init){delete TAB_INIT[id];init();}
  if(fresh){initRememberedInputs(tabEl);initHistory(tabEl);} // its fields did not exist when the page set up the others
}
async function loadTabHtml(tabEl,id){
  tabEl.innerHTML=`<div class="tab-loading" role="status">${ic('hourglass')} กำลังโหลด</div>`;
  try{
    const res=await fetch(tabEl.dataset.src);
    if(!res.ok)throw new Error(res.status);
    tabEl.innerHTML=await res.text(); // our own same-origin markup
    tabReady(tabEl,id,true);
  }catch(e){
    delete _tabLoads[id]; // the next open tries again
    tabEl.innerHTML=`<div class="card tab-fail" role="alert"><div class="card-title">${ic('triangle-alert')} โหลดหน้านี้ไม่ได้</div>`
      +`<p>ถ้าเปิด index.html ตรงจากไฟล์ในเครื่อง ให้เปิดผ่าน web server แทน เช่น <code>python -m http.server</code> หรือ VS Code Live Server · ถ้าเปิดผ่านเว็บอยู่แล้ว ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง</p>`
      +`<button type="button" class="btn btn-ghost" onclick="openTab(null,'${id}')">${ic('refresh-cw')} ลองอีกครั้ง</button></div>`;
  }
}
// resolves once a tab's markup is in the page (right away for tabs that ship inside index.html)
function whenTab(id){return _tabLoads[id]||Promise.resolve();}
function restoreTab(){
  let saved='home-tab';
  try{saved=localStorage.getItem(STORAGE_TAB)||'home-tab';}catch(e){}
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
      case'base64-tab':b64Convert();break;
      case'cron-tab':parseCronManual();break;
      case'hash-tab':computeHash();break;
      case'jwt-tab':decodeJWT_UI();break;
      case'k8s-secret-tab':decodeK8sSecret();break;
      case'url-tab':urlConvert();break;
      case'regex-tab':runRegex();break;
      case'numbase-tab':numBaseConvert('dec',document.getElementById('nb-dec')?.value||'');break;
      case'lov-tab':if(_lovEdit)lovSaveEditor();break;
      case'stacktrace-tab':stAnalyze();break;
      case'json2type-tab':j2tConvert();break;
      case'props-tab':pyConvert();break;
      case'home-tab':spOpenFirst();break;
    }
  }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&activeTabId==='lov-tab'&&_lovEdit){
    e.preventDefault();
    lovSaveEditor();
  }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    if(document.getElementById('cmdk').hidden)openPalette();else closePalette();
  }
  if(e.key==='Escape'){
    if(!document.getElementById('cmdk').hidden){closePalette();return;}
    const open=document.querySelectorAll('.popover.open');
    if(open.length){open.forEach(p=>{setPopover(p,false);document.querySelector(`[aria-controls="${p.id}"]`)?.focus();});return;}
    closeSidebar();
  }
});

// ── COMMAND PALETTE (Ctrl/⌘+K) ──
const PALETTE_CMDS=[ // [label, sub, icon, run]
  ['ลักษณะ: สว่าง','การตั้งค่า','sun',()=>setAppearance('light')],
  ['ลักษณะ: มืด','การตั้งค่า','moon',()=>setAppearance('dark')],
  ['ลักษณะ: อัตโนมัติ','ตามการตั้งค่าเครื่อง','monitor',()=>setAppearance('auto')],
  ['เปิด/ปิดเอฟเฟกต์และแอนิเมชัน','การตั้งค่า','sparkles',()=>toggleClickFx()],
  ['หน้าแรก','วางข้อความแล้วเปิดเครื่องมือที่ใช่','house',()=>openTab(null,'home-tab')],
  ['ล้างข้อมูลที่จำไว้','ข้อความที่กรอกไว้และเครื่องมือล่าสุด','trash',()=>clearRemembered()],
  ['แชร์ลิงก์ของเครื่องมือนี้','คัดลอกลิงก์พร้อมข้อมูลที่กรอก (ไม่รวม token / secret)','link',()=>shareLink()],
];
const _cmdk={items:[],sel:0,ret:null,full:null}; // full: a multi-line paste (the input shows one line of it)
function paletteItems(q){
  const words=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const tools=Array.from(document.querySelectorAll('#sidebar-nav .nav-group .nav-item')).map(el=>{
    const id=el.dataset.tab,meta=TAB_META[id]||{},label=navLabelOf(el);
    return{group:'เครื่องมือ',id,label,title:meta.title,desc:meta.sub,sub:el.closest('.nav-group').querySelector('.nav-section-label').textContent.trim(),
      icon:el.querySelector('.nav-icon')?.innerHTML||'',hay:`${label} ${meta.title||''} ${meta.sub||''}`.toLowerCase(),run:()=>openTab(null,id)};
  });
  const cmds=PALETTE_CMDS.map(([label,sub,icon,run])=>({group:'คำสั่ง',label,sub,desc:sub,icon:ic(icon),hay:`${label} ${sub}`.toLowerCase(),run}));
  // a pasted value (JWT, timestamp, SQLCODE...) offers the tools that understand it
  const text=(_cmdk.full||q).trim();
  const smart=spDetect(text).map(d=>({group:'เปิดข้อความนี้ใน',label:d.tool,sub:d.label,desc:`ข้อความที่พิมพ์ดูเหมือน${d.label} จะเปิดใน ${d.tool} พร้อมกรอกให้`,icon:ic('sparkles'),run:()=>spOpen(d.kind,text)}));
  // label hits rank above subtitle-only hits; sort is stable, so nav order holds within a rank
  const rank=x=>{const l=x.label.toLowerCase();return words.every(w=>l.includes(w))?(l.startsWith(words[0]||'')?0:1):2;};
  const match=list=>list.filter(x=>words.every(w=>x.hay.includes(w))).sort((a,b)=>rank(a)-rank(b));
  if(_cmdk.full){
    // a pasted block is content, not a search: offer what understands it, or the home page for every option
    const full=_cmdk.full;
    return smart.concat({group:'คำสั่ง',label:'วางในหน้าแรก',sub:'ดูตัวเลือกทั้งหมดของข้อความนี้',desc:'เปิดหน้าแรกพร้อมข้อความที่วาง',icon:ic('house'),
      run:()=>{openTab(null,'home-tab');const el=document.getElementById('sp-input');el.value=full;spRender();el.focus();}});
  }
  return match(tools).concat(smart,match(cmds));
}
function renderPalette(){
  const list=document.getElementById('cmdk-list'),input=document.getElementById('cmdk-input');
  _cmdk.items=paletteItems(input.value);
  _cmdk.sel=Math.min(_cmdk.sel,Math.max(0,_cmdk.items.length-1));
  if(!_cmdk.items.length){
    list.innerHTML=`<div class="cmdk-empty">ไม่พบ "${escHtml(input.value)}" ลองคำอื่น เช่น json, jwt, cron</div>`;
    input.removeAttribute('aria-activedescendant');
    renderPalettePreview();
    return;
  }
  let html='',grp='';
  _cmdk.items.forEach((x,i)=>{
    if(x.group!==grp){grp=x.group;html+=`<div class="cmdk-group" role="presentation">${grp}</div>`;}
    html+=`<div class="cmdk-item" role="option" id="cmdk-opt-${i}" aria-selected="${i===_cmdk.sel}" data-i="${i}"><span class="cmdk-ic">${x.icon}</span><span class="cmdk-label">${escHtml(x.label)}</span><span class="cmdk-sub">${escHtml(x.sub)}</span></div>`;
  });
  list.innerHTML=html;
  input.setAttribute('aria-activedescendant','cmdk-opt-'+_cmdk.sel);
  renderPalettePreview();
}
// what the selected row opens, before opening it: the tool's description and whether it is a favorite / recent
function renderPalettePreview(){
  const el=document.getElementById('cmdk-preview'),x=_cmdk.items[_cmdk.sel];
  if(!el)return;
  if(!x){el.innerHTML='';return;}
  const tags=[];
  if(x.id&&isFavorite(x.id))tags.push(ic('star','i-fill')+'รายการโปรด');
  if(x.id&&recentTabs().includes(x.id))tags.push(ic('clock')+'ใช้ล่าสุด');
  el.innerHTML=`<span class="gw-ic">${x.icon}</span><span class="cmdk-pv-txt"><span class="cmdk-pv-t">${escHtml(x.title||x.label)}</span><span class="cmdk-pv-d">${escHtml(x.desc||'')}</span></span>`
    +(tags.length?`<span class="cmdk-pv-tags">${tags.map(t=>`<span>${t}</span>`).join('')}</span>`:'');
}
function movePaletteSel(d){
  if(!_cmdk.items.length)return;
  _cmdk.sel=(_cmdk.sel+d+_cmdk.items.length)%_cmdk.items.length;
  document.querySelectorAll('.cmdk-item').forEach(el=>el.setAttribute('aria-selected',String(+el.dataset.i===_cmdk.sel)));
  document.getElementById('cmdk-opt-'+_cmdk.sel)?.scrollIntoView({block:'nearest'});
  document.getElementById('cmdk-input').setAttribute('aria-activedescendant','cmdk-opt-'+_cmdk.sel);
  renderPalettePreview();
}
function openPalette(){
  const p=document.getElementById('cmdk');
  if(!p.hidden)return;
  _cmdk.ret=document.activeElement;_cmdk.sel=0;
  document.querySelectorAll('.popover.open').forEach(x=>setPopover(x,false));
  const input=document.getElementById('cmdk-input');
  input.value='';_cmdk.full=null;
  p.hidden=false;
  renderPalette();
  input.focus();
}
function closePalette(){
  const p=document.getElementById('cmdk');
  if(p.hidden)return;
  p.hidden=true;
  if(_cmdk.ret&&document.contains(_cmdk.ret))_cmdk.ret.focus();
}
function runPalette(i){const x=_cmdk.items[i];if(!x)return;closePalette();x.run();}
(function(){
  const input=document.getElementById('cmdk-input'),list=document.getElementById('cmdk-list');
  if(!input||!list)return;
  input.addEventListener('input',()=>{_cmdk.full=null;_cmdk.sel=0;renderPalette();});
  // an <input> drops newlines: keep a multi-line (or long) paste whole and show one line of it
  input.addEventListener('paste',e=>{
    const t=(e.clipboardData||window.clipboardData).getData('text');
    if(!/\n/.test(t.trim())&&t.length<=200)return;
    e.preventDefault();
    _cmdk.full=t;
    input.value=t.replace(/\s+/g,' ').trim().slice(0,120);
    _cmdk.sel=0;renderPalette();
  });
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();movePaletteSel(1);}
    else if(e.key==='ArrowUp'){e.preventDefault();movePaletteSel(-1);}
    else if(e.key==='Enter'){e.preventDefault();runPalette(_cmdk.sel);}
    else if(e.key==='Tab')e.preventDefault(); // the input is the dialog's only stop
  });
  list.addEventListener('click',e=>{const it=e.target.closest('.cmdk-item');if(it)runPalette(+it.dataset.i);});
  list.addEventListener('mousemove',e=>{const it=e.target.closest('.cmdk-item');if(it&&+it.dataset.i!==_cmdk.sel){_cmdk.sel=+it.dataset.i;movePaletteSel(0);}});
  // show ⌘ instead of Ctrl on Apple keyboards
  if(/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent)){
    document.querySelectorAll('.cmdk-key').forEach(k=>k.textContent='⌘K');
    document.querySelectorAll('.cmdk-mod').forEach(k=>k.textContent='⌘');
  }
})();

// ── UTILS ──
function scrollToTop(){document.querySelector('.content-area')?.scrollTo({top:0,behavior:'smooth'});}
const TOAST_IC={ok:'circle-check',warn:'triangle-alert',err:'circle-x',info:'info'};
let _toastTimer=0;
// kind: 'ok' (default) | 'warn' | 'err' | 'info' — picks the icon and its colour
function showToast(msg,kind){
  const t=document.getElementById('toast');
  kind=TOAST_IC[kind]?kind:'ok';
  t.className='toast show'+(kind==='ok'?'':' '+kind);
  t.querySelector('use').setAttribute('href','#i-'+TOAST_IC[kind]);
  t.querySelector('.toast-msg').textContent=msg||'คัดลอกแล้ว';
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove('show'),2000);
}
// ── COPY ── every copy goes through copyText: the clicked control turns into "คัดลอกแล้ว" for a moment
// and the toast shows what landed on the clipboard, so a click is never silent
let _copySrc=null;
document.addEventListener('click',e=>{
  _copySrc=e.target.closest?e.target.closest('button,[role="button"],.mock-field-value,.cmd-card'):null;
  setTimeout(()=>{_copySrc=null;}); // only this click's own handler may use it
},true);
function copyText(txt,msg,from){
  const src=from||_copySrc; // `from`: the control, when the copy runs after an await
  const done=ok=>{
    if(!ok){showToast('คัดลอกไม่ได้ ลองเลือกข้อความแล้วกด Ctrl+C','err');return;}
    flashCopied(src);
    const one=String(txt).replace(/\s+/g,' ').trim();
    showToast(msg||(one?'คัดลอกแล้ว: '+(one.length>40?one.slice(0,40)+'…':one):'คัดลอกแล้ว'));
  };
  const fallback=()=>{
    const ta=document.createElement('textarea');
    ta.value=txt;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);ta.select();
    let ok=false;try{ok=document.execCommand('copy');}catch(e){}
    ta.remove();done(ok);
  };
  try{navigator.clipboard.writeText(txt).then(()=>done(true),fallback);}catch(e){fallback();}
}
function flashCopied(el){
  if(!el||!document.contains(el))return;
  clearTimeout(el._copiedT);
  if(!el.classList.contains('is-copied')){
    el.classList.add('is-copied');
    // a short copy button swaps its label; a value or card that copies itself only lights up
    if(el.tagName==='BUTTON'&&el.textContent.trim().length<=24){
      el._copiedHtml=el.innerHTML;
      el.innerHTML=ic('check')+(el.textContent.trim()?'คัดลอกแล้ว':'');
    }
  }
  el._copiedT=setTimeout(()=>{
    el.classList.remove('is-copied');
    if(el._copiedHtml!=null){el.innerHTML=el._copiedHtml;el._copiedHtml=null;}
  },1600);
}
function copyVal(id){const el=document.getElementById(id);if(el&&el.textContent&&el.textContent)copyText(el.textContent);}
// คลิก/Enter/Space บนตัวค่าเอง (ไม่ใช่แค่ปุ่ม Copy) ก็ copy ได้
document.querySelectorAll('.mock-field-value[id]').forEach(el=>{
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.setAttribute('aria-describedby','copy-hint');
});
// tooltip "คลิกเพื่อ copy" แบบ custom (title ของ browser เล็กและปรับขนาดไม่ได้)
const copyTip=document.createElement('div');
copyTip.className='copy-tip';copyTip.innerHTML=ic('copy')+' คลิกเพื่อคัดลอก';copyTip.setAttribute('aria-hidden','true');
document.body.appendChild(copyTip);
function showCopyTip(el){
  const r=el.getBoundingClientRect();
  copyTip.classList.add('show');
  const tw=copyTip.offsetWidth,th=copyTip.offsetHeight;
  const left=Math.max(8,Math.min(r.left+r.width/2-tw/2,window.innerWidth-tw-8));
  const top=r.top-th-8<8?r.bottom+8:r.top-th-8;
  copyTip.style.left=left+'px';copyTip.style.top=top+'px';
}
function hideCopyTip(){copyTip.classList.remove('show');}
document.addEventListener('mouseover',e=>{const v=e.target.closest&&e.target.closest('.mock-field-value[id]');if(v)showCopyTip(v);});
document.addEventListener('mouseout',e=>{const v=e.target.closest&&e.target.closest('.mock-field-value[id]');if(v&&!v.contains(e.relatedTarget))hideCopyTip();});
document.addEventListener('focusin',e=>{const v=e.target.closest&&e.target.closest('.mock-field-value[id]');if(v)showCopyTip(v);else hideCopyTip();});
document.addEventListener('focusout',hideCopyTip);
document.querySelector('.content-area')?.addEventListener('scroll',hideCopyTip,{passive:true});
document.addEventListener('click',e=>{
  const val=e.target.closest && e.target.closest('.mock-field-value[id]');
  if(val)copyVal(val.id);
});
function copyElText(id){const el=document.getElementById(id);if(el)copyText(el.value!==undefined?el.value:el.textContent);}
function copyArea(id){const el=document.getElementById(id);if(el)copyText(el.value||el.textContent);}
// ── LAZY CDN LIBS ── fetched on a tool's first use, so the first visit only downloads the app itself
const CDN='https://cdnjs.cloudflare.com/ajax/libs/';
const LIBS={ // the first file is the core; the rest need it and load after it in parallel
  hljs:['highlight.js/11.9.0/highlight.min.js',...['typescript','java','properties','sql','nginx','dockerfile','groovy'].map(l=>`highlight.js/11.9.0/languages/${l}.min.js`)],
  diff:['jsdiff/5.1.0/diff.min.js'],
  jsqr:['https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'], // not on cdnjs
  zxing:['https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'], // barcodes; not on cdnjs
  rxjs:['rxjs/7.8.1/rxjs.umd.min.js'],
  codemirror:['codemirror/5.65.16/codemirror.min.js','codemirror/5.65.16/codemirror.min.css','codemirror/5.65.16/theme/dracula.min.css',
    'codemirror/5.65.16/mode/javascript/javascript.min.js','codemirror/5.65.16/addon/edit/closebrackets.min.js',
    'codemirror/5.65.16/addon/edit/matchbrackets.min.js','codemirror/5.65.16/addon/comment/comment.min.js'],
};
const _libs={};
function loadAsset(path){
  return new Promise(done=>{
    const css=path.endsWith('.css'),el=document.createElement(css?'link':'script');
    el.onload=el.onerror=()=>done(); // a failed load leaves the tool on its plain-text fallback
    const url=libUrl(path);
    el.crossOrigin='anonymous'; // a CORS response is what the service worker keeps for offline use
    if(!css){el.src=url;document.head.appendChild(el);return;}
    el.rel='stylesheet';el.href=url;
    // before style.css, so the app's own overrides still win
    document.head.insertBefore(el,document.querySelector('link[href$="style.css"]'));
  });
}
const libUrl=path=>/^https:/.test(path)?path:CDN+path;
// once the page is idle, the service worker fetches every library so all tools work offline
function precacheLibs(){
  navigator.serviceWorker?.ready.then(reg=>reg.active&&reg.active.postMessage({type:'precache-cdn',urls:Object.values(LIBS).flat().map(libUrl)})).catch(()=>{});
}
function loadLib(name){
  const files=LIBS[name];
  return _libs[name]||(_libs[name]=loadAsset(files[0]).then(()=>Promise.all(files.slice(1).map(loadAsset))));
}
function debounced(fn,ms=250){let t=0;return()=>{clearTimeout(t);t=setTimeout(fn,ms);};}

// highlight.js marks what it has done with data-highlighted, so this is safe to call repeatedly
function highlightCode(sel){
  if(!window.hljs){loadLib('hljs').then(()=>{if(window.hljs)highlightCode(sel);});return;}
  document.querySelectorAll(sel).forEach(el=>{if(!el.dataset.highlighted)window.hljs.highlightElement(el);});
}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function highlightText(text,query){if(!query)return escHtml(text);const re=new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');return escHtml(text).replace(re,'<span class="cmd-highlight">$1</span>');}

// ── PWA ──
let _pwaPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();_pwaPrompt=e;
  setTimeout(()=>{if(_pwaPrompt)document.getElementById('pwa-banner').classList.add('show');},5000);
});
window.addEventListener('appinstalled',()=>{
  document.getElementById('pwa-banner').classList.remove('show');showToast('ติดตั้ง App สำเร็จ');_pwaPrompt=null;
});
function pwsInstall(){
  if(!_pwaPrompt){showToast('เปิดใน Chrome/Edge แล้วลองใหม่');return;}
  _pwaPrompt.prompt();_pwaPrompt.userChoice.then(()=>{_pwaPrompt=null;document.getElementById('pwa-banner').classList.remove('show');});
}

// ── FIELD MENU ── a short list under a field-head button (send to another tool, input history)
let _fmenu=null;
function closeFieldMenu(refocus){
  if(!_fmenu)return;
  const{el,btn}=_fmenu;_fmenu=null;
  el.remove();btn.setAttribute('aria-expanded','false');
  if(refocus)btn.focus();
}
function fieldMenu(btn,items,empty){
  const again=_fmenu&&_fmenu.btn===btn;
  closeFieldMenu(false);
  if(again)return; // second click on the same button closes it
  const el=document.createElement('div');
  el.className='field-menu';el.setAttribute('role','group');el.setAttribute('aria-label',btn.textContent.trim());
  el.innerHTML=items.length?items.map((it,i)=>`<button type="button" class="field-menu-item" data-i="${i}">${it.html}</button>`).join('')
    :`<div class="field-menu-empty">${escHtml(empty)}</div>`;
  el.addEventListener('click',e=>{const b=e.target.closest('.field-menu-item');if(!b)return;const it=items[+b.dataset.i];closeFieldMenu(false);it.run();});
  el.addEventListener('keydown',e=>{
    const bs=Array.from(el.querySelectorAll('.field-menu-item')),i=bs.indexOf(document.activeElement);
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeFieldMenu(true);}
    else if(e.key==='ArrowDown'&&bs.length){e.preventDefault();bs[(i+1)%bs.length].focus();}
    else if(e.key==='ArrowUp'&&bs.length){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus();}
  });
  btn.closest('.field-head').appendChild(el);
  btn.setAttribute('aria-expanded','true');
  _fmenu={el,btn};
  (el.querySelector('.field-menu-item')||btn).focus();
}
document.addEventListener('click',e=>{if(_fmenu&&!_fmenu.el.contains(e.target)&&!_fmenu.btn.contains(e.target))closeFieldMenu(false);},true);

// ── SEND TO ── hand an output to the next tool (Base64 → JSON → Type …); smart paste picks the targets
function sendText(btn,text,skip){
  text=String(text||'').trim();
  if(!text){showToast('ยังไม่มีผลลัพธ์ให้ส่งต่อ','info');return;}
  const hits=spDetect(text).filter(d=>!(skip||[]).includes(d.kind));
  fieldMenu(btn,hits.map(d=>({html:`${ic('arrow-right')}<span>${escHtml(d.tool)}</span><span class="field-menu-sub">${escHtml(d.label)}</span>`,
    run:()=>{spOpen(d.kind,text);showToast('ส่งไป '+d.tool+' แล้ว','info');}})),'ไม่รู้ว่าผลลัพธ์นี้ควรไปเครื่องมือไหน ลองคัดลอกไปวางที่หน้าแรก');
}
function sendTo(btn,id,skip){
  const el=document.getElementById(id);
  sendText(btn,el?(/^(TEXTAREA|INPUT)$/.test(el.tagName)?el.value:el.textContent):'',skip);
}

// ── INPUT HISTORY ── the last 5 distinct values of each main input (one with a field-head label), saved on change
const STORAGE_HIST='esan-devtools-hist:'; // + element id
const HIST_MAX=5,HIST_ITEM_MAX=20000;
function histGet(id){try{const v=JSON.parse(localStorage.getItem(STORAGE_HIST+id)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch(e){return[];}}
function histPush(el){
  if(!rememberInputs||!el||INPUT_NEVER.includes(el.id))return;
  const v=el.value.trim();
  if(!v||v.length>HIST_ITEM_MAX)return;
  try{localStorage.setItem(STORAGE_HIST+el.id,JSON.stringify([v,...histGet(el.id).filter(x=>x!==v)].slice(0,HIST_MAX)));}catch(e){}
}
function histOpen(btn,id){
  const el=document.getElementById(id);
  fieldMenu(btn,histGet(id).map(v=>({html:`${ic('clock')}<span class="field-menu-mono">${escHtml(v.replace(/\s+/g,' ').slice(0,80))}</span>`,
    run:()=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();}})),'ยังไม่มีประวัติ ค่าที่กรอกจะถูกเก็บไว้ที่นี่ 5 ค่าล่าสุด');
}
// adds the "ประวัติ" button to every main input under root
function initHistory(root){
  (root||document).querySelectorAll('.field-head > label.field-label[for], .field-head .field-head-l > label.field-label[for]').forEach(lab=>{
    const el=document.getElementById(lab.htmlFor),head=lab.closest('.field-head');
    if(!el||el.readOnly||head.querySelector('.hist-btn')||INPUT_NEVER.includes(el.id)||!(el.tagName==='TEXTAREA'||el.type==='text'||el.type==='number'))return;
    let acts=head.querySelector('.field-acts');
    if(!acts){acts=document.createElement('span');acts.className='field-acts';head.appendChild(acts);}
    acts.insertAdjacentHTML('afterbegin',`<button type="button" class="field-act hist-btn" aria-haspopup="true" aria-expanded="false" onclick="histOpen(this,'${el.id}')">${ic('clock')}ประวัติ</button>`);
    el.addEventListener('change',()=>histPush(el));
  });
}

// ── EFFECTS ── one Settings switch for the click sparkle, the logo animation and UI transitions. On by default.
const STORAGE_CLICKFX='esan-devtools-clickfx'; // '0' = off, anything else = on
let clickFx=true;
try{clickFx=localStorage.getItem(STORAGE_CLICKFX)!=='0';}catch(e){}
function applyFx(){document.body.classList.toggle('fx-off',!clickFx);}
applyFx();
function toggleClickFx(){
  clickFx=!clickFx;
  try{localStorage.setItem(STORAGE_CLICKFX,clickFx?'1':'0');}catch(e){}
  applyFx();
  syncSettingsUI();
  showToast(clickFx?'เปิดเอฟเฟกต์และแอนิเมชันแล้ว':'ปิดเอฟเฟกต์และแอนิเมชันแล้ว','info');
}

// ── TEXT ── Settings text size and font. The size scales the root, so everything sized in rem follows it.
const STORAGE_FONTSIZE='esan-devtools-fontsize', STORAGE_FONT='esan-devtools-font';
const FONT_SIZES={sm:'87.5%',md:'',lg:'112.5%',xl:'125%'};
const FONTS={ // id: [--sans override ('' = the stylesheet's), Google Fonts stylesheet loaded on first use, hint]
  system:['',null,'ตัวอักษรของระบบ ภาษาไทยใช้ IBM Plex Sans Thai'],
  plex:["'IBM Plex Sans Thai', system-ui, sans-serif",null,'IBM Plex Sans Thai ทั้งไทยและอังกฤษ'],
  noto:["Inter, 'Noto Sans Thai', system-ui, sans-serif",'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap','Inter สำหรับอังกฤษและตัวเลข, Noto Sans Thai สำหรับไทย โหลดจาก Google Fonts ครั้งแรกที่เลือก'],
};
const textPref={size:'md',font:'system'};
try{
  const sz=localStorage.getItem(STORAGE_FONTSIZE),f=localStorage.getItem(STORAGE_FONT);
  if(Object.hasOwn(FONT_SIZES,sz))textPref.size=sz;
  if(Object.hasOwn(FONTS,f))textPref.font=f;
}catch(e){}
function applyTextPref(){
  const [stack,css]=FONTS[textPref.font];
  document.documentElement.style.fontSize=FONT_SIZES[textPref.size];
  if(css&&!document.querySelector(`link[href="${css}"]`))document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" crossorigin href="${css}">`);
  if(stack)document.body.style.setProperty('--sans',stack);else document.body.style.removeProperty('--sans');
}
applyTextPref();
function setTextPref(key,val){
  textPref[key]=val;
  try{localStorage.setItem(key==='size'?STORAGE_FONTSIZE:STORAGE_FONT,val);}catch(e){}
  applyTextPref();
  syncSettingsUI();
}

// ── REMEMBERED INPUTS ── every tool's text fields survive a reload; secrets and search boxes never do
const STORAGE_REMEMBER='esan-devtools-remember'; // '0' = off, unset = on
const STORAGE_INPUT='esan-devtools-in:';         // + element id
const INPUT_LEGACY_KEYS={'sql-input':'esan-devtools-sql-last','b64-input':'esan-devtools-b64-last','url-input':'esan-devtools-url-last',
  'hash-input':'esan-devtools-hash-last','regex-pattern':'esan-devtools-regex-pat','regex-flags':'esan-devtools-regex-flg','regex-input':'esan-devtools-regex-txt'};
// secrets, then fields that only mirror another one (restoring the source refills them)
const INPUT_NEVER=['jwt-input','jwt-enc-secret','k8s-input','sp-input',
  'json-input-split','nb-hex','nb-bin','nb-oct','rgb-r-n','rgb-g-n','rgb-b-n','hsl-h-n','hsl-s-n','hsl-l-n'];
const INPUT_MAX=200000; // ponytail: bigger values are not saved; raise it or move to IndexedDB if people paste huge logs
let rememberInputs=true;
try{rememberInputs=localStorage.getItem(STORAGE_REMEMBER)!=='0';}catch(e){}
function inputKey(id){return INPUT_LEGACY_KEYS[id]||STORAGE_INPUT+id;}
function rememberedFields(){
  return Array.from(document.querySelectorAll('.tab-content textarea[id], .tab-content input[id]'))
    .filter(el=>!INPUT_NEVER.includes(el.id)&&!/-search$|^ref-q-/.test(el.id)&&!el.readOnly&&(el.tagName==='TEXTAREA'||['text','number','url'].includes(el.type)));
}
let _remembered=[];
// clear buttons and smart paste change values without an input event; pagehide catches those
function saveRememberedInputs(){
  if(!rememberInputs)return;
  _remembered.forEach(el=>{try{
    if(el.value&&el.value.length<=INPUT_MAX)localStorage.setItem(inputKey(el.id),el.value);
    else localStorage.removeItem(inputKey(el.id));
  }catch(e){}});
}
// a tool's remembered option (direction, mode), cleared together with the inputs
function rememberOpt(key,val){try{if(rememberInputs)localStorage.setItem(STORAGE_INPUT+key,val);}catch(e){}}
function recallOpt(key,def){try{return localStorage.getItem(STORAGE_INPUT+key)||def;}catch(e){return def;}}
let _rememberWired=false;
function initRememberedInputs(root){
  const fresh=rememberedFields().filter(el=>!el.dataset.remembered&&(!root||root.contains(el)));
  fresh.forEach(el=>{el.dataset.remembered='1';_remembered.push(el);});
  if(!_rememberWired){
    _rememberWired=true;
    addEventListener('pagehide',saveRememberedInputs);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)saveRememberedInputs();});
  }
  fresh.forEach(el=>{
    let saved=null;
    if(rememberInputs)try{saved=localStorage.getItem(inputKey(el.id));}catch(e){}
    if(saved!==null&&saved!==el.value){
      el.value=saved;
      // replay the field's own handler so outputs come back too
      try{el.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}
    }
    let t=0;
    el.addEventListener('input',()=>{
      if(!rememberInputs)return;
      clearTimeout(t);
      t=setTimeout(()=>{try{
        if(el.value&&el.value.length<=INPUT_MAX)localStorage.setItem(inputKey(el.id),el.value);
        else localStorage.removeItem(inputKey(el.id));
      }catch(e){}},300);
    });
  });
}
function forgetRemembered(){
  try{
    Object.keys(localStorage).filter(k=>k.startsWith(STORAGE_INPUT)||k.startsWith(STORAGE_HIST)).forEach(k=>localStorage.removeItem(k));
    Object.values(INPUT_LEGACY_KEYS).concat(STORAGE_RECENT).forEach(k=>localStorage.removeItem(k));
  }catch(e){}
  if(activeTabId==='home-tab')homeRender();
}
function clearRemembered(){
  _remembered.forEach(el=>{if(el.value){el.value='';try{el.dispatchEvent(new Event('input',{bubbles:true}));}catch(e){}}});
  forgetRemembered();
  showToast('ล้างข้อมูลที่จำไว้และช่องที่กรอกไว้แล้ว','info');
}
function toggleRemember(){
  rememberInputs=!rememberInputs;
  try{localStorage.setItem(STORAGE_REMEMBER,rememberInputs?'1':'0');}catch(e){}
  if(!rememberInputs)forgetRemembered(); // off means nothing stays behind
  syncSettingsUI();
  showToast(rememberInputs?'จะจำข้อมูลที่กรอกไว้ในเครื่องนี้':'ไม่จำข้อมูลแล้ว และลบที่เคยจำไว้','info');
}
(function(){
  const fxOn=()=>clickFx;
  function palette(){
    const cs=getComputedStyle(document.body);
    return['--accent','--accent2','--accent3','--c-yellow','--c-green'].map(v=>cs.getPropertyValue(v).trim());
  }
  function createParticle(x,y,colors){
    const el=document.createElement('div');
    el.className='sparkle-particle'+(Math.random()<0.35?' star':'');
    const color=colors[Math.floor(Math.random()*colors.length)];
    const size=Math.random()*10+5;
    const angle=Math.random()*Math.PI*2;
    const dist=Math.random()*100+40;
    el.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size}px ${color};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-duration:${0.5+Math.random()*0.5}s;`;
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
    // detail 0 = keyboard / programmatic click: no pointer position to burst from
    if(!fxOn()||e.detail===0)return;
    const colors=palette();
    createRipple(e.clientX,e.clientY);
    const count=10+Math.floor(Math.random()*6);
    for(let i=0;i<count;i++)createParticle(e.clientX,e.clientY,colors);
  });
  // logo click: bigger burst
  const logo=document.getElementById('logo-icon');
  if(logo)logo.addEventListener('click',function(e){
    e.stopPropagation();
    if(!fxOn())return;
    const r=logo.getBoundingClientRect(),colors=palette();
    for(let i=0;i<34;i++)createParticle(r.left+r.width/2,r.top+r.height/2,colors);
  });
})();
