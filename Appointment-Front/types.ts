export interface OverbookingRule {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface DaySchedule {
  day: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  overbookingRules: OverbookingRule[];
}

export interface ScheduleConfig {
  slotDuration: number;
  weeklySchedule: DaySchedule[];
}

export interface GeneratedSlot {
    day: string;
    time: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Added for authentication
export type UserRole = 'owner' | 'manager' | 'leader' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  day: DayOfWeek;
  time: string;
  bookedAt: string; // ISO string date
  rating?: number;
  comment?: string;
  ratedAt?: string; // ISO string date
}
