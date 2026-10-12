// ── SQL & SYSTEM CATALOG ── DB2 LUW vs MariaDB, rendered by refdocs.js
REF_DOCS.sqlref={
  placeholder:'ค้นหา... เช่น sequence, procedure, coalesce, fetch first, merge',
  dialects:[['db2','DB2'],['maria','MariaDB']],
  dialectLabel:'เลือกฐานข้อมูล',
  lang:'sql',
  fixLabel:'ข้อควรรู้',
  items:[
  // ── System Catalog ──
  {g:'System Catalog',t:'รายชื่อตารางใน schema',b:'TABLES',bc:'blue',
   d:'DB2 เก็บ metadata ไว้ใน view `SYSCAT.*` (อ่านอย่างเดียว) ส่วน MariaDB ใช้ `information_schema` · ชื่อ schema/ตารางใน DB2 เก็บเป็นตัวพิมพ์ใหญ่',
   fix:['DB2 `TYPE`: T = table, V = view, A = alias, S = MQT','`CARD` / `TABLE_ROWS` เป็นจำนวนแถวโดยประมาณจากสถิติ ถ้า DB2 ได้ -1 แปลว่ายังไม่เคยรัน RUNSTATS'],
   code:{db2:`SELECT TABSCHEMA, TABNAME, TYPE, CARD, CREATE_TIME
FROM SYSCAT.TABLES
WHERE TABSCHEMA = 'MYSCHEMA'
  AND TYPE = 'T'
ORDER BY TABNAME;`,maria:`SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE, TABLE_ROWS, CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb'
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;`}},
  {g:'System Catalog',t:'คอลัมน์ของตาราง',b:'COLUMNS',bc:'blue',
   d:'ดูชื่อคอลัมน์ ชนิดข้อมูล ความยาว และ nullable ของตาราง',
   fix:['DB2 `NULLS` = Y/N, `COLNO` เริ่มที่ 0','ใน CLP ใช้ `DESCRIBE TABLE MYSCHEMA.EMPLOYEE` ได้เร็วกว่า','MariaDB ใช้ `DESCRIBE employee;` ได้เช่นกัน'],
   code:{db2:`SELECT COLNO, COLNAME, TYPENAME, LENGTH, SCALE, NULLS, DEFAULT
FROM SYSCAT.COLUMNS
WHERE TABSCHEMA = 'MYSCHEMA'
  AND TABNAME = 'EMPLOYEE'
ORDER BY COLNO;`,maria:`SELECT ORDINAL_POSITION, COLUMN_NAME, COLUMN_TYPE,
       IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mydb'
  AND TABLE_NAME = 'employee'
ORDER BY ORDINAL_POSITION;`}},
  {g:'System Catalog',t:'Sequence: ดูค่าและค่าถัดไป',b:'SEQUENCES',bc:'purple',k:'nextval identity',
   d:'ดู sequence ทั้งหมดใน schema พร้อมค่าตั้งต้น ขั้นเพิ่ม และ cache',
   fix:['DB2 `SEQTYPE`: S = sequence ที่สร้างเอง, I = identity column ของตาราง','`NEXTCACHEFIRSTVALUE` คือค่าแรกของ cache ก้อนถัดไป ไม่ใช่ค่าล่าสุดที่ใช้','ค่าล่าสุดใน session: DB2 `PREVIOUS VALUE FOR seq` · MariaDB `LASTVAL(seq)`'],
   code:{db2:`SELECT SEQSCHEMA, SEQNAME, START, INCREMENT,
       MINVALUE, MAXVALUE, CYCLE, CACHE, NEXTCACHEFIRSTVALUE
FROM SYSCAT.SEQUENCES
WHERE SEQSCHEMA = 'MYSCHEMA'
  AND SEQTYPE = 'S';`,maria:`-- MariaDB 10.3+ เก็บ sequence เป็นตารางชนิด SEQUENCE
SELECT TABLE_SCHEMA, TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_TYPE = 'SEQUENCE';

SHOW CREATE SEQUENCE seq_emp;

-- AUTO_INCREMENT ถัดไปของตาราง
SELECT AUTO_INCREMENT
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb' AND TABLE_NAME = 'employee';`}},
  {g:'System Catalog',t:'Stored procedure / function และ parameter',b:'ROUTINES',bc:'purple',k:'proc procedure function parameter',
   d:'หา procedure/function ใน schema ดู parameter และ source code ที่ใช้สร้าง',
   fix:['DB2 `ROUTINETYPE`: P = procedure, F = function','DB2 `ROWTYPE` ของ parameter: P = IN, O = OUT, B = INOUT','procedure ชื่อเดียวกันมีหลาย overload ได้ ใช้ `SPECIFICNAME` แยก'],
   code:{db2:`SELECT ROUTINESCHEMA, ROUTINENAME, ROUTINETYPE, SPECIFICNAME,
       PARM_COUNT, LANGUAGE, CREATE_TIME
FROM SYSCAT.ROUTINES
WHERE ROUTINESCHEMA = 'MYSCHEMA'
  AND ROUTINETYPE IN ('P', 'F')
ORDER BY ROUTINENAME;

-- parameter ของ routine
SELECT ORDINAL, PARMNAME, TYPENAME, ROWTYPE
FROM SYSCAT.ROUTINEPARMS
WHERE ROUTINESCHEMA = 'MYSCHEMA'
  AND ROUTINENAME = 'MY_PROC'
ORDER BY ORDINAL;

-- source ที่ใช้ CREATE
SELECT TEXT FROM SYSCAT.ROUTINES
WHERE ROUTINESCHEMA = 'MYSCHEMA' AND ROUTINENAME = 'MY_PROC';`,maria:`SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE, CREATED
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'mydb';

SELECT PARAMETER_NAME, PARAMETER_MODE, DATA_TYPE
FROM information_schema.PARAMETERS
WHERE SPECIFIC_SCHEMA = 'mydb'
  AND SPECIFIC_NAME = 'my_proc'
ORDER BY ORDINAL_POSITION;

SHOW CREATE PROCEDURE my_proc;`}},
  {g:'System Catalog',t:'Index ของตาราง',b:'INDEXES',bc:'blue',k:'unique primary key',
   d:'ดูว่าตารางมี index อะไร ครอบคอลัมน์ไหน และเป็น unique หรือไม่',
   fix:['DB2 `UNIQUERULE`: P = primary key, U = unique, D = ซ้ำได้','DB2 `COLNAMES` เช่น `+EMPNO-HIREDATE` (+ = ASC, - = DESC)','ใช้ร่วมกับ SQLCODE -803: ข้อความ error บอกเลข index (IID) ให้ค้นด้วย `IID`'],
   code:{db2:`SELECT INDSCHEMA, INDNAME, IID, COLNAMES, UNIQUERULE
FROM SYSCAT.INDEXES
WHERE TABSCHEMA = 'MYSCHEMA'
  AND TABNAME = 'EMPLOYEE';`,maria:`SHOW INDEX FROM employee;

SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'mydb' AND TABLE_NAME = 'employee'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;`}},
  {g:'System Catalog',t:'Foreign key: ตารางนี้อ้างใคร / ใครอ้างตารางนี้',b:'REFERENCES',bc:'blue',k:'fk constraint',
   d:'ใช้ตอนเจอ SQLCODE -530 / -532 หรือก่อนลบข้อมูลแม่ ต้องรู้ว่ามีตารางลูกไหนบ้าง',
   fix:['DB2 `DELETERULE`: A = no action, C = cascade, N = set null, R = restrict'],
   code:{db2:`-- FK ของตาราง ORDERS ที่ชี้ไปตารางอื่น
SELECT CONSTNAME, FK_COLNAMES, REFTABNAME, PK_COLNAMES, DELETERULE
FROM SYSCAT.REFERENCES
WHERE TABSCHEMA = 'MYSCHEMA' AND TABNAME = 'ORDERS';

-- ตารางลูกที่ชี้มาหา CUSTOMER
SELECT TABNAME, CONSTNAME, FK_COLNAMES
FROM SYSCAT.REFERENCES
WHERE REFTABSCHEMA = 'MYSCHEMA' AND REFTABNAME = 'CUSTOMER';`,maria:`SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME,
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'mydb'
  AND REFERENCED_TABLE_NAME = 'customer';`}},
  {g:'System Catalog',t:'View และ Trigger',b:'VIEWS',bc:'blue',
   d:'ดู SQL ที่ใช้สร้าง view และ trigger ที่ผูกกับตาราง',
   fix:['DB2 `TRIGTIME`: B = before, A = after, I = instead of · `TRIGEVENT`: I/U/D'],
   code:{db2:`SELECT VIEWNAME, TEXT
FROM SYSCAT.VIEWS
WHERE VIEWSCHEMA = 'MYSCHEMA';

SELECT TRIGNAME, TABNAME, TRIGTIME, TRIGEVENT, TEXT
FROM SYSCAT.TRIGGERS
WHERE TRIGSCHEMA = 'MYSCHEMA';`,maria:`SELECT TABLE_NAME, VIEW_DEFINITION
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'mydb';

SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE, ACTION_TIMING, EVENT_MANIPULATION
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'mydb';`}},
  {g:'System Catalog',t:'ค้นหาคอลัมน์จากชื่อ ทั้ง database',b:'SEARCH',bc:'cyan',
   d:'ลืมว่าคอลัมน์อยู่ตารางไหน ค้นด้วย LIKE ได้เลย',
   code:{db2:`SELECT TABSCHEMA, TABNAME, COLNAME, TYPENAME
FROM SYSCAT.COLUMNS
WHERE COLNAME LIKE '%EMP%'
  AND TABSCHEMA NOT LIKE 'SYS%';`,maria:`SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'mydb'
  AND COLUMN_NAME LIKE '%emp%';`}},
  {g:'System Catalog',t:'Session: user, schema, เวลา, version',b:'SESSION',bc:'cyan',
   d:'เช็คว่าต่ออยู่ database/schema ไหน เวลาเครื่อง DB เท่าไร (บ่อยครั้ง SQLCODE -204 เกิดเพราะ schema ผิด)',
   code:{db2:`VALUES (CURRENT USER, CURRENT SCHEMA, CURRENT SERVER, CURRENT TIMESTAMP);

SELECT SERVICE_LEVEL, FIXPACK_NUM FROM SYSIBMADM.ENV_INST_INFO;

SET SCHEMA MYSCHEMA;`,maria:`SELECT CURRENT_USER(), DATABASE(), NOW(), VERSION();

USE mydb;`}},
  {g:'System Catalog',t:'ขนาดตาราง และตารางที่ค้าง REORG',b:'SIZE',bc:'orange',k:'reorg pending 668',
   d:'ดูตารางที่กินพื้นที่มาก และ (DB2) ตารางที่อยู่ในสถานะ reorg pending หลัง ALTER TABLE ซึ่งทำให้เจอ SQLCODE -668',
   code:{db2:`SELECT TABNAME, DATA_OBJECT_P_SIZE, INDEX_OBJECT_P_SIZE, REORG_PENDING
FROM SYSIBMADM.ADMINTABINFO
WHERE TABSCHEMA = 'MYSCHEMA'
ORDER BY DATA_OBJECT_P_SIZE DESC;

-- แก้ reorg pending
CALL SYSPROC.ADMIN_CMD('REORG TABLE MYSCHEMA.EMPLOYEE');`,maria:`SELECT TABLE_NAME,
       ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'mydb'
ORDER BY size_mb DESC;`}},
  {g:'System Catalog',t:'ใครถือ lock อยู่ / session ที่ค้าง',b:'LOCKS',bc:'red',k:'deadlock 911 timeout',
   d:'ใช้ตอนเจอ SQLCODE -911 / -913 (lock timeout, deadlock) หรือ query ค้างไม่จบ',
   fix:['DB2 ปลด session: `FORCE APPLICATION (<handle>)` ผ่าน CLP หรือ `CALL SYSPROC.ADMIN_CMD(\'FORCE APPLICATION (123)\')`','MariaDB ปลด session: `KILL <id>;`','ปลดแล้ว transaction ของ session นั้นจะ rollback'],
   code:{db2:`-- คู่ที่รอ lock กันอยู่ตอนนี้ (ใคร hold ใคร request)
SELECT * FROM SYSIBMADM.MON_LOCKWAITS;

-- application ที่ต่ออยู่
SELECT APPLICATION_HANDLE, APPLICATION_NAME, SESSION_AUTH_ID, ELAPSED_TIME_SEC
FROM SYSIBMADM.MON_CURRENT_UOW
ORDER BY ELAPSED_TIME_SEC DESC;`,maria:`SHOW FULL PROCESSLIST;

SELECT * FROM information_schema.INNODB_TRX;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;`}},

  // ── ฟังก์ชันที่ใช้บ่อย ──
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'COALESCE / NULLIF: จัดการค่า NULL',b:'NULL',bc:'green',k:'ifnull value nvl',
   d:'`COALESCE(a, b, c)` คืนค่าแรกที่ไม่ใช่ NULL · `NULLIF(a, b)` คืน NULL ถ้า a = b (ใช้แปลง \'\' เป็น NULL หรือกันหารด้วย 0)',
   fix:['DB2 มี `VALUE()` ทำงานเหมือน COALESCE · MariaDB มี `IFNULL(a, b)` รับ 2 ค่า','DB2 LUW ถือว่า \'\' ไม่ใช่ NULL (ต่างจาก Oracle) ต้อง NULLIF เองถ้าอยากให้เป็น NULL'],
   code:{db2:`SELECT EMPNO,
       COALESCE(MOBILE, PHONE, '-')      AS CONTACT,
       NULLIF(TRIM(NICKNAME), '')         AS NICKNAME,   -- '' → NULL
       TOTAL / NULLIF(QTY, 0)             AS UNIT_PRICE  -- กันหารด้วย 0
FROM EMPLOYEE;`,maria:`SELECT empno,
       COALESCE(mobile, phone, '-')      AS contact,
       IFNULL(nickname, 'ไม่ระบุ')         AS nickname,
       total / NULLIF(qty, 0)            AS unit_price
FROM employee;`}},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'TRIM / LTRIM / RTRIM: ตัดช่องว่าง',b:'TRIM',bc:'green',k:'strip space char padding',
   d:'คอลัมน์ `CHAR(n)` ใน DB2 เติมช่องว่างท้ายจนเต็มความยาว การเทียบ `=` ไม่สนช่องว่างท้าย แต่ `LENGTH` และการต่อ string นับช่องว่างด้วย',
   fix:['ตัดเลข 0 นำหน้า: `TRIM(LEADING \'0\' FROM code)`','DB2 มี `STRIP(col, B, \' \')` อีกรูปแบบหนึ่ง','ฝั่ง Java ได้ค่า CHAR มาพร้อมช่องว่างท้าย เลย `.equals()` ไม่ตรง ให้ RTRIM ใน SQL หรือ `.strip()` ใน Java'],
   code:{db2:`SELECT TRIM(NAME)                    AS NAME,      -- ตัดหน้าและหลัง
       RTRIM(CODE)                    AS CODE,      -- ตัดเฉพาะท้าย (CHAR padding)
       TRIM(LEADING '0' FROM ACC_NO)  AS ACC_NO     -- 000123 → 123
FROM CUSTOMER
WHERE RTRIM(STATUS) = 'A';`,maria:`SELECT TRIM(name)                    AS name,
       RTRIM(code)                    AS code,
       TRIM(LEADING '0' FROM acc_no)  AS acc_no
FROM customer
WHERE status = 'A';`}},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'CASE WHEN: เงื่อนไขในคอลัมน์',b:'CASE',bc:'green',k:'if decode',
   d:'ใช้แปลงรหัสเป็นข้อความ หรือแบ่งช่วงค่า ทำงานเหมือนกันทั้ง DB2 และ MariaDB',
   code:`SELECT EMPNO,
       CASE STATUS
         WHEN 'A' THEN 'ใช้งาน'
         WHEN 'I' THEN 'ระงับ'
         ELSE 'ไม่ทราบ'
       END AS STATUS_TEXT,
       CASE
         WHEN SALARY >= 50000 THEN 'สูง'
         WHEN SALARY >= 20000 THEN 'กลาง'
         ELSE 'ต่ำ'
       END AS SALARY_LEVEL
FROM EMPLOYEE;`},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'แปลงชนิดข้อมูลและ format วันที่',b:'CAST',bc:'green',k:'to_char to_date date_format str_to_date convert',
   code:{db2:`SELECT CAST(AMOUNT_TXT AS DECIMAL(12,2))            AS AMOUNT,
       VARCHAR_FORMAT(CREATED, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_TXT,
       TO_DATE('12/10/2026', 'DD/MM/YYYY')            AS D,
       YEAR(BIRTH_DATE) + 543                         AS BIRTH_YEAR_BE
FROM PAYMENT;`,maria:`SELECT CAST(amount_txt AS DECIMAL(12,2))          AS amount,
       DATE_FORMAT(created, '%Y-%m-%d %H:%i:%s')      AS created_txt,
       STR_TO_DATE('12/10/2026', '%d/%m/%Y')          AS d,
       YEAR(birth_date) + 543                         AS birth_year_be
FROM payment;`},
   fix:['ปี พ.ศ. = ค.ศ. + 543 · ถ้าเก็บ พ.ศ. ไว้ใน DATE/TIMESTAMP จะคำนวณช่วงวันผิด ควรเก็บ ค.ศ. แล้วแปลงตอนแสดงผล']},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'ต่อ string / ตัด string / ความยาว (ภาษาไทย)',b:'STRING',bc:'green',k:'concat substr length codeunits utf-8 bytes',
   d:'DB2 นับ `VARCHAR(n)` และ `LENGTH()` เป็น byte ตัวอักษรไทยใน UTF-8 ใช้ 3 byte ดังนั้น `VARCHAR(30)` เก็บไทยได้ราว 10 ตัว ถ้าเกินจะได้ SQLCODE -302 / -404',
   fix:['DB2 นับเป็นตัวอักษร: `CHARACTER_LENGTH(s, CODEUNITS32)`','DB2 `CONCAT(a, b)` รับแค่ 2 ค่า ใช้ `||` แทนเมื่อต่อหลายค่า','MariaDB `||` คือ OR (ยกเว้นเปิด PIPES_AS_CONCAT) ต้องใช้ `CONCAT()` · `LENGTH` = byte, `CHAR_LENGTH` = ตัวอักษร'],
   code:{db2:`SELECT FIRSTNME || ' ' || LASTNAME                AS FULL_NAME,
       SUBSTR(CITIZEN_ID, 1, 1)                     AS FIRST_DIGIT,
       LENGTH(NAME_TH)                              AS BYTES,
       CHARACTER_LENGTH(NAME_TH, CODEUNITS32)       AS CHARS,
       LOCATE('@', EMAIL)                           AS AT_POS,
       REPLACE(PHONE, '-', '')                      AS PHONE_DIGITS
FROM EMPLOYEE;`,maria:`SELECT CONCAT(firstnme, ' ', lastname)  AS full_name,
       SUBSTRING(citizen_id, 1, 1)     AS first_digit,
       LENGTH(name_th)                 AS bytes,
       CHAR_LENGTH(name_th)            AS chars,
       LOCATE('@', email)              AS at_pos,
       REPLACE(phone, '-', '')         AS phone_digits
FROM employee;`}},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'รวมหลายแถวเป็น string เดียว',b:'LISTAGG',bc:'green',k:'group_concat string_agg',
   code:{db2:`SELECT DEPTNO,
       LISTAGG(EMPNAME, ', ') WITHIN GROUP (ORDER BY EMPNAME) AS MEMBERS
FROM EMPLOYEE
GROUP BY DEPTNO;`,maria:`SELECT deptno,
       GROUP_CONCAT(empname ORDER BY empname SEPARATOR ', ') AS members
FROM employee
GROUP BY deptno;`},
   fix:['MariaDB ตัดผลที่ `group_concat_max_len` (ค่าเริ่ม 1MB ใน 10.2+) โดยไม่ error','DB2 LISTAGG ยาวเกิน 4000 byte (VARCHAR) จะ error ให้ CAST เป็น CLOB หรือกรองก่อน']},
  {g:'ฟังก์ชันที่ใช้บ่อย',t:'วันที่และเวลา: บวกลบ ระยะห่าง วันสิ้นเดือน',b:'DATE',bc:'green',k:'current date now interval datediff last_day',
   code:{db2:`SELECT CURRENT DATE                         AS TODAY,
       CURRENT TIMESTAMP                    AS NOW,
       CURRENT DATE + 7 DAYS                AS NEXT_WEEK,
       CURRENT DATE - 1 MONTH               AS LAST_MONTH,
       DAYS(CURRENT DATE) - DAYS(START_DATE) AS DAYS_WORKED,
       LAST_DAY(CURRENT DATE)               AS END_OF_MONTH,
       DAYOFWEEK(CURRENT DATE)              AS DOW          -- 1 = อาทิตย์
FROM EMPLOYEE;`,maria:`SELECT CURDATE()                              AS today,
       NOW()                                  AS now,
       CURDATE() + INTERVAL 7 DAY             AS next_week,
       CURDATE() - INTERVAL 1 MONTH           AS last_month,
       DATEDIFF(CURDATE(), start_date)        AS days_worked,
       LAST_DAY(CURDATE())                    AS end_of_month,
       DAYOFWEEK(CURDATE())                   AS dow           -- 1 = อาทิตย์
FROM employee;`}},

  // ── Pagination & Sequence ──
  {g:'Pagination & Sequence',t:'แบ่งหน้า (pagination)',b:'PAGING',bc:'purple',k:'limit offset fetch first row_number',
   d:'DB2 11.1 ขึ้นไปใช้ `OFFSET ... FETCH FIRST` ได้ เวอร์ชันเก่าต้องใช้ `ROW_NUMBER()` · MariaDB ใช้ `LIMIT`',
   fix:['ต้องมี `ORDER BY` เสมอ ไม่งั้นแต่ละหน้าอาจได้แถวซ้ำหรือหาย','OFFSET มากๆ ช้า (ต้องอ่านทิ้ง) ถ้าข้อมูลใหญ่ใช้ keyset: `WHERE ID > :lastId ORDER BY ID FETCH FIRST 20 ROWS ONLY`'],
   code:{db2:`-- DB2 11.1+
SELECT * FROM EMPLOYEE
ORDER BY EMPNO
OFFSET 20 ROWS FETCH FIRST 10 ROWS ONLY;

-- DB2 เวอร์ชันเก่า
SELECT * FROM (
  SELECT E.*, ROW_NUMBER() OVER (ORDER BY EMPNO) AS RN
  FROM EMPLOYEE E
) T
WHERE RN BETWEEN 21 AND 30;`,maria:`SELECT * FROM employee
ORDER BY empno
LIMIT 10 OFFSET 20;`}},
  {g:'Pagination & Sequence',t:'ดึงค่าจาก sequence',b:'NEXTVAL',bc:'purple',k:'next value for sequence restart',
   code:{db2:`VALUES NEXT VALUE FOR MYSCHEMA.SEQ_EMP;

INSERT INTO EMPLOYEE (ID, NAME)
VALUES (NEXT VALUE FOR MYSCHEMA.SEQ_EMP, 'สมชาย');

-- ตั้งค่าใหม่ (เช่นหลัง import ข้อมูล แล้วเจอ -803)
ALTER SEQUENCE MYSCHEMA.SEQ_EMP RESTART WITH 1001;`,maria:`SELECT NEXTVAL(seq_emp);       -- หรือ NEXT VALUE FOR seq_emp

INSERT INTO employee (id, name)
VALUES (NEXTVAL(seq_emp), 'สมชาย');

ALTER SEQUENCE seq_emp RESTART WITH 1001;`},
   fix:['ถ้า import ข้อมูลที่มี ID มาเอง ต้อง RESTART sequence ให้มากกว่า MAX(ID) ไม่งั้นได้ duplicate key (-803)']},
  {g:'Pagination & Sequence',t:'Identity / Auto increment',b:'IDENTITY',bc:'purple',k:'auto_increment generated last_insert_id',
   code:{db2:`CREATE TABLE MYSCHEMA.ORDERS (
  ID      INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),
  REMARK  VARCHAR(200),
  PRIMARY KEY (ID)
);

SELECT IDENTITY_VAL_LOCAL() FROM SYSIBM.SYSDUMMY1;   -- ID ล่าสุดของ session

ALTER TABLE MYSCHEMA.ORDERS ALTER COLUMN ID RESTART WITH 5000;`,maria:`CREATE TABLE orders (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  remark  VARCHAR(200)
);

SELECT LAST_INSERT_ID();        -- ID ล่าสุดของ connection

ALTER TABLE orders AUTO_INCREMENT = 5000;`},
   fix:['DB2 `GENERATED ALWAYS` ห้าม insert ค่าเอง ถ้าต้องการกำหนดได้บางครั้งใช้ `GENERATED BY DEFAULT`']},
  {g:'Pagination & Sequence',t:'SELECT ค่าโดยไม่มีตาราง (dummy table)',b:'DUMMY',bc:'cyan',k:'sysdummy1 dual values',
   code:{db2:`SELECT CURRENT TIMESTAMP FROM SYSIBM.SYSDUMMY1;

VALUES CURRENT TIMESTAMP;     -- แบบสั้นของ DB2`,maria:`SELECT NOW();

SELECT NOW() FROM DUAL;       -- เขียนแบบนี้ก็ได้`}},

  // ── Query พื้นฐาน ──
  {g:'Query พื้นฐาน',t:'JOIN ทั้ง 4 แบบ',b:'JOIN',bc:'blue',k:'inner left right full outer',
   d:'INNER = ตรงกันทั้งสองฝั่ง · LEFT = ทุกแถวฝั่งซ้ายแม้ไม่เจอคู่ · RIGHT = กลับกัน · FULL = ทั้งสองฝั่ง',
   fix:['MariaDB ไม่มี `FULL OUTER JOIN` ต้องใช้ LEFT UNION RIGHT','เงื่อนไขของตารางฝั่งขวาใน LEFT JOIN ให้ใส่ใน ON ถ้าใส่ใน WHERE จะกลายเป็น INNER JOIN'],
   code:{db2:`SELECT E.EMPNO, E.NAME, D.DEPTNAME
FROM EMPLOYEE E
LEFT JOIN DEPARTMENT D
       ON D.DEPTNO = E.WORKDEPT
      AND D.ACTIVE = 'Y';         -- เงื่อนไขฝั่งขวาอยู่ใน ON

SELECT E.EMPNO, D.DEPTNO
FROM EMPLOYEE E
FULL OUTER JOIN DEPARTMENT D ON D.DEPTNO = E.WORKDEPT;`,maria:`SELECT e.empno, e.name, d.deptname
FROM employee e
LEFT JOIN department d
       ON d.deptno = e.workdept
      AND d.active = 'Y';

-- FULL OUTER JOIN ใน MariaDB
SELECT e.empno, d.deptno FROM employee e LEFT JOIN department d ON d.deptno = e.workdept
UNION
SELECT e.empno, d.deptno FROM employee e RIGHT JOIN department d ON d.deptno = e.workdept;`}},
  {g:'Query พื้นฐาน',t:'GROUP BY + HAVING',b:'GROUP',bc:'blue',k:'aggregate count sum',
   d:'คอลัมน์ใน SELECT ที่ไม่ใช่ aggregate ต้องอยู่ใน GROUP BY (DB2 เข้มงวดเรื่องนี้ ได้ SQLCODE -122) · `WHERE` กรองก่อนรวม `HAVING` กรองหลังรวม',
   code:`SELECT WORKDEPT, COUNT(*) AS CNT, SUM(SALARY) AS TOTAL
FROM EMPLOYEE
WHERE STATUS = 'A'
GROUP BY WORKDEPT
HAVING COUNT(*) >= 5
ORDER BY TOTAL DESC;`},
  {g:'Query พื้นฐาน',t:'NULL: เทียบยังไงให้ถูก',b:'IS NULL',bc:'red',k:'not in null count',
   d:'`col = NULL` ไม่มีวันเป็นจริง ต้องใช้ `IS NULL` · `COUNT(col)` ไม่นับแถวที่เป็น NULL · `NOT IN (subquery)` ถ้า subquery มี NULL สักตัว ผลจะว่างทั้งหมด',
   fix:['ใช้ `NOT EXISTS` แทน `NOT IN` เมื่อ subquery อาจมี NULL'],
   code:`-- ผิด: ไม่ได้แถวไหนเลยถ้า MANAGER_ID มี NULL
SELECT * FROM EMPLOYEE
WHERE EMPNO NOT IN (SELECT MANAGER_ID FROM DEPARTMENT);

-- ถูก
SELECT * FROM EMPLOYEE E
WHERE NOT EXISTS (
  SELECT 1 FROM DEPARTMENT D WHERE D.MANAGER_ID = E.EMPNO
);`},
  {g:'Query พื้นฐาน',t:'WITH (CTE) และ recursive',b:'CTE',bc:'blue',k:'with recursive hierarchy',
   d:'แยก query ซับซ้อนเป็นชั้นๆ อ่านง่ายขึ้น และใช้ recursive ไล่โครงสร้างลำดับชั้น เช่น หน่วยงานแม่ลูก',
   code:{db2:`WITH ORG (DEPTNO, PARENT, LVL) AS (
  SELECT DEPTNO, ADMRDEPT, 1 FROM DEPARTMENT WHERE DEPTNO = 'A00'
  UNION ALL
  SELECT D.DEPTNO, D.ADMRDEPT, O.LVL + 1
  FROM DEPARTMENT D JOIN ORG O ON D.ADMRDEPT = O.DEPTNO
  WHERE D.DEPTNO <> D.ADMRDEPT
)
SELECT * FROM ORG;`,maria:`WITH RECURSIVE org (deptno, parent, lvl) AS (
  SELECT deptno, admrdept, 1 FROM department WHERE deptno = 'A00'
  UNION ALL
  SELECT d.deptno, d.admrdept, o.lvl + 1
  FROM department d JOIN org o ON d.admrdept = o.deptno
  WHERE d.deptno <> d.admrdept
)
SELECT * FROM org;`},
   fix:['DB2 ไม่ต้องเขียนคำว่า RECURSIVE · MariaDB 10.2+ ต้องมี']},
  {g:'Query พื้นฐาน',t:'ROW_NUMBER: เอาแถวล่าสุดของแต่ละกลุ่ม',b:'WINDOW',bc:'blue',k:'over partition rank dedupe latest',
   d:'ใช้ window function แทน subquery ซ้อน เช่น หา record ล่าสุดของลูกค้าแต่ละคน หรือลบข้อมูลซ้ำ',
   code:`SELECT *
FROM (
  SELECT P.*,
         ROW_NUMBER() OVER (PARTITION BY CUSTOMER_ID ORDER BY PAID_AT DESC) AS RN
  FROM PAYMENT P
) T
WHERE RN = 1;`},
  {g:'Query พื้นฐาน',t:'อ่านแบบไม่รอ lock สำหรับรายงาน',b:'ISOLATION',bc:'orange',k:'with ur dirty read uncommitted',
   d:'รายงานที่อ่านข้อมูลเยอะๆ แล้วไปรอ lock ของ transaction อื่น จะช้าหรือโดน -911 ถ้ายอมรับข้อมูลที่ยังไม่ commit ได้ ให้อ่านแบบ uncommitted',
   fix:['ห้ามใช้กับข้อมูลที่ต้องถูกต้อง 100% เช่น ยอดเงินก่อนตัดบัญชี'],
   code:{db2:`SELECT COUNT(*) FROM PAYMENT
WHERE PAID_AT >= CURRENT DATE - 30 DAYS
WITH UR;`,maria:`SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT COUNT(*) FROM payment
WHERE paid_at >= CURDATE() - INTERVAL 30 DAY;`}},

  // ── Upsert & DML ──
  {g:'Upsert & DML',t:'Upsert: มีแล้ว update ไม่มี insert',b:'MERGE',bc:'orange',k:'on duplicate key insert update',
   code:{db2:`MERGE INTO MYSCHEMA.CONFIG T
USING (VALUES ('MAX_UPLOAD', '20')) AS S (KEY_NAME, KEY_VALUE)
   ON T.KEY_NAME = S.KEY_NAME
WHEN MATCHED THEN
  UPDATE SET T.KEY_VALUE = S.KEY_VALUE, T.UPDATED_AT = CURRENT TIMESTAMP
WHEN NOT MATCHED THEN
  INSERT (KEY_NAME, KEY_VALUE, UPDATED_AT)
  VALUES (S.KEY_NAME, S.KEY_VALUE, CURRENT TIMESTAMP);`,maria:`INSERT INTO config (key_name, key_value, updated_at)
VALUES ('MAX_UPLOAD', '20', NOW())
ON DUPLICATE KEY UPDATE
  key_value  = VALUES(key_value),
  updated_at = NOW();`},
   fix:['MariaDB ต้องมี PRIMARY KEY หรือ UNIQUE ที่ชนกันถึงจะ update']},
  {g:'Upsert & DML',t:'UPDATE โดยอ้างอีกตาราง',b:'UPDATE',bc:'orange',k:'update join exists',
   code:{db2:`UPDATE EMPLOYEE E
SET SALARY = SALARY * 1.05
WHERE EXISTS (
  SELECT 1 FROM DEPARTMENT D
  WHERE D.DEPTNO = E.WORKDEPT AND D.LOCATION = 'BKK'
);`,maria:`UPDATE employee e
JOIN department d ON d.deptno = e.workdept
SET e.salary = e.salary * 1.05
WHERE d.location = 'BKK';`}},
  {g:'Upsert & DML',t:'ลบข้อมูลก้อนใหญ่ทีละชุด',b:'DELETE',bc:'red',k:'batch purge log full 964',
   d:'ลบหลักล้านแถวใน transaction เดียวทำให้ log เต็ม (DB2 SQLCODE -964) และ lock ตารางนาน ให้ลบทีละชุดแล้ว COMMIT วนจนหมด',
   code:{db2:`DELETE FROM (
  SELECT * FROM MYSCHEMA.AUDIT_LOG
  WHERE CREATED < CURRENT DATE - 90 DAYS
  FETCH FIRST 10000 ROWS ONLY
);
COMMIT;
-- วนซ้ำจนได้ SQLCODE +100 (ไม่เหลือแถว)`,maria:`DELETE FROM audit_log
WHERE created < CURDATE() - INTERVAL 90 DAY
LIMIT 10000;
COMMIT;
-- วนซ้ำจน affected rows = 0`}},
  ],
};
