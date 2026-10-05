// ── ANGULAR LIFECYCLE ──
const NG_HOOKS=[
  {id:'constructor',name:'constructor()',iface:null,phase:['create'],freq:'once',fires_on:['create'],
   desc:'สร้าง instance ของ component — Angular inject dependencies ที่นี่ก่อนสิ่งอื่นทั้งหมด',
   when:['inject services ผ่าน DI','initialize ค่าเริ่มต้นที่ไม่ต้องการ DOM หรือ @Input'],
   avoid:['เรียก HTTP requests — @Input ยังไม่พร้อม','เข้าถึง DOM — ยังไม่ render','logic ซับซ้อน — ย้ายไป ngOnInit'],
   tip:'ใช้แค่ inject dependencies + assign ค่าง่ายๆ เท่านั้น',
   code:'constructor(\n  private userService: UserService,\n  private router: Router\n) {\n  // inject เท่านั้น — ห้าม logic, HTTP call\n}'},
  {id:'ngOnChanges',name:'ngOnChanges(changes)',iface:'OnChanges',phase:['create','update'],freq:'on-input-change',fires_on:['create','update'],
   desc:'เรียกทุกครั้งที่ @Input property เปลี่ยน — รวมถึงครั้งแรกที่ create (ก่อน ngOnInit)',
   when:['react ต่อการเปลี่ยน @Input','เปรียบเทียบ previousValue กับ currentValue','reset state เมื่อ @Input เปลี่ยน'],
   avoid:['logic หนักโดยไม่ check firstChange','pass object/array แบบ mutate — reference เดิม Angular ตรวจไม่เจอ'],
   tip:"ใช้ changes['prop'].firstChange เพื่อแยก 'สร้างครั้งแรก' กับ 'update'",
   code:"ngOnChanges(changes: SimpleChanges): void {\n  if (changes['userId'] && !changes['userId'].firstChange) {\n    // @Input เปลี่ยนหลัง init — โหลดข้อมูลใหม่\n    this.loadUser(changes['userId'].currentValue);\n  }\n}"},
  {id:'ngOnInit',name:'ngOnInit()',iface:'OnInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง ngOnChanges ครั้งแรก — @Input พร้อม เหมาะที่สุดสำหรับ initialization',
   when:['fetch data จาก API','subscribe to Observables','initialize component state โดยใช้ @Input'],
   avoid:['เข้าถึง @ViewChild — DOM ยังไม่พร้อม','ใส่ logic ที่ต้องรู้ DOM'],
   tip:'Best place สำหรับ initialization ทั้งหมด — ย้าย HTTP call จาก constructor มาที่นี่เสมอ',
   code:"ngOnInit(): void {\n  // ✅ ที่ที่ดีที่สุดสำหรับ initialization\n  this.userId = this.route.snapshot.params['id'];\n  this.user$ = this.userService.getUser(this.userId).pipe(\n    takeUntil(this.destroy$)\n  );\n}"},
  {id:'ngDoCheck',name:'ngDoCheck()',iface:'DoCheck',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก Change Detection cycle — ใช้ detect การเปลี่ยนที่ Angular ตรวจไม่เจอเอง เช่น object mutate',
   when:['ต้องการ custom change detection','ตรวจ array/object ที่ mutate โดยไม่เปลี่ยน reference'],
   avoid:['logic หนักทุกชนิด — runs ทุก click, keystroke, async event','ส่วนใหญ่ใช้ ngOnChanges แทนได้และดีกว่า'],
   tip:'⚠️ hook ที่ run บ่อยที่สุด — ใส่แค่ early return + O(1) operation เท่านั้น',
   code:'ngDoCheck(): void {\n  // ⚠️ ทำงานทุก CD cycle — ต้องเร็วมาก\n  if (this.items.length !== this.prevLength) {\n    this.prevLength = this.items.length;\n    this.recalculate(); // O(1) เท่านั้น!\n  }\n}'},
  {id:'ngAfterContentInit',name:'ngAfterContentInit()',iface:'AfterContentInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง Angular project content จาก parent (<ng-content>) เข้า component เสร็จ',
   when:['เข้าถึง @ContentChild / @ContentChildren','init logic ที่ต้องรอ projected content พร้อม'],
   avoid:['component ที่ไม่มี <ng-content> — hook นี้ไม่มีประโยชน์'],
   tip:'Content = HTML ที่ parent ส่งมาผ่าน <ng-content> ไม่ใช่ template ของ component เอง',
   code:'@ContentChild(TabHeaderComponent)\nheader!: TabHeaderComponent;\n\nngAfterContentInit(): void {\n  // ✅ projected content พร้อมแล้ว\n  this.header.setActive(true);\n}'},
  {id:'ngAfterContentChecked',name:'ngAfterContentChecked()',iface:'AfterContentChecked',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก CD cycle หลัง Angular check projected content (<ng-content>) เสร็จ',
   when:['ต้องการ react หลัง content projection ถูก check และ update'],
   avoid:['เปลี่ยน @ContentChild properties ที่ผูกกับ template — ExpressionChangedAfterItHasBeenCheckedError','logic หนัก — runs ทุก CD cycle'],
   tip:'⚠️ ระวัง ExpressionChangedAfterItHasBeenCheckedError ถ้าเปลี่ยน binding ที่นี่',
   code:'ngAfterContentChecked(): void {\n  // ⚠️ ทำงานทุก CD cycle หลัง check content\n  // ห้ามเปลี่ยน bound properties — ExpressionChangedError\n}'},
  {id:'ngAfterViewInit',name:'ngAfterViewInit()',iface:'AfterViewInit',phase:['create'],freq:'once',fires_on:['create'],
   desc:'เรียกครั้งเดียวหลัง Angular render view ของ component และ child components เสร็จ — DOM พร้อมทั้งหมด',
   when:['เข้าถึง @ViewChild / @ViewChildren','init third-party DOM libraries (Chart.js, maps, D3)','measure DOM element sizes'],
   avoid:['ย้ายมาจาก ngOnInit เท่านั้น — ngOnInit DOM ยังไม่พร้อม'],
   tip:'First place ที่ DOM พร้อม 100% — @ViewChild ทุกตัว accessible ที่นี่',
   code:"@ViewChild('chart') chartRef!: ElementRef;\n\nngAfterViewInit(): void {\n  // ✅ DOM พร้อม 100% — เข้าถึง ViewChild ได้\n  this.chart = new Chart(\n    this.chartRef.nativeElement,\n    this.chartConfig\n  );\n}"},
  {id:'ngAfterViewChecked',name:'ngAfterViewChecked()',iface:'AfterViewChecked',phase:['update'],freq:'every-cd',fires_on:['create','update','cd'],
   desc:'เรียกทุก CD cycle หลัง Angular check view ของ component และ child views เสร็จ',
   when:['ต้องการ react หลัง view update เสร็จทุกครั้ง — ใช้น้อยมากในทางปฏิบัติ'],
   avoid:['detectChanges() ที่นี่ — infinite loop','เปลี่ยน data binding — ExpressionChangedAfterItHasBeenCheckedError','heavy logic — runs บ่อยมาก'],
   tip:'⚠️ Hook อันตรายที่สุด — ส่วนใหญ่ไม่ควรใช้ ถ้าต้องใช้ ให้ early return เสมอ',
   code:'ngAfterViewChecked(): void {\n  // ⚠️ DANGER ZONE — ทำงานทุก CD cycle\n  // ห้ามเรียก detectChanges() — infinite loop\n  // ห้ามเปลี่ยน data binding — ExpressionChangedError\n}'},
  {id:'ngOnDestroy',name:'ngOnDestroy()',iface:'OnDestroy',phase:['destroy'],freq:'once',fires_on:['destroy'],
   desc:'เรียกก่อน Angular ทำลาย component — cleanup ทุกอย่างที่นี่เพื่อป้องกัน memory leak',
   when:['unsubscribe Observables','clearInterval / clearTimeout','remove event listeners','destroy third-party libraries'],
   avoid:['ลืม implement — memory leak ทันที'],
   tip:'ใช้ Subject + takeUntil pattern เพื่อ unsubscribe ทุก Observable ในคำสั่งเดียว',
   code:'private destroy$ = new Subject<void>();\n\nngOnInit(): void {\n  interval(1000).pipe(\n    takeUntil(this.destroy$)\n  ).subscribe(t => this.tick = t);\n}\n\nngOnDestroy(): void {\n  // ✅ cleanup ทุกอย่าง — ป้องกัน memory leak\n  this.destroy$.next();\n  this.destroy$.complete();\n}'}
];

