# ESAN AI AGENT (plugin `esan-office`)

![ESAN AI AGENT](office/icon-192.png)

ออฟฟิศ 8 บิตที่แสดงสถานะ Claude Code ทุก session บนเครื่องคุณแบบสด และสั่งงาน agent ประจำออฟฟิศได้จากหน้าเว็บ
1 session = agent 1 ตัว มีงานก็เดินไปนั่งโต๊ะคอม ว่างก็ไปพักที่มุมพัก เล่นโป๊กเกอร์ หรือขึ้นเวทีมวย

- **โหมดดู:** session ที่คุณเปิดเองใน terminal หรือแอปจะโผล่ในออฟฟิศเอง ไม่กิน token
- **โหมดสั่งงาน:** สร้าง agent ประจำออฟฟิศ ตั้งหน้าที่ โฟลเดอร์ และคำสั่งประจำตัว แล้วพิมพ์งาน ส่ง และกดอนุญาตได้จากหน้าเว็บ ทุกงานกิน token จริง
- **2 ธีม:** อีสาน (ESAN AI AGENT ใช้คำอีสาน) และ CDG (CDG AI AGENT ใช้ภาษากลาง)
- **ติดตั้งเป็นแอปได้** แบบ PWA เหมือน อีสาน DevTools
- **ข้อมูลอยู่ในเครื่องเท่านั้น** bridge ฟังที่ `127.0.0.1:4567` ไม่ส่งข้อมูลออกไปที่ไหน

---

## ติดตั้ง

### สิ่งที่ต้องมี

| อย่าง | เวอร์ชัน | หมายเหตุ |
|---|---|---|
| Node.js | 18 ขึ้นไป | ใช้รัน bridge (`node --version`) |
| Claude Code | ทดสอบกับ 2.1.206 | ต้องมีคำสั่ง `claude` อยู่ใน PATH ถ้าจะใช้โหมดสั่งงาน |
| Chrome หรือ Edge | ล่าสุด | ใช้ติดตั้งเป็นแอป (เบราว์เซอร์อื่นเปิดดูได้ปกติ) |

### ติดตั้ง plugin

```bash
claude plugin marketplace add devgreenpink/dev-utility-toolkit
claude plugin install esan-office@esan-devtools
```

เปิด Claude Code ตามปกติ พอเริ่ม session ใหม่ bridge จะเปิดเองเบื้องหลัง แล้วเข้า <http://localhost:4567>

### ลองก่อนติดตั้ง หรือติดตั้งจากโฟลเดอร์ในเครื่อง

```bash
# โหลด plugin เฉพาะ session นี้ ไม่แตะการตั้งค่าอะไร
claude --plugin-dir ./plugins/esan-office

# ติดตั้งถาวรจากโฟลเดอร์ repo โดยยังไม่ต้อง push ขึ้น GitHub
claude plugin marketplace add E:/path/to/dev-utility-toolkit
claude plugin install esan-office@esan-devtools
```

แอป desktop ของ Claude ส่ง `--plugin-dir` ไม่ได้ ถ้าจะใช้กับแท็บ Code ในแอปต้องติดตั้งถาวร

### ติดตั้งเป็นแอป (PWA)

เปิด <http://localhost:4567> ใน Chrome หรือ Edge แล้วกด **ติดตั้งเป็นแอป** ในหัวข้อ "วิธีติดตั้ง" หรือไอคอนติดตั้งท้ายแถบที่อยู่
จะได้ไอคอนบนเดสก์ท็อปและเปิดเป็นหน้าต่างของตัวเอง ถ้า bridge ยังไม่เปิด แอปก็ยังเปิดได้และจะต่อใหม่เองเมื่อ bridge กลับมา
ชื่อแอปตอนติดตั้งเป็น "ESAN AI AGENT" เสมอ (manifest มีชื่อเดียว) แต่หัวข้อในหน้าเปลี่ยนตามธีม

### (ไม่บังคับ) context กับโควตาแบบตัวเลขจริง

ถ้าไม่ตั้ง แถบ context จะเป็นค่าประมาณจากไฟล์ transcript (มี ≈ ข้างหน้า) และจอโควตาบนผนังจะว่าง
plugin ตั้ง status line ให้เองไม่ได้ ให้เพิ่มใน `~/.claude/settings.json`:

