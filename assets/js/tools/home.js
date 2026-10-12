// ── HOME ── smart paste, recent tools, favorites and the full tool list

// Smart paste: [kind, label, test]. Order matters: the first hits are the most specific.
// Each kind opens a tool through SP_OPEN below; a text can match several kinds (13 digits: Thai ID and ms timestamp).
const SP_RULES=[
  ['jwt','JWT token',t=>/^(Bearer\s+)?eyJ[\w-]+\.eyJ[\w-]+\.[\w-]*$/.test(t)],
  ['stacktrace','Java stack trace',t=>/\n\s*at\s+[\w$.<>\/-]+\([^)]*\)/.test(t)||/^(Caused by:|Exception in thread )/m.test(t)],
  ['k8s-secret','Kubernetes Secret',t=>/^\s*kind:\s*Secret\b/m.test(t)&&/^\s*(data|stringData):/m.test(t)],
  ['k8s-yaml','Kubernetes manifest',t=>/^apiVersion:\s*\S+/m.test(t)&&/^kind:\s*\w+/m.test(t)&&!/^\s*kind:\s*Secret\b/m.test(t)],
  ['jenkinsfile','Jenkinsfile',t=>/^\s*@Library\(/m.test(t)||/^\s*(pipeline|node)\s*(\(.*\))?\s*\{/m.test(t)&&/\bstages?\s*[({]/.test(t)],
  ['dockerfile','Dockerfile',t=>/^FROM\s+\S+/im.test(t)&&/^(RUN|COPY|ENTRYPOINT|CMD|WORKDIR)\s/im.test(t)],
  ['json','JSON',t=>/^[[{]/.test(t)&&spIsJson(t)],
  ['sql-java','SQL ใน Java / MyBatis',t=>/(StringBuilder|\.append\s*\(|"""|@Query|prepareStatement|<(select|insert|update|delete)\b)/i.test(t)&&/\b(select|insert|update|delete)\b/i.test(t)],
  ['sql','SQL',t=>/^\s*(select|insert|update|delete|with|merge)\b/i.test(t)],
  ['db2code','DB2 SQLCODE',t=>/SQLCODE\s*=\s*-?\d+/i.test(t)||/^[-+]\d{3,5}$/.test(t)],
  ['exception','Java exception',t=>/^([a-z_$][\w$]*\.)*[A-Z][\w$]*(Exception|Error)$/.test(t)],
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
  out.innerHTML=`<span class="sp-label">${head}</span><span class="sp-acts">`
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
function homeRender(){
  const rec=document.getElementById('home-recent'),fav=document.getElementById('home-fav');
  if(!rec)return;
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
