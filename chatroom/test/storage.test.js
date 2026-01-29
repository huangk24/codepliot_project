const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');

const { createStorage } = require('../lib/storage');

async function run() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chatroom-test-'));
  const dbPath = path.join(tmpDir, 'db.json');
  const storage = createStorage(dbPath);

  // initially empty
  let msgs = await storage.getMessages();
  assert(Array.isArray(msgs) && msgs.length === 0, 'messages should start empty');

  // add user and find
  await storage.addUser({ username: 'bob', passwordHash: 'h' });
  const u = await storage.findUser('bob');
  assert(u && u.username === 'bob', 'should find added user');

  // add message
  const m = { username: 'bob', text: 'hello', time: new Date().toISOString() };
  await storage.addMessage(m);
  msgs = await storage.getMessages();
  assert(msgs.length === 1 && msgs[0].text === 'hello', 'message must be stored and retrieved');

  console.log('storage tests passed');
}

module.exports = run;
