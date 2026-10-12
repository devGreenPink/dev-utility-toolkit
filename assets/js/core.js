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
  'angular-tab': { title: 'Angular Lifecycle', sub: '9 Lifecycle Hooks · Interactive Simulator · คำอธิบายภาษาไทย' },
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
  'k8sref-tab': { title: 'Docker & K8s', sub: 'อ่าน manifest ทีละบรรทัด · แนวคิดหลัก · แก้ปัญหา Pod' },
  'gateway-tab': { title: 'Request Path', sub: 'Browser → Load Balancer → Kong → Service → Pod · nginx' },
  'clicheat-tab': { title: 'CLI Cheatsheets', sub: 'คำสั่ง Docker · DB2 CLP · Maven · pnpm ที่ใช้บ่อย' },
  'esan-agent-tab': { title: 'ESAN AI AGENT', sub: 'Claude Code plugin · ติดตั้ง · อัปเดต · เปิดใช้งานที่ localhost:4567 บนเครื่องตัวเอง' },
};

// inline SVG from the sprite in index.html
function ic(name,cls){return `<svg class="i${cls?' '+cls:''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;}

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
const reduceMotionMQ=window.matchMedia('(prefers-reduced-motion: reduce)');

function loadTheme(){
  let t=null,ap=null,ac=null;
  try{t=localStorage.getItem(STORAGE_KEY);ap=localStorage.getItem(STORAGE_APPEARANCE);ac=localStorage.getItem(STORAGE_ACCENT);}catch(e){}
  // before v2 the key held 'default' (dark) / 'light' / esan / cdg / south — the retired ones become macOS Dark
  if(t==='light'){t='mac';ap=ap||'light';}
  else if(t&&t!=='mac'&&!PRESETS.some(p=>p[0]===t)){t='mac';ap=ap||'dark';}
  theme.id=t||'mac';
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
function applyAccent(hex){
  const s=document.body.style;
  ACCENT_VARS.forEach(v=>s.removeProperty(v));
  if(!hex)return;
  const surface=getComputedStyle(document.body).getPropertyValue('--surface2').trim();
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
    // live while dragging in the native picker; no view transition per tick
    ci.addEventListener('input',()=>{theme.id='mac';theme.accent=ci.value.toLowerCase();saveTheme();applyTheme();});
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
  if(hint)hint.textContent=!mac?'ใช้กับธีม macOS เท่านั้น ตอนนี้ใช้ธีมพิเศษอยู่':named?named[1]:'กำหนดเอง '+theme.accent.toUpperCase();
  document.querySelectorAll('.preset-opt').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.preset===theme.id)));
  document.getElementById('fx-switch')?.setAttribute('aria-checked',String(clickFx));
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
}
function makeNavItemFocusable(item){
  item.setAttribute('role','tab');
  item.setAttribute('tabindex','0');
  item.setAttribute('aria-selected',item.classList.contains('active')?'true':'false');
}
function injectFavStars(){
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item=>{
    const id=item.dataset.tab;
    if(!id||item.classList.contains('nav-fav-item'))return;
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

// ── NAV ──
let activeTabId='random-tab';
// Heavy per-tab setup (mostly highlight.js, ~360ms cold) runs on the tab's first open, not at page load.
// Arrow wrappers: the init functions live in tools/*.js, which load after this file
const TAB_INIT={
  'rxjs-tab':()=>initRxjs(),
  'angular-tab':()=>{initAngular();highlightCode('#angular-tab pre.rxjs-code code');},
  'mq-tab':()=>highlightCode('#mq-tab pre.mq-code code'),
  'storage-tab':()=>storInitHljs(),
  'sqlref-tab':()=>refInit('sqlref'),
  'db2err-tab':()=>refInit('db2err'),
  'javaex-tab':()=>refInit('javaex'),
  'javaint-tab':()=>refInit('javaint'),
  'k8sref-tab':()=>{k8sInit();refInit('k8s');},
  'gateway-tab':()=>{gwInit();refInit('gateway');},
  'ngrx-tab':()=>{ngrxInit();refInit('ngrx');},
  'clicheat-tab':()=>cliInit(),
  'thai-tab':()=>thaiInit(),
  'unix-tab':()=>unixQuickRender(),
};
function openTab(evt,id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});
  document.getElementById(id).classList.add('active');
  // mark ทุก nav item ที่ชี้ tab นี้ (ตัวใน section ปกติ + ตัวใน รายการโปรด)
  document.querySelectorAll(`.nav-item[data-tab="${id}"]`).forEach(b=>{b.classList.add('active');b.setAttribute('aria-selected','true');});
  activeTabId=id;
  // opening a tool (palette, favorites) inside a collapsed group expands that group
  const grp=srcNavItem(id)?.closest('.nav-group.collapsed');
  if(grp)toggleNavGroup(grp.querySelector('.nav-section-label'));
  const init=TAB_INIT[id];
  if(init){delete TAB_INIT[id];init();}
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
      case'k8s-secret-tab':decodeK8sSecret();break;
      case'url-tab':urlEncode();break;
      case'regex-tab':runRegex();break;
      case'numbase-tab':numBaseConvert('dec',document.getElementById('nb-dec')?.value||'');break;
      case'lov-tab':if(_lovEdit)lovSaveEditor();break;
      case'stacktrace-tab':stAnalyze();break;
      case'json2type-tab':j2tConvert();break;
      case'props-tab':pyConvert();break;
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
  ['ลักษณะ: สว่าง','ธีม macOS','sun',()=>setAppearance('light')],
  ['ลักษณะ: มืด','ธีม macOS','moon',()=>setAppearance('dark')],
  ['ลักษณะ: อัตโนมัติ','ตามการตั้งค่าเครื่อง','monitor',()=>setAppearance('auto')],
  ['เปิด/ปิดเอฟเฟกต์และแอนิเมชัน','การตั้งค่า','sparkles',()=>toggleClickFx()],
];
const _cmdk={items:[],sel:0,ret:null};
function paletteItems(q){
  const words=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const tools=Array.from(document.querySelectorAll('#sidebar-nav .nav-group .nav-item')).map(el=>{
    const id=el.dataset.tab,meta=TAB_META[id]||{},label=navLabelOf(el);
    return{group:'เครื่องมือ',label,sub:el.closest('.nav-group').querySelector('.nav-section-label').textContent.trim(),
      icon:el.querySelector('.nav-icon')?.innerHTML||'',hay:`${label} ${meta.title||''} ${meta.sub||''}`.toLowerCase(),run:()=>openTab(null,id)};
  });
  const cmds=PALETTE_CMDS.map(([label,sub,icon,run])=>({group:'คำสั่ง',label,sub,icon:ic(icon),hay:`${label} ${sub}`.toLowerCase(),run}));
  // label hits rank above subtitle-only hits; sort is stable, so nav order holds within a rank
  const rank=x=>{const l=x.label.toLowerCase();return words.every(w=>l.includes(w))?(l.startsWith(words[0]||'')?0:1):2;};
  const match=list=>list.filter(x=>words.every(w=>x.hay.includes(w))).sort((a,b)=>rank(a)-rank(b));
  return match(tools).concat(match(cmds));
}
function renderPalette(){
  const list=document.getElementById('cmdk-list'),input=document.getElementById('cmdk-input');
  _cmdk.items=paletteItems(input.value);
  _cmdk.sel=Math.min(_cmdk.sel,Math.max(0,_cmdk.items.length-1));
  if(!_cmdk.items.length){
    list.innerHTML=`<div class="cmdk-empty">ไม่พบ "${escHtml(input.value)}" ลองคำอื่น เช่น json, jwt, cron</div>`;
    input.removeAttribute('aria-activedescendant');
    return;
  }
  let html='',grp='';
  _cmdk.items.forEach((x,i)=>{
    if(x.group!==grp){grp=x.group;html+=`<div class="cmdk-group" role="presentation">${grp}</div>`;}
    html+=`<div class="cmdk-item" role="option" id="cmdk-opt-${i}" aria-selected="${i===_cmdk.sel}" data-i="${i}"><span class="cmdk-ic">${x.icon}</span><span class="cmdk-label">${escHtml(x.label)}</span><span class="cmdk-sub">${escHtml(x.sub)}</span></div>`;
  });
  list.innerHTML=html;
  input.setAttribute('aria-activedescendant','cmdk-opt-'+_cmdk.sel);
}
function movePaletteSel(d){
  if(!_cmdk.items.length)return;
  _cmdk.sel=(_cmdk.sel+d+_cmdk.items.length)%_cmdk.items.length;
  document.querySelectorAll('.cmdk-item').forEach(el=>el.setAttribute('aria-selected',String(+el.dataset.i===_cmdk.sel)));
  document.getElementById('cmdk-opt-'+_cmdk.sel)?.scrollIntoView({block:'nearest'});
  document.getElementById('cmdk-input').setAttribute('aria-activedescendant','cmdk-opt-'+_cmdk.sel);
}
function openPalette(){
  const p=document.getElementById('cmdk');
  if(!p.hidden)return;
  _cmdk.ret=document.activeElement;_cmdk.sel=0;
  document.querySelectorAll('.popover.open').forEach(x=>setPopover(x,false));
  const input=document.getElementById('cmdk-input');
  input.value='';
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
  input.addEventListener('input',()=>{_cmdk.sel=0;renderPalette();});
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
  t.querySelector('.toast-msg').textContent=msg||'Copied';
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.classList.remove('show'),2000);
}
function copyText(txt){navigator.clipboard.writeText(txt).then(()=>showToast('Copied')).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('Copied');});}
function copyVal(id){const el=document.getElementById(id);if(el&&el.textContent&&el.textContent)copyText(el.textContent);}
// คลิก/Enter/Space บนตัวค่าเอง (ไม่ใช่แค่ปุ่ม Copy) ก็ copy ได้
document.querySelectorAll('.mock-field-value[id]').forEach(el=>{
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.setAttribute('aria-label','คลิกเพื่อ copy');
});
// tooltip "คลิกเพื่อ copy" แบบ custom (title ของ browser เล็กและปรับขนาดไม่ได้)
const copyTip=document.createElement('div');
copyTip.className='copy-tip';copyTip.innerHTML=ic('copy')+' คลิกเพื่อ copy';copyTip.setAttribute('aria-hidden','true');
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
// highlight.js marks what it has done with data-highlighted, so this is safe to call repeatedly
function highlightCode(sel){
  if(!window.hljs)return;
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

// ── EFFECTS ── one Settings switch for the click sparkle, the logo animation and UI transitions.
// Unset = follow the OS reduce-motion preference; once the user flips the switch, their choice wins.
const STORAGE_CLICKFX='esan-devtools-clickfx'; // '1' | '0' | unset
let clickFx=!reduceMotionMQ.matches;
try{const v=localStorage.getItem(STORAGE_CLICKFX);if(v!==null)clickFx=v!=='0';}catch(e){}
function applyFx(){document.body.classList.toggle('fx-off',!clickFx);}
applyFx();
reduceMotionMQ.addEventListener('change',()=>{
  let v=null;try{v=localStorage.getItem(STORAGE_CLICKFX);}catch(e){}
  if(v===null){clickFx=!reduceMotionMQ.matches;applyFx();syncSettingsUI();}
});
function toggleClickFx(){
  clickFx=!clickFx;
  try{localStorage.setItem(STORAGE_CLICKFX,clickFx?'1':'0');}catch(e){}
  applyFx();
  syncSettingsUI();
  showToast(clickFx?'เปิดเอฟเฟกต์และแอนิเมชันแล้ว':'ปิดเอฟเฟกต์และแอนิเมชันแล้ว','info');
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
