// ── MQ TAB: RabbitMQ · Redis · Quarkus ──

// ── View switcher ──
function mqSwitchView(view) {
  ['rabbit','redis','quarkus'].forEach(v => {
    const el = document.getElementById('mq-' + v + '-view');
    const btn = document.getElementById('mq-vtab-' + v);
    if (!el || !btn) return;
    el.classList.toggle('mq-hidden', v !== view);
    btn.classList.toggle('mq-view-tab-active', v === view);
  });
}

// ── Exchange type tabs ──
function mqExTab(btn, type) {
  document.querySelectorAll('.mq-ex-tab').forEach(b => b.classList.remove('mq-ex-active'));
  btn.classList.add('mq-ex-active');
  ['direct','fanout','topic','headers'].forEach(t => {
    const el = document.getElementById('mq-ex-' + t);
    if (el) el.classList.toggle('mq-ex-hidden', t !== type);
  });
}

// ── Redis data structure tabs ──
function mqDsTab(btn, type) {
  document.querySelectorAll('.mq-ds-tab').forEach(b => b.classList.remove('mq-ds-active'));
  btn.classList.add('mq-ds-active');
  ['string','hash','list','set','zset'].forEach(t => {
    const el = document.getElementById('mq-ds-' + t);
    if (el) el.classList.toggle('mq-ds-hidden', t !== type);
  });
}

// ── application.properties tabs ──
function mqPropsTab(btn, id) {
  document.querySelectorAll('.mq-props-tab').forEach(b => b.classList.remove('mq-props-active'));
  btn.classList.add('mq-props-active');
  ['rabbit-props','redis-props'].forEach(pid => {
    const el = document.getElementById('mq-' + pid);
    if (el) el.classList.toggle('mq-hidden', pid !== id);
  });
}

// ── Copy code button ──
function mqCopyCode(btn) {
  const pre = btn.nextElementSibling;
  if (!pre) return;
  copyText(pre.textContent || pre.innerText);
  const orig = btn.textContent;
  btn.textContent = '✓ copied';
  setTimeout(() => { btn.textContent = orig; }, 1500);
}

// ── Reset animation helpers ──
function mqResetAnim(name) {
  if (name === 'lifecycle') {
    ['mq-lc-producer','mq-lc-exchange','mq-lc-queue','mq-lc-consumer'].forEach(id => {
      document.getElementById(id)?.classList.remove('mq-lc-active');
    });
    const msg1 = document.getElementById('mq-lc-msg1');
    const msg2 = document.getElementById('mq-lc-msg2');
    const msg3 = document.getElementById('mq-lc-msg3');
    if (msg1) { msg1.style.left = '10%'; }
    if (msg2) { msg2.classList.add('mq-lc-msg-hidden'); msg2.style.left = '10%'; }
    if (msg3) { msg3.classList.add('mq-lc-msg-hidden'); msg3.style.left = '10%'; }
    const ackLine = document.querySelector('.mq-lc-ack-line');
    const ackLabel = document.getElementById('mq-lc-ack');
    if (ackLine) ackLine.classList.remove('mq-ack-show');
    if (ackLabel) ackLabel.classList.remove('mq-ack-show');
    const qItems = document.getElementById('mq-lc-queue-items');
    if (qItems) qItems.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      document.getElementById('mq-lcs-' + i)?.classList.remove('mq-step-active');
    }
    const stepLabel = document.getElementById('mq-lifecycle-step');
    if (stepLabel) stepLabel.textContent = 'กด ▶ เพื่อเริ่ม';
  }
  if (name === 'cache') {
    ['mq-cache-app','mq-cache-redis-node','mq-cache-db-node'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('mq-node-active','mq-node-hit','mq-node-miss'); }
    });
    const conn2 = document.getElementById('mq-cache-conn2');
    if (conn2) conn2.classList.remove('mq-conn-active');
    ['mq-cache-msg1','mq-cache-msg2','mq-cache-time1','mq-cache-time2'].forEach(id => {
      const el = document.getElementById(id); if (el) el.textContent = '';
    });
    const status = document.getElementById('mq-cache-redis-status');
    if (status) { status.textContent = ''; status.style.color = ''; }
    const steps = document.getElementById('mq-cache-steps');
    if (steps) steps.innerHTML = '<div class="mq-lc-step" id="mq-cache-s0">กด ✅ Cache Hit หรือ ❌ Cache Miss เพื่อดู flow</div>';
    const stepLabel = document.getElementById('mq-cache-step');
    if (stepLabel) stepLabel.textContent = 'เลือก Hit หรือ Miss เพื่อดู animation';
  }
  if (name === 'pubsub') {
    document.getElementById('mq-ps-pub')?.classList.remove('mq-ps-active');
    const msg = document.getElementById('mq-ps-msg');
    if (msg) { msg.textContent = ''; msg.classList.remove('mq-msg-show'); }
    [1,2,3].forEach(i => {
      document.getElementById('mq-ps-sub' + i)?.classList.remove('mq-sub-lit');
      const r = document.getElementById('mq-ps-recv' + i);
      if (r) r.textContent = '';
    });
    const stepLabel = document.getElementById('mq-pubsub-step');
    if (stepLabel) stepLabel.textContent = 'กด ▶ เพื่อเริ่ม';
  }
}

