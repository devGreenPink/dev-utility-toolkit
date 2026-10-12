// ── THAI TOOLS ── พ.ศ./ค.ศ. dates, 13-digit ID (citizen / juristic) checksum, amount in Thai words (BAHTTEXT)

// Pure: check digit of the first 12 digits (same rule for citizen IDs and juristic person IDs)
function thaiIdCheckDigit(d12){
  let sum=0;
  for(let i=0;i<12;i++)sum+=(+d12[i])*(13-i);
  return(11-sum%11)%10;
}
const TH_ID_TYPES={
  '0':'เลขทะเบียนนิติบุคคล / เลขผู้เสียภาษีของนิติบุคคล',
  '1':'คนไทยที่แจ้งเกิดภายในกำหนด (เกิดตั้งแต่ 1 ม.ค. 2527)',
  '2':'คนไทยที่แจ้งเกิดเกินกำหนด (เกิดตั้งแต่ 1 ม.ค. 2527)',
  '3':'คนไทยหรือคนต่างด้าวที่มีชื่ออยู่ในทะเบียนบ้านก่อน 31 พ.ค. 2527',
  '4':'ย้ายเข้าทะเบียนบ้านช่วงเริ่มระบบ แต่ยังไม่ได้เลขประจำตัว',
  '5':'ได้รับอนุมัติให้เพิ่มชื่อเข้าทะเบียนบ้านภายหลัง (ตกสำรวจ)',
  '6':'ผู้เข้าเมืองโดยไม่ชอบด้วยกฎหมาย หรือเข้าเมืองชั่วคราว',
  '7':'บุตรของบุคคลประเภท 6 ที่เกิดในประเทศไทย',
  '8':'คนต่างด้าวที่ได้รับอนุญาตให้มีถิ่นที่อยู่ หรือได้สัญชาติไทยภายหลัง',
};
// Pure: any text → {ok, digits, expected?, formatted?, type?, reason?}
function thaiIdInfo(input){
  const d=String(input).replace(/\D/g,'');
  if(d.length!==13)return{ok:false,digits:d,reason:`ต้องมี 13 หลัก (ตอนนี้ ${d.length} หลัก)`};
  const expected=thaiIdCheckDigit(d.slice(0,12));
  return{ok:expected===+d[12],digits:d,expected,
    formatted:d.replace(/(\d)(\d{4})(\d{5})(\d{2})(\d)/,'$1-$2-$3-$4-$5'),type:TH_ID_TYPES[d[0]]||'ไม่มีประเภทนี้ (หลักแรก 9)'};
}
function thaiIdRandom(first){
  let d=String(first||1+Math.floor(Math.random()*8));
  while(d.length<12)d+=Math.floor(Math.random()*10);
  return d+thaiIdCheckDigit(d);
}

const TH_DIGIT=['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'];
const TH_POS=['','สิบ','ร้อย','พัน','หมื่น','แสน'];
// read a digit string; a trailing 1 is "เอ็ด" when anything comes before it (11, 101, 1,000,001)
function thReadInt(s,hasHigher){
  s=String(s).replace(/^0+/,'');
  if(!s)return '';
  if(s.length>6)return thReadInt(s.slice(0,-6),hasHigher)+'ล้าน'+thReadInt(s.slice(-6),true);
  let out='';
  for(let i=0;i<s.length;i++){
    const d=+s[i],pos=s.length-1-i;
    if(!d)continue;
    if(pos===1)out+=d===1?'สิบ':d===2?'ยี่สิบ':TH_DIGIT[d]+'สิบ';
    else if(pos===0&&d===1&&(s.length>1||hasHigher))out+='เอ็ด';
    else out+=TH_DIGIT[d]+TH_POS[pos];
  }
  return out;
}
// Pure: number / numeric string → Thai amount text, like Excel BAHTTEXT (satang rounded half up)
function bahtText(input){
  let s=String(input).replace(/[,\s฿]/g,'');
  if(!/^-?(\d+\.?\d*|\.\d+)$/.test(s))throw new Error('ใส่ได้เฉพาะตัวเลข เช่น 1250.75');
  const neg=s.startsWith('-');
  if(neg)s=s.slice(1);
  let[int,frac='']=s.split('.');
  int=int||'0';
  let satang=Math.round(+(frac+'000').slice(0,3)/10);
  if(satang===100){satang=0;int=(BigInt(int)+1n).toString();}
  const baht=BigInt(int)===0n?'':thReadInt(int)+'บาท';
  const text=satang?baht+thReadInt(String(satang))+'สตางค์':(baht||'ศูนย์บาท')+'ถ้วน';
  return(neg&&text!=='ศูนย์บาทถ้วน'?'ลบ':'')+text;
}