const NG_SCENARIOS={
  create: ['constructor','ngOnChanges','ngOnInit','ngDoCheck','ngAfterContentInit','ngAfterContentChecked','ngAfterViewInit','ngAfterViewChecked'],
  update: ['ngOnChanges','ngDoCheck','ngAfterContentChecked','ngAfterViewChecked'],
  cd:     ['ngDoCheck','ngAfterContentChecked','ngAfterViewChecked'],
  destroy:['ngOnDestroy']
};
const NG_PC={'create':'#22d3ee','update':'#fbbf24','destroy':'#f87171'};
const NG_FC={'once':'#34d399','every-cd':'#f87171','on-input-change':'#fbbf24'};
const NG_FL={'once':'เรียกครั้งเดียว','every-cd':'ทุก CD cycle ⚠️','on-input-change':'ทุกครั้งที่ @Input เปลี่ยน'};
let ngTimer=null,ngQ='';

function hlTS(code){return window.hljs?window.hljs.highlight(code,{language:'typescript'}).value:escHtml(code);}

function initAngular(){renderNgTimeline();renderNgHooks();renderNgDetail(null);}

function ngPB(p){return 'ng-pb-'+p;}
function ngFB(f){return 'ng-fb-'+f.replace(/-/g,'-');}

function renderNgTimeline(){
  const el=document.getElementById('ng-timeline');
  if(!el)return;
  el.innerHTML=NG_HOOKS.map(h=>{
    const c=NG_PC[h.phase[0]];
    return `<div class="ng-hook-node" id="ngn-${h.id}" onclick="ngSelectHook('${h.id}')">
  <div class="ng-hook-dot" style="border-color:${c}"></div>
  <div class="ng-hook-info">
    <span class="ng-hook-name">${h.name}</span>
    <div class="ng-hook-badges">
      ${h.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
      <span class="ng-freq-badge ${ngFB(h.freq)}">${NG_FL[h.freq]}</span>
    </div>
  </div>
</div>`;
  }).join('');
}

