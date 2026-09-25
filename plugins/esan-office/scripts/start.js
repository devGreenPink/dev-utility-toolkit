'use strict';
// SessionStart hook: make sure the office bridge is running, then forward this event to it.
// Must never write to stdout — SessionStart stdout is added to Claude's context.
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const PORT = Number(process.env.ESAN_OFFICE_PORT) || 4567;
const OWN = (() => {
  try { return JSON.parse(require('fs').readFileSync(path.join(__dirname, '..', '.claude-plugin', 'plugin.json'), 'utf8')).version; } catch { return null; }
})();

// Is version a newer than version b? Only a newer plugin replaces a running bridge, so an old
// session started later can never downgrade it.
function newer(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  return false;
}

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

// Resolves the running bridge's { app, version } or null when nothing answers
function ping() {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: PORT, path: '/api/ping', timeout: 400 }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { const j = JSON.parse(body); resolve(j.app === 'esan-office' ? j : null); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// Ask an older bridge to exit (0.4.1+ bridges answer; older ones 404 and keep running)
function askShutdown() {
  return new Promise((resolve) => {
    const req = http.request({
      host: '127.0.0.1', port: PORT, path: '/api/shutdown', method: 'POST', timeout: 600,
      headers: { 'Content-Type': 'application/json', 'X-Esan-Hook': '1', 'Content-Length': 2 },
    }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', () => resolve(0));
    req.on('timeout', () => { req.destroy(); resolve(0); });
    req.end('{}');
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
    let running = await ping();
    // An updated plugin takes over from an older bridge that is still serving the old page
    if (running && OWN && newer(OWN, running.version) && (await askShutdown()) === 200) {
      for (let i = 0; i < 10 && (await ping()); i++) await sleep(100);
      running = await ping();
    }
    if (!running) {
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
