// ── CLAUDE CODE PATTERNS ──
// Markup lives in assets/tabs/claude-patterns-tab.html (fetched on first open), so nothing here runs at load.

// ── View + file switchers ──
function ccpView(v) {
  ['concept','files','tools','team'].forEach(x => document.getElementById('ccp-v-' + x)?.classList.toggle('mq-hidden', x !== v));
  setSegmented('ccp-view', v);
}
function ccpFile(v) {
  ['claude','intent','spec','plan','code'].forEach(x => document.getElementById('ccp-f-' + x)?.classList.toggle('mq-hidden', x !== v));
  setSegmented('ccp-file', v);
}

// ── Commit chain animation: lights each file in turn ──
let ccpChainTimer = null;
function ccpChain(run) {
  clearTimeout(ccpChainTimer);
  const nodes = document.querySelectorAll('#ccp-chain .mq-lc-node');
  const steps = document.querySelectorAll('#ccp-chain-steps .mq-lc-step');
  const label = document.getElementById('ccp-chain-label');
  nodes.forEach(n => n.classList.remove('mq-lc-active'));
  steps.forEach(s => s.classList.remove('mq-step-active'));
  label.textContent = 'กดเล่นเพื่อเริ่ม';
  if (!run) return;
  let i = 0;
  (function next() {
    if (i === nodes.length) { label.textContent = 'ครบห่วงโซ่ · git log ตอบได้ว่าใครขอ ใครทำ ใครอนุมัติ'; return; }
    nodes[i].classList.add('mq-lc-active');
    steps[i].classList.add('mq-step-active');
    label.textContent = `ขั้น ${i + 1}/${nodes.length}`;
    i++;
    ccpChainTimer = setTimeout(next, 1200);
  })();
}
