// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  restoreTheme();
  initFavorites();
  restoreNavGroups();
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

  // Restore every tool's last input (Settings → จำข้อมูลที่กรอกไว้)
  initRememberedInputs();

  // Register Service Worker for PWA offline support (HTTPS only)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Scroll-to-top button
  const _scrollBtn=document.getElementById('scroll-top-btn');
  const _contentArea=document.querySelector('.content-area');
  if(_contentArea&&_scrollBtn)_contentArea.addEventListener('scroll',()=>_scrollBtn.classList.toggle('visible',_contentArea.scrollTop>200),{passive:true});
});
