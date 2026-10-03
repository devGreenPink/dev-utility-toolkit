// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  restoreTheme();
  initFavorites();
  restoreTab();
  restoreNavSearch();

  // Restore saved timezone
  try{
    const savedTz=localStorage.getItem('isaan-devtools-tz');
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
    {id:'sql-input',     key:'isaan-devtools-sql-last'},
    {id:'b64-input',     key:'isaan-devtools-b64-last'},
    {id:'url-input',     key:'isaan-devtools-url-last'},
    {id:'hash-input',    key:'isaan-devtools-hash-last'},
    {id:'regex-pattern', key:'isaan-devtools-regex-pat'},
    {id:'regex-flags',   key:'isaan-devtools-regex-flg'},
    {id:'regex-input',   key:'isaan-devtools-regex-txt'},
  ];
  PERSIST_FIELDS.forEach(({id, key}) => {
    const el = document.getElementById(id);
    if (!el) return;
    try { const saved = localStorage.getItem(key); if (saved !== null) el.value = saved; } catch(e) {}
    el.addEventListener('input', () => { try { localStorage.setItem(key, el.value); } catch(e) {} });
  });
  // Trigger post-restore reactions for tools that need it
  try {
    if (localStorage.getItem('isaan-devtools-sql-last')) detectSqlMode(document.getElementById('sql-input').value);
    if (localStorage.getItem('isaan-devtools-hash-last')) computeHash();
    if (localStorage.getItem('isaan-devtools-regex-pat') || localStorage.getItem('isaan-devtools-regex-txt')) runRegex();
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
