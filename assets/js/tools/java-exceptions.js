// ── JAVA EXCEPTIONS ── cause + fix reference (core, JVM, JPA/Hibernate, Quarkus, REST/JSON, JDBC), rendered by refdocs.js
// t = simple class name(s) separated by " / "; the Stack Trace Analyzer looks entries up by that name.
REF_DOCS.javaex={
  placeholder:'ค้นหา exception หรือข้อความ... เช่น LazyInitialization, no Session, acquisition timeout',
  lang:'java',
  items:[
  // ── Core / Runtime ──
  {g:'Core / Runtime',t:'NullPointerException',b:'unchecked',bc:'red',s:'java.lang',k:'npe null cannot invoke because is null unboxing',
   d:'เรียก method / field บนค่าที่เป็น null · JDK 14+ บอกชัดว่าตัวไหน null เช่น `Cannot invoke "String.length()" because "name" is null` · ที่เจอบ่อยคือ unboxing `Integer` ที่เป็น null เป็น `int`',
   fix:['อ่านข้อความ helpful NPE ว่าตัวแปรไหน null แล้วไล่ย้อนว่าใคร set','validate input ที่ขอบระบบ (`@NotNull` บน DTO, `Objects.requireNonNull`)','ค่าที่อาจไม่มี ใช้ `Optional` หรือค่า default','ระวัง entity field ที่เป็น `Integer` แล้วนำไปคำนวณกับ `int`'],
   code:`Integer qty = dto.getQty();      // null จาก JSON
int total = qty * price;         // NPE: unboxing null

// แก้
int total = Objects.requireNonNullElse(qty, 0) * price;`},
  {g:'Core / Runtime',t:'ClassCastException',b:'unchecked',bc:'red',s:'java.lang',k:'cannot be cast biginteger bigdecimal native query object',
   d:'cast เป็น type ที่ไม่ใช่ของจริง · เจอบ่อยกับ native query ที่คืน `Object[]`: DB2 คืน `BigDecimal` สำหรับ DECIMAL, `Integer` สำหรับ COUNT, `Long` สำหรับ BIGINT ซึ่งไม่ตรงกับที่คิด',
   fix:['cast ผ่าน `Number` แล้วแปลง: `((Number) row[0]).longValue()`','ใช้ DTO projection / result mapping แทน `Object[]`','ถ้าข้อความเป็น `X cannot be cast to X` (ชื่อเดียวกัน) แปลว่า class ถูกโหลดจาก 2 ClassLoader (เช่น dev mode hot reload)'],
   code:`Object[] row = (Object[]) em.createNativeQuery(
        "SELECT COUNT(*), SUM(AMOUNT) FROM PAYMENT").getSingleResult();

long count     = ((Number) row[0]).longValue();      // ไม่ cast เป็น Long ตรงๆ
BigDecimal sum = (BigDecimal) row[1];`},
  {g:'Core / Runtime',t:'NumberFormatException',b:'unchecked',bc:'red',s:'java.lang',k:'parseint for input string',
   d:'แปลง string เป็นตัวเลขไม่ได้ เช่น `""`, `" 12"`, `"1,000"`, `"12.5"` ด้วย `Integer.parseInt`',
   fix:['`trim()` และตัด comma ก่อน parse','ตรวจว่าว่างก่อน','จำนวนเงินใช้ `new BigDecimal(str)` ไม่ใช่ double'],
   code:`String raw = " 1,250.50 ";
BigDecimal amount = new BigDecimal(raw.strip().replace(",", ""));`},
  {g:'Core / Runtime',t:'IllegalArgumentException / IllegalStateException',b:'unchecked',bc:'orange',s:'java.lang',k:'no enum constant duplicate key tomap stream has already been operated',
   d:'ส่วนใหญ่โยนโดยตั้งใจเมื่อ argument หรือสถานะไม่ถูก ที่เจอบ่อย: `No enum constant X.Y` จาก `Enum.valueOf`, `Duplicate key` จาก `Collectors.toMap`, `stream has already been operated upon`',
   fix:['enum จากข้อมูลภายนอก: เทียบแบบปลอดภัย หรือ map ค่าเอง','`Collectors.toMap(k, v, (a, b) -> a)` ใส่ merge function เมื่อ key อาจซ้ำ','Stream ใช้ได้ครั้งเดียว ต้องสร้างใหม่'],
   code:`Map<String, Employee> byCode = list.stream()
    .collect(Collectors.toMap(Employee::getCode, e -> e, (a, b) -> a));`},
  {g:'Core / Runtime',t:'IndexOutOfBoundsException / StringIndexOutOfBoundsException',b:'unchecked',bc:'orange',s:'java.lang',k:'index out of range length substring get(0)',
   d:'`list.get(0)` บน list ว่าง หรือ `substring` เกินความยาว string',
   fix:['เช็ค `isEmpty()` / ความยาวก่อน','ใช้ `stream().findFirst()` แทน `get(0)`']},
  {g:'Core / Runtime',t:'ArithmeticException',b:'unchecked',bc:'orange',s:'java.lang',k:'by zero bigdecimal non-terminating decimal expansion divide',
   d:'`/ by zero` จากการหาร int ด้วย 0 · BigDecimal: `Non-terminating decimal expansion` เมื่อหารแล้วได้ทศนิยมไม่รู้จบ',
   fix:['BigDecimal หารต้องระบุ scale และ RoundingMode เสมอ'],
   code:`BigDecimal perPerson = total.divide(new BigDecimal(3), 2, RoundingMode.HALF_UP);`},
  {g:'Core / Runtime',t:'UnsupportedOperationException',b:'unchecked',bc:'orange',s:'java.lang',k:'immutable list.of arrays.aslist tolist add remove',
   d:'แก้ list ที่แก้ไม่ได้: `List.of(...)`, `Arrays.asList(...).add()`, `stream().toList()` (Java 16+), `Collections.unmodifiableList`',
   fix:['ห่อด้วย `new ArrayList<>(list)` ก่อนแก้'],
   code:`List<String> codes = new ArrayList<>(List.of("A", "B"));
codes.add("C");`},
  {g:'Core / Runtime',t:'DateTimeParseException',b:'unchecked',bc:'orange',s:'java.time.format',k:'text could not be parsed buddhist thai year localdate',
   d:'string ไม่ตรงรูปแบบที่ parse · `LocalDate.parse()` รับแค่ ISO `yyyy-MM-dd` · ปี พ.ศ. ต้องใช้ chronology ของไทย',
   fix:['ระบุ `DateTimeFormatter.ofPattern(...)`','ปี พ.ศ.: แปลงด้วย `ThaiBuddhistDate` หรือลบ 543'],
   code:`DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
LocalDate d = LocalDate.parse("12/10/2026", f);

// พ.ศ. → ค.ศ.
DateTimeFormatter th = DateTimeFormatter.ofPattern("dd/MM/yyyy")
    .withChronology(ThaiBuddhistChronology.INSTANCE);
LocalDate fromBe = LocalDate.from(th.parse("12/10/2569"));   // 2026-10-12`},

  // ── JVM Error ──
  {g:'JVM Error',t:'OutOfMemoryError',b:'error',bc:'red',s:'java.lang',k:'heap space gc overhead metaspace oom killed 137 xmx',
   d:'แยกตามข้อความ: `Java heap space` / `GC overhead limit exceeded` = heap ไม่พอหรือโหลดข้อมูลมากเกิน · `Metaspace` = class เยอะหรือ ClassLoader รั่ว · `unable to create native thread` = thread เยอะเกิน',
   fix:['หา query ที่ดึงทั้งตารางมาไว้ใน memory (`getResultList()` ไม่มี paging) ให้แบ่งหน้า / stream','Excel ใหญ่ใช้ `SXSSFWorkbook` แทน `XSSFWorkbook`','ใน container ตั้ง heap เป็น % ของ limit: `-XX:MaxRAMPercentage=75.0`','เก็บ heap dump ไว้วิเคราะห์: `-XX:+HeapDumpOnOutOfMemoryError`','Pod ขึ้น `OOMKilled` (exit 137) = kernel ฆ่าเพราะเกิน memory limit ไม่ใช่ Java OOM: ลด heap หรือเพิ่ม limit'],
   lang:'properties',
   code:`# Dockerfile / Deployment env
JAVA_OPTS_APPEND=-XX:MaxRAMPercentage=75.0 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp`},
  {g:'JVM Error',t:'StackOverflowError',b:'error',bc:'red',s:'java.lang',k:'recursion infinite tostring hashcode bidirectional lombok jackson',
   d:'เรียกซ้ำไม่รู้จบ · ที่เจอบ่อย: entity ความสัมพันธ์สองทางที่ `toString()` / `hashCode()` (Lombok `@Data`) หรือ Jackson วนเรียกกันเอง',
   fix:['ตัดวงด้วย `@ToString.Exclude` / `@EqualsAndHashCode.Exclude`','JSON: `@JsonIgnore` ฝั่งหนึ่ง หรือ `@JsonManagedReference` / `@JsonBackReference`','ส่ง DTO ออก API แทน entity'],
   code:`@Entity
public class Department {
    @OneToMany(mappedBy = "department")
    @ToString.Exclude
    @JsonIgnore
    private List<Employee> employees;
}`},
  {g:'JVM Error',t:'NoClassDefFoundError / ClassNotFoundException',b:'error',bc:'red',s:'java.lang',k:'could not initialize class classpath dependency scope provided',
   d:'`ClassNotFoundException` = โหลด class ด้วยชื่อ (reflection) แล้วหาไม่เจอ · `NoClassDefFoundError` = ตอน compile มี แต่ตอนรันไม่มี หรือ static initializer พังไปแล้ว (`Could not initialize class X`)',
   fix:['เช็ค dependency และ scope (`provided`, `test`) ด้วย `mvn dependency:tree`','`Could not initialize class`: หา `ExceptionInInitializerError` ตัวแรกใน log คือสาเหตุจริง','Quarkus native: class ที่โหลดด้วย reflection ต้อง `@RegisterForReflection`']},
  {g:'JVM Error',t:'NoSuchMethodError / NoSuchFieldError',b:'error',bc:'red',s:'java.lang',k:'binary incompatible version conflict dependency',
   d:'compile กับ library เวอร์ชันหนึ่ง แต่รันกับอีกเวอร์ชัน (dependency conflict) เช่น extension ของ framework ใช้ Quarkus คนละเวอร์ชันกับแอป',
   fix:['หาว่ามีกี่เวอร์ชัน: `mvn dependency:tree -Dverbose -Dincludes=<groupId>`','ล็อกเวอร์ชันใน `dependencyManagement` / ใช้ BOM เดียวกัน','`mvn clean` แล้ว build ใหม่ทั้งหมด']},
  {g:'JVM Error',t:'ExceptionInInitializerError',b:'error',bc:'red',s:'java.lang',k:'static initializer block',
   d:'exception ใน static block / static field initializer ครั้งต่อไปที่ใช้ class เดิมจะกลายเป็น `NoClassDefFoundError: Could not initialize class`',
   fix:['ดู `Caused by` ของ error ครั้งแรก','ย้ายงานที่อาจพัง (อ่านไฟล์, ต่อ network) ออกจาก static initializer']},
  {g:'JVM Error',t:'UnsupportedClassVersionError',b:'error',bc:'red',s:'java.lang',k:'class file version 65 61 55 52 jdk compiled newer',
   d:'class ถูก compile ด้วย JDK ใหม่กว่าที่ใช้รัน · class file version: 52 = Java 8, 55 = 11, 61 = 17, 65 = 21',
   fix:['ตั้ง `maven.compiler.release` ให้ตรงกับ JDK ที่รัน','base image ใน Dockerfile ต้องเป็น JDK เวอร์ชันเดียวกับที่ build'],
   lang:'xml',
   code:`<properties>
  <maven.compiler.release>21</maven.compiler.release>
</properties>`},

  // ── IO / Network ──
  {g:'IO / Network',t:'ConnectException / UnknownHostException',b:'checked',bc:'orange',s:'java.net',k:'connection refused dns service name namespace kubernetes',
   d:'`Connection refused` = ไปถึงเครื่องแต่ไม่มีอะไรฟัง port นั้น (port ผิด, pod ยังไม่ ready) · `UnknownHostException` = DNS หาชื่อไม่เจอ (ชื่อ service ผิด หรือคนละ namespace)',
   fix:['ใน Kubernetes เรียกข้าม namespace ใช้ `<service>.<namespace>.svc.cluster.local`','เช็ค port ของ Service (`port`) ไม่ใช่ `targetPort`','ทดสอบจากใน pod: `kubectl exec -it <pod> -- curl -v http://svc:80`']},
  {g:'IO / Network',t:'SocketTimeoutException',b:'checked',bc:'orange',s:'java.net',k:'read timed out connect timed out rest client',
   d:'`Read timed out` = ต่อได้แต่ฝั่งโน้นตอบช้าเกิน · `connect timed out` = ต่อไม่ติดภายในเวลา (firewall drop)',
   fix:['ขยาย timeout ของ REST client เฉพาะ endpoint ที่ช้า','ถ้าวิ่งผ่าน Kong ให้ดู `konghq.com/read-timeout` ด้วย'],
   lang:'properties',
   code:`quarkus.rest-client.report-api.connect-timeout=5000
quarkus.rest-client.report-api.read-timeout=120000`},
  {g:'IO / Network',t:'SSLHandshakeException',b:'checked',bc:'orange',s:'javax.net.ssl',k:'pkix path building failed certificate trust store',
   d:'`PKIX path building failed` = JVM ไม่เชื่อ certificate ของปลายทาง (self-signed หรือ CA ภายใน)',
   fix:['import CA ของหน่วยงานเข้า truststore แล้วชี้ให้ client ใช้','อย่าปิดการตรวจ certificate บน production'],
   lang:'bash',
   code:`keytool -importcert -alias corp-ca -file corp-ca.crt \\
  -keystore truststore.p12 -storetype PKCS12 -storepass changeit`},
  {g:'IO / Network',t:'IOException / FileNotFoundException / NoSuchFileException',b:'checked',bc:'orange',s:'java.io / java.nio.file',k:'file path resource jar classpath',
   d:'path ไม่มีจริง หรือ path แบบ relative อ้างอิงจาก working directory ที่ต่างกันระหว่างเครื่อง dev กับ container · ไฟล์ใน resources อยู่ใน jar จึงเปิดด้วย `File` ไม่ได้',
   fix:['อ่าน resource ด้วย `getResourceAsStream`','path ใน container ให้กำหนดผ่าน config / env'],
   code:`try (InputStream in = Thread.currentThread().getContextClassLoader()
        .getResourceAsStream("templates/report.xlsx")) {
    // ...
}`},
  {g:'IO / Network',t:'InterruptedException',b:'checked',bc:'orange',s:'java.lang',k:'thread sleep interrupt flag',
   d:'thread ถูกสั่งหยุดขณะรอ (`sleep`, `wait`, `join`, `take`) · catch แล้วกลืนทิ้งทำให้ระบบ shutdown ไม่ได้',
   fix:['คืน interrupt flag เสมอ'],
   code:`try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    return;
}`},

  // ── Collections & Concurrency ──
  {g:'Collections & Concurrency',t:'ConcurrentModificationException',b:'unchecked',bc:'red',s:'java.util',k:'remove in loop foreach iterator hashmap thread',
   d:'แก้ collection ระหว่างวน for-each หรือหลาย thread แก้ HashMap / ArrayList พร้อมกัน',
   fix:['ลบระหว่างวนใช้ `removeIf` หรือ `Iterator.remove()`','ข้อมูลที่หลาย thread ใช้ร่วม: `ConcurrentHashMap` / `CopyOnWriteArrayList`'],
   code:`orders.removeIf(o -> o.getStatus() == Status.CANCELLED);`},
  {g:'Collections & Concurrency',t:'ExecutionException / CompletionException',b:'checked',bc:'orange',s:'java.util.concurrent',k:'future get completablefuture cause',
   d:'ห่อ exception จริงที่เกิดใน task อื่น · ดูที่ `getCause()` เสมอ',
   fix:['log `e.getCause()` และจัดการตามชนิดของ cause']},
  {g:'Collections & Concurrency',t:'RejectedExecutionException',b:'unchecked',bc:'orange',s:'java.util.concurrent',k:'thread pool queue full shutdown executor',
   d:'thread pool เต็ม (queue เต็ม) หรือ executor ถูก shutdown ไปแล้ว',
   fix:['ขยาย queue / pool หรือทำ back-pressure','อย่าส่งงานหลัง shutdown']},

  // ── JPA / Hibernate ──
  {g:'JPA / Hibernate',t:'LazyInitializationException',b:'unchecked',bc:'red',s:'org.hibernate',k:'could not initialize proxy no session lazy fetch',
   d:'`could not initialize proxy - no Session` = เข้าถึง relation แบบ LAZY หลัง transaction / session ปิดไปแล้ว เช่น ตอน Jackson แปลง entity เป็น JSON ใน resource',
   fix:['ดึงมาพร้อมกันใน query: `JOIN FETCH`','map เป็น DTO ภายใน method ที่มี `@Transactional`','ใช้ `@EntityGraph` / entity graph ตามหน้าจอ','ไม่ควรเปลี่ยนเป็น EAGER ทั้งหมด (ช้า, N+1)'],
   code:`@Transactional
public OrderDto find(Long id) {
    Order o = em.createQuery(
        "SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id", Order.class)
        .setParameter("id", id)
        .getSingleResult();
    return OrderDto.from(o);       // แปลงก่อน transaction จบ
}`},
  {g:'JPA / Hibernate',t:'NoResultException / NonUniqueResultException',b:'unchecked',bc:'orange',s:'jakarta.persistence',k:'getsingleresult no entity found more than one',
   d:'`getSingleResult()` ไม่เจอแถว หรือเจอมากกว่า 1 แถว',
   fix:['ค่าที่อาจไม่มี: `getResultStream().findFirst()`','Panache: `find(...).firstResultOptional()`','มากกว่า 1 แถว: เพิ่มเงื่อนไข หรือ `setMaxResults(1)` พร้อม ORDER BY'],
   code:`Optional<Employee> e = em.createQuery(
        "FROM Employee e WHERE e.code = :code", Employee.class)
    .setParameter("code", code)
    .getResultStream()
    .findFirst();`},
  {g:'JPA / Hibernate',t:'PersistenceException + ConstraintViolationException (Hibernate)',b:'unchecked',bc:'red',s:'org.hibernate.exception',k:'sqlcode 803 407 530 integrity db2 sql error',
   d:'ห่อ error จาก database · สาเหตุจริงอยู่ใน `Caused by: ... DB2 SQL Error: SQLCODE=-803, SQLSTATE=23505` ให้เอา SQLCODE ไปค้นในหน้า DB2 Error Codes',
   fix:['ไล่ `Caused by` ไปจนถึงตัวสุดท้าย (ใช้ Stack Trace Analyzer ช่วย)','อย่าสับสนกับ `jakarta.validation.ConstraintViolationException` ซึ่งมาจาก Bean Validation']},
  {g:'JPA / Hibernate',t:'OptimisticLockException / StaleObjectStateException',b:'unchecked',bc:'orange',s:'jakarta.persistence / org.hibernate',k:'version concurrent update row was updated or deleted',
   d:'entity มี `@Version` และมีคนอื่นแก้แถวเดียวกันก่อนเรา ค่า version จึงไม่ตรง',
   fix:['โหลดข้อมูลใหม่แล้วให้ผู้ใช้ทำซ้ำ หรือ retry อัตโนมัติถ้าเป็นงาน background','แจ้งผู้ใช้ว่า "ข้อมูลถูกแก้โดยผู้อื่น"']},
  {g:'JPA / Hibernate',t:'TransactionRequiredException',b:'unchecked',bc:'orange',s:'jakarta.persistence',k:'no transaction is in progress executing an update delete query persist',
   d:'`persist` / `merge` / UPDATE query โดยไม่มี transaction',
   fix:['ใส่ `@Transactional` ที่ method public ของ CDI bean','method ต้องถูกเรียกผ่าน bean ที่ inject มา ไม่ใช่ `new Service()`']},
  {g:'JPA / Hibernate',t:'EntityNotFoundException',b:'unchecked',bc:'orange',s:'jakarta.persistence',k:'getreference unable to find foreign key missing',
   d:'proxy จาก `getReference()` หรือ relation ชี้ไปแถวที่ไม่มีแล้ว (ข้อมูล FK เสีย)',
   fix:['ใช้ `find()` แล้วเช็ค null','ตรวจข้อมูลที่ FK ชี้ไปหาย']},
  {g:'JPA / Hibernate',t:'UnknownEntityException / SemanticException (HQL)',b:'unchecked',bc:'orange',s:'org.hibernate.query',k:'could not resolve attribute path hql jpql column',
   d:'HQL / JPQL อ้างชื่อ entity หรือ field ผิด (เขียนชื่อคอลัมน์ / ชื่อตารางแทนชื่อ field / class)',
   fix:['ใช้ชื่อ class และชื่อ field ของ entity ใน JPQL','SQL ที่ใช้ชื่อตารางจริงต้องเป็น `createNativeQuery`']},

  // ── Quarkus / CDI ──
  {g:'Quarkus / CDI',t:'UnsatisfiedResolutionException',b:'deploy',bc:'purple',s:'jakarta.enterprise.inject',k:'unsatisfied dependency for type qualifiers default bean not found jandex',
   d:'`Unsatisfied dependency for type X` = หา bean ให้ inject ไม่เจอ: class ไม่มี scope annotation, อยู่ใน jar ที่ไม่มี index หรือ Quarkus ลบทิ้งเพราะคิดว่าไม่ได้ใช้',
   fix:['ใส่ scope เช่น `@ApplicationScoped`','bean ใน library jar: เพิ่ม Jandex index หรือ `quarkus.index-dependency.<name>.group-id`','bean ที่ lookup แบบ dynamic: `@Unremovable`'],
   lang:'properties',
   code:`quarkus.index-dependency.shop-shared.group-id=com.example.shop
quarkus.index-dependency.shop-shared.artifact-id=shop-shared`},
  {g:'Quarkus / CDI',t:'AmbiguousResolutionException',b:'deploy',bc:'purple',s:'jakarta.enterprise.inject',k:'ambiguous dependencies multiple beans qualifier named',
   d:'มี bean ที่ตรง type มากกว่า 1 ตัว',
   fix:['ใส่ qualifier (`@Named`, qualifier ที่สร้างเอง)','เลือกตัวหลักด้วย `@Default` หรือ `@Alternative @Priority`']},
  {g:'Quarkus / CDI',t:'ContextNotActiveException',b:'unchecked',bc:'purple',s:'jakarta.enterprise.context',k:'requestscoped context was not active scheduler consumer startup',
   d:'ใช้ bean `@RequestScoped` (เช่น `SecurityIdentity`, ข้อมูล user ของ request) ใน thread ที่ไม่มี request: `@Scheduled`, consumer ของ RabbitMQ/Kafka, `@Startup`, thread ที่สร้างเอง',
   fix:['ใส่ `@ActivateRequestContext` ที่ method ที่รันนอก HTTP request','ส่งค่าที่ต้องใช้เป็น parameter แทนการ inject bean แบบ request'],
   code:`@ApplicationScoped
public class MailConsumer {
    @Incoming("mail")
    @ActivateRequestContext
    public void consume(MailMessage msg) {
        // ใช้ bean @RequestScoped ได้แล้ว
    }
}`},
  {g:'Quarkus / CDI',t:'BlockingOperationNotAllowedException',b:'unchecked',bc:'purple',s:'io.quarkus.runtime',k:'event loop io thread blocking vert.x thread blocked uni reactive',
   d:'ทำงานแบบ blocking (JDBC, Hibernate ORM, REST client แบบ blocking) บน IO thread ของ Vert.x เช่น endpoint ที่คืน `Uni` หรือ handler ของ reactive route',
   fix:['endpoint ที่ใช้ JDBC ให้คืนค่าปกติ (ไม่ใช่ `Uni`) หรือใส่ `@Blocking`','Java 21: `@RunOnVirtualThread`','log `Thread vert.x-eventloop-thread-0 has been blocked` มาจากสาเหตุเดียวกัน'],
   code:`@GET
@Blocking
public Uni<List<Employee>> list() {
    return Uni.createFrom().item(service.findAll());
}`},
  {g:'Quarkus / CDI',t:'DeploymentException / ConfigurationException',b:'deploy',bc:'purple',s:'io.quarkus / io.smallrye.config',k:'srcfg00014 config property is required could not be found profile',
   d:'`SRCFG00014: The config property X is required but it could not be found` = ไม่มีค่า config ใน profile ที่รัน',
   fix:['เช็ค profile ที่รัน (`-Dquarkus.profile=local`) และ prefix `%local.` ใน application.properties','env var ใช้ชื่อแบบตัวใหญ่และ `_`: `quarkus.datasource.jdbc.url` → `QUARKUS_DATASOURCE_JDBC_URL`']},

  // ── REST / JSON ──
  {g:'REST / JSON',t:'WebApplicationException / ClientWebApplicationException',b:'unchecked',bc:'blue',s:'jakarta.ws.rs / io.quarkus.rest.client',k:'received not found status code 404 401 500 rest client',
   d:'REST client ได้ response ที่ไม่ใช่ 2xx จากปลายทาง (`Received: \'Not Found, status code 404\'`)',
   fix:['เช็ค URL ใน `quarkus.rest-client.<name>.url` ของ profile ที่รัน','401: token หมดอายุ / ไม่ได้ส่ง header','แปลงเป็น exception ของระบบด้วย `ResponseExceptionMapper`']},
  {g:'REST / JSON',t:'MismatchedInputException / UnrecognizedPropertyException',b:'unchecked',bc:'blue',s:'com.fasterxml.jackson',k:'cannot deserialize value of type from object array unrecognized field',
   d:'JSON กับ class ไม่ตรงกัน: ส่ง object แต่ field เป็น List หรือกลับกัน · มี field ที่ class ไม่รู้จัก',
   fix:['เทียบ shape ของ JSON กับ DTO (ลองใช้หน้า JSON → Type สร้าง DTO จาก JSON จริง)','ไม่สน field เกิน: `@JsonIgnoreProperties(ignoreUnknown = true)` หรือ `quarkus.jackson.fail-on-unknown-properties=false`']},
  {g:'REST / JSON',t:'InvalidDefinitionException',b:'unchecked',bc:'blue',s:'com.fasterxml.jackson',k:'no serializer found no creators default constructor',
   d:'Jackson สร้าง / อ่าน object ไม่ได้: ไม่มี default constructor, ไม่มี getter หรือ class ที่ serialize ไม่ได้ (เช่น Hibernate proxy)',
   fix:['เพิ่ม no-args constructor หรือใช้ record','ส่ง DTO ไม่ใช่ entity ที่มี lazy proxy']},
  {g:'REST / JSON',t:'jakarta.validation.ConstraintViolationException',b:'unchecked',bc:'blue',s:'jakarta.validation',k:'bean validation valid notnull size 400',
   d:'Bean Validation ไม่ผ่าน (`@NotNull`, `@Size`, `@Pattern`) Quarkus แปลงเป็น HTTP 400 ให้เมื่อเกิดที่ resource',
   fix:['อ่าน violation แต่ละตัวว่า field ไหนผิด','คนละตัวกับ ConstraintViolationException ของ Hibernate (อันนั้นมาจาก DB)']},

  // ── JDBC / Pool ──
  {g:'JDBC / Pool',t:'SQLException (DB2 SQL Error)',b:'checked',bc:'cyan',s:'com.ibm.db2.jcc.am',k:'sqlcode sqlstate sqlerrmc db2 sql error',
   d:'รูปแบบ `DB2 SQL Error: SQLCODE=-803, SQLSTATE=23505, SQLERRMC=2;MYSCHEMA.ORDERS` · `SQLERRMC` คือ token เพิ่มเติม (ชื่อตาราง, เลข index) คั่นด้วย `;`',
   fix:['เอา SQLCODE ไปค้นในหน้า DB2 Error Codes']},
  {g:'JDBC / Pool',t:'SQLTransientConnectionException (Acquisition timeout)',b:'checked',bc:'cyan',s:'java.sql / io.agroal',k:'acquisition timeout while waiting for new connection pool exhausted leak',
   d:'connection ใน pool หมด: connection รั่ว (เปิดแล้วไม่ปิด), transaction ยาว หรือ pool เล็กเกินไป',
   fix:['ปิด connection ด้วย try-with-resources','เปิด leak detection เพื่อดูว่าใครยืมไปไม่คืน','ขยาย pool เมื่อแน่ใจว่าไม่ได้รั่ว'],
   lang:'properties',
   code:`quarkus.datasource.jdbc.max-size=30
quarkus.datasource.jdbc.acquisition-timeout=10S
quarkus.datasource.jdbc.leak-detection-interval=5M`},
  {g:'JDBC / Pool',t:'BatchUpdateException',b:'checked',bc:'cyan',s:'java.sql',k:'batch 4229 getnextexception',
   d:'บางคำสั่งใน batch พัง สาเหตุจริงต้องดึงจาก `getNextException()` (DB2 ERRORCODE=-4229)',
   fix:['ดูตัวอย่างโค้ดในหน้า DB2 Error Codes รหัส -4229']},
  ],
};
