// ── QR / BARCODE READER ── decode a QR or a barcode from a pasted / dropped / chosen image or the camera. PromptPay
// and Thai QR payment payloads (EMVCo TLV) are split into fields and their CRC is checked. Uses the browser's
// BarcodeDetector when it has one (not on Windows / Linux desktop), else jsQR for QR and ZXing for everything else,
// each loaded on first use.
const QR_MAX_SIDE=1600; // bigger photos are scaled down before decoding: faster, and jsQR copes better
let _qrStream=null,_qrScanT=0,_qrText=''; // _qrText: exactly what was read, for copy

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
// BarcodeDetector format ids and ZXing BarcodeFormat names, both without "_", → the name printed on the result
const CODE_NAMES={qrcode:'QR',ean13:'EAN-13',ean8:'EAN-8',upca:'UPC-A',upce:'UPC-E',code128:'Code 128',code39:'Code 39',code93:'Code 93',
  itf:'ITF',codabar:'Codabar',datamatrix:'Data Matrix',pdf417:'PDF417',aztec:'Aztec',maxicode:'MaxiCode',rss14:'GS1 DataBar',rssexpanded:'GS1 DataBar Expanded'};
const codeName=f=>CODE_NAMES[String(f||'').toLowerCase().replace(/_/g,'')]||String(f||'');
// Pure: GS1 check digit (EAN-8, UPC-A, EAN-13, GTIN-14) → true / false, null when the code is not 8 or 12-14 digits.
// Not for UPC-E: its check digit belongs to the expanded UPC-A.
function gtinCheck(code){
  if(!/^(\d{8}|\d{12,14})$/.test(code))return null;
  const d=[...code].map(Number),last=d.pop();
  return (10-d.reverse().reduce((s,x,i)=>s+x*(i%2?1:3),0)%10)%10===last;
}
// Pure: Thai cross-bank bill payment barcode "|<tax id 13><suffix 2> CR <ref 1> CR <ref 2> CR <amount in satang>"
// → {taxId, suffix, ref1, ref2, satang, amount, taxOk}, else null. CR is the separator because a barcode gun
// "presses Enter" there to move to the next field of the teller's form. Amount 0 = the payer types it in.
function billInfo(text){
  const m=/^\|(\d{13})(\d{2})(?:\r\n?|\n)([^\r\n]*)(?:\r\n?|\n)([^\r\n]*)(?:\r\n?|\n)(\d{1,12})(?:\r\n?|\n)?$/.exec(text);
  if(!m)return null;
  const [,taxId,suffix,ref1,ref2,satang]=m,n=Number(satang);
  return{taxId,suffix,ref1,ref2,satang,taxOk:thaiIdCheckDigit(taxId)===+taxId[12],
    amount:n?(n/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):''};
}
// Pure: text a decoder read as Latin-1 / windows-1252 although its bytes are UTF-8 (Thai in a Data Matrix or PDF417
// with no ECI marker; browsers decode "iso-8859-1" as windows-1252) → the real text. Anything else comes back unchanged.
function qrUtf8(s){
  if(!/[^\x00-\x7f]/.test(s))return s;
  const cp=new TextDecoder('windows-1252').decode(Uint8Array.from({length:32},(_,i)=>0x80+i)); // chars of bytes 0x80-0x9F
  const bytes=[];
  for(const ch of s){
    const c=ch.charCodeAt(0),k=c>0xff?cp.indexOf(ch):-1;
    if(c>0xff&&k<0)return s; // a real character beyond one byte: not mis-decoded UTF-8
    bytes.push(c>0xff?0x80+k:c);
  }
  try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bytes));}catch(e){return s;}
}
// Line breaks as breaks (HTML does not break on a lone CR), other control characters as a named chip, never invisible
const CTL_NAMES='NUL SOH STX ETX EOT ENQ ACK BEL BS HT LF VT FF CR SO SI DLE DC1 DC2 DC3 DC4 NAK SYN ETB CAN EM SUB ESC FS GS RS US'.split(' ');
function qrVisible(text){
  return escHtml(text.replace(/\r\n?/g,'\n')).replace(/[\x00-\x08\x0b-\x1f\x7f]/g,c=>{
    const n=CTL_NAMES[c.charCodeAt(0)]||'DEL';
    return`<span class="qr-ctl" title="อักขระควบคุม ${n} (0x${c.charCodeAt(0).toString(16).toUpperCase().padStart(2,'0')})">${n}</span>`;
  });
}

