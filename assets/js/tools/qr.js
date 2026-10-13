// ── QR CODE READER ── decode a QR from a pasted / dropped / chosen image or the camera. PromptPay and Thai QR
// payment payloads (EMVCo TLV) are split into fields and their CRC is checked. Uses the browser's
// BarcodeDetector when it has one, jsQR (loaded on first use) otherwise.
const QR_MAX_SIDE=1600; // bigger photos are scaled down before decoding: faster, and jsQR copes better
let _qrStream=null,_qrScanT=0;

// Pure: CRC-16/CCITT-FALSE as EMVCo QR uses for tag 63, upper-case hex
function crc16(str){
  let c=0xFFFF;
  for(const b of new TextEncoder().encode(str)){
    c^=b<<8;
    for(let i=0;i<8;i++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;
  }
  return c.toString(16).toUpperCase().padStart(4,'0');
}
const EMV_TAGS={'00':'Payload Format','01':'Point of Initiation (11 = ใช้ซ้ำได้, 12 = ครั้งเดียว)','52':'Merchant Category','53':'สกุลเงิน (764 = บาท)',
  '54':'จำนวนเงิน','58':'ประเทศ','59':'ชื่อผู้รับ / ร้าน','60':'เมือง','62':'ข้อมูลเพิ่มเติม','63':'CRC'};
const EMV_SUB={'29':{'00':'AID (PromptPay)','01':'เบอร์มือถือ','02':'เลขประจำตัว 13 หลัก','03':'e-Wallet ID'},
  '30':{'00':'AID (Bill Payment)','01':'Biller ID','02':'Reference 1','03':'Reference 2'},
  '62':{'01':'Bill Number','05':'Reference Label','07':'Terminal Label'}};
// Pure: EMVCo TLV string → [{id, len, value, name, sub?}], or null when it is not well-formed TLV
function emvParse(s,parent){
  const out=[];
  let i=0;
  while(i<s.length){
    const id=s.slice(i,i+2),ln=s.slice(i+2,i+4);
    if(!/^\d\d$/.test(id)||!/^\d\d$/.test(ln)||i+4+(+ln)>s.length)return null;
    const value=s.slice(i+4,i+4+(+ln));
    const merchant=!parent&&+id>=26&&+id<=51;
    const it={id,len:+ln,value,name:(parent?(EMV_SUB[parent]||{})[id]:EMV_TAGS[id]||(merchant?'Merchant Account':''))||''};
    if(!parent&&(EMV_SUB[id]||merchant)){const sub=emvParse(value,id);if(sub)it.sub=sub;}
    out.push(it);
    i+=4+(+ln);
  }
  return out;
}
// Pure: decoded text → {fields, crcOk, kind, amount, target} for an EMVCo payment QR, else null
function emvInfo(text){
  if(!/^000201/.test(text))return null;
  const fields=emvParse(text);
  if(!fields)return null;
  const crc=fields.find(f=>f.id==='63');
  const crcOk=!!crc&&crc.value.toUpperCase()===crc16(text.slice(0,-4)); // the CRC covers everything up to and including "6304"
  const acc=fields.find(f=>f.sub&&f.sub.some(x=>x.id==='00'&&/^A000000677/i.test(x.value)));
  const target=acc?acc.sub.find(x=>x.id!=='00'):null;
  const amt=fields.find(f=>f.id==='54');
  return{fields,crcOk,kind:acc?(acc.id==='30'?'Thai QR Payment (จ่ายบิล)':'PromptPay'):'EMVCo QR',
    amount:amt?amt.value:'',target:target?{name:target.name,value:/^0066\d{9}$/.test(target.value)?'0'+target.value.slice(4):target.value}:null};
}

// ── UI ──
async function qrDecodeSource(src,w,h){
  if('BarcodeDetector' in window){
    try{
      if((await BarcodeDetector.getSupportedFormats()).includes('qr_code')){
        const r=await new BarcodeDetector({formats:['qr_code']}).detect(src);
        if(r.length)return r[0].rawValue;
      }
    }catch(e){}
  }
  await loadLib('jsqr');
  if(!window.jsQR){qrError('โหลดตัวอ่าน QR ไม่ได้ ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่');return null;}
  const k=Math.min(1,QR_MAX_SIDE/Math.max(w,h));
  const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
  const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(src,0,0,c.width,c.height);
  const d=x.getImageData(0,0,c.width,c.height);
  const r=jsQR(d.data,d.width,d.height,{inversionAttempts:'attemptBoth'});
  return r?r.data:null;
}
async function qrDecodeBlob(blob){
  qrStopCamera();
  let bmp;
  try{bmp=await createImageBitmap(blob);}catch(e){qrError('เปิดรูปนี้ไม่ได้ ลองไฟล์ PNG หรือ JPG');return;}
  const cv=document.getElementById('qr-preview');
  const k=Math.min(1,640/Math.max(bmp.width,bmp.height));
  cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);
  cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
  qrStage('image');
  const text=await qrDecodeSource(bmp,bmp.width,bmp.height);
  if(text==null)qrError('ไม่พบ QR code ในรูปนี้ ลองครอปให้ QR ใหญ่ขึ้น หรือถ่ายให้คมกว่านี้');else qrShow(text);
}
function qrStage(mode){
  document.getElementById('qr-video').hidden=mode!=='video';
  document.getElementById('qr-preview').hidden=mode!=='image';
  document.getElementById('qr-empty').hidden=mode!=='empty';
  const b=document.getElementById('qr-cam-btn');
  b.innerHTML=mode==='video'?ic('square')+' ปิดกล้อง':ic('camera')+' เปิดกล้อง';
  b.setAttribute('aria-pressed',String(mode==='video'));
}
function qrError(msg){
  document.getElementById('qr-output').textContent='';
  document.getElementById('qr-extra').innerHTML='';
  const e=document.getElementById('qr-error');e.textContent=msg;e.style.display='block';
}
function qrShow(text){
  document.getElementById('qr-error').style.display='none';
  document.getElementById('qr-output').textContent=text;
  let html='';
  if(/^https?:\/\//i.test(text)){
    let host='';try{host=new URL(text).host;}catch(e){}
    html+=`<div class="qr-link">${ic('link')}<span>ลิงก์ไปที่ <b>${escHtml(host)}</b> ตรวจชื่อโดเมนให้แน่ใจก่อนเปิด</span><a class="btn btn-ghost" href="${refAttr(text)}" target="_blank" rel="noopener noreferrer">${ic('arrow-right')} เปิดลิงก์</a></div>`;
  }
  const emv=emvInfo(text);
  if(emv){
    const row=(f,sub)=>`<tr${sub?' class="qr-sub"':''}><td><code>${f.id}</code></td><td>${escHtml(f.name||'-')}</td><td><code>${escHtml(f.value)}</code></td></tr>`
      +(f.sub?f.sub.map(x=>row(x,true)).join(''):'');
    html+=`<div class="qr-emv"><div class="qr-emv-head"><b>${escHtml(emv.kind)}</b>`
      +`<span class="ref-badge ref-${emv.crcOk?'green':'red'}">${emv.crcOk?'CRC ถูกต้อง':'CRC ไม่ตรง: QR อาจถูกแก้ไขหรืออ่านผิด'}</span></div>`
      +`<div class="qr-emv-sum">${emv.target?`${escHtml(emv.target.name)}: <b>${escHtml(emv.target.value)}</b> · `:''}${emv.amount?`จำนวนเงิน <b>${escHtml(emv.amount)}</b> บาท`:'ไม่ระบุจำนวนเงิน (ผู้จ่ายกรอกเอง)'}</div>`
      +`<div class="qr-emv-table" tabindex="0" role="region" aria-label="ฟิลด์ใน QR"><table><thead><tr><th>Tag</th><th>ความหมาย</th><th>ค่า</th></tr></thead><tbody>${emv.fields.map(f=>row(f)).join('')}</tbody></table></div></div>`;
  }
  document.getElementById('qr-extra').innerHTML=html;
}
async function qrCamera(){
  if(_qrStream){qrStopCamera();return;}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){showToast('เบราว์เซอร์นี้เปิดกล้องไม่ได้ ใช้การเลือกรูปแทน','warn');return;}
  try{_qrStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});}
  catch(e){_qrStream=null;showToast(e.name==='NotAllowedError'?'ไม่ได้รับอนุญาตให้ใช้กล้อง เปิดสิทธิ์ได้ที่ไอคอนในแถบที่อยู่':'เปิดกล้องไม่ได้: '+e.message,'warn');return;}
  const v=document.getElementById('qr-video');
  v.srcObject=_qrStream;
  await v.play().catch(()=>{});
  qrStage('video');
  const tick=async()=>{
    if(!_qrStream)return;
    if(activeTabId!=='qr-tab'){qrStopCamera();return;} // leaving the tab turns the camera off
    if(v.readyState>=2){
      const t=await qrDecodeSource(v,v.videoWidth,v.videoHeight);
      if(t!=null&&_qrStream){qrStopCamera();qrShow(t);showToast('อ่าน QR ได้แล้ว');return;}
    }
    _qrScanT=setTimeout(tick,250);
  };
  tick();
}
function qrStopCamera(){
  clearTimeout(_qrScanT);
  if(!_qrStream)return;
  _qrStream.getTracks().forEach(t=>t.stop());
  _qrStream=null;
  document.getElementById('qr-video').srcObject=null;
  qrStage(document.getElementById('qr-preview').width>0&&document.getElementById('qr-output').textContent?'image':'empty');
}
function qrPickFile(input){const f=input.files[0];input.value='';if(f)qrDecodeBlob(f);}
function qrDrop(e){
  e.preventDefault();
  document.getElementById('qr-stage').classList.remove('dragover');
  const f=e.dataTransfer.files[0];
  if(f&&f.type.startsWith('image/'))qrDecodeBlob(f);else showToast('วางได้เฉพาะไฟล์รูป','warn');
}
function qrClear(){
  qrStopCamera();
  document.getElementById('qr-output').textContent='';
  document.getElementById('qr-extra').innerHTML='';
  document.getElementById('qr-error').style.display='none';
  const cv=document.getElementById('qr-preview');cv.width=0;cv.height=0;
  qrStage('empty');
}
if(typeof document!=='undefined')document.addEventListener('paste',e=>{
  if(activeTabId!=='qr-tab')return;
  const item=Array.from((e.clipboardData||{}).items||[]).find(i=>i.kind==='file'&&i.type.startsWith('image/'));
  if(item){e.preventDefault();qrDecodeBlob(item.getAsFile());}
});
