const assert = require('assert');
const ioClient = require('socket.io-client');

async function run() {
  const base = 'http://localhost:3000';
  const username = `socket_t_${Date.now()}`;

  const socket = ioClient(base, { reconnection: false, timeout: 2000 });

  await new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('socket connect timeout')), 3000);
  });

  // wait for previousMessages, then send a message and expect to receive the broadcast
  const received = [];

  const prevPromise = new Promise((resolve) => {
    socket.once('previousMessages', (arr) => {
      received.push({ type: 'previous', arr });
      resolve();
    });
  });

  socket.emit('join', username);
  await prevPromise;

  const text = 'integration-test-' + Date.now();

  const msgPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('did not receive broadcasted message in time')), 3000);
    socket.once('message', (m) => {
      clearTimeout(timer);
      received.push({ type: 'message', m });
      resolve(m);
    });
  });

  socket.emit('message', { username, text });
  const msg = await msgPromise;

  assert(msg.username === username, 'message username matches');
  assert(msg.text === text, 'message text matches');

  socket.disconnect();
  console.log('socket integration test passed');
}

module.exports = run;
