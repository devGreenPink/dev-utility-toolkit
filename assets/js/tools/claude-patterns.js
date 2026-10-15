// ── CLAUDE CODE PATTERNS + AGENTIC & SECURITY ──
// Markup lives in assets/tabs/claude-patterns-tab.html and claude-agentic-tab.html (fetched on first open),
// so nothing here runs at load.

// ── View + file switchers ──
function ccpView(v) {
  ['concept','files','tools','team'].forEach(x => document.getElementById('ccp-v-' + x)?.classList.toggle('mq-hidden', x !== v));
  setSegmented('ccp-view', v);
}
function ccpFile(v) {
  ['claude','intent','spec','plan','code'].forEach(x => document.getElementById('ccp-f-' + x)?.classList.toggle('mq-hidden', x !== v));
  setSegmented('ccp-file', v);
}
function ccaView(v) {
  ['loop','workflow','mcp','security','plan'].forEach(x => document.getElementById('cca-v-' + x)?.classList.toggle('mq-hidden', x !== v));
  setSegmented('cca-view', v);
}

// ── Step chain animation: lights each node in turn (#<root>, #<root>-steps, #<root>-label) ──
const ccpChainTimers = {};
const CCP_CHAIN_DONE = {
  'ccp-chain': 'ครบห่วงโซ่ · git log ตอบได้ว่าใครขอ ใครทำ ใครอนุมัติ',
  'cca-loop': 'ครบ loop · ผ่านเมื่อไรจบ ไม่ผ่านครบเพดานแล้วส่งให้คน',
};
function ccpChain(run, root = 'ccp-chain') {
  clearTimeout(ccpChainTimers[root]);
  const nodes = document.querySelectorAll(`#${root} .mq-lc-node`);
  const steps = document.querySelectorAll(`#${root}-steps .mq-lc-step`);
  const label = document.getElementById(root + '-label');
  nodes.forEach(n => n.classList.remove('mq-lc-active'));
  steps.forEach(s => s.classList.remove('mq-step-active'));
  label.textContent = 'กดเล่นเพื่อเริ่ม';
  if (!run) return;
  let i = 0;
  (function next() {
    if (i === nodes.length) { label.textContent = CCP_CHAIN_DONE[root]; return; }
    nodes[i].classList.add('mq-lc-active');
    steps[i].classList.add('mq-step-active');
    label.textContent = `ขั้น ${i + 1}/${nodes.length}`;
    i++;
    ccpChainTimers[root] = setTimeout(next, 1200);
  })();
}
