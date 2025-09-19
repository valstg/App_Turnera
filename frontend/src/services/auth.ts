// src/services/auth.ts
import API, { authHeader } from './api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  // Manejo de errores legibles
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Login ${res.status}: ${text}`);
  }
  const data = JSON.parse(text);

  sessionStorage.setItem('token', data.token);
  return data.user;
}

export async function me() {
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { ...authHeader(), Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`ME ${res.status}`);
  return res.json();
}

export async function logout() {
  await fetch(`${API}/api/auth/logout`, {
    method: 'POST',
    headers: { ...authHeader(), Accept: 'application/json' },
  });
  sessionStorage.removeItem('token');
}