// ── Lifecycle animation ──
let mqLcTimer = null;
function mqRunAnim(name) {
  if (name === 'lifecycle') {
    if (mqLcTimer) clearTimeout(mqLcTimer);
    mqResetAnim('lifecycle');
    const setStep = (i, label) => {
      for (let j = 0; j < 5; j++) document.getElementById('mq-lcs-' + j)?.classList.remove('mq-step-active');
      document.getElementById('mq-lcs-' + i)?.classList.add('mq-step-active');
      const sl = document.getElementById('mq-lifecycle-step');
      if (sl) sl.textContent = label;
    };
    const steps = [
      // Step 0: highlight Producer, animate msg1 across to Exchange
      () => {
        setStep(0, 'Step 1: Producer publish message ไปที่ Exchange');
        document.getElementById('mq-lc-producer')?.classList.add('mq-lc-active');
        const msg1 = document.getElementById('mq-lc-msg1');
        if (msg1) { msg1.style.left = '10%'; }
        setTimeout(() => { if (msg1) msg1.style.left = '85%'; }, 100);
      },
      // Step 1: highlight Exchange, msg arrives
      () => {
        setStep(1, 'Step 2: Exchange ตรวจ routing key → ส่งไปยัง Queue ที่ match');
        document.getElementById('mq-lc-producer')?.classList.remove('mq-lc-active');
        document.getElementById('mq-lc-exchange')?.classList.add('mq-lc-active');
        const msg2 = document.getElementById('mq-lc-msg2');
        if (msg2) { msg2.classList.remove('mq-lc-msg-hidden'); msg2.style.left = '10%'; }
        setTimeout(() => { if (msg2) msg2.style.left = '85%'; }, 100);
      },
      // Step 2: Queue fills up
      () => {
        setStep(2, 'Step 3: Message เข้า Queue รอ Consumer ดึงไปประมวลผล');
        document.getElementById('mq-lc-exchange')?.classList.remove('mq-lc-active');
        document.getElementById('mq-lc-queue')?.classList.add('mq-lc-active');
        const qi = document.getElementById('mq-lc-queue-items');
        if (qi) { qi.innerHTML = ''; ['📨','📨','📨'].forEach(e => { const d = document.createElement('span'); d.className = 'mq-lc-qi'; d.textContent = e; qi.appendChild(d); }); }
      },
      // Step 3: Consumer receives
      () => {
        setStep(3, 'Step 4: Consumer ดึง message ออกจาก Queue');
        document.getElementById('mq-lc-queue')?.classList.remove('mq-lc-active');
        document.getElementById('mq-lc-consumer')?.classList.add('mq-lc-active');
        const msg3 = document.getElementById('mq-lc-msg3');
        if (msg3) { msg3.classList.remove('mq-lc-msg-hidden'); msg3.style.left = '10%'; }
        setTimeout(() => { if (msg3) msg3.style.left = '85%'; }, 100);
        const qi = document.getElementById('mq-lc-queue-items');
        if (qi) setTimeout(() => { if (qi.lastChild) qi.removeChild(qi.lastChild); }, 400);
      },
      // Step 4: ack
      () => {
        setStep(4, 'Step 5: Consumer ส่ง ack → RabbitMQ ลบ message ออกจาก Queue');
        const ackLine = document.querySelector('.mq-lc-ack-line');
        const ackLabel = document.getElementById('mq-lc-ack');
        if (ackLine) ackLine.classList.add('mq-ack-show');
        if (ackLabel) ackLabel.classList.add('mq-ack-show');
        document.getElementById('mq-lc-consumer')?.classList.remove('mq-lc-active');
      },
    ];
    let idx = 0;
    const run = () => {
      if (idx >= steps.length) return;
      steps[idx]();
      idx++;
      if (idx < steps.length) mqLcTimer = setTimeout(run, 1400);
    };
    run();
  }

  if (name === 'pubsub') {
    mqResetAnim('pubsub');
    const pub = document.getElementById('mq-ps-pub');
    const msg = document.getElementById('mq-ps-msg');
    const stepLabel = document.getElementById('mq-pubsub-step');
    if (pub) pub.classList.add('mq-ps-active');
    if (stepLabel) stepLabel.textContent = 'Step 1: Publisher ส่ง PUBLISH ไปที่ channel "news"';
    setTimeout(() => {
      if (msg) { msg.textContent = '"ข่าวด่วน"'; msg.classList.add('mq-msg-show'); }
      if (stepLabel) stepLabel.textContent = 'Step 2: Channel broadcast ไปยัง Subscriber ทุกตัว';
    }, 700);
    [1,2,3].forEach((i, idx) => {
      setTimeout(() => {
        const sub = document.getElementById('mq-ps-sub' + i);
        const recv = document.getElementById('mq-ps-recv' + i);
        if (sub) sub.classList.add('mq-sub-lit');
        if (recv) recv.textContent = '← "ข่าวด่วน"';
        if (i === 3 && stepLabel) stepLabel.textContent = 'Step 3: Sub A, B, C ได้รับ message พร้อมกัน';
      }, 1400 + idx * 350);
    });
  }
}

