// src/services/api.ts
const API = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

export function authHeader(): Record<string, string> {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default API;
