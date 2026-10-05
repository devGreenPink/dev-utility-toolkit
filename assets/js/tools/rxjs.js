// ── RXJS REFERENCE ──
const RXJS_CATS=[
  {id:'all',label:'ทั้งหมด',color:'var(--accent)'},
  {id:'creation',label:'Creation',color:'#a78bfa'},
  {id:'transformation',label:'Transformation',color:'#34d399'},
  {id:'filtering',label:'Filtering',color:'#60a5fa'},
  {id:'combination',label:'Combination',color:'#fbbf24'},
  {id:'error',label:'Error Handling',color:'#f87171'},
  {id:'utility',label:'Utility',color:'#fb923c'},
  {id:'multicasting',label:'Multicasting',color:'#f472b6'},
];
const RXJS_CC={creation:'#a78bfa',transformation:'#34d399',filtering:'#60a5fa',combination:'#fbbf24',error:'#f87171',utility:'#fb923c',multicasting:'#f472b6'};
const RXJS_OPS=[
// CREATION
{n:'of',c:'creation',s:'emit ค่าหลายตัวทีเดียว แล้ว complete',w:['สร้าง Observable จากค่าคงที่','mock/test ข้อมูล','wrap sync value'],a:['อยากได้ async ใช้ from + Promise แทน'],sig:'of<T>(...values: T[]): Observable<T>',code:"of(1, 2, 3).subscribe(console.log);\n// 1, 2, 3\n\nof('a','b').pipe(\n  map(s => s.toUpperCase())\n).subscribe(console.log);",rel:['from','range']},
{n:'from',c:'creation',s:'แปลง Array, Promise, Iterable เป็น Observable',w:['แปลง Promise เป็น Observable','แปลง array เป็น stream','รับ async/await ค่า'],a:[],sig:'from<T>(input: ObservableInput<T>): Observable<T>',code:"// จาก array\nfrom([1, 2, 3]).subscribe(console.log);\n\n// จาก Promise\nfrom(fetch('/api').then(r => r.json()))\n  .subscribe(data => render(data));",rel:['of','fromEvent']},
{n:'fromEvent',c:'creation',s:'แปลง DOM event เป็น Observable stream',w:['click / keyup / scroll events','WebSocket messages','input + debounce'],a:['ต้อง unsubscribe ตอน component destroy (ใช้ takeUntil)'],sig:'fromEvent<T>(target: EventTarget, event: string): Observable<T>',code:"const clicks$ = fromEvent(document, 'click');\nclicks$.pipe(\n  map(e => ({ x: e.clientX, y: e.clientY }))\n).subscribe(pos => console.log(pos));\n\n// search real-time\nfromEvent(input, 'input').pipe(\n  debounceTime(300),\n  map(e => e.target.value),\n  switchMap(term => searchApi(term))\n).subscribe(render);",rel:['debounceTime','switchMap']},
{n:'interval',c:'creation',s:'emit 0, 1, 2... ทุก X ms ไปเรื่อยๆ (ต้อง unsubscribe เอง)',w:['polling API ทุก N วินาที','animation counter','countdown'],a:['ต้อง unsubscribe ไม่งั้น memory leak'],sig:'interval(period: number): Observable<number>',code:"const sub = interval(5000).pipe(\n  switchMap(() => http.get('/api/status'))\n).subscribe(status => update(status));\n\nsub.unsubscribe(); // หยุดเมื่อไม่ต้องการ",rel:['timer','takeUntil']},
{n:'timer',c:'creation',s:'รอ X ms แล้ว emit (หรือ emit ทุก Y ms หลังรอ X ms)',w:['delay ก่อนทำงาน','polling ที่มี initial delay','timeout'],a:[],sig:'timer(dueTime?: number, interval?: number): Observable<number>',code:"// emit ครั้งเดียวหลัง 1 วินาที\ntimer(1000).subscribe(() => doWork());\n\n// emit ทุก 2s หลังรอ 5s แรก\ntimer(5000, 2000).subscribe(n => console.log(n));",rel:['interval','delay']},
{n:'range',c:'creation',s:'emit ตัวเลขต่อเนื่อง start ถึง count',w:['สร้างข้อมูลจำลอง','loop แบบ functional','generate sequence'],a:[],sig:'range(start: number, count?: number): Observable<number>',code:"range(1, 5).subscribe(console.log);\n// 1, 2, 3, 4, 5\n\nrange(0, 10).pipe(\n  filter(n => n % 2 === 0)\n).subscribe(console.log); // 0, 2, 4, 6, 8",rel:['of','from']},
{n:'EMPTY',c:'creation',s:'Observable ที่ complete ทันทีโดยไม่ emit อะไรเลย',w:['return เมื่อไม่มีข้อมูล (แทน null)','cancel ใน switchMap','absorb error ใน catchError'],a:[],sig:'EMPTY: Observable<never>',code:"search$.pipe(\n  switchMap(term =>\n    term.length < 2 ? EMPTY : searchApi(term)\n  )\n).subscribe(render);",rel:['throwError']},
{n:'throwError',c:'creation',s:'Observable ที่ error ทันทีโดยไม่ emit อะไร',w:['สร้าง error ใน pipe','re-throw หลัง log','test error handling'],a:[],sig:'throwError(() => new Error(msg))',code:"throwError(() => new Error('API failed'))\n  .pipe(\n    catchError(err => {\n      logError(err);\n      return EMPTY;\n    })\n  ).subscribe();",rel:['catchError','EMPTY']},
{n:'defer',c:'creation',s:'สร้าง Observable ใหม่ทุกครั้งที่ subscribe — lazy factory',w:['Observable ที่สร้างใหม่ทุก subscribe','wrap side-effectful creation','random / time-sensitive values'],a:[],sig:'defer<T>(factory: () => ObservableInput<T>): Observable<T>',code:"const now$ = defer(() => of(Date.now()));\nnow$.subscribe(t => console.log(t)); // 1000\nnow$.subscribe(t => console.log(t)); // 1050 (ต่างกัน)",rel:['of','from']},
{n:'iif',c:'creation',s:'เลือก Observable ตาม condition — ternary สำหรับ Observable',w:['routing logic ตาม state','เลือก API ตาม role','conditional stream'],a:[],sig:'iif(condition: () => boolean, trueObs, falseObs)',code:"const isLoggedIn = () => !!localStorage.getItem('token');\n\niif(\n  isLoggedIn,\n  http.get('/api/profile'),\n  of({ guest: true })\n).subscribe(user => renderUser(user));",rel:['defer','EMPTY']},
// TRANSFORMATION
{n:'map',c:'transformation',s:'แปลงทุกค่าใน stream (เหมือน Array.map)',w:['แปลง HTTP response','extract property จาก object','เปลี่ยน data shape'],a:[],sig:'map<T,R>(project: (value: T, index: number) => R)',code:"from([1, 2, 3]).pipe(\n  map(x => x * 2)\n).subscribe(console.log);\n// 2, 4, 6\n\nhttp.get('/api/users').pipe(\n  map(res => res.data),\n  map(users => users.filter(u => u.active))\n).subscribe(renderUsers);",rel:['switchMap','mergeMap','filter']},
{n:'switchMap',c:'transformation',s:'map เป็น Observable ใหม่ — cancel inner เดิมทันทีถ้ามีค่าใหม่',w:['Search autocomplete (พิมพ์ใหม่ = cancel request เก่า)','Route change + cancel pending HTTP','ป้องกัน race condition'],a:['ต้องการทุก result ใช้ mergeMap','ต้องการ order ใช้ concatMap'],sig:'switchMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"fromEvent(searchInput, 'input').pipe(\n  map(e => e.target.value),\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term =>\n    term ? http.get(`/api/search?q=${term}`) : EMPTY\n  )\n).subscribe(results => render(results));",rel:['mergeMap','concatMap','exhaustMap']},
{n:'mergeMap',c:'transformation',s:'map เป็น Observable — รัน inner ทุกตัวพร้อมกัน ไม่ cancel',w:['Upload หลายไฟล์พร้อมกัน','Parallel HTTP requests','ไม่สนใจ order แต่ต้องการทุก result'],a:['inner ไม่ complete อาจ memory leak','source emit เร็วมาก inner จะล้น'],sig:'mergeMap<T,R>(project: (value: T) => ObservableInput<R>, concurrent?: number)',code:"from(selectedFiles).pipe(\n  mergeMap(file => uploadService.upload(file))\n).subscribe({\n  next: r => console.log('uploaded:', r.name),\n  complete: () => showToast('upload ทั้งหมดสำเร็จ')\n});",rel:['switchMap','concatMap','exhaustMap']},
{n:'concatMap',c:'transformation',s:'map เป็น Observable — รอ inner ก่อนหน้า complete ก่อนเริ่มถัดไป',w:['Sequential API calls ที่ต้องการ order','Save ทีละรายการ','Animation queue'],a:['source emit เร็วมาก inner จะ queue ยาว lag','ไม่สนใจ order ใช้ mergeMap เร็วกว่า'],sig:'concatMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"from([step1, step2, step3]).pipe(\n  concatMap(step => saveStep(step))\n).subscribe({\n  next: s => console.log('saved:', s.id),\n  complete: () => console.log('ทุก step บันทึกแล้ว')\n});",rel:['switchMap','mergeMap','exhaustMap']},
{n:'exhaustMap',c:'transformation',s:'map เป็น Observable — ignore source ใหม่ถ้า inner ยังรันอยู่',w:['ปุ่ม Submit (ป้องกัน double submit)','Login (ignore click ซ้ำ)','ป้องกัน overlapping'],a:['ต้องการทุก click ใช้ mergeMap','ต้องการ cancel ใช้ switchMap'],sig:'exhaustMap<T,R>(project: (value: T) => ObservableInput<R>)',code:"fromEvent(loginBtn, 'click').pipe(\n  exhaustMap(() => authService.login(creds))\n).subscribe({\n  next: user => router.navigate('/dashboard'),\n  error: err => showError(err.message)\n});",rel:['switchMap','mergeMap','concatMap']},
{n:'scan',c:'transformation',s:'สะสมค่าทีละ step แล้ว emit ทุกรอบ (เหมือน reduce แต่ไม่รอ complete)',w:['Running total / counter','State accumulator','undo/redo history'],a:[],sig:'scan<T,R>(accumulator: (acc: R, val: T) => R, seed?: R)',code:"fromEvent(btn, 'click').pipe(\n  scan(count => count + 1, 0)\n).subscribe(n => countEl.textContent = n);\n\nof(1,2,3).pipe(\n  scan((acc, v) => [...acc, v], [])\n).subscribe(console.log);\n// [1]  [1,2]  [1,2,3]",rel:['reduce','map']},
{n:'reduce',c:'transformation',s:'สะสมค่าทั้งหมด emit ครั้งเดียวตอน complete (เหมือน Array.reduce)',w:['รวมผลลัพธ์หลัง stream จบ','คำนวณ sum/max/count','collect แล้ว process'],a:['source ไม่ complete จะไม่ emit เลย — ใช้ scan แทน'],sig:'reduce<T,R>(accumulator: (acc: R, val: T) => R, seed?: R)',code:"from([1,2,3,4,5]).pipe(\n  reduce((sum, n) => sum + n, 0)\n).subscribe(total => console.log('Total:', total));\n// Total: 15",rel:['scan','toArray']},
{n:'buffer',c:'transformation',s:'รวม emissions เป็น array — flush เมื่อ notifier emit',w:['batch process events','รวม actions ก่อนส่ง','buffer real-time data'],a:[],sig:'buffer<T>(closingNotifier: Observable<any>): OperatorFunction<T, T[]>',code:"const source$ = interval(100);\nconst flush$ = interval(1000);\nsource$.pipe(\n  buffer(flush$)\n).subscribe(batch => {\n  console.log('Batch:', batch); // [0..9] ทุกวินาที\n});",rel:['bufferTime']},
{n:'bufferTime',c:'transformation',s:'รวม emissions เป็น array ทุก X ms',w:['batch analytics events','aggregate logs ก่อนส่ง','rate limiting'],a:[],sig:'bufferTime<T>(bufferTimeSpan: number): OperatorFunction<T, T[]>',code:"fromEvent(document, 'click').pipe(\n  bufferTime(2000)\n).subscribe(clicks => {\n  if (clicks.length > 0)\n    sendAnalytics('clicks', clicks.length);\n});",rel:['buffer','throttleTime']},
{n:'groupBy',c:'transformation',s:'แยก stream เป็น GroupedObservable ตาม key',w:['จัดกลุ่มข้อมูล real-time','route messages ตาม type','aggregate ตาม category'],a:['ต้อง subscribe แต่ละ group ด้วย mergeMap'],sig:'groupBy<T,K>(keySelector: (val: T) => K)',code:"from([\n  {name:'ก้อง', dept:'dev'},\n  {name:'แบงค์', dept:'design'},\n  {name:'มิ้น', dept:'dev'}\n]).pipe(\n  groupBy(emp => emp.dept),\n  mergeMap(group$ => group$.pipe(toArray()))\n).subscribe(g => console.log(g));",rel:['mergeMap']},
{n:'toArray',c:'transformation',s:'รวมทุก emission เป็น array เดียวตอน complete',w:['รวมผลลัพธ์ก่อน render','แปลง stream เป็น array','collect แล้วค่อย process'],a:['source ไม่ complete จะไม่ emit เลย'],sig:'toArray<T>(): OperatorFunction<T, T[]>',code:"from([1,2,3,4,5]).pipe(\n  filter(n => n % 2 === 0),\n  toArray()\n).subscribe(evens => console.log(evens));\n// [2, 4]",rel:['reduce','buffer']},
{n:'pairwise',c:'transformation',s:'emit คู่ [ก่อนหน้า, ปัจจุบัน] ทุกครั้งที่ source emit',w:['คำนวณ delta ระหว่าง state','track mouse delta','ตรวจการเปลี่ยนแปลง'],a:[],sig:'pairwise<T>(): OperatorFunction<T, [T, T]>',code:"from([1,5,2,8]).pipe(\n  pairwise(),\n  map(([prev, curr]) => curr - prev)\n).subscribe(diff => console.log(diff));\n// 4, -3, 6",rel:['scan','distinctUntilChanged']},
// FILTERING
{n:'filter',c:'filtering',s:'กรองค่าที่ไม่ผ่าน condition ออก (เหมือน Array.filter)',w:['กรอง event ที่ต้องการ','ตรวจ condition ก่อน process','ลด noise ใน stream'],a:[],sig:'filter<T>(predicate: (value: T, index: number) => boolean)',code:"from([1,2,3,4,5,6]).pipe(\n  filter(n => n % 2 === 0)\n).subscribe(console.log); // 2, 4, 6\n\nfromEvent(document, 'click').pipe(\n  filter(e => e.target.matches('.btn-primary'))\n).subscribe(handleClick);",rel:['map','takeWhile','distinctUntilChanged']},
{n:'take',c:'filtering',s:'รับแค่ N ค่าแรก แล้ว complete',w:['รับค่าแรกจาก stream','จำกัดจำนวน result','one-shot Observable'],a:[],sig:'take<T>(count: number)',code:"interval(1000).pipe(\n  take(3)\n).subscribe(console.log);\n// 0, 1, 2 แล้ว complete\n\nfromEvent(btn, 'click').pipe(\n  take(1)\n).subscribe(handleFirstClick);",rel:['first','takeUntil','takeWhile']},
{n:'takeUntil',c:'filtering',s:'รับค่าจนกว่า notifier จะ emit แล้ว complete',w:['หยุด subscription เมื่อ component destroy','cancel เมื่อ navigate ออก','cleanup pattern ใน Angular'],a:['notifier ต้อง complete ด้วย ไม่งั้น takeUntil อาจไม่ทำงาน'],sig:'takeUntil<T>(notifier: ObservableInput<any>)',code:"class MyComponent implements OnDestroy {\n  private destroy$ = new Subject<void>();\n\n  ngOnInit() {\n    interval(1000).pipe(\n      takeUntil(this.destroy$)\n    ).subscribe(tick => update(tick));\n  }\n\n  ngOnDestroy() {\n    this.destroy$.next();\n    this.destroy$.complete();\n  }\n}",rel:['take','takeWhile','Subject']},
{n:'takeWhile',c:'filtering',s:'รับค่าตราบที่ condition เป็น true — หยุดทันทีที่ false',w:['รับค่าจนถึง threshold','หยุด poll เมื่อ status เปลี่ยน','process จนเงื่อนไขเปลี่ยน'],a:[],sig:'takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean)',code:"interval(2000).pipe(\n  switchMap(() => http.get('/api/job')),\n  takeWhile(job => job.status !== 'done')\n).subscribe(job => updateProgress(job));",rel:['take','takeUntil','filter']},
{n:'skip',c:'filtering',s:'ข้าม N ค่าแรก แล้ว emit ปกติ',w:['ข้าม initial value ของ BehaviorSubject','skip header row','ละค่าแรกที่ไม่ต้องการ'],a:[],sig:'skip<T>(count: number)',code:"const data$ = new BehaviorSubject(null);\n\ndata$.pipe(\n  skip(1) // ข้าม null initial value\n).subscribe(data => render(data));\n\ndata$.next({ users: [] });",rel:['skipUntil','take','filter']},
{n:'skipUntil',c:'filtering',s:'ข้าม emissions จนกว่า notifier จะ emit',w:['รอ init สำเร็จก่อน process','รอ user interaction ก่อนเริ่ม','gate-based filtering'],a:[],sig:'skipUntil<T>(notifier: Observable<any>)',code:"const ready$ = fromEvent(document, 'DOMContentLoaded');\n\nstream$.pipe(\n  skipUntil(ready$)\n).subscribe(processEvent);",rel:['skip','takeUntil']},
{n:'first',c:'filtering',s:'รับค่าแรก (หรือค่าแรกที่ตรง condition) แล้ว complete',w:['ต้องการค่าแรกจาก stream','one-time lookup','เหมือน take(1) แต่ใส่ predicate ได้'],a:['source complete ไม่มีค่าตาม predicate จะ error — ใส่ default ป้องกัน'],sig:'first<T>(predicate?: (val: T) => boolean, defaultValue?: T)',code:"from([3,5,7,2,4]).pipe(\n  first(n => n % 2 === 0)\n).subscribe(console.log); // 2\n\n// safe: ใส่ default\nfrom([1,3,5]).pipe(\n  first(n => n > 10, -1)\n).subscribe(console.log); // -1",rel:['take','last','filter']},
{n:'last',c:'filtering',s:'รับเฉพาะค่าสุดท้ายตอน source complete',w:['ผลสุดท้ายของ stream','HTTP response ที่ emit หลายครั้ง','คู่กับ reduce'],a:['source ไม่ complete จะไม่ emit','source ว่างไม่มี default จะ error'],sig:'last<T>(predicate?: (val: T) => boolean, defaultValue?: T)',code:"from([1,2,3,4,5]).pipe(\n  last()\n).subscribe(console.log); // 5\n\nfrom([1,2,3]).pipe(\n  last(n => n % 3 === 0)\n).subscribe(console.log); // 3",rel:['first','take','reduce']},
{n:'debounceTime',c:'filtering',s:'หน่วง X ms — reset ทุกครั้งที่มีค่าใหม่ emit เฉพาะค่าสุดท้ายหลังหยุด',w:['Search input (รอหยุดพิมพ์)','Form validation','resize/scroll handler'],a:['ต้องการ emit แล้วค่อย block ใช้ throttleTime'],sig:'debounceTime<T>(dueTime: number)',code:"fromEvent(searchInput, 'input').pipe(\n  map(e => e.target.value),\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(term => searchApi(term))\n).subscribe(render);",rel:['throttleTime','distinctUntilChanged','switchMap']},
{n:'throttleTime',c:'filtering',s:'emit แล้ว block X ms — ป้องกัน emit ถี่เกินไป',w:['จำกัด rate analytics','scroll/resize handler','ป้องกัน API call ถี่'],a:['ต้องการค่าสุดท้ายหลังหยุด ใช้ debounceTime'],sig:'throttleTime<T>(duration: number)',code:"fromEvent(window, 'scroll').pipe(\n  throttleTime(100)\n).subscribe(() => updateScrollPos());",rel:['debounceTime']},
{n:'distinctUntilChanged',c:'filtering',s:'emit เฉพาะเมื่อค่าต่างจากค่าก่อนหน้า',w:['ป้องกัน re-render เมื่อ state ไม่เปลี่ยน','filter ค่าซ้ำจาก form','selector ใน state management'],a:[],sig:'distinctUntilChanged<T>(comparator?: (prev: T, curr: T) => boolean)',code:"from([1,1,2,2,3,1]).pipe(\n  distinctUntilChanged()\n).subscribe(console.log);\n// 1, 2, 3, 1\n\nstate$.pipe(\n  distinctUntilChanged((a,b) => a.userId === b.userId)\n).subscribe(renderUser);",rel:['distinct','debounceTime']},
{n:'distinct',c:'filtering',s:'emit เฉพาะค่าที่ไม่เคย emit มาก่อนใน stream ทั้งหมด',w:['กรอง duplicate ออก','deduplicate IDs','unique values เท่านั้น'],a:['เก็บ Set ทุกค่าที่เคย emit — memory leak ถ้า stream ยาวมาก'],sig:'distinct<T>(keySelector?: (val: T) => any)',code:"from([1,2,1,3,2,4]).pipe(\n  distinct()\n).subscribe(console.log);\n// 1, 2, 3, 4\n\nfrom(users).pipe(\n  distinct(u => u.id)\n).subscribe(renderUser);",rel:['distinctUntilChanged','filter']},
{n:'sampleTime',c:'filtering',s:'เก็บค่าล่าสุดทุก X ms (snapshot)',w:['sample real-time data ทุก N วินาที','ลด rate ของ stream ที่เร็วมาก','metric collection'],a:[],sig:'sampleTime<T>(period: number)',code:"fromEvent(document, 'mousemove').pipe(\n  sampleTime(200)\n).subscribe(e => track(e.clientX, e.clientY));",rel:['debounceTime','throttleTime']},
// COMBINATION
{n:'combineLatest',c:'combination',s:'รวม Observables หลายตัว — emit ทุกครั้งที่ตัวใดเปลี่ยน (รอทุกตัว emit ก่อน 1 รอบ)',w:['รวม filter/sort/page เป็น query เดียว','dashboard หลาย data source','ขึ้นอยู่กับหลาย stream'],a:['Observable ใดไม่ emit เลยจะไม่ emit','sync หลายตัวอาจ trigger เยอะ'],sig:'combineLatest<T>(sources: ObservableInput<T>[]): Observable<T[]>',code:"combineLatest([search$, sort$, page$]).pipe(\n  debounceTime(100),\n  switchMap(([search, sort, page]) =>\n    http.get('/api/data', { search, sort, page })\n  )\n).subscribe(renderTable);",rel:['merge','zip','withLatestFrom']},
{n:'merge',c:'combination',s:'รวม Observables หลายตัว emit ทุกค่าจากทุกตัวตามที่เกิด',w:['รวม event หลาย source','listen หลาย WebSocket','รวม action streams'],a:['ไม่รับประกัน order — ถ้าต้องการ order ใช้ concat'],sig:'merge<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"merge(\n  fromEvent(document, 'keydown'),\n  fromEvent(document, 'click'),\n  fromEvent(document, 'touchstart')\n).pipe(\n  throttleTime(100)\n).subscribe(resetIdleTimer);",rel:['combineLatest','concat','race']},
{n:'concat',c:'combination',s:'รัน Observables ต่อกัน — รอตัวแรก complete ก่อนเริ่มตัวถัดไป',w:['Sequential requests ที่ต้องการ order','initialization flow ทีละขั้น','playlist/queue'],a:['ตัวแรกไม่ complete จะไม่ไปตัวถัดไปเลย'],sig:'concat<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"concat(\n  of({ loading: true }),\n  http.get('/api/init'),\n  of({ loading: false })\n).subscribe(state => updateState(state));",rel:['merge','concatMap']},
{n:'zip',c:'combination',s:'จับคู่ค่าจากหลาย Observable ตาม index — รอทุกตัว emit ครั้งที่ N',w:['จับคู่ข้อมูลจาก 2 stream ตาม sequence','coordinates จาก x$ กับ y$','จับคู่ request กับ response'],a:['Observable ยาวไม่เท่ากัน ค่าส่วนเกินถูก ignore'],sig:'zip<T>(...sources: ObservableInput<T>[]): Observable<T[]>',code:"zip(of(1,2,3), of('a','b','c'))\n  .subscribe(([n, s]) => console.log(n, s));\n// 1 'a'\n// 2 'b'\n// 3 'c'",rel:['combineLatest','forkJoin']},
{n:'forkJoin',c:'combination',s:'รอทุก Observable complete แล้ว emit ค่าสุดท้ายของแต่ละตัวพร้อมกัน',w:['Parallel HTTP requests ที่ต้องการทุก result','โหลดหลายชุดข้อมูลก่อน render','รวม dependencies ก่อนเริ่ม'],a:['Observable ใด error ทั้งหมดจะ error','ไม่ควรใช้กับ infinite stream'],sig:'forkJoin(sources: { [key: string]: ObservableInput }): Observable',code:"forkJoin({\n  user: http.get('/api/user/1'),\n  posts: http.get('/api/posts'),\n  settings: http.get('/api/settings')\n}).subscribe(({ user, posts, settings }) =>\n  renderProfile(user, posts, settings)\n);",rel:['combineLatest','zip','merge']},
{n:'withLatestFrom',c:'combination',s:'เมื่อ source emit ดึงค่าล่าสุดจาก Observable อื่นมาด้วย',w:['รวม event กับ state ปัจจุบัน','แนบ user info กับ action','ใช้ค่าจาก BehaviorSubject ตอน event'],a:['other Observable ต้องมีค่าก่อน ไม่งั้นจะไม่ emit'],sig:'withLatestFrom<T,R>(...others: ObservableInput<R>[])',code:"fromEvent(deleteBtn, 'click').pipe(\n  withLatestFrom(currentUser$),\n  filter(([_, user]) => user.canDelete),\n  switchMap(([_, user]) => deleteItem(itemId, user.id))\n).subscribe(() => showToast('ลบสำเร็จ'));",rel:['combineLatest','switchMap']},
{n:'race',c:'combination',s:'ใช้ Observable แรกที่ emit ทิ้งตัวที่เหลือ',w:['ใช้ response จาก server เร็วสุด','timeout race pattern','fallback เมื่อ primary ช้า'],a:[],sig:'race<T>(...sources: ObservableInput<T>[]): Observable<T>',code:"race(\n  http.get('https://api1.example.com/data'),\n  http.get('https://api2.example.com/data')\n).subscribe(data => render(data));",rel:['merge','forkJoin']},
{n:'startWith',c:'combination',s:'inject ค่าเริ่มต้นก่อน Observable จริง emit',w:['initial state ก่อนโหลด','loading skeleton','default value'],a:[],sig:'startWith<T>(...values: T[])',code:"http.get('/api/users').pipe(\n  map(data => ({ loading: false, data })),\n  startWith({ loading: true, data: null })\n).subscribe(state => renderState(state));",rel:['BehaviorSubject','combineLatest']},
// ERROR HANDLING
{n:'catchError',c:'error',s:'จับ error แล้วส่ง Observable อื่นแทน — ป้องกัน stream ตาย',w:['fallback เป็น cached data เมื่อ API fail','แสดง error แล้วดำเนินต่อ','absorb error ที่ไม่สำคัญ'],a:['return throwError อีกจะยัง error'],sig:'catchError<T,O>(selector: (err: any) => ObservableInput<O>)',code:"http.get('/api/data').pipe(\n  catchError(err => {\n    console.error('failed:', err.message);\n    return of([]); // fallback\n  })\n).subscribe(render);\n\n// rethrow หลัง log\nhttp.get('/api').pipe(\n  catchError(err => {\n    logError(err);\n    return throwError(() => err);\n  })\n).subscribe(next => {}, err => showError(err));",rel:['retry','finalize','throwError']},
{n:'retry',c:'error',s:'retry N ครั้งอัตโนมัติเมื่อ error ก่อน propagate',w:['HTTP request ที่อาจ fail ชั่วคราว','network instability','transient errors'],a:['อย่า retry infinitely','ควรเพิ่ม delay ระหว่าง retry'],sig:'retry(count?: number | RetryConfig)',code:"http.get('/api/data').pipe(\n  retry(3)\n).subscribe({\n  next: data => render(data),\n  error: err => showError('ล้มเหลวหลังลอง 3 ครั้ง')\n});\n\nhttp.get('/api').pipe(\n  retry({ count: 3, delay: 1000 })\n).subscribe(...);",rel:['catchError','retryWhen']},
{n:'retryWhen',c:'error',s:'retry ตาม logic กำหนด — ควบคุม timing และเงื่อนไข',w:['exponential backoff','retry เฉพาะ error บางประเภท','แสดง retry countdown'],a:['deprecated ใน RxJS 7+ — ใช้ retry({ delay }) แทน'],sig:'retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>)',code:"http.get('/api').pipe(\n  retryWhen(errors => errors.pipe(\n    delayWhen((_, i) => timer(2 ** i * 1000)),\n    take(3)\n  ))\n).subscribe(...);",rel:['retry','catchError','timer']},
{n:'finalize',c:'error',s:'ทำงานเมื่อ complete หรือ error (เหมือน finally ใน try/catch)',w:['ซ่อน loading spinner เสมอ','cleanup resources','logging'],a:[],sig:'finalize<T>(callback: () => void)',code:"showSpinner();\nhttp.get('/api/data').pipe(\n  finalize(() => hideSpinner())\n).subscribe({\n  next: data => render(data),\n  error: err => showError(err.message)\n});",rel:['catchError','tap']},
// UTILITY
{n:'tap',c:'utility',s:'ทำ side effect โดยไม่เปลี่ยนค่าใน stream (เดิมชื่อ do)',w:['logging / debugging','analytics events','debug pipe โดยไม่เปลี่ยนค่า'],a:['อย่าใช้ tap สำหรับ transform — ใช้ map แทน'],sig:'tap<T>(observerOrNext: Partial<Observer<T>> | ((val: T) => void))',code:"http.get('/api/users').pipe(\n  tap(data => console.log('raw:', data)),\n  map(data => data.users),\n  tap(users => analytics.track('loaded', { count: users.length })),\n  filter(users => users.length > 0)\n).subscribe(renderUsers);",rel:['map','finalize']},
{n:'delay',c:'utility',s:'หน่วง emit ทุกค่าออกไป X ms',w:['simulate latency ใน test','animation sequencing','ป้องกัน rapid UI update'],a:[],sig:'delay<T>(due: number | Date)',code:"of('hello').pipe(\n  delay(2000)\n).subscribe(msg => console.log(msg));\n// พิมพ์ 'hello' หลัง 2 วินาที",rel:['timer','debounceTime']},
{n:'timeout',c:'utility',s:'throw error ถ้า Observable ไม่ emit ภายใน X ms',w:['กำหนด SLA ให้ HTTP','ป้องกัน hang','UX timeout'],a:[],sig:'timeout<T>(config: number | TimeoutConfig<T>)',code:"http.get('/api').pipe(\n  timeout(5000),\n  catchError(err => {\n    if (err.name === 'TimeoutError')\n      return of({ error: 'timeout' });\n    return throwError(() => err);\n  })\n).subscribe(renderOrError);",rel:['race','catchError','timer']},
{n:'share',c:'utility',s:'share Observable เดียวกับ subscriber หลายตัว — multicasting hot',w:['ป้องกัน HTTP call ซ้ำ','event stream ที่ต้องการ share','ประหยัด resource'],a:['subscriber ใหม่ที่มาทีหลังไม่ได้ค่าก่อนหน้า — ใช้ shareReplay แทน'],sig:'share<T>()',code:"const data$ = http.get('/api/data').pipe(share());\n\n// HTTP call แค่ 1 ครั้ง\ndata$.subscribe(data => renderList(data));\ndata$.subscribe(data => renderChart(data));",rel:['shareReplay','Subject']},
{n:'shareReplay',c:'utility',s:'share + replay N ค่าล่าสุดให้ subscriber ใหม่',w:['cache HTTP response','share initial data load','subscriber ใหม่ได้ค่าล่าสุดทันที'],a:['ระวัง memory leak ใน Angular — ใส่ {refCount:true}'],sig:'shareReplay<T>(bufferSize?: number | ShareReplayConfig)',code:"const config$ = http.get('/api/config').pipe(\n  shareReplay({ bufferSize: 1, refCount: true })\n);\n\nconfig$.subscribe(renderHeader);\nconfig$.subscribe(renderSidebar);\n// HTTP call เกิดครั้งเดียว",rel:['share','BehaviorSubject']},
// MULTICASTING
{n:'Subject',c:'multicasting',s:'Observable + Observer ในตัวเดียว — ส่งค่าเข้า stream จากภายนอกได้',w:['event bus','bridge ระหว่าง callback กับ Observable world','trigger events ด้วยตนเอง'],a:['ไม่มี initial value ไม่ replay — ใช้ BehaviorSubject ถ้าต้องการ'],sig:'new Subject<T>()',code:"const action$ = new Subject();\n\nbtn.addEventListener('click', () => {\n  action$.next('clicked');\n});\n\naction$.pipe(\n  filter(a => a === 'clicked'),\n  throttleTime(1000)\n).subscribe(handleClick);\n\naction$.complete(); // cleanup",rel:['BehaviorSubject','ReplaySubject']},
{n:'BehaviorSubject',c:'multicasting',s:'Subject ที่มี initial value + replay ค่าล่าสุดให้ subscriber ใหม่ทันที',w:['State management (currentUser, cart, settings)','ค่าที่ต้องมี initial state','subscriber ใหม่ต้องได้ค่าทันที'],a:['ถ้าไม่ต้องการ initial value ใช้ Subject หรือ ReplaySubject(1)'],sig:'new BehaviorSubject<T>(initialValue: T)',code:"class CartService {\n  private cart$ = new BehaviorSubject([]);\n\n  addItem(item) {\n    const curr = this.cart$.getValue();\n    this.cart$.next([...curr, item]);\n  }\n\n  getCart() { return this.cart$.asObservable(); }\n}\n\ncartService.getCart().subscribe(renderCart);",rel:['Subject','ReplaySubject','shareReplay']},
{n:'ReplaySubject',c:'multicasting',s:'Subject ที่ replay N ค่าล่าสุดให้ subscriber ใหม่',w:['ต้องการ history N ค่าล่าสุด','undo/redo buffer','subscriber ใหม่ต้องได้ค่าก่อนหน้า'],a:[],sig:'new ReplaySubject<T>(bufferSize?: number, windowTime?: number)',code:"const history$ = new ReplaySubject(10);\n\ndispatch('LOGIN', user);\ndispatch('ADD_ITEM', item);\n\n// subscriber ใหม่ได้ 10 action ล่าสุดทันที\nhistory$.subscribe(a => console.log(a));",rel:['Subject','BehaviorSubject','shareReplay']},
{n:'AsyncSubject',c:'multicasting',s:'emit เฉพาะค่าสุดท้ายตอน complete เท่านั้น',w:['cache result ของ async operation','เหมือน Promise — emit ครั้งเดียวตอน done','lazy computation ที่ share result'],a:['ไม่ complete จะไม่ emit เลย'],sig:'new AsyncSubject<T>()',code:"const result$ = new AsyncSubject();\n\nfetchData().then(data => {\n  result$.next(data);\n  result$.complete();\n});\n\nresult$.subscribe(data => render(data));",rel:['Subject','BehaviorSubject']},
];

let rxjsCatActive='all',rxjsQ='';
let rxjsCurrentView='ref';

function initRxjs(){
  renderRxjsCats();
  renderRxjsOps();
  rxjsInitPlayground();
  highlightCode('#rxjs-tab pre.rxjs-code code');
}

function renderRxjsCats(){
  const el=document.getElementById('rxjs-cat-filter');
  if(!el)return;
  el.innerHTML=RXJS_CATS.map(cat=>{
    const active=cat.id===rxjsCatActive;
    return `<button class="rxjs-chip${active?' rxjs-chip-active':''}" style="${active?`background:${cat.color}22;border-color:${cat.color};color:${cat.color}`:''}" onclick="rxjsSetCat('${cat.id}')">${cat.label}</button>`;
  }).join('');
}

function rxjsSetCat(cat){rxjsCatActive=cat;renderRxjsCats();renderRxjsOps();}

function rxjsSearch(q){rxjsQ=q.toLowerCase().trim();renderRxjsOps();}

function renderRxjsOps(){
  const el=document.getElementById('rxjs-op-list');
  if(!el)return;
  const ops=RXJS_OPS.filter(op=>{
    const matchCat=rxjsCatActive==='all'||op.c===rxjsCatActive;
    const matchQ=!rxjsQ||op.n.toLowerCase().includes(rxjsQ)||op.s.toLowerCase().includes(rxjsQ)||op.w.join(' ').toLowerCase().includes(rxjsQ);
    return matchCat&&matchQ;
  });
  const cnt=document.getElementById('rxjs-count');
  if(cnt)cnt.textContent=`${ops.length} operator${ops.length!==1?'s':''}`;
  if(!ops.length){el.innerHTML='<div class="rxjs-empty">ไม่พบ operator ที่ค้นหา — ลองเปลี่ยน keyword หรือ category</div>';return;}
  el.innerHTML=ops.map(op=>`<div class="rxjs-op-card">
  <div class="rxjs-op-top">
    <span class="rxjs-op-name">${op.n}</span>
    <span class="rxjs-op-badge rxjs-badge-${op.c}">${op.c}</span>
    <button class="rxjs-try-btn" onclick="rxjsTryOp('${op.n}')">▶ Try</button>
  </div>
  <div class="rxjs-op-summary">${escHtml(op.s)}</div>
  <div class="rxjs-op-when"><span class="rxjs-when-ok">✓ ใช้เมื่อ</span>${op.w.map(w=>`<div class="rxjs-when-item">• ${escHtml(w)}</div>`).join('')}${op.a.length?`<span class="rxjs-when-no">✗ หลีกเลี่ยง</span>${op.a.map(a=>`<div class="rxjs-when-item rxjs-avoid">• ${escHtml(a)}</div>`).join('')}`:''}</div>
  <details class="rxjs-details"><summary class="rxjs-details-sum"><span class="rxjs-sig-lbl">sig</span> <code class="rxjs-sig-code">${escHtml(op.sig)}</code></summary><div class="rxjs-code-block"><button class="rxjs-copy-btn" onclick="rxjsCopyCode(this)">⎘ copy</button><pre class="rxjs-code"><code data-highlighted="yes">${hlTS(op.code)}</code></pre></div></details>
  ${op.rel.length?`<div class="rxjs-op-rel">เทียบกับ: ${op.rel.map(r=>`<button class="rxjs-rel-btn" onclick="rxjsJumpTo('${r}')">${r}</button>`).join('')}</div>`:''}
</div>`).join('');
}

// Runnable versions of operator examples (override op.code for playground)
const RXJS_RUN_CODE={
'from':
`// from — แปลง array / Promise เป็น Observable
from([1, 2, 3]).subscribe(console.log);

// จาก Promise
from(Promise.resolve({ name: 'RxJS', version: 7 }))
  .subscribe(data => console.log('resolved:', JSON.stringify(data)));`,

'fromEvent':
`// จำลอง DOM events ด้วย Subject (ไม่ต้องการ element จริง)
const clicks$ = new Subject();

clicks$.pipe(
  map(pos => \`clicked at x:\${pos.x} y:\${pos.y}\`)
).subscribe(console.log);

clicks$.next({ x: 120, y: 45 });
clicks$.next({ x: 88,  y: 200 });
clicks$.next({ x: 300, y: 150 });
clicks$.complete();`,

'interval':
`// poll ทุก 300ms รับแค่ 5 ครั้ง
interval(300).pipe(
  take(5),
  switchMap(i => of({ tick: i, ok: i < 4 ? 'loading' : 'done' }))
).subscribe({
  next: s => console.log(\`poll #\${s.tick}:\`, s.ok),
  complete: () => console.log('หยุด poll')
});`,

'timer':
`// emit ครั้งเดียวหลัง 500ms
timer(500).subscribe(() => console.log('⏰ timer fired!'));

// emit ทุก 300ms หลังรอ 600ms
timer(600, 300).pipe(
  take(4),
  map(n => \`tick \${n}\`)
).subscribe(console.log);`,

'EMPTY':
`const search$ = new Subject();

search$.pipe(
  switchMap(term =>
    term.length < 2 ? EMPTY : of(\`results: "\${term}"\`).pipe(delay(100))
  )
).subscribe(r => console.log(r));

search$.next('a');   // ไม่ emit (EMPTY)
search$.next('rx');  // emit
search$.next('rxj'); // emit`,

'throwError':
`throwError(() => new Error('API failed')).pipe(
  catchError(err => {
    console.error('caught:', err.message);
    return EMPTY;
  })
).subscribe({
  next: v => console.log('next:', v),
  complete: () => console.log('complete')
});`,

'iif':
`const isLoggedIn = () => true;

iif(
  isLoggedIn,
  of({ user: 'สมชาย', role: 'admin' }),
  of({ guest: true })
).subscribe(u => console.log(JSON.stringify(u)));`,

'map':
`from([1, 2, 3]).pipe(
  map(x => x * 2)
).subscribe(console.log); // 2, 4, 6

// transform HTTP response shape
of({ data: [{ name: 'ก้อง', active: true }, { name: 'บิ๊ก', active: false }] }).pipe(
  map(res => res.data),
  map(users => users.filter(u => u.active))
).subscribe(u => console.log('active:', JSON.stringify(u)));`,

'switchMap':
`// search autocomplete: cancel request เก่าทันทีเมื่อมีคำใหม่
const search$ = new Subject();

search$.pipe(
  debounceTime(100),
  distinctUntilChanged(),
  switchMap(term =>
    term ? of(\`results for "\${term}"\`).pipe(delay(150)) : EMPTY
  )
).subscribe(r => console.log(r));

search$.next('a');
search$.next('an');
search$.next('ang');
setTimeout(() => search$.next('angular'), 200);`,

'mergeMap':
`// upload หลายไฟล์พร้อมกัน (parallel)
const files = ['photo.jpg', 'doc.pdf', 'data.csv'];

from(files).pipe(
  mergeMap(file => {
    const ms = Math.round(Math.random() * 150 + 100);
    return of(\`✅ uploaded: \${file}\`).pipe(delay(ms));
  })
).subscribe({
  next: r => console.log(r),
  complete: () => console.log('🎉 ทุกไฟล์ upload สำเร็จ')
});`,

'concatMap':
`// sequential steps — รอทีละขั้น
const steps = ['validate', 'save to DB', 'send email'];

from(steps).pipe(
  concatMap((step, i) =>
    of(\`✅ step \${i+1}: \${step}\`).pipe(delay(200))
  )
).subscribe({
  next: s => console.log(s),
  complete: () => console.log('🏁 ทุก step เสร็จ')
});`,

'exhaustMap':
`// ป้องกัน double submit
const loginClick$ = new Subject();

loginClick$.pipe(
  exhaustMap(() => {
    console.log('🔐 login started...');
    return of({ user: 'สมชาย', token: 'abc123' }).pipe(delay(300));
  })
).subscribe(u => console.log('✅ logged in:', u.user));

loginClick$.next(); // fires
loginClick$.next(); // ignored (login ยังรันอยู่)
loginClick$.next(); // ignored
console.log('3 clicks sent → only 1 login fires');`,

'scan':
`// running counter
from(['click','click','click','click']).pipe(
  scan(count => count + 1, 0),
  map(n => \`count: \${n}\`)
).subscribe(console.log);

// build array progressively
of(1, 2, 3).pipe(
  scan((acc, v) => [...acc, v], [])
).subscribe(arr => console.log(JSON.stringify(arr)));`,

'bufferTime':
`// จำลอง buffered events
interval(100).pipe(
  take(15),
  bufferTime(500)
).subscribe(batch => console.log('batch:', JSON.stringify(batch)));`,

'filter':
`from([1,2,3,4,5,6]).pipe(
  filter(n => n % 2 === 0)
).subscribe(console.log); // 2, 4, 6

// กรอง events ตาม type
from([
  { type: 'click', target: '.btn-primary' },
  { type: 'click', target: '.btn-secondary' },
  { type: 'click', target: '.btn-primary' }
]).pipe(
  filter(e => e.target === '.btn-primary')
).subscribe(e => console.log('handled:', e.target));`,

'take':
`interval(200).pipe(
  take(3)
).subscribe({
  next: n => console.log(n),
  complete: () => console.log('complete after 3')
});

// take(1) = first-only
const btn$ = new Subject();
btn$.pipe(take(1)).subscribe(() => console.log('first click only!'));
btn$.next(); // fires
btn$.next(); // ignored`,

'takeUntil':
`const destroy$ = new Subject();

interval(200).pipe(
  takeUntil(destroy$)
).subscribe({
  next: tick => console.log('tick:', tick)
});

// destroy หลัง 700ms
setTimeout(() => {
  destroy$.next();
  destroy$.complete();
  console.log('✅ unsubscribed!');
}, 700);`,

'takeWhile':
`const statuses = ['queued', 'processing', 'processing', 'done'];

from(statuses).pipe(
  concatMap((s, i) => of(s).pipe(delay(i * 150))),
  takeWhile(s => s !== 'done', true)
).subscribe({
  next: s => console.log('status:', s),
  complete: () => console.log('🏁 job complete!')
});`,

'skip':
`const state$ = new BehaviorSubject(null);

state$.pipe(
  skip(1) // ข้าม null initial value
).subscribe(data => console.log('got data:', JSON.stringify(data)));

state$.next({ users: ['ก้อง'] });
state$.next({ users: ['ก้อง', 'บิ๊ก'] });`,

'skipUntil':
`const ready$ = new Subject();

interval(100).pipe(
  take(10),
  skipUntil(ready$)
).subscribe(n => console.log('after ready:', n));

setTimeout(() => {
  console.log('🟢 ready!');
  ready$.next();
}, 350);`,

'debounceTime':
`const input$ = new Subject();

input$.pipe(
  tap(v => console.log('⌨️', v)),
  debounceTime(200),
  distinctUntilChanged()
).subscribe(v => console.log('🔍 search API:', v));

['a','an','ang','angu','angul','angular'].forEach((v, i) =>
  setTimeout(() => input$.next(v), i * 80)
);`,

'throttleTime':
`// scroll/event throttling
interval(50).pipe(
  take(20),
  throttleTime(200),
  map(n => \`event #\${n}\`)
).subscribe(console.log);`,

'distinctUntilChanged':
`from([1,1,2,2,3,1]).pipe(
  distinctUntilChanged()
).subscribe(console.log); // 1 2 3 1

// custom comparator
from([
  { userId: 1, name: 'ก้อง' },
  { userId: 1, name: 'ก้อง v2' }, // same id → skip
  { userId: 2, name: 'บิ๊ก' }
]).pipe(
  distinctUntilChanged((a, b) => a.userId === b.userId)
).subscribe(s => console.log(JSON.stringify(s)));`,

'distinct':
`from([1,2,1,3,2,4]).pipe(
  distinct()
).subscribe(console.log); // 1 2 3 4

from([{id:1,name:'ก้อง'},{id:2,name:'บิ๊ก'},{id:1,name:'ก้อง v2'}]).pipe(
  distinct(u => u.id)
).subscribe(u => console.log(JSON.stringify(u)));`,

'sampleTime':
`// snapshot ทุก 300ms จาก stream ที่ถี่
interval(60).pipe(
  take(20),
  map(n => ({ x: n * 5, y: Math.round(Math.random() * 100) })),
  sampleTime(300)
).subscribe(pos => console.log('sampled:', JSON.stringify(pos)));`,

'combineLatest':
`const filter$ = new BehaviorSubject('all');
const sort$   = new BehaviorSubject('name');
const page$   = new BehaviorSubject(1);

combineLatest([filter$, sort$, page$]).pipe(
  debounceTime(50),
  map(([f, s, p]) => \`filter=\${f} sort=\${s} page=\${p}\`)
).subscribe(q => console.log('query:', q));

filter$.next('active');
sort$.next('date');
page$.next(2);`,

'merge':
`const a$ = interval(200).pipe(take(3), map(i => \`A\${i}\`));
const b$ = interval(300).pipe(take(2), map(i => \`B\${i}\`));
const c$ = timer(500).pipe(map(() => 'C0'));

merge(a$, b$, c$).subscribe(e => console.log('event:', e));`,

'concat':
`concat(
  of('⏳ loading...'),
  of({ data: 'init', version: 2 }).pipe(
    delay(200),
    map(d => JSON.stringify(d))
  ),
  of('✅ ready!')
).subscribe(state => console.log(state));`,

'forkJoin':
`forkJoin({
  user:  of({ id: 1, name: 'สมชาย' }).pipe(delay(100)),
  posts: of([{ title: 'RxJS 101' }, { title: 'Angular Tips' }]).pipe(delay(150)),
  tags:  of(['rxjs', 'angular']).pipe(delay(80))
}).subscribe(({ user, posts, tags }) => {
  console.log('👤', user.name);
  console.log('📝', posts.length, 'posts');
  console.log('🏷️', tags.join(', '));
  console.log('✅ โหลดพร้อมกันทั้ง 3 APIs!');
});`,

'withLatestFrom':
`const user$ = new BehaviorSubject({ name: 'สมชาย', role: 'admin' });
const actions$ = new Subject();

actions$.pipe(
  withLatestFrom(user$),
  map(([action, user]) => ({
    action,
    user: user.name,
    allowed: user.role === 'admin' || action === 'view'
  }))
).subscribe(r => console.log(JSON.stringify(r)));

actions$.next('view');
actions$.next('delete');
user$.next({ name: 'บิ๊ก', role: 'viewer' });
actions$.next('delete'); // allowed: false`,

'race':
`const api1$ = of('api1 response').pipe(delay(300));
const api2$ = of('api2 response').pipe(delay(200)); // เร็วกว่า
const api3$ = of('api3 response').pipe(delay(400));

race(api1$, api2$, api3$).subscribe(
  winner => console.log('🏆 winner:', winner)
);`,

'startWith':
`of({ users: ['ก้อง', 'บิ๊ก', 'มิ้น'] }).pipe(
  delay(300),
  map(data => ({ loading: false, data })),
  startWith({ loading: true, data: null })
).subscribe(state => console.log(JSON.stringify(state)));`,

'catchError':
`throwError(() => new Error('500 Internal Server Error')).pipe(
  catchError(err => {
    console.log('❌ Error:', err.message);
    return of({ data: [], fromCache: true }); // fallback
  })
).subscribe(r => console.log('✅', JSON.stringify(r)));`,

'retry':
`let attempt = 0;

defer(() => {
  attempt++;
  console.log(\`attempt \${attempt}...\`);
  return attempt < 3
    ? throwError(() => new Error('fail'))
    : of('✅ success!');
}).pipe(
  retry(3)
).subscribe({
  next: v => console.log(v),
  error: e => console.log('❌', e.message)
});`,

'retryWhen':
`let tries = 0;

defer(() => {
  tries++;
  return tries < 3
    ? throwError(() => new Error(\`fail #\${tries}\`))
    : of('success');
}).pipe(
  retry({ count: 3, delay: 200 })
).subscribe({
  next: v => console.log('✅', v),
  error: e => console.log('❌', e.message)
});`,

'finalize':
`of('data').pipe(
  delay(200),
  finalize(() => console.log('🏁 finalize — always runs'))
).subscribe({
  next: v => console.log('next:', v),
  complete: () => console.log('complete')
});

throwError(() => new Error('oops')).pipe(
  catchError(e => { console.log('caught:', e.message); return EMPTY; }),
  finalize(() => console.log('🏁 finalize on error too'))
).subscribe();`,

'tap':
`from([1, 2, 3, 4, 5]).pipe(
  tap(v => console.log('📥 before filter:', v)),
  filter(v => v % 2 === 0),
  tap(v => console.log('✅ passed filter:', v)),
  map(v => v * 10)
).subscribe(v => console.log('📤 result:', v));`,

'timeout':
`// เร็วพอ
of('fast response').pipe(
  delay(100),
  timeout(500)
).subscribe({
  next: v => console.log('✅', v),
  error: e => console.log('❌', e.message)
});

// timeout
of('slow response').pipe(
  delay(600),
  timeout(300),
  catchError(err =>
    err.name === 'TimeoutError'
      ? of('⏱️ fallback data')
      : throwError(() => err)
  )
).subscribe(v => console.log(v));`,

'share':
`let callCount = 0;
const data$ = defer(() => {
  callCount++;
  console.log(\`HTTP call #\${callCount}\`);
  return of({ result: 'shared' }).pipe(delay(100));
}).pipe(share());

// 2 subscribers แต่ HTTP call แค่ครั้งเดียว
data$.subscribe(d => console.log('A:', JSON.stringify(d)));
data$.subscribe(d => console.log('B:', JSON.stringify(d)));`,

'shareReplay':
`let callCount = 0;
const config$ = defer(() => {
  callCount++;
  console.log(\`HTTP call #\${callCount}\`);
  return of({ theme: 'dark', lang: 'th' }).pipe(delay(100));
}).pipe(shareReplay({ bufferSize: 1, refCount: true }));

config$.subscribe(c => console.log('header:', JSON.stringify(c)));
config$.subscribe(c => console.log('sidebar:', JSON.stringify(c)));

setTimeout(() =>
  config$.subscribe(c => console.log('late (cached):', JSON.stringify(c))),
300);`,

'Subject':
`const action$ = new Subject();

action$.pipe(
  filter(a => a.type === 'click'),
  throttleTime(200)
).subscribe(a => console.log('handled:', a.type, '#' + a.id));

action$.next({ type: 'click', id: 1 });
action$.next({ type: 'hover', id: 2 }); // filtered out
action$.next({ type: 'click', id: 3 });
action$.complete();`,

'BehaviorSubject':
`const cart$ = new BehaviorSubject([]);

// subscriber A
cart$.subscribe(items => console.log('A cart:', items.length, 'items'));

cart$.next([{ name: 'MacBook', price: 50000 }]);
cart$.next([{ name: 'MacBook', price: 50000 }, { name: 'AirPods', price: 8000 }]);

// subscriber B มาทีหลัง — ได้ค่าล่าสุดทันที
cart$.subscribe(items => console.log('B (late):', items.length, 'items'));

const total = cart$.getValue().reduce((s, i) => s + i.price, 0);
console.log('total:', total.toLocaleString(), 'บาท');`,

'ReplaySubject':
`const history$ = new ReplaySubject(3); // buffer 3 ค่าล่าสุด

history$.next({ action: 'login' });
history$.next({ action: 'view', page: '/home' });
history$.next({ action: 'click', btn: 'buy' });
history$.next({ action: 'checkout' });

// subscriber ใหม่ได้ 3 ล่าสุดทันที
history$.subscribe(a => console.log(JSON.stringify(a)));`,

'AsyncSubject':
`const result$ = new AsyncSubject();

result$.subscribe(v => console.log('A:', v));

result$.next(1); // ยังไม่ emit
result$.next(2); // ยังไม่ emit
result$.next(3); // ยังไม่ emit

result$.complete(); // emit เฉพาะค่าสุดท้าย (3)
console.log('complete called');

// late subscriber ก็ได้ค่า 3
result$.subscribe(v => console.log('B (late):', v));`,
};

function rxjsTryOp(name){
  const op=RXJS_OPS.find(o=>o.n===name);
  if(!op)return;
  rxjsSwitchView('pg');
  rxjsPgSetCode(RXJS_RUN_CODE[name]||op.code);
  rxjsRunCode();
  document.getElementById('rxjs-pg-view').scrollIntoView({behavior:'smooth',block:'start'});
}

function rxjsCopyCode(btn){
  const code=btn.nextElementSibling.textContent;
  copyText(code);
  const old=btn.textContent;btn.textContent='✓ copied';setTimeout(()=>btn.textContent=old,1500);
}

function rxjsJumpTo(name){
  rxjsSwitchView('ref');
  rxjsQ=name.toLowerCase();rxjsCatActive='all';
  const inp=document.getElementById('rxjs-search');if(inp)inp.value=name;
  renderRxjsCats();renderRxjsOps();
  document.getElementById('rxjs-op-list').scrollIntoView({behavior:'smooth',block:'start'});
}

function clearRxjs(){
  if(rxjsCurrentView==='pg'){rxjsClearOutput();return;}
  rxjsQ='';rxjsCatActive='all';
  const inp=document.getElementById('rxjs-search');if(inp)inp.value='';
  renderRxjsCats();renderRxjsOps();
}

function rxjsUcClick(q){
  rxjsSwitchView('ref');
  rxjsCatActive='all';
  renderRxjsCats();
  const inp=document.getElementById('rxjs-search');
  if(inp)inp.value=q;
  rxjsSearch(q);
  document.getElementById('rxjs-op-list').scrollIntoView({behavior:'smooth',block:'start'});
}

function rxjsSwitchView(v){
  rxjsCurrentView=v;
  const ref=document.getElementById('rxjs-ref-view');
  const pg=document.getElementById('rxjs-pg-view');
  const tabRef=document.getElementById('rxjs-vtab-ref');
  const tabPg=document.getElementById('rxjs-vtab-pg');
  const clearBtn=document.getElementById('rxjs-clear-btn');
  if(!ref||!pg)return;
  ref.style.display=v==='ref'?'block':'none';
  pg.style.display=v==='pg'?'block':'none';
  tabRef.classList.toggle('rxjs-view-tab-active',v==='ref');
  tabPg.classList.toggle('rxjs-view-tab-active',v==='pg');
  if(clearBtn)clearBtn.textContent=v==='pg'?'✖ ล้าง output':'✖ ล้าง';
  if(v==='pg'&&rxjsPgEditor)setTimeout(()=>{rxjsPgEditor.refresh();rxjsPgEditor.focus();},0);
}

function rxjsToggleAcc(btn){
  const body=btn.nextElementSibling;
  const open=body.style.display!=='none';
  body.style.display=open?'none':'block';
  btn.classList.toggle('rxjs-acc-open',!open);
  if(!open){
    // animate marble dots on open
    body.querySelectorAll('.rxjs-marble').forEach((m,mi)=>{
      m.classList.remove('rxjs-marble-animated');
      void m.offsetWidth; // force reflow to restart animation
      m.classList.add('rxjs-marble-animated');
      // stagger dots by position within each marble
      m.querySelectorAll('.rxjs-mdot,.rxjs-mend').forEach((dot,di)=>{
        dot.style.animationDelay=(mi*0.05+di*0.08)+'s';
      });
    });
  }
}

// ── RxJS PLAYGROUND ──

const RXJS_PG_PRESETS={
'of':`// of — emit ค่าหลายตัวทีเดียว แล้วแปลงด้วย map
of(1, 2, 3, 4, 5).pipe(
  filter(x => x % 2 !== 0),
  map(x => 'เลขคี่ x²: ' + (x * x))
).subscribe(v => console.log(v));`,

'from':`// from — แปลง array เป็น stream
from(['Angular', 'React', 'Vue']).pipe(
  map((name, i) => \`\${i + 1}. \${name}\`),
  filter(s => !s.includes('Vue'))
).subscribe(v => console.log(v));`,

'interval':`// interval — emit ทุก 300ms รับแค่ 6 ค่า
interval(300).pipe(
  take(6),
  map(i => {
    const bars = '█'.repeat(i + 1);
    return \`[\${i}] \${bars}\`;
  })
).subscribe({
  next: v => console.log(v),
  complete: () => console.log('✅ complete!')
});`,

'scan':`// scan — running total (เหมือน reduce แต่ emit ทุกรอบ)
of(10, 5, 20, 3, 15).pipe(
  scan((acc, v) => ({ sum: acc.sum + v, last: v }), { sum: 0, last: 0 }),
  map(s => \`+\${s.last} → รวม: \${s.sum}\`)
).subscribe(v => console.log(v));`,

'switchMap':`// switchMap — cancel inner เดิม เมื่อมี source ใหม่
// จำลอง: พิมพ์ search term → cancel เก่า → fetch ใหม่
of('a', 'an', 'ang', 'angu', 'angul').pipe(
  concatMap((term, i) =>
    // เพิ่ม delay เพื่อให้เห็นว่า switchMap จะ cancel ของเก่า
    timer(i * 80).pipe(
      switchMap(() => {
        console.log('🔍 search:', term);
        return of(\`results for "\${term}": [\${term}1, \${term}2]\`);
      })
    )
  ),
  take(3) // รับแค่ 3 ตัวแรกที่ผ่าน
).subscribe(r => console.log('📦', r));`,

'combineLatest':`// combineLatest — emit ทุกครั้งที่ stream ใดเปลี่ยน
const price$ = of(100, 200, 350);
const discount$ = of(0, 10, 20);

combineLatest([price$, discount$]).pipe(
  map(([price, disc]) => ({
    price,
    discount: disc + '%',
    total: price * (1 - disc / 100)
  }))
).subscribe(order => console.log(JSON.stringify(order)));`,

'forkJoin':`// forkJoin — parallel requests (รอทุกตัว complete)
forkJoin({
  user: of({ id: 1, name: 'สมชาย' }).pipe(delay(100)),
  posts: of([{ title: 'RxJS เบื้องต้น' }, { title: 'Angular Tips' }]).pipe(delay(150)),
  tags: of(['rxjs', 'angular', 'typescript']).pipe(delay(80))
}).subscribe(({ user, posts, tags }) => {
  console.log('👤 user:', user.name);
  console.log('📝 posts:', posts.length + ' รายการ');
  console.log('🏷️ tags:', tags.join(', '));
  console.log('✅ โหลดพร้อมกันทั้ง 3 APIs!');
});`,

'BehaviorSubject':`// BehaviorSubject — state management
const count$ = new BehaviorSubject(0);

// subscriber A (มาตั้งแต่แรก)
count$.subscribe(v => console.log('A:', v));

count$.next(1);
count$.next(2);
count$.next(3);

// subscriber B (มาทีหลัง) → ได้ค่าล่าสุด (3) ทันที
count$.pipe(
  map(v => 'B (late): ' + v)
).subscribe(v => console.log(v));

count$.next(4);
console.log('ค่าปัจจุบัน:', count$.getValue());`,

'catchError':`// catchError — error handling + fallback
throwError(() => new Error('Network timeout')).pipe(
  tap(() => console.log('ถ้าสำเร็จจะเข้าบรรทัดนี้')),
  catchError(err => {
    console.log('❌ Error:', err.message);
    return of({ data: 'cached fallback', fromCache: true });
  }),
  finalize(() => console.log('🏁 finalize — ทำงานเสมอ ทั้ง success และ error'))
).subscribe(v => console.log('✅ result:', JSON.stringify(v)));`,

'tap':`// tap — side effects โดยไม่เปลี่ยนค่าใน stream (debug-friendly)
from([1, 2, 3, 4, 5]).pipe(
  tap(v => console.log('📥 before filter:', v)),
  filter(v => v % 2 === 0),
  tap(v => console.log('✅ passed filter:', v)),
  map(v => v * 10),
  tap(v => console.log('🔄 after map:', v))
).subscribe(v => console.log('📤 subscribe got:', v));`,

'debounceTime':`// debounceTime — จำลอง search input (รอหยุด emit 200ms ก่อน)
// emit ถี่ๆ แต่ debounce จะปล่อยแค่ค่าสุดท้ายหลังหยุด
const keystrokes$ = from(['a','ab','abc','abcd','abcde']).pipe(
  concatMap((v,i) => timer(i * 60).pipe(map(() => v)))
);

keystrokes$.pipe(
  tap(v => console.log('⌨️ keystroke:', v)),
  debounceTime(150),
).subscribe(v => console.log('🔍 search API called with:', v));`,

'withLatestFrom':`// withLatestFrom — ดึงค่าล่าสุดจาก stream อื่นตอน source emit
const user$ = new BehaviorSubject({ name: 'สมชาย', role: 'admin' });
const actions$ = of('view', 'edit', 'delete');

actions$.pipe(
  withLatestFrom(user$),
  map(([action, user]) => ({
    action,
    user: user.name,
    allowed: user.role === 'admin' || action === 'view'
  }))
).subscribe(r => console.log(JSON.stringify(r)));`
};

let rxjsPgActive=false,rxjsPgLogCount=0,rxjsPgStopHandle=null,rxjsPgInited=false,rxjsPgEditor=null;
const _origConsoleLog=console.log,_origConsoleWarn=console.warn,_origConsoleError=console.error;

const RXJS_PG_DEFAULT=`// โหลดตัวอย่างจาก "ตัวอย่าง" ด้านบน หรือกด ▶ Try ที่ operator card
// Ctrl+Enter = Run

of(1, 2, 3, 4, 5).pipe(
  filter(x => x % 2 !== 0),
  map(x => x * x)
).subscribe(v => console.log('value:', v));`;

function rxjsInitPlayground(){
  if(rxjsPgInited)return;
  rxjsPgInited=true;

  // init CodeMirror
  const wrap=document.getElementById('rxjs-pg-cm-wrap');
  if(wrap&&window.CodeMirror){
    rxjsPgEditor=CodeMirror(wrap,{
      value:RXJS_PG_DEFAULT,
      mode:'javascript',
      theme:'dracula',
      lineNumbers:true,
      lineWrapping:false,
      tabSize:2,
      indentWithTabs:false,
      autoCloseBrackets:true,
      matchBrackets:true,
      extraKeys:{
        'Ctrl-Enter':()=>rxjsRunCode(),
        'Cmd-Enter':()=>rxjsRunCode(),
        'Ctrl-/':cm=>cm.toggleComment(),
        'Tab':cm=>cm.replaceSelection('  ','end')
      }
    });
    rxjsPgEditor.setSize('100%','100%');
  }

  // patch console once — route to output panel when playground is active
  console.log=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'log');
    _origConsoleLog(...args);
  };
  console.warn=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'warn');
    _origConsoleWarn(...args);
  };
  console.error=(...args)=>{
    if(rxjsPgActive)rxjsPgAppendLog(args,'error');
    _origConsoleError(...args);
  };
}

