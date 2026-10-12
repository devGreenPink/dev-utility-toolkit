// ── REFERENCE DOCS ── shared renderer for the knowledge tabs (SQL, DB2 errors, Java, infra, NgRx)
// REF_DOCS[id] = {placeholder, dialects?:[[key,label],...], items:[...]} — registered by each data file
// item: g group · t title · b badge · bc badge colour (green|yellow|red|blue|purple|orange|cyan)
//       s subtitle · d description · fix steps[] · tip · code (string, or {dialectKey: string}) · lang · k extra search words
// In d / fix / tip / s, `text` renders as inline code.
const REF_DOCS={};
const _refState={};

function refInline(s){return escHtml(String(s)).replace(/`([^`]+)`/g,'<code>$1</code>');}
function refAttr(s){return escHtml(String(s)).replace(/"/g,'&quot;');}
function refCodeOf(it,dialect){
  if(!it.code)return '';
  return typeof it.code==='string'?it.code:(it.code[dialect]||'');
}
function refHay(it){
  const code=typeof it.code==='object'&&it.code?Object.values(it.code).join(' '):(it.code||'');
  return [it.g,it.t,it.b,it.s,it.d,(it.fix||[]).join(' '),it.tip,code,it.k].filter(Boolean).join(' ').toLowerCase();
}
function refCodeBlock(src,lang){
  return `<div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="rxjsCopyCode(this)">${ic('copy')} copy</button><pre class="rxjs-code"><code class="language-${lang||'plaintext'}">${escHtml(src)}</code></pre></div>`;
}
function refCard(doc,it,dialect){
  const badge=it.b?`<span class="ref-badge ref-${it.bc||'blue'}">${escHtml(it.b)}</span>`:'';
  const sub=it.s?`<span class="ref-sub">${refInline(it.s)}</span>`:'';
  const fix=it.fix&&it.fix.length?`<div class="ref-fix"><div class="ref-fix-h">${ic('check')} ${doc.fixLabel||'วิธีแก้'}</div><ul>${it.fix.map(f=>`<li>${refInline(f)}</li>`).join('')}</ul></div>`:'';
  const tip=it.tip?`<div class="ref-tip">${ic('lightbulb')}<span>${refInline(it.tip)}</span></div>`:'';
  const src=refCodeOf(it,dialect);
  return `<article class="ref-card"><header class="ref-head">${badge}<h3 class="ref-title">${escHtml(it.t)}</h3>${sub}</header>`
    +(it.d?`<p class="ref-desc">${refInline(it.d)}</p>`:'')+fix+tip+(src?refCodeBlock(src,it.lang||doc.lang):'')+'</article>';
}

function refInit(id){
  const doc=REF_DOCS[id],root=document.getElementById('ref-'+id);
  if(!doc||!root)return;
  const groups=['ทั้งหมด'].concat([...new Set(doc.items.map(i=>i.g))]);
  _refState[id]={q:'',g:'ทั้งหมด',dialect:doc.dialects?doc.dialects[0][0]:null};
  const dialects=doc.dialects?`<div class="json-view-toggle ref-dialect" role="group" aria-label="${refAttr(doc.dialectLabel||'เลือกแบบ')}">${doc.dialects.map(([k,l],i)=>
    `<button type="button" class="json-view-btn${i?'':' active'}" data-dialect="${k}" aria-pressed="${!i}" onclick="refSet('${id}','dialect','${k}')">${escHtml(l)}</button>`).join('')}</div>`:'';
  root.innerHTML=`<div class="ref-bar"><div class="ref-search-wrap">${ic('search','ref-search-ic')}<input type="text" id="ref-q-${id}" placeholder="${refAttr(doc.placeholder||'ค้นหา')}" aria-label="ค้นหา" oninput="refSet('${id}','q',this.value)"></div>${dialects}</div>`
    +`<div class="ref-chips" role="group" aria-label="หมวด">${groups.map((g,i)=>`<button type="button" class="http-group-btn${i?'':' active'}" data-g="${refAttr(g)}" aria-pressed="${!i}" onclick="refSet('${id}','g',this.dataset.g)">${escHtml(g)}</button>`).join('')}</div>`
    +`<div class="ref-count" id="ref-count-${id}" aria-live="polite"></div><div id="ref-list-${id}"></div>`;
  refRender(id);
}
function refSet(id,key,val){
  const st=_refState[id];
  if(!st)return;
  st[key]=val;
  const root=document.getElementById('ref-'+id);
  if(key==='g')root.querySelectorAll('.ref-chips button').forEach(b=>{const on=b.dataset.g===val;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  if(key==='dialect')root.querySelectorAll('.ref-dialect button').forEach(b=>{const on=b.dataset.dialect===val;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  refRender(id);
}
// search / chip from outside (stack trace analyzer links here)
function refFocus(id,query){
  const tab={sqlref:'sqlref-tab',db2err:'db2err-tab',javaex:'javaex-tab',javaint:'javaint-tab',k8s:'k8sref-tab',gateway:'gateway-tab',ngrx:'ngrx-tab'}[id];
  if(tab)openTab(null,tab);
  if(!_refState[id])refInit(id);
  const inp=document.getElementById('ref-q-'+id);
  if(inp){inp.value=query;refSet(id,'g','ทั้งหมด');refSet(id,'q',query);inp.focus({preventScroll:true});}
}
function refRender(id){
  const doc=REF_DOCS[id],st=_refState[id];
  const words=st.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const items=doc.items.filter(it=>(st.g==='ทั้งหมด'||it.g===st.g)&&(!words.length||words.every(w=>refHay(it).includes(w))));
  const list=document.getElementById('ref-list-'+id);
  document.getElementById('ref-count-'+id).textContent=words.length||st.g!=='ทั้งหมด'?`${items.length} รายการ`:`${doc.items.length} รายการ`;
  if(!items.length){
    list.innerHTML=`<div class="ref-empty">${ic('search')}<div>ไม่พบ "${escHtml(st.q)}"</div><div class="ref-empty-sub">${escHtml(doc.emptyHint||'ลองคำอื่น หรือเลือกหมวด "ทั้งหมด"')}</div></div>`;
    return;
  }
  const groups={};
  items.forEach(it=>{(groups[it.g]=groups[it.g]||[]).push(it);});
  list.innerHTML=Object.entries(groups).map(([g,its])=>
    `<section class="ref-group"><h2 class="kubectl-group-title">${escHtml(g)}</h2><div class="ref-grid">${its.map(it=>refCard(doc,it,st.dialect)).join('')}</div></section>`).join('');
  highlightCode(`#ref-list-${id} pre code`);
}
