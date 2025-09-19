// src/services/bookingService.ts
import API, { authHeader } from './api';
import type { Booking } from '../types';

//const authHeader = (): Record<string, string> => {
 // const t = localStorage.getItem('auth_token');
 // return t ? { Authorization: `Bearer ${t}` } : {};
//};

export type NewBooking = {
  customerName: string;
  customerEmail: string;
  day: string;   // "Monday".."Sunday"
  time: string;  // "HH:mm"
};

// Normaliza para que siempre exista bookedAt en el front
const normalize = (b: any): Booking => ({
  ...b,
  bookedAt: b?.bookedAt ?? b?.createdAt ?? undefined,
});

export const bookingService = {
  addBooking: async (b: NewBooking): Promise<Booking> => {
    const res = await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','Accept': 'application/json', ...authHeader() }, // 👈 agrega auth si existe
      body: JSON.stringify(b),
    });
    if (!res.ok) throw new Error('No se pudo crear el turno');
    const data = await res.json();
    console.log(data)
    return normalize(data);
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const res = await fetch(`${API}/api/bookings`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('No se pudo obtener la lista de turnos');
    const list = await res.json();
    return Array.isArray(list) ? list.map(normalize) : [];
  },

  rateBooking: async (id: string, rating: number, comment?: string): Promise<Booking> => {
    const res = await fetch(`${API}/api/bookings/${id}/rate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() }, // 👈 agrega auth si existe
      body: JSON.stringify({ rating, comment }),
    });
    if (!res.ok) throw new Error('No se pudo calificar el turno');
    const data = await res.json();
    return normalize(data);
  },

  deleteBooking: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API}/api/bookings/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('No se pudo eliminar el turno');
    return true;
  },

  // ---- Helpers para RatingPage ----

  // Busca un turno por email (no autenticado). Si tu backend aún no soporta este query,
  // devolvemos null y la UI mostrará "noBookingFound".
  findBookingToRateByEmail: async (email: string): Promise<Booking | null> => {
  const url = new URL(`${API}/api/bookings/public/find`);
  url.searchParams.set('email', email);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return data ? normalize(data) : null;
},


  // Solo delega al endpoint PATCH existente
  submitRating: async (id: string, rating: number, comment?: string): Promise<Booking> => {
    return bookingService.rateBooking(id, rating, comment);
  },
};
