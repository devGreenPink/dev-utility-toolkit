// ── JAVA INTERNALS ── compile vs runtime, JVM memory, annotations, transactions, Quarkus build time (refdocs.js)
REF_DOCS.javaint={
  placeholder:'ค้นหา... เช่น retention, interceptor, requires_new, rollback, isolation, metaspace',
  lang:'java',
  fixLabel:'จำไว้',
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
   fix:['extension มี 2 ส่วน: `runtime/` คือ bean ที่เรา inject และ `deployment/` คือ `*Processor` ที่มี `@BuildStep` (แบบเดียวกับ cdgs-quarkus-extensions)','config บางตัวเป็น build time (เช่น `quarkus.datasource.db-kind`) แก้แล้วต้อง build ใหม่ เปลี่ยนด้วย env ตอนรันไม่ได้','bean ที่ไม่มีใครใช้ถูกตัดทิ้งตอน build ถ้า lookup แบบ dynamic ต้อง `@Unremovable`'],
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
