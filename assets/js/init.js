// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  restoreTheme();
  initFavorites();
  restoreNavGroups();
  restoreTab();
  restoreNavSearch();

  // cron, storage, cheatsheets, HTTP and LOV set themselves up on first open (TAB_INIT in core.js)
  initColorWheel();
  initJsonLineNumbers();

  // Sync JSON Live checkbox state
  try {
    const liveChk = document.getElementById('json-live');
    if (liveChk) jsonLiveMode = liveChk.checked;
  } catch (e) {}

  // Auto-generate mock data on load
  generateAll();

  // Restore every tool's last input (Settings → จำข้อมูลที่กรอกไว้)
  initRememberedInputs();
  applyShareLink(); // a shared link wins over what this browser remembered
  initHistory();

  // Register Service Worker for PWA offline support (HTTPS only)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
    (window.requestIdleCallback || (f => setTimeout(f, 3000)))(precacheLibs, { timeout: 10000 });
  }

  // Scroll-to-top button
  const _scrollBtn=document.getElementById('scroll-top-btn');
  const _contentArea=document.querySelector('.content-area');
  if(_contentArea&&_scrollBtn)_contentArea.addEventListener('scroll',()=>_scrollBtn.classList.toggle('visible',_contentArea.scrollTop>200),{passive:true});
});
