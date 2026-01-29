const assert = require('assert');

async function run() {
  // use fetch (Node 18+ provides global fetch)
  const base = 'http://localhost:3000';
  const username = `t_${Date.now()}`;
  const register = await fetch(base + '/api/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'x' })
  });
  if (register.status !== 201 && register.status !== 409) {
    throw new Error('register API unexpected status: ' + register.status);
  }

  const login = await fetch(base + '/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'x' })
  });

  if (login.status !== 200) {
    throw new Error('login failed: status ' + login.status);
  }

  const body = await login.json();
  assert(body.ok && body.username === username, 'login response shape');

  console.log('smoke tests passed (register/login)');
}

module.exports = run;
