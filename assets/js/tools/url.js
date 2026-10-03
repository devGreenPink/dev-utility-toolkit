// ── URL ENCODE/DECODE ──
function urlEncode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?encodeURI(input):encodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){errEl.textContent='Error: '+e.message;errEl.style.display='block';}
}
function urlDecode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?decodeURI(input):decodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){errEl.textContent='Decode error: '+e.message;errEl.style.display='block';}
}
function clearURL(){document.getElementById('url-input').value='';document.getElementById('url-output').textContent='—';document.getElementById('url-error').style.display='none';}
