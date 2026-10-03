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
  'k8s-secret-tab': { title: 'K8s Secret Decoder', sub: 'วาง Secret YAML / JSON แล้ว decode data: ทุก key · รองรับหลาย Secret (---)' },
  'jwt-tab': { title: 'JWT Decoder', sub: 'แกะ JWT token ดู header, payload, signature · client-side ล้วน' },
  'cron-tab': { title: 'Cron Expression Builder', sub: 'สร้าง cron expression สำหรับ Linux, Spring @Scheduled, Quartz' },
  'regex-tab': { title: 'Regex Tester', sub: 'ทดสอบ Regular Expression พร้อม highlight และ capture groups' },
  'color-tab': { title: 'Color Picker', sub: 'Color Wheel · HSL/RGB/Alpha sliders · Hex ↔ RGB ↔ HSL' },
  'http-tab': { title: 'HTTP Status Code Reference', sub: '1xx · 2xx · 3xx · 4xx · 5xx — คำอธิบายและตัวอย่างการใช้งาน' },
  'kubectl-tab': { title: 'kubectl Cheatsheet', sub: 'คำสั่ง kubectl ที่ใช้บ่อย พร้อมคำอธิบายภาษาไทย' },
  'linux-tab': { title: 'Linux Command Cheatsheet', sub: 'คำสั่ง Linux ที่ใช้บ่อย — Ubuntu / Debian / RHEL' },
  'git-tab': { title: 'Git CLI Cheatsheet', sub: 'คำสั่ง Git ที่ใช้บ่อย — commit · branch · rebase · stash · undo' },
  'numbase-tab': { title: 'Number Base Converter', sub: 'แปลงเลขฐาน 10 ↔ 16 ↔ 2 ↔ 8' },
  'rxjs-tab': { title: 'RxJS Reference', sub: 'Operator Explorer · Marble Diagrams · คำอธิบายภาษาไทย' },
  'angular-tab': { title: 'Angular Lifecycle', sub: '9 Lifecycle Hooks · Interactive Simulator · คำอธิบายภาษาไทย' },
  'mq-tab': { title: 'RabbitMQ · Redis · Quarkus', sub: 'Concepts · Animations · Code Examples สำหรับมือใหม่' },
  'storage-tab': { title: 'Browser Storage APIs', sub: 'localStorage · sessionStorage · IndexedDB · Cookies · Cache API · OPFS' },
  'lov-tab': { title: 'LOV Query Template Browser / Editor', sub: 'ดู · แก้ · สร้าง · ลบ .lov.json ในโฟลเดอร์ได้เลย ไม่ต้องเปิด cdgs-template-designer · ประกอบ SQL พร้อม copy' },
  'esan-agent-tab': { title: 'ESAN AI AGENT', sub: 'Claude Code plugin · ติดตั้ง · อัปเดต · เปิดใช้งานที่ localhost:4567 บนเครื่องตัวเอง' },
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

// ── FAVORITES STORE (persistence impl — swappable) ──
// Interface: load() -> Promise<string[]>, save(ids: string[]) -> Promise<void>
// วันหลังถ้าจะเก็บบน backend ก็เขียน impl ใหม่ที่มี 2 เมธอดนี้ แล้วเรียก
// setFavoritesStore(ApiFavoritesStore) ก่อน initFavorites() — ตัว feature ไม่ต้องแก้
const STORAGE_FAV='isaan-devtools-favorites';

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
  star.textContent=isFavorite(id)?'★':'☆';
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
  showToast(i>=0?'เอาออกจากรายการโปรดแล้ว':'⭐ เพิ่มเข้ารายการโปรดแล้ว');
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
    s.textContent=fav?'★':'☆';
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
    item.appendChild(icon?icon.cloneNode(true):Object.assign(document.createElement('span'),{className:'nav-icon',textContent:'🔧'}));
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
const STORAGE_NAVSEARCH='isaan-devtools-navsearch';
function filterNav(q){
  const query=q.toLowerCase().trim();
  document.querySelectorAll('#sidebar-nav .nav-item').forEach(item=>{
    item.style.display=!query||navLabelOf(item).toLowerCase().includes(query)?'':'none';
  });
  // hide section headings whose items are all filtered out
  document.querySelectorAll('#sidebar-nav .nav-section-label').forEach(label=>{
    if(label.classList.contains('nav-fav-label'))return;
    let visible=false;
    for(let el=label.nextElementSibling;el&&!el.classList.contains('nav-section-label');el=el.nextElementSibling){
      if(el.classList.contains('nav-item')&&el.style.display!=='none'){visible=true;break;}
    }
    label.style.display=visible?'':'none';
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

// ── NAV ──
let activeTabId='random-tab';
// Heavy per-tab setup (mostly highlight.js, ~360ms cold) runs on the tab's first open, not at page load.
// Arrow wrappers: the init functions live in tools/*.js, which load after this file
const TAB_INIT={
  'rxjs-tab':()=>initRxjs(),
  'angular-tab':()=>{initAngular();highlightCode('#angular-tab pre.rxjs-code code');},
  'mq-tab':()=>highlightCode('#mq-tab pre.mq-code code'),
  'storage-tab':()=>storInitHljs(),
};
function openTab(evt,id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});
  document.getElementById(id).classList.add('active');
  // mark ทุก nav item ที่ชี้ tab นี้ (ตัวใน section ปกติ + ตัวใน รายการโปรด)
  document.querySelectorAll(`.nav-item[data-tab="${id}"]`).forEach(b=>{b.classList.add('active');b.setAttribute('aria-selected','true');});
  activeTabId=id;
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
    }
  }
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&activeTabId==='lov-tab'&&_lovEdit){
    e.preventDefault();
    lovSaveEditor();
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
// คลิก/Enter/Space บนตัวค่าเอง (ไม่ใช่แค่ปุ่ม Copy) ก็ copy ได้
document.querySelectorAll('.mock-field-value[id]').forEach(el=>{
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.setAttribute('aria-label','คลิกเพื่อ copy');
});
// tooltip "คลิกเพื่อ copy" แบบ custom (title ของ browser เล็กและปรับขนาดไม่ได้)
const copyTip=document.createElement('div');
copyTip.className='copy-tip';copyTip.textContent='📋 คลิกเพื่อ copy';copyTip.setAttribute('aria-hidden','true');
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
