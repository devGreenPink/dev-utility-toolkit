# อีสาน DevTools

> **Developer toolkit สำหรับนักพัฒนาไทย** — ใช้งานได้ทันทีในเบราว์เซอร์ ไม่ต้องติดตั้ง ไม่ส่งข้อมูลออกไปไหน

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366f1?style=flat-square&logo=github)](https://devgreenpink.github.io/dev-utility-toolkit/)
[![PWA](https://img.shields.io/badge/PWA-Installable-f472b6?style=flat-square)]()
[![No Dependencies](https://img.shields.io/badge/No-Backend%20Required-34d399?style=flat-square)]()
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-22d3ee?style=flat-square)]()

---

## ✨ Features

เครื่องมือ 18 อย่าง ทำงานได้ทั้งหมดบน client-side ไม่มี server ไม่มี API ไม่มี tracking

### 🎲 Mock Data Generator
สร้างข้อมูลจำลองสำหรับทดสอบระบบ รองรับข้อมูลไทย:
- **บัตรประชาชน 13 หลัก** พร้อม checksum ที่ถูกต้อง
- **ชื่อ-นามสกุลภาษาไทย** + **เพศ** + **วันเกิด / อายุ** (พ.ศ.)
- **เบอร์โทรมือถือไทย** format ถูกต้อง (081-xxx-xxxx) + อีเมล
- **จังหวัด + รหัสไปรษณีย์** (30 จังหวัด)
- **ชื่อบริษัทไทย + เลขนิติบุคคล** + ตำแหน่งงาน + เงินเดือน
- **เลขบัตรเครดิต Luhn-valid** (Visa / Mastercard — test only)
- **UUID v4** จาก `crypto.randomUUID()`
- **Bulk Export** เป็น JSON Array ได้สูงสุด 500 records

### 📜 SQL Parser (Java → Clean SQL)
แยก SQL ออกจาก Java source code รองรับ **8 modes**:
- `String` concat `+`, `StringBuilder.append()`, Text Block `"""..."""`
- **MyBatis** `#{}`, **JPA** `:param`, `@Query`, `String.format()`, MyBatis XML
- ตรวจจับ mode อัตโนมัติ, format แบบ **DBeaver-style**, highlight สีตาม table alias
- รองรับ **หลาย SQL ต่อชุด** — แยก card, copy แยกได้ทีละชุด

### 🔍 Text / JSON Diff
- Char-level diff และ Line-level diff (เหมือน `git diff`)
- Auto-detect และ pretty-print JSON ก่อน diff
- แสดงสถิติ +added / -removed

### 📦 JSON Tools
- **3 โหมด**: Editor / Tree View / Split
- **Tree View** แบบ collapsible พร้อม copy แต่ละ node
- **JSONPath Query** — `$.users[0].name`, `$.items[*].price`
- Prettify (2/4 spaces) และ Minify

### 🕒 Unix Timestamp Converter
แปลง Unix timestamp ↔ วันเวลา รองรับทั้ง seconds และ milliseconds

### 🔐 Base64 Encode / Decode
- รองรับ UTF-8 และภาษาไทย
- URL-safe mode, No-padding option

### 🔗 URL Encode / Decode
- `encodeURIComponent` และ `encodeURI`
- รองรับ Unicode และภาษาไทย

### 🔢 Number Base Converter
แปลงเลขฐานแบบ real-time:
- **Decimal ↔ Hex ↔ Binary ↔ Octal** — ป้อนได้ทุก field
- รองรับ prefix `0x`, `0b`, `0o`
- Bit-width reference card: 8-bit, 16-bit, 32-bit, 64-bit ที่ใช้บ่อย

### 🔑 Hash Generator
คำนวณ hash บน client-side ล้วน:
- **SHA-1**, **SHA-256**, **SHA-512** ผ่าน Web Crypto API
- Toggle UPPERCASE / lowercase, แสดง input size

### 🪪 JWT Decoder + Encoder
- **Decode** — Unicode/ภาษาไทยใน payload, strip `Bearer ` อัตโนมัติ, แสดง exp countdown
- **Encode HS256** — สร้าง JWT จาก JSON payload + secret key บน client-side
- ไม่ verify signature ฝั่ง decode (display only)

### ⏰ Cron Expression Builder
- Builder แบบ dropdown + manual input + 7 presets
- แปลงเป็นภาษาไทย, Next 5 Runs พร้อม countdown
- Copy เป็น `@Scheduled` (Spring) หรือ Quartz format

### 🔎 Regex Tester
- Real-time highlight matches, capture groups, นับจำนวน matches
- 7 preset patterns — Email, URL, เบอร์ไทย, บัตรประชาชน, ISO Date, Jira Key

### 🎨 Color Picker
- **Layout 2 คอลัมน์** บน desktop — Color Picker ซ้าย, Image Color Picker ขวา
- SV Square เต็มความกว้าง + Hue/Alpha sliders
- **RGB/HSL mode toggle** สลับ channel inputs ทันที
- Copy: `#HEX`, `rgb()`, `hsl()`, `rgba()`, CSS variable
- Opacity variants (0.25 / 0.5 / 0.75 / 0.9), 12 preset swatches
- รองรับ mouse drag และ touch

### 🌐 HTTP Status Code Reference
- ครบทุก code 100–511 รวม 55 codes
- คำอธิบาย + ตัวอย่าง **ภาษาไทย**, กรองตาม group, search ได้

### ☸️ kubectl Cheatsheet
คำสั่ง kubectl 45+ คำสั่ง พร้อมคำอธิบายภาษาไทย

### 🐧 Linux Command Cheatsheet
คำสั่ง Linux 100+ คำสั่ง พร้อมคำอธิบายภาษาไทย

### ⚡ RxJS Reference
- **Operator Explorer** — 57 operators ใน 7 หมวด, search + กรองตาม category
- คำอธิบายภาษาไทย, ตัวอย่าง code, quick-search use case tags
- Marble diagram แบบ visual, เปรียบเทียบ Subject types, Recipes

### 🔄 Angular Lifecycle Hooks
- **Interactive Simulator** — animate hooks ที่ fire ตามลำดับจริงสำหรับ 4 scenarios (สร้าง / เปลี่ยน @Input / CD Cycle / Destroy)
- Timeline แบบ vertical คลิกแต่ละ hook เพื่อดูรายละเอียดทันที
- Hook Reference cards 9 hooks — ค้นหาได้, phase badge, คำอธิบาย + ✓ใช้เมื่อ + ✗หลีกเลี่ยง + code
- Key Concepts (Change Detection, Content vs View, @Input), Common Patterns, Common Mistakes

---

## 🚀 วิธีใช้งาน

### Online (แนะนำ)
เข้าใช้งานได้ทันทีที่ [devgreenpink.github.io/dev-utility-toolkit](https://devgreenpink.github.io/dev-utility-toolkit/)

### Local / Offline
```bash
git clone https://github.com/devgreenpink/dev-utility-toolkit
# เปิด index.html ในเบราว์เซอร์ หรือใช้ VS Code Live Server
```

### ติดตั้งเป็น Desktop App (PWA)
เมื่อเปิดผ่าน HTTPS จะมีปุ่ม Install ปรากฏขึ้น:
- **Chrome / Edge**: คลิกไอคอน ⊕ ในแถบ URL
- **Safari (iOS)**: Share → Add to Home Screen
- ใช้งาน **offline** ได้หลังติดตั้ง (Service Worker cache-first)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Run tool ปัจจุบัน (รองรับทุก tab ที่มี action) |
| `Ctrl + K` | Focus search (kubectl / Linux / Git tab) |

กด **⌨** (ปุ่มขวาบน) เพื่อดู shortcut ทั้งหมดได้ตลอดเวลา

---

## 🎨 Themes

6 themes ให้เลือก บันทึกใน `localStorage`:

| Theme | Accent |
|---|---|
| **Indigo** (default) | `#6366f1` |
| **Matrix** | `#00ff41` |
| **Nord** | `#88c0d0` |
| **Dracula** | `#bd93f9` |
| **Light** | สีอ่อน |
| **Kitty** 🐱 | ชมพู pastel `#e8549a` + ลาเวนเดอร์ |

---

## 🔒 Privacy

ข้อมูลทุกอย่างประมวลผลในเบราว์เซอร์ล้วน:
- ไม่มี server, ไม่มี API calls (ยกเว้น Google Fonts)
- ไม่มี analytics / tracking / cookies
- ใช้งาน offline ได้หลังติดตั้งเป็น PWA

---

## 🏗️ Tech Stack

```
HTML + CSS + Vanilla JavaScript (no build step, no npm, no framework)
├── Web Crypto API   — Hash (SHA-1/256/512), UUID v4, JWT HS256
├── Canvas API       — Color Picker SV square, hue/alpha sliders
├── Service Worker   — PWA offline (cache-first)
├── jsdiff 5.1.0     — Text/JSON diff (CDN)
└── Google Fonts     — IBM Plex Sans Thai, JetBrains Mono
```

---

## 📄 License

MIT — ใช้ได้เลย แก้ได้เลย ไม่ต้องขออนุญาต
