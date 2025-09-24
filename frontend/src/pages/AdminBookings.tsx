import React, { useEffect, useMemo, useState } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import BackButton from '../components/BackButton';

type RatedFilter = 'all' | 'rated' | 'unrated';

const AdminBookings: React.FC = () => {
  const { t } = useLanguage();

  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtros UI
  const [dayFilter, setDayFilter] = useState<DayOfWeek | 'all'>('all');
  const [ratedFilter, setRatedFilter] = useState<RatedFilter>('all');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr(null);
      const list = await bookingService.getAllBookings(); // requiere auth (Bearer)
      setData(list);
    } catch (e: any) {
      setErr(e?.message || 'No se pudieron cargar los turnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return data
      .filter((b) => (dayFilter === 'all' ? true : b.day === dayFilter))
      .filter((b) =>
        ratedFilter === 'all'
          ? true
          : ratedFilter === 'rated'
          ? !!b.ratedAt
          : !b.ratedAt
      )
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.time.toLowerCase().includes(q) ||
          b.day.toLowerCase().includes(q)
        );
      })
      // más recientes primero (por bookedAt o createdAt)
      .sort((a, b) => {
        const da = a.bookedAt ? new Date(a.bookedAt).getTime() : 0;
        const db = b.bookedAt ? new Date(b.bookedAt).getTime() : 0;
        return db - da;
      });
  }, [data, dayFilter, ratedFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return;
    try {
      await bookingService.deleteBooking(id);
      setData((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e?.message || 'No se pudo eliminar el turno');
    }
  };

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : '-';

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-500">Listado de turnos creados</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <header className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <BackButton to="#" />
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        </header>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value as DayOfWeek | 'all')}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
              >
                <option value="all">Todos</option>
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {t(`days.${d}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={ratedFilter}
                onChange={(e) => setRatedFilter(e.target.value as RatedFilter)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
              >
                <option value="all">Todos</option>
                <option value="unrated">Sin calificar</option>
                <option value="rated">Calificados</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, email, hora…"
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={fetchAll}
              className="px-3 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-md"
            >
              Refrescar
            </button>
            <span className="text-sm text-gray-500">{filtered.length} resultados</span>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow overflow-x-auto border border-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando…</div>
          ) : err ? (
            <div className="p-8 text-center text-red-600">{err}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay turnos</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 font-semibold">Fecha creación</th>
                  <th className="px-4 py-3 font-semibold">Día</th>
                  <th className="px-4 py-3 font-semibold">Hora</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Calificación</th>
                  <th className="px-4 py-3 font-semibold">Comentario</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{fmtDate(b.bookedAt)}</td>
                    <td className="px-4 py-3">{t(`days.${b.day}`)}</td>
                    <td className="px-4 py-3">{b.time}</td>
                    <td className="px-4 py-3">{b.customerName}</td>
                    <td className="px-4 py-3">{b.customerEmail}</td>
                    <td className="px-4 py-3">
                      {b.ratedAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                          ★ {b.rating}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          Sin calificar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[280px] truncate" title={b.comment || ''}>
                      {b.comment || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBookings;
