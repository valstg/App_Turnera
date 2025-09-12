import API from './api';
import type { ScheduleConfig } from '../types';

export const scheduleService = {
  get: async (): Promise<ScheduleConfig> => {
    const res = await fetch(`${API}/api/schedule`);
    if (!res.ok) throw new Error('No se pudo obtener la agenda');
    const data = await res.json(); // { weeklySchedule, updatedAt? }
    // default si el backend no lo manda
    return { slotDuration: data.slotDuration ?? 30, ...data } as ScheduleConfig;
  },

  update: async (weeklySchedule: ScheduleConfig['weeklySchedule']) => {
    const res = await fetch(`${API}/api/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth_token')
          ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          : {}),
      },
      body: JSON.stringify({ weeklySchedule }),
    });
    if (!res.ok) throw new Error('No se pudo actualizar la agenda');
    return res.json();
  },
};
