// ── BASE64 ──
let _b64Mode=recallOpt('b64-mode','enc');
function b64SetMode(m){
  _b64Mode=m;
  setSegmented('b64-mode',m);
  rememberOpt('b64-mode',m);
  b64Convert();
}
// live: runs the chosen direction on every change, an empty input clears the result
function b64Convert(){
  const out=document.getElementById('b64-output'),err=document.getElementById('b64-error');
  if(!document.getElementById('b64-input').value){out.textContent='';err.style.display='none';return;}
  if(_b64Mode==='dec')b64Decode();else b64Encode();
}
function b64Encode(){
  const txt=document.getElementById('b64-input').value;const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    const encBytes=new TextEncoder().encode(txt);let encoded=btoa(String.fromCharCode(...encBytes));
    if(document.getElementById('b64-urlsafe').checked)encoded=encoded.replace(/\+/g,'-').replace(/\//g,'_');
    if(document.getElementById('b64-nopad').checked)encoded=encoded.replace(/=+$/,'');
    document.getElementById('b64-output').textContent=encoded;
  }catch(e){errEl.textContent='แปลงเป็น Base64 ไม่ได้: '+e.message;errEl.style.display='block';}
}
function b64Decode(){
  const txt=document.getElementById('b64-input').value.trim();const errEl=document.getElementById('b64-error');errEl.style.display='none';
  try{
    let s=txt.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';
    const rawBytes=atob(s);let decoded;
    try{decoded=decodeURIComponent(rawBytes.split('').map(c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join(''));}
    catch(e2){decoded=rawBytes;}
    document.getElementById('b64-output').textContent=decoded;
  }catch(e){document.getElementById('b64-output').textContent='';errEl.textContent='ถอด Base64 ไม่ได้: มีตัวอักษรที่ไม่ใช่ Base64 ลองเลือก Encode ถ้าต้องการแปลงข้อความนี้เป็น Base64';errEl.style.display='block';}
}
function clearBase64(){document.getElementById('b64-input').value='';document.getElementById('b64-output').textContent='';document.getElementById('b64-error').style.display='none';}
