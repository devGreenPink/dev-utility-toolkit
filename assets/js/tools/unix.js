// ── UNIX ──
function convertUnix(){
  const val=document.getElementById('unix-input').value.trim();
  if(!val){document.getElementById('unix-result').textContent='—';document.getElementById('unix-ms').textContent='';return;}
  const num=parseFloat(val);
  const ts=num>1e10?num:num*1000;
  const d=new Date(ts);
  if(isNaN(d)){document.getElementById('unix-result').textContent='ค่าไม่ถูกต้อง';return;}
  document.getElementById('unix-result').textContent=d.toLocaleString('th-TH',{dateStyle:'full',timeStyle:'long'});
  document.getElementById('unix-ms').textContent=`ms: ${ts} · ISO: ${d.toISOString()}`;
}
function nowUnix(){const n=Date.now();document.getElementById('unix-input').value=Math.floor(n/1000);convertUnix();}
function clearUnix(){document.getElementById('unix-input').value='';document.getElementById('unix-result').textContent='—';document.getElementById('unix-ms').textContent='';}