// ── Cache hit/miss animation ──
function mqCacheAnim(type) {
  mqResetAnim('cache');
  const appNode   = document.getElementById('mq-cache-app');
  const redisNode = document.getElementById('mq-cache-redis-node');
  const dbNode    = document.getElementById('mq-cache-db-node');
  const conn2     = document.getElementById('mq-cache-conn2');
  const msg1      = document.getElementById('mq-cache-msg1');
  const msg2      = document.getElementById('mq-cache-msg2');
  const time1     = document.getElementById('mq-cache-time1');
  const time2     = document.getElementById('mq-cache-time2');
  const status    = document.getElementById('mq-cache-redis-status');
  const stepsEl   = document.getElementById('mq-cache-steps');
  const stepLabel = document.getElementById('mq-cache-step');

  const setSteps = (html) => { if (stepsEl) stepsEl.innerHTML = html; };

  // Step 1: App queries Redis
  if (appNode) appNode.classList.add('mq-node-active');
  if (msg1) msg1.textContent = 'GET product:123';
  if (stepLabel) stepLabel.textContent = 'Step 1: App ขอข้อมูลจาก Redis';

  setTimeout(() => {
    if (type === 'hit') {
      // Redis HIT
      if (redisNode) { redisNode.classList.add('mq-node-hit'); redisNode.classList.add('mq-node-active'); }
      if (status) { status.textContent = '✅ HIT'; status.style.color = 'var(--success)'; }
      if (time1) time1.textContent = '~1ms';
      setSteps(`
        <div class="mq-lc-step mq-step-active">1. App ส่ง GET product:123 ไปที่ Redis</div>
        <div class="mq-lc-step mq-step-active">2. Redis ✅ HIT — มีข้อมูลใน cache</div>
        <div class="mq-lc-step mq-step-active">3. คืนข้อมูลทันที ~1ms — ไม่ต้องไป DB</div>
      `);
      if (stepLabel) stepLabel.textContent = 'Cache HIT — คืนข้อมูลจาก Redis ~1ms';
      if (msg2) msg2.textContent = '';
      setTimeout(() => { if (appNode) appNode.classList.remove('mq-node-active'); }, 600);
    } else {
      // Redis MISS
      if (redisNode) { redisNode.classList.add('mq-node-miss'); }
      if (status) { status.textContent = '❌ MISS'; status.style.color = 'var(--danger)'; }
      if (stepLabel) stepLabel.textContent = 'Step 2: Cache MISS → ไป query DB';
      setSteps(`<div class="mq-lc-step mq-step-active">1. App ส่ง GET product:123 → Redis ❌ MISS (key ไม่มี)</div>`);
      // Go to DB
      setTimeout(() => {
        if (conn2) conn2.classList.add('mq-conn-active');
        if (dbNode) dbNode.classList.add('mq-node-active');
        if (msg2) msg2.textContent = 'SELECT * FROM products WHERE id=123';
        if (time2) time2.textContent = '~50-200ms';
        if (stepLabel) stepLabel.textContent = 'Step 3: Query DB — ช้ากว่า 50-200x';
        setSteps(`
          <div class="mq-lc-step mq-step-active">1. Redis ❌ MISS</div>
          <div class="mq-lc-step mq-step-active">2. App query DB (SELECT ...) — ~50-200ms</div>
        `);
        setTimeout(() => {
          if (dbNode) dbNode.classList.remove('mq-node-active');
          if (redisNode) redisNode.classList.add('mq-node-active');
          if (status) { status.textContent = 'SET + EX 300'; status.style.color = 'var(--accent2)'; }
          if (stepLabel) stepLabel.textContent = 'Step 4: Store ใน Redis พร้อม TTL 300s';
          setSteps(`
            <div class="mq-lc-step mq-step-active">1. Redis ❌ MISS</div>
            <div class="mq-lc-step mq-step-active">2. DB query สำเร็จ (~50ms)</div>
            <div class="mq-lc-step mq-step-active">3. SET product:123 "{...}" EX 300 → store ใน Redis</div>
            <div class="mq-lc-step mq-step-active">4. Request ถัดไปจะ Cache HIT ทันที</div>
          `);
        }, 800);
      }, 500);
    }
  }, 700);
}

