// ── JWT ──
function b64urlDecode(str){
  str=str.trim().replace(/-/g,'+').replace(/_/g,'/');
  while(str.length%4)str+='=';
  if(!/^[A-Za-z0-9+/=]+$/.test(str))throw new Error('ข้อมูล base64 มีอักขระที่ไม่ถูกต้อง');
  const binary=atob(str);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const text=new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(text);
}
let _jwtHeader=null,_jwtPayload=null;
function copyJwtPart(part){const obj=part==='header'?_jwtHeader:_jwtPayload;if(obj)copyText(JSON.stringify(obj,null,2));}
function decodeJWT_UI(){
  let token=document.getElementById('jwt-input').value.trim();
  const container=document.getElementById('jwt-result');
  if(!token){container.innerHTML='';_jwtHeader=null;_jwtPayload=null;return;}
  token=token.replace(/^bearer\s+/i,'').replace(/\s+/g,'');
  try{
    const parts=token.split('.');
    if(parts.length<3)throw new Error('JWT ต้องมี 3 ส่วน คั่นด้วย "." (header.payload.signature)');
    if(parts.length>3)throw new Error('พบ "." มากเกินไป — ตรวจสอบว่า token ครบถ้วนและไม่มีช่องว่าง');
    if(!parts[0])throw new Error('Header ว่างเปล่า');
    if(!parts[1])throw new Error('Payload ว่างเปล่า');
    const header=b64urlDecode(parts[0]);
    const payload=b64urlDecode(parts[1]);
    const sig=parts[2];
    _jwtHeader=header;_jwtPayload=payload;
    const alg=header.alg||'ไม่ระบุ';
    const algColor=alg.startsWith('HS')?'#60a5fa':alg.startsWith('RS')?'#a78bfa':alg.startsWith('ES')?'#34d399':'#94a3b8';
    let meta='';
    if(payload.iat!=null)meta+=`<span>iat: <b>${new Date(payload.iat*1000).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})}</b></span>`;
    if(payload.nbf!=null)meta+=`<span>nbf: <b>${new Date(payload.nbf*1000).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})}</b></span>`;
    if(payload.exp!=null){
      const expDate=new Date(payload.exp*1000);const now=new Date();const expired=expDate<now;const diffMs=expDate-now;
      const diffText=expired?'หมดอายุแล้ว':diffMs<3600000?'อีก ~'+Math.floor(diffMs/60000)+' นาที':diffMs<86400000?'อีก ~'+Math.floor(diffMs/3600000)+' ชั่วโมง':'อีก ~'+Math.floor(diffMs/86400000)+' วัน';
      meta+=`<span>exp: <b style="color:${expired?'var(--danger)':'var(--success)'};">${expDate.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})} (${diffText})</b></span>`;
    }
    if(payload.sub!=null)meta+=`<span>sub: <b>${escHtml(String(payload.sub))}</b></span>`;
    if(payload.iss!=null)meta+=`<span>iss: <b>${escHtml(String(payload.iss))}</b></span>`;
    if(payload.aud!=null)meta+=`<span>aud: <b>${escHtml(Array.isArray(payload.aud)?payload.aud.join(', '):String(payload.aud))}</b></span>`;
    const tokenBytes=new TextEncoder().encode(token).length;
    container.innerHTML=`
      <div class="jwt-section">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid ${algColor}44;color:${algColor};background:${algColor}18;">ALG: ${escHtml(alg)}</span>
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid var(--border);color:var(--text-dim);">TYPE: ${escHtml(header.typ||'JWT')}</span>
          <span style="font-family:var(--mono);font-size:.72rem;color:var(--text-dim);margin-left:auto;">${tokenBytes} bytes</span>
        </div>
        ${meta?`<div class="jwt-meta">${meta}</div>`:''}
      </div>
      <div class="jwt-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="jwt-section-title">HEADER</div>
          <button class="btn btn-ghost" onclick="copyJwtPart('header')">Copy</button>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(header,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div class="jwt-section-title">PAYLOAD</div>
          <button class="btn btn-ghost" onclick="copyJwtPart('payload')">Copy</button>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(payload,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div class="jwt-section-title">SIGNATURE (ไม่มีการยืนยัน)</div>
        <div class="jwt-sig">${escHtml(sig)}</div>
      </div>`;
  }catch(e){
    let hint='';
    if(e.message.includes('3 ส่วน'))hint='<div style="margin-top:6px;font-size:.74rem;color:var(--text-dim);">💡 JWT มีรูปแบบ: eyXXX.eyXXX.XXXXX — วาง token ทั้งก้อน หรือลบ "Bearer " ออก</div>';
    container.innerHTML=`<div class="jwt-error">⚠ ${escHtml(e.message)}${hint}</div>`;
  }
}
function clearJWT(){document.getElementById('jwt-input').value='';document.getElementById('jwt-result').innerHTML='';_jwtHeader=null;_jwtPayload=null;}

// ── JWT ENCODER ──
function b64urlEncodeBytes(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
async function jwtEncode() {
  const payloadStr = document.getElementById('jwt-enc-payload').value.trim();
  const secret = document.getElementById('jwt-enc-secret').value;
  const outEl = document.getElementById('jwt-enc-output');
  const errEl = document.getElementById('jwt-enc-error');
  errEl.style.display = 'none';
  outEl.textContent = '—';
  if (!payloadStr) { errEl.textContent = '⚠ กรอก payload JSON'; errEl.style.display = 'block'; return; }
  if (!secret) { errEl.textContent = '⚠ กรอก secret key'; errEl.style.display = 'block'; return; }
  let payload;
  try { payload = JSON.parse(payloadStr); } catch (e) { errEl.textContent = '⚠ payload ไม่ใช่ JSON ที่ถูกต้อง: ' + e.message; errEl.style.display = 'block'; return; }
  try {
    const enc = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(header)));
    const payloadB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(payload)));
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    outEl.textContent = `${data}.${b64urlEncodeBytes(new Uint8Array(sig))}`;
    showToast('JWT สร้างแล้ว ✓');
  } catch (e) {
    errEl.textContent = '⚠ Error: ' + e.message;
    errEl.style.display = 'block';
  }
}
function clearJwtEnc() {
  document.getElementById('jwt-enc-payload').value = '';
  document.getElementById('jwt-enc-secret').value = '';
  document.getElementById('jwt-enc-output').textContent = '—';
  document.getElementById('jwt-enc-error').style.display = 'none';
}
