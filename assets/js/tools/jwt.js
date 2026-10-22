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
    if(parts.length>3)throw new Error('พบ "." มากเกินไป: ตรวจสอบว่า token ครบถ้วนและไม่มีช่องว่าง');
    if(!parts[0])throw new Error('Header ว่างเปล่า');
    if(!parts[1])throw new Error('Payload ว่างเปล่า');
    const header=b64urlDecode(parts[0]);
    const payload=b64urlDecode(parts[1]);
    const sig=parts[2];
    _jwtHeader=header;_jwtPayload=payload;
    const alg=header.alg||'ไม่ระบุ';
    const algColor=alg.startsWith('HS')?'var(--c-blue)':alg.startsWith('RS')?'var(--c-purple)':alg.startsWith('ES')?'var(--c-green)':'var(--text-dim)';
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
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid color-mix(in srgb, ${algColor} 27%, transparent);color:${algColor};background:color-mix(in srgb, ${algColor} 9%, transparent);">ALG: ${escHtml(alg)}</span>
          <span style="font-family:var(--mono);font-size:.72rem;padding:3px 10px;border-radius:20px;border:1px solid var(--border);color:var(--text-dim);">TYPE: ${escHtml(header.typ||'JWT')}</span>
          <span style="font-family:var(--mono);font-size:.72rem;color:var(--text-dim);margin-left:auto;">${tokenBytes} bytes</span>
        </div>
        ${meta?`<div class="jwt-meta">${meta}</div>`:''}
      </div>
      <div class="jwt-section">
        <div class="field-head">
          <div class="jwt-section-title">HEADER</div>
          <button type="button" class="field-act" onclick="copyJwtPart('header')">${ic('copy')}คัดลอก</button>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(header,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div class="field-head">
          <div class="jwt-section-title">PAYLOAD</div>
          <span class="field-acts"><button type="button" class="field-act" aria-haspopup="true" aria-expanded="false" onclick="sendText(this,JSON.stringify(_jwtPayload,null,2),['jwt'])">${ic('arrow-right')}ส่งต่อ</button><button type="button" class="field-act" onclick="copyJwtPart('payload')">${ic('copy')}คัดลอก</button></span>
        </div>
        <div class="jwt-json">${escHtml(JSON.stringify(payload,null,2))}</div>
      </div>
      <div class="jwt-section">
        <div class="jwt-section-title">SIGNATURE (ไม่มีการยืนยัน)</div>
        <div class="jwt-sig">${escHtml(sig)}</div>
      </div>`;
  }catch(e){
    let hint='';
    if(e.message.includes('3 ส่วน'))hint='<div style="margin-top:6px;font-size:.74rem;color:var(--text-dim);">'+ic('lightbulb')+' JWT มีรูปแบบ: eyXXX.eyXXX.XXXXX · วาง token ทั้งก้อน หรือลบ "Bearer " ออก</div>';
    container.innerHTML=`<div class="jwt-error">${ic('triangle-alert')} ${escHtml(e.message)}${hint}</div>`;
  }
}
function clearJWT(){document.getElementById('jwt-input').value='';document.getElementById('jwt-result').innerHTML='';_jwtHeader=null;_jwtPayload=null;}

// ── JWT COMPARE ── one numbered box per token; the table's columns carry the box number
// objects become one row per key; arrays stay one value, so an extra role does not shift every row after it
function jwtFlatten(v,path,out){
  if(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length)Object.keys(v).forEach(k=>jwtFlatten(v[k],[...path,k],out));
  else out.push([path,JSON.stringify(v)]);
  return out;
}
// list: the boxes' text; empty boxes are left out but the others keep their box number n.
// vals[i]: the claim as JSON (so null ≠ missing and 1 ≠ "1"), null when column i lacks it or did not decode;
// diff[i]: differs from the baseline, the first column that decoded
function jwtCompare(list){
  const cols=list.map((s,i)=>({n:i+1,tok:s.trim().replace(/^bearer\s+/i,'').replace(/\s+/g,'')})).filter(c=>c.tok).map(({n,tok})=>{
    const p=tok.split('.');
    try{
      if(p.length!==3||!p[0]||!p[1])throw new Error('ไม่ใช่ JWT (ต้องมี 3 ส่วน header.payload.signature)');
      return {n,claims:new Map([...jwtFlatten(b64urlDecode(p[0]),['header'],[]),...jwtFlatten(b64urlDecode(p[1]),['payload'],[]),[['signature'],JSON.stringify(p[2])]]
        .map(([path,v])=>[path.join('\0'),[path,v]]))};
    }catch(e){return {n,error:e.message};}
  });
  const base=cols.findIndex(c=>c.claims),seen=new Map();
  cols.forEach(c=>c.claims&&c.claims.forEach(([path],k)=>{if(!seen.has(k))seen.set(k,path);}));
  const group=path=>['header','payload','signature'].indexOf(path[0]);
  const rows=[...seen].sort((a,b)=>group(a[1])-group(b[1])).map(([k,path])=>{
    const vals=cols.map(c=>c.claims&&c.claims.has(k)?c.claims.get(k)[1]:null);
    const diff=cols.map((c,i)=>!!c.claims&&i!==base&&vals[i]!==vals[base]);
    return {path,vals,diff,same:!diff.some(Boolean)};
  });
  return {cols:cols.map(c=>c.error?{n:c.n,error:c.error}:{n:c.n}),base,rows};
}
// baseJson: the baseline's value, given only for a cell that differs from it
function jwtCmpValue(json,key,baseJson){
  const v=JSON.parse(json);
  if(Array.isArray(v)&&v.length){
    // one item per line; against a baseline array, its extra items are <ins> and the ones it lacks <del>
    const item=x=>typeof x==='string'?x:JSON.stringify(x),own=v.map(item);
    const b=baseJson&&Array.isArray(JSON.parse(baseJson))?JSON.parse(baseJson).map(item):null;
    const lines=own.map(s=>b&&!b.includes(s)?`<ins>${escHtml(s)}</ins>`:escHtml(s));
    const gone=b?b.filter(s=>!own.includes(s)):[];
    gone.forEach(s=>lines.push(`<del>${escHtml(s)}</del>`));
    return `<ul class="jwt-cmp-list">${lines.map(l=>`<li>${l}</li>`).join('')}</ul>`
      +(b&&!gone.length&&own.every(s=>b.includes(s))?'<span class="jwt-cmp-note">ลำดับต่าง</span>':'');
  }
  let s=typeof v==='string'?v:json;
  if(typeof v==='number'&&/^payload\.(iat|exp|nbf|auth_time)$/.test(key))s+=' ('+new Date(v*1000).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})+')';
  return escHtml(s);
}
// the boxes have no id on purpose: remembered inputs, history and share links only take fields with an id
function jwtCmpBoxes(){return Array.from(document.querySelectorAll('#jwt-cmp-boxes textarea'));}
function jwtCmpRender(vals){
  document.getElementById('jwt-cmp-boxes').innerHTML=vals.map((v,i)=>`<div class="jwt-cmp-box">
    <div class="field-head"><span class="field-label" id="jwt-cmp-l${i+1}">Token #${i+1}</span><span class="field-acts">${vals.length>2
      ?`<button type="button" class="field-act" aria-label="ลบช่อง Token #${i+1}" onclick="jwtCmpRemove(${i})">${ic('trash')}ลบช่อง</button>`:''}<button type="button" class="field-act" aria-label="ล้าง Token #${i+1}" onclick="jwtCmpClear(${i})">${ic('x')}ล้าง</button></span></div>
    <textarea rows="3" spellcheck="false" aria-labelledby="jwt-cmp-l${i+1}" placeholder="eyJhbGciOi..." oninput="jwtCompareUI()"></textarea>
    <div class="jwt-cmp-status"></div></div>`).join('');
  jwtCmpBoxes().forEach((el,i)=>{el.value=vals[i];});
  jwtCompareUI();
}
function jwtCmpAdd(){jwtCmpRender([...jwtCmpBoxes().map(el=>el.value),'']);jwtCmpBoxes().at(-1).focus();}
function jwtCmpRemove(i){const v=jwtCmpBoxes().map(el=>el.value);v.splice(i,1);jwtCmpRender(v);}
function jwtCmpClear(i){const el=jwtCmpBoxes()[i];el.value='';el.focus();jwtCompareUI();}
function clearJwtCompare(){jwtCmpRender(['','']);}
function jwtCompareUI(){
  const out=document.getElementById('jwt-cmp-result');
  const r=jwtCompare(jwtCmpBoxes().map(el=>el.value));
  const ready=r.cols.length>=2&&r.base>=0,b=ready?r.cols[r.base].n:0;
  const status=document.querySelectorAll('#jwt-cmp-boxes .jwt-cmp-status');
  status.forEach(el=>{el.textContent='';el.classList.remove('is-bad');});
  r.cols.forEach((c,i)=>{
    const el=status[c.n-1];
    if(c.error){el.innerHTML=`${ic('triangle-alert')} ${escHtml(c.error)}`;el.classList.add('is-bad');}
    else if(ready){const k=r.rows.filter(x=>x.diff[i]).length;el.textContent=i===r.base?'ตัวตั้ง: ช่องอื่นเทียบกับช่องนี้':k?`ต่างจาก Token #${b} ${k} รายการ`:`ตรงกับ Token #${b} ทุกรายการ`;}
  });
  if(!ready){out.innerHTML=`<p class="jwt-cmp-sum">${r.cols.length>=2?'ยังไม่มี token ที่ถอดได้':'กรอก token อย่างน้อย 2 ช่อง แล้วผลเทียบจะขึ้นที่นี่'}</p>`;return;}
  const nDiff=r.rows.filter(x=>!x.same).length,only=document.getElementById('jwt-cmp-only').checked;
  const rows=only?r.rows.filter(x=>!x.same):r.rows;
  const head=r.cols.map((c,i)=>`<th scope="col">Token #${c.n}${i===r.base?' <span class="jwt-cmp-note">ตัวตั้ง</span>':''}${c.error?' <span class="jwt-cmp-bad">ถอดไม่ได้</span>':''}</th>`).join('');
  // one tbody per part, named in its first row, so claims show without a header. / payload. prefix
  const body=['header','payload','signature'].map(g=>{
    const part=rows.filter(x=>x.path[0]===g),nd=part.filter(x=>!x.same).length;
    return part.length?`<tbody><tr class="jwt-cmp-group"><th scope="rowgroup" colspan="${r.cols.length+1}">${g.toUpperCase()}${nd?` <span class="jwt-cmp-badge">ต่าง ${nd}</span>`:''}</th></tr>${part.map(x=>{
      const key=x.path.join('.');
      return `<tr${x.same?'':' class="is-diff"'}><th scope="row">${escHtml(x.path.slice(1).join('.')||g)}${x.same?'':' <span class="jwt-cmp-badge">ต่าง</span>'}</th>${x.vals.map((v,i)=>
        `<td${x.diff[i]?' class="is-changed"':''}>${r.cols[i].error?'':v==null?'<span class="jwt-cmp-none">ไม่มี</span>':jwtCmpValue(v,key,x.diff[i]?x.vals[r.base]:null)}</td>`).join('')}</tr>`;
    }).join('')}</tbody>`:'';
  }).join('');
  out.innerHTML=`<p class="jwt-cmp-sum">เทียบ ${r.cols.length} token · ${nDiff?`ต่างกัน <b>${nDiff}</b> จาก ${r.rows.length} รายการ เทียบกับ Token #${b}`:'ทุกรายการตรงกัน'}</p>`
    +(rows.length?`<div class="jwt-cmp-table" tabindex="0" role="region" aria-label="ผลเปรียบเทียบ JWT"><table><thead><tr><th scope="col">claim</th>${head}</tr></thead>${body}</table></div>`:'');
}

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
  outEl.textContent = '';
  if (!payloadStr) { errEl.textContent = 'กรอก payload JSON'; errEl.style.display = 'block'; return; }
  if (!secret) { errEl.textContent = 'กรอก secret key'; errEl.style.display = 'block'; return; }
  let payload;
  try { payload = JSON.parse(payloadStr); } catch (e) { errEl.textContent = 'payload ไม่ใช่ JSON ที่ถูกต้อง: ' + e.message; errEl.style.display = 'block'; return; }
  try {
    const enc = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(header)));
    const payloadB64 = b64urlEncodeBytes(enc.encode(JSON.stringify(payload)));
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    outEl.textContent = `${data}.${b64urlEncodeBytes(new Uint8Array(sig))}`;
  } catch (e) {
    errEl.textContent = 'สร้าง token ไม่ได้: ' + e.message;
    errEl.style.display = 'block';
  }
}
// live once both payload and secret are filled
const jwtEncLive=debounced(()=>{
  if(document.getElementById('jwt-enc-payload').value.trim()&&document.getElementById('jwt-enc-secret').value)jwtEncode();
  else{document.getElementById('jwt-enc-output').textContent='';document.getElementById('jwt-enc-error').style.display='none';}
},300);
function clearJwtEnc() {
  document.getElementById('jwt-enc-payload').value = '';
  document.getElementById('jwt-enc-secret').value = '';
  document.getElementById('jwt-enc-output').textContent = '';
  document.getElementById('jwt-enc-error').style.display = 'none';
}
