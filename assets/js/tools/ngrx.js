// ── NGRX / REDUX ── step-through of one dispatch cycle + reference cards (refdocs.js)
const NGRX_NODES=[
 ['component','Component','monitor'],['action','Action','send'],['reducer','Reducer','shuffle'],
 ['store','Store','database'],['selector','Selector','search'],['effect','Effect','zap'],['api','API','globe'],
];
// one cycle of loadUsers(): [node, caption, state after the step]
const NGRX_STEPS=[
 ['component','Component เรียก `store.dispatch(UserActions.load())` ตอน ngOnInit',{users:[],loading:false,error:null}],
 ['action','Action `[User] Load` ถูกส่งเข้า Store เป็น object ธรรมดา `{ type: \'[User] Load\' }`',{users:[],loading:false,error:null}],
 ['reducer','Reducer รับ state เดิม + action แล้วคืน state ใหม่ (ไม่แก้ของเดิม): `loading: true`',{users:[],loading:true,error:null}],
 ['store','Store เก็บ state ใหม่ แล้วแจ้งทุก selector ที่ subscribe อยู่',{users:[],loading:true,error:null}],
 ['selector','`selectLoading` เปลี่ยนเป็น true → template แสดง spinner',{users:[],loading:true,error:null}],
 ['effect','Effect ฟัง action `[User] Load` อยู่ (`ofType`) จึงเริ่มงาน side effect',{users:[],loading:true,error:null}],
 ['api','Effect เรียก `UserService.getAll()` ผ่าน HttpClient (reducer ห้ามเรียก API เอง)',{users:[],loading:true,error:null}],
 ['action','API ตอบกลับ Effect จึง dispatch `[User] Load Success` พร้อม payload',{users:[],loading:true,error:null}],
 ['reducer','Reducer ใส่ users และตั้ง `loading: false`',{users:['สมชาย','สมหญิง'],loading:false,error:null}],
 ['selector','`selectUsers` ได้ค่าใหม่ → `*ngFor` / `@for` วาดรายการ',{users:['สมชาย','สมหญิง'],loading:false,error:null}],
 ['component','Component แสดงผล ไม่ต้องรู้เลยว่าข้อมูลมาจาก API อย่างไร',{users:['สมชาย','สมหญิง'],loading:false,error:null}],
];
let _ngrxStep=-1,_ngrxTimer=0;
function ngrxInit(){
  const root=document.getElementById('ngrx-flow');
  if(!root)return;
  root.innerHTML=`<div class="ngrx-bar">
    <button type="button" class="btn btn-primary" onclick="ngrxPlay()">${ic('play')} dispatch(load())</button>
    <button type="button" class="btn btn-ghost" onclick="ngrxNext()">ทีละขั้น ${ic('chevron-right')}</button>
    <button type="button" class="btn btn-ghost" onclick="ngrxReset()">${ic('refresh-cw')} เริ่มใหม่</button>
  </div>
  <div class="ngrx-grid">
    <ol class="ngrx-nodes" aria-label="ส่วนประกอบของ NgRx">${NGRX_NODES.map(([id,label,icon])=>`<li class="ngrx-node" data-n="${id}"><span class="gw-ic">${ic(icon)}</span>${label}</li>`).join('')}</ol>
    <div class="ngrx-side">
      <div class="ngrx-caption" id="ngrx-caption" aria-live="polite">กด dispatch เพื่อดู action วิ่งผ่านแต่ละส่วนทีละขั้น</div>
      <div class="field-label">State ใน Store</div>
      <pre class="output-mono ngrx-state" id="ngrx-state"></pre>
    </div>
  </div>`;
  ngrxRender();
}
function ngrxRender(){
  const step=NGRX_STEPS[_ngrxStep];
  document.querySelectorAll('.ngrx-node').forEach(el=>el.classList.toggle('active',!!step&&el.dataset.n===step[0]));
  document.getElementById('ngrx-caption').innerHTML=step?`<b>${_ngrxStep+1}/${NGRX_STEPS.length}</b> ${refInline(step[1])}`:'กด dispatch เพื่อดู action วิ่งผ่านแต่ละส่วนทีละขั้น';
  document.getElementById('ngrx-state').textContent=JSON.stringify(step?step[2]:{users:[],loading:false,error:null},null,2);
}
function ngrxNext(){
  clearInterval(_ngrxTimer);
  if(_ngrxStep>=NGRX_STEPS.length-1)_ngrxStep=-1;
  _ngrxStep++;
  ngrxRender();
}
function ngrxPlay(){
  clearInterval(_ngrxTimer);
  _ngrxStep=0;ngrxRender();
  _ngrxTimer=setInterval(()=>{
    if(_ngrxStep>=NGRX_STEPS.length-1){clearInterval(_ngrxTimer);return;}
    _ngrxStep++;ngrxRender();
  },clickFx?1300:2200);
}
function ngrxReset(){clearInterval(_ngrxTimer);_ngrxStep=-1;ngrxRender();}

