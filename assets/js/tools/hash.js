// ── HASH ──
async function computeHash(){
  const input=document.getElementById('hash-input').value;
  const upper=document.getElementById('hash-uppercase').checked;
  const container=document.getElementById('hash-results');
  if(!input.trim()){container.innerHTML='';return;}
  const algos=[['SHA-256','SHA-256'],['SHA-512','SHA-512'],['SHA-1','SHA-1']];
  const enc=new TextEncoder().encode(input);
  let html='';
  for(const[label,algo]of algos){
    try{
      const buf=await crypto.subtle.digest(algo,enc);
      let hex=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
      if(upper)hex=hex.toUpperCase();
      html+=`<div class="hash-result-row"><div class="hash-algo"><span>${label}</span><button class="btn btn-ghost" onclick="copyText('${hex}')">Copy</button></div><div class="hash-value">${hex}</div></div>`;
    }catch(e){html+=`<div class="hash-result-row"><div class="hash-algo">${label}</div><div style="color:var(--danger);font-size:.76rem;">${e.message}</div></div>`;}
  }
  html+=`<div style="margin-top:8px;font-size:.72rem;color:var(--text-dim);font-family:var(--mono);">Input: ${enc.length} bytes · ${input.length} chars</div>`;
  container.innerHTML=html;
}
function clearHash(){document.getElementById('hash-input').value='';document.getElementById('hash-results').innerHTML='';}
