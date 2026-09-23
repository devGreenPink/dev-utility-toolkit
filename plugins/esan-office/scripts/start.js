'use strict';
// SessionStart hook: make sure the office bridge is running, then forward this event to it.
// Must never write to stdout — SessionStart stdout is added to Claude's context.
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const PORT = Number(process.env.ESAN_OFFICE_PORT) || 4567;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    const done = () => resolve(data);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', done);
    process.stdin.on('error', done);
    setTimeout(done, 1500);
  });
}

function ping() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/ping', timeout: 400 }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body).app === 'esan-office'); } catch { resolve(false); }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function forward(body) {
  return new Promise((resolve) => {
    const req = http.request({
      host: '127.0.0.1', port: PORT, path: '/hook', method: 'POST', timeout: 800,
      headers: { 'Content-Type': 'application/json', 'X-Esan-Hook': '1', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => { res.resume(); res.on('end', resolve); });
    req.on('error', resolve);
    req.on('timeout', () => { req.destroy(); resolve(); });
    req.end(body);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    const input = await readStdin();
    if (!(await ping())) {
      const child = spawn(process.execPath, [path.join(__dirname, 'bridge.js')], {
        detached: true, stdio: 'ignore', windowsHide: true, env: process.env,
      });
      child.unref();
      for (let i = 0; i < 12 && !(await ping()); i++) await sleep(150);
    }
    if (input.trim()) await forward(input);
  } catch { /* never block or print */ }
  process.exit(0);
})();