REF_DOCS.ngrx={
  placeholder:'ค้นหา... เช่น createActionGroup, selector, effect, selectSignal, breadcrumb',
  lang:'typescript',
  items:[
  {g:'แนวคิด',t:'Redux pattern คืออะไร',b:'concept',bc:'blue',k:'single source of truth immutable unidirectional',
   d:'เก็บ state ของแอปไว้ที่ Store ที่เดียว · เปลี่ยนได้ทางเดียวคือ dispatch action · reducer คำนวณ state ใหม่แบบ pure function (ไม่แก้ของเดิม) · component อ่านผ่าน selector · งานที่มีผลข้างเคียง (เรียก API) อยู่ใน effect',
   fix:['เหมาะกับ state ที่หลายหน้าใช้ร่วมกัน (user ที่ login, เมนู, breadcrumb)','state ที่ใช้แค่ในหน้าเดียว ใช้ signal / service ธรรมดาก็พอ']},
  {g:'แนวคิด',t:'framework UI กลางขององค์กรใช้ NgRx ทำอะไร',b:'framework',bc:'purple',k:'ui framework route guard breadcrumb user menu program',
   d:'framework UI ที่หลายแอปใช้ร่วมกันมักมี store slice กลาง เช่น config, menu, message, program, user · breadcrumb ถูกเติมโดย route guard ตอนเข้า route แล้ว component breadcrumb อ่านจาก state · ข้อมูล user อ่านผ่าน service ที่ครอบ store ได้เลยหลัง login',
   fix:['อย่า dispatch action ของ breadcrumb เอง ให้ใส่ข้อมูลใน `data` ของ route (เช่น `programId`, `titleCode`) แล้วให้ guard จัดการ']},
  {g:'Action',t:'createActionGroup',b:'action',bc:'green',k:'props emptyprops source events',
   d:'ประกาศ action หลายตัวของ feature เดียวกันในที่เดียว ได้ type เป็น `[Source] Event Name` อัตโนมัติ',
   code:`import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ users: User[] }>(),
    'Load Failure': props<{ error: string }>(),
  },
});
// ใช้: UserActions.load(), UserActions.loadSuccess({ users })`},
  {g:'Reducer',t:'createReducer + on',b:'reducer',bc:'green',k:'immutable spread state feature',
   d:'รับ state เดิมกับ action แล้วคืน state ใหม่ ห้าม mutate และห้ามเรียก API',
   code:`export interface UserState { users: User[]; loading: boolean; error: string | null; }

const initialState: UserState = { users: [], loading: false, error: null };

export const userReducer = createReducer(
  initialState,
  on(UserActions.load, state => ({ ...state, loading: true, error: null })),
  on(UserActions.loadSuccess, (state, { users }) => ({ ...state, users, loading: false })),
  on(UserActions.loadFailure, (state, { error }) => ({ ...state, error, loading: false })),
);`},
  {g:'Reducer',t:'createFeature: reducer + selector ในตัว',b:'feature',bc:'green',k:'createfeature selectusers provideState',
   d:'สร้าง selector ของทุก field ให้อัตโนมัติ ลดโค้ดซ้ำ',
   code:`export const userFeature = createFeature({
  name: 'user',
  reducer: userReducer,
});
export const { selectUsers, selectLoading, selectError } = userFeature;

// app.config.ts
provideStore(),
provideState(userFeature),
provideEffects(UserEffects),`},
  {g:'Selector',t:'createSelector และอ่านใน component',b:'selector',bc:'green',k:'memoized select selectsignal async pipe',
   d:'selector คำนวณค่าจาก state และ memoize (คำนวณใหม่เมื่อ input เปลี่ยนเท่านั้น) · Angular 17+ อ่านเป็น signal ได้ด้วย `selectSignal`',
   code:`export const selectActiveUsers = createSelector(
  selectUsers,
  users => users.filter(u => u.active),
);

@Component({ /* ... */ })
export class UserListComponent {
  private store = inject(Store);
  users = this.store.selectSignal(selectActiveUsers);   // signal
  loading$ = this.store.select(selectLoading);           // observable + async pipe

  ngOnInit() { this.store.dispatch(UserActions.load()); }
}`},
  {g:'Effect',t:'createEffect: เรียก API แล้ว dispatch ผลลัพธ์',b:'effect',bc:'orange',k:'actions oftype switchmap catcherror exhaustmap',
   d:'effect ฟัง action ด้วย `ofType` ทำงาน async แล้ว map ผลเป็น action ใหม่ · ต้อง `catchError` ภายใน switchMap ไม่งั้น error ครั้งเดียวทำให้ effect ตาย',
   fix:['`switchMap` = ยกเลิก request เก่าเมื่อมีใหม่ (ค้นหา)','`exhaustMap` = ไม่รับใหม่จนกว่าเก่าจบ (กดบันทึกซ้ำ)','`concatMap` = ทำตามลำดับ'],
   code:`@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private api = inject(UserService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.load),
      switchMap(() =>
        this.api.getAll().pipe(
          map(users => UserActions.loadSuccess({ users })),
          catchError(err => of(UserActions.loadFailure({ error: err.message }))),
        ),
      ),
    ),
  );
}`},
  {g:'Signals',t:'NgRx Signals Store (signalStore)',b:'signals',bc:'cyan',k:'signalstore withstate withcomputed withmethods patchstate rxmethod ngrx signals',
   d:'store แบบเบาที่สร้างจาก signal (แพ็กเกจ `@ngrx/signals`) ไม่มี action / reducer แยก เหมาะกับ state ของ feature หรือหน้าจอเดียว ส่วน state กลางทั้งแอปใช้ Store แบบเดิมต่อได้',
   fix:['`withState` = ค่าเริ่ม · `withComputed` = ค่าที่คำนวณต่อ · `withMethods` = method ที่แก้ state ด้วย `patchState`','งาน async ที่เป็น Observable ใช้ `rxMethod` และใส่ `catchError` ไว้ใน `switchMap` เหมือน effect','provide ที่ component (`providers: [UserStore]`) state จะหายไปพร้อม component'],
   code:`export const UserStore = signalStore(
  withState({ users: [] as User[], loading: false }),
  withComputed(({ users }) => ({
    count: computed(() => users().length),
  })),
  withMethods((store, api = inject(UserService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => api.getAll().pipe(
          tap(users => patchState(store, { users, loading: false })),
          catchError(() => { patchState(store, { loading: false }); return EMPTY; }),
        )),
      ),
    ),
  })),
);

@Component({ providers: [UserStore] /* ... */ })
export class UserListComponent {
  store = inject(UserStore);     // template: store.users(), store.count()
  ngOnInit() { this.store.load(); }
}`},
  {g:'แนวปฏิบัติ',t:'ข้อควรระวัง',b:'tips',bc:'red',k:'mutate state devtools serializable facade',
   fix:['ห้าม mutate state (`state.users.push(...)`) ให้สร้าง object ใหม่เสมอ','เก็บแต่ข้อมูลที่ serialize ได้ (ไม่เก็บ Date object, class instance, Observable)','ใช้ Redux DevTools ดู action และ state ทีละขั้น: `provideStoreDevtools({ maxAge: 25 })`','component ไม่ควรรู้จัก action มากเกินไป ทำ facade service ห่อ dispatch / select ได้']},
  ],
};