// ── Queue fill/drain simulation ──
let mqQFillTimer = null;
let mqQConsTimer = null;
let mqQRunning = false;
let mqQItems = [];
const MQ_Q_MAX = 10;

function mqToggleQFill() {
  if (mqQRunning) {
    mqQRunning = false;
    clearInterval(mqQFillTimer);
    clearInterval(mqQConsTimer);
    mqQFillTimer = null; mqQConsTimer = null;
    const btn = document.getElementById('mq-qfill-btn');
    if (btn) btn.textContent = '▶ เริ่ม Producer เร็ว';
    const status = document.getElementById('mq-qfill-status');
    if (status) status.textContent = 'หยุด';
  } else {
    mqQRunning = true;
    const btn = document.getElementById('mq-qfill-btn');
    if (btn) btn.textContent = '⏸ หยุด';
    // Producer adds 1 msg per second
    mqQFillTimer = setInterval(() => {
      if (mqQItems.length < MQ_Q_MAX) {
        mqQItems.push('📨');
        mqRenderQ();
      }
      const status = document.getElementById('mq-qfill-status');
      if (status) {
        if (mqQItems.length >= MQ_Q_MAX) status.textContent = '⚠️ Queue เต็ม! Producer ถูกบล็อกหรือ message หาย';
        else status.textContent = 'Queue กำลังเต็ม... Consumer ดึงช้ากว่า';
      }
    }, 1000);
    // Consumer drains 1 msg per 3 seconds
    mqQConsTimer = setInterval(() => {
      if (mqQItems.length > 0) {
        mqQItems.pop();
        mqRenderQ();
      }
    }, 3000);
  }
}

function mqRenderQ() {
  const q = document.getElementById('mq-qf-queue');
  const bar = document.getElementById('mq-qf-bar');
  const cnt = document.getElementById('mq-qf-count');
  if (!q) return;
  q.innerHTML = mqQItems.map(i => `<span class="mq-qf-item">${i}</span>`).join('');
  const pct = (mqQItems.length / MQ_Q_MAX) * 100;
  if (bar) { bar.style.width = pct + '%'; bar.classList.toggle('mq-bar-full', pct >= 100); }
  if (cnt) cnt.textContent = mqQItems.length;
}

function mqResetQFill() {
  mqQRunning = false;
  clearInterval(mqQFillTimer); clearInterval(mqQConsTimer);
  mqQFillTimer = null; mqQConsTimer = null;
  mqQItems = [];
  mqRenderQ();
  const btn = document.getElementById('mq-qfill-btn');
  if (btn) btn.textContent = '▶ เริ่ม Producer เร็ว';
  const status = document.getElementById('mq-qfill-status');
  if (status) status.textContent = 'Queue ว่าง · Consumer หยุดรอ';
}