function renderNgDetail(hook){
  const el=document.getElementById('ng-detail');
  if(!el)return;
  if(!hook){
    el.innerHTML=`<div class="ng-detail-empty"><div class="ng-detail-empty-icon">🎬</div><div>กด <strong>▶ Simulate</strong> เพื่อดู hooks ที่ fire ตามลำดับ</div><div class="ng-detail-empty-sub">หรือ click hook ในแผนภูมิซ้ายเพื่อดูรายละเอียด</div></div>`;
    return;
  }
  el.innerHTML=`<div class="ng-detail-content">
  <div class="ng-detail-name">${hook.name}</div>
  <div class="ng-detail-badges">
    ${hook.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
    <span class="ng-freq-badge ${ngFB(hook.freq)}">${NG_FL[hook.freq]}</span>
    ${hook.iface?`<span class="ng-iface-badge">implements ${hook.iface}</span>`:''}
  </div>
  <div class="ng-detail-desc">${hook.desc}</div>
  ${hook.tip?`<div class="ng-detail-tip">💡 ${escHtml(hook.tip)}</div>`:''}
  <div class="ng-detail-section"><div class="ng-detail-sec-title ng-sec-ok">✓ ใช้เมื่อ</div>${hook.when.map(w=>`<div class="ng-detail-item">• ${escHtml(w)}</div>`).join('')}</div>
  ${hook.avoid.length?`<div class="ng-detail-section"><div class="ng-detail-sec-title ng-sec-no">✗ หลีกเลี่ยง</div>${hook.avoid.map(a=>`<div class="ng-detail-item ng-avoid-item">• ${escHtml(a)}</div>`).join('')}</div>`:''}
  <div class="ng-detail-code-wrap"><button class="rxjs-copy-btn" onclick="event.stopPropagation();rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code>${hlTS(hook.code)}</code></pre></div>
</div>`;
}

