// chat.js — connect to socket.io and handle messages
(function(){
  const socket = io();
  const messagesEl = document.getElementById('messages');
  const msgForm = document.getElementById('msgForm');
  const msgInput = document.getElementById('msgInput');
  const who = document.getElementById('who');
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutLink = document.getElementById('logoutLink');
  const navAvatar = document.getElementById('navAvatar');
  const navUsername = document.getElementById('navUsername');

  const username = sessionStorage.getItem('chat_username');
  if (!username) {
    window.location.href = '/';
    return;
  }
  // check for private chat parameter
  const params = new URLSearchParams(window.location.search);
  const pmUser = params.get('pm');
  const isPrivate = !!pmUser;
  who.textContent = isPrivate ? `Private chat with ${pmUser}` : username;

  const token = sessionStorage.getItem('chat_token');
  socket.emit('join', { username, token });
  const backBtn = document.getElementById('backBtn');

  // request initial users list
  async function loadUsers() {
    try {
      console.log('chat: requesting /api/users');
      const res = await fetch('/api/users');
      if (!res.ok) return;
      const list = await res.json();
      console.log('chat: /api/users response', list);
      renderUsers(list);
    } catch (e) { /* ignore */ }
  }

  loadUsers();

  // populate navbar avatar/username
  if (navAvatar) {
    // show first char of username as avatar text
    navAvatar.textContent = (username && username[0]) ? username[0].toUpperCase() : 'U';
  }
  if (navUsername) navUsername.textContent = username || 'User';

  // Logout handler: bound to dropdown logout link
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      try { socket.emit('leave', { username }); } catch (e) {}
      try { socket.disconnect(); } catch (e) {}
      sessionStorage.removeItem('chat_username');
      window.location.href = '/';
    });
  }

  // show Back button when in private chat
  if (isPrivate && backBtn) {
    backBtn.classList.remove('d-none');
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try { socket.emit('markPrivateRead', { with: pmUser }); } catch (e) {}
      window.location.href = '/chat.html';
    });
  }

  function appendMessage(m){
    const li = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const dt = new Date(m.time).toLocaleString();
    const whoText = m.private ? (m.from || m.username) : (m.username || m.from || '');
    meta.textContent = `${whoText} • ${dt}`;
    const t = document.createElement('div');
    // support both public messages {username,text,time}
    // and private messages {private:true,from,to,text,time}
    t.textContent = m.text || m.text;
    if ((m.username && m.username === username) || (m.from && m.from === username)) li.classList.add('self');
    li.appendChild(meta);
    li.appendChild(t);
    messagesEl.appendChild(li);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  socket.on('previousMessages', (arr)=>{
    // when in private mode, ignore public previousMessages (we'll fetch private history via API)
    if (isPrivate) return;
    messagesEl.innerHTML = '';
    arr.forEach(appendMessage);
  });

  socket.on('message', (m)=>{
    if (isPrivate) return; // ignore public messages in private view
    appendMessage(m);
  });

  socket.on('privateMessage', (m) => {
    // append only if this private message involves current user and (if in private mode) the same other user
    if (!m || !m.participants) return;
    const parts = (m.participants || []).map(x => String(x).toLowerCase());
    const me = username.toLowerCase();
    if (!parts.includes(me)) return;
    if (isPrivate) {
      if (parts.includes((pmUser || '').toLowerCase())) appendMessage(m);
    } else {
      // not in private view: do nothing (or optionally notify)
    }
  });

  socket.on('users', (list) => {
    console.log('socket users event', list);
    renderUsers(list);
  });

  function renderUsers(list) {
    const el = document.getElementById('usersList');
    if (!el) return;
     el.innerHTML = '';
     // remove current user from the list so we only show other users
     const filtered = (Array.isArray(list) ? list.filter(x => x.username !== username) : []);
     if (filtered.length === 0) {
       const li = document.createElement('li');
       li.textContent = 'No other users';
       li.style.color = '#666';
       el.appendChild(li);
       return;
     }
  filtered.forEach(u => {
       const li = document.createElement('li');
       li.style.marginBottom = '8px';
       li.style.display = 'flex';
       li.style.alignItems = 'center';
       li.style.gap = '8px';
       li.style.padding = '6px 8px';
       li.style.borderRadius = '8px';
       // status dot and text
       const statusWrap = document.createElement('span');
       statusWrap.className = 'status-wrap';
       const dot = document.createElement('span');
       dot.className = u.online ? 'status-dot online' : 'status-dot offline';
       const statusText = document.createElement('span');
       statusText.className = 'status-text';
       statusText.textContent = u.online ? 'Online' : 'Offline';
       statusWrap.appendChild(dot);
       statusWrap.appendChild(statusText);

       // username badge on the left
       const badge = document.createElement('span');
       badge.className = 'badge rounded-pill';
       badge.style.padding = '6px 10px';
       if (u.online) {
         badge.style.background = 'linear-gradient(90deg,#833ab4,#dd2a7b)';
         badge.style.color = 'white';
       } else {
         badge.style.background = '#eee';
         badge.style.color = '#333';
       }
       badge.textContent = u.username;
      // make usernames clickable to open a private chat (click badge)
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', () => {
        if (u.username === username) return; // don't open PM with self
        try { socket.emit('markPrivateRead', { with: u.username }); } catch (e) {}
        // navigate to private chat
        window.location.href = `/chat.html?pm=${encodeURIComponent(u.username)}`;
      });
      li.appendChild(statusWrap);
      li.appendChild(badge);
      // unread pill on the right (or spacer to keep alignment)
      if (u.unread && Number(u.unread) > 0) {
        const pill = document.createElement('span');
        pill.className = 'unread-pill';
        pill.textContent = String(u.unread);
        pill.style.marginLeft = 'auto';
        li.appendChild(pill);
      } else {
        const spacer = document.createElement('span');
        spacer.className = 'spacer';
        spacer.style.marginLeft = 'auto';
        spacer.style.minWidth = '20px';
        li.appendChild(spacer);
      }
      el.appendChild(li);
     });
  }

  msgForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const text = msgInput.value.trim();
    if (!text) return;
    if (isPrivate) {
      socket.emit('privateMessage', { to: pmUser, text });
    } else {
      const payload = { username, text };
      socket.emit('message', payload);
    }
    msgInput.value = '';
  });

  // if in private mode, fetch the private history via API
  if (isPrivate) {
    // when opening a private chat, notify server to clear unread count
    try { socket.emit('markPrivateRead', { with: pmUser }); } catch (e) {}
    (async function(){
      try {
        console.log('chat: fetching private history for', pmUser, 'with token', !!token);
        let arr = null;
        if (token) {
          const res = await fetch(`/api/messages?with=${encodeURIComponent(pmUser)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            arr = await res.json();
            console.log('chat: private history via HTTP', arr);
          } else {
            console.warn('chat: private messages fetch failed', res.status);
          }
        }
        // if we didn't get history via HTTP (no token or non-200), try socket fallback
        if (!arr) {
          console.log('chat: attempting socket fallback for private history');
          const p = new Promise((resolve) => {
            const onResp = (data) => {
              socket.off('privateHistory', onResp);
              resolve(data || []);
            };
            socket.on('privateHistory', onResp);
            socket.emit('getPrivateHistory', { with: pmUser });
            // fallback timeout
            setTimeout(() => {
              socket.off('privateHistory', onResp);
              resolve([]);
            }, 1500);
          });
          arr = await p;
        }
        if (!arr || arr.length === 0) {
          messagesEl.innerHTML = '';
          const li = document.createElement('li');
          li.style.color = '#666';
          li.textContent = `No private messages yet.`;
          messagesEl.appendChild(li);
          return;
        }
        messagesEl.innerHTML = '';
        arr.forEach(appendMessage);
      } catch (e) {
        console.error('chat: private history error', e);
        messagesEl.innerHTML = '';
        const li = document.createElement('li');
        li.style.color = '#666';
        li.textContent = `Unable to load private messages (network error).`;
        messagesEl.appendChild(li);
      }
    })();
  }

  // handle socket-delivered private history (in case server pushes it)
  socket.on('privateHistory', (arr) => {
    if (!isPrivate) return;
    messagesEl.innerHTML = '';
    (arr || []).forEach(appendMessage);
  });
})();
