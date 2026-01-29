const fs = require('fs').promises;
const path = require('path');

function defaultDbPath() {
  if (process.env.DB_PATH) return process.env.DB_PATH;
  return path.join(__dirname, '..', 'data', 'db.json');
}

function createStorage(dbPath) {
  const DB_PATH = dbPath || defaultDbPath();

  async function readDB() {
    try {
      const txt = await fs.readFile(DB_PATH, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      if (err.code === 'ENOENT') {
        const initial = { users: [], messages: [] };
        await writeDB(initial);
        return initial;
      }
      throw err;
    }
  }

  async function writeDB(obj) {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(obj, null, 2), 'utf8');
  }

  async function addUser(user) {
    const db = await readDB();
    db.users.push(user);
    await writeDB(db);
  }

  async function findUser(username) {
    const db = await readDB();
    return db.users.find(u => u.username === username) || null;
  }

  async function listUsers() {
    const db = await readDB();
    return (db.users || []).map(u => ({ username: u.username }));
  }

  async function addMessage(msg) {
    const db = await readDB();
    db.messages.push(msg);
    await writeDB(db);
  }

  async function getMessages() {
    const db = await readDB();
    return db.messages || [];
  }

  async function getPrivateMessages(userA, userB) {
    const db = await readDB();
    const a = String(userA || '').toLowerCase();
    const b = String(userB || '').toLowerCase();
    return (db.messages || []).filter(m => {
      if (!m.private) return false;
      // participants stored as array of usernames
      const parts = (m.participants || []).map(x => String(x).toLowerCase());
      return parts.includes(a) && parts.includes(b);
    });
  }

  return { readDB, writeDB, addUser, findUser, listUsers, addMessage, getMessages, getPrivateMessages };
}

// default export: storage bound to default path
module.exports = createStorage();
module.exports.createStorage = createStorage;
