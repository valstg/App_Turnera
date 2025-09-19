// src/services/userService.ts
import API, { authHeader } from './api';
import type { User, UserRole } from '../types';

type LoginResponse =
  | { token: string; user: { id: string; email: string; name: string; role: string } }
  | { token: string }; // por si el backend sólo devuelve token

function normalizeUser(u: { id: string; email: string; name: string; role: string }): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserRole,
  };
}

export const userService = {
  // ---- AUTH ---------------------------------------------------------------
  async login(email: string, password_plaintext: string): Promise<User | null> {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password_plaintext }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as LoginResponse;

    // 
    if ('token' in data && data.token) {
      localStorage.setItem('auth_token', data.token);   // sigue igual
      sessionStorage.setItem('token', data.token);      // nuevo: lo que usa authHeader()
    }


    if ('user' in data && data.user) {
      const user = normalizeUser(data.user);
      return user;
    }

    return null;
  },

  logout(): void {
    // 
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token'); //nuevo
    sessionStorage.removeItem('currentUser');
  },

  getStoredUser(): User | null {
    try {
      const raw = sessionStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      sessionStorage.removeItem('currentUser');
      return null;
    }
  },

  // ---- USERS CRUD (protegido con token) -----------------------------------
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API}/api/users`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    if (!res.ok) throw new Error('No se pudo obtener la lista de usuarios');
    const data = (await res.json()) as Array<{ id: string; email: string; name: string; role: string }>;
    return data.map(normalizeUser);
  },

  async createUser(payload: { name: string; email: string; role: UserRole; password_plaintext: string }): Promise<User> {
    const res = await fetch(`${API}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        password: payload.password_plaintext,
      }),
    });
    if (!res.ok) throw new Error('No se pudo crear el usuario');
    const data = (await res.json()) as { id: string; email: string; name: string; role: string };
    return normalizeUser(data);
  },

  async updateUser(id: string, changes: Partial<Pick<User, 'name' | 'email' | 'role'>>): Promise<User> {
    const res = await fetch(`${API}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(changes),
    });
    if (!res.ok) throw new Error('No se pudo actualizar el usuario');
    const data = (await res.json()) as { id: string; email: string; name: string; role: string };
    return normalizeUser(data);
  },

  async deleteUser(id: string): Promise<boolean> {
    const res = await fetch(`${API}/api/users/${id}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error('No se pudo eliminar el usuario');
    return true;
  },
};

export default userService;
