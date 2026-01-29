// test/private_check.js
// Quick automated check for private messaging flow
// Usage: node test/private_check.js

const io = require('socket.io-client');
const fetch = global.fetch || require('node-fetch');

const base = 'http://localhost:3000';

async function ensureServer() {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(base + '/api/users');
      if (res.ok) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('server not responding');
}

async function register(username, password) {
  try {
    const res = await fetch(base + '/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const j = await res.json().catch(()=>({}));
    return res.status;
  } catch (e) {
    return null;
  }
}

async function login(username, password) {
  const res = await fetch(base + '/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('login failed ' + res.status);
  return res.json(); // {ok, username, token}
}

async function getPrivateHistory(token, other) {
  const res = await fetch(base + '/api/messages?with=' + encodeURIComponent(other), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const j = await res.json();
  return { status: res.status, body: j };
}

async function main(){
  try {
    await ensureServer();
  } catch (e) {
    console.error('server not ready');
    process.exit(2);
  }
  const a = 'test_alice';
  const b = 'test_bob';
  const pw = 'pass123';

  await register(a, pw);
  await register(b, pw);
  const la = await login(a, pw);
  const lb = await login(b, pw);
  console.log('logged in', la.username, 'token?', !!la.token, lb.username, !!lb.token);

  // connect alice socket
  const s = io(base, { transports: ['websocket'] });
  await new Promise((resolve, reject) => {
    s.on('connect', async () => {
      console.log('alice socket connected');
      s.emit('join', { username: la.username, token: la.token });
      // send private message to bob
      s.emit('privateMessage', { to: lb.username, text: 'hello bob from alice' });
      // wait a bit then fetch history
      setTimeout(() => resolve(), 500);
    });
    s.on('connect_error', (err) => reject(err));
  });

  // fetch private history as alice
  const hist = await getPrivateHistory(la.token, lb.username);
  console.log('private history status', hist.status);
  console.log(JSON.stringify(hist.body, null, 2));
  s.close();
}

main().catch(err => { console.error(err); process.exit(1); });
