// ── HTTP STATUS CODES ──
const HTTP_CODES=[
  {code:100,name:'Continue',group:'1xx Informational',badgeClass:'s1xx',desc:'เซิร์ฟเวอร์ได้รับ request header แล้ว client สามารถส่ง body ต่อได้',example:'ใช้กับ Expect: 100-continue header ก่อนส่ง request body ขนาดใหญ่'},
  {code:101,name:'Switching Protocols',group:'1xx Informational',badgeClass:'s1xx',desc:'เซิร์ฟเวอร์กำลังเปลี่ยน protocol ตามที่ client ร้องขอ',example:'Upgrade จาก HTTP เป็น WebSocket'},
  {code:200,name:'OK',group:'2xx Success',badgeClass:'s2xx',desc:'คำขอสำเร็จ เซิร์ฟเวอร์ส่งผลลัพธ์กลับมาพร้อม response body',example:'GET /users → ส่งรายการ user กลับมา'},
  {code:201,name:'Created',group:'2xx Success',badgeClass:'s2xx',desc:'สร้าง resource ใหม่สำเร็จ มักมี Location header ชี้ไปยัง resource ที่สร้าง',example:'POST /users → สร้าง user ใหม่'},
  {code:202,name:'Accepted',group:'2xx Success',badgeClass:'s2xx',desc:'รับงานไว้แล้วแต่ยังทำไม่เสร็จ (ทำต่อเบื้องหลัง) มักตอบ id หรือ Location ไว้ถามสถานะทีหลัง',example:'สั่งออกรายงานใหญ่ → ได้ jobId แล้วค่อยดาวน์โหลดเมื่อเสร็จ'},
  {code:204,name:'No Content',group:'2xx Success',badgeClass:'s2xx',desc:'คำขอสำเร็จ แต่ไม่มีข้อมูลส่งกลับ ไม่มี response body',example:'DELETE /users/1 → ลบสำเร็จ ไม่ต้องส่งอะไรกลับ'},
  {code:206,name:'Partial Content',group:'2xx Success',badgeClass:'s2xx',desc:'ส่งข้อมูลบางส่วนกลับมาตาม Range header ที่ขอ',example:'ดาวน์โหลดไฟล์แบบ resume หรือ video streaming'},
  {code:301,name:'Moved Permanently',group:'3xx Redirection',badgeClass:'s3xx',desc:'URL นี้ถูกย้ายถาวรไปยัง URL ใหม่ใน Location header',example:'example.com → www.example.com (เปลี่ยน domain)'},
  {code:302,name:'Found',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายชั่วคราวไปยัง URL อื่นใน Location header · browser ส่วนใหญ่เปลี่ยน POST เป็น GET ตอนตามไป ถ้าต้องคง method เดิมใช้ 307',example:'Redirect หลัง login ไปยังหน้าหลัก'},
  {code:303,name:'See Other',group:'3xx Redirection',badgeClass:'s3xx',desc:'ให้ไปอ่านผลที่ URL อื่นด้วย GET เสมอ ใช้หลัง POST สำเร็จ (Post/Redirect/Get) กดรีเฟรชแล้วไม่ส่งฟอร์มซ้ำ',example:'POST /orders → 303 ไปที่ /orders/123'},
  {code:304,name:'Not Modified',group:'3xx Redirection',badgeClass:'s3xx',desc:'ข้อมูล cache ยังใช้ได้ ไม่ต้องดาวน์โหลดใหม่',example:'Browser cache hit โดยใช้ ETag หรือ Last-Modified'},
  {code:307,name:'Temporary Redirect',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายชั่วคราว รักษา HTTP method เดิม (POST ยังเป็น POST)',example:'Maintenance page redirect ชั่วคราว'},
  {code:308,name:'Permanent Redirect',group:'3xx Redirection',badgeClass:'s3xx',desc:'ย้ายถาวร รักษา HTTP method เดิม (เหมือน 301 แต่ method ไม่เปลี่ยน)',example:'Migration API v1 → v2 แบบ permanent'},
  {code:400,name:'Bad Request',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request ไม่ถูกต้อง เช่น JSON syntax ผิด หรือ parameter ขาด',example:'POST /users ส่ง JSON ขาด field required'},
  {code:401,name:'Unauthorized',group:'4xx Client Error',badgeClass:'s4xx',desc:'ต้องการ authentication แต่ไม่ได้ส่ง credentials หรือ token หมดอายุ',example:'เรียก API โดยไม่มี Authorization header',src:'แอป (@RolesAllowed / OIDC) หรือ Kong plugin jwt / key-auth'},
  {code:403,name:'Forbidden',group:'4xx Client Error',badgeClass:'s4xx',desc:'มีสิทธิ์เข้าถึงระบบ แต่ไม่มีสิทธิ์ทำ action นี้',example:'User ปกติพยายามเข้าถึง admin endpoint',src:'แอป (role ไม่พอ) หรือ Kong plugin ip-restriction / acl'},
  {code:404,name:'Not Found',group:'4xx Client Error',badgeClass:'s4xx',desc:'ไม่พบ resource ที่ร้องขอ อาจถูกลบหรือ URL ผิด',example:'GET /users/999 แต่ user id 999 ไม่มีในระบบ',src:'แอป หรือ Kong (no Route matched with those values)'},
  {code:405,name:'Method Not Allowed',group:'4xx Client Error',badgeClass:'s4xx',desc:'HTTP method ที่ใช้ไม่รองรับสำหรับ endpoint นี้',example:'ส่ง DELETE ไปที่ /users แต่รองรับแค่ GET, POST'},
  {code:409,name:'Conflict',group:'4xx Client Error',badgeClass:'s4xx',desc:'เกิดความขัดแย้งกับสถานะปัจจุบันของ resource',example:'สร้าง user ที่มี email ซ้ำในระบบ'},
  {code:410,name:'Gone',group:'4xx Client Error',badgeClass:'s4xx',desc:'Resource ถูกลบถาวรและไม่มีอีกต่อไป',example:'API endpoint เก่าที่ deprecated แล้ว'},
  {code:412,name:'Precondition Failed',group:'4xx Client Error',badgeClass:'s4xx',desc:'เงื่อนไขใน header (If-Match / ETag) ไม่ผ่าน ใช้กันแก้ข้อมูลทับกัน: มีคนแก้ไปก่อนแล้ว',example:'PUT พร้อม If-Match ของเวอร์ชันเก่า → 412 ให้โหลดข้อมูลใหม่ก่อนแก้'},
  {code:413,name:'Content Too Large',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request body ใหญ่เกินขีดจำกัดที่เซิร์ฟเวอร์รับได้',example:'อัปโหลดไฟล์เกิน limit ที่กำหนด',src:'ชั้นที่ limit ต่ำสุด: nginx (client_max_body_size), Kong หรือแอป (quarkus.http.limits.max-body-size)'},
  {code:415,name:'Unsupported Media Type',group:'4xx Client Error',badgeClass:'s4xx',desc:'Content-Type ของ body ไม่ตรงกับที่ endpoint รับ',example:'ส่ง JSON โดยไม่มี Content-Type: application/json ไปยัง endpoint ที่ @Consumes JSON',src:'แอป'},
  {code:422,name:'Unprocessable Entity',group:'4xx Client Error',badgeClass:'s4xx',desc:'Request format ถูกต้อง แต่ข้อมูลภายในไม่ผ่าน validation',example:'ส่งอีเมลไม่ถูกรูปแบบ หรือวันเกิดเป็น future date'},
  {code:429,name:'Too Many Requests',group:'4xx Client Error',badgeClass:'s4xx',desc:'ส่ง request เกิน rate limit ที่กำหนด',example:'เรียก API เกิน 100 ครั้ง/นาทีตามที่ตกลงไว้',src:'Kong plugin rate-limiting (API rate limit exceeded)'},
  {code:431,name:'Request Header Fields Too Large',group:'4xx Client Error',badgeClass:'s4xx',desc:'header ใหญ่เกิน มักเป็น cookie สะสมเยอะ หรือ token ที่ยาวมาก',example:'JWT ที่มี role เยอะ + cookie หลายตัว (nginx ตอบเป็น 400 Request Header Or Cookie Too Large)',src:'proxy หรือแอป'},
  {code:499,name:'Client Closed Request',group:'4xx Client Error',badgeClass:'s4xx',desc:'ไม่ใช่รหัสมาตรฐาน nginx บันทึกใน access log เมื่อ client ปิด connection ก่อนได้คำตอบ client ไม่เคยเห็นรหัสนี้',example:'รายงานใช้เวลานานจนผู้ใช้ปิดหน้า → access log ของ nginx เป็น 499',src:'nginx (เห็นใน log เท่านั้น)'},
  {code:500,name:'Internal Server Error',group:'5xx Server Error',badgeClass:'s5xx',desc:'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ที่ไม่ได้คาดไว้',example:'Exception ที่ไม่ถูก catch ใน application',src:'แอป: ดู log ของ Pod'},
  {code:501,name:'Not Implemented',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์ไม่รองรับ HTTP method ที่ร้องขอ',example:'ส่ง PATCH แต่ server ยังไม่ implement'},
  {code:502,name:'Bad Gateway',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์กลาง (proxy/gateway) ได้รับ response ที่ไม่ถูกต้องจาก upstream',example:'Nginx ไม่สามารถเชื่อมต่อกับ backend application',src:'proxy (nginx / Kong)'},
  {code:503,name:'Service Unavailable',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์ไม่พร้อมให้บริการชั่วคราว เช่น ปิดซ่อมหรือ overload',example:'Deploy ใหม่กำลังเริ่มขึ้น หรือ server load สูงเกิน',src:'Kong (failure to get a peer from the ring-balancer) หรือแอปที่กำลังปิด'},
  {code:504,name:'Gateway Timeout',group:'5xx Server Error',badgeClass:'s5xx',desc:'เซิร์ฟเวอร์กลางรอ response จาก upstream นานเกินไป',example:'Backend ทำ query หนักๆ และ timeout',src:'proxy ชั้นที่ timeout สั้นสุด (LB, Kong read-timeout, nginx proxy_read_timeout)'},
];
const HTTP_GROUPS=['ทั้งหมด','1xx Informational','2xx Success','3xx Redirection','4xx Client Error','5xx Server Error'];
let httpActiveGroup='ทั้งหมด';
function renderHttpList(codes,query){
  const container=document.getElementById('http-list');
  if(!codes.length){container.innerHTML='<div style="color:var(--text-dim);text-align:center;padding:40px;">ไม่พบ status code ที่ตรงกัน</div>';return;}
  const groups={};
  for(const c of codes){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);}
  let html='';
  for(const[grp,items]of Object.entries(groups)){
    html+=`<div class="kubectl-group"><div class="kubectl-group-title">${grp}</div>`;
    for(const item of items){
      const codeStr=String(item.code);
      const nameHl=query?highlightText(item.name,query):escHtml(item.name);
      const descHl=query?highlightText(item.desc,query):escHtml(item.desc);
      const exHl=query?highlightText(item.example,query):escHtml(item.example);
      const codeHl=query&&codeStr.includes(query)?`<span class="http-highlight">${codeStr}</span>`:codeStr;
      html+=`<div class="http-card">
        <div class="http-badge ${item.badgeClass}">${codeHl}</div>
        <div style="flex:1;min-width:0;">
          <div class="http-name">${nameHl}</div>
          <div class="http-desc">${descHl}</div>
          <div class="http-example">${ic('lightbulb')} ${exHl}</div>
          ${item.src?`<div class="http-src">${ic('server')} ใครตอบ: ${escHtml(item.src)}</div>`:''}
        </div>
        <button class="btn btn-ghost" style="flex-shrink:0;" onclick="copyText('${item.code}')">คัดลอก</button>
      </div>`;
    }
    html+='</div>';
  }
  container.innerHTML=html;
}
function filterHttp(q){
  const query=(q||'').trim().toLowerCase();
  let codes=HTTP_CODES;
  if(httpActiveGroup!=='ทั้งหมด')codes=codes.filter(c=>c.group===httpActiveGroup);
  if(query)codes=codes.filter(c=>String(c.code).includes(query)||c.name.toLowerCase().includes(query)||c.desc.toLowerCase().includes(query)||c.example.toLowerCase().includes(query)||c.group.toLowerCase().includes(query));
  renderHttpList(codes,query);
}
function setHttpGroup(grp){
  httpActiveGroup=grp;
  document.querySelectorAll('.http-group-btn').forEach(b=>b.classList.toggle('active',b.dataset.grp===grp));
  filterHttp(document.getElementById('http-search').value);
}
function clearHttp(){document.getElementById('http-search').value='';httpActiveGroup='ทั้งหมด';document.querySelectorAll('.http-group-btn').forEach(b=>b.classList.toggle('active',b.dataset.grp==='ทั้งหมด'));filterHttp('');}
// which layer answers which status (drawn by dgInit in refdocs.js)
const HTTP_DIAGRAMS=[
 {id:'who',t:'ใครตอบ status นี้',kind:'flow',
  intro:'status เดียวกันมาได้จากหลายชั้น ดูข้อความใน body หรือ header ว่าชั้นไหนตอบ แล้วไปแก้ที่ชั้นนั้น · รายละเอียดแต่ละชั้นอยู่ในหน้า Request Path',
  opt:{label:'ชั้นที่ request วิ่งผ่าน',errLabel:'status ที่ชั้นนี้ตอบได้',lang:'bash'},
  nodes:[
   {id:'browser',icon:'monitor',t:'Browser',s:'ฝั่งผู้ใช้',d:'ถ้า request ไม่ได้ออกไปถึง server จะไม่มี status ให้เห็น (Angular ได้ `status: 0` ใน `HttpErrorResponse`)',
    err:['status 0 = CORS ไม่ผ่าน, ต่อ server ไม่ได้ หรือ request ถูกยกเลิก','ดูแท็บ Network ใน DevTools ก่อนเสมอ']},
   {id:'nginx',icon:'shuffle',t:'nginx / Load Balancer',s:'proxy หน้าสุด',d:'ตอบเองเมื่อส่งต่อไม่ได้ หน้า error เป็น HTML ของ nginx',
    err:['413 = body ใหญ่เกิน `client_max_body_size`','502 = ต่อ upstream ไม่ได้ หรือ upstream ปิด connection','504 = upstream ตอบช้ากว่า `proxy_read_timeout`','499 = client ปิดก่อน (เห็นแค่ใน access log)']},
   {id:'kong',icon:'network',t:'Kong',s:'API gateway',d:'ตอบเป็น JSON `{"message": ...}` ที่มีข้อความเฉพาะของ Kong',
    err:['404 `no Route matched with those values` = ไม่มี Ingress ที่ host / path ตรง','401 = plugin jwt / key-auth ไม่ผ่าน','403 = ip-restriction / acl','429 `API rate limit exceeded` = plugin rate-limiting','503 `failure to get a peer from the ring-balancer` = ไม่มี Pod ที่ ready','504 = เกิน `konghq.com/read-timeout`']},
   {id:'app',icon:'container',t:'แอป (Quarkus)',s:'Pod',d:'ตอบตาม logic ของแอป สาเหตุอยู่ใน log ของ Pod',
    err:['400 = JSON ผิดรูป / validation ไม่ผ่าน','401 / 403 = token / `@RolesAllowed`','404 = path ไม่มีในแอป หรือหาข้อมูลไม่เจอ','405 / 415 = method หรือ Content-Type ไม่ตรง','500 = exception ที่ไม่ได้จัดการ']}]},
];
function initHttp(){
  dgInit('http',HTTP_DIAGRAMS);
  const btnContainer=document.getElementById('http-group-btns');
  btnContainer.innerHTML=HTTP_GROUPS.map(g=>`<button class="http-group-btn${g==='ทั้งหมด'?' active':''}" data-grp="${g}" onclick="setHttpGroup('${g}')">${g}</button>`).join('');
  renderHttpList(HTTP_CODES,'');
}
