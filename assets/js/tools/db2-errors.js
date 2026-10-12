// ── DB2 ERROR CODES ── SQLCODE / SQLSTATE lookup (DB2 LUW + JCC driver), rendered by refdocs.js
// badge = SQLCODE, s = SQLSTATE. Searching "803", "-803" or "23505" all match.
REF_DOCS.db2err={
  placeholder:'พิมพ์ SQLCODE หรือ SQLSTATE... เช่น -803, 911, 23505, 4499',
  emptyHint:'ลองพิมพ์แค่ตัวเลข เช่น 803 หรือคำในข้อความ error เช่น duplicate, lock, schema',
  lang:'sql',
  items:[
  // ── Constraint / ข้อมูลซ้ำ ──
  {g:'Constraint / ข้อมูล',b:'-803',bc:'red',t:'Duplicate key (ค่าซ้ำใน unique index / primary key)',s:'SQLSTATE 23505',k:'unique duplicate primary iid',
   d:'INSERT หรือ UPDATE ทำให้ค่าซ้ำกับแถวที่มีอยู่ใน primary key หรือ unique index · ข้อความ error บอก `INDEX ID` และ `TABLEID` มาด้วย',
   fix:['หา index จากเลขใน error: query ด้านล่าง (`IID` = เลข index id)','ถ้าใช้ sequence/identity: มักเกิดหลัง import ข้อมูล ให้ RESTART sequence ให้มากกว่า MAX(ID)','ฝั่ง Java: เช็คว่ามีอยู่แล้วก่อน insert หรือใช้ MERGE (ดูหน้า SQL & System Catalog)'],
   code:`SELECT INDNAME, COLNAMES, UNIQUERULE
FROM SYSCAT.INDEXES
WHERE TABSCHEMA = 'MYSCHEMA'
  AND TABNAME = 'ORDERS'
  AND IID = 2;            -- เลขจากข้อความ error

-- ถ้า sequence ตามหลังข้อมูล
SELECT MAX(ID) FROM MYSCHEMA.ORDERS;
ALTER SEQUENCE MYSCHEMA.SEQ_ORDERS RESTART WITH 10001;`},
  {g:'Constraint / ข้อมูล',b:'-407',bc:'red',t:'ใส่ NULL ในคอลัมน์ NOT NULL',s:'SQLSTATE 23502',k:'not null tbspaceid tableid colno',
   d:'ข้อความ error ไม่บอกชื่อคอลัมน์ตรงๆ แต่ให้ `TBSPACEID`, `TABLEID`, `COLNO` มา ใช้หาชื่อตารางและคอลัมน์ได้',
   fix:['หาชื่อตารางและคอลัมน์จากตัวเลขใน error ด้วย query ด้านล่าง','ฝั่ง Java: field ที่ไม่ได้ set ค่า หรือ DTO ไม่ได้ map ฟิลด์นั้น','ใส่ DEFAULT ให้คอลัมน์ หรือ validate (@NotNull) ก่อนบันทึก'],
   code:`-- TBSPACEID=2, TABLEID=15, COLNO=4 จากข้อความ error
SELECT T.TABSCHEMA, T.TABNAME, C.COLNAME
FROM SYSCAT.TABLES T
JOIN SYSCAT.COLUMNS C
  ON C.TABSCHEMA = T.TABSCHEMA AND C.TABNAME = T.TABNAME
WHERE T.TBSPACEID = 2
  AND T.TABLEID = 15
  AND C.COLNO = 4;`},
  {g:'Constraint / ข้อมูล',b:'-530',bc:'red',t:'Foreign key: ไม่มีแถวแม่ที่อ้างถึง',s:'SQLSTATE 23503',k:'fk parent reference',
   d:'INSERT/UPDATE ค่าในคอลัมน์ FK ที่ไม่มีอยู่ในตารางแม่',
   fix:['insert ตารางแม่ก่อน หรือเช็คค่าที่ส่งมา (มักเป็นรหัสที่พิมพ์ผิด หรือมีช่องว่างท้ายจาก CHAR)','ดูชื่อ constraint ใน error แล้วค้นใน `SYSCAT.REFERENCES` ว่าชี้ไปตารางไหน']},
  {g:'Constraint / ข้อมูล',b:'-532',bc:'red',t:'ลบแถวแม่ไม่ได้ เพราะยังมีแถวลูกอ้างอยู่',s:'SQLSTATE 23504',k:'fk delete restrict child',
   d:'DELETE แถวที่มีตารางลูกอ้างถึงด้วย FK แบบ RESTRICT / NO ACTION',
   fix:['ลบแถวลูกก่อน หรือเปลี่ยน FK เป็น `ON DELETE CASCADE` ถ้า business ยอม','หาตารางลูกจาก `SYSCAT.REFERENCES WHERE REFTABNAME = ...`','หลายระบบใช้ soft delete (STATUS = \'D\') แทนการลบจริง']},
  {g:'Constraint / ข้อมูล',b:'-545',bc:'red',t:'ผิด check constraint',s:'SQLSTATE 23513',k:'check constraint',
   fix:['ดู `SYSCAT.CHECKS` ว่า constraint มีเงื่อนไขอะไร','validate ฝั่งแอปให้ตรงกับเงื่อนไขเดียวกัน'],
   code:`SELECT CONSTNAME, TEXT
FROM SYSCAT.CHECKS
WHERE TABSCHEMA = 'MYSCHEMA' AND TABNAME = 'ORDERS';`},
  {g:'Constraint / ข้อมูล',b:'-302',bc:'orange',t:'ค่าใหญ่หรือยาวเกินขนาดตัวแปร / คอลัมน์',s:'SQLSTATE 22001 / 22003',k:'too long length bytes utf-8 thai varchar',
   d:'string ยาวเกิน หรือตัวเลขเกินขนาดที่กำหนด · ภาษาไทยใน UTF-8 ใช้ 3 byte ต่อตัว และ DB2 นับ VARCHAR เป็น byte จึงเกินง่ายกว่าที่คิด',
   fix:['เช็คความยาวเป็น byte: `LENGTH(col)` vs ตัวอักษร: `CHARACTER_LENGTH(col, CODEUNITS32)`','ขยายคอลัมน์ หรือ validate ความยาวฝั่งแอปเป็น byte (`str.getBytes(UTF_8).length`)'],
   code:`ALTER TABLE MYSCHEMA.CUSTOMER ALTER COLUMN NAME_TH SET DATA TYPE VARCHAR(300);
CALL SYSPROC.ADMIN_CMD('REORG TABLE MYSCHEMA.CUSTOMER');`},
  {g:'Constraint / ข้อมูล',b:'-404',bc:'orange',t:'String ยาวเกินคอลัมน์ใน INSERT / UPDATE',s:'SQLSTATE 22001',k:'too long varchar thai bytes',
   d:'เหมือน -302 แต่เกิดกับค่าที่เขียนใน SQL ตรงๆ ข้อความ error บอกชื่อคอลัมน์ให้',
   fix:['ดูวิธีแก้ที่ -302 (ระวังภาษาไทย 3 byte ต่อตัว)']},
  {g:'Constraint / ข้อมูล',b:'-413',bc:'orange',t:'ตัวเลข overflow ตอนแปลงชนิด',s:'SQLSTATE 22003',k:'decimal overflow numeric',
   d:'เช่นใส่ 123456.78 ลง `DECIMAL(7,2)` (เก็บได้สูงสุด 99999.99) หรือ SUM เกินขนาด INTEGER',
   fix:['ขยาย precision ของคอลัมน์','รวมยอดใหญ่ให้ CAST เป็น `BIGINT` หรือ `DECIMAL(31,2)` ก่อน SUM']},
  {g:'Constraint / ข้อมูล',b:'-180',bc:'orange',t:'รูปแบบวันที่ / เวลาผิด syntax',s:'SQLSTATE 22007',k:'date timestamp format string',
   d:'string ที่ส่งมาแปลงเป็น DATE/TIMESTAMP ไม่ได้ เช่น `\'12/10/2569\'` หรือ `\'2026-1-5\'`',
   fix:['ใช้รูปแบบ ISO `\'YYYY-MM-DD\'` หรือ `TO_DATE(str, \'DD/MM/YYYY\')`','ฝั่ง Java ส่ง `LocalDate` / `java.sql.Date` เป็น parameter แทน string','ข้อมูลจากหน้าจอเป็น พ.ศ. ต้องลบ 543 ก่อน']},
  {g:'Constraint / ข้อมูล',b:'-181',bc:'orange',t:'ค่าวันที่ / เวลาเกินช่วงที่ถูกต้อง',s:'SQLSTATE 22007',k:'date out of range february',
   d:'syntax ถูกแต่ค่าไม่มีจริง เช่น `2026-02-30`, เดือน 13 หรือชั่วโมง 25',
   fix:['validate วันที่ก่อนส่ง (เดือนกุมภาพันธ์, ปีอธิกสุรทิน)']},
  {g:'Constraint / ข้อมูล',b:'-420',bc:'orange',t:'แปลง string เป็นตัวเลขไม่ได้',s:'SQLSTATE 22018',k:'cast invalid character number',
   d:'เช่น `CAST(\'12a\' AS INTEGER)` หรือเทียบคอลัมน์ VARCHAR ที่มีตัวอักษรกับตัวเลข',
   fix:['ล้างข้อมูลที่ไม่ใช่ตัวเลขก่อน CAST','เทียบเป็น string แทน: `WHERE CODE = \'001\'`']},
  {g:'Constraint / ข้อมูล',b:'-305',bc:'orange',t:'ได้ค่า NULL แต่ตัวแปรรับ NULL ไม่ได้',s:'SQLSTATE 22002',k:'null indicator primitive int',
   d:'ฝั่ง Java มักเกิดเมื่อ map คอลัมน์ที่เป็น NULL เข้า primitive (`int`, `long`, `boolean`)',
   fix:['ใช้ wrapper type (`Integer`, `Long`, `Boolean`) ใน entity / DTO','หรือ `COALESCE(col, 0)` ใน SQL']},
  {g:'Constraint / ข้อมูล',b:'-811',bc:'orange',t:'Subquery / SELECT INTO ได้มากกว่า 1 แถว',s:'SQLSTATE 21000',k:'more than one row scalar subquery nonunique',
   d:'ที่ที่ต้องการค่าเดียว (scalar subquery, SELECT INTO) แต่ได้หลายแถว · ฝั่ง JPA จะเห็นเป็น `NonUniqueResultException`',
   fix:['เพิ่มเงื่อนไขให้ได้แถวเดียว หรือใช้ `FETCH FIRST 1 ROW ONLY` / `MAX()`']},
  {g:'Constraint / ข้อมูล',b:'+100',bc:'green',t:'ไม่พบแถว (row not found)',s:'SQLSTATE 02000',k:'no data not found empty',
   d:'ไม่ใช่ error: SELECT INTO / FETCH ไม่เจอข้อมูล หรือ UPDATE / DELETE ไม่โดนแถวไหน',
   fix:['ฝั่ง JPA `getSingleResult()` จะโยน `NoResultException` ให้ใช้ `getResultStream().findFirst()` แทน']},

  // ── Object / Syntax ──
  {g:'Object / Syntax',b:'-204',bc:'yellow',t:'ไม่พบ object (ตาราง / view / schema)',s:'SQLSTATE 42704',k:'undefined name schema table not found',
   d:'ชื่อตารางไม่มีจริง หรือมีแต่อยู่คนละ schema กับ CURRENT SCHEMA ของ connection',
   fix:['ใส่ schema นำหน้า: `MYSCHEMA.EMPLOYEE`','ตั้ง schema ใน JDBC URL: `jdbc:db2://host:50000/DB:currentSchema=MYSCHEMA;`','ชื่อใน double quote เป็น case-sensitive: `"Employee"` ≠ `EMPLOYEE`','เช็คว่ามีจริง: `SELECT * FROM SYSCAT.TABLES WHERE TABNAME = \'EMPLOYEE\'`']},
  {g:'Object / Syntax',b:'-206',bc:'yellow',t:'ไม่พบคอลัมน์ในบริบทนี้',s:'SQLSTATE 42703',k:'column not valid alias',
   d:'ชื่อคอลัมน์ผิด หรือใช้ alias จาก SELECT ใน WHERE / GROUP BY (ทำไม่ได้)',
   fix:['เช็คชื่อจาก `SYSCAT.COLUMNS`','ใช้ alias ใน WHERE ไม่ได้ ให้ห่อเป็น subquery หรือเขียน expression ซ้ำ','HQL/JPQL ใช้ชื่อ field ของ entity ไม่ใช่ชื่อคอลัมน์']},
  {g:'Object / Syntax',b:'-104',bc:'yellow',t:'Syntax ผิด: เจอ token ที่ไม่คาดไว้',s:'SQLSTATE 42601',k:'illegal symbol token syntax error limit',
   d:'ข้อความบอก token ที่ผิดและ token ที่คาดว่าจะเจอ มักเกิดจาก comma เกิน, quote ไม่ครบ หรือใช้ syntax ของ MySQL',
   fix:['DB2 ใช้ `\'` สำหรับ string ส่วน `"` คือชื่อ object','DB2 เวอร์ชันเก่าไม่มี `LIMIT` ให้ใช้ `FETCH FIRST n ROWS ONLY`','SQL ที่ประกอบใน Java: print ออกมาดูทั้งก้อน (ใช้หน้า SQL Parser ช่วย)']},
  {g:'Object / Syntax',b:'-199',bc:'yellow',t:'ใช้ keyword ผิดที่',s:'SQLSTATE 42601',k:'keyword illegal',
   fix:['ดู token ใน error แล้วเช็คลำดับ clause: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → FETCH']},
  {g:'Object / Syntax',b:'-117',bc:'yellow',t:'จำนวนค่าใน INSERT ไม่ตรงกับคอลัมน์',s:'SQLSTATE 42802',k:'insert values count',
   fix:['ระบุรายชื่อคอลัมน์ใน INSERT เสมอ อย่าพึ่งลำดับคอลัมน์ของตาราง']},
  {g:'Object / Syntax',b:'-122',bc:'yellow',t:'คอลัมน์ใน SELECT ไม่อยู่ใน GROUP BY',s:'SQLSTATE 42803',k:'group by aggregate',
   d:'DB2 บังคับว่าคอลัมน์ที่ไม่ใช่ aggregate ต้องอยู่ใน GROUP BY (MariaDB บางโหมดยอม แต่ DB2 ไม่ยอม)',
   fix:['เพิ่มคอลัมน์ลง GROUP BY หรือห่อด้วย `MAX()` / `MIN()`']},
  {g:'Object / Syntax',b:'-401',bc:'yellow',t:'เทียบค่าคนละชนิดกัน',s:'SQLSTATE 42818',k:'incompatible operands compare type',
   d:'เช่นเทียบ VARCHAR กับ INTEGER หรือ DATE กับ TIMESTAMP โดยตรง',
   fix:['CAST ให้เป็นชนิดเดียวกัน','ฝั่ง Java ส่ง parameter ให้ตรงชนิดคอลัมน์ (`setString` vs `setInt`)']},
  {g:'Object / Syntax',b:'-408',bc:'yellow',t:'ค่าที่ใส่ไม่เข้ากับชนิดคอลัมน์',s:'SQLSTATE 42821',k:'incompatible assign type',
   fix:['เช็คชนิดของ parameter ที่ bind ว่าตรงกับคอลัมน์']},
  {g:'Object / Syntax',b:'-440',bc:'yellow',t:'ไม่พบ function / procedure ที่ parameter ตรงกัน',s:'SQLSTATE 42884',k:'routine signature procedure call',
   d:'ชื่อถูกแต่จำนวนหรือชนิดของ parameter ไม่ตรงกับที่ประกาศไว้',
   fix:['ดู parameter ที่ถูกต้องใน `SYSCAT.ROUTINEPARMS`','CAST argument ให้ตรงชนิด เช่น `CAST(? AS VARCHAR(20))`']},
  {g:'Object / Syntax',b:'-601',bc:'yellow',t:'Object ชื่อนี้มีอยู่แล้ว',s:'SQLSTATE 42710',k:'already exists create',
   fix:['script migration ให้ DROP ก่อน หรือเช็คจาก SYSCAT ก่อน CREATE']},
  {g:'Object / Syntax',b:'-603',bc:'yellow',t:'สร้าง unique index ไม่ได้เพราะข้อมูลซ้ำอยู่แล้ว',s:'SQLSTATE 23515',k:'unique index create duplicate',
   code:`SELECT COL1, COL2, COUNT(*)
FROM MYSCHEMA.T
GROUP BY COL1, COL2
HAVING COUNT(*) > 1;`},
  {g:'Object / Syntax',b:'-668',bc:'yellow',t:'ตารางอยู่ในสถานะ reorg pending',s:'SQLSTATE 57016',k:'reorg pending alter table reason 7',
   d:'reason code 7 = หลัง ALTER TABLE บางแบบ (drop column, เปลี่ยนชนิด) ตารางต้อง REORG ก่อนจึงใช้งานได้',
   fix:['รัน REORG แล้ว RUNSTATS'],
   code:`CALL SYSPROC.ADMIN_CMD('REORG TABLE MYSCHEMA.EMPLOYEE');
CALL SYSPROC.ADMIN_CMD('RUNSTATS ON TABLE MYSCHEMA.EMPLOYEE WITH DISTRIBUTION AND INDEXES ALL');`},
  {g:'Object / Syntax',b:'-727',bc:'yellow',t:'Error ระหว่างระบบทำงานเบื้องหลัง (เช่น revalidate)',s:'SQLSTATE 56098',k:'implicit rebind revalidate invalid view',
   d:'ดู SQLCODE ที่ซ้อนอยู่ในข้อความ มักเกิดเมื่อ view / procedure กลายเป็น invalid หลังแก้ตารางที่มันอ้างถึง',
   code:`-- object ที่ invalid
SELECT OBJECTSCHEMA, OBJECTNAME, OBJECTTYPE
FROM SYSCAT.INVALIDOBJECTS;

CALL SYSPROC.ADMIN_REVALIDATE_DB_OBJECTS(NULL, 'MYSCHEMA', NULL);`},

  // ── Lock & Concurrency ──
  {g:'Lock & Concurrency',b:'-911',bc:'red',t:'Deadlock หรือ lock timeout (rollback ทั้ง transaction)',s:'SQLSTATE 40001',k:'deadlock timeout reason 2 68 lock rollback',
   d:'reason code 2 = deadlock, 68 = lock timeout · DB2 rollback transaction ให้แล้ว',
   fix:['ทำ transaction ให้สั้นลง อย่าเรียก API ภายนอกระหว่างถือ lock','เข้าถึงตารางในลำดับเดียวกันทุกที่ (กัน deadlock)','เพิ่ม index ให้ WHERE ของ UPDATE / DELETE เพื่อไม่ต้อง scan ทั้งตาราง (lock น้อยลง)','รายงานอ่านอย่างเดียวใช้ `WITH UR`','ดูว่าใครถือ lock: `SELECT * FROM SYSIBMADM.MON_LOCKWAITS`','retry ได้ เพราะ transaction ถูก rollback สะอาดแล้ว']},
  {g:'Lock & Concurrency',b:'-913',bc:'red',t:'Deadlock หรือ timeout (rollback เฉพาะ statement)',s:'SQLSTATE 57033',k:'deadlock timeout statement',
   d:'คล้าย -911 แต่ DB2 ไม่ได้ rollback ทั้ง transaction แอปต้องตัดสินใจเองว่าจะ rollback หรือ retry',
   fix:['ดูวิธีแก้ที่ -911','ใน `@Transactional` ของ Quarkus: exception ทำให้ rollback อยู่แล้ว']},
  {g:'Lock & Concurrency',b:'-952',bc:'orange',t:'Query ถูกยกเลิก (interrupt / timeout)',s:'SQLSTATE 57014',k:'cancel timeout query interrupt',
   d:'มักมาจาก JDBC `setQueryTimeout`, transaction timeout ของ Quarkus หรือผู้ใช้กดยกเลิก',
   fix:['ปรับ query ให้เร็วขึ้น (ดู index, RUNSTATS)','ขยาย timeout: `quarkus.transaction-manager.default-transaction-timeout=120s`']},
  {g:'Lock & Concurrency',b:'-501',bc:'orange',t:'Cursor ยังไม่ได้เปิด / ปิดไปแล้ว',s:'SQLSTATE 24501',k:'cursor closed commit resultset',
   d:'FETCH หรือ CLOSE cursor ที่ปิดไปแล้ว มักเกิดเพราะ COMMIT ปิด cursor ที่ไม่ได้ประกาศ WITH HOLD',
   fix:['อย่า COMMIT ระหว่างวนอ่าน ResultSet','ฝั่ง Java อ่าน ResultSet ให้จบก่อนปิด statement / connection']},

  // ── Resource / ระบบ ──
  {g:'Resource / ระบบ',b:'-964',bc:'red',t:'Transaction log เต็ม',s:'SQLSTATE 57011',k:'log full transaction logfilsiz',
   d:'transaction เดียวเขียนข้อมูลเยอะเกินพื้นที่ log หรือมี transaction เก่าค้างไม่ commit ทำให้ log วนใช้ไม่ได้',
   fix:['batch ใหญ่ให้ COMMIT ทุก N แถว (ดูหน้า SQL: ลบข้อมูลก้อนใหญ่ทีละชุด)','หา transaction ที่ค้างนานแล้วปิด','DBA ขยาย `LOGFILSIZ`, `LOGPRIMARY`, `LOGSECOND`']},
  {g:'Resource / ระบบ',b:'-904',bc:'red',t:'Resource ไม่พร้อมใช้งาน',s:'SQLSTATE 57011',k:'resource unavailable reason tablespace',
   d:'ดู reason code และชื่อ resource ในข้อความ เช่น tablespace offline / เต็ม หรือ lock list เต็ม',
   fix:['ส่ง reason code ให้ DBA ตรวจ','เช็คพื้นที่ tablespace: `SELECT * FROM SYSIBMADM.MON_TBSP_UTILIZATION`']},
  {g:'Resource / ระบบ',b:'-968',bc:'red',t:'File system เต็ม',s:'SQLSTATE 57011',k:'disk full file system',
   fix:['แจ้ง DBA / ทีม infra ขยายพื้นที่ หรือล้าง archive log เก่า']},
  {g:'Resource / ระบบ',b:'-1585',bc:'orange',t:'ไม่มี temp tablespace ขนาดหน้าที่พอสำหรับ sort',s:'SQLSTATE 54048',k:'system temporary tablespace page size sort',
   d:'query ที่ sort / join แถวกว้างๆ ต้องการ system temporary tablespace ที่ page size ใหญ่พอ',
   code:`CREATE BUFFERPOOL BP32K PAGESIZE 32K;
CREATE SYSTEM TEMPORARY TABLESPACE TEMPSPACE32K
  PAGESIZE 32K BUFFERPOOL BP32K;`},
  {g:'Resource / ระบบ',b:'-1035',bc:'orange',t:'Database ถูกใช้แบบ exclusive อยู่',s:'SQLSTATE 57019',k:'in use exclusive backup restore',
   fix:['รอ backup / restore / maintenance ให้เสร็จ']},
  {g:'Resource / ระบบ',b:'-1224',bc:'orange',t:'Database manager ปฏิเสธ / ตัด connection',s:'SQLSTATE 55032',k:'force terminated instance down',
   fix:['instance ถูกหยุด หรือ connection ถูก FORCE ให้ reconnect','ให้ connection pool ตรวจ connection ก่อนใช้ (ดู -4499)']},

  // ── Connection & Auth ──
  {g:'Connection & Auth',b:'-30081',bc:'red',t:'ต่อ database ไม่ได้ (communication error)',s:'SQLSTATE 08001',k:'tcp ip connection refused timeout port 50000',
   d:'TCP/IP ไปไม่ถึง: host / port ผิด, firewall, instance ไม่ได้เปิด หรือ port-forward หลุด',
   fix:['ทดสอบ port: `Test-NetConnection host -Port 50000` (Windows) หรือ `nc -vz host 50000`','ถ้าต่อผ่าน `kubectl port-forward` เช็คว่ายังรันอยู่','เช็ค SVCENAME ของ instance: `db2 get dbm cfg | grep SVCENAME`']},
  {g:'Connection & Auth',b:'-30082',bc:'red',t:'Login ไม่ผ่าน',s:'SQLSTATE 08001',k:'security processing failed password expired reason 24',
   d:'reason 24 = username/password ผิด · reason 1 = password หมดอายุ · reason 19 = user ถูก lock',
   fix:['เช็ค credential ใน Secret / application.properties ของ profile ที่รัน','password หมดอายุให้ DBA reset']},
  {g:'Connection & Auth',b:'-1060',bc:'orange',t:'User ไม่มีสิทธิ์ CONNECT',s:'SQLSTATE 08004',k:'connect privilege grant',
   code:`GRANT CONNECT ON DATABASE TO USER APPUSER;`},
  {g:'Connection & Auth',b:'-551',bc:'orange',t:'ไม่มีสิทธิ์ทำสิ่งนี้กับ object',s:'SQLSTATE 42501',k:'authorization privilege grant select',
   d:'user ไม่มีสิทธิ์ SELECT / INSERT / EXECUTE บนตารางหรือ procedure ที่ระบุในข้อความ',
   code:`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE MYSCHEMA.ORDERS TO USER APPUSER;
GRANT EXECUTE ON PROCEDURE MYSCHEMA.MY_PROC TO USER APPUSER;`},
  {g:'Connection & Auth',b:'-552',bc:'orange',t:'ไม่มีสิทธิ์ทำ operation (เช่น CREATE)',s:'SQLSTATE 42502',k:'authorization create',
   fix:['ขอสิทธิ์จาก DBA หรือให้ DBA รัน DDL แทน']},

  // ── JDBC / Package ──
  {g:'JDBC / Package',b:'-4499',bc:'red',t:'JCC: connection หลุดระหว่างใช้งาน',s:'SQLSTATE 08001 · ERRORCODE=-4499',k:'jcc socket communication reset pool',
   d:'driver ส่งข้อมูลผ่าน socket ไม่ได้ มักเกิดเมื่อ connection ใน pool ถูก firewall / load balancer ตัดเพราะ idle นาน',
   fix:['ให้ pool ตรวจ connection ก่อนใช้','ตั้ง idle timeout ของ pool ให้สั้นกว่า timeout ของ firewall'],
   lang:'properties',
   code:`quarkus.datasource.jdbc.validation-query-sql=SELECT 1 FROM SYSIBM.SYSDUMMY1
quarkus.datasource.jdbc.background-validation-interval=2M
quarkus.datasource.jdbc.idle-removal-interval=5M`},
  {g:'JDBC / Package',b:'-4470',bc:'orange',t:'JCC: connection ถูกปิดไปแล้ว',s:'SQLSTATE 08003 · ERRORCODE=-4470',k:'connection closed invalid operation',
   fix:['อย่าเก็บ Connection / ResultSet ไว้ใช้นอก method ที่เปิด','ใช้ try-with-resources และอ่านข้อมูลให้เสร็จก่อนคืน connection ให้ pool']},
  {g:'JDBC / Package',b:'-4229',bc:'orange',t:'JCC: batch ล้มเหลว (error จริงซ่อนอยู่ข้างใน)',s:'ERRORCODE=-4229',k:'batch failure getnextexception batchupdateexception',
   d:'`executeBatch()` แจ้งแค่ว่ามีบางแถวพัง สาเหตุจริง (เช่น -803, -407) ต้องดึงจาก `getNextException()`',
   lang:'java',
   code:`try {
    ps.executeBatch();
} catch (BatchUpdateException e) {
    SQLException next = e.getNextException();
    while (next != null) {
        log.errorf("batch: SQLCODE=%d %s", next.getErrorCode(), next.getMessage());
        next = next.getNextException();
    }
    throw e;
}`},
  {g:'JDBC / Package',b:'-805',bc:'orange',t:'ไม่พบ package (เช่น NULLID.SYSLH2xx)',s:'SQLSTATE 51002',k:'package not found nullid syslh bind db2cli',
   d:'ถ้าเป็น `SYSLH2xx` / `SYSLN2xx` แปลว่า CLI package ที่ใช้เปิด statement หมด: มักเป็นเพราะเปิด statement ค้างไม่ปิด (leak)',
   fix:['ปิด Statement / ResultSet ทุกตัว (try-with-resources)','DBA bind package เพิ่ม: `db2 bind @db2cli.lst blocking all grant public clipkg 30`']},
  {g:'JDBC / Package',b:'-818',bc:'orange',t:'Timestamp ของ package ไม่ตรงกับโปรแกรม',s:'SQLSTATE 51003',k:'consistency token rebind precompile',
   fix:['precompile แล้ว bind ใหม่ให้ตรงกัน หรือ `REBIND PACKAGE`']},
  ],
};