```json
{
  "statusLine": { "type": "command", "command": "node \"<โฟลเดอร์ plugin>/scripts/statusline.js\"" }
}
```

- โควตา 5 ชั่วโมงมีเฉพาะแพ็กเกจ Pro/Max
- status line แบบกำหนดเองจะซ่อนข้อความช่วยเหลือท้ายจอของ Claude Code เช่น `esc to interrupt`
- ถ้าย้ายโฟลเดอร์ plugin ต้องแก้ path ตามด้วย

### (ไม่บังคับ) ดูจากมือถือ

รัน bridge ด้วย `ESAN_OFFICE_LAN=1` แล้วเปิด `http://<IP ของคอม>:4567` บนมือถือที่อยู่ Wi-Fi เดียวกัน
มือถือดูได้อย่างเดียว สั่งงานและกดอนุญาตไม่ได้ และติดตั้งเป็นแอปไม่ได้เพราะไม่ใช่ https

---

## วิธีใช้งาน

### ดู session ที่เปิดเอง

เปิด Claude Code ใน terminal หรือแอปตามปกติ agent จะเดินเข้าประตูมาเอง พิมพ์งานในหน้าต่าง Claude Code แล้วดูความคืบหน้าในออฟฟิศ
ถ้ากล่องเหนือหัวเป็นสีเหลือง ให้กดอนุญาตในหน้าต่าง Claude Code (ออฟฟิศไม่ตอบแทนคุณ)

### สั่งงาน agent ประจำออฟฟิศครั้งแรก

1. **สร้าง agent:** กด **เพิ่ม agent** เลือกหน้าที่สำเร็จรูป (Frontend, Backend, QA, Reviewer, DevOps, Database, Security, Docs, Research, Planner) ตั้งชื่อ ใส่โฟลเดอร์ทำงานเป็น path เต็ม เลือกเครื่องมือที่ใช้ได้โดยไม่ต้องขออนุญาต โหมดเมื่อต้องใช้เครื่องมือนอกรายการ และโมเดล แล้วกด **สร้าง agent**
2. **ส่งงาน:** แตะตัว agent ในห้อง หรือกด **สั่งงาน** ที่การ์ด พิมพ์งาน แล้วกด **ส่งงาน** (Ctrl+Enter) ถ้ากำลังทำงานอื่นอยู่ งานใหม่จะต่อคิว
3. **กดอนุญาต:** ถ้า agent จะใช้เครื่องมือนอกรายการ จะมีปุ่มเหลือง **มีคำขออนุญาต** ขึ้นด้านบน เปิดดู path หรือคำสั่งเต็ม แล้วกดอนุญาตหรือไม่อนุญาต ไม่มีใครกดภายใน 4 นาทีจะปฏิเสธเอง
4. **ดูผล:** ทำเสร็จ agent จะไปพัก เปิดแผงเพื่อดูคำตอบล่าสุด เหตุการณ์ ค่าใช้จ่ายโดยประมาณ และ context สั่งงานต่อได้เลย agent จำบทสนทนาเดิม

### ปุ่มในแผงของ agent

| ปุ่ม | ทำอะไร |
|---|---|
| ส่งงาน | ส่งงานให้ agent ตัวนี้ ถ้าทำงานอยู่จะต่อคิว |
| หยุด | ตัดงานที่ทำอยู่และล้างคิวของตัวนี้ |
| อนุญาต / ไม่อนุญาต | ตอบคำขอใช้เครื่องมือที่เก่าที่สุดก่อน ถ้ามีหลายรายการจะบอกว่ารออีกกี่รายการ |
| ตั้งค่า agent ตัวนี้ → บันทึก | แก้ชื่อ หน้าที่ โฟลเดอร์ คำสั่งประจำตัว เครื่องมือ โหมด หรือโมเดล มีผลกับงานถัดไป |
| เริ่มบทสนทนาใหม่ | ให้ agent ลืมบทสนทนาเก่า งานถัดไปเริ่ม session ใหม่ |
| ลบ agent | ต้องกด 2 ครั้ง ลบแล้วกู้ไม่ได้ (บทสนทนาเดิมยังอยู่ใน Claude Code) |

### อ่านสัญลักษณ์ในห้อง

