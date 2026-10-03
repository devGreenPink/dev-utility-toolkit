// ── MOCK DATA ──
const MD={
  first:['มิกซ์', 'วิศรุต', 'ชัยพล', 'ณัฐกานต์', 'อภิสิทธิ์', 'สรวิชญ์', 'มิกค์', 'จ๊อบ', 'วิภาวี', 'เติ้ล', 'แสน', 'มอส', 'เอเทน', 'เจต', 'เจล', 'ข้าว', 'ขวัญข้าว', 'โอ๊ตข้าวตลอดไป', 'ธวัชชัย', 'แมน', 'แก๊ป', 'จิรสิน', 'จรรยพรพรหม', 'อิงค์', 'ตั้น', 'เจษฎากร', 'ศิรดา', 'สุทธิรา'],
  last:[
    'อินฟินิตลูป', 'ดีพลอยพัง', 'เมอร์จคอนฟลิกต์', 'แก้บั๊กวนไป', 
    'โลกล่ม', 'ดาต้าหาย', 'รีสตาร์ทเซอร์วิส', 'สแตกเทรซ',
    'เบิร์นเอาท์', 'เอาท์ออฟเมมโมรี่', 'ก๊อปวางอย่างเซียน', 'คีย์บอร์ดพัง', 'คอฟฟี่โอเวอร์โดส', 
    'โนสเปซเลฟต์', 'ซินแทกซ์เออร์เรอร์', 'เซมิโคลอนหาย', 'โลคอลโฮสต์รอด', 'เซิร์ฟเวอร์บึ้ม', 
    'เดดไลน์พรุ่งนี้', 'โนคอมเมนต์', 'สายมูเตลูโค้ด', 'ฟอนต์เพี้ยน', 'พาสเวิร์ดแฮกง่าย', 
    'กูเกิลคัตลอก', 'สแต็คโอเวอร์โฟลว์', 'บราวน์เซอร์ค้าง', 'คุกกี้เต็มพุง', 'คิวเอส่ายหัว'
],
  domain:['gmail.com','hotmail.com','yahoo.com','outlook.co.th','devmail.io'],
  prefix:['081','082','089','091','095','061','063','065'],
  gender:['ชาย','หญิง','ไม่ระบุ'],
  provinces:[
    {name:'กรุงเทพมหานคร',zip:'10100'},{name:'นนทบุรี',zip:'11000'},{name:'ปทุมธานี',zip:'12000'},
    {name:'สมุทรปราการ',zip:'10270'},{name:'ชลบุรี',zip:'20000'},{name:'ระยอง',zip:'21000'},
    {name:'อยุธยา',zip:'13000'},{name:'ลพบุรี',zip:'15000'},{name:'นครปฐม',zip:'73000'},
    {name:'เชียงใหม่',zip:'50000'},{name:'เชียงราย',zip:'57000'},{name:'ลำปาง',zip:'52000'},
    {name:'พิษณุโลก',zip:'65000'},{name:'นครสวรรค์',zip:'60000'},{name:'สุโขทัย',zip:'64000'},
    {name:'ขอนแก่น',zip:'40000'},{name:'นครราชสีมา',zip:'30000'},{name:'อุดรธานี',zip:'41000'},
    {name:'อุบลราชธานี',zip:'34000'},{name:'มหาสารคาม',zip:'44000'},{name:'สกลนคร',zip:'47000'},
    {name:'นครพนม',zip:'48000'},{name:'กาฬสินธุ์',zip:'46000'},{name:'บึงกาฬ',zip:'38000'},
    {name:'สงขลา',zip:'90000'},{name:'ภูเก็ต',zip:'83000'},{name:'สุราษฎร์ธานี',zip:'84000'},
    {name:'กระบี่',zip:'81000'},{name:'ตรัง',zip:'92000'},{name:'นราธิวาส',zip:'96000'},
  ],
  companies:[
    'บริษัท เทคโนโลยีไทย จำกัด','บริษัท ดิจิทัลโซลูชั่นส์ จำกัด (มหาชน)',
    'บริษัท อีสานซอฟต์แวร์ จำกัด','ห้างหุ้นส่วนจำกัด โค้ดดิ้งแล็บ',
    'บริษัท ไทยเดฟ จำกัด','บริษัท สยามไอที กรุ๊ป จำกัด',
    'บริษัท เน็กซ์เจน โซลูชั่น จำกัด','ห้างหุ้นส่วนจำกัด บิ๊กดาต้าไทย',
    'บริษัท คลาวด์เซอร์วิส ประเทศไทย จำกัด','บริษัท อีคอมเมิร์ซไทย จำกัด',
    'บริษัท ฟินเทค โซลูชั่น จำกัด','บริษัท โมบายแอป ไทยแลนด์ จำกัด',
    'บริษัท อะเมซิ่งเดฟ จำกัด','ห้างหุ้นส่วนจำกัด สตาร์ทอัพไทย',
    'บริษัท ซิลิคอนวัลเล่ย์ไทย จำกัด',
  ],
  jobs:[
    'Software Developer','Full Stack Developer','Backend Developer','Frontend Developer',
    'DevOps Engineer','QA Engineer','Project Manager','Business Analyst',
    'UX/UI Designer','Data Analyst','Database Administrator','System Analyst',
    'IT Manager','Tech Lead','Scrum Master','Mobile Developer','Cloud Engineer',
    'Security Engineer','นักพัฒนาซอฟต์แวร์','ผู้จัดการโครงการ',
  ],
  salaryRanges:[[15000,25000],[25000,40000],[40000,60000],[60000,90000],[90000,120000],[120000,180000]],
  nicknames:[
    'สายสู้ชีวิต แต่ชีวิตสู้กลับ','จอมขมังเวทย์ เสกโค้ดบ่ติด','นักสู้พันล้าน... บรรทัด',
    'เทพเจ้าแห่งความว่างเปล่า (ตื่นมาพบบั๊ก)','ผู้พิทักษ์โค้ดเน่า','ร่างทองตอนตีสอง',
    'ด็อกเตอร์ Stack Overflow','ฉลามวาฬกินคาเฟอีน','นักล้างแค้น... แก้วกาแฟ',
    'เซียนโกปี๊ ขยี้บั๊ก','หวานเจี๊ยบเฉียบคม','ผู้เปลี่ยนชาเย็นเป็นซอร์สโค้ด',
    'บ่าวหน้าคอม ดมกลิ่นกาแฟ','มือปราบหนอนไหม (แต่เจอหนอนยักษ์)','หมอพราหมณ์ทำพิธีล้างบั๊ก',
    'หน่วยกู้ภัยไฟลุกลาม','บิดาแห่งการ Copy & Paste','นักเลงคีย์บอร์ด (ปุ่ม Ctrl พัง)',
    'ผู้บ่าวโค้ดพัง ฝังใจกับบั๊ก','ร่างทรง "มันทำงานได้บนเครื่องผม"','จอมโจรลักลอก โค้ดชาวบ้าน',
    'นักพรางตัวในห้องมืด','ผู้ดับไฟด่วน (แต่ทำไฟลาม)','เซียนคอมพิวเตอร์ ยินดีซ่อมปริ้นเตอร์',
    'ขุนพล "ลองรีสตาร์ทดูยัง?"','ปรมาจารย์ มั่วจนรันผ่าน','เทพแห่งการ Commit สองวิสุดท้าย',
    'นักโบราณคดี ขุดโค้ดเก่า','วิศวกรผู้สร้าง บั๊กไร้พรมแดน','เจ้าชายร้อย Git Branch',
    'ท่านประธานบริษัท แผนกแก้คำผิด',
  ],
};
function r(a){return a[Math.floor(Math.random()*a.length)];}
function genDob(){
  const now=new Date();
  const age=18+Math.floor(Math.random()*48);
  const dob=new Date(now.getFullYear()-age,Math.floor(Math.random()*12),1+Math.floor(Math.random()*28));
  const dd=String(dob.getDate()).padStart(2,'0');
  const mm=String(dob.getMonth()+1).padStart(2,'0');
  const yyyy=dob.getFullYear();
  return{display:`${dd}/${mm}/${yyyy+543}`,iso:`${yyyy}-${mm}-${dd}`,age:Math.floor((now-dob)/31557600000)};
}
function genLuhnCard(prefix){
  let num=String(prefix);
  while(num.length<15)num+=Math.floor(Math.random()*10);
  let sum=0,odd=true;
  for(let i=num.length-1;i>=0;i--){let d=parseInt(num[i]);if(odd){d*=2;if(d>9)d-=9;}sum+=d;odd=!odd;}
  return(num+((10-(sum%10))%10)).replace(/(\d{4})(?=\d)/g,'$1-');
}
function genJuristicId(){
  let n='0';for(let i=0;i<12;i++)n+=Math.floor(Math.random()*10);
  return n.replace(/(\d)(\d{4})(\d{5})(\d{2})(\d)/,'$1-$2-$3-$4-$5');
}
function genOneMock(){
  let id='';
  for(let i=0;i<12;i++)id+=Math.floor(Math.random()*10);
  let sum=0;
  const digits=id.split('').map(Number);
  for(let i=0;i<12;i++)sum+=digits[i]*(13-i);
  id+=(11-(sum%11))%10;
  const first=r(MD.first),last=r(MD.last);
  const phone=r(MD.prefix)+'-'+String(Math.floor(Math.random()*9000000)+1000000).padStart(7,'0').replace(/(\d{3})(\d{4})/,'$1-$2');
  const EN_FIRST=['alex','sam','mike','jane','bob','alice','tom','lisa','john','kate','peter','anna','james','emma','chris','sara','david','amy','ryan','julia'];
  const EN_LAST=['smith','jones','brown','chen','lee','kim','garcia','miller','davis','wilson','taylor','anderson','thomas','jackson','white','harris','martin','walker','hall','allen'];
  const email=r(EN_FIRST)+'.'+r(EN_LAST)+Math.floor(Math.random()*999)+'@'+r(MD.domain);
  const uuid=crypto.randomUUID();
  const gender=r(MD.gender);
  const dob=genDob();
  const prov=r(MD.provinces);
  const company=r(MD.companies);
  const job=r(MD.jobs);
  const sr=r(MD.salaryRanges);
  const salary=Math.floor((sr[0]+Math.random()*(sr[1]-sr[0]))/500)*500;
  const cardType=Math.random()>0.5?{label:'Visa',prefix:'4'}:{label:'Mastercard',prefix:String(51+Math.floor(Math.random()*5))};
  const creditCard=genLuhnCard(cardType.prefix);
  const juristicId=genJuristicId();
  const nickname=r(MD.nicknames);
  return{id,name:`${first} ${last}`,nickname,gender,phone,email,uuid,dob:dob.display,dobIso:dob.iso,age:dob.age,province:prov.name,zip:prov.zip,company,juristicId,job,salary,creditCard,creditCardType:cardType.label};
}
function generateAll(){
  const m=genOneMock();
  document.getElementById('out-id').textContent=m.id;
  document.getElementById('out-name').textContent=m.name;
  document.getElementById('out-nickname').textContent=m.nickname;
  document.getElementById('out-gender').textContent=m.gender;
  document.getElementById('out-dob').textContent=`${m.dob}  (${m.age} ปี)`;
  document.getElementById('out-phone').textContent=m.phone;
  document.getElementById('out-email').textContent=m.email;
  document.getElementById('out-uuid').textContent=m.uuid;
  document.getElementById('out-province').textContent=m.province;
  document.getElementById('out-zip').textContent=m.zip;
  document.getElementById('out-company').textContent=m.company;
  document.getElementById('out-juristic').textContent=m.juristicId;
  document.getElementById('out-job').textContent=m.job;
  document.getElementById('out-salary').textContent=m.salary.toLocaleString('th-TH')+' บาท';
  const ccEl=document.getElementById('out-credit');
  ccEl.textContent=m.creditCard;
  ccEl.setAttribute('data-card-type',m.creditCardType);
  document.getElementById('out-card-type').textContent=m.creditCardType;
  document.getElementById('bulk-output-area').style.display='none';
}
function clearMock(){
  ['out-id','out-name','out-nickname','out-gender','out-dob','out-phone','out-email','out-uuid','out-province','out-zip','out-company','out-juristic','out-job','out-salary','out-credit'].forEach(id=>{document.getElementById(id).textContent='—';});
  document.getElementById('out-card-type').textContent='';
  document.getElementById('bulk-output-area').style.display='none';
  document.getElementById('bulk-json-output').value='';
}
function copyAllMock(){
  const g=id=>document.getElementById(id).textContent;
  const fields={บัตรประชาชน:g('out-id'),ชื่อนามสกุล:g('out-name'),ฉายา:g('out-nickname'),เพศ:g('out-gender'),วันเกิด:g('out-dob'),เบอร์โทร:g('out-phone'),อีเมล:g('out-email'),จังหวัด:g('out-province'),รหัสไปรษณีย์:g('out-zip'),บริษัท:g('out-company'),เลขนิติบุคคล:g('out-juristic'),ตำแหน่ง:g('out-job'),เงินเดือน:g('out-salary'),บัตรเครดิต:g('out-credit'),uuid:g('out-uuid')};
  if(Object.values(fields).every(v=>v==='—')){showToast('กรุณาสุ่มข้อมูลก่อน');return;}
  copyText(JSON.stringify(fields,null,2));
}
function exportBulkJSON(){
  const count=parseInt(document.getElementById('bulk-count').value)||10;
  const items=[];for(let i=0;i<count;i++)items.push(genOneMock());
  const json=JSON.stringify(items,null,2);
  document.getElementById('bulk-json-output').value=json;
  document.getElementById('bulk-output-area').style.display='block';
  const badge=document.getElementById('bulk-count-badge');if(badge)badge.textContent=`${count} records`;
}
