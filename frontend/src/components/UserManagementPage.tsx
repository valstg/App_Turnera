import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User, UserRole } from '../types';

type Mode = 'list' | 'form';

type UserForm = {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  password_plaintext?: string; // solo al crear
};

const emptyForm: UserForm = {
  name: '',
  email: '',
  role: 'employee',
  password_plaintext: '',
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mode, setMode] = useState<Mode>('list');
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const list = await userService.getUsers();
      setUsers(list);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function startCreate() {
    setForm(emptyForm);
    setMode('form');
  }

  function startEdit(u: User) {
    setForm({
      id: u.id, // puede ser undefined si tipeaste id?: string; en User
      name: u.name,
      email: u.email,
      role: u.role,
      password_plaintext: '', // vacío; sólo se usa al crear
    });
    setMode('form');
  }

  async function handleDelete(u: User) {
    if (!u.id) {
      // si por alguna razón no hay id, no intentes borrar
      return;
    }
    if (!confirm(`¿Eliminar a ${u.name}?`)) return;
    try {
      setSaving(true);
      await userService.deleteUser(u.id);
      await loadUsers();
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo eliminar el usuario');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (form.id) {
        // actualizar existente (sin password)
        const { id, name, email, role } = form;
        await userService.updateUser(id, { name, email, role });
      } else {
        // crear nuevo (password requerido por el backend)
        const { name, email, role, password_plaintext } = form;
        if (!password_plaintext || password_plaintext.trim().length < 6) {
          setError('Ingresá una contraseña de al menos 6 caracteres.');
          setSaving(false);
          return;
        }
        await userService.createUser({ name, email, role, password_plaintext });
      }

      setMode('list');
      setForm(emptyForm);
      await loadUsers();
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar el usuario');
    } finally {
      setSaving(false);
    }
  }

  if (mode === 'form') {
    const isEdit = Boolean(form.id);
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'Editar usuario' : 'Crear usuario'}
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="owner">owner</option>
              <option value="manager">manager</option>
              <option value="leader">leader</option>
              <option value="employee">employee</option>
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña (sólo al crear)
              </label>
              <input
                type="password"
                className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                value={form.password_plaintext}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password_plaintext: e.target.value }))
                }
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300"
              onClick={() => {
                setForm(emptyForm);
                setMode('list');
              }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // LISTA
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Usuarios</h2>
        <button
          className="px-4 py-2.5 rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
          onClick={startCreate}
        >
          Nuevo usuario
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </p>
      )}

      {loading ? (
        <p>Cargando…</p>
      ) : users.length === 0 ? (
        <p className="text-gray-600">No hay usuarios aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Rol</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id ?? u.email} className="border-b last:border-b-0">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4 capitalize">{u.role}</td>
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        onClick={() => startEdit(u)}
                      >
                        Editar
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                        onClick={() => handleDelete(u)}
                        disabled={saving || !u.id}
                        title={!u.id ? 'Usuario sin ID (no se puede borrar aún)' : 'Eliminar'}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