| เห็นอะไร | แปลว่า |
|---|---|
| agent นั่งโต๊ะ จอสว่างมีโค้ดวิ่ง | กำลังทำงาน |
| กล่องเหนือหัว | ชื่อเครื่องมือที่กำลังใช้ เช่น Edit, Bash |
| กล่องขอบเหลือง "รออนุญาต" | รอให้คุณกดอนุญาต |
| แถบบนหัว | context ที่เหลือ ฟ้า/เขียวเกินครึ่ง เหลือง 25–50% แดงใกล้หมด |
| จอบนผนัง | โควตา 5 ชม. ที่ใช้ไป และจำนวนที่กำลังทำงาน |
| agent หมวกฟ้า | subagent ที่ถูกเรียกมาช่วยงาน |
| มุมพัก โป๊กเกอร์ สนามมวย | agent ว่าง เลือกไปเล่นเอง |
| ยืนทำงานในมุมพัก | โต๊ะ 12 ตัวเต็ม |
| "หลับอยู่" | session เงียบเกิน 1 ชั่วโมง |

### ธีม

กดเลือก **อีสาน** หรือ **CDG** ที่มุมขวาบน ระบบจำธีมที่เลือกไว้ในเบราว์เซอร์
เปิดธีมที่ต้องการจากลิงก์ได้ด้วย `?theme=isan` หรือ `?theme=green` เช่น <http://localhost:4567/?theme=green>

| | อีสาน | CDG |
|---|---|---|
| หัวข้อ | ESAN AI AGENT | CDG AI AGENT |
| ภาษา | คำอีสาน เช่น เฮ็ดเวียก ย่างไปโต๊ะ | ภาษากลาง |
| ห้อง | พื้นไม้ พรมผ้าขาวม้า ร้านส้มตำ โอ่งน้ำ เสื่อ แคน พิณ ผีตาโขน หน้าต่างทุ่งนา | พื้นกระเบื้อง บาร์น้ำ โซฟา ป้าย CDG บนผนัง |

---

## ตั้งค่า

### ตัวแปร environment ของ bridge

| ตัวแปร | ค่าเริ่มต้น | ใช้ทำอะไร |
|---|---|---|
| `ESAN_OFFICE_PORT` | `4567` | port ของ bridge (hook ของ plugin ยังส่งไป 4567 ถ้าเปลี่ยนต้องแก้ `hooks/hooks.json`) |
| `ESAN_OFFICE_LAN` | ปิด | `1` = ให้เครื่องอื่นใน Wi-Fi เปิดดูได้ (ดูอย่างเดียว) |
| `ESAN_OFFICE_MAX` | `3` | จำนวน agent ประจำออฟฟิศที่ทำงานพร้อมกันได้ |
| `ESAN_OFFICE_DATA` | `~/.esan-office` | โฟลเดอร์เก็บข้อมูล |
| `ESAN_OFFICE_PERM_WAIT_MS` | `240000` | รอคำตอบคำขออนุญาตนานเท่าไรก่อนปฏิเสธเอง |
| `ESAN_CLAUDE_BIN` | `claude` | path ของโปรแกรม claude ถ้าไม่ได้อยู่ใน PATH |
| `ESAN_OFFICE_PLUGIN_DIR` | ว่าง | ใช้ตอนทดสอบเท่านั้น: โหลด plugin เข้าไปในงานของ agent ประจำออฟฟิศ |

### หน้าที่ของ session ที่เปิดเอง (`roles.json`)

สร้าง `~/.esan-office/roles.json` เพื่อให้ session ที่เปิดในโฟลเดอร์นั้นขึ้นป้ายหน้าที่ (path ที่ยาวที่สุดที่ตรงกันชนะ):

```json
{ "D:/work/shop-ui": "Frontend", "D:/work/shop-api": "Backend" }
```

### ไฟล์ในโฟลเดอร์ข้อมูล

| ไฟล์ | เก็บอะไร |
|---|---|
| `agents.json` | agent ประจำออฟฟิศทั้งหมด: ชื่อ หน้าที่ โฟลเดอร์ คำสั่งประจำตัว เครื่องมือ โหมด โมเดล session id |
| `agents/<id>/settings.json` | hook เฉพาะงานของ agent ตัวนั้น (ใช้พักคำขออนุญาต) |
| `agents/<id>/system-prompt.md` | คำสั่งประจำตัวที่ต่อท้าย system prompt |
| `token` | รหัสที่ใช้สั่งงาน ฝังในหน้าเว็บเฉพาะที่เปิดจากเครื่องนี้ |
| `roles.json` | (ถ้ามี) ป้ายหน้าที่ของ session ที่เปิดเอง |
| `bridge.log` | log ของ bridge |

