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
  const parts=expr.trim().split(/\s+/);if(!cronParse(expr))return'รูปแบบไม่ถูกต้อง (ต้องมี 5 ช่อง: นาที ชั่วโมง วันที่ เดือน วันในสัปดาห์)';
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
// Spring's cron has a seconds field first; it takes 0-7 for the weekday like Linux
function copySpring(){copyText(`@Scheduled(cron = "0 ${currentCron.trim()}")`);}
// Quarkus @Scheduled speaks Quartz by default
function copyQuartz(){
  const q=cronToQuartz(currentCron);
  if(!q){showToast('cron expression ไม่ถูกต้อง','err');return;}
  copyText(`@Scheduled(cron = "${q.expr}")`);
  if(q.dropped)showToast('Quartz ใช้วันที่กับวันในสัปดาห์พร้อมกันไม่ได้ จึงใช้วันที่อย่างเดียว','warn');
}
function clearCron(){
  document.getElementById('cron-manual').value='';
  ['c-min','c-hr','c-dom','c-mon','c-dow'].forEach(id=>{document.getElementById(id).selectedIndex=0;});
  currentCron='* * * * *';updateCronDisplay('* * * * *');
}
// ── PARSER ── pure: Linux 5-field cron (minute hour day-of-month month day-of-week)
const CRON_RANGE=[[0,59],[0,23],[1,31],[1,12],[0,7]]; // weekday 7 = Sunday as well
const CRON_MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const CRON_DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'];
// one field → Set of allowed numbers, or null when malformed. Steps count from the field's own start (*/3 months = 1,4,7,10).
function cronField(f,i){
  const [lo,hi]=CRON_RANGE[i],names=i===3?CRON_MONTHS:i===4?CRON_DAYS:null,out=new Set();
  for(let part of String(f).toUpperCase().split(',')){
    if(names)names.forEach((n,k)=>{part=part.split(n).join(String(i===3?k+1:k));});
    const m=part.match(/^(\*|\d+)(?:-(\d+))?(?:\/(\d+))?$/);
    if(!m)return null;
    const a=m[1]==='*'?lo:+m[1],b=m[1]==='*'?hi:m[2]!==undefined?+m[2]:m[3]?hi:a,step=m[3]?+m[3]:1;
    if(a<lo||b>hi||a>b||step<1)return null;
    for(let v=a;v<=b;v+=step)out.add(i===4&&v===7?0:v);
  }
  return out;
}
// {sets, domStar, dowStar} or null. Day-of-month 'L' = last day of the month.
function cronParse(expr){
  const p=String(expr).trim().split(/\s+/);
  if(p.length!==5)return null;
  const sets=p.map((f,i)=>i===2&&f.toUpperCase()==='L'?'L':cronField(f,i));
  if(sets.some(s=>!s))return null;
  return{sets,domStar:p[2].startsWith('*'),dowStar:p[4].startsWith('*')};
}
// d is a wall-clock time held in a Date's UTC fields. When both day fields are restricted, either one matching is enough (Vixie cron).
function cronDayOk(c,d){
  const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
  const dom=c.sets[2]==='L'?d.getUTCDate()===last:c.sets[2].has(d.getUTCDate()),dow=c.sets[4].has(d.getUTCDay());
  return !c.domStar&&!c.dowStar?dom||dow:dom&&dow;
}
// the wall clock of a time zone, as a Date whose UTC fields read that clock
function cronWall(date,tz){
  if(!tz)return new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes()));
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
    .formatToParts(date).map(x=>[x.type,x.value]));
  return new Date(Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute));
}
// next runs as wall-clock Dates (read them with timeZone 'UTC'), counted in the given zone; [] when the expression is malformed
function cronNextRuns(expr,count=5,from=new Date(),tz){
  const c=cronParse(expr);if(!c)return[];
  const d=cronWall(from,tz),out=[],limit=d.getTime()+5*366*864e5; // 5 years covers 29 Feb
  d.setUTCMinutes(d.getUTCMinutes()+1,0,0);
  while(out.length<count&&d.getTime()<limit){
    if(!c.sets[3].has(d.getUTCMonth()+1)){d.setUTCMonth(d.getUTCMonth()+1,1);d.setUTCHours(0,0,0,0);continue;}
    if(!cronDayOk(c,d)){d.setUTCDate(d.getUTCDate()+1);d.setUTCHours(0,0,0,0);continue;}
    if(!c.sets[1].has(d.getUTCHours())){d.setUTCHours(d.getUTCHours()+1,0,0,0);continue;}
    if(!c.sets[0].has(d.getUTCMinutes())){d.setUTCMinutes(d.getUTCMinutes()+1,0,0);continue;}
    out.push(new Date(d));
    d.setUTCMinutes(d.getUTCMinutes()+1,0,0);
  }
  return out;
}
// Linux cron → Quartz (Quarkus @Scheduled): seconds first, weekdays as names (Quartz counts 1 = Sunday),
// '?' in the day field that is not used. Quartz cannot use both day fields: the weekday is dropped then.
function cronToQuartz(expr){
  const c=cronParse(expr);if(!c)return null;
  const p=String(expr).trim().split(/\s+/);
  let dom=p[2],dow='?',dropped=false;
  if(!c.dowStar){
    if(c.domStar){dom='?';dow=cronDayNames(c.sets[4]);}
    else dropped=true;
  }
  return{expr:['0',p[0],p[1],dom,p[3],dow].join(' '),dropped};
}
// {1,2,3,4,5} → 'MON-FRI', {0,6} → 'SUN,SAT'
function cronDayNames(set){
  const days=[...set].sort((a,b)=>a-b),out=[];
  for(let i=0;i<days.length;){
    let j=i;while(j+1<days.length&&days[j+1]===days[j]+1)j++;
    out.push(j-i>=2?CRON_DAYS[days[i]]+'-'+CRON_DAYS[days[j]]:days.slice(i,j+1).map(x=>CRON_DAYS[x]).join(','));
    i=j+1;
  }
  return out.join(',');
}
function renderNextRuns(expr){
  const list=document.getElementById('next-runs-list');if(!list)return;
  let runs=[],now;
  try{runs=cronNextRuns(expr,5,new Date(),cronTz);now=cronWall(new Date(),cronTz);}catch(e){} // unknown time zone
  if(!runs.length){list.innerHTML='<div style="color:var(--text-dim);font-size:.76rem;">ไม่สามารถคำนวณได้ ตรวจรูปแบบ cron</div>';return;}
  list.innerHTML=runs.map((d,i)=>{
    const diff=d.getTime()-now.getTime();
    const rel=diff<60000?'< 1 นาที':diff<3600000?Math.floor(diff/60000)+' นาที':diff<86400000?Math.floor(diff/3600000)+' ชั่วโมง':Math.floor(diff/86400000)+' วัน';
    const tzStr=d.toLocaleString('th-TH',{timeZone:'UTC',dateStyle:'short',timeStyle:'short'});
    return`<div class="next-run-item"><span class="next-run-num">${i+1}.</span><span class="next-run-time">${tzStr}</span><span class="next-run-rel">อีก ${rel}</span></div>`;
  }).join('');
}
// the five fields, then the same schedule for Spring and Quarkus (drawn by dgInit in refdocs.js)
const CRON_DIAGRAMS=[
 {id:'fields',t:'5 ช่องของ cron',kind:'anatomy',
  intro:'cron ของ Linux มี 5 ช่องคั่นด้วยช่องว่าง Spring และ Quarkus (Quartz) เพิ่มช่องวินาทีไว้หน้าสุด กดแต่ละช่องเพื่อดูค่าที่ใส่ได้ · ตัวอย่างนี้คือ 08:00 วันจันทร์ถึงศุกร์',
  lines:[
   [['0','นาที (0-59) · `*/15` = ทุก 15 นาที · `0,30` = นาที 0 และ 30','blue'],[' '],
    ['8','ชั่วโมง (0-23) · `9-17` = 9 โมงเช้าถึง 5 โมงเย็น · `*/2` = ทุก 2 ชั่วโมง','green'],[' '],
    ['*','วันที่ของเดือน (1-31) · `L` = วันสุดท้ายของเดือน · ถ้าใส่ทั้งช่องนี้และวันในสัปดาห์ Linux รันเมื่อตรงอย่างใดอย่างหนึ่ง','orange'],[' '],
    ['*','เดือน (1-12 หรือ JAN-DEC) · `*/3` = ม.ค. เม.ย. ก.ค. ต.ค. (นับจากเดือน 1)','purple'],[' '],
    ['1-5','วันในสัปดาห์ (0-7 หรือ SUN-SAT, ทั้ง 0 และ 7 คืออาทิตย์) · `1-5` = จันทร์ถึงศุกร์','red']],
   [['Spring   ','Spring `@Scheduled(cron = ...)` มี 6 ช่อง เลขวันในสัปดาห์ใช้แบบ Linux ได้'],['0','วินาที (0-59) ช่องที่เพิ่มเข้ามาหน้าสุด','cyan'],[' 0 8 * * 1-5']],
   [['Quarkus  ','Quarkus `@Scheduled` ใช้รูปแบบ Quartz เป็นค่าเริ่มต้น'],['0','วินาที','cyan'],[' 0 8 '],
    ['?','Quartz บังคับให้ช่องวันที่หรือวันในสัปดาห์ช่องใดช่องหนึ่งเป็น `?` (ไม่ระบุ)','orange'],[' * '],
    ['MON-FRI','Quartz นับ 1 = อาทิตย์ ถึง 7 = เสาร์ ต่างจาก Linux ใช้ชื่อวันจะไม่สับสน','red']]]},
];
// first open of the tab (TAB_INIT): saved timezone, the current expression and the clock
function cronInit(){
  dgInit('cron',CRON_DIAGRAMS);
  try{
    const saved=localStorage.getItem('esan-devtools-tz');
    const sel=document.getElementById('cron-tz');
    if(saved&&sel&&Array.from(sel.options).some(o=>o.value===saved)){cronTz=saved;sel.value=saved;}
  }catch(e){}
  updateCronDisplay(currentCron);
  updateTzClock();
  setInterval(()=>{if(activeTabId==='cron-tab')updateTzClock();},1000); // only while visible: it restyles every second
}
