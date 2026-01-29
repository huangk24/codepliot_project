// auth.js — handles register and login flows
(function(){
  async function postJSON(url, body){
    const res = await fetch(url, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json().catch(()=>({}));
    return { status: res.status, data };
  }

  const regForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (regForm) {
    regForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const usernameEl = document.getElementById('reg-username');
      const passwordEl = document.getElementById('reg-password');
      const msg = document.getElementById('reg-msg');
      const username = usernameEl ? usernameEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      msg.textContent = '';
      const res = await postJSON('/api/register', { username, password });
      if (res.status === 201) {
        // registration successful — redirect to login page with a one-time flag
        window.location.href = '/?registered=1';
        return;
      } else if (res.status === 409) {
        msg.textContent = 'Username already taken';
      } else {
        msg.textContent = res.data && res.data.error ? res.data.error : 'Registration failed';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const usernameEl = document.getElementById('login-username');
      const passwordEl = document.getElementById('login-password');
      const msg = document.getElementById('login-msg');
      const username = usernameEl ? usernameEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      msg.textContent = '';
      const res = await postJSON('/api/login', { username, password });
      if (res.status === 200 && res.data && res.data.ok) {
        // store username and token in sessionStorage and go to chat
        sessionStorage.setItem('chat_username', username);
        if (res.data.token) sessionStorage.setItem('chat_token', res.data.token);
        window.location.href = '/chat.html';
      } else {
        msg.textContent = 'Login failed — check username/password';
      }
    });
  }

})();