---

## ทำงานยังไง

```
Claude Code (session ที่คุณเปิดเอง)
   │  hook SessionStart → scripts/start.js เปิด bridge ถ้ายังไม่เปิด แล้วส่งเหตุการณ์ต่อ
   │  hook อื่น ๆ → http://127.0.0.1:4567/hook (timeout 2 วินาที)
   │  statusline (ถ้าตั้ง) → /status
   ▼
scripts/bridge.js ── เก็บสถานะ ── SSE /api/events ──▶ office/index.html (เบราว์เซอร์หรือแอป)
   ▲                                                   │
   │  stream-json + hook PreToolUse เฉพาะงานนั้น        │  POST /api/agents/... (ต้องมี token)
   └── claude -p (agent ประจำออฟฟิศ) ◀──────────────────┘
```

### โหมดดู: เหตุการณ์ → ท่าทางในห้อง

| hook | ในออฟฟิศ |
|---|---|
| `SessionStart` | agent เดินเข้าประตู |
| `UserPromptSubmit` | เดินไปนั่งโต๊ะ |
| `PreToolUse` | กล่องบอกเครื่องมือ (subagent แยกด้วย `agent_id`) |
| `PermissionRequest` | กล่องสีเหลือง bridge ตอบกลับทันทีเสมอ ไม่หน่วงหน้าต่างขออนุญาตของคุณ |
| `PostToolUse` / `PostToolUseFailure` | ล้างสถานะรออนุญาต อ่าน context ใหม่ |
| `Stop` / `StopFailure` | ลุกไปพัก เก็บคำตอบล่าสุด |
| `SubagentStart` / `SubagentStop` | subagent เดินเข้า / ออก |
| `PostCompact` | อ่าน context ใหม่ |
| `SessionEnd` | เดินกลับบ้าน |

bridge ตอบ hook ของ session ที่เปิดเองด้วย `{}` เสมอ จึงไม่มีทางอนุญาตหรือบล็อกเครื่องมือแทนคุณ

### โหมดสั่งงาน

- ทุกงานรัน `claude -p --output-format stream-json --verbose` ในโฟลเดอร์ของ agent งานแรกใช้ `--session-id` งานต่อไปใช้ `--resume` บทสนทนาจึงต่อเนื่อง
- คำสั่งประจำตัวส่งผ่าน `--append-system-prompt-file` และ prompt ส่งทาง stdin เลี่ยงปัญหาการ escape ภาษาไทยบน Windows
- เครื่องมือที่อนุญาตส่งผ่าน `--allowedTools` และโหมดผ่าน `--permission-mode`
- `claude -p` ไม่ยิง `PermissionRequest` bridge จึงใส่ hook `PreToolUse` ให้เฉพาะงานนั้นผ่าน `--settings` แล้วพักคำขอไว้ ถ้า:
  - เครื่องมือไม่อยู่ในรายการที่อนุญาต
  - และไม่ใช่เครื่องมือที่ Claude ใช้ได้เองอยู่แล้ว (Read, Grep, Glob, Task, TodoWrite ...)
  - และโหมดไม่ได้เป็น `acceptEdits` กับเครื่องมือแก้ไฟล์ หรือ `plan` / `dontAsk` (สองโหมดนี้ Claude ปฏิเสธเอง)
- สถานะของงานอ่านจาก stream-json อย่างเดียว hook ของ plugin ที่ยิงจากงานเหล่านี้จะถูกข้าม
- context คำนวณจาก `usage` ของแต่ละข้อความ ค่าใช้จ่ายมาจาก `total_cost_usd` (เป็นค่าประมาณ)

### context

- ไม่มี statusline: อ่านท้ายไฟล์ transcript หาข้อความล่าสุดที่มี `usage` แล้วคิด `input + cache_creation + cache_read` เทียบกับ 200k (หรือ 1M ถ้าเกิน 200k) แสดงเป็น ≈
- มี statusline: ใช้ `context_window.remaining_percentage` ที่ Claude Code ส่งมาตรง ๆ

### อายุของ session

