// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  restoreTheme();
  initFavorites();
  restoreTab();
  restoreNavSearch();

  // Restore saved timezone
  try{
    const savedTz=localStorage.getItem('esan-devtools-tz');
    if(savedTz){
      cronTz=savedTz;
      const sel=document.getElementById('cron-tz');
      if(sel){
        const opt=Array.from(sel.options).find(o=>o.value===savedTz);
        if(opt)sel.value=savedTz;
      }
    }
  }catch(e){}

  renderCmdList(KUBECTL_CMDS,'kubectl-list','');
  renderCmdList(LINUX_CMDS,'linux-list','');
  renderCmdList(GIT_CMDS,'git-list','');
  updateCronDisplay('* * * * *');

  // Real-time clock — update every second
  updateTzClock();
  setInterval(updateTzClock, 1000);

  initColorWheel();
  initHttp();
  // Init storage tab
  storIdbRender();
  storXssRender();
  storDtInit();
  storLocalRefresh();
  initJsonLineNumbers();
  lovInit();

  // Sync JSON Live checkbox state
  try {
    const liveChk = document.getElementById('json-live');
    if (liveChk) jsonLiveMode = liveChk.checked;
  } catch (e) {}

  // Auto-generate mock data on load
  generateAll();

  // Persist last input for key tools (restore on load, save on input)
  const PERSIST_FIELDS = [
    {id:'sql-input',     key:'esan-devtools-sql-last'},
    {id:'b64-input',     key:'esan-devtools-b64-last'},
    {id:'url-input',     key:'esan-devtools-url-last'},
    {id:'hash-input',    key:'esan-devtools-hash-last'},
    {id:'regex-pattern', key:'esan-devtools-regex-pat'},
    {id:'regex-flags',   key:'esan-devtools-regex-flg'},
    {id:'regex-input',   key:'esan-devtools-regex-txt'},
  ];
  PERSIST_FIELDS.forEach(({id, key}) => {
    const el = document.getElementById(id);
    if (!el) return;
    try { const saved = localStorage.getItem(key); if (saved !== null) el.value = saved; } catch(e) {}
    el.addEventListener('input', () => { try { localStorage.setItem(key, el.value); } catch(e) {} });
  });
  // Trigger post-restore reactions for tools that need it
  try {
    if (localStorage.getItem('esan-devtools-sql-last')) detectSqlMode(document.getElementById('sql-input').value);
    if (localStorage.getItem('esan-devtools-hash-last')) computeHash();
    if (localStorage.getItem('esan-devtools-regex-pat') || localStorage.getItem('esan-devtools-regex-txt')) runRegex();
  } catch(e) {}

  // Register Service Worker for PWA offline support (HTTPS only)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Scroll-to-top button
  const _scrollBtn=document.getElementById('scroll-top-btn');
  const _contentArea=document.querySelector('.content-area');
  if(_contentArea&&_scrollBtn)_contentArea.addEventListener('scroll',()=>_scrollBtn.classList.toggle('visible',_contentArea.scrollTop>200),{passive:true});
});