function ngSelectHook(id){
  document.querySelectorAll('.ng-hook-node').forEach(n=>n.classList.remove('ng-node-selected'));
  const node=document.getElementById('ngn-'+id);
  if(node)node.classList.add('ng-node-selected');
  renderNgDetail(NG_HOOKS.find(h=>h.id===id)||null);
}

function ngSimulate(scenario){
  if(ngTimer){clearTimeout(ngTimer);ngTimer=null;}
  const hooks=NG_SCENARIOS[scenario];
  document.querySelectorAll('.ng-sim-btn').forEach(b=>b.classList.remove('ng-sim-active'));
  const ab=document.querySelector('.ng-sim-btn[data-scenario="'+scenario+'"]');
  if(ab)ab.classList.add('ng-sim-active');
  document.querySelectorAll('.ng-hook-node').forEach(node=>{
    node.classList.remove('ng-node-active','ng-node-done','ng-node-selected');
    node.classList.toggle('ng-node-dim',!hooks.includes(node.id.replace('ngn-','')));
  });
  let idx=0;
  function step(){
    if(idx>0){
      const pn=document.getElementById('ngn-'+hooks[idx-1]);
      if(pn){pn.classList.remove('ng-node-active');pn.classList.add('ng-node-done');}
    }
    if(idx>=hooks.length)return;
    const id=hooks[idx];
    const node=document.getElementById('ngn-'+id);
    if(node){node.classList.add('ng-node-active');node.scrollIntoView({behavior:'smooth',block:'nearest'});}
    renderNgDetail(NG_HOOKS.find(h=>h.id===id)||null);
    idx++;
    ngTimer=setTimeout(step,700);
  }
  step();
}

function ngReset(){
  if(ngTimer){clearTimeout(ngTimer);ngTimer=null;}
  document.querySelectorAll('.ng-hook-node').forEach(n=>n.classList.remove('ng-node-active','ng-node-done','ng-node-dim','ng-node-selected'));
  document.querySelectorAll('.ng-sim-btn').forEach(b=>b.classList.remove('ng-sim-active'));
  renderNgDetail(null);
}

function renderNgHooks(){
  const el=document.getElementById('ng-hook-list');
  if(!el)return;
  const q=ngQ.toLowerCase();
  const hooks=q?NG_HOOKS.filter(h=>h.name.toLowerCase().includes(q)||h.desc.toLowerCase().includes(q)||h.when.join(' ').toLowerCase().includes(q)):NG_HOOKS;
  const cnt=document.getElementById('ng-count');
  if(cnt)cnt.textContent=hooks.length+' hooks';
  if(!hooks.length){el.innerHTML='<div class="rxjs-empty">ไม่พบ hook ที่ค้นหา</div>';return;}
  el.innerHTML=hooks.map(h=>`<div class="ng-hook-card" onclick="ngSelectHook('${h.id}')">
  <div class="rxjs-op-top">
    <span class="rxjs-op-name">${h.name}</span>
    ${h.phase.map(p=>`<span class="ng-phase-badge ${ngPB(p)}">${p}</span>`).join('')}
    <span class="ng-freq-badge ${ngFB(h.freq)}">${NG_FL[h.freq]}</span>
  </div>
  <div class="rxjs-op-summary">${escHtml(h.desc)}</div>
  <div class="rxjs-op-when">
    <span class="rxjs-when-ok">✓ ใช้เมื่อ</span>
    ${h.when.map(w=>`<div class="rxjs-when-item">• ${escHtml(w)}</div>`).join('')}
    ${h.avoid.length?'<span class="rxjs-when-no">✗ หลีกเลี่ยง</span>'+h.avoid.map(a=>`<div class="rxjs-when-item rxjs-avoid">• ${escHtml(a)}</div>`).join(''):''}
  </div>
  ${h.tip?`<div class="ng-hook-tip">💡 ${escHtml(h.tip)}</div>`:''}
  <details class="rxjs-details" onclick="event.stopPropagation()"><summary class="rxjs-details-sum"><span class="rxjs-sig-lbl">code</span> <code class="rxjs-sig-code">${escHtml(h.name)}</code></summary><div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="event.stopPropagation();rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code>${hlTS(h.code)}</code></pre></div></details>
</div>`).join('');
}

function ngSearch(q){ngQ=q;renderNgHooks();}
