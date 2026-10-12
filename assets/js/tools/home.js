// ── HOME ── smart paste, recent tools, favorites and the full tool list

// Smart paste: [kind, label, test]. Order matters: the first hits are the most specific.
// Each kind opens a tool through SP_OPEN below; a text can match several kinds (13 digits: Thai ID and ms timestamp).
const SP_RULES=[
  ['curl','คำสั่ง curl',t=>/^curl\s/i.test(t)],
  ['jwt','JWT token',t=>/^(Bearer\s+)?eyJ[\w-]+\.eyJ[\w-]+\.[\w-]*$/.test(t)],
  ['stacktrace','Java stack trace',t=>/\n\s*at\s+[\w$.<>\/-]+\([^)]*\)/.test(t)||/^(Caused by:|Exception in thread )/m.test(t)],
  ['k8s-secret','Kubernetes Secret',t=>/^\s*kind:\s*Secret\b/m.test(t)&&/^\s*(data|stringData):/m.test(t)],
  ['k8s-yaml','Kubernetes manifest',t=>/^apiVersion:\s*\S+/m.test(t)&&/^kind:\s*\w+/m.test(t)&&!/^\s*kind:\s*Secret\b/m.test(t)],
  ['jenkinsfile','Jenkinsfile',t=>/^\s*@Library\(/m.test(t)||/^\s*(pipeline|node)\s*(\(.*\))?\s*\{/m.test(t)&&/\bstages?\s*[({]/.test(t)],
  ['dockerfile','Dockerfile',t=>/^FROM\s+\S+/im.test(t)&&/^(RUN|COPY|ENTRYPOINT|CMD|WORKDIR)\s/im.test(t)],
  ['har','HAR (บันทึก network จาก DevTools)',t=>/^\{/.test(t)&&/"log"\s*:/.test(t)&&/"entries"\s*:/.test(t)&&spIsJson(t)&&Array.isArray(JSON.parse(t).log?.entries)],
  ['json','JSON',t=>/^[[{]/.test(t)&&spIsJson(t)],
  ['sql-java','SQL ใน Java / MyBatis',t=>/(StringBuilder|\.append\s*\(|"""|@Query|prepareStatement|<(select|insert|update|delete)\b)/i.test(t)&&/\b(select|insert|update|delete)\b/i.test(t)],
  ['sql','SQL',t=>/^\s*(select|insert|update|delete|with|merge)\b/i.test(t)],
  ['db2code','DB2 SQLCODE',t=>/SQLCODE\s*=\s*-?\d+/i.test(t)||/^[-+]\d{3,5}$/.test(t)],
  ['exception','Java exception',t=>/^([a-z_$][\w$]*\.)*[A-Z][\w$]*(Exception|Error)$/.test(t)],
  ['xml','XML',t=>/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<[A-Za-z_][\w:.-]*[\s/>]/.test(t)&&/(<\/[A-Za-z_][\w:.-]*\s*>|\/>)$/.test(t)],
  ['props','application.properties',t=>spIsProps(t)],
  ['yaml','YAML',t=>!/^[[{]/.test(t)&&/^["%\w][\w."%-]*:\s*$/m.test(t)&&/^\s{2,}["%\w][\w."%-]*:/m.test(t)],
  ['thai-id','เลข 13 หลัก (บัตร / นิติบุคคล)',t=>/^\d[- ]?\d{4}[- ]?\d{5}[- ]?\d{2}[- ]?\d$/.test(t)&&thaiIdInfo(t).ok],
  ['unix','Unix timestamp',t=>/^\d{10}(\d{3})?$/.test(t)],
  ['be-date','วันที่ พ.ศ.',t=>/^\d{1,2}[/.-]\d{1,2}[/.-]25\d\d$/.test(t)],
  ['amount','จำนวนเงิน',t=>/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)||/^-?\d+\.\d{1,2}$/.test(t)],
  ['cron','Cron expression',t=>/^(\S+\s+){4,6}\S+$/.test(t)&&t.split(/\s+/).every(f=>/^[\d*/,?LW#-]+$|^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|SUN|MON|TUE|WED|THU|FRI|SAT)$/i.test(f))],
  ['color','สี HEX',t=>/^#[0-9a-f]{6}$/i.test(t)||/^(?=.*[a-f])[0-9a-f]{6}$/i.test(t)],
  ['http','HTTP status code',t=>/^[1-5]\d\d$/.test(t)],
  ['url-enc','ข้อความที่ URL-encode',t=>/%[0-9A-F]{2}/i.test(t)&&!/\s/.test(t)],
  ['base64','Base64',t=>/^[A-Za-z0-9+/_-]{8,}={0,2}$/.test(t)&&t.length%4!==1&&spB64Readable(t)],
];
// where each kind goes: [tool label, open(text)]
const SP_OPEN={
  jwt:['JWT Decoder',t=>spFill('jwt-tab','jwt-input',t.replace(/^Bearer\s+/,''))],
  stacktrace:['Stack Trace Analyzer',t=>spFill('stacktrace-tab','st-input',t,()=>stAnalyze())],
  'k8s-secret':['K8s Secret Decoder',t=>spFill('k8s-secret-tab','k8s-input',t,()=>decodeK8sSecret())],
  'k8s-yaml':['Docker & K8s',t=>{
    const kind=(t.match(/^kind:\s*(\w+)/m)||[])[1]||'';
    const f=K8S_MANIFESTS.find(x=>x.lines.some(l=>l[0]==='kind: '+kind)); // the annotated file of the same kind
    spExplorer('k8sref-tab','k8s-explorer',f&&f.id);
    refFocus('k8s',kind);
  }],
  jenkinsfile:['Jenkins CI/CD',t=>spExplorer('jenkins-tab','jk-explorer',/@Library\(/.test(t)&&!/pipeline\s*\{/.test(t)?'lib-use':'ci')],
  dockerfile:['Docker & K8s',t=>spExplorer('k8sref-tab','k8s-explorer',/nginx/i.test(t)?'nginx':/quarkus-micro/i.test(t)?'docker-native':/openjdk|run-java/i.test(t)?'docker-jvm':'docker')],
  'curl-jwt':['JWT Decoder (token)',t=>spFill('jwt-tab','jwt-input',spCurl(t).bearer)],
  'curl-body':['JSON Tools (body)',t=>spFill('json-tab','json-input',spCurl(t).body,()=>formatJSON(2))],
  'curl-url':['URL Decode (URL)',t=>{urlSetMode('dec');spFill('url-tab','url-input',spCurl(t).url);}],
  har:['JSON Tools (Tree)',t=>{spFill('json-tab','json-input',t,()=>formatJSON(2));switchJsonView('tree');}],
  xml:['JSON Tools (แปลงจาก XML)',t=>{
    let json;try{json=JSON.stringify(xmlToJson(t),null,2);}catch(e){showToast(e.message,'warn');return;}
    spFill('json-tab','json-input',json,()=>formatJSON(2));
  }],
  json:['JSON Tools',t=>spFill('json-tab','json-input',t,()=>formatJSON(4))],
  json2type:['JSON → Type',t=>spFill('json2type-tab','j2t-input',t,()=>j2tConvert())],
  'sql-java':['SQL Parser',t=>spFill('sql-tab','sql-input',t,()=>convertSQL())],
  sql:['SQL Parser',t=>spFill('sql-tab','sql-input',t,()=>convertSQL())],
  db2code:['DB2 Error Codes',t=>refFocus('db2err',(t.match(/SQLCODE\s*=\s*(-?\d+)/i)||[0,t])[1])],
  exception:['Java Exceptions',t=>refFocus('javaex',t.split('.').pop())],
  props:['Properties ↔ YAML',t=>{pySetDir('p2y');spFill('props-tab','py-input',t,()=>pyConvert());}],
  yaml:['Properties ↔ YAML',t=>{pySetDir('y2p');spFill('props-tab','py-input',t,()=>pyConvert());}],
  'thai-id':['ตรวจเลข 13 หลัก',t=>spFill('thai-tab','th-id',t)],
  unix:['Unix Timestamp',t=>spFill('unix-tab','unix-input',t)],
  'be-date':['แปลงวันที่ พ.ศ.',t=>spFill('thai-tab','th-be',t)],
  amount:['จำนวนเงินเป็นตัวอักษร',t=>spFill('thai-tab','th-amount',t)],
  cron:['Cron Builder',t=>spFill('cron-tab','cron-manual',t)],
  color:['Color Picker',t=>spFill('color-tab','color-hex',t.startsWith('#')?t:'#'+t)],
  http:['HTTP Status',t=>spFill('http-tab','http-search',t)],
  'url-enc':['URL Decode',t=>{urlSetMode('dec');spFill('url-tab','url-input',t);}],
  base64:['Base64 Decode',t=>{b64SetMode('dec');spFill('base64-tab','b64-input',t);}],
  hash:['Hash Generator',t=>spFill('hash-tab','hash-input',t)],
  b64enc:['Base64 Encode',t=>{b64SetMode('enc');spFill('base64-tab','b64-input',t);}],
  regex:['Regex Tester',t=>spFill('regex-tab','regex-input',t)],
};
function spIsJson(t){try{JSON.parse(t);return true;}catch(e){return false;}}
function spIsProps(t){
  const lines=t.split('\n').map(l=>l.trim()).filter(l=>l&&!/^[#!]/.test(l));
  return lines.length>0&&lines.every(l=>/^[%\w"][\w."%/-]*\s*[=:]/.test(l)&&!/:\s*$/.test(l))&&lines.some(l=>/^[^=:\s]*\.[^=:\s]*\s*[=:]/.test(l));
}
function spB64Readable(t){
  try{
    const raw=atob(t.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(t.length/4)*4,'='));
    const text=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
    return text.length>0&&!/[\x00-\x08\x0E-\x1F]/.test(text);
  }catch(e){return false;}
}
// Pure: text → [{kind, label, tool}], best first; JSON also offers JSON → Type
function spDetect(input){
  const t=String(input).trim();
  if(!t)return[];
  const out=[];
  for(const[kind,label,test]of SP_RULES){
    let hit=false;try{hit=test(t);}catch(e){}
    if(!hit)continue;
    if(kind==='curl'){out.push(...spCurlTargets(t));continue;}
    out.push({kind,label,tool:SP_OPEN[kind][0]});
    if(kind==='json')out.push({kind:'json2type',label:'JSON',tool:SP_OPEN.json2type[0]});
  }
  return out;
}

// ── UI ──
function spFill(tab,id,value,after){
  openTab(null,tab);
  const el=document.getElementById(id);
  if(!el)return;
  el.value=value;
  el.dispatchEvent(new Event('input',{bubbles:true})); // live tools react and the value is remembered
  histPush(el);
  if(after)after();
  el.focus({preventScroll:true});
}
// open a reference tab on one of its annotated files
function spExplorer(tab,rootId,fileId){
  openTab(null,tab);
  if(fileId)yxShow(rootId,fileId);
  document.getElementById(rootId)?.scrollIntoView({block:'start'});
}
function spOpen(kind,text){const o=SP_OPEN[kind];if(o)o[1](text);}
// one box: a pasted value opens the tool that understands it, a short word searches the tools
let _spTimer=0,_spActs=[];
function spLive(){clearTimeout(_spTimer);_spTimer=setTimeout(spRender,150);}
function spAct(i){const a=_spActs[i];if(a)a.run();}
function spRender(){
  const t=document.getElementById('sp-input').value.trim();
  const out=document.getElementById('sp-result');
  _spActs=[];
  if(!t){out.innerHTML='';return;}
  const hits=spDetect(t);
  let head;
  if(hits.length){
    head=`${ic('sparkles')} น่าจะเป็น <b>${escHtml(hits[0].label)}</b>`;
    _spActs=hits.map(d=>({label:'เปิดใน '+d.tool,run:()=>spOpen(d.kind,t)}));
  }else{
    const tools=/\n/.test(t)||t.length>40?[]:paletteItems(t).filter(x=>x.group==='เครื่องมือ').slice(0,6);
    if(tools.length){
      head=`${ic('search')} เครื่องมือที่ตรงกับ "${escHtml(t)}"`;
      _spActs=tools.map(x=>({label:x.label,run:x.run}));
    }else{
      head=`${ic('info')} ไม่แน่ใจว่าเป็นอะไร ลองเปิดกับเครื่องมือเหล่านี้`;
      _spActs=['hash','b64enc','regex'].map(k=>({label:'เปิดใน '+SP_OPEN[k][0],run:()=>spOpen(k,t)}));
    }
  }
  out.innerHTML=`<span class="sp-label">${head}</span>`+(hits[0]&&hits[0].kind==='har'?spHarHtml(t):'')+`<span class="sp-acts">`
    +_spActs.map((a,i)=>`<button type="button" class="btn ${i?'btn-ghost':'btn-primary'}" onclick="spAct(${i})">${i?'':ic('arrow-right')}${escHtml(a.label)}</button>`).join('')+'</span>';
}
function spOpenFirst(){clearTimeout(_spTimer);spRender();spAct(0);}
async function spPasteClipboard(){
  try{
    const text=await navigator.clipboard.readText();
    const el=document.getElementById('sp-input');
    el.value=text;
    spRender();
    el.focus();
  }catch(e){showToast('อ่านคลิปบอร์ดไม่ได้ ลองกด Ctrl+V ในช่องแทน','warn');}
}

// tool rows reuse the sidebar's icon + label so there is one source of truth
function homeToolRow(id){
  const src=document.querySelector(`#sidebar-nav .nav-group .nav-item[data-tab="${id}"]`);
  if(!src)return '';
  const group=src.closest('.nav-group').querySelector('.nav-section-label').textContent.trim();
  return `<button type="button" class="home-item" onclick="openTab(null,'${id}')"><span class="gw-ic">${src.querySelector('.nav-icon').innerHTML}</span><span class="home-item-t">${escHtml(navLabelOf(src))}</span><span class="home-item-sub">${escHtml(group)}</span></button>`;
}
const STORAGE_TIPS='esan-devtools-tips'; // '1' once the tips card was dismissed
function homeTipsDismiss(){
  try{localStorage.setItem(STORAGE_TIPS,'1');}catch(e){}
  document.getElementById('home-tips').hidden=true;
  document.getElementById('sp-input')?.focus();
}
function homeRender(){
  const rec=document.getElementById('home-recent'),fav=document.getElementById('home-fav');
  if(!rec)return;
  let seen=false;try{seen=localStorage.getItem(STORAGE_TIPS)==='1';}catch(e){}
  document.getElementById('home-tips').hidden=seen;
  const recent=recentTabs().map(homeToolRow).filter(Boolean);
  rec.innerHTML=recent.length?recent.join(''):'<div class="home-empty">ยังไม่มี เครื่องมือที่เปิดจะขึ้นที่นี่</div>';
  const favs=(typeof favorites!=='undefined'?favorites:[]).map(homeToolRow).filter(Boolean);
  fav.innerHTML=favs.length?favs.join(''):`<div class="home-empty">กดรูปดาว ${ic('star')} ข้างชื่อเครื่องมือในเมนูเพื่อปักไว้ที่นี่</div>`;
  const all=document.getElementById('home-all');
  if(all&&!all.children.length){
    all.innerHTML=Array.from(document.querySelectorAll('#sidebar-nav .nav-group')).map(g=>{
      const items=Array.from(g.querySelectorAll('.nav-item')).map(it=>{
        const id=it.dataset.tab,meta=TAB_META[id]||{};
        return `<button type="button" class="home-tool" onclick="openTab(null,'${id}')"><span class="gw-ic">${it.querySelector('.nav-icon').innerHTML}</span><span><span class="home-tool-t">${escHtml(navLabelOf(it))}</span><span class="home-tool-s">${escHtml(meta.sub||'')}</span></span></button>`;
      }).join('');
      return `<h3 class="home-group-h">${escHtml(g.querySelector('.nav-section-label').textContent.trim())}</h3><div class="home-tools">${items}</div>`;
    }).join('');
  }
  const mod=/Mac|iPhone|iPad/.test(navigator.platform||'')?'⌘':'Ctrl';
  document.querySelectorAll('.home-mod').forEach(k=>k.textContent=mod);
}
function spTry(text){
  const el=document.getElementById('sp-input');
  el.value=text;
  spRender();
  el.focus();
}

// ── CURL / HAR / XML ── parts of what smart paste recognises
// Pure: a curl command → {url, method, headers, body, bearer}; shell quoting and line continuations understood
function spCurl(text){
  const src=String(text).replace(/\\\r?\n/g,' ');
  const tok=[];let cur='',q=null,has=false;
  for(let i=0;i<src.length;i++){
    const c=src[i];
    if(q==="'"){if(c==="'")q=null;else cur+=c;continue;}
    if(q==='"'){if(c==='\\'&&/["\\$`]/.test(src[i+1]||'')){cur+=src[++i];}else if(c==='"')q=null;else cur+=c;continue;}
    if(c==="'"||c==='"'){q=c;has=true;continue;}
    if(c==='\\'){cur+=src[++i]||'';has=true;continue;}
    if(/\s/.test(c)){if(cur||has)tok.push(cur);cur='';has=false;continue;}
    cur+=c;
  }
  if(cur||has)tok.push(cur);
  if(!/^curl$/i.test(tok[0]||''))return null;
  const ARG=new Set(['-X','--request','-H','--header','-d','--data','--data-raw','--data-binary','--data-urlencode','--json','-u','--user','-b','--cookie','-A','--user-agent','-o','--output','-e','--referer','--url','-F','--form','-m','--max-time','--connect-timeout','-x','--proxy','--cacert','--cert','--key']);
  const r={url:'',method:'',headers:{},body:'',bearer:''};
  for(let i=1;i<tok.length;i++){
    const a=tok[i];
    if(!a.startsWith('-')||a==='-'){if(!r.url)r.url=a;continue;}
    const v=ARG.has(a)?tok[++i]??'':'';
    if(a==='-X'||a==='--request')r.method=v.toUpperCase();
    else if(a==='-H'||a==='--header'){const k=v.indexOf(':');if(k>0)r.headers[v.slice(0,k).trim().toLowerCase()]=v.slice(k+1).trim();}
    else if(/^(-d|--data(-raw|-binary|-urlencode)?|--json)$/.test(a))r.body=r.body?r.body+'&'+v:v;
    else if(a==='--url')r.url=v;
  }
  const auth=r.headers.authorization||'';
  if(/^Bearer\s+/i.test(auth))r.bearer=auth.replace(/^Bearer\s+/i,'').trim();
  if(!r.method)r.method=r.body?'POST':'GET';
  return r;
}
function spCurlTargets(t){
  const c=spCurl(t);
  if(!c)return[];
  const out=[];
  if(/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]*$/.test(c.bearer))out.push({kind:'curl-jwt',label:'curl: token ใน Authorization',tool:SP_OPEN['curl-jwt'][0]});
  if(c.body&&/^[[{]/.test(c.body.trim())&&spIsJson(c.body.trim()))out.push({kind:'curl-body',label:'curl: body เป็น JSON',tool:SP_OPEN['curl-body'][0]});
  if(c.url)out.push({kind:'curl-url',label:'curl: URL และ query',tool:SP_OPEN['curl-url'][0]});
  return out;
}
// Pure: HAR JSON → request count, failures and the slowest calls
function harSummary(text){
  const entries=JSON.parse(text).log.entries||[];
  const rows=entries.map(e=>({method:e.request?.method||'',url:e.request?.url||'',status:e.response?.status??0,time:Math.round(e.time||0)}));
  return{count:rows.length,failed:rows.filter(r=>!r.status||r.status>=400),slow:rows.slice().sort((a,b)=>b.time-a.time).slice(0,3)};
}
function spHarHtml(t){
  let s;try{s=harSummary(t);}catch(e){return '';}
  const path=u=>{try{const x=new URL(u);return x.pathname+x.search;}catch(e){return u;}};
  const row=(r,extra)=>`<li><code>${escHtml(r.method)}</code> <span class="sp-har-url">${escHtml(path(r.url))}</span> ${extra}</li>`;
  return `<div class="sp-har"><div>${s.count} request · <b class="${s.failed.length?'t-red':'t-green'}">ล้มเหลว ${s.failed.length}</b></div>`
    +(s.failed.length?`<ul>${s.failed.slice(0,5).map(r=>row(r,`<b class="t-red">${r.status||'ไม่มีคำตอบ'}</b>`)).join('')}</ul>`:'')
    +`<div>ช้าที่สุด</div><ul>${s.slow.map(r=>row(r,`<b>${r.time} ms</b>`)).join('')}</ul></div>`;
}
// XML → JSON: attributes become "@name", text next to attributes "#text", repeated tags an array
function xmlToJson(text){
  const doc=new DOMParser().parseFromString(text,'application/xml');
  const err=doc.querySelector('parsererror');
  if(err)throw new Error('XML ไม่ถูกต้อง: '+err.textContent.split('\n')[0]);
  const conv=el=>{
    const o={};
    for(const a of el.attributes)o['@'+a.name]=a.value;
    const kids=Array.from(el.children);
    if(!kids.length){const tx=el.textContent.trim();return Object.keys(o).length?(tx?{...o,'#text':tx}:o):tx;}
    for(const k of kids){
      const v=conv(k);
      if(k.tagName in o){if(!Array.isArray(o[k.tagName]))o[k.tagName]=[o[k.tagName]];o[k.tagName].push(v);}
      else o[k.tagName]=v;
    }
    return o;
  };
  return{[doc.documentElement.tagName]:conv(doc.documentElement)};
}

// ── SHARE LINK ── #t=<tab>&z=<base64url deflate JSON> (or &s=<base64url JSON> where CompressionStream is missing):
// the open tool and what is typed in it. The hash never reaches a server, but the link carries the data wherever
// it is pasted, so secret fields (INPUT_NEVER) are left out.
const SHARE_MAX=8000; // URL length that chat apps keep intact; compressed, that is roughly 20-40 KB of typical text
function b64uFromBytes(bytes){let bin='';for(const b of bytes)bin+=String.fromCharCode(b);return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function b64uBytes(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
function b64uEncode(s){return b64uFromBytes(new TextEncoder().encode(s));}
function b64uDecode(s){return new TextDecoder().decode(b64uBytes(s));}
const shareZip=(bytes,mode)=>new Response(new Blob([bytes]).stream().pipeThrough(mode==='in'?new CompressionStream('deflate-raw'):new DecompressionStream('deflate-raw'))).arrayBuffer();
// the state's JSON text from `z` (compressed); null = read `s` instead
async function shareJson(hash){
  const z=new URLSearchParams(String(hash||'').replace(/^#/,'')).get('z');
  if(!z||typeof DecompressionStream==='undefined')return null;
  try{return new TextDecoder().decode(await shareZip(b64uBytes(z),'out'));}catch(e){return '';}
}
// Pure: location.hash (+ the decompressed JSON) → {tab, st} or null; anything malformed is dropped,
// so a crafted link can only fill fields
function shareParse(hash,json){
  const p=new URLSearchParams(String(hash||'').replace(/^#/,''));
  const tab=p.get('t');
  if(!tab||!/^[a-z0-9-]+-tab$/.test(tab))return null;
  let raw={};
  try{raw=JSON.parse(json!=null?json:p.get('s')?b64uDecode(p.get('s')):'{}');}catch(e){raw={};}
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const pick=(o,ok)=>Object.fromEntries(Object.entries(obj(o)).filter(([k,v])=>/^[\w-]+$/.test(k)&&ok(v)));
  return{tab,st:{f:pick(raw.f,v=>typeof v==='string'),c:pick(raw.c,v=>typeof v==='boolean'),r:pick(raw.r,v=>typeof v==='string'),
    t:pick(raw.t,v=>Number.isInteger(v)&&v>=0),x:pick(raw.x,v=>typeof v==='string')}};
}
function shareFields(root){
  return Array.from(root.querySelectorAll('textarea[id], input[id]'))
    .filter(el=>!INPUT_NEVER.includes(el.id)&&!el.readOnly&&(el.tagName==='TEXTAREA'||['text','number','url','search'].includes(el.type)));
}
async function shareLink(){
  const src=_copySrc; // the clicked button, before awaiting the compression
  const tab=activeTabId,root=document.getElementById(tab);
  const st={f:{},c:{},r:{},t:{},x:{}};
  shareFields(root).forEach(el=>{if(el.value)st.f[el.id]=el.value;});
  root.querySelectorAll('input[type=checkbox][id]').forEach(el=>{if(el.checked!==el.defaultChecked)st.c[el.id]=el.checked;});
  root.querySelectorAll('input[type=radio][name]:checked').forEach(el=>{if(!el.defaultChecked)st.r[el.name]=el.value;});
  root.querySelectorAll('.json-view-toggle[id]').forEach(g=>{const i=[...g.querySelectorAll('button')].findIndex(b=>b.classList.contains('active'));if(i>=0)st.t[g.id]=i;});
  Object.entries(_yx).forEach(([id,x])=>{if(root.contains(document.getElementById(id)))st.x[id]=x.cur;});
  const base=location.origin+location.pathname+'#t='+tab;
  const any=Object.values(st).some(o=>Object.keys(o).length);
  let full=base;
  if(any){
    const json=JSON.stringify(st);
    full=base+'&s='+b64uEncode(json);
    if(typeof CompressionStream!=='undefined'){
      const z=base+'&z='+b64uFromBytes(new Uint8Array(await shareZip(new TextEncoder().encode(json),'in')));
      if(z.length<full.length)full=z;
    }
  }
  const skipped=Array.from(root.querySelectorAll('textarea[id], input[id]')).some(el=>INPUT_NEVER.includes(el.id)&&el.id!=='sp-input'&&el.value);
  if(full.length>SHARE_MAX){copyText(base,'ข้อมูลยาวเกินใส่ในลิงก์ได้ คัดลอกเฉพาะลิงก์ของเครื่องมือ',src);return;}
  copyText(full,Object.keys(st.f).length?'คัดลอกลิงก์แล้ว ข้อมูลที่กรอกอยู่ในลิงก์ด้วย ส่งให้เฉพาะคนที่ควรเห็น'+(skipped?' (ไม่รวม token / secret)':''):'คัดลอกลิงก์ของเครื่องมือนี้แล้ว',src);
}
async function applyShareLink(){
  const hash=location.hash;
  const s=shareParse(hash,await shareJson(hash));
  if(!s)return;
  const root=document.getElementById(s.tab);
  if(!root||!root.classList.contains('tab-content'))return;
  openTab(null,s.tab); // TAB_INIT builds the tab's toggles, search boxes and explorers first
  const q=sel=>root.querySelector(sel);
  Object.entries(s.st.t).forEach(([id,i])=>{const b=root.querySelectorAll(`#${CSS.escape(id)} button`)[i];if(b&&!b.classList.contains('active'))b.click();});
  Object.entries(s.st.c).forEach(([id,v])=>{const el=q('#'+CSS.escape(id));if(el&&el.type==='checkbox'&&el.checked!==v){el.checked=v;el.dispatchEvent(new Event('change',{bubbles:true}));}});
  Object.entries(s.st.r).forEach(([name,v])=>{const el=[...root.querySelectorAll('input[type=radio]')].find(r=>r.name===name&&r.value===v);if(el&&!el.checked){el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));}});
  const fields=shareFields(root);
  Object.entries(s.st.f).forEach(([id,v])=>{const el=fields.find(f=>f.id===id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));}});
  Object.entries(s.st.x).forEach(([id,f])=>{if(_yx[id]&&root.contains(document.getElementById(id)))yxShow(id,f);});
  history.replaceState(null,'',location.pathname+location.search); // a reload goes back to the remembered state
  showToast('เปิดจากลิงก์ที่แชร์มา','info');
}
if(typeof window!=='undefined')addEventListener('hashchange',applyShareLink); // no window in the node tests

// ── FILE DROP ── a text file dropped onto a field fills it; dropped anywhere else it opens in the tool that
// understands it. "เปิดไฟล์" on the home page does the same for keyboard users.
const DROP_MAX=2*1024*1024;
// Pure: file name + content → detections, the name's hint first (Dockerfile, Jenkinsfile, .json, .properties, .sql)
function spDetectFile(name,text){
  const n=String(name).toLowerCase(),ext=n.includes('.')?n.split('.').pop():'';
  const hint=/^dockerfile/.test(n)?'dockerfile':/^jenkinsfile/.test(n)||ext==='groovy'?'jenkinsfile':{json:'json',properties:'props',sql:'sql'}[ext];
  const found=spDetect(text);
  if(!hint)return found;
  const rule=SP_RULES.find(r=>r[0]===hint);
  return[{kind:hint,label:rule?rule[1]:hint,tool:SP_OPEN[hint][0]}].concat(found.filter(d=>d.kind!==hint));
}
async function spReadFile(file){
  if(file.size>DROP_MAX){showToast('ไฟล์ใหญ่เกิน 2 MB เปิดได้เฉพาะไฟล์ข้อความขนาดไม่ใหญ่','warn');return null;}
  const text=await file.text();
  if(/\u0000/.test(text.slice(0,4096))){showToast('เปิดได้เฉพาะไฟล์ข้อความ ไฟล์นี้เป็นไฟล์ binary','warn');return null;}
  return text;
}
function spOpenFile(name,text){
  const hits=spDetectFile(name,text);
  if(hits.length){spOpen(hits[0].kind,text.trim());showToast(`เปิด ${name} ใน ${hits[0].tool}`,'info');return;}
  openTab(null,'home-tab');
  const el=document.getElementById('sp-input');
  el.value=text;spRender();el.focus();
  showToast('ไม่แน่ใจว่าเป็นไฟล์อะไร เลือกเครื่องมือจากหน้าแรก','info');
}
async function spPickFile(input){
  const f=input.files[0];input.value='';
  if(!f)return;
  if(f.type.startsWith('image/')){openTab(null,'qr-tab');qrDecodeBlob(f);return;}
  const text=await spReadFile(f);
  if(text!=null)spOpenFile(f.name,text);
}
(function(){
  if(typeof document==='undefined')return;
  let depth=0;
  const hasFiles=e=>Array.from(e.dataTransfer?.types||[]).includes('Files');
  const off=()=>{depth=0;document.body.classList.remove('file-drag');};
  document.addEventListener('dragenter',e=>{if(hasFiles(e)){depth++;document.body.classList.add('file-drag');}});
  document.addEventListener('dragleave',e=>{if(hasFiles(e)&&--depth<=0)off();});
  document.addEventListener('dragover',e=>{if(hasFiles(e))e.preventDefault();}); // allow the drop instead of navigating to the file
  document.addEventListener('drop',async e=>{
    off();
    if(e.defaultPrevented||!hasFiles(e))return; // a tool's own drop zone (image color picker) already took it
    e.preventDefault();
    const files=e.dataTransfer.files;
    if(!files.length)return;
    if(files.length>1)showToast('เปิดได้ทีละไฟล์ ใช้ไฟล์แรก','info');
    if(files[0].type.startsWith('image/')){openTab(null,'qr-tab');qrDecodeBlob(files[0]);return;}
    const field=e.target.closest&&e.target.closest('.tab-content textarea, .tab-content input[type="text"]');
    const text=await spReadFile(files[0]);
    if(text==null)return;
    if(field){field.value=text;field.dispatchEvent(new Event('input',{bubbles:true}));histPush(field);field.focus();showToast(`ใส่ ${files[0].name} แล้ว`);return;}
    spOpenFile(files[0].name,text);
  });
})();
