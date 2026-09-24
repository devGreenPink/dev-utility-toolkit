'use strict';
// Optional status line: forwards Claude Code's exact context % and plan quota to the office, then prints a short line.
// Enable it in ~/.claude/settings.json: "statusLine": { "type": "command", "command": "node <path-to>/scripts/statusline.js" }
const http = require('http');

const PORT = Number(process.env.ESAN_OFFICE_PORT) || 4567;
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let st = {};
  try { st = JSON.parse(raw.replace(/^﻿/, '')); } catch { /* print a bare line below */ }
  const parts = [st.model && st.model.display_name ? st.model.display_name : 'Claude'];
  const cw = st.context_window || {};
  if (typeof cw.remaining_percentage === 'number') parts.push(`context เหลือ ${Math.round(cw.remaining_percentage)}%`);
  const five = st.rate_limits && st.rate_limits.five_hour;
  if (five && typeof five.used_percentage === 'number') parts.push(`5 ชม. ใช้ไป ${Math.round(five.used_percentage)}%`);
  const week = st.rate_limits && st.rate_limits.seven_day;
  if (week && typeof week.used_percentage === 'number') parts.push(`สัปดาห์ ใช้ไป ${Math.round(week.used_percentage)}%`);
  process.stdout.write(parts.join(' · '));

  const body = JSON.stringify(st);
  const req = http.request({
    host: '127.0.0.1', port: PORT, path: '/status', method: 'POST', timeout: 500,
    headers: { 'Content-Type': 'application/json', 'X-Esan-Hook': '1', 'Content-Length': Buffer.byteLength(body) },
  }, (res) => { res.resume(); res.on('end', () => process.exit(0)); });
  req.on('error', () => process.exit(0));
  req.on('timeout', () => { req.destroy(); process.exit(0); });
  req.end(body);
});