function rxjsPgGetCode(){
  return rxjsPgEditor?rxjsPgEditor.getValue():
    (document.getElementById('rxjs-pg-code')||{value:''}).value;
}
function rxjsPgSetCode(code){
  if(rxjsPgEditor){rxjsPgEditor.setValue(code);rxjsPgEditor.focus();}
  else{const ta=document.getElementById('rxjs-pg-code');if(ta)ta.value=code;}
}

function rxjsPgAppendLog(args,type){
  if(rxjsPgLogCount>=200)return;
  const out=document.getElementById('rxjs-pg-output');
  if(!out)return;
  const empty=out.querySelector('.rxjs-pg-empty');
  if(empty)empty.remove();
  rxjsPgLogCount++;

  if(type==='log'){
    const div=document.createElement('div');
    div.className='rxjs-pg-log rxjs-pg-log-entry';
    const idx=document.createElement('span');
    idx.className='rxjs-pg-log-idx';
    idx.textContent=rxjsPgLogCount;
    const val=document.createElement('span');
    const raw=args.map(a=>{
      if(typeof a==='object'&&a!==null){try{return JSON.stringify(a,null,2);}catch{return String(a);}}
      return String(a);
    }).join(' ');
    val.className='rxjs-pg-log-val'+(typeof args[0]==='number'&&args.length===1?' type-number':typeof args[0]==='string'&&args.length===1?' type-string':typeof args[0]==='boolean'&&args.length===1?' type-bool':'');
    val.textContent=raw;
    div.appendChild(idx);div.appendChild(val);
    out.appendChild(div);
    if(rxjsPgLogCount>=200){
      const lim=document.createElement('div');
      lim.className='rxjs-pg-log-complete';
      lim.textContent='… (ถึงขีดจำกัด 200 บรรทัด)';
      out.appendChild(lim);
      rxjsStopCode();
    }
  }else{
    const div=document.createElement('div');
    div.className=`rxjs-pg-log-${type} rxjs-pg-log-entry`;
    div.textContent=args.join(' ');
    out.appendChild(div);
  }
  out.scrollTop=out.scrollHeight;
}

