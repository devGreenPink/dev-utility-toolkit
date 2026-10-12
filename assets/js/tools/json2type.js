// ── JSON → TYPE ── infer TypeScript interfaces / Java records from sample JSON
// Arrays of objects are merged: a key missing from some items becomes optional, null makes it nullable.

// Pure: value → type descriptor {k:'null'|'bool'|'int'|'float'|'str'|'arr'|'obj'|'any'|'unknown', ...}
function j2tInfer(v){
  if(v===null)return{k:'null'};
  if(Array.isArray(v))return{k:'arr',of:v.reduce((acc,x)=>j2tMerge(acc,j2tInfer(x)),{k:'unknown'})};
  switch(typeof v){
    case 'boolean':return{k:'bool'};
    case 'number':return Number.isInteger(v)?{k:'int',big:Math.abs(v)>2147483647}:{k:'float'};
    case 'string':return{k:'str',fmt:
      /^\d{4}-\d{2}-\d{2}$/.test(v)?'date':
      /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/.test(v)?'offset':
      /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(v)?'datetime':null};
    case 'object':{
      const fields={};
      for(const[k,x]of Object.entries(v))fields[k]={t:j2tInfer(x),opt:false};
      return{k:'obj',fields};
    }
  }
  return{k:'any'};
}
function j2tMerge(a,b){
  if(a.k==='unknown')return b;
  if(b.k==='unknown')return a;
  if(a.k==='null'&&b.k==='null')return a;
  if(a.k==='null')return{...b,nullable:true};
  if(b.k==='null')return{...a,nullable:true};
  const nullable=!!(a.nullable||b.nullable);
  const nb=x=>nullable?{...x,nullable:true}:x;
  if(a.k===b.k){
    if(a.k==='int')return nb({k:'int',big:a.big||b.big});
    if(a.k==='str')return nb({k:'str',fmt:a.fmt===b.fmt?a.fmt:null});
    if(a.k==='arr')return nb({k:'arr',of:j2tMerge(a.of,b.of)});
    if(a.k==='obj'){
      const fields={};
      for(const key of new Set([...Object.keys(a.fields),...Object.keys(b.fields)])){
        const fa=a.fields[key],fb=b.fields[key];
        fields[key]=fa&&fb?{t:j2tMerge(fa.t,fb.t),opt:fa.opt||fb.opt}:{t:(fa||fb).t,opt:true};
      }
      return nb({k:'obj',fields});
    }
    return nb({k:a.k});
  }
  if((a.k==='int'&&b.k==='float')||(a.k==='float'&&b.k==='int'))return nb({k:'float'});
  return nb({k:'any'});
}
function j2tPascal(s){
  const p=String(s).replace(/[^A-Za-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join('');
  return !p?'Item':/^[A-Za-z]/.test(p)?p:'T'+p;
}
function j2tCamel(s){const p=j2tPascal(s);return p[0].toLowerCase()+p.slice(1);}
function j2tSingular(n){
  if(/ies$/.test(n))return n.slice(0,-3)+'y';
  if(/(ses|xes|ches|shes)$/.test(n))return n.slice(0,-2);
  if(/s$/.test(n)&&!/ss$/.test(n))return n.slice(0,-1);
  return n+'Item';
}
const J2T_JAVA_RESERVED=new Set('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while record var yield'.split(' '));

// Pure: json text → source code. opts: {root, lang:'ts'|'java', bigDecimal}
function j2tGenerate(json,opts){
  const o=Object.assign({root:'Root',lang:'ts',bigDecimal:true},opts);
  let t=j2tInfer(JSON.parse(json));
  if(t.k==='arr')t=t.of;                      // a sample array describes its items
  const defs=[],bySig=new Map(),names=new Set(),imports=new Set();
  const ts=o.lang==='ts';
  function named(base,build){
    // reserve the name first so the root stays on top (pre-order)
    let name=base,i=2;
    while(names.has(name))name=base+i++;
    names.add(name);
    const slot=defs.push(null)-1;
    const body=build(name);
    const sig=body.replace(new RegExp('\\b'+name+'\\b','g'),'#');
    if(bySig.has(sig)){defs.splice(slot,1);names.delete(name);return bySig.get(sig);} // identical shape: reuse
    bySig.set(sig,name);
    defs[slot]=body;
    return name;
  }
  function typeName(t,hint){
    let s;
    switch(t.k){
      case 'bool':s=ts?'boolean':'Boolean';break;
      case 'int':s=ts?'number':(t.big?'Long':'Integer');break;
      case 'float':if(ts)s='number';else if(o.bigDecimal){imports.add('java.math.BigDecimal');s='BigDecimal';}else s='Double';break;
      case 'str':
        if(ts||!t.fmt)s=ts?'string':'String';
        else{const j={date:'LocalDate',datetime:'LocalDateTime',offset:'OffsetDateTime'}[t.fmt];imports.add('java.time.'+j);s=j;}
        break;
      case 'arr':{
        const inner=typeName(t.of,j2tSingular(hint));
        if(ts)s=/[|]/.test(inner)?`(${inner})[]`:`${inner}[]`;
        else{imports.add('java.util.List');s=`List<${inner}>`;}
        break;
      }
      case 'obj':s=named(j2tPascal(hint),name=>emitObj(name,t));break;
      case 'null':s=ts?'null':'Object';break;
      default:s=ts?'unknown':'Object';
    }
    return ts&&t.nullable&&t.k!=='null'?`${s} | null`:s;
  }
  function emitObj(name,t){
    const rows=Object.entries(t.fields).map(([key,f])=>{
      const type=typeName(f.t,key);
      if(ts){
        const k=/^[A-Za-z_$][\w$]*$/.test(key)?key:JSON.stringify(key);
        return `  ${k}${f.opt?'?':''}: ${type};`;
      }
      let id=j2tCamel(key);
      if(J2T_JAVA_RESERVED.has(id))id+='Value';
      const ann=id!==key?(imports.add('com.fasterxml.jackson.annotation.JsonProperty'),`@JsonProperty(${JSON.stringify(key)}) `):'';
      return `    ${ann}${type} ${id}`;
    });
    if(ts)return `export interface ${name} {\n${rows.join('\n')}\n}`;
    return rows.length?`public record ${name}(\n${rows.join(',\n')}\n) {}`:`public record ${name}() {}`;
  }
  const rootName=j2tPascal(o.root);
  if(t.k!=='obj'){
    const type=typeName(t,o.root);
    return ts?`export type ${rootName} = ${type};`:`// ${rootName}: ${type}`;
  }
  typeName(t,o.root);
  const head=!ts&&imports.size?[...imports].sort().map(i=>`import ${i};`).join('\n')+'\n\n':'';
  return head+defs.filter(Boolean).join('\n\n');
}

// ── UI ──
const J2T_SAMPLE=`{
  "id": 1024,
  "citizen_id": "1103700012345",
  "name": "สมชาย ใจดี",
  "birthDate": "1990-05-14",
  "salary": 35500.5,
  "active": true,
  "address": { "province": "ขอนแก่น", "zipCode": "40000" },
  "orders": [
    { "orderNo": "SO-001", "amount": 1200, "paidAt": "2026-10-01T09:30:00" },
    { "orderNo": "SO-002", "amount": 850.75, "paidAt": null, "note": "ส่งด่วน" }
  ]
}`;
let _j2tLang='ts',_j2tTimer=0;
function j2tSetLang(l){
  _j2tLang=l;
  document.querySelectorAll('#j2t-lang .json-view-btn').forEach(b=>{const on=b.dataset.l===l;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  document.getElementById('j2t-bd-wrap').hidden=l!=='java';
  j2tConvert();
}
function j2tSample(){document.getElementById('j2t-input').value=J2T_SAMPLE;j2tConvert();}
function j2tLive(){clearTimeout(_j2tTimer);_j2tTimer=setTimeout(j2tConvert,250);}
function j2tConvert(){
  const src=document.getElementById('j2t-input').value;
  const out=document.getElementById('j2t-output'),err=document.getElementById('j2t-error');
  if(!src.trim()){out.textContent='';out.removeAttribute('data-highlighted');err.hidden=true;return;}
  try{
    const code=j2tGenerate(src,{root:document.getElementById('j2t-root').value||'Root',lang:_j2tLang,bigDecimal:document.getElementById('j2t-bd').checked});
    out.className='language-'+(_j2tLang==='ts'?'typescript':'java');
    out.textContent=code;
    out.removeAttribute('data-highlighted');
    highlightCode('#j2t-output');
    err.hidden=true;
  }catch(e){
    err.hidden=false;
    err.innerHTML=`${ic('triangle-alert')} JSON ไม่ถูกต้อง: ${escHtml(e.message)}`;
  }
}