// ── UI ──
const TH_FMT_FULL=new Intl.DateTimeFormat('th-TH',{dateStyle:'full'});
const TH_FMT_LONG=new Intl.DateTimeFormat('th-TH',{dateStyle:'long'});
const TH_FMT_SHORT=new Intl.DateTimeFormat('th-TH',{day:'2-digit',month:'2-digit',year:'numeric'});
function thaiInit(){
  const d=document.getElementById('th-date');
  if(d&&!d.value){d.value=new Date().toISOString().slice(0,10);thaiDateFromIso();}
}
function thaiAge(from){
  const now=new Date();
  let y=now.getFullYear()-from.getFullYear(),m=now.getMonth()-from.getMonth(),day=now.getDate()-from.getDate();
  if(day<0){m--;day+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}
  if(m<0){y--;m+=12;}
  return y<0?'':`${y} ปี ${m} เดือน ${day} วัน`;
}
function thaiDateFromIso(){
  const v=document.getElementById('th-date').value;
  const out=document.getElementById('th-date-out');
  if(!v){out.innerHTML='';return;}
  const[y,m,dd]=v.split('-').map(Number);
  const d=new Date(y,m-1,dd);
  document.getElementById('th-be').value=`${String(dd).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y+543}`;
  const rows=[['เต็ม',TH_FMT_FULL.format(d)],['ยาว',TH_FMT_LONG.format(d)],['สั้น (พ.ศ.)',TH_FMT_SHORT.format(d)],['ISO (ค.ศ.)',v],['ปี',`พ.ศ. ${y+543} · ค.ศ. ${y}`],['อายุ / ผ่านมาแล้ว',thaiAge(d)||'ยังไม่ถึงวันนี้']];
  out.innerHTML=rows.map(([k,val])=>`<div class="result-row th-copy" role="button" tabindex="0" onclick="copyText(this.dataset.v)" onkeydown="if(isActivateKey(event)){event.preventDefault();copyText(this.dataset.v);}" data-v="${refAttr(val)}"><span class="result-label">${k}</span><span class="result-value">${escHtml(val)}</span></div>`).join('');
}
function thaiDateFromBe(){
  const v=document.getElementById('th-be').value.trim();
  const m=v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const err=document.getElementById('th-be-err');
  if(!m){err.hidden=!v;err.textContent='รูปแบบ วัน/เดือน/ปี พ.ศ. เช่น 12/10/2569';return;}
  const y=+m[3]-543,mo=+m[2],d=+m[1];
  const dt=new Date(y,mo-1,d);
  if(dt.getMonth()!==mo-1||dt.getDate()!==d){err.hidden=false;err.textContent='ไม่มีวันนี้ในปฏิทิน';return;}
  err.hidden=true;
  document.getElementById('th-date').value=`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  thaiDateFromIso();
}
function thaiIdCheck(){
  const v=document.getElementById('th-id').value;
  const out=document.getElementById('th-id-out');
  if(!v.trim()){out.innerHTML='';return;}
  const r=thaiIdInfo(v);
  if(r.reason){out.innerHTML=`<div class="th-status warn">${ic('triangle-alert')} ${escHtml(r.reason)}</div>`;return;}
  out.innerHTML=(r.ok?`<div class="th-status ok">${ic('circle-check')} เลขถูกต้องตาม checksum</div>`:`<div class="th-status err">${ic('circle-x')} checksum ไม่ตรง หลักสุดท้ายควรเป็น ${r.expected} (<code>${r.digits.slice(0,12)}${r.expected}</code>)</div>`)
    +`<div class="result-row"><span class="result-label">รูปแบบ</span><span class="result-value">${r.formatted}</span></div>`
    +`<div class="result-row"><span class="result-label">ประเภท (หลักที่ 1)</span><span class="result-value">${escHtml(r.type)}</span></div>`
    +(r.digits[0]!=='0'?`<div class="result-row"><span class="result-label">สำนักทะเบียน (หลัก 2-5)</span><span class="result-value">${r.digits.slice(1,5)} · จังหวัด ${r.digits.slice(1,3)}</span></div>`:'');
}
function thaiIdGen(juristic){
  const id=thaiIdRandom(juristic?'0':null);
  document.getElementById('th-id').value=id;
  thaiIdCheck();
}
function thaiBaht(){
  const v=document.getElementById('th-amount').value;
  const out=document.getElementById('th-baht-out');
  if(!v.trim()){out.textContent='';out.dataset.v='';return;}
  try{const t=bahtText(v);out.textContent=t;out.dataset.v=t;out.classList.remove('is-err');}
  catch(e){out.textContent=e.message;out.dataset.v='';out.classList.add('is-err');}
}
