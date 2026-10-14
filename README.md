<p align="center"><img src="assets/images/icon-192.png" width="112" alt="อีสาน Dev Tools" /></p>

# อีสาน Dev Tools

> **Developer toolkit สำหรับนักพัฒนาไทย** — ใช้งานได้ทันทีในเบราว์เซอร์ ไม่ต้องติดตั้ง ไม่ส่งข้อมูลออกไปไหน

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366f1?style=flat-square&logo=github)](https://devgreenpink.github.io/dev-utility-toolkit/)
[![Version](https://img.shields.io/badge/version-2.0-34d399?style=flat-square)]()
[![PWA](https://img.shields.io/badge/PWA-Installable-f472b6?style=flat-square)]()
[![No Backend](https://img.shields.io/badge/No-Backend%20Required-22d3ee?style=flat-square)]()
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-fbbf24?style=flat-square)]()

เครื่องมือ 39 อย่างใน 7 หมวด ทำงานบน client-side ทั้งหมด ไม่มี server ไม่มี API ของเราเอง ไม่มี tracking

---

## เริ่มจากหน้าแรก: วางอะไรก็ได้

หน้าแรกมีช่องเดียว พิมพ์ชื่อเครื่องมือเพื่อค้นหา หรือ **วางข้อความแล้วระบบจะเดาว่าคืออะไร** แล้วเปิดเครื่องมือที่ใช่พร้อมกรอกให้:

| วางสิ่งนี้ | เปิดเครื่องมือ |
|---|---|
| JWT token | JWT Decoder |
| Java stack trace | Stack Trace Analyzer |
| JSON, YAML, `.properties`, XML (แปลงเป็น JSON) | JSON Tools / Properties ↔ YAML |
| SQL ใน Java String / StringBuilder | Java String → Clean SQL |
| Kubernetes Secret YAML | K8s Secret Decoder |
| Unix timestamp, เลขบัตร 13 หลัก, SQLCODE | Unix Timestamp / พ.ศ. · เลขบัตร · บาท / DB2 Error Codes |
| คำสั่ง `curl` | แยก token, JSON body และ URL ให้เลือกส่งต่อ |
| ไฟล์ HAR | สรุป request ที่ล้มเหลวและช้า |
| Dockerfile, Jenkinsfile | Docker & K8s / Jenkins CI/CD |

ลากไฟล์มาวางที่ไหนก็ได้ในหน้า ระบบดูจากชื่อไฟล์และเนื้อหาแล้วเปิดเครื่องมือให้ รูปภาพจะไปที่ QR Code Reader

---

## มีอะไรใหม่ใน v2.0

- **หน้าตาใหม่** ทุกเครื่องมือใช้ layout เดียวกัน: ช่องกรอกซ้าย ผลลัพธ์ขวา อัปเดตทันทีที่พิมพ์ ไม่ต้องกดปุ่มแปลง
- **logo ใหม่** และ header ที่บอกหมวด ไอคอน และปุ่มรายการโปรดของเครื่องมือที่เปิดอยู่ · ธีมเริ่มต้นเป็น Dracula
- **Smart paste** บนหน้าแรกและใน `Ctrl + K` (วางข้อความหลายบรรทัดได้)
- **จำข้อมูลที่กรอกไว้** ทุกช่อง เปิดหน้าใหม่ก็ยังอยู่ (ไม่จำ JWT และ Secret) พร้อม **ประวัติ** 5 ค่าล่าสุดของช่องหลัก
- **ส่งต่อ** ผลลัพธ์ไปเครื่องมืออื่นที่อ่านได้ เช่น payload ของ JWT ไป JSON Tools
- **ลิงก์แชร์** ที่เปิดเครื่องมือเดิมพร้อมข้อมูลเดิมในเครื่องอื่น (บีบอัดไว้ใน URL, ไม่ใส่ JWT / secret)
- **แผนผังกดได้ 16 แบบ** ในหน้า Java Exceptions (ต้นไม้ลำดับชั้นของทุก exception ที่มีการ์ด, อ่าน Caused by,
  LazyInitialization), Java Internals (memory ของ JVM, จาก .java ถึงตอนรัน, ClassLoader, transaction), DB2 (อ่านข้อความ
  error, deadlock), SQL (JOIN), Docker & K8s (Pod ค้างตรงไหน, ใครสร้าง Pod), HTTP Status (ใครตอบ), Git, Cron และ Angular ·
  กดส่วนไหนก็มีคำอธิบายลอยอยู่ล่างจอ และพาไปการ์ดที่เกี่ยวข้องได้
- **คัดลอกแล้วรู้ว่าคัดลอก** ปุ่มเปลี่ยนเป็น "คัดลอกแล้ว" และ toast แสดงสิ่งที่คัดลอก
- **เครื่องมือใหม่** QR Code Reader (PromptPay / Thai QR + ตรวจ CRC), Stack Trace Analyzer, JSON → Type, Properties ↔ YAML, K8s Secret Decoder, พ.ศ. · เลขบัตร · บาท
- **เนื้อหาใหม่** SQL & System Catalog, DB2 Error Codes, Java Exceptions, Java Internals, NgRx, Docker & K8s (ไฟล์ตัวอย่าง 32 ไฟล์อธิบายทีละบรรทัด + การ mount ไฟล์), Request Path, Jenkins CI/CD, CLI และ Git cheatsheet
- **ตรวจเนื้อหาทุกหน้า** แก้ข้อมูลที่ผิด เช่น Cron คำนวณรอบถัดไปตาม timezone ถูกแล้วและแปลงเป็น Spring / Quarkus
  `@Scheduled` (Quartz) ได้ถูกรูปแบบ, config ของ RabbitMQ / Redis ตรงกับ Quarkus ปัจจุบัน, รายละเอียดของ K8s, HTTP, RxJS
  และเพิ่มเนื้อหาที่ขาด (exception ของ JPA / security / POI, SQLCODE ที่เจอบ่อย, GC, virtual thread, NgRx Signals Store,
  `firstValueFrom`, Git tag)
- **ตั้งค่าตัวอักษร** ขนาด 4 ระดับ และเลือกฟอนต์ได้
- **ใช้ offline ได้ครบ** library จาก CDN ถูกเก็บไว้หลังเปิดออนไลน์ครั้งแรก ทุกเครื่องมือจึงใช้ได้ตอนไม่มีเน็ต
- **เปิดเร็วขึ้น** library และเครื่องมือขนาดใหญ่โหลดเมื่อเปิดใช้ครั้งแรก หน้าแรกโหลดเฉพาะตัวแอป
- **เอาเครื่องมือแปลภาษาออก** เพราะต้องส่งข้อความออกไปภายนอก ขัดกับหลัก privacy ของแอป

---

## เครื่องมือทั้งหมด

### ข้อมูล & JSON
| เครื่องมือ | ทำอะไร |
|---|---|
| Mock Data Generator | ข้อมูลจำลองภาษาไทย: เลขบัตรที่ checksum ถูก, ชื่อ, เบอร์โทร, จังหวัด, บริษัท, บัตรเครดิต Luhn, UUID · export JSON สูงสุด 500 records |
| JSON Tools | จัดรูปแบบ, บีบอัด, Tree View, Split, JSONPath Query |
| เปรียบเทียบข้อความ / JSON | diff ระดับตัวอักษรหรือบรรทัด, จัด JSON ให้ก่อนเทียบ |
| JSON → Type | TypeScript interface / Java record จาก JSON ตัวอย่าง |
| Properties ↔ YAML | `application.properties` ของ Quarkus ↔ YAML |
| Regex Tester | highlight, capture groups, pattern สำเร็จรูป (อีเมล, URL, เบอร์ไทย, เลขบัตร, ISO date, Jira key) |

### Encode & แปลงค่า
| เครื่องมือ | ทำอะไร |
|---|---|
| Base64 Encode / Decode | UTF-8 / ภาษาไทย, URL-safe, ไม่มี padding |
| URL Encode / Decode | `encodeURIComponent` / `encodeURI`, Unicode |
| Number Base Converter | ฐาน 10 ↔ 16 ↔ 2 ↔ 8, prefix `0x` `0b` `0o` |
| Unix Timestamp Converter | timestamp ↔ วันเวลา, วินาทีและมิลลิวินาที |
| พ.ศ. · เลขบัตร · บาท | แปลง พ.ศ./ค.ศ., ตรวจเลขบัตร 13 หลัก, จำนวนเงินเป็นตัวอักษร (BAHTTEXT) |
| Hash Generator | SHA-1 / SHA-256 / SHA-512 ด้วย Web Crypto API |
| JWT Decoder | decode (ภาษาไทยใน payload, ตัด `Bearer ` ให้, นับถอยหลัง exp) + สร้าง JWT HS256 |
| QR Code Reader | อ่าน QR จากรูป คลิปบอร์ด หรือกล้อง, แยกฟิลด์ PromptPay / Thai QR และตรวจ CRC |

### ฐานข้อมูล
| เครื่องมือ | ทำอะไร |
|---|---|
| Java String → Clean SQL | ดึง SQL จาก String concat, `StringBuilder`, Text Block, MyBatis, JPA, `@Query`, `String.format()` · จัดรูปแบบแบบ DBeaver |
| SQL & System Catalog | 33 หัวข้อ: catalog, ฟังก์ชันที่ใช้บ่อย, หา query ที่ช้า, กับดักที่เจอบ่อย เทียบ DB2 / MariaDB · แผนผัง JOIN |
| DB2 Error Codes | 53 SQLCODE / SQLSTATE (รวม error ของ JCC driver) พร้อมสาเหตุและวิธีแก้ · แผนผังอ่านข้อความ error และ deadlock |
| LOV Query Template Browser / Editor | ดู แก้ สร้าง ลบ `*.lov.json` ในโฟลเดอร์รีโป (รายละเอียดด้านล่าง) |

### Java & Backend
| เครื่องมือ | ทำอะไร |
|---|---|
| Stack Trace Analyzer | หาต้นเหตุ บรรทัดในโค้ดของเรา และวิธีแก้ |
| Java Exceptions | 50 exception ที่เจอบ่อยใน Java / Quarkus / Hibernate / Jackson / POI พร้อมวิธีแก้ · ต้นไม้ลำดับชั้น checked / unchecked |
| Java Internals | compile vs runtime, JVM memory และ GC, annotation, transaction, virtual thread, กับดักของภาษา |
| RabbitMQ · Redis · Quarkus | concept + animation + code สำหรับมือใหม่ (Quarkus Messaging, Redis `ValueCommands` / `HashCommands`) |

### Frontend
| เครื่องมือ | ทำอะไร |
|---|---|
| Angular Lifecycle | simulator 4 สถานการณ์, hook ทุกตัวรวม afterNextRender, ลำดับ parent / child |
| RxJS Reference | 58 operator พร้อม marble diagram และ playground รันได้จริง (รวม `firstValueFrom` / `lastValueFrom`) |
| NgRx / Redux | Action, Reducer, Selector, Effect ทีละขั้น + NgRx Signals Store |
| Browser Storage APIs | localStorage, sessionStorage, IndexedDB, Cookies, Cache API, OPFS พร้อม animation |
| Color Picker | color wheel, HSL/RGB/Alpha, ดูดสีจากรูปและหน้าจอ |

### DevOps & Infra
| เครื่องมือ | ทำอะไร |
|---|---|
| Docker & K8s | ไฟล์ตัวอย่าง 32 ไฟล์อธิบายทีละบรรทัด, การ mount ไฟล์, Helm, ArgoCD, แก้ปัญหา Pod · แผนผัง Pod ค้างตรงไหน / ใครสร้าง Pod |
| Request Path | Browser → Load Balancer → Kong → Service → Pod, nginx |
| Jenkins CI/CD | Jenkinsfile ทีละบรรทัด, shared library, CD แบบ GitOps, แก้ปัญหา pipeline |
| kubectl Cheatsheet | คำสั่ง kubectl ที่ใช้บ่อย |
| K8s Secret Decoder | วาง Secret YAML / JSON แล้ว decode ทุก key, หลาย Secret (`---`) |
| CLI Cheatsheets | Docker, DB2 CLP, Maven, pnpm |
| Linux Command Cheatsheet | Ubuntu / Debian / RHEL |
| Git CLI Cheatsheet | commit, branch, rebase, stash, undo, tag / release · แผนผัง 4 พื้นที่ของ Git กับคำสั่งย้อนกลับ |
| Cron Expression Builder | อธิบายเป็นภาษาไทย + 5 รอบถัดไปตาม timezone ที่เลือก · copy เป็น Spring `@Scheduled` หรือ Quarkus `@Scheduled` (Quartz) |
| HTTP Status Code Reference | 32 status พร้อมคำอธิบาย ตัวอย่าง และชั้นที่ตอบ (แอป / Kong / nginx) |

### Claude Code
| เครื่องมือ | ทำอะไร |
|---|---|
| ESAN AI AGENT | คู่มือ plugin ออฟฟิศ 8 บิตที่แสดงทุก session ของ Claude Code บนเครื่อง ([`plugins/esan-office/README.md`](plugins/esan-office/README.md)) |
| Claude Code Patterns | วิธีใช้ Claude Code กับงานทีมแบบ Plan → Design → Build: ไฟล์งาน 5 ชิ้น, prompt แบบ RCTCF, plan mode, skill / hook, verifier และร่องรอยตรวจสอบใน git |

---

## รายละเอียดบางเครื่องมือ

### RxJS Reference + Playground
- operator ใน 7 หมวด (creation, transformation, filtering, combination, error, utility, multicasting) อธิบายภาษาไทย ใช้เมื่อไหร่ / ควรเลี่ยงเมื่อไหร่ พร้อมตัวอย่าง
- marble diagram, เทียบ Subject แต่ละแบบ, recipes
- Playground รัน RxJS จริงใน CodeMirror, ปุ่ม Try บนทุก operator, 12 preset, หยุดเองหลัง 15 วินาทีหรือ 200 บรรทัด

### Angular Lifecycle Hooks
- simulator เล่นลำดับ hook จริงใน 4 สถานการณ์ (สร้าง / เปลี่ยน `@Input` / Change Detection / Destroy)
- การ์ด hook ทุกตัว ค้นหาได้ รวมแบบใหม่ (`inject()`, `takeUntilDestroyed`, `afterNextRender`), key concepts, patterns และความผิดพลาดที่เจอบ่อย

### RabbitMQ · Redis · Quarkus
- RabbitMQ: exchange ทั้ง 4 แบบพร้อม flow diagram และ animation ของ queue
- Redis: Pub/Sub, cache-aside, session, rate limiting
- Quarkus: Messaging (`@Incoming` / `@Outgoing` / `Emitter<T>`, DLQ, `failure-strategy`) และ Redis DataSource API
  (`ValueCommands`, `HashCommands`, `KeyCommands`, named client ด้วย `@RedisClientName`)

### Browser Storage APIs
- เทียบอายุของ storage แต่ละแบบด้วย animation, playground ของ localStorage, CRUD ของ IndexedDB
- cookie แต่ละ attribute (HttpOnly / Secure / SameSite Lax vs Strict), Cache API กับ Service Worker แบบ network-first / cache-first
- ดูว่า storage ไหนโดน XSS ได้ และ decision tree ช่วยเลือก

### Claude Code Patterns
- แนวคิด AI-native SDLC: คอขวดย้ายไปขั้นที่ยังใช้คน, คนเขียนไม่อนุมัติงานตัวเอง, วงจร 3 ระดับ และ 12 play ของ Playbook
- ไฟล์งาน 5 ชิ้น (CLAUDE.md → intent.md → spec.md → plan.md → โค้ด + test) แต่ละชิ้นมีหัวข้อ, ใครอนุมัติ และ template ที่กดคัดลอกได้ พร้อม animation ห่วงโซ่ commit
- เทคนิค: prompt แบบ RCTCF, กฎควรอยู่ที่ CLAUDE.md / skill / hook, plan mode, verifier subagent, การดูแล context, โหมดสิทธิ์ และการกัน PII
- ทีม: บทบาท, trailer ท้าย commit (`Refs:` / `Accepted-by:` / `Approved-by:`), Decision Register และตัวชี้วัดจาก git

### LOV Query Browser / Editor
ดู แก้ สร้าง และลบ query-template (`*.lov.json`) ในโฟลเดอร์ของรีโปได้โดยตรง ไม่ต้องรัน `cdgs-template-designer`:
- เลือกโฟลเดอร์รีโปผ่าน File System Access API แล้วระบบหา `src/main/resources/template/query` หรือ `src/main/resources/queries` ให้เอง สิทธิ์เขียนไฟล์ขอเมื่อกดบันทึก / ลบ
- จำโฟลเดอร์ที่เคยเปิดได้ 10 โฟลเดอร์ (IndexedDB) กดชิปเพื่อสลับ เปลี่ยนชื่อได้ ปุ่มกากบาทบนชิปแค่เอาออกจากรายการ ไม่ลบไฟล์
- รองรับ LOV 2 เวอร์ชัน ตรวจจากไฟล์ในโฟลเดอร์แล้วแก้ / สร้าง / บันทึกตามรูปแบบของเวอร์ชันนั้น:

  | | `8.x` (`template/query`) | `10.1.0` (`queries`) |
  |---|---|---|
  | sort | `piority` + `auto`/`optional` | `priority` + `AUTO`/`OPTIONAL` |
  | filter | `String.Like`/`String.Equal`/`String.In` | `Like`/`Equal`/`In` |
  | ไฟล์ใหม่ | `SimpleLovContainer`, `get.foo.bar.lov.json` | `SimpleQuery` + `publicApi`/`roles`/`permissions`/`cdgsPrivilege`, `visible`, `multiple`, `getFooBar.lov.json` |
  | route | `GET <root>/query/template/<id>` | `GET <root>/template/query/<id>` (ตาม `cdgs.template.query.root-path`) |
- ประกอบ SQL จาก `select` / `from` / `where.main` / `groupByAndHaving` + `DISTINCT` และ `ORDER BY` ของ sort ที่เป็น `auto`/`AUTO` เรียงแบบเดียวกับ backend
- `where.alternate` แต่ละตัวแสดงเป็น `alternates=<ชื่อ>` พร้อม parameter ที่ต้องส่งและตัวอย่าง request
- editor แก้ได้ทุกส่วน พร้อม preview SQL / JSON สด, ดึง parameter (`:name`) จาก SQL ให้, วาง SQL แล้วแปลงเป็น LOV ได้
- บันทึกรูปแบบเดียวกับ designer (Jackson pretty print, CRLF) ไฟล์ที่ไม่ได้แก้ได้ byte เดิม, ตรวจ id / ชื่อไฟล์ซ้ำ, เตือนถ้าไฟล์ถูกแก้จากที่อื่น
- `Ctrl + S` / `Ctrl + Enter` บันทึก, เตือนก่อนออกถ้ายังไม่บันทึก
- ใช้ได้เฉพาะ Chrome / Edge

---

## วิธีใช้งาน

### Online
เข้าใช้งานได้ทันทีที่ [devgreenpink.github.io/dev-utility-toolkit](https://devgreenpink.github.io/dev-utility-toolkit/)

### Local
```bash
git clone https://github.com/devgreenpink/dev-utility-toolkit
cd dev-utility-toolkit
python -m http.server 8080
```
แล้วเปิด `http://localhost:8080` (หรือใช้ VS Code Live Server) ต้องเปิดผ่าน web server เพราะเครื่องมือขนาดใหญ่ 6 ตัว (MQ, Storage, RxJS, Angular, ESAN AI AGENT, Claude Code Patterns) โหลดแยกจาก `assets/tabs/` ซึ่งเปิดตรงจากไฟล์ (`file://`) ไม่ได้

### ติดตั้งเป็นแอป (PWA)
- **Chrome / Edge**: กดไอคอนติดตั้งในแถบ URL
- **Safari (iOS)**: Share → Add to Home Screen

Service Worker ดึงไฟล์ของแอปจากเน็ตก่อนเสมอ (network-first) เลยได้เวอร์ชันใหม่ทันทีที่ออก และใช้ไฟล์ที่เก็บไว้เมื่อไม่มีเน็ต library จาก CDN เก็บไว้ถาวร (ระบุเวอร์ชันใน URL) หลังเปิดออนไลน์ครั้งแรก ทุกเครื่องมือจึงใช้ offline ได้

---

## คีย์ลัด

| คีย์ | ทำอะไร |
|---|---|
| `Ctrl + Enter` | รันเครื่องมือที่เปิดอยู่ / รัน RxJS Playground |
| `Ctrl + K` (`⌘K` บน Mac) | ค้นหาเครื่องมือและคำสั่ง หรือวางข้อความเพื่อเปิดเครื่องมือที่ใช่ |
| `Esc` | ปิด palette / popover / เมนู |
| `Ctrl + /` | comment บรรทัด (RxJS Playground) |

ดูได้ในแอปที่ ตั้งค่า → คีย์ลัด

---

## ตั้งค่า

กดปุ่มเฟืองบน header ค่าทั้งหมดเก็บใน `localStorage` ของเบราว์เซอร์นี้:

- **ลักษณะ** สว่าง / มืด / อัตโนมัติ
- **สีเน้น** 8 สี หรือกำหนดเอง ระบบปรับเฉดให้ตัวอักษรและปุ่มผ่าน contrast 4.5:1 เอง
- **ธีมพิเศษ** Matrix, Nord, Dracula (ค่าเริ่มต้น), Kitty
- **ขนาดตัวอักษร** เล็ก / ปกติ / ใหญ่ / ใหญ่มาก (ทั้งหน้า รวม sidebar ขยายตาม)
- **ฟอนต์** ค่าเริ่มต้น (ตัวอักษรระบบ + IBM Plex Sans Thai), IBM Plex Sans Thai, Noto Sans Thai + Inter
- **เอฟเฟกต์และแอนิเมชัน** เปิดเป็นค่าเริ่มต้น ปิดได้ถ้าไม่ชอบการเคลื่อนไหว
- **จำข้อมูลที่กรอกไว้** เปิด / ปิด และปุ่มล้างข้อมูลที่จำไว้

สีทุกตัวมาจาก CSS token ชุดเดียว ตัวอักษร ≥ 4.5:1 และขอบช่องกรอก / ปุ่ม ≥ 3:1 ทั้งโหมดสว่างและมืด

---

## Privacy

- ข้อมูลที่กรอกประมวลผลในเบราว์เซอร์เท่านั้น ไม่ส่งไปที่ไหน
- สิ่งที่โหลดจากภายนอกมีแค่ไฟล์ library (cdnjs, jsDelivr สำหรับ jsQR) และฟอนต์ (Google Fonts) ไม่มีข้อมูลของคุณติดไปด้วย
- ไม่มี analytics / tracking / cookie
- ข้อมูลที่จำไว้อยู่ใน `localStorage` ของเครื่องนี้ ไม่จำ JWT และ Secret
- ลิงก์แชร์เก็บข้อมูลไว้หลัง `#` ของ URL ซึ่งเบราว์เซอร์ไม่ส่งไป server และไม่ใส่ JWT / secret
- กล้องของ QR Code Reader อ่านภาพในเครื่อง ไม่อัปโหลด

---

## Tech Stack

```
HTML + CSS + Vanilla JavaScript (no build step, no framework)
├── Web Crypto API         Hash (SHA-1/256/512), UUID v4, JWT HS256
├── Canvas / EyeDropper    Color Picker, ดูดสีจากรูปและหน้าจอ
├── BarcodeDetector        QR Code Reader (ใช้ jsQR 1.4.0 แทนเมื่อเบราว์เซอร์ไม่มี)
├── File System Access API LOV Query Browser: อ่าน / เขียนโฟลเดอร์ (Chromium)
├── IndexedDB              LOV Query Browser: จำโฟลเดอร์ที่เคยเปิด
├── Service Worker         PWA, network-first + เก็บ library จาก CDN ไว้ใช้ offline
├── jsdiff 5.1.0           เปรียบเทียบข้อความ / JSON (CDN)
├── RxJS 7.8.1             RxJS Playground (CDN)
├── CodeMirror 5.65.16     editor ของ RxJS Playground (CDN)
├── highlight.js 11.9.0    highlight code (CDN)
├── Lucide                 ไอคอน (SVG sprite ในหน้า)
└── Google Fonts           IBM Plex Sans Thai, JetBrains Mono (+ Noto Sans Thai / Inter เมื่อเลือก)
```

---

## พัฒนา

```bash
node tests/tools.test.mjs
```
ทดสอบ parser และตัวแปลงต่างๆ (BAHTTEXT, เลขบัตร, JSON → Type, Properties ↔ YAML, stack trace, smart paste, curl / HAR / XML,
PromptPay QR, cron) และข้อมูลของแผนผัง (ทุกชิ้นที่ผูกการ์ดต้องหาการ์ดเจอ, ทุก exception ที่มีการ์ดต้องอยู่ในต้นไม้) ไม่ต้องติดตั้งอะไร

```bash
cd tests/e2e
npm ci
npx playwright install chromium
node run.mjs
```
ทดสอบในเบราว์เซอร์จริง (Playwright + axe-core): เปิดทุกเครื่องมือไม่มี error, WCAG 2.2 AA ทุกหน้าทั้งธีมเริ่มต้น (Dracula) โหมดสว่าง มืด และจอมือถือ, ไม่ล้นจอที่ 375px, smart paste, จำข้อมูล, ลิงก์แชร์, ลากไฟล์, ส่งต่อ / ประวัติ, QR และ offline

GitHub Actions รันทั้งสองชุดทุก push และ pull request ส่วน push เข้า `main` จะ deploy ขึ้น GitHub Pages และสร้าง release ตามเลขเวอร์ชันใน `index.html` เอง

---

## License

MIT — ใช้ได้เลย แก้ได้เลย ไม่ต้องขออนุญาต
