// ── CRON ──
let currentCron='* * * * *';
let cronTz='Asia/Bangkok';
function onCronTzChange(){
  cronTz=document.getElementById('cron-tz').value;
  updateCronDisplay(currentCron);
  updateTzClock();
  try{localStorage.setItem('esan-devtools-tz',cronTz);}catch(e){}
}
function updateTzClock(){
  const el=document.getElementById('cron-tz-now');if(!el)return;
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('th-TH',{timeZone:cronTz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const dateStr=now.toLocaleDateString('th-TH',{timeZone:cronTz,day:'2-digit',month:'short',year:'2-digit'});
    el.innerHTML=`<span style="font-size:.68rem;color:var(--text-muted);">ตอนนี้</span>&nbsp;<span style="color:var(--accent2);font-weight:600;">${timeStr}</span>&nbsp;<span style="color:var(--text-dim);font-size:.74rem;">${dateStr}</span>`;
  }
  catch(e){el.textContent='';}
}
function buildCron(){
  const m=document.getElementById('c-min').value,h=document.getElementById('c-hr').value,d=document.getElementById('c-dom').value,mo=document.getElementById('c-mon').value,dw=document.getElementById('c-dow').value;
  currentCron=`${m} ${h} ${d} ${mo} ${dw}`;updateCronDisplay(currentCron);
}
function parseCronManual(){const v=document.getElementById('cron-manual').value.trim();if(!v)return;currentCron=v;updateCronDisplay(v);}
function loadPreset(expr){document.getElementById('cron-manual').value=expr;currentCron=expr;updateCronDisplay(expr);}
function updateCronDisplay(expr){
  document.getElementById('cron-expr-display').textContent=expr;
  document.getElementById('cron-human').textContent=cronToHuman(expr);
  renderNextRuns(expr);
}
function cronToHuman(expr){
  const parts=expr.trim().split(/\s+/);if(parts.length<5)return'รูปแบบไม่ถูกต้อง';
  const[min,hr,dom,mon,dow]=parts;
  const THdays=['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const THmons=['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const p=[];
  if(min==='*')p.push('ทุกนาที');else if(min.startsWith('*/'))p.push('ทุก '+min.slice(2)+' นาที');else p.push('นาทีที่ '+min);
  if(hr!=='*'){if(hr.startsWith('*/'))p.push('ทุก '+hr.slice(2)+' ชั่วโมง');else if(hr.includes(','))p.push('เวลา '+hr.split(',').map(h=>`${h}:00`).join(', '));else p.push('เวลา '+hr+':'+(min==='*'?'00':min.padStart(2,'0'))+' น.');}
  if(dow!=='*'){if(dow==='1-5')p.push('เฉพาะวันทำงาน (จ–ศ)');else if(dow==='0,6')p.push('เฉพาะวันหยุด');else if(!dow.includes(',')&&!dow.includes('-'))p.push('วัน'+(THdays[parseInt(dow)]||dow));else p.push('วัน '+dow);}
  if(dom!=='*'){if(dom==='L')p.push('วันสุดท้ายของเดือน');else p.push('วันที่ '+dom+' ของเดือน');}
  if(mon!=='*'){if(!mon.includes(',')&&!mon.includes('-'))p.push('เดือน '+(THmons[parseInt(mon)]||mon));else p.push('เดือน '+mon);}
  return p.length?p.join(' · '):'ทุกนาที';
}
function copySpring(){copyText(`@Scheduled(cron = "${currentCron}")`);showToast('Copied @Scheduled ✓');}
function copyQuartz(){copyText(`@Scheduled(cron = "0 ${currentCron}")`);showToast('Copied Quartz ✓');}
function clearCron(){
  document.getElementById('cron-manual').value='';
  ['c-min','c-hr','c-dom','c-mon','c-dow'].forEach(id=>{document.getElementById(id).selectedIndex=0;});
  currentCron='* * * * *';updateCronDisplay('* * * * *');
}
function cronMatchField(val,field){
  if(field==='*'||field==='L')return true;
  if(field.startsWith('*/'))return(val%parseInt(field.slice(2)))===0;
  if(field.includes(',')){return field.split(',').some(f=>cronMatchField(val,f.trim()));}
  if(field.includes('-')){const[lo,hi]=field.split('-').map(Number);return val>=lo&&val<=hi;}
  return val===parseInt(field);
}
function cronNextRuns(expr,count=5){
  const parts=expr.trim().split(/\s+/);if(parts.length<5)return[];
  const[minF,hrF,domF,monF,dowF]=parts;
  const results=[];
  const now=new Date();now.setSeconds(0,0);now.setMinutes(now.getMinutes()+1);
  let iter=0;
  while(results.length<count&&iter<60*24*366){
    iter++;
    if(cronMatchField(now.getMinutes(),minF)&&cronMatchField(now.getHours(),hrF)&&cronMatchField(now.getDate(),domF)&&cronMatchField(now.getMonth()+1,monF)&&cronMatchField(now.getDay(),dowF))results.push(new Date(now));
    now.setMinutes(now.getMinutes()+1);
  }
  return results;
}
function renderNextRuns(expr){
  const list=document.getElementById('next-runs-list');if(!list)return;
  const runs=cronNextRuns(expr,5);
  if(!runs.length){list.innerHTML='<div style="color:var(--text-dim);font-size:.76rem;">ไม่สามารถคำนวณได้</div>';return;}
  const now=Date.now();
  list.innerHTML=runs.map((d,i)=>{
    const diff=d.getTime()-now;
    const rel=diff<60000?'< 1 นาที':diff<3600000?Math.floor(diff/60000)+' นาที':diff<86400000?Math.floor(diff/3600000)+' ชั่วโมง':Math.floor(diff/86400000)+' วัน';
    let tzStr='';
    try{tzStr=d.toLocaleString('th-TH',{timeZone:cronTz,dateStyle:'short',timeStyle:'short'});}
    catch(e){tzStr=d.toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'});}
    return`<div class="next-run-item"><span class="next-run-num">${i+1}.</span><span class="next-run-time">${tzStr}</span><span class="next-run-rel">อีก ${rel}</span></div>`;
  }).join('');
}
