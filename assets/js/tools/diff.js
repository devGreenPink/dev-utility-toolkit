// ── DIFF ──
let diffMode='char';
function diffModeChange(){diffMode=document.querySelector('input[name="diff-mode"]:checked').value;}
function compareText(){
  let l=document.getElementById('diff-left').value;
  let rr=document.getElementById('diff-right').value;
  try{l=JSON.stringify(JSON.parse(l),null,2);rr=JSON.stringify(JSON.parse(rr),null,2);}catch(e){}
  const res=document.getElementById('diff-result');
  const stats=document.getElementById('diff-stats');
  res.innerHTML='';
  let addedCount=0,removedCount=0;
  if(diffMode==='line'){
    const diff=Diff.diffLines(l,rr);
    diff.forEach(p=>{
      p.value.split('\n').forEach((line,li,arr)=>{
        if(li===arr.length-1&&line==='')return;
        const s=document.createElement('span');
        if(p.added){s.className='diff-line-added';addedCount++;s.textContent='+ '+line;}
        else if(p.removed){s.className='diff-line-removed';removedCount++;s.textContent='- '+line;}
        else{s.className='diff-line-equal';s.textContent='  '+line;}
        res.appendChild(s);
      });
    });
  }else{
    const diff=Diff.diffChars(l,rr);
    diff.forEach(p=>{
      const s=document.createElement('span');
      if(p.added){s.className='diff-added';addedCount+=p.value.length;}
      else if(p.removed){s.className='diff-removed';removedCount+=p.value.length;}
      s.textContent=p.value;
      res.appendChild(s);
    });
  }
  stats.style.display='flex';
  document.getElementById('diff-added-count').textContent='+'+(diffMode==='line'?addedCount+' lines added':addedCount+' chars added');
  document.getElementById('diff-removed-count').textContent='-'+(diffMode==='line'?removedCount+' lines removed':removedCount+' chars removed');
}
function clearDiff(){document.getElementById('diff-left').value='';document.getElementById('diff-right').value='';document.getElementById('diff-result').innerHTML='';document.getElementById('diff-stats').style.display='none';}
