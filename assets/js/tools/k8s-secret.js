// ── K8S SECRET DECODER ──
// Line-based reader for Secret YAML (or `kubectl get secret -o json`): data/stringData maps,
// quoted values, |/> block scalars, multi-doc ---. ponytail: not a full YAML parser (no flow maps/anchors).
function k8sParseSecrets(src){
  src=src.trim();
  if(src.startsWith('{')){
    const j=JSON.parse(src);
    return (j.items||[j]).map(s=>({name:s.metadata?.name||'',data:s.data||{},stringData:s.stringData||{}}));
  }
  return src.split(/^---.*$/m).map(doc=>{
    const lines=doc.split(/\r?\n/);const out={name:'',data:{},stringData:{}};
    let sect=null,sectIndent=0,inMeta=false;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];if(!line.trim()||/^\s*#/.test(line))continue;
      const ind=line.match(/^\s*/)[0].length;
      if(sect&&ind<=sectIndent)sect=null;
      if(ind===0)inMeta=/^metadata:\s*$/.test(line);
      const m=line.match(/^\s*([^:#]+?):\s*(.*)$/);if(!m)continue;
      const key=m[1].replace(/^["']|["']$/g,'');let val=m[2].replace(/\s+#.*$/,'');
      if(!sect){
        if(inMeta&&ind>0&&key==='name'&&!out.name)out.name=val.replace(/^["']|["']$/g,'');
        if((key==='data'||key==='stringData')&&!val){sect=key;sectIndent=ind;}
        continue;
      }
      if(/^[|>][-+]?$/.test(val)){
        const block=[];let bi=-1;
        while(i+1<lines.length){
          const nx=lines[i+1];const ni=nx.match(/^\s*/)[0].length;
          if(nx.trim()&&ni<=ind)break;
          if(bi<0&&nx.trim())bi=ni;
          block.push(nx.slice(bi<0?0:bi));i++;
        }
        while(block.length&&!block[block.length-1].trim())block.pop();
        val=val[0]==='>'?block.join(' '):block.join('\n')+(val.endsWith('-')?'':'\n');
      }else if(/^".*"$/.test(val)){try{val=JSON.parse(val);}catch(e){val=val.slice(1,-1);}}
      else if(/^'.*'$/.test(val))val=val.slice(1,-1).replace(/''/g,"'");
      out[sect][key]=val;
    }
    return out;
  }).filter(s=>Object.keys(s.data).length||Object.keys(s.stringData).length);
}
function k8sB64Decode(b64){
  const bin=atob(b64.replace(/\s+/g,''));const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  try{return{text:new TextDecoder('utf-8',{fatal:true}).decode(bytes)};}
  catch(e){return{binary:true,text:`(binary ${bytes.length} bytes)`};}
}
let _k8sRows=[];
function decodeK8sSecret(){
  const errEl=document.getElementById('k8s-error'),outEl=document.getElementById('k8s-output');
  errEl.style.display='none';_k8sRows=[];
  try{
    const secrets=k8sParseSecrets(document.getElementById('k8s-input').value);
    if(!secrets.length)throw new Error('ไม่พบ data: หรือ stringData: ใน input');
    for(const s of secrets){
      for(const[k,v]of Object.entries(s.data)){
        try{const d=k8sB64Decode(String(v));_k8sRows.push({secret:s.name,key:k,value:d.text,binary:d.binary});}
        catch(e){_k8sRows.push({secret:s.name,key:k,value:'(invalid Base64)',binary:true});}
      }
      for(const[k,v]of Object.entries(s.stringData))_k8sRows.push({secret:s.name,key:k,value:String(v),note:'stringData'});
    }
    const multi=secrets.length>1;
    outEl.innerHTML=_k8sRows.map((r,i)=>`<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span class="field-label">${multi?escHtml(r.secret)+' / ':''}${escHtml(r.key)}${r.note?' <span style="opacity:.6">('+r.note+')</span>':''}</span>
        ${r.binary?'':`<button class="btn btn-ghost" onclick="copyText(_k8sRows[${i}].value)">Copy</button>`}
      </div>
      <div class="output-mono" style="white-space:pre-wrap;word-break:break-all">${escHtml(r.value)}</div></div>`).join('');
  }catch(e){outEl.innerHTML='';errEl.textContent='Error: '+e.message;errEl.style.display='block';}
}
function copyK8sEnv(){
  const rows=_k8sRows.filter(r=>!r.binary);if(!rows.length)return;
  copyText(rows.map(r=>`${r.key}=${/[\s"'#$\\]/.test(r.value)?JSON.stringify(r.value):r.value}`).join('\n'));
}
function clearK8sSecret(){document.getElementById('k8s-input').value='';document.getElementById('k8s-output').innerHTML='';document.getElementById('k8s-error').style.display='none';_k8sRows=[];}
