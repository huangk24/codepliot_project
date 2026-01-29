const express = require('express');
const http = require('http');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const storage = require('./lib/storage');
const crypto = require('crypto');

// In-memory token -> username map (issued at login)
const tokenToUser = new Map();
// online tokens: token -> socket.id
const onlineTokens = new Map();
// socket id -> token (reverse lookup)
const socketToToken = new Map();
// username -> Set(socket.id) for routing messages to a user's sockets
const usernameToSockets = new Map();
// unread counts: recipient -> Map<sender, count>
const unreadCounts = new Map();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API: register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const existing = await storage.findUser(username);
  if (existing) return res.status(409).json({ error: 'username-taken' });
  const hash = await bcrypt.hash(password, 10);
  await storage.addUser({ username, passwordHash: hash });
  return res.status(201).json({ ok: true });
});

// API: login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = await storage.findUser(username);
  if (!user) return res.status(401).json({ error: 'invalid' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'invalid' });
  // create a simple token and store mapping
  const token = crypto.randomBytes(18).toString('hex');
  tokenToUser.set(token, username);
  return res.json({ ok: true, username, token });
});

// API: list users (online users first, then offline alphabetically)
app.get('/api/users', async (req, res) => {
  try {
    const all = await storage.listUsers(); // returns [{username}]
    const onlineSet = new Set(Array.from(onlineTokens.values()));
    // sort: online first, then by username
    all.sort((a, b) => {
      const aOnline = onlineSet.has(a.username) ? 0 : 1;
      const bOnline = onlineSet.has(b.username) ? 0 : 1;
      if (aOnline !== bOnline) return aOnline - bOnline;
      return a.username.localeCompare(b.username);
    });
    // annotate online property
    const annotated = all.map(u => ({ username: u.username, online: onlineSet.has(u.username) }));
    res.json(annotated);
  } catch (err) {
    console.error('failed to list users', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// API: get private messages between the authenticated user and another user
// requires Authorization: Bearer <token>
app.get('/api/messages', async (req, res) => {
  try {
    const other = req.query.with;
    if (!other) return res.status(400).json({ error: 'missing_with' });
    const auth = req.headers.authorization || '';
    const match = auth.match(/^Bearer\s+(.*)$/i);
    if (!match) return res.status(401).json({ error: 'missing_token' });
    const token = match[1];
    const user = tokenToUser.get(token);
    if (!user) return res.status(401).json({ error: 'invalid_token' });
    const msgs = await storage.getPrivateMessages(user, other);
    // sort by time ascending
    msgs.sort((a, b) => new Date(a.time) - new Date(b.time));
    res.json(msgs);
  } catch (err) {
    console.error('failed to get private messages', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// serve the chat page (static file chat.html will exist)
app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Socket.IO handling
io.on('connection', (socket) => {
  socket.on('join', async (payload) => {
    // payload expected { username, token }
    const username = typeof payload === 'string' ? payload : payload && payload.username;
    const token = payload && payload.token;
    socket.data.username = username;
    // track this socket under the username (so we can route private messages)
    if (username) {
      const set = usernameToSockets.get(username) || new Set();
      set.add(socket.id);
      usernameToSockets.set(username, set);
    }
    if (token && tokenToUser.get(token) === username) {
      onlineTokens.set(token, username);
      socketToToken.set(socket.id, token);
      // broadcast updated user lists (personalized)
      await emitUsersLists();
    }
    // send previous messages
    const messages = await storage.getMessages();
    socket.emit('previousMessages', messages);
  });

  socket.on('message', async (payload) => {
    const { username, text } = payload || {};
    if (!username || !text) return;
    const time = new Date().toISOString();
    const msg = { username, text, time };
    // persist
    try {
      await storage.addMessage(msg);
    } catch (err) {
      console.error('failed to store message', err);
    }
    io.emit('message', msg);
  });

  // private message: { to, text }
  socket.on('privateMessage', async (payload) => {
    const from = socket.data.username;
    const to = payload && payload.to;
    const text = payload && payload.text;
    if (!from || !to || !text) return;
    const time = new Date().toISOString();
    const participants = [from, to];
    const msg = { private: true, participants, from, to, text, time };
    try {
      await storage.addMessage(msg);
    } catch (err) {
      console.error('failed to store private message', err);
    }
    // emit only to sockets that belong to either participant
    const recipients = new Set();
    const fromSet = usernameToSockets.get(from);
    const toSet = usernameToSockets.get(to);
    if (fromSet) for (const id of fromSet) recipients.add(id);
    if (toSet) for (const id of toSet) recipients.add(id);
    for (const sid of recipients) {
      const s = io.sockets.sockets.get(sid);
      if (s) s.emit('privateMessage', msg);
    }
    // increment unread count for the recipient
    if (to) {
      const map = unreadCounts.get(to) || new Map();
      const prev = map.get(from) || 0;
      map.set(from, prev + 1);
      unreadCounts.set(to, map);
      // send updated users lists to affected users
      console.log('unreadCounts for', to, 'now', Array.from(map.entries()));
      await emitUsersLists();
    }
  });

  // respond to requests over socket for private history (no HTTP token needed)
  socket.on('getPrivateHistory', async (payload) => {
    try {
      const other = payload && payload.with;
      const user = socket.data && socket.data.username;
      if (!user || !other) return;
      const msgs = await storage.getPrivateMessages(user, other);
      // sort ascending
      msgs.sort((a, b) => new Date(a.time) - new Date(b.time));
      socket.emit('privateHistory', msgs);
    } catch (err) {
      console.error('failed to get private history via socket', err);
    }
  });

  // mark private messages as read (clears unread count for current user with 'other')
  socket.on('markPrivateRead', async (payload) => {
    try {
      const other = payload && payload.with;
      const user = socket.data && socket.data.username;
      if (!user || !other) return;
      const map = unreadCounts.get(user);
      if (map && map.has(other)) {
        map.set(other, 0);
        unreadCounts.set(user, map);
      }
      // update users lists for this user's sockets (and optionally others)
      await emitUsersLists();
    } catch (err) {
      console.error('failed to mark read', err);
    }
  });

  socket.on('disconnect', async () => {
    // remove online mapping for this socket if present
    const token = socketToToken.get(socket.id);
    if (token) {
      socketToToken.delete(socket.id);
      onlineTokens.delete(token);
      const users = await buildUsersList();
      io.emit('users', users);
    }
    // remove this socket from usernameToSockets
    const uname = socket.data && socket.data.username;
    if (uname) {
      const set = usernameToSockets.get(uname);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) usernameToSockets.delete(uname);
        else usernameToSockets.set(uname, set);
      }
    }
  });
});

// helper to build users list annotated with online flag and ordered
async function buildUsersList() {
  const all = await storage.listUsers();
  const onlineSet = new Set(Array.from(onlineTokens.values()));
  all.sort((a, b) => {
    const aOnline = onlineSet.has(a.username) ? 0 : 1;
    const bOnline = onlineSet.has(b.username) ? 0 : 1;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return a.username.localeCompare(b.username);
  });
  return all.map(u => ({ username: u.username, online: onlineSet.has(u.username) }));
}

// build users list personalized for `forUser` with unread counts from other users
async function buildUsersListFor(forUser) {
  const all = await storage.listUsers();
  const onlineSet = new Set(Array.from(onlineTokens.values()));
  all.sort((a, b) => {
    const aOnline = onlineSet.has(a.username) ? 0 : 1;
    const bOnline = onlineSet.has(b.username) ? 0 : 1;
    if (aOnline !== bOnline) return aOnline - bOnline;
    return a.username.localeCompare(b.username);
  });
  const myUnread = unreadCounts.get(forUser) || new Map();
  return all.map(u => ({ username: u.username, online: onlineSet.has(u.username), unread: myUnread.get(u.username) || 0 }));
}

// Emit personalized users lists to all connected sockets
async function emitUsersLists() {
  for (const [sid, socket] of io.sockets.sockets) {
    try {
      const uname = socket.data && socket.data.username;
      if (!uname) continue;
      const list = await buildUsersListFor(uname);
      socket.emit('users', list);
    } catch (err) {
      console.error('failed to emit users for socket', sid, err);
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
