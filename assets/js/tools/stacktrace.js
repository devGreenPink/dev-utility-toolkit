// ── STACK TRACE ANALYZER ── find the root cause, your own frames, and the matching reference entry
const ST_FRAMEWORK=['java.','javax.','jakarta.','jdk.','sun.','com.sun.','org.hibernate.','io.quarkus.','io.vertx.','io.netty.',
  'io.smallrye.','org.jboss.','io.agroal.','com.fasterxml.','org.apache.','org.eclipse.','com.ibm.db2.','org.mariadb.',
  'kotlin.','org.springframework.','org.postgresql.','com.mysql.','org.junit.','org.mockito.','net.bytebuddy.','org.glassfish.',
  'io.opentelemetry.','org.keycloak.','com.google.','org.slf4j.','ch.qos.','reactor.','io.reactivex.','org.wildfly.','io.micrometer.'];
const ST_HEAD=/^(?:Exception in thread "[^"]*"\s+|Caused by:\s+|Suppressed:\s+)?([A-Za-z_$][\w$]*(?:\.[\w$]+)+)(?::\s?(.*))?$/;
const ST_FRAME=/^\s*at\s+(?:[\w.$-]+(?:@[\w.-]+)?\/{1,2})?([\w$.<>-]+)\.([\w$<>-]+)\(([^)]*)\)/;

