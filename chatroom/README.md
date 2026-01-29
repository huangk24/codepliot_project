# Chatroom

A small real-time chat application with public and private 1:1 conversations. It's
designed as a lightweight prototype to demonstrate registration/login, persistent
messages, Socket.IO real-time delivery, and basic presence/unread-counts.

Key features
- Register and login with username + password (passwords are hashed before saving).
- Public chat: messages are broadcast to all connected users and persisted.
- Private 1:1 chat: click another username to open a private chatroom (/chat.html?pm=User).
	Private messages are persisted and delivered only to the two participants in real time.
- Presence: online users are shown at the top of the users list.
- Unread counts: private conversations show unread counts which increment when
	new private messages arrive and clear when the conversation is opened.

Tech stack & libraries
- Node.js + Express — HTTP server and static file serving.
- Socket.IO — real-time messaging (server and client).
- bcryptjs — password hashing.
- node-fetch (used in test scripts) — lightweight HTTP client for tests.
- Frontend: plain HTML/CSS/vanilla JS with Bootstrap for quick styling.

Storage
- Simple file-based JSON DB: `data/db.json` (accessed through `lib/storage.js`).
- Messages (public and private) and registered users are stored there.
- Note: unread counts and issued session tokens are stored in memory (server runtime).
	They reset when the server restarts. If you need persistence for those, persist to
	`data/db.json` or use Redis.

APIs and socket events

HTTP endpoints
- POST /api/register — { username, password } — create a new user (201 created).
- POST /api/login — { username, password } — returns { ok, username, token } on success.
- GET /api/users — returns the list of registered users (online users first).
- GET /api/messages?with=<user> — returns private messages between the authenticated
	user (derived from Authorization header) and `<user>`; requires `Authorization: Bearer <token>`.

Socket.IO events (client ↔ server)
- join { username, token } — client notifies server of username (and optional token);
	server will send previous public messages and emit a personalized `users` list to the socket.
- previousMessages — server → client: array of public messages (sent on join).
- message { username, text } — client → server: public message to broadcast and persist.
- privateMessage { to, text } — client → server: persist and route to the two participants.
- privateMessage (server → client) — delivered only to sockets belonging to the two participants.
- getPrivateHistory { with } — client → server (socket): request private history (fallback if HTTP token not available).
- privateHistory — server → client: array of private messages for the requested pair.
- users — server → client: personalized users list (includes `unread` counts for that client).
- markPrivateRead { with } — client → server: mark private conversation with `with` user as read (clears unread count).

Running locally

Prerequisites
- Node.js (recommended v14 or newer) and npm installed.

Install and start
1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node server.js
# or
npm start
```

3. Open http://localhost:3000 in your browser. Register a few users and open multiple
	 browser windows (or incognito tabs) to try public and private chats.

Testing
- Simple tests are under the `test/` folder. Examples:

```bash
# quick private message flow check
node test/private_check.js

# unread counts check
node test/unread_check.js

# run full test runner (if present)
node test/run-tests.js
```

Notes and further improvements
- Tokens are issued at login and stored server-side in memory. For production, you
	should use signed JWTs or a persistent session store (Redis) and apply expiry.
- Unread counts are currently in-memory (reset on restart). Persist them if you
	need durability across restarts.
- `data/db.json` is a simple JSON file used for demo purposes; for production use a
	proper database (Postgres, MongoDB, etc.).

Contributing
- Pull requests welcome. Keep changes small and add tests for new behavior.

License
- MIT (or specify your preferred license)

Enjoy — if you'd like, I can add Docker support, JWT auth, or persistent unread counts.