// ── UI ──
// → {text, format} or null
async function qrDecodeSource(src,w,h){
  if('BarcodeDetector' in window){
    try{
      const formats=await BarcodeDetector.getSupportedFormats();
      if(formats.length){
        const r=await new BarcodeDetector({formats}).detect(src);
        if(r.length)return{text:qrUtf8(r[0].rawValue),format:r[0].format};
      }
    }catch(e){}
  }
  const k=Math.min(1,QR_MAX_SIDE/Math.max(w,h));
  const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
  const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(src,0,0,c.width,c.height);
  await loadLib('jsqr');
  if(window.jsQR){
    const d=x.getImageData(0,0,c.width,c.height);
    const r=jsQR(d.data,d.width,d.height,{inversionAttempts:'attemptBoth'});
    if(r)return{text:r.data,format:'qr_code'};
  }
  await loadLib('zxing');
  if(!window.jsQR&&!window.ZXing){qrError('โหลดตัวอ่าน QR / barcode ไม่ได้ ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่');return null;}
  if(!window.ZXing)return null;
  const hints=new Map([[ZXing.DecodeHintType.TRY_HARDER,true]]);
  const read=cv=>{
    try{
      const r=new ZXing.MultiFormatReader().decode(new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(new ZXing.HTMLCanvasElementLuminanceSource(cv))),hints);
      return{text:qrUtf8(r.getText()),format:ZXing.BarcodeFormat[r.getBarcodeFormat()]};
    }catch(e){return null;} // NotFoundException: nothing in this image or frame
  };
  // TRY_HARDER's own rotation misses a barcode standing upright (phone held in portrait), so turn it by hand
  return read(c)||read(qrTurn(c));
}
function qrTurn(c){
  const t=document.createElement('canvas');t.width=c.height;t.height=c.width;
  const x=t.getContext('2d');x.translate(t.width,0);x.rotate(Math.PI/2);x.drawImage(c,0,0);
  return t;
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
  const r=await qrDecodeSource(bmp,bmp.width,bmp.height);
  if(!r){if(window.jsQR||window.ZXing)qrError('ไม่พบ QR หรือ barcode ในรูปนี้ ลองครอปให้ใหญ่ขึ้น หรือถ่ายให้คมกว่านี้ (barcode ต้องเห็นเส้นครบทั้งแถบ)');}else qrShow(r.text,r.format);
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
  _qrText='';
  document.getElementById('qr-output').textContent='';
  document.getElementById('qr-extra').innerHTML='';
  const e=document.getElementById('qr-error');e.textContent=msg;e.style.display='block';
}
function qrShow(text,format){
  document.getElementById('qr-error').style.display='none';
  _qrText=text;
  document.getElementById('qr-output').innerHTML=qrVisible(text);
  const name=codeName(format),gtin=/^(EAN-13|EAN-8|UPC-A)$/.test(name)?gtinCheck(text):null;
  let html=name?`<div class="qr-kind"><span class="ref-badge ref-cyan">${escHtml(name)}</span>`
    +(gtin==null?'':`<span class="ref-badge ref-${gtin?'green':'red'}">${gtin?'check digit ถูกต้อง':'check digit ไม่ตรง: อาจอ่านผิด ลองใหม่'}</span>`)+'</div>':'';
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
  const bill=billInfo(text);
  if(bill){
    const rows=[['เลขประจำตัวผู้เสียภาษี',bill.taxId],['Suffix',bill.suffix],['Reference 1',bill.ref1],['Reference 2',bill.ref2||'-'],
      ['จำนวนเงิน',bill.amount?`${bill.satang} สตางค์ = ${bill.amount} บาท`:'0 = ผู้จ่ายกรอกเอง']];
    html+=`<div class="qr-emv"><div class="qr-emv-head"><b>ชำระบิลข้ามธนาคาร (Bill Payment)</b>`
      +`<span class="ref-badge ref-${bill.taxOk?'green':'red'}">${bill.taxOk?'เลขผู้เสียภาษีถูกต้อง':'check digit เลขผู้เสียภาษีไม่ตรง'}</span></div>`
      +`<div class="qr-emv-sum">Biller ID <b>${bill.taxId}${bill.suffix}</b> · ${bill.amount?`จำนวนเงิน <b>${bill.amount}</b> บาท`:'ไม่ระบุจำนวนเงิน (ผู้จ่ายกรอกเอง)'}</div>`
      +`<div class="qr-emv-table" tabindex="0" role="region" aria-label="ช่องใน barcode ชำระบิล"><table><thead><tr><th>ช่อง</th><th>ค่า</th></tr></thead><tbody>`
      +rows.map(([k,v])=>`<tr><td>${escHtml(k)}</td><td><code>${escHtml(v)}</code></td></tr>`).join('')+`</tbody></table></div></div>`;
  }
  document.getElementById('qr-extra').innerHTML=html;
}
// Copy gives the exact text (a bill payment barcode keeps its CRs); send to gives plain line breaks
function qrCopy(){copyText(_qrText);}
function qrSend(btn){sendText(btn,_qrText.replace(/\r\n?/g,'\n'),[]);}
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
      const r=await qrDecodeSource(v,v.videoWidth,v.videoHeight);
      if(r&&_qrStream){qrStopCamera();qrShow(r.text,r.format);showToast(`อ่าน ${codeName(r.format)||'QR'} ได้แล้ว`);return;}
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
  _qrText='';
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
