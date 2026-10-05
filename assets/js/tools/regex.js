// ── REGEX ──
function loadRegex(pat,flags){document.getElementById('regex-pattern').value=pat;document.getElementById('regex-flags').value=flags||'g';runRegex();}
function runRegex(){
  const patStr=document.getElementById('regex-pattern').value;
  const flags=document.getElementById('regex-flags').value||'g';
  const input=document.getElementById('regex-input').value;
  const errEl=document.getElementById('regex-error'),hlEl=document.getElementById('regex-highlight'),grEl=document.getElementById('regex-groups'),cntEl=document.getElementById('regex-count');
  errEl.textContent='';
  if(!patStr){hlEl.textContent=input;grEl.innerHTML='';cntEl.textContent='0 matches';return;}
  let regex;
  try{const f=flags.includes('g')?flags:flags+'g';regex=new RegExp(patStr,f);}
  catch(e){errEl.textContent='⚠ '+e.message;hlEl.textContent=input;return;}
  const matches=[];let lastIndex=-1;
  const scanRe=new RegExp(patStr,flags.includes('g')?flags:flags+'g');let m;
  while((m=scanRe.exec(input))!==null){
    if(m[0].length===0&&m.index===lastIndex){scanRe.lastIndex++;continue;}
    lastIndex=m.index;
    matches.push({index:m.index,length:m[0].length,full:m[0],groups:Array.from(m).slice(1)});
    if(!scanRe.global)break;
  }
  cntEl.textContent=matches.length+' match'+(matches.length!==1?'es':'');
  let html='',pos=0;
  for(const match of matches){
    if(match.index>pos)html+=escHtml(input.slice(pos,match.index));
    html+=`<span class="regex-match">${escHtml(match.full)}</span>`;
    pos=match.index+match.length;
  }
  if(pos<input.length)html+=escHtml(input.slice(pos));
  hlEl.innerHTML=html||'<span style="color:var(--text-dim)">— ไม่มีข้อความ —</span>';
  if(!matches.length){grEl.innerHTML='<span style="color:var(--text-dim)">ไม่พบผลลัพธ์</span>';return;}
  let gHtml='';
  matches.slice(0,10).forEach((match,i)=>{
    gHtml+=`<div class="match-item">[${i+1}] "${escHtml(match.full)}" ที่ index ${match.index}</div>`;
    match.groups.forEach((g,gi)=>{if(g!==undefined)gHtml+=`<div class="group-item">group ${gi+1}: "${escHtml(g||'')}"</div>`;});
  });
  if(matches.length>10)gHtml+=`<div style="color:var(--text-dim);margin-top:4px;">... และอีก ${matches.length-10} matches</div>`;
  grEl.innerHTML=gHtml;
}
function clearRegex(){['regex-pattern','regex-flags','regex-input'].forEach(id=>document.getElementById(id).value='');document.getElementById('regex-highlight').innerHTML='';document.getElementById('regex-groups').innerHTML='';document.getElementById('regex-error').textContent='';document.getElementById('regex-count').textContent='0 matches';}
