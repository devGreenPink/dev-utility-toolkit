// ── TRANSLATE ── on-device first: Chrome's Translator API keeps the text on this machine. Without it, MyMemory's
// free API (no key, ~5,000 characters a day per IP) — only when the user presses แปล, with a notice that the text
// leaves the browser.
const TR_LANGS=[['th','ไทย'],['en','อังกฤษ'],['ja','ญี่ปุ่น'],['zh','จีน'],['ko','เกาหลี'],['vi','เวียดนาม'],['lo','ลาว']];
const TR_MAX_BYTES=450; // MyMemory takes at most 500 bytes of UTF-8 per request
let _trEngine='device',_trToken=0,_trTranslator=null,_trPair='';

// Pure: guess the language from the script it is written in
function trDetect(text){
  const t=String(text),n=re=>(t.match(re)||[]).length;
  if(n(/[぀-ヿ]/g))return 'ja';
  const best=[['th',n(/[฀-๿]/g)],['lo',n(/[຀-໿]/g)],['ko',n(/[가-힯]/g)],['zh',n(/[一-鿿]/g)]].sort((a,b)=>b[1]-a[1])[0];
  if(best[1])return best[0];
  return /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(t)?'vi':'en';
}
// Pure: cut text into pieces of at most maxBytes UTF-8 — at paragraphs, then sentences, then spaces, then characters —
// and pack neighbours together; joining the pieces gives back the original text
function trChunks(text,maxBytes=TR_MAX_BYTES){
  const size=s=>new TextEncoder().encode(s).length;
  const seps=[/(?<=\n)/,/(?<=[.!?。！？]\s)/,/(?<=\s)/];
  const atoms=[];
  const split=(piece,level)=>{
    if(size(piece)<=maxBytes){atoms.push(piece);return;}
    if(level<seps.length){
      const parts=piece.split(seps[level]).filter(Boolean);
      if(parts.length>1)parts.forEach(p=>split(p,level+1));else split(piece,level+1);
      return;
    }
    let cur='';
    for(const ch of piece){if(cur&&size(cur+ch)>maxBytes){atoms.push(cur);cur='';}cur+=ch;}
    if(cur)atoms.push(cur);
  };
  split(String(text),0);
  const out=[];let cur='';
  for(const a of atoms){if(cur&&size(cur+a)>maxBytes){out.push(cur);cur='';}cur+=a;}
  if(cur)out.push(cur);
  return out;
}

