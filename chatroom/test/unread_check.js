// test/unread_check.js
// Check unread counts update and clear
const io = require('socket.io-client');
const fetch = global.fetch || require('node-fetch');
const base = 'http://localhost:3000';

async function postJSON(url, body){
  const res = await fetch(url, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
  return res.json().catch(()=>({}));
}

async function login(username, password){
  const res = await fetch(base + '/api/login', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ username, password }) });
  if (!res.ok) throw new Error('login failed '+res.status);
  return res.json();
}

(async function(){
  // ensure users exist
  await fetch(base + '/api/register', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ username:'u_alice', password:'pw' }) }).catch(()=>{});
  await fetch(base + '/api/register', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ username:'u_bob', password:'pw' }) }).catch(()=>{});
  const la = await login('u_alice','pw');
  const lb = await login('u_bob','pw');
  console.log('tokens', la.token, lb.token);

  const a = io(base, { transports:['websocket'] });
  const b = io(base, { transports:['websocket'] });

  a.on('connect', () => { a.emit('join', { username: la.username, token: la.token }); });
  b.on('connect', () => { b.emit('join', { username: lb.username, token: lb.token }); });

  b.on('users', (list) => {
    console.log('bob users event', JSON.stringify(list));
  });

  // wait for connections
  await new Promise(r => setTimeout(r, 500));

  // alice sends private message to bob
  a.emit('privateMessage', { to: lb.username, text: 'hi bob unread test' });

  // wait a moment for server to process and emit users to bob
  await new Promise(r => setTimeout(r, 500));

  // bob mark as read
  b.emit('markPrivateRead', { with: la.username });

  await new Promise(r => setTimeout(r, 500));

  a.close(); b.close();
})();