function rxjsPgSetStatus(txt,running){
  const el=document.getElementById('rxjs-pg-status');
  if(!el)return;
  el.textContent=txt;
  el.className='rxjs-pg-status'+(running?' rxjs-pg-status-running':'');
  const stopBtn=document.getElementById('rxjs-pg-stop-btn');
  if(stopBtn)stopBtn.disabled=!running;
}

function rxjsRunCode(){
  if(!window.rxjs){showToast('กำลังโหลด RxJS...');return;}
  rxjsStopCode();

  const code=rxjsPgGetCode().trim();
  if(!code)return;

  const out=document.getElementById('rxjs-pg-output');
  if(out){out.innerHTML='';const div=document.createElement('div');div.className='rxjs-pg-log-divider';out.appendChild(div);}
  rxjsPgLogCount=0;
  rxjsPgActive=true;
  rxjsPgSetStatus('▶ Running…',true);

  // auto-stop safety after 15 seconds
  rxjsPgStopHandle=setTimeout(()=>{
    rxjsPgAppendLog(['⏱️ หยุดอัตโนมัติหลัง 15 วินาที'],'warn');
    rxjsStopCode();
  },15000);

  const {of,from,fromEvent,interval,timer,range,EMPTY,throwError,defer,iif,
    combineLatest,merge,concat,zip,forkJoin,race,Subject,BehaviorSubject,
    ReplaySubject,AsyncSubject,Observable,
    map,filter,take,takeUntil,takeWhile,skip,skipUntil,
    first,last,debounceTime,throttleTime,distinctUntilChanged,
    distinct,sampleTime,switchMap,mergeMap,concatMap,exhaustMap,
    scan,reduce,buffer,bufferTime,groupBy,toArray,pairwise,
    catchError,retry,retryWhen,finalize,tap,delay,timeout,
    share,shareReplay,startWith,withLatestFrom,pipe}=window.rxjs;

  try{
    new Function('of','from','fromEvent','interval','timer','range','EMPTY','throwError',
      'defer','iif','combineLatest','merge','concat','zip','forkJoin','race',
      'Subject','BehaviorSubject','ReplaySubject','AsyncSubject','Observable',
      'map','filter','take','takeUntil','takeWhile','skip','skipUntil',
      'first','last','debounceTime','throttleTime','distinctUntilChanged',
      'distinct','sampleTime','switchMap','mergeMap','concatMap','exhaustMap',
      'scan','reduce','buffer','bufferTime','groupBy','toArray','pairwise',
      'catchError','retry','retryWhen','finalize','tap','delay','timeout',
      'share','shareReplay','startWith','withLatestFrom','pipe',
      code
    )(of,from,fromEvent,interval,timer,range,EMPTY,throwError,
      defer,iif,combineLatest,merge,concat,zip,forkJoin,race,
      Subject,BehaviorSubject,ReplaySubject,AsyncSubject,Observable,
      map,filter,take,takeUntil,takeWhile,skip,skipUntil,
      first,last,debounceTime,throttleTime,distinctUntilChanged,
      distinct,sampleTime,switchMap,mergeMap,concatMap,exhaustMap,
      scan,reduce,buffer,bufferTime,groupBy,toArray,pairwise,
      catchError,retry,retryWhen,finalize,tap,delay,timeout,
      share,shareReplay,startWith,withLatestFrom,pipe);

    // if synchronous ops, mark done after a tick
    setTimeout(()=>{
      if(rxjsPgActive&&rxjsPgLogCount>0){
        rxjsPgSetStatus('✅ สำเร็จ ('+rxjsPgLogCount+' logs)',false);
        rxjsPgActive=false;
        clearTimeout(rxjsPgStopHandle);
      }else if(rxjsPgActive){
        rxjsPgSetStatus('▶ Running…',true);
      }
    },100);

  }catch(e){
    rxjsPgActive=false;
    clearTimeout(rxjsPgStopHandle);
    rxjsPgAppendLog(['❌ '+e.message],'error');
    rxjsPgSetStatus('❌ Error',false);
  }
}

function rxjsStopCode(){
  rxjsPgActive=false;
  clearTimeout(rxjsPgStopHandle);
  rxjsPgSetStatus('⏹ หยุดแล้ว',false);
}

function rxjsClearOutput(){
  rxjsStopCode();
  const out=document.getElementById('rxjs-pg-output');
  if(out){out.innerHTML='<div class="rxjs-pg-empty">กด ▶ Run เพื่อรันโค้ด</div>';}
  rxjsPgLogCount=0;
  rxjsPgSetStatus('⏸ พร้อม',false);
  document.querySelectorAll('.rxjs-pg-preset-btn').forEach(b=>b.classList.remove('rxjs-pg-preset-active'));
}

function rxjsPgPreset(name){
  const code=RXJS_PG_PRESETS[name];
  if(!code)return;
  rxjsPgSetCode(code);
  document.querySelectorAll('.rxjs-pg-preset-btn').forEach(b=>{
    b.classList.toggle('rxjs-pg-preset-active',b.getAttribute('onclick').includes("'"+name+"'"));
  });
}