// ── UI ──
// Translator.availability() can hang (no model service, headless): after 4 s treat the pair as unavailable
const _trAvail={};
async function trAvail(from,to){
  const k=from+to;
  if(_trAvail[k])return _trAvail[k];
  let a;
  try{a=await Promise.race([Translator.availability({sourceLanguage:from,targetLanguage:to}),new Promise(r=>setTimeout(()=>r('timeout'),4000))]);}
  catch(e){a='unavailable';}
  if(a==='available'||a==='unavailable'||a==='timeout')_trAvail[k]=a;
  return a;
}
function trInit(){
  const opts=TR_LANGS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  document.getElementById('tr-from').innerHTML='<option value="auto">ตรวจภาษาเอง</option>'+opts;
  document.getElementById('tr-to').innerHTML=opts;
  document.getElementById('tr-from').value=recallOpt('tr-from','auto');
  document.getElementById('tr-to').value=recallOpt('tr-to','en');
  _trEngine=recallOpt('tr-engine','Translator' in self?'device':'mymemory');
  const dev=document.querySelector('#tr-engine [data-v="device"]');
  if(!('Translator' in self)){dev.disabled=true;dev.title='เบราว์เซอร์นี้ไม่มี Translator API (มีใน Chrome 138 ขึ้นไปบนคอมพิวเตอร์)';_trEngine='mymemory';}
  setSegmented('tr-engine',_trEngine);
  trStatus();
}
function trLangs(){
  const text=document.getElementById('tr-input').value;
  let from=document.getElementById('tr-from').value,to=document.getElementById('tr-to').value;
  if(from==='auto')from=trDetect(text);
  if(from===to)to=from==='th'?'en':'th'; // auto-detected the target language: translate the other way
  return{from,to};
}
async function trStatus(){
  const el=document.getElementById('tr-status');
  const text=document.getElementById('tr-input').value.trim();
  const{from,to}=trLangs(),name=v=>(TR_LANGS.find(l=>l[0]===v)||[v,v])[1];
  const pair=text?`${name(from)} → ${name(to)}`:'';
  if(_trEngine==='mymemory'){
    el.innerHTML=`${ic('globe')}<span>${pair?pair+' · ':''}MyMemory: ข้อความจะถูกส่งไปที่ api.mymemory.translated.net เมื่อกดแปล · ฟรีวันละราว 5,000 ตัวอักษร · <b>อย่าแปลข้อมูลลับหรือข้อมูลส่วนบุคคล</b></span>`;
    return;
  }
  el.innerHTML=`${ic('hourglass')}<span>กำลังตรวจว่า Chrome แปลคู่ภาษานี้ในเครื่องได้ไหม</span>`;
  const a=await trAvail(from,to);
  if(_trEngine!=='device')return;
  el.innerHTML=a==='available'?`${ic('lock')}<span>${pair?pair+' · ':''}แปลในเครื่องด้วย Chrome ข้อความไม่ออกไปไหน แปลทันทีที่พิมพ์</span>`
    :a==='downloadable'||a==='downloading'?`${ic('download')}<span>${pair?pair+' · ':''}ครั้งแรกต้องดาวน์โหลดภาษา ${escHtml(name(from))} → ${escHtml(name(to))} ลงเครื่อง กดแปลเพื่อเริ่ม</span>`
    :`${ic('triangle-alert')}<span>Chrome แปลคู่ภาษา ${escHtml(name(from))} → ${escHtml(name(to))} ในเครื่องไม่ได้ตอนนี้ เลือก MyMemory ด้านบนเพื่อแปลออนไลน์</span>`;
}
function trSetEngine(v){
  _trEngine=v;setSegmented('tr-engine',v);rememberOpt('tr-engine',v);
  _trTranslator=null;_trPair='';
  document.getElementById('tr-error').style.display='none';
  trStatus();
}
function trChanged(){
  rememberOpt('tr-from',document.getElementById('tr-from').value);
  rememberOpt('tr-to',document.getElementById('tr-to').value);
  _trTranslator=null;_trPair='';
  trStatus();
  if(_trEngine==='device')trLive();
}
function trSwap(){
  const f=document.getElementById('tr-from'),t=document.getElementById('tr-to');
  const{from,to}=trLangs();
  f.value=to;t.value=from;
  const out=document.getElementById('tr-output').textContent;
  if(out)document.getElementById('tr-input').value=out;
  trChanged();
}
// on-device translation is private and quick, so it follows the typing; MyMemory waits for the button
const trLive=debounced(()=>{trStatus();if(_trEngine==='device'&&_trTranslator!==false)trTranslate(false);},500);
async function trTranslate(fromButton){
  const text=document.getElementById('tr-input').value;
  const out=document.getElementById('tr-output'),err=document.getElementById('tr-error');
  err.style.display='none';
  if(!text.trim()){out.textContent='';return;}
  const{from,to}=trLangs(),token=++_trToken;
  const fail=msg=>{if(token!==_trToken)return;err.textContent=msg;err.style.display='block';};
  const go=document.getElementById('tr-go');
  go.setAttribute('aria-busy','true');
  try{
    if(_trEngine==='device'){
      if(!_trTranslator||_trPair!==from+to){
        const a=await trAvail(from,to);
        if(a==='unavailable'||a==='timeout'){fail('Chrome แปลคู่ภาษานี้ในเครื่องไม่ได้ตอนนี้ เลือก MyMemory ด้านบนเพื่อแปลออนไลน์');return;}
        if(a!=='available'&&!fromButton)return; // downloading a language needs a click
        _trTranslator=await Translator.create({sourceLanguage:from,targetLanguage:to,monitor(m){
          m.addEventListener('downloadprogress',e=>{document.getElementById('tr-status').textContent=`กำลังดาวน์โหลดภาษา ${Math.round(e.loaded*100)}%`;});
        }});
        _trPair=from+to;
        trStatus();
      }
      const r=await _trTranslator.translate(text);
      if(token===_trToken)out.textContent=r;
      return;
    }
    if(!fromButton)return;
    const chunks=trChunks(text);
    const parts=[];
    for(const c of chunks){
      const m=c.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if(!m[2]){parts.push(c);continue;}
      const res=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(m[2])}&langpair=${from}|${to}`);
      const j=await res.json().catch(()=>({}));
      if(token!==_trToken)return;
      if(j.quotaFinished||res.status===429){fail('MyMemory ครบโควตาฟรีของวันนี้แล้ว ลองพรุ่งนี้ หรือใช้ Chrome บนคอมพิวเตอร์ที่แปลในเครื่องได้');return;}
      if(!res.ok||+j.responseStatus!==200||!j.responseData){fail('แปลไม่ได้: '+(j.responseDetails||'MyMemory ตอบกลับผิดพลาด ('+res.status+')'));return;}
      const d=document.createElement('textarea');d.innerHTML=j.responseData.translatedText; // MyMemory returns HTML entities
      parts.push(m[1]+d.value+m[3]);
      out.textContent=parts.join('')+(parts.length<chunks.length?' …':'');
    }
  }catch(e){fail(_trEngine==='mymemory'?'เชื่อมต่อ MyMemory ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่':'แปลไม่ได้: '+e.message);}
  finally{if(token===_trToken)go.removeAttribute('aria-busy');}
}
function clearTranslate(){
  _trToken++;
  document.getElementById('tr-input').value='';
  document.getElementById('tr-output').textContent='';
  document.getElementById('tr-error').style.display='none';
  trStatus();
}