- เงียบเกิน 1 ชั่วโมง: ขึ้นว่า "หลับอยู่"
- เงียบเกิน 12 ชั่วโมง หรือปิด session แล้ว 30 วินาที: หายจากออฟฟิศ
- bridge ไม่ปิดตัวเอง เพื่อไม่ให้ session ที่เปิดทิ้งไว้เจอ hook error ถ้าจะปิด ให้ปิดโปรเซส node ที่ฟัง port 4567

---

## ความปลอดภัย

- bridge ฟังที่ `127.0.0.1` เท่านั้น เว้นแต่เปิด `ESAN_OFFICE_LAN=1`
- ตอบเฉพาะ Host `127.0.0.1` / `localhost` (และ IP ในวง LAN ถ้าเปิด) กันเว็บอื่นแอบอ่านข้อมูลผ่าน DNS rebinding
- `/hook` และ `/status` รับเฉพาะจากเครื่องตัวเองและต้องมี header `X-Esan-Hook: 1` กันเว็บอื่นยิงเหตุการณ์ปลอม
- ทุกคำสั่งที่ทำให้ agent ทำงาน (`/api/agents/...`) ต้องมาจากเครื่องตัวเองและมี `X-Esan-Token` ที่ bridge ฝังไว้ในหน้าเว็บเฉพาะตอนเปิดจากเครื่องนี้
- คนที่ดูผ่าน Wi-Fi ได้หน้าที่ไม่มี token จึงดูได้อย่างเดียว
- **ระวัง:** `claude -p` รัน hooks และ `.mcp.json` ของโฟลเดอร์ทำงานโดยไม่ถาม ให้ agent ทำงานเฉพาะโฟลเดอร์ที่คุณเชื่อถือ
- ไม่มีข้อมูลส่งออกนอกเครื่อง ไฟล์ของ plugin ที่อยู่บน GitHub Pages เป็นแค่โค้ด

---

## โครงสร้างไฟล์

```
.claude-plugin/marketplace.json     ← ประกาศ marketplace "esan-devtools" (อยู่ที่ root ของ repo)
plugins/esan-office/
├── .claude-plugin/plugin.json      ← ชื่อและเวอร์ชันของ plugin
├── hooks/hooks.json                ← hook ทั้งหมดของโหมดดู
├── scripts/
│   ├── start.js                    ← SessionStart: เปิด bridge แล้วส่งเหตุการณ์ต่อ (ห้ามพิมพ์อะไรออก stdout)
│   ├── bridge.js                   ← server: รับ hook, รัน agent, SSE, เสิร์ฟหน้าเว็บ
│   └── statusline.js               ← (ไม่บังคับ) ส่ง context กับโควตาจริงให้ bridge
├── office/
│   ├── index.html                  ← หน้าออฟฟิศ 8 บิต (ทั้ง 2 ธีม)
│   ├── manifest.webmanifest, sw.js ← ทำให้ติดตั้งเป็นแอปได้
│   └── icon-192.png, icon-512.png
├── tests/office-tests.mjs          ← ชุดทดสอบ end-to-end
└── README.md
```

---

## การพัฒนาและทดสอบ

เปิด bridge เอง (แก้ `bridge.js` แล้วต้องเปิดใหม่ ส่วน `index.html` แค่รีเฟรชหน้า):

```bash
node plugins/esan-office/scripts/bridge.js
```

ในแอป Claude ใช้ config `esan-office` ใน `.claude/launch.json` ได้

ลองยิงเหตุการณ์ปลอมโดยไม่ต้องเปิด Claude Code:

```bash
curl -X POST http://127.0.0.1:4567/hook -H "X-Esan-Hook: 1" -H "Content-Type: application/json" \
  -d '{"hook_event_name":"UserPromptSubmit","session_id":"demo","cwd":"D:/work/shop-ui","prompt":"hello"}'
```

### ชุดทดสอบ

เปิด bridge ด้วยค่าที่ใช้ทดสอบก่อน (รอคำขออนุญาต 8 วินาที, ทำพร้อมกัน 1 ตัว, เปิด LAN, โหลด plugin เข้างานของ agent):

```bash
ESAN_OFFICE_PERM_WAIT_MS=8000 ESAN_OFFICE_MAX=1 ESAN_OFFICE_LAN=1 \
ESAN_OFFICE_PLUGIN_DIR="$PWD/plugins/esan-office" node plugins/esan-office/scripts/bridge.js
```

แล้วรันในอีกหน้าต่าง:

```bash
ONLY_FREE=1 node plugins/esan-office/tests/office-tests.mjs   # ไม่กิน token
node plugins/esan-office/tests/office-tests.mjs               # รัน Claude จริงด้วย Haiku ใช้โควตาเล็กน้อย
```

ชุดทดสอบครอบคลุม:
- **ไม่กิน token:** PermissionRequest ไม่หน่วง, statusline, Host/header/token ถูกปฏิเสธ, LAN ดูได้อย่างเดียว, validation ของฟอร์ม
- **รันจริง:** คิว, `--resume` จำบทสนทนา, เริ่มบทสนทนาใหม่, พักและปฏิเสธคำขออัตโนมัติ, หยุด, subagent, ลบระหว่างทำงาน, ไม่เกิด session ซ้ำเมื่อโหลด plugin

ผลล่าสุด (23 ก.ย. 2026, Claude Code 2.1.206, Windows 11): ผ่าน 26/26

ตรวจ manifest ก่อน push:

```bash
claude plugin validate plugins/esan-office
claude plugin validate .
```

---

## ข้อจำกัดที่รู้อยู่

- plugin ตั้ง `statusLine` เองไม่ได้ ต้องเพิ่มใน settings เอง
- โควตา 5 ชั่วโมงมีเฉพาะ Pro/Max
- `Bash` จะถามทุกครั้งถ้าไม่ได้อยู่ในรายการอนุญาต (แม้คำสั่งแบบอ่านอย่างเดียว) เพราะ bridge ไม่ได้ตัดสินแทน Claude ว่าคำสั่งไหนปลอดภัย
- มือถือดูได้อย่างเดียว ถ้ามีคำขออนุญาตตอนไม่อยู่หน้าคอมจะถูกปฏิเสธหลัง 4 นาที
- session แบบคุยโต้ตอบที่เปิดด้วย `--plugin-dir` ครั้งแรกอาจมีหน้าจอตั้งค่าของ Claude Code ให้กดก่อน hook ถึงจะเริ่มทำงาน
- ชื่อแอปที่ติดตั้งเป็น "ESAN AI AGENT" เสมอ
- โต๊ะมี 12 ตัว เกินนั้นจะยืนทำงานในมุมพัก

## แก้ปัญหา

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
|---|---|---|
| Claude Code ขึ้น `hook error` | bridge ไม่ได้รัน | เปิด session ใหม่ (bridge จะเปิดเอง) หรือรัน `node scripts/bridge.js` แล้วดู `~/.esan-office/bridge.log` |
| หน้าเว็บขึ้น "ต่อ bridge ไม่ได้" | bridge ปิดอยู่ | เปิด bridge หน้าเว็บจะต่อใหม่เอง |
| ไม่มีปุ่ม "เพิ่ม agent" | เปิดจากเครื่องอื่น หรือยังต่อ bridge ไม่ได้ | เปิด <http://localhost:4567> บนคอมที่รัน bridge |
| agent ขึ้น "หาโปรแกรม claude ไม่เจอ" | `claude` ไม่อยู่ใน PATH ของ bridge | ตั้ง `ESAN_CLAUDE_BIN` เป็น path เต็มของ claude |
| สร้าง agent ไม่ได้ "หาโฟลเดอร์ทำงานไม่เจอ" | path ไม่ครบหรือพิมพ์ผิด | ใส่ path เต็มของโฟลเดอร์ที่มีอยู่จริง |
| port 4567 ชน | มีโปรแกรมอื่นใช้อยู่ | ปิดโปรแกรมนั้น หรือเปลี่ยน `ESAN_OFFICE_PORT` และ url ใน `hooks/hooks.json` |
| จอโควตาว่าง | ยังไม่ได้ตั้ง statusline หรือไม่ใช่ Pro/Max | ดูหัวข้อ context กับโควตาแบบตัวเลขจริง |

## เวอร์ชัน

- **0.3.0** เพิ่มธีม CDG (CDG AI AGENT ภาษากลาง), ติดตั้งเป็นแอป (PWA), หัวข้อวิธีติดตั้งและวิธีใช้งานในหน้า, ชุดทดสอบใน `tests/`
- **0.2.0** โหมดสั่งงาน: agent ประจำออฟฟิศ, คิว, พักคำขออนุญาตผ่าน `PreToolUse`, statusline
- **0.1.0** โหมดดู: hook ทุกเหตุการณ์, ออฟฟิศ 8 บิตธีมอีสาน
