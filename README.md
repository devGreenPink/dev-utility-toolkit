# 🛠️ อีสาน DevTools

> **Developer toolkit สำหรับนักพัฒนาไทย** — ใช้งานได้ทันทีในเบราว์เซอร์ ไม่ต้องติดตั้ง ไม่ส่งข้อมูลออกไปไหน

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366f1?style=flat-square&logo=github)](https://devgreenpink.github.io/dev-utility-toolkit/)
[![Single File](https://img.shields.io/badge/Single-HTML%20File-22d3ee?style=flat-square)](./index.html)
[![No Dependencies](https://img.shields.io/badge/No-Backend%20Required-34d399?style=flat-square)]()
[![PWA](https://img.shields.io/badge/PWA-Installable-f472b6?style=flat-square)]()

---

## ✨ Features

เครื่องมือ 15 อย่างในไฟล์ HTML เดียว ทำงานได้ทั้งหมดบน client-side (browser) ไม่มี server ไม่มี API ไม่มี tracking

### 🎲 Mock Data Generator
สร้างข้อมูลจำลองสำหรับทดสอบระบบ รองรับข้อมูลไทย:
- **บัตรประชาชน 13 หลัก** พร้อม checksum ที่ถูกต้อง
- **ชื่อ-นามสกุลภาษาไทย** จากฐานข้อมูลชื่อจริง
- **เบอร์โทรมือถือไทย** format ถูกต้อง (081-xxx-xxxx)
- **อีเมล** รูปแบบภาษาอังกฤษ
- **UUID v4** จาก `crypto.randomUUID()`
- **Bulk Export** เป็น JSON Array ได้สูงสุด 500 records

### 📜 SQL Parser (Java → Clean SQL)
แยก SQL ออกจาก Java source code โดยรองรับ:
- `String` concat ด้วย `+`
- `StringBuilder` / `StringBuffer.append()`
- **Text Block** `"""..."""` (Java 15+)
- **MyBatis** `#{}` และ **JPA** `:param`
- Plain SQL
- ตรวจจับ mode อัตโนมัติ พร้อม format SQL output ให้อ่านง่าย

### 🔍 Text / JSON Diff
เปรียบเทียบข้อความหรือ JSON สองชุด:
- **Char-level diff** — เห็นทุก character ที่เปลี่ยน
- **Line-level diff** — เหมือน `git diff`
- Auto-detect และ pretty-print JSON ก่อน diff
- แสดงสถิติ +added / -removed

### 📦 JSON Tools
- **3 โหมด**: Editor / Tree View / Split (editor + tree แบบ side-by-side)
- **Tree View แบบ collapsible** พร้อม copy แต่ละ node
- **Live mode** — prettify อัตโนมัติขณะพิมพ์
- **JSONPath Query** — `$.users[0].name`, `$.items[*].price`
- Prettify (2/4 spaces) และ Minify

### 🕒 Unix Timestamp Converter
แปลง Unix timestamp ↔ วันเวลาภาษาไทย รองรับทั้ง seconds และ milliseconds

### 🔐 Base64 Encode / Decode
- รองรับ **UTF-8 และภาษาไทย**
- **URL-safe** mode (แทนที่ `+→-` `/→_`)
- No-padding option

### 🔗 URL Encode / Decode
- `encodeURIComponent` — แนะนำสำหรับ query string
- `encodeURI` — เก็บ `/ ? # &` ไว้
- รองรับ Unicode และภาษาไทย

### 🔑 Hash Generator
คำนวณ hash บน client-side ล้วน ไม่ส่งข้อมูลออก:
- **SHA-1**, **SHA-256**, **SHA-512**
- Toggle UPPERCASE / lowercase
- แสดง input size (bytes / chars)

### 🪪 JWT Decoder
Decode JWT token แบบ client-side:
- รองรับ **Unicode / ภาษาไทยใน payload**
- Strip `Bearer ` prefix อัตโนมัติ
- แสดง `exp`, `iat`, `nbf`, `sub`, `iss`, `aud` พร้อม countdown
- แสดงขนาด token (bytes)
- **ไม่มีการ verify signature** — display only

### ⏰ Cron Expression Builder
- **Builder แบบ dropdown** — เลือกทีละ field
- **Manual input** — พิมพ์ expression เองได้
- **7 presets** ที่ใช้บ่อย
- แปลงเป็นภาษาไทยอธิบาย expression
- **Next 5 Runs** — แสดงเวลา trigger ถัดไปพร้อม countdown
- **Timezone selector** — Asia/Bangkok, UTC, Tokyo และอื่นๆ
- Copy เป็น `@Scheduled` (Spring) หรือ Quartz format

### 🔎 Regex Tester
- **Real-time highlight** matches ใน test input
- แสดง **capture groups** ทุก group
- **7 preset patterns** — Email, URL, เบอร์ไทย, บัตรประชาชน, ISO Date, Jira Key
- นับจำนวน matches

### 🎨 Color Picker
- **SV Square** สไตล์ Figma/VS Code — ลากเลือก Saturation × Brightness
- **Hue slider** สายรุ้งเต็ม 360°
- **Alpha slider** พร้อม checkerboard
- **12 Preset swatches** สีที่ใช้บ่อย
- Copy: `#HEX`, `rgb()`, `hsl()`, `rgba()`, CSS variable
- Opacity variants (0.25 / 0.5 / 0.75 / 0.9)
- รองรับ mouse drag และ touch

### 🌐 HTTP Status Code Reference
- ครบทุก code **100–511** รวม 55 codes
- คำอธิบาย + ตัวอย่างกรณีที่เกิดขึ้นจริง **ภาษาไทย**
- กรองตาม group (1xx / 2xx / 3xx / 4xx / 5xx)
- Search ได้ทั้งตัวเลข ชื่อ และคำอธิบาย

### ☸️ kubectl Cheatsheet
คำสั่ง kubectl ที่ใช้บ่อยกว่า 45 คำสั่ง พร้อมคำอธิบายภาษาไทย:
- Pod, Logs, Exec/Debug, Deployment, Service/Ingress
- ConfigMap/Secret, Namespace, Node/Cluster
- Apply/Manage, Context/Config

### 🐧 Linux Command Cheatsheet
คำสั่ง Linux กว่า 100 คำสั่ง พร้อมคำอธิบายภาษาไทย:
- File System, View Files, Search & Text Processing
- Process, System Info, Network, Permission
- Archive, Package (apt), Service (systemd), Pipe & Redirect

---

## 🚀 วิธีใช้งาน

### เปิดใช้งานทันที
```
เพียงดาวน์โหลด index.html แล้วเปิดในเบราว์เซอร์
```

### GitHub Pages (แนะนำ)
1. Fork หรือ clone repo นี้
2. ไปที่ **Settings → Pages**
3. เลือก Source: `Deploy from a branch → main`
4. เข้าใช้งานที่ `https://username.github.io/isaan-devtools/`

### ติดตั้งเป็น Desktop App (PWA)
เมื่อเปิดผ่าน HTTPS (เช่น GitHub Pages) จะมีปุ่ม **Install** ปรากฏขึ้น:
- **Chrome / Edge**: คลิกไอคอน ⊕ ในแถบ URL หรือเมนู ⋮ → Install
- **Safari (iOS)**: Share → Add to Home Screen

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Run tool ปัจจุบัน |
| `Ctrl + K` | Focus search (kubectl / Linux tab) |

---

## 🎨 Themes

5 themes ให้เลือก บันทึกใน `localStorage` อัตโนมัติ:

| Theme | สี accent |
|---|---|
| **Indigo** (default) | #6366f1 |
| **Matrix** | #00ff41 |
| **Nord** | #88c0d0 |
| **Dracula** | #bd93f9 |
| **☀️ Light** | สีอ่อน |

---

## 🔒 Privacy

ข้อมูลทุกอย่างประมวลผลในเบราว์เซอร์ล้วน:
- ✅ ไม่มี server
- ✅ ไม่มี API calls (ยกเว้น Google Fonts)
- ✅ ไม่มี analytics / tracking
- ✅ ไม่มี cookies
- ✅ ใช้งาน offline ได้ (หลังติดตั้งเป็น PWA)

---

## 🏗️ Tech Stack

```
HTML + CSS + Vanilla JavaScript
└── jsdiff 5.1.0  (Text/JSON diff)
└── Google Fonts  (IBM Plex Sans Thai, JetBrains Mono)
└── Web Crypto API  (Hash, UUID)
└── Canvas API  (Color Wheel)
```

ไม่มี build step ไม่มี npm ไม่มี framework — แก้ไขและ deploy ได้ทันที

---

## 📄 License

MIT — ใช้ได้เลย แก้ได้เลย ไม่ต้องขออนุญาต
