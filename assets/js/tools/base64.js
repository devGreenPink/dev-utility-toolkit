// ── BASE64 ──
function b64Encode(){
  const txt=document.getElementById('b64-input').value;const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    const encBytes=new TextEncoder().encode(txt);let encoded=btoa(String.fromCharCode(...encBytes));
    if(document.getElementById('b64-urlsafe').checked)encoded=encoded.replace(/\+/g,'-').replace(/\//g,'_');
    if(document.getElementById('b64-nopad').checked)encoded=encoded.replace(/=+$/,'');
    document.getElementById('b64-output').textContent=encoded;
  }catch(e){errEl.textContent='Encode error: '+e.message;errEl.style.display='block';}
}
function b64Decode(){
  const txt=document.getElementById('b64-input').value.trim();const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    let s=txt.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
    const rawBytes=atob(s);let decoded;
    try{decoded=decodeURIComponent(rawBytes.split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));}
    catch(e2){decoded=rawBytes;}
    document.getElementById('b64-output').textContent=decoded;
  }catch(e){errEl.textContent='Decode error: invalid Base64';errEl.style.display='block';}
}
function clearBase64(){document.getElementById('b64-input').value='';document.getElementById('b64-output').textContent='—';document.getElementById('b64-error').style.display='none';}
