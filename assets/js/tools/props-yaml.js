// ── PROPERTIES ↔ YAML ── Quarkus application.properties <-> application.yaml (SmallRye Config conventions)
// %profile prefixes become a top-level "%dev" key, "quoted.segments" stay one key, and a key that is both a value
// and a parent (quarkus.http.cors=true + quarkus.http.cors.origins=...) uses the "~" key in YAML.
// ponytail: YAML side is a config-file subset (maps, lists, scalars, | and > blocks); anchors, aliases,
// multi-document files and nested flow maps aren't parsed. Pull in a YAML library if those show up.

// Pure: .properties text → [[key, value], ...] in file order (later duplicates win when converted)
function pyParseProps(text){
  const lines=String(text).replace(/\r/g,'').split('\n'),out=[];
  for(let i=0;i<lines.length;i++){
    let line=lines[i].replace(/^\s+/,'');
    if(!line||line[0]==='#'||line[0]==='!')continue;
    // a line ending in an odd number of backslashes continues on the next line
    while(pyTrailingSlashes(line)%2===1&&i+1<lines.length)line=line.slice(0,-1)+lines[++i].replace(/^\s+/,'');
    let key='',j=0;
    for(;j<line.length;j++){
      const ch=line[j];
      if(ch==='\\'){key+=line[j+1]===undefined?'':line[j+1];j++;continue;}
      if(ch==='='||ch===':'||ch===' '||ch==='\t')break;
      key+=ch;
    }
    const value=line.slice(j).replace(/^[ \t]*[=:]?[ \t]*/,'');
    out.push([key,pyUnescape(value)]);
  }
  return out;
}
function pyTrailingSlashes(s){let n=0;for(let i=s.length-1;i>=0&&s[i]==='\\';i--)n++;return n;}
function pyUnescape(s){
  return s.replace(/\\(u[0-9a-fA-F]{4}|.)/g,(m,c)=>c[0]==='u'&&c.length===5?String.fromCharCode(parseInt(c.slice(1),16)):({n:'\n',t:'\t',r:'\r',f:'\f'}[c]||c));
}
// split on dots outside double quotes: quarkus.rest-client."my.client".url → [quarkus, rest-client, "my.client", url]
function pySplitKey(k){
  const out=[];let cur='',q=false;
  for(const ch of k){
    if(ch==='"'){q=!q;cur+=ch;continue;}
    if(ch==='.'&&!q){out.push(cur);cur='';continue;}
    cur+=ch;
  }
  out.push(cur);
  return out;
}
function pyYamlKey(seg){
  const s=seg.replace(/^"(.*)"$/,'$1');
  return s===''||/[:#{}[\],&*!|>'"%@`\s.]/.test(s)||/^[-?~]/.test(s)?JSON.stringify(s):s;
}
function pyYamlVal(v){
  if(v==='')return '""';
  if(/^\s|\s$/.test(v)||/^[-?:,[\]{}#&*!|>'"%@`]/.test(v)||/: |\s#|\n/.test(v))return JSON.stringify(v);
  return v;
}
// Pure: .properties text → YAML text
function pyPropsToYaml(text){
  const root={kids:new Map()};
  for(const[key,val]of pyParseProps(text)){
    let n=root;
    for(const seg of pySplitKey(key)){
      if(!n.kids.has(seg))n.kids.set(seg,{kids:new Map()});
      n=n.kids.get(seg);
    }
    n.val=val;
  }
  const out=[];
  (function emit(node,pad){
    for(const[seg,child]of node.kids){
      const k=pyYamlKey(seg);
      if(!child.kids.size){out.push(`${pad}${k}: ${pyYamlVal(child.val)}`);continue;}
      out.push(`${pad}${k}:`);
      if(child.val!==undefined)out.push(`${pad}  ~: ${pyYamlVal(child.val)}`);
      emit(child,pad+'  ');
    }
  })(root,'');
  return out.join('\n');
}

function pyStripComment(s){
  let q=null;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(q){if(ch===q&&s[i-1]!=='\\')q=null;continue;}
    if(ch==='"'||ch==="'"){q=ch;continue;}
    if(ch==='#'&&(i===0||/\s/.test(s[i-1])))return s.slice(0,i).replace(/\s+$/,'');
  }
  return s.replace(/\s+$/,'');
}
function pyUnquote(v){
  v=v.trim();
  if(v.startsWith('"')&&v.endsWith('"')&&v.length>1){try{return JSON.parse(v);}catch(e){return v.slice(1,-1);}}
  if(v.startsWith("'")&&v.endsWith("'")&&v.length>1)return v.slice(1,-1).replace(/''/g,"'");
  return v;
}
function pyPropsKey(path){
  let k='';
  for(const seg of path){
    if(seg==='~')continue;                         // value of the parent key
    if(/^\[\d+\]$/.test(seg)){k+=seg;continue;}    // list index sticks to the previous segment
    const s=seg.includes('.')?`"${seg}"`:seg;
    k+=(k?'.':'')+s;
  }
  return k.replace(/([ :=])/g,'\\$1');
}
function pyPropsVal(v){return String(v).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/^ /,'\\ ');}
// Pure: YAML text → .properties text
function pyYamlToProps(text){
  const lines=String(text).replace(/\r/g,'').split('\n');
  const out=[],lists=new Map();
  const stack=[{indent:-1,path:[]}];
  const top=()=>stack[stack.length-1];
  function keyLine(body,indent,i){
    const m=body.match(/^("(?:[^"\\]|\\.)*"|'[^']*'|[^:]+?)\s*:(?:\s+(.*))?$/);
    if(!m)throw new Error(`บรรทัด ${i+1}: อ่านไม่ออก "${body}"`);
    while(top().indent>=indent)stack.pop();
    const path=[...top().path,pyUnquote(m[1])];
    const raw=(m[2]||'').trim();
    if(raw===''){stack.push({indent,path});return i;}
    if(/^[|>][-+]?$/.test(raw)){                     // block scalar
      const block=[];let j=i+1,inner=null;
      while(j<lines.length&&(!lines[j].trim()||lines[j].match(/^ */)[0].length>indent)){
        if(lines[j].trim()&&inner===null)inner=lines[j].match(/^ */)[0].length;
        block.push(lines[j].slice(inner||0));j++;
      }
      while(block.length&&!block[block.length-1].trim())block.pop();
      out.push([path,raw[0]==='|'?block.join('\n'):block.join(' ').replace(/\s+/g,' ').trim()]);
      return j-1;
    }
    if(raw.startsWith('[')&&raw.endsWith(']')){
      out.push([path,raw.slice(1,-1).split(',').map(x=>pyUnquote(x).replace(/,/g,'\\,')).filter(x=>x!=='').join(',')]);
      return i;
    }
    out.push([path,pyUnquote(raw)]);
    return i;
  }
  for(let i=0;i<lines.length;i++){
    const line=pyStripComment(lines[i]);
    if(!line.trim()||/^(---|\.\.\.)\s*$/.test(line.trim()))continue;
    const indent=line.match(/^ */)[0].length;
    const body=line.trim();
    if(body==='-'||body.startsWith('- ')){
      // also leave the previous map item of this same list
      while(top().indent>indent||(top().indent===indent&&top().item))stack.pop();
      const owner=top().path,ok=owner.join('\u0000');
      if(!lists.has(ok)){const entry=[owner,null];out.push(entry);lists.set(ok,{entry,items:[],objs:0});}
      const list=lists.get(ok),rest=body.slice(1).trim();
      if(/^("(?:[^"\\]|\\.)*"|'[^']*'|[^:"']+?)\s*:(\s|$)/.test(rest)){   // "- key: value" starts a map item
        const idx=list.objs++;
        stack.push({indent,path:[...owner,`[${idx}]`],item:true});
        i=keyLine(rest,indent+2,i);
      }else if(rest){
        list.items.push(pyUnquote(rest).replace(/,/g,'\\,'));
      }
      continue;
    }
    i=keyLine(body,indent,i);
  }
  for(const l of lists.values())l.entry[1]=l.items.length?l.items.join(','):undefined;
  return out.filter(([,v])=>v!==undefined&&v!==null).map(([p,v])=>`${pyPropsKey(p)}=${pyPropsVal(v)}`).join('\n');
}

