// ==== Booking / Schedule ====

export interface OverbookingRule {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export type DayOfWeek =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'
  | 'Friday' | 'Saturday' | 'Sunday';

export interface DaySchedule {
  day: DayOfWeek | string;     // ← permito string por si el backend manda string suelto
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  overbookingRules: OverbookingRule[];
}

export interface ScheduleConfig {
  slotDuration: number;       // ← opcional: el backend actual no lo envía; lo completamos en el service
  weeklySchedule: DaySchedule[];
  updatedAt?: string;          // ← opcional por si lo usás
}

export interface GeneratedSlot {
  day: DayOfWeek | string;
  time: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  day: DayOfWeek | string;
  time: string;
  bookedAt?: string;           // ← tu UI usa bookedAt
  createdAt?: string;          // ← el backend hoy probablemente envía createdAt
  rating?: number;
  comment?: string;
  ratedAt?: string;
}

// ==== Auth ====

export type UserRole = 'owner' | 'manager' | 'leader' | 'employee' | 'admin'; // ← dejo admin por si lo usaste en mocks

export interface User {
  id?: string;                 // ← opcional: el login del backend puede no enviar id
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}
