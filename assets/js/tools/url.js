// ── URL ENCODE/DECODE ──
let _urlMode=recallOpt('url-dir','enc');
function urlSetMode(m){
  _urlMode=m;
  setSegmented('url-dir',m);
  rememberOpt('url-dir',m);
  urlConvert();
}
function urlConvert(){
  const out=document.getElementById('url-output'),err=document.getElementById('url-error');
  if(!document.getElementById('url-input').value){out.textContent='';err.style.display='none';return;}
  if(_urlMode==='dec')urlDecode();else urlEncode();
}
function urlEncode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?encodeURI(input):encodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){errEl.textContent='แปลงไม่ได้: '+e.message;errEl.style.display='block';}
}
function urlDecode(){
  const input=document.getElementById('url-input').value;const errEl=document.getElementById('url-error');errEl.style.display='none';
  try{const mode=document.querySelector('input[name="url-mode"]:checked').value;const result=mode==='full'?decodeURI(input):decodeURIComponent(input);document.getElementById('url-output').textContent=result;}
  catch(e){document.getElementById('url-output').textContent='';errEl.textContent='ถอดไม่ได้: มี % ที่ไม่ตามด้วยเลขฐาน 16 สองหลัก ลองเลือก Encode ถ้าต้องการแปลงข้อความนี้';errEl.style.display='block';}
}
function clearURL(){document.getElementById('url-input').value='';document.getElementById('url-output').textContent='';document.getElementById('url-error').style.display='none';}
