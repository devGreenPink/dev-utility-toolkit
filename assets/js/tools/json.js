// ── JSON ──
let jsonLiveMode=true;
let currentJsonView='editor';
function switchJsonView(mode){
  currentJsonView=mode;
  ['editor','tree','split'].forEach(m=>{
    document.getElementById('json-'+m+'-pane').style.display=m===mode?'block':'none';
    document.getElementById('json-btn-'+m).classList.toggle('active',m===mode);
  });
  if(mode==='tree'||mode==='split')refreshJsonTree();
}
function toggleJsonLive(){jsonLiveMode=document.getElementById('json-live').checked;}
function onJsonInput(){
  const txt = document.getElementById('json-input');
  syncLineNumbers('json-input', 'json-gutter');
  const errEl=document.getElementById('json-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  if(txt.value.trim() === '') return;
  if(jsonLiveMode){
    try{
      JSON.parse(txt.value);
    } catch(e){
      renderJsonError(e, txt.value, 'json-error');
    }
  }
  if(currentJsonView==='tree')refreshJsonTree();
  runJsonPath();
}
function onJsonSplitInput(){
  const src=document.getElementById('json-input-split').value;
  syncLineNumbers('json-input-split', 'json-split-gutter');
  const errEl=document.getElementById('json-split-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  document.getElementById('json-input').value=src;
  syncLineNumbers('json-input', 'json-gutter');
  try{
    const obj=JSON.parse(src);
    document.getElementById('json-tree-split').innerHTML='';
    document.getElementById('json-tree-split').appendChild(buildTree(obj,null,0));
  }catch(e){
    renderJsonError(e, src, 'json-split-error');
    document.getElementById('json-tree-split').innerHTML='';
  }
}
function formatJSON(sp){
  const txt = document.getElementById('json-input');
  const errEl=document.getElementById('json-error');
  errEl.style.display='none';
  errEl.innerHTML='';
  try{
    const val=JSON.stringify(JSON.parse(txt.value),null,sp||undefined);
    txt.value=val;
    syncLineNumbers('json-input', 'json-gutter');
    if(currentJsonView==='split'){
      document.getElementById('json-input-split').value=val;
      syncLineNumbers('json-input-split', 'json-split-gutter');
      onJsonSplitInput();
    }
    refreshJsonTree();runJsonPath();
  }catch(e){
    renderJsonError(e, txt.value, 'json-error');
    showToast('Invalid JSON ❌');
  }
}
function formatJSONSplit(sp){
  const txt = document.getElementById('json-input-split');
  try{
    const val=JSON.stringify(JSON.parse(txt.value),null,sp||undefined);
    txt.value=val;
    syncLineNumbers('json-input-split', 'json-split-gutter');
    onJsonSplitInput();
  }catch(e){
    renderJsonError(e, txt.value, 'json-split-error');
    showToast('Invalid JSON ❌');
  }
}
function clearJSON(){
  document.getElementById('json-input').value='';
  document.getElementById('json-error').style.display='none';
  document.getElementById('json-error').innerHTML='';
  document.getElementById('jsonpath-input').value='';
  document.getElementById('jsonpath-result').style.display='none';
  document.getElementById('json-tree-output').innerHTML='';
  document.getElementById('json-tree-stats').textContent='';
  if(document.getElementById('json-input-split'))document.getElementById('json-input-split').value='';
  if(document.getElementById('json-tree-split'))document.getElementById('json-tree-split').innerHTML='';
  syncLineNumbers('json-input', 'json-gutter');
  syncLineNumbers('json-input-split', 'json-split-gutter');
}
// ── JSON LINE NUMBERS & RICH ERROR RENDERERS ──
function syncLineNumbers(txtId, gutId) {
  const txt = document.getElementById(txtId);
  const gut = document.getElementById(gutId);
  if (!txt || !gut) return;
  const lines = txt.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += `<div>${i}</div>`;
  }
  gut.innerHTML = html;
  gut.scrollTop = txt.scrollTop;
}
function initJsonLineNumbers() {
  const pairs = [
    { txt: 'json-input', gut: 'json-gutter' },
    { txt: 'json-input-split', gut: 'json-split-gutter' }
  ];
  pairs.forEach(p => {
    const txt = document.getElementById(p.txt);
    const gut = document.getElementById(p.gut);
    if (!txt || !gut) return;
    const update = () => syncLineNumbers(p.txt, p.gut);
    txt.addEventListener('input', update);
    txt.addEventListener('scroll', () => { gut.scrollTop = txt.scrollTop; });
    txt.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = txt.selectionStart;
        const end = txt.selectionEnd;
        const val = txt.value;
        txt.value = val.substring(0, start) + '  ' + val.substring(end);
        txt.selectionStart = txt.selectionEnd = start + 2;
        txt.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    update();
  });
}
function renderJsonError(error, jsonText, elementId) {
  const errEl = document.getElementById(elementId);
  if (!errEl) return;
  if (!jsonText || !error) {
    errEl.style.display = 'none';
    errEl.innerHTML = '';
    return;
  }
  let lineNum = null;
  let colNum = null;
  const lineColMatch = error.message.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    lineNum = parseInt(lineColMatch[1], 10);
    colNum = parseInt(lineColMatch[2], 10);
  } else {
    const posMatch = error.message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const linesBefore = jsonText.substring(0, pos).split('\n');
      lineNum = linesBefore.length;
      colNum = linesBefore[linesBefore.length - 1].length + 1;
    }
  }
  let html = '';
  if (lineNum !== null) {
    const lines = jsonText.split('\n');
    const start = Math.max(0, lineNum - 3);
    const end = Math.min(lines.length - 1, lineNum + 1);
    let contextHtml = '';
    for (let i = start; i <= end; i++) {
      const isErrorLine = (i === lineNum - 1);
      const lineStr = String(i + 1).padStart(5, ' ');
      const content = escHtml(lines[i]);
      if (isErrorLine) {
        contextHtml += `<span class="json-error-line-active">${lineStr} | ${content}</span>`;
        if (colNum !== null && colNum > 0) {
          const padding = ' '.repeat(colNum - 1 + 8);
          contextHtml += `<span class="json-error-pointer">${padding}^ ${escHtml(error.message.split(' at ')[0])}</span>\n`;
        }
      } else {
        contextHtml += `${lineStr} | ${content}\n`;
      }
    }
    html = `
      <div class="json-error-card">
        <div class="json-error-title">⚠️ JSON รูปแบบไม่ถูกต้อง (บรรทัดที่ ${lineNum}, คอลัมน์ที่ ${colNum})</div>
        <div class="json-error-context">${contextHtml}</div>
      </div>
    `;
  } else {
    html = `
      <div class="json-error-card">
        <div class="json-error-title">⚠️ JSON รูปแบบไม่ถูกต้อง</div>
        <div style="font-family:var(--mono); font-size:.76rem; color:var(--text); margin-top: 4px;">${escHtml(error.message)}</div>
      </div>
    `;
  }
  errEl.innerHTML = html;
  errEl.style.display = 'block';
}
function refreshJsonTree(){
  const src=document.getElementById('json-input').value.trim();
  const outEl=document.getElementById('json-tree-output');
  const statsEl=document.getElementById('json-tree-stats');
  if(!src){outEl.innerHTML='';statsEl.textContent='';return;}
  try{
    const obj=JSON.parse(src);
    outEl.innerHTML='';
    const tree=buildTree(obj,null,0,true);
    outEl.appendChild(tree);
    const keys=countKeys(obj);
    statsEl.textContent=`${keys.total} nodes · depth ${keys.depth}`;
  }catch(e){outEl.innerHTML=`<span style="color:var(--danger);">⚠ ${escHtml(e.message)}</span>`;statsEl.textContent='';}
}
function countKeys(obj,d=0){
  if(obj===null||typeof obj!=='object')return{total:1,depth:d};
  let total=0,maxD=d;
  for(const v of Object.values(obj)){const r=countKeys(v,d+1);total+=r.total;maxD=Math.max(maxD,r.depth);}
  return{total:total+1,depth:maxD};
}
function buildTree(val,key,depth,isRoot){
  const wrap=document.createElement('div');
  wrap.className='tree-node'+(isRoot?' root-node':'');
  const type=val===null?'null':Array.isArray(val)?'array':typeof val;
  const isComplex=type==='object'||type==='array';
  const line=document.createElement('div');line.className='tree-line';
  if(isComplex){
    const toggle=document.createElement('span');toggle.className='tree-toggle';toggle.textContent='▼';
    toggle.onclick=function(){const ch=wrap.querySelector(':scope > .tree-children');const collapsed=ch.classList.toggle('collapsed');toggle.textContent=collapsed?'▶':'▼';};
    line.appendChild(toggle);
  }
  if(key!==null){const keyEl=document.createElement('span');keyEl.className='tree-key';keyEl.textContent=JSON.stringify(key)+':';line.appendChild(keyEl);}
  if(isComplex){
    const len=Array.isArray(val)?val.length:Object.keys(val).length;
    const openBracket=document.createElement('span');openBracket.className='tree-bracket';openBracket.textContent=Array.isArray(val)?'[':'{';line.appendChild(openBracket);
    const cnt=document.createElement('span');cnt.className='tree-count';cnt.textContent=Array.isArray(val)?len+' items':len+' keys';line.appendChild(cnt);
    const copyBtn=document.createElement('button');copyBtn.className='tree-copy-btn';copyBtn.textContent='copy';
    copyBtn.onclick=e=>{e.stopPropagation();copyText(JSON.stringify(val,null,2));};
    line.appendChild(copyBtn);wrap.appendChild(line);
    const children=document.createElement('div');children.className='tree-children';
    const entries=Array.isArray(val)?val.map((v,i)=>[i,v]):Object.entries(val);
    for(const[k,v]of entries)children.appendChild(buildTree(v,k,depth+1,false));
    const closeLine=document.createElement('div');closeLine.className='tree-line';
    const closeBracket=document.createElement('span');closeBracket.className='tree-bracket';closeBracket.textContent=Array.isArray(val)?']':'}';
    closeLine.appendChild(closeBracket);children.appendChild(closeLine);wrap.appendChild(children);
  }else{
    const colon=document.createElement('span');colon.className='tree-colon';colon.textContent='';
    const valEl=document.createElement('span');
    if(type==='string'){valEl.className='tree-val-string';valEl.textContent=JSON.stringify(val);}
    else if(type==='number'){valEl.className='tree-val-number';valEl.textContent=val;}
    else if(type==='boolean'){valEl.className='tree-val-boolean';valEl.textContent=val;}
    else{valEl.className='tree-val-null';valEl.textContent='null';}
    const copyBtn=document.createElement('button');copyBtn.className='tree-copy-btn';copyBtn.textContent='copy';
    copyBtn.onclick=e=>{e.stopPropagation();copyText(type==='string'?val:String(val));};
    line.appendChild(colon);line.appendChild(valEl);line.appendChild(copyBtn);wrap.appendChild(line);
  }
  return wrap;
}
function jsonTreeExpandAll(){document.querySelectorAll('#json-tree-output .tree-children').forEach(el=>el.classList.remove('collapsed'));document.querySelectorAll('#json-tree-output .tree-toggle').forEach(el=>el.textContent='▼');}
function jsonTreeCollapseAll(){document.querySelectorAll('#json-tree-output .tree-children').forEach(el=>el.classList.add('collapsed'));document.querySelectorAll('#json-tree-output .tree-toggle').forEach(el=>el.textContent='▶');}

