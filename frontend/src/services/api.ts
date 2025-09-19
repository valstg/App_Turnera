// src/services/api.ts
// BACKEND en dev: Laravel expuesto en http://localhost (puerto 80)
export const API_BASE = 'http://localhost' as const;

export function authHeader(): Record<string, string> {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// helpers de depuración
;(window as any).__API_BASE__ = API_BASE;
console.log('[API base]', API_BASE);

// export default opcional por compatibilidad
export default API_BASE;