// ── UI ──
const PY_SAMPLE=`# HTTP
quarkus.http.port=8080
quarkus.http.root-path=/api
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:4200,https://ewfund.example.go.th

# DB2
quarkus.datasource.db-kind=db2
quarkus.datasource.jdbc.url=jdbc:db2://localhost:50000/EWFUND:currentSchema=EWFUND;
quarkus.datasource.jdbc.max-size=30

# REST client
quarkus.rest-client."report-api".url=http://cdgs-framework-report-api/framework-report-api
quarkus.rest-client."report-api".read-timeout=120000

# profile
%dev.quarkus.log.level=DEBUG
%local.quarkus.datasource.jdbc.url=jdbc:db2://127.0.0.1:50001/EWFUND`;
let _pyDir='p2y',_pyTimer=0;
function pySetDir(d){
  _pyDir=d;
  document.querySelectorAll('#py-dir .json-view-btn').forEach(b=>{const on=b.dataset.d===d;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.getElementById('py-in-label').textContent=d==='p2y'?'application.properties':'application.yaml';
  document.getElementById('py-out-label').textContent=d==='p2y'?'application.yaml':'application.properties';
  pyConvert();
}
function pySwap(){
  const out=document.getElementById('py-output').textContent;
  pySetDir(_pyDir==='p2y'?'y2p':'p2y');
  if(out){document.getElementById('py-input').value=out;pyConvert();}
}
function pySample(){
  pySetDir('p2y');
  document.getElementById('py-input').value=PY_SAMPLE;
  pyConvert();
}
function pyLive(){clearTimeout(_pyTimer);_pyTimer=setTimeout(pyConvert,250);}
function pyConvert(){
  const src=document.getElementById('py-input').value;
  const out=document.getElementById('py-output'),err=document.getElementById('py-error');
  err.hidden=true;
  if(!src.trim()){out.textContent='';return;}
  try{
    out.className='language-'+(_pyDir==='p2y'?'yaml':'properties');
    out.textContent=_pyDir==='p2y'?pyPropsToYaml(src):pyYamlToProps(src);
    out.removeAttribute('data-highlighted');
    highlightCode('#py-output');
  }catch(e){
    err.hidden=false;
    err.innerHTML=`${ic('triangle-alert')} ${escHtml(e.message)}`;
  }
}