// JSONPath
function runJsonPath(){
  const path=document.getElementById('jsonpath-input').value.trim();
  const el=document.getElementById('jsonpath-result');
  if(!path){el.style.display='none';return;}
  el.style.display='block';
  try{
    const obj=JSON.parse(document.getElementById('json-input').value);
    const results=jsonPathQuery(obj,path);
    el.textContent=results.length===1?JSON.stringify(results[0],null,2):JSON.stringify(results,null,2);
  }catch(e){el.textContent='⚠ '+e.message;}
}
function jsonPathQuery(root,path){
  if(!path||path==='$')return[root];
  let clean=path.startsWith('$')?path.slice(1):path;
  const tokens=[];
  const re=/\['([^']*)'\]|\["([^"]*)"\]|\[(\d+|\*)\]|\.\.([a-zA-Z_$*][a-zA-Z0-9_$]*)|\[(\d+|\*)\]|\.([a-zA-Z_$*][a-zA-Z0-9_$]*)/g;
  let m;
  while((m=re.exec(clean))!==null){
    if(m[1]!==undefined)tokens.push({type:'key',key:m[1]});
    else if(m[2]!==undefined)tokens.push({type:'key',key:m[2]});
    else if(m[3]!==undefined)tokens.push({type:m[3]==='*'?'wild':'index',index:parseInt(m[3])});
    else if(m[4]!==undefined)tokens.push({type:m[4]==='*'?'wild':'recursive',key:m[4]});
    else if(m[5]!==undefined)tokens.push({type:m[5]==='*'?'wild':'index',index:parseInt(m[5])});
    else if(m[6]!==undefined)tokens.push({type:m[6]==='*'?'wild':'key',key:m[6]});
  }
  function step(nodes,token){
    const results=[];
    for(const node of nodes){
      if(token.type==='key'){if(node&&typeof node==='object'&&!Array.isArray(node)&&node[token.key]!==undefined)results.push(node[token.key]);}
      else if(token.type==='index'){if(Array.isArray(node)&&node[token.index]!==undefined)results.push(node[token.index]);}
      else if(token.type==='wild'){if(Array.isArray(node))results.push(...node);else if(node&&typeof node==='object')results.push(...Object.values(node));}
      else if(token.type==='recursive'){
        (function recurse(n){
          if(!n||typeof n!=='object')return;
          if(n[token.key]!==undefined)results.push(n[token.key]);
          for(const v of Object.values(n))recurse(v);
        })(node);
      }
    }
    return results;
  }
  let nodes=[root];
  for(const t of tokens)nodes=step(nodes,t);
  return nodes;
}
