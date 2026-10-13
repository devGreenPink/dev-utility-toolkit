// ── JAVA INTERNALS ── compile vs runtime, JVM memory, annotations, transactions, Quarkus build time (refdocs.js)
REF_DOCS.javaint={
  placeholder:'ค้นหา... เช่น retention, interceptor, requires_new, rollback, isolation, metaspace',
  lang:'java',
  fixLabel:'จำไว้',
  diagrams:[
  {id:'mem',t:'Memory ของ JVM',kind:'boxes',
   intro:'Pod ถูก kernel ฆ่า (`OOMKilled`, exit 137) เมื่อทุกส่วนรวมกันเกิน memory limit ไม่ใช่แค่ heap · `-XX:MaxRAMPercentage=75.0` เผื่อ 25% ไว้ให้ส่วนที่อยู่นอก heap',
   root:{t:'Container memory limit',s:'เช่น resources.limits.memory: 1Gi',q:'container',dir:'row',
    note:'เพดานของทั้ง process ถ้าเกิน kernel ฆ่าทันที (`OOMKilled`, exit 137) โดยที่ Java ไม่ได้ throw อะไรเลย',kids:[
    {t:'Heap',s:'-Xmx / MaxRAMPercentage',size:3,tone:'blue',dir:'row',q:'heap',note:'object ทั้งหมดที่ `new` ขึ้นมา GC จัดการให้ · เต็มแล้วได้ `OutOfMemoryError: Java heap space`',kids:[
      {t:'Young',s:'Eden + Survivor',tone:'cyan',note:'object เกิดใหม่ ส่วนใหญ่ตายเร็ว (เช่น DTO ของแต่ละ request) GC เก็บบ่อยและเร็ว (minor GC)'},
      {t:'Old',s:'object อายุยืน',size:1.5,tone:'blue',note:'object ที่รอด GC หลายรอบ เช่น cache, connection pool · เต็มบ่อยทำให้เกิด GC ใหญ่ และแอปหยุดชั่วขณะ'}]},
    {t:'นอก heap',s:'native memory',size:1.4,tone:'purple',dir:'col',note:'ส่วนที่ `-Xmx` ไม่ได้คุม แต่ container นับรวมด้วย',kids:[
      {t:'Metaspace',s:'ข้อมูลของ class',tone:'purple',q:'metaspace',note:'โครงสร้างของทุก class ที่โหลด · เต็ม = `OutOfMemoryError: Metaspace` (class เยอะ หรือ ClassLoader รั่ว)'},
      {t:'Thread stacks',s:'-Xss ต่อ thread',tone:'orange',q:'StackOverflowError',note:'แต่ละ thread มี stack ของตัวเอง เรียกซ้ำลึกเกิน = `StackOverflowError` · thread เยอะเกิน = `unable to create native thread`'},
      {t:'Code cache',s:'machine code จาก JIT',tone:'green',note:'method ที่ JIT compile เป็น machine code แล้ว'},
      {t:'Direct buffers',s:'Netty / Vert.x',tone:'yellow',note:'buffer นอก heap ที่ Netty / Vert.x ใช้รับส่ง network'}]}]}},
  {id:'run',t:'จาก .java ถึงตอนรัน',kind:'flow',
   intro:'error แต่ละแบบเกิดคนละขั้น รู้ว่าเกิดขั้นไหนก็รู้ว่าต้องแก้ที่โค้ด ที่ dependency หรือที่สภาพแวดล้อม',
   opt:{label:'ขั้นตอนจาก source ถึงการรัน',errLabel:'ปัญหาที่เกิดที่ขั้นนี้',lang:'bash'},
   nodes:[
    {id:'src',icon:'file-code',t:'.java',s:'source',d:'โค้ดที่เราเขียน ยังไม่มีอะไรรัน',err:['IDE ขีดเส้นแดง = compile ไม่ผ่านแน่นอน']},
    {id:'javac',icon:'settings',t:'javac',s:'compile',d:'แปลงเป็น bytecode และตรวจ type ทั้งหมด · annotation processor (Lombok, MapStruct) ทำงานตอนนี้',
     err:['`cannot find symbol` / type ไม่ตรง: แก้โค้ด หรือ dependency ที่ใช้ compile','`release 21 not supported`: JDK ที่ใช้ build เก่ากว่า `maven.compiler.release`'],code:'mvn clean compile'},
    {id:'class',icon:'package',t:'.class / jar',s:'bytecode',d:'ไม่ผูกกับ OS · เลข major version ใน class file บอกว่า compile ด้วย JDK ไหน (65 = 21)',
     err:['`UnsupportedClassVersionError`: รันด้วย JDK ที่เก่ากว่าตอน compile'],code:'javap -v target/classes/org/acme/App.class | grep major'},
    {id:'load',icon:'download',t:'ClassLoader',s:'โหลด + verify',d:'หา class ตาม classpath แล้วตรวจ bytecode ก่อนใช้งาน',
     err:['`ClassNotFoundException` / `NoClassDefFoundError`: jar ไม่อยู่ใน classpath หรือ scope ผิด','`NoSuchMethodError`: library คนละเวอร์ชันกับตอน compile']},
    {id:'jit',icon:'zap',t:'Interpreter → JIT',s:'รันจริง',d:'เริ่มด้วยการแปลทีละคำสั่ง method ที่ถูกเรียกบ่อยถูก JIT compile เป็น machine code จึงเร็วขึ้นหลัง warm-up',
     err:['exception ทั่วไป (NullPointer, ClassCast) เกิดขั้นนี้: แก้ที่ข้อมูลหรือ logic','ช้าเฉพาะช่วงแรกหลัง deploy = JIT ยังไม่ warm-up']}]},
  {id:'cl',t:'ClassLoader',kind:'tree',
   intro:'ตัวลูกถามตัวแม่ก่อนเสมอ (parent delegation) ตัวแม่หาไม่เจอตัวลูกจึงหาเอง · class ชื่อเดียวกันที่โหลดคนละตัวถือเป็นคนละ type',
   root:{t:'Bootstrap',s:'java.base: java.lang, java.util',note:'ฝังอยู่ใน JVM โหลด class พื้นฐานเช่น `String`, `List` ไม่มีใครแทนที่ได้',kids:[
    {t:'Platform',s:'java.sql, java.xml',tone:'blue',note:'module อื่นของ JDK ที่ไม่ใช่แกนหลัก',kids:[
     {t:'Application',s:'classpath / jar ของแอป',tone:'green',q:'ClassLoader',note:'jar ของแอปกับ dependency ทั้งหมด · class ของ framework ส่วนใหญ่อยู่ที่นี่',kids:[
      {t:'Quarkus dev mode',s:'โค้ดที่เราแก้',tone:'orange',q:'cannot be cast',note:'`mvn quarkus:dev` โหลดโค้ดของเราด้วย ClassLoader แยก เพื่อทิ้งแล้วโหลดใหม่ตอน hot reload · เจอ `X cannot be cast to X` แปลว่า class เดียวกันถูกโหลดสองที่'}]}]}]}},
  {id:'tx',t:'REQUIRED vs REQUIRES_NEW',kind:'timeline',
   intro:'`REQUIRED` ร่วม transaction เดียวกับคนที่เรียก จึง rollback ไปด้วยกัน · `REQUIRES_NEW` พักตัวนอกไว้แล้ว commit ของตัวเองแยก',
   lanes:[
    {t:'OrderService.place() · tx1',bars:[{from:3,to:80,t:'tx1 ทำงาน',tone:'blue',note:'`@Transactional` (REQUIRED เป็นค่าเริ่ม) เปิด tx1'},{from:81,to:97,t:'rollback tx1',tone:'red',note:'exception ออกจาก `place()` ทุกอย่างใน tx1 ถูกยกเลิก'}]},
    {t:'AuditService.log() · REQUIRES_NEW',bars:[{from:16,to:38,t:'tx2 แยก → commit',tone:'green',q:'REQUIRES_NEW',note:'tx1 ถูกพักไว้ระหว่างนี้ tx2 commit ทันทีเมื่อ method จบ จึงรอดแม้ tx1 rollback ภายหลัง เหมาะกับ audit log'}]},
    {t:'PaymentService.charge() · REQUIRED',bars:[{from:44,to:72,t:'ร่วม tx1',tone:'orange',note:'ไม่มี transaction ของตัวเอง ข้อมูลที่บันทึกตรงนี้ถูก rollback ไปพร้อม tx1'}]}],
   marks:[{at:80,t:'throw exception',tone:'red',q:'rollback',note:'`RuntimeException` ออกจาก `place()` → tx1 rollback · ถ้าเป็น checked exception จะ commit แทน เว้นแต่ตั้ง `rollbackOn`'}]},
  ],
  items:[
  // ── Compile vs Runtime ──
  {g:'Compile vs Runtime',t:'จาก .java ไปจนรันบน JVM',b:'flow',bc:'blue',k:'javac bytecode classloader jit interpreter javap',
   d:'`javac` แปลง `.java` เป็น bytecode (`.class`) ที่ไม่ผูกกับ OS · ตอนรัน JVM โหลด class ด้วย ClassLoader → ตรวจ bytecode (verifier) → เริ่มด้วย interpreter แล้ว JIT (C1/C2) compile method ที่ถูกเรียกบ่อยเป็น machine code',
   fix:['error ตอน compile (type ผิด, หา symbol ไม่เจอ) ไม่มีวันรันได้','error ตอนรัน (exception) เกิดจากข้อมูลหรือสภาพแวดล้อม เช่น null, ไฟล์ไม่มี, classpath ขาด','แอปเพิ่งเปิดจะช้ากว่าตอนรันไปสักพัก เพราะ JIT ยัง warm-up ไม่เสร็จ'],
   lang:'bash',
   code:`javac -d out src/Hello.java     # compile เป็น out/Hello.class
javap -c -p out/Hello.class      # ดู bytecode
java -cp out Hello               # รันบน JVM`},
  {g:'Compile vs Runtime',t:'สิ่งที่ตัดสินตอน compile vs ตอนรัน',b:'gotcha',bc:'orange',k:'generics erasure static final constant inline overload override',
   d:'บางอย่างถูก "อบ" ลงไปใน .class ตั้งแต่ compile ถ้าไม่รู้จะงงว่าทำไมแก้แล้วไม่มีผล',
   fix:['Generics ถูกลบตอนรัน (type erasure): `List<String>` กับ `List<Integer>` เป็น class เดียวกัน ตรวจ type ของ generic ตอนรันไม่ได้','`public static final` ที่เป็นค่าคงที่ (String / ตัวเลข) ถูก copy ไปฝังใน class ที่เรียกใช้ แก้ค่าใน library แล้วต้อง compile ฝั่งที่เรียกใหม่ด้วย','overload เลือกตอน compile ตาม type ที่ประกาศ · override เลือกตอนรันตาม object จริง'],
   code:`class Base { void hi(Object o) { System.out.println("Object"); } }

Object s = "text";
new Base().hi(s);   // overload ถูกเลือกจาก type ที่ประกาศ (Object) ตอน compile`},
  {g:'Compile vs Runtime',t:'ClassLoader',b:'runtime',bc:'blue',k:'bootstrap platform application dev mode hot reload cannot be cast',
   d:'โหลด class เป็นลำดับชั้น: Bootstrap (java.*) → Platform → Application (classpath ของแอป) โดยถามตัวแม่ก่อนเสมอ (parent delegation) · class เดียวกันที่โหลดคนละ ClassLoader ถือเป็นคนละ type',
   fix:['Quarkus dev mode แยก ClassLoader ของโค้ดเราเพื่อ hot reload','ถ้าเจอ `X cannot be cast to X` แปลว่ามี class ชื่อเดียวกันถูกโหลด 2 ที่']},

  // ── JVM Memory ──
  {g:'JVM Memory',t:'พื้นที่หน่วยความจำของ JVM',b:'memory',bc:'purple',k:'heap metaspace stack code cache direct young old gc g1',
   d:'Heap = object ทั้งหมด (แบ่ง Young / Old ให้ GC) · Metaspace = ข้อมูล class · Stack = ตัวแปร local และ call stack ของแต่ละ thread · Code cache = machine code ที่ JIT compile · Direct memory = buffer นอก heap (Netty / Vert.x ใช้)',
   fix:['heap เต็ม → `OutOfMemoryError: Java heap space`','เรียกซ้ำลึกเกิน stack → `StackOverflowError`','memory ที่ container ใช้จริง = heap + metaspace + stack ทุก thread + direct memory ต้องเผื่อ limit มากกว่า heap'],
   lang:'bash',
   code:`java -Xms256m -Xmx1g -Xss512k -XX:MaxMetaspaceSize=256m -jar app.jar

jcmd <pid> GC.heap_info           # ดู heap ตอนรัน
jcmd <pid> GC.heap_dump /tmp/h.hprof`},
  {g:'JVM Memory',t:'Java ใน container (Kubernetes)',b:'k8s',bc:'purple',k:'maxrampercentage oomkilled 137 limit memory',
   d:'JVM รุ่นใหม่รู้ memory limit ของ container แล้ว ให้กำหนด heap เป็นเปอร์เซ็นต์ของ limit แทนการ fix `-Xmx`',
   fix:['`-XX:MaxRAMPercentage=75.0` เหลือ 25% ให้ metaspace / thread / direct memory','Pod ขึ้น `OOMKilled` exit code 137 = เกิน limit ของ container (kernel ฆ่า) ไม่ใช่ Java heap เต็ม'],
   lang:'yaml',
   code:`env:
  - name: JAVA_OPTS_APPEND
    value: "-XX:MaxRAMPercentage=75.0"
resources:
  limits:
    memory: 1Gi`},

  {g:'JVM Memory',t:'Garbage Collection (GC) เบื้องต้น',b:'gc',bc:'purple',k:'g1 zgc serial minor major full gc pause young old xlog jstat',
   d:'GC เก็บ object ที่ไม่มีใครอ้างถึงแล้ว · Minor GC = เก็บ Young (บ่อยและเร็ว) · Major / Full GC = เก็บ Old ด้วย (นานกว่า แอปอาจหยุดชั่วขณะ) · ค่าเริ่มคือ G1 · ZGC หยุดสั้นมาก เหมาะกับ heap ใหญ่',
   fix:['container ที่ได้ CPU น้อยกว่า 2 หรือ memory น้อยกว่าราว 1.8 GB JVM เลือก SerialGC เอง (หยุดทั้งแอปตอน GC) ระบุ `-XX:+UseG1GC` ถ้าต้องการ','GC ถี่จนกิน CPU แต่ heap ไม่ลด = memory รั่ว (เช่น เก็บ object ใน static Map ที่ไม่มีวันลบ)','ดู GC log ก่อนปรับ flag ใดๆ'],
   lang:'bash',
   code:`# GC log ลงไฟล์
java -Xlog:gc*:file=/tmp/gc.log:time,uptime -jar app.jar

# ดูขณะรัน
jcmd <pid> GC.heap_info
jstat -gcutil <pid> 1000`},

  // ── กับดักของภาษา ──
  {g:'กับดักของภาษา',t:'== กับ equals() และ Integer cache',b:'gotcha',bc:'orange',k:'integer long cache 127 128 equals string compare boxing',
   d:'`==` เทียบว่าเป็น object ตัวเดียวกัน ไม่ใช่ค่าเท่ากัน · `Integer` / `Long` ค่า -128 ถึง 127 ถูก cache ไว้ `==` จึงบังเอิญเป็นจริง พอเกิน 127 เป็นเท็จ',
   fix:['เทียบ object ด้วย `equals()` หรือ `Objects.equals(a, b)` (ปลอดภัยกับ null)','`String` เทียบด้วย `equals()` เสมอ','id ของ entity เป็น `Long` อย่าใช้ `==`'],
   code:`Long a = 127L, b = 127L;
System.out.println(a == b);        // true  (มาจาก cache)
Long c = 128L, d = 128L;
System.out.println(c == d);        // false (คนละ object)
System.out.println(c.equals(d));   // true`},
  {g:'กับดักของภาษา',t:'equals / hashCode ของ JPA entity',b:'gotcha',bc:'orange',k:'equals hashcode entity set hashset lombok data id null',
   d:'entity ที่ยังไม่ persist มี id เป็น null ถ้า `hashCode()` คำนวณจาก id พอ persist แล้ว hash เปลี่ยน object จะหายจาก `HashSet` ที่ใส่ไว้ก่อน · Lombok `@Data` สร้าง equals / hashCode จากทุก field รวม relation (ช้าและวนลูปได้)',
   fix:['เทียบด้วย id เมื่อมีค่าแล้ว และให้ `hashCode()` คงที่ตลอดอายุ object','entity อย่าใช้ `@Data` ใช้ `@Getter` / `@Setter` แทน'],
   code:`@Entity
public class Employee {
    @Id @GeneratedValue Long id;

    @Override public boolean equals(Object o) {
        return this == o || (o instanceof Employee e && id != null && id.equals(e.id));
    }
    @Override public int hashCode() { return getClass().hashCode(); }  // คงที่ ไม่ขึ้นกับ id
}`},

  // ── Thread ──
  {g:'Thread',t:'Virtual thread (Java 21) และ @RunOnVirtualThread',b:'java21',bc:'cyan',k:'virtual thread loom runonvirtualthread blocking event loop pinning synchronized',
   d:'virtual thread เป็น thread เบาๆ ที่ JVM จัดการเอง สร้างได้เป็นแสน เขียนโค้ดแบบ blocking ธรรมดาแต่รับงานพร้อมกันได้มากขึ้น · Quarkus ใช้กับ endpoint ด้วย `@RunOnVirtualThread`',
   fix:['เหมาะกับงานที่รอ I/O (DB, REST) ไม่ช่วยงานที่กิน CPU','ระวัง pinning: blocking ใน `synchronized` ทำให้ virtual thread ติดกับ thread จริง (Java 21-23) ใช้ `ReentrantLock` แทน','connection pool ยังจำกัดจำนวนงาน DB พร้อมกันเท่าเดิม'],
   code:`@Path("/orders")
public class OrderResource {
    @GET
    @RunOnVirtualThread
    public List<OrderDto> list() {
        return service.findAll();   // JDBC แบบ blocking ได้ตามปกติ
    }
}`},

  // ── Annotation ──
  {g:'Annotation',t:'Annotation คืออะไร + meta-annotation',b:'basic',bc:'green',k:'retention source class runtime target documented inherited repeatable',
   d:'annotation คือ metadata ที่แปะบน class / method / field ตัวมันเองไม่ทำอะไร ต้องมีคนอ่านไปใช้: compiler, annotation processor หรือ framework ผ่าน reflection',
   fix:['`@Retention(SOURCE)` อยู่แค่ใน source: compiler / Lombok ใช้แล้วทิ้ง (เช่น `@Override`)','`@Retention(CLASS)` อยู่ใน .class แต่อ่านด้วย reflection ไม่ได้ (เป็นค่า default ถ้าไม่ระบุ)','`@Retention(RUNTIME)` อ่านด้วย reflection ตอนรันได้ ต้องใช้ค่านี้ถ้าจะให้ framework เห็น','`@Target` บอกว่าแปะที่ไหนได้ (TYPE, METHOD, FIELD, PARAMETER)']},
  {g:'Annotation',t:'สร้าง annotation เองแล้วอ่านด้วย reflection',b:'custom',bc:'green',k:'interface reflection getannotation field mask',
   d:'ตัวอย่าง `@Masked` ใช้ปิดบังข้อมูลบางส่วนก่อน log / ส่งออก',
   code:`@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Masked {
    int keep() default 4;          // เก็บกี่ตัวท้าย
}

public class Customer {
    @Masked(keep = 4)
    String citizenId;
    String name;
}

static void mask(Object obj) throws IllegalAccessException {
    for (Field f : obj.getClass().getDeclaredFields()) {
        Masked m = f.getAnnotation(Masked.class);
        if (m == null) continue;
        f.setAccessible(true);
        String v = (String) f.get(obj);
        if (v != null && v.length() > m.keep()) {
            f.set(obj, "*".repeat(v.length() - m.keep()) + v.substring(v.length() - m.keep()));
        }
    }
}`},
  {g:'Annotation',t:'Annotation + Interceptor ใน Quarkus (CDI)',b:'quarkus',bc:'green',k:'interceptorbinding aroundinvoke priority log execution time aop',
   d:'ทำ cross-cutting concern เช่น จับเวลา, audit log, ตรวจสิทธิ์ โดยแค่แปะ annotation ที่ method · Quarkus (ArC) ผูก interceptor ให้ตอน build',
   fix:['ใช้ได้กับ CDI bean ที่ inject มาเท่านั้น (ไม่ใช่ `new`)','method ที่เป็น `private` ไม่ถูก intercept','ArC intercept การเรียก method ของตัวเองได้ (self-invocation) ต่างจาก Spring'],
   code:`@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface LogTime {}

@LogTime
@Interceptor
@Priority(Interceptor.Priority.APPLICATION)
public class LogTimeInterceptor {
    @AroundInvoke
    Object around(InvocationContext ctx) throws Exception {
        long start = System.nanoTime();
        try {
            return ctx.proceed();
        } finally {
            Log.infof("%s took %d ms", ctx.getMethod().getName(),
                      (System.nanoTime() - start) / 1_000_000);
        }
    }
}

@ApplicationScoped
public class ReportService {
    @LogTime
    public byte[] export(Long id) { /* ... */ return new byte[0]; }
}`},
  {g:'Annotation',t:'Annotation processor (สร้างโค้ดตอน compile)',b:'compile',bc:'green',k:'lombok mapstruct apt annotationprocessorpaths generated',
   d:'Lombok, MapStruct, Hibernate metamodel อ่าน annotation ตอน compile แล้วสร้างโค้ดให้ จึงไม่มีต้นทุนตอนรัน ต้องประกาศ processor ใน maven-compiler-plugin',
   lang:'xml',
   code:`<plugin>
  <artifactId>maven-compiler-plugin</artifactId>
  <configuration>
    <annotationProcessorPaths>
      <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>\${mapstruct.version}</version>
      </path>
    </annotationProcessorPaths>
  </configuration>
</plugin>`},

  // ── Transaction ──
  {g:'Transaction',t:'ACID และ @Transactional พื้นฐาน',b:'tx',bc:'orange',k:'atomic consistency isolation durability commit rollback',
   d:'Atomic = สำเร็จทั้งหมดหรือไม่มีอะไรเกิดเลย · Consistent = ข้อมูลถูกกฎเสมอ · Isolated = transaction ไม่เห็นงานครึ่งๆ กลางๆ ของกันและกัน · Durable = commit แล้วไม่หาย',
   fix:['`@Transactional` (jakarta.transaction) ค่าเริ่ม `TxType.REQUIRED`','rollback อัตโนมัติเมื่อ throw `RuntimeException` หรือ `Error`','checked exception (เช่น `IOException`) จะ commit ถ้าไม่ระบุ `rollbackOn`'],
   code:`@ApplicationScoped
public class TransferService {
    @Transactional
    public void transfer(Long from, Long to, BigDecimal amount) {
        Account a = em.find(Account.class, from, LockModeType.PESSIMISTIC_WRITE);
        Account b = em.find(Account.class, to, LockModeType.PESSIMISTIC_WRITE);
        a.withdraw(amount);       // throw IllegalStateException ถ้าเงินไม่พอ → rollback ทั้งก้อน
        b.deposit(amount);
    }
}`},
  {g:'Transaction',t:'TxType: REQUIRED / REQUIRES_NEW / MANDATORY / ...',b:'propagation',bc:'orange',k:'requires_new supports not_supported never mandatory propagation audit log',
   d:'กำหนดว่า method จะเข้าร่วม transaction ที่มีอยู่ หรือแยกใหม่',
   fix:['REQUIRED: มีอยู่แล้วก็ร่วม ไม่มีก็สร้างใหม่ (ค่าเริ่มต้น)','REQUIRES_NEW: พักตัวนอกไว้แล้วสร้างใหม่ เหมาะกับ audit log ที่ต้องบันทึกแม้งานหลัก rollback','MANDATORY: ต้องมีอยู่แล้ว ไม่มีจะ error','SUPPORTS: มีก็ร่วม ไม่มีก็รันแบบไม่มี tx','NOT_SUPPORTED: พักตัวที่มีอยู่แล้วรันแบบไม่มี tx','NEVER: ถ้ามี tx อยู่จะ error'],
   code:`@ApplicationScoped
public class AuditService {
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void log(String action, String detail) {
        em.persist(new AuditLog(action, detail));   // commit แยก ไม่โดน rollback ตามงานหลัก
    }
}`},
  {g:'Transaction',t:'Rollback rules และ catch แล้วกลืน exception',b:'gotcha',bc:'red',k:'rollbackon dontrollbackon setrollbackonly quarkustransaction checked exception',
   d:'catch exception ไว้ใน method ที่มี `@Transactional` แล้วไม่ throw ต่อ transaction จะ commit สิ่งที่ทำไปแล้วครึ่งเดียว',
   fix:['checked exception ที่ต้องการ rollback: `@Transactional(rollbackOn = Exception.class)`','จะ catch แต่ยังต้อง rollback: `QuarkusTransaction.setRollbackOnly()`','รันโค้ดใน tx ใหม่แบบ programmatic: `QuarkusTransaction.requiringNew().run(() -> ...)`'],
   code:`@Transactional(rollbackOn = Exception.class)
public void importFile(InputStream in) throws IOException {
    for (Row r : parse(in)) {
        repo.persist(map(r));      // IOException ระหว่างทาง → rollback ทั้งหมด
    }
}`},
  {g:'Transaction',t:'Isolation level และ DB2 (UR / CS / RS / RR)',b:'isolation',bc:'orange',k:'read uncommitted committed repeatable serializable dirty phantom db2 cursor stability',
   d:'ยิ่ง isolation สูง ข้อมูลยิ่งถูก แต่ lock มากขึ้นและช้าลง · DB2 ใช้ชื่อของตัวเอง: UR = Read Uncommitted, CS = Read Committed (ค่าเริ่มต้นของ DB2), RS = Repeatable Read ของ ANSI, RR = Serializable · MariaDB InnoDB ค่าเริ่มต้นคือ REPEATABLE READ',
   fix:['Dirty read: เห็นข้อมูลที่ยังไม่ commit (เกิดได้แค่ UR)','Non-repeatable read: อ่านซ้ำแล้วค่าเปลี่ยน','Phantom: อ่านซ้ำแล้วมีแถวเพิ่ม','ตั้งทั้ง datasource ใน Quarkus หรือ per query ใน DB2 ด้วย `WITH UR`'],
   lang:'properties',
   code:`quarkus.datasource.jdbc.transaction-isolation-level=read-committed`},
  {g:'Transaction',t:'กับดักของ @Transactional',b:'gotcha',bc:'red',k:'private method new service timeout long transaction lock 911 lazy',
   fix:['ใส่บน method `private` หรือ object ที่สร้างด้วย `new` ไม่มีผล (ไม่ผ่าน CDI)','transaction ยาว (เรียก API ภายนอก, รอ user) ถือ lock ใน DB2 นาน ทำให้คนอื่นเจอ -911','ตั้ง timeout: `quarkus.transaction-manager.default-transaction-timeout=60s`','เข้าถึง lazy relation หลัง method จบจะเจอ `LazyInitializationException`','`@Transactional` บน resource class ทำให้ทั้ง request เป็น tx เดียว: ควรวางที่ service']},

  // ── Quarkus build time ──
  {g:'Quarkus build time',t:'Build time vs Runtime ของ Quarkus',b:'quarkus',bc:'cyan',k:'jandex buildstep build time config fixed native deployment processor extension',
   d:'Quarkus ย้ายงานที่ framework อื่นทำตอน start (สแกน annotation, สร้าง proxy, อ่าน config บางตัว) มาทำตอน build ทำให้ start เร็วและใช้ memory น้อย',
   fix:['extension มี 2 ส่วน: `runtime/` คือ bean ที่เรา inject และ `deployment/` คือ `*Processor` ที่มี `@BuildStep`','config บางตัวเป็น build time (เช่น `quarkus.datasource.db-kind`) แก้แล้วต้อง build ใหม่ เปลี่ยนด้วย env ตอนรันไม่ได้','bean ที่ไม่มีใครใช้ถูกตัดทิ้งตอน build ถ้า lookup แบบ dynamic ต้อง `@Unremovable`'],
   code:`// deployment module ของ extension
class MyExtensionProcessor {
    @BuildStep
    AdditionalBeanBuildItem beans() {
        return AdditionalBeanBuildItem.unremovableOf(MyService.class);
    }
}`},
  {g:'Quarkus build time',t:'Native image กับ reflection',b:'native',bc:'cyan',k:'graalvm registerforreflection jackson dto native',
   d:'native image ตัด class ที่วิเคราะห์ไม่เจอทิ้ง class ที่ใช้ผ่าน reflection เท่านั้น (เช่น DTO ที่ Jackson แปลงแบบ dynamic) ต้องประกาศไว้',
   code:`@RegisterForReflection
public record ReportRow(String code, BigDecimal amount) {}`},
  ],
};
