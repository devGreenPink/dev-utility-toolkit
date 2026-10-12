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
  return `<div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="rxjsCopyCode(this)">${ic('copy')} คัดลอก</button><pre class="rxjs-code"><code class="language-${lang||'plaintext'}">${escHtml(src)}</code></pre></div>`;
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
  const tab={sqlref:'sqlref-tab',db2err:'db2err-tab',javaex:'javaex-tab',javaint:'javaint-tab',k8s:'k8sref-tab',gateway:'gateway-tab',ngrx:'ngrx-tab',jenkins:'jenkins-tab'}[id];
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

// ── LINE EXPLORER ── annotated files shared by Docker & K8s and Jenkins: each file is
// {id, g (group), label, lang, intro, lines:[[code, note]]}; a line with a note is focusable and explains itself
const _yx={};
function yxInit(rootId,files,cur){
  const root=document.getElementById(rootId);
  if(!root)return;
  _yx[rootId]={files,cur:cur||files[0].id,waited:false};
  const groups=[...new Set(files.map(f=>f.g))];
  root.innerHTML=`<div class="yx-picker">${groups.map((g,gi)=>`<div class="yx-group" role="group" aria-labelledby="${rootId}-g${gi}"><span class="yx-glabel" id="${rootId}-g${gi}">${escHtml(g)}</span>${files.filter(f=>f.g===g).map(f=>
    `<button type="button" class="http-group-btn yx-file" data-m="${f.id}" aria-pressed="false" onclick="yxShow('${rootId}','${f.id}')">${escHtml(f.label)}</button>`).join('')}</div>`).join('')}</div>
  <p class="k8s-intro" id="${rootId}-intro"></p>
  <div class="yx">
    <div class="yx-code rxjs-code" id="${rootId}-code" aria-label="บรรทัดของไฟล์"></div>
    <aside class="yx-note" id="${rootId}-note" aria-live="polite"></aside>
  </div>`;
  yxShow(rootId);
}
function yxShow(rootId,id){
  const st=_yx[rootId];
  if(!st)return;
  if(id)st.cur=id;
  const f=st.files.find(x=>x.id===st.cur);
  if(!f)return;
  // colour arrives with highlight.js; render plain now and once more when it has loaded
  if(!window.hljs&&!st.waited){st.waited=true;loadLib('hljs').then(()=>{if(window.hljs)yxShow(rootId);});}
  const hl=window.hljs&&hljs.getLanguage(f.lang);
  document.querySelectorAll(`#${rootId} .yx-file`).forEach(b=>{const on=b.dataset.m===f.id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.getElementById(rootId+'-intro').innerHTML=refInline(f.intro);
  document.getElementById(rootId+'-code').innerHTML=f.lines.map(([ln,note],i)=>{
    const html=hl&&ln.trim()?hljs.highlight(ln,{language:f.lang,ignoreIllegals:true}).value:escHtml(ln);
    return note
      ?`<button type="button" class="yx-line has-note" data-i="${i}" onmouseenter="yxNote('${rootId}',${i})" onfocus="yxNote('${rootId}',${i})" onclick="yxNote('${rootId}',${i})"><span class="yx-ln">${i+1}</span><code>${html||' '}</code></button>`
      :`<div class="yx-line"><span class="yx-ln">${i+1}</span><code>${html||' '}</code></div>`;
  }).join('')+`<button type="button" class="btn btn-ghost yx-copy" onclick="yxCopy('${rootId}')">${ic('copy')} คัดลอกทั้งไฟล์</button>`;
  yxNote(rootId,f.lines.findIndex(l=>l[1]));
}
function yxNote(rootId,i){
  const st=_yx[rootId],f=st.files.find(x=>x.id===st.cur),l=f.lines[i];
  document.querySelectorAll(`#${rootId}-code .yx-line`).forEach(el=>el.classList.toggle('active',+el.dataset.i===i));
  document.getElementById(rootId+'-note').innerHTML=l?`<div class="yx-note-line">บรรทัด ${i+1}</div><code class="yx-note-code">${escHtml(l[0].trim())}</code><p>${refInline(l[1])}</p>`:'';
}
function yxCopy(rootId){const st=_yx[rootId],f=st.files.find(x=>x.id===st.cur);copyText(f.lines.map(l=>l[0]).join('\n'));}

// ── FLOW ── a row of clickable steps with a detail card (Request Path, Jenkins pipeline):
// nodes are {id, icon, t, s, d, err:[...], code?}; opt = {label, errLabel, lang}
const _flow={};
function flowInit(rootId,nodes,cur,opt){
  const root=document.getElementById(rootId);
  if(!root)return;
  _flow[rootId]={nodes,cur,opt};
  root.innerHTML=`<ol class="gw-chain" aria-label="${refAttr(opt.label)}">${nodes.map((n,i)=>
    `<li><button type="button" class="gw-node" data-n="${n.id}" aria-pressed="false" onclick="flowShow('${rootId}','${n.id}')"><span class="gw-ic">${ic(n.icon)}</span><span class="gw-t">${escHtml(n.t)}</span><span class="gw-s">${escHtml(n.s)}</span></button>${i<nodes.length-1?`<span class="gw-arrow" aria-hidden="true">${ic('chevrons-right')}</span>`:''}</li>`).join('')}</ol>
  <div class="gw-detail card" id="${rootId}-detail" aria-live="polite"></div>`;
  flowShow(rootId,cur);
}
function flowShow(rootId,id){
  const st=_flow[rootId],n=st.nodes.find(x=>x.id===id);
  if(!n)return;
  st.cur=id;
  document.querySelectorAll(`#${rootId} .gw-node`).forEach(b=>{const on=b.dataset.n===id;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.getElementById(rootId+'-detail').innerHTML=`<div class="card-title">${ic(n.icon)} ${escHtml(n.t)}</div><p class="ref-desc">${refInline(n.d)}</p>`
    +`<div class="ref-fix"><div class="ref-fix-h gw-err-h">${ic('triangle-alert')} ${escHtml(st.opt.errLabel)}</div><ul>${n.err.map(e=>`<li>${refInline(e)}</li>`).join('')}</ul></div>`
    +(n.code?refCodeBlock(n.code,st.opt.lang||'bash'):'');
  highlightCode(`#${rootId}-detail pre code`);
}
