// ── UNIX ──
function convertUnix(){
  const val=document.getElementById('unix-input').value.trim();
  if(!val){document.getElementById('unix-result').textContent='';document.getElementById('unix-ms').textContent='';return;}
  const num=parseFloat(val);
  const ts=num>1e10?num:num*1000;
  const d=new Date(ts);
  if(isNaN(d)){document.getElementById('unix-result').textContent='ค่าไม่ถูกต้อง';return;}
  document.getElementById('unix-result').textContent=d.toLocaleString('th-TH',{dateStyle:'full',timeStyle:'long'});
  document.getElementById('unix-ms').textContent=`ms: ${ts} · ISO: ${d.toISOString()}`;
}
function nowUnix(){const n=Date.now();document.getElementById('unix-input').value=Math.floor(n/1000);convertUnix();}
function clearUnix(){document.getElementById('unix-input').value='';document.getElementById('unix-result').textContent='';document.getElementById('unix-ms').textContent='';}

// ── quick values (empty state of the tab) ── computed on click so "now" is always now
const UNIX_QUICK=[
  ['ตอนนี้ (วินาที)',()=>Math.floor(Date.now()/1000)],
  ['ตอนนี้ (มิลลิวินาที)',()=>Date.now()],
  ['เที่ยงคืนวันนี้',()=>{const n=new Date();return Math.floor(new Date(n.getFullYear(),n.getMonth(),n.getDate())/1000);}],
  ['วันแรกของเดือนนี้',()=>{const n=new Date();return Math.floor(new Date(n.getFullYear(),n.getMonth(),1)/1000);}],
  ['1 มกราคม ปีนี้',()=>Math.floor(new Date(new Date().getFullYear(),0,1)/1000)],
  ['Epoch (1 ม.ค. 1970 UTC)',()=>0],
  ['เพดาน int 32-bit (ปัญหาปี 2038)',()=>2147483647],
];
function unixQuickRender(){
  const el=document.getElementById('unix-quick');
  if(el)el.innerHTML=UNIX_QUICK.map(([l,f],i)=>`<button type="button" class="unix-quick-item" onclick="unixUse(${i})"><span>${l}</span><code>${f()}</code></button>`).join('');
}
function unixUse(i){
  document.getElementById('unix-input').value=UNIX_QUICK[i][1]();
  convertUnix();
  unixQuickRender();
}