// Pure: text → {chain:[{type, message, frames:[{cls, method, file, line}], more}]}, outermost first
function stParse(text){
  const chain=[];
  let cur=null,skipping=false;
  for(const raw of String(text).replace(/\r/g,'').split('\n')){
    const line=raw.trim();
    if(!line)continue;
    const fm=line.match(ST_FRAME);
    if(fm){
      if(skipping)continue; // frames of a Suppressed: trace
      if(!cur){cur={type:'(unknown)',message:'',frames:[],more:0};chain.push(cur);}
      const [file,ln]=fm[3].split(':');
      cur.frames.push({cls:fm[1],method:fm[2],file:file||'',line:ln?+ln:null});
      continue;
    }
    const more=line.match(/^\.\.\.\s*(\d+)\s+(?:more|common frames omitted)/);
    if(more){if(cur&&!skipping)cur.more=+more[1];continue;}
    // header: plain, "Caused by:", or embedded after a log prefix ("... ERROR [x] msg: java.lang.X: boom")
    let hm=line.match(ST_HEAD);
    const isCause=/^(Caused by|Suppressed):/.test(line);
    if(!(hm&&(isCause||/(Exception|Error|Throwable|Fault)$/.test(hm[1])))){
      const emb=line.match(/((?:[A-Za-z_$][\w$]*\.)+[A-Za-z_$][\w$]*(?:Exception|Error|Throwable))(?::\s?(.*))?$/);
      hm=emb?[emb[0],emb[1],emb[2]]:null;
    }
    if(hm&&(!cur||cur.frames.length||isCause||!chain.length)){
      skipping=/^Suppressed:/.test(line); // suppressed traces don't change the root cause
      if(skipping)continue;
      cur={type:hm[1],message:(hm[2]||'').trim(),frames:[],more:0};
      chain.push(cur);
    }else if(cur&&!cur.frames.length){
      cur.message+=(cur.message?'\n':'')+line; // multi-line message
    }
  }
  return {chain};
}
function stIsFramework(cls,appPrefix){
  if(appPrefix&&cls.startsWith(appPrefix))return /_Subclass|_ClientProxy|\$\$/.test(cls);
  return ST_FRAMEWORK.some(p=>cls.startsWith(p))||/_Subclass|_ClientProxy|\$\$/.test(cls);
}
// Most common package (first 3 segments) among non-framework frames, e.g. "th.co.cdgs"
function stGuessApp(chain){
  const count={};
  chain.forEach(c=>c.frames.forEach(f=>{
    if(stIsFramework(f.cls,''))return;
    const p=f.cls.split('.').slice(0,3).join('.');
    count[p]=(count[p]||0)+1;
  }));
  const best=Object.entries(count).sort((a,b)=>b[1]-a[1])[0];
  return best?best[0]+'.':'';
}
function stSimple(type){return type.split('.').pop();}
// the same simple name lives in several packages (Hibernate vs Bean Validation ConstraintViolationException): prefer the package match
function stFindRef(type){
  const name=stSimple(type),pkg=type.slice(0,type.lastIndexOf('.'));
  const items=(REF_DOCS.javaex&&REF_DOCS.javaex.items)||[];
  const hits=items.filter(it=>it.t.split(/\s*\/\s*|\s*\+\s*|\s+\(/).some(n=>stSimple(n.trim())===name));
  return hits.find(it=>pkg&&(it.s||'').split(/\s*\/\s*/).some(p=>p&&pkg.startsWith(p)))||hits[0];
}
function stFindDb2(text){
  const m=String(text).match(/SQLCODE=(-?\d+)/i)||String(text).match(/ERRORCODE=(-\d+)/i);
  if(!m)return null;
  const code=m[1];
  const items=(REF_DOCS.db2err&&REF_DOCS.db2err.items)||[];
  return items.find(it=>it.b===code||it.b==='+'+code)||{b:code,t:'ไม่มีในรายการ ลองค้นในหน้า DB2 Error Codes',d:''};
}

// ── UI ──
const ST_SAMPLE=`2026-10-12 10:15:42,118 ERROR [io.qua.ver.htt.run.QuarkusErrorHandler] (executor-thread-3) HTTP Request to /api/wfcs/orders failed, error id: 3f1c: jakarta.persistence.PersistenceException: org.hibernate.exception.ConstraintViolationException: could not execute statement
\tat org.hibernate.internal.ExceptionConverterImpl.convert(ExceptionConverterImpl.java:165)
\tat org.hibernate.internal.SessionImpl.firePersist(SessionImpl.java:752)
\tat th.co.cdgs.ewfund.wfcs.service.OrderService.create(OrderService.java:88)
\tat th.co.cdgs.ewfund.wfcs.service.OrderService_Subclass.create$$superforward(Unknown Source)
\tat io.quarkus.narayana.jta.runtime.interceptor.TransactionalInterceptorRequired.intercept(TransactionalInterceptorRequired.java:32)
\tat th.co.cdgs.ewfund.wfcs.resource.OrderResource.create(OrderResource.java:41)
\tat io.quarkus.resteasy.reactive.server.runtime.QuarkusResteasyReactiveRequestContext.invokeHandler(QuarkusResteasyReactiveRequestContext.java:145)
Caused by: org.hibernate.exception.ConstraintViolationException: could not execute statement [DB2 SQL Error: SQLCODE=-803, SQLSTATE=23505, SQLERRMC=2;EWFUND.WFCS_ORDER, DRIVER=4.33.31]
\tat org.hibernate.exception.internal.SQLStateConversionDelegate.convert(SQLStateConversionDelegate.java:95)
\tat org.hibernate.engine.jdbc.batch.internal.BatchImpl.performExecution(BatchImpl.java:111)
\t... 42 more
Caused by: com.ibm.db2.jcc.am.SqlIntegrityConstraintViolationException: DB2 SQL Error: SQLCODE=-803, SQLSTATE=23505, SQLERRMC=2;EWFUND.WFCS_ORDER, DRIVER=4.33.31
\tat com.ibm.db2.jcc.am.b7.a(b7.java:806)
\tat com.ibm.db2.jcc.am.k3.executeUpdate(k3.java:479)
\tat io.agroal.pool.wrapper.PreparedStatementWrapper.executeUpdate(PreparedStatementWrapper.java:88)
\t... 47 more`;

let _stTimer=0;
function stLive(){clearTimeout(_stTimer);_stTimer=setTimeout(stAnalyze,300);}
function stLoadSample(){document.getElementById('st-input').value=ST_SAMPLE;stAnalyze();}
function stClear(){document.getElementById('st-input').value='';document.getElementById('st-output').innerHTML='';}
function stFrameHtml(f,app){
  const mine=!stIsFramework(f.cls,app);
  return `<li class="st-frame${mine?' mine':''}"><code>${escHtml(f.cls)}.<b>${escHtml(f.method)}</b>(${escHtml(f.file)}${f.line?':'+f.line:''})</code></li>`;
}
function stAnalyze(){
  const text=document.getElementById('st-input').value;
  const out=document.getElementById('st-output');
  if(!text.trim()){out.innerHTML='';return;}
  const {chain}=stParse(text);
  if(!chain.length){out.innerHTML=`<div class="ref-empty">${ic('search')}<div>ไม่เจอ exception ในข้อความ</div><div class="ref-empty-sub">วาง stack trace ที่มีบรรทัด "at ..." หรือ "Caused by: ..."</div></div>`;return;}
  const hideFw=document.getElementById('st-hide-fw').checked;
  const appInput=document.getElementById('st-app');
  const app=appInput.value.trim()||stGuessApp(chain);
  if(!appInput.value.trim())appInput.placeholder=app?`เดาจาก trace: ${app}`:'เช่น th.co.cdgs.';
  const root=chain[chain.length-1];
  const firstMine=chain.slice().reverse().flatMap(c=>c.frames).find(f=>!stIsFramework(f.cls,app));
  const ref=stFindRef(root.type)||chain.slice().reverse().map(c=>stFindRef(c.type)).find(Boolean);
  const db2=stFindDb2(text);
  let html=`<section class="card st-root"><div class="card-title">${ic('target')} ต้นเหตุ (root cause)</div>
    <div class="st-type">${escHtml(root.type)}</div>
    ${root.message?`<pre class="st-msg">${escHtml(root.message)}</pre>`:''}
    ${firstMine?`<div class="st-where">${ic('map-pin')} เกิดในโค้ดของเราที่ <code>${escHtml(firstMine.cls)}.${escHtml(firstMine.method)}(${escHtml(firstMine.file)}${firstMine.line?':'+firstMine.line:''})</code></div>`:`<div class="st-where">${ic('info')} ไม่เจอ frame ที่เป็นโค้ดของเรา ลองใส่ package ของโปรเจคในช่องด้านบน</div>`}
  </section>`;
  if(db2)html+=`<section class="card st-hint"><div class="card-title">${ic('database')} DB2 SQLCODE ${escHtml(db2.b)}</div><p class="ref-desc"><b>${escHtml(db2.t)}</b> ${db2.d?refInline(db2.d):''}</p>
    ${db2.fix?`<ul class="st-fix">${db2.fix.map(f=>`<li>${refInline(f)}</li>`).join('')}</ul>`:''}
    <button type="button" class="btn btn-ghost" onclick="refFocus('db2err','${escHtml(db2.b)}')">${ic('arrow-right')} เปิดในหน้า DB2 Error Codes</button></section>`;
  if(ref)html+=`<section class="card st-hint"><div class="card-title">${ic('lightbulb')} ${escHtml(ref.t)}</div><p class="ref-desc">${refInline(ref.d||'')}</p>
    ${ref.fix?`<ul class="st-fix">${ref.fix.map(f=>`<li>${refInline(f)}</li>`).join('')}</ul>`:''}
    <button type="button" class="btn btn-ghost" onclick="refFocus('javaex','${escHtml(stSimple(root.type))}')">${ic('arrow-right')} เปิดในหน้า Java Exceptions</button></section>`;
  html+=`<section class="card"><div class="card-title">${ic('list-tree')} ลำดับ exception (${chain.length} ชั้น, ตัวล่างสุดคือต้นเหตุ)</div><ol class="st-chain">`;
  chain.forEach((c,i)=>{
    const shown=hideFw?c.frames.filter(f=>!stIsFramework(f.cls,app)):c.frames;
    const hidden=c.frames.length-shown.length;
    html+=`<li class="${i===chain.length-1?'is-root':''}"><div class="st-ex"><span class="ref-badge ref-${i===chain.length-1?'red':'blue'}">${i===0?'บนสุด':i===chain.length-1?'ต้นเหตุ':'Caused by'}</span> <b>${escHtml(stSimple(c.type))}</b> <span class="st-pkg">${escHtml(c.type)}</span></div>
      ${c.message?`<div class="st-exmsg">${escHtml(c.message.length>300?c.message.slice(0,300)+'…':c.message)}</div>`:''}
      <ul class="st-frames">${shown.map(f=>stFrameHtml(f,app)).join('')}${hidden?`<li class="st-hidden">${ic('eye-off')} ซ่อน framework ${hidden} frame</li>`:''}${c.more?`<li class="st-hidden">... อีก ${c.more} frame ที่ซ้ำกับชั้นบน</li>`:''}</ul></li>`;
  });
  html+='</ol></section>';
  out.innerHTML=html;
}
