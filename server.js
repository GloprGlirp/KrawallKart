// Krawall Kart – Spielserver: liefert das Spiel aus und verwaltet Lobbys mit Einladungscodes.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 3000;
const PUB = path.join(__dirname, 'public');

function page() {
  const src = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
  const [head, body] = src.split('<!--BODY-->');
  return '<!doctype html><html lang="de"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    head + '</head><body>' + body + '</body></html>';
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(page());
  }
  if (url === '/vendor/three.min.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'max-age=86400' });
    return res.end(fs.readFileSync(path.join(PUB, 'vendor', 'three.min.js')));
  }
  if (url === '/health') { res.writeHead(200); return res.end('ok'); }
  res.writeHead(404); res.end('Nicht gefunden');
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024 });
const rooms = new Map();
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let nextId = 1;

function newCode() {
  let c;
  do { c = ''; for (let i = 0; i < 5; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)]; } while (rooms.has(c));
  return c;
}
function send(ws, o) { if (ws.readyState === 1) ws.send(JSON.stringify(o)); }
function bcast(room, o, except) { const s = JSON.stringify(o); for (const [id, c] of room.clients) if (id !== except && c.readyState === 1) c.send(s); }

function leave(ws) {
  const room = rooms.get(ws.room);
  ws.room = null;
  if (!room) return;
  room.clients.delete(ws.id);
  if (room.host === ws.id) {
    for (const c of room.clients.values()) { send(c, { t: 'room-closed' }); c.room = null; }
    rooms.delete(room.code);
  } else {
    bcast(room, { t: 'peer-leave', id: ws.id });
  }
}

wss.on('connection', ws => {
  ws.id = 'p' + (nextId++);
  ws.room = null;
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'create') {
      leave(ws);
      const code = newCode();
      rooms.set(code, { code, host: ws.id, clients: new Map([[ws.id, ws]]), started: false });
      ws.room = code;
      send(ws, { t: 'created', code, id: ws.id });
    } else if (m.t === 'join') {
      const code = String(m.code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return send(ws, { t: 'error', msg: 'Diesen Code gibt es nicht (mehr). Tippfehler?' });
      if (room.clients.size >= 8) return send(ws, { t: 'error', msg: 'Die Lobby ist voll (8 Fahrer).' });
      if (room.started) return send(ws, { t: 'error', msg: 'Dort läuft gerade ein Rennen. Versuch es nach dem Rennen nochmal.' });
      leave(ws);
      room.clients.set(ws.id, ws);
      ws.room = code;
      send(ws, { t: 'joined', code, id: ws.id, host: room.host });
      bcast(room, { t: 'peer-join', id: ws.id }, ws.id);
    } else if (m.t === 'leave') {
      leave(ws);
    } else if (m.t === 'state') {
      const room = rooms.get(ws.room);
      if (room && room.host === ws.id) room.started = !!m.started;
    } else if (m.t === 'msg') {
      const room = rooms.get(ws.room);
      if (!room) return;
      const out = JSON.stringify({ t: 'msg', from: ws.id, data: m.data });
      if (m.to) { const c = room.clients.get(m.to); if (c && c.readyState === 1) c.send(out); }
      else for (const [id, c] of room.clients) if (id !== ws.id && c.readyState === 1) c.send(out);
    }
  });
  ws.on('close', () => leave(ws));
});

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false; ws.ping();
  }
}, 15000);

server.listen(PORT, () => {
  const lan = [];
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list || []) if (a.family === 'IPv4' && !a.internal) lan.push(a.address);
  const url = `http://localhost:${PORT}`;
  console.log('\n  KRAWALL KART läuft!\n');
  console.log(`  Auf diesem Rechner:   ${url}`);
  for (const ip of lan) console.log(`  Im selben WLAN:       http://${ip}:${PORT}`);
  console.log('\n  Fenster offen lassen, solange gespielt wird. Beenden mit Strg+C.\n');
  if (process.pkg || process.env.OPEN_BROWSER) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => {});
  }
});
