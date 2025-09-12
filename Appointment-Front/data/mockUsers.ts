import { User } from '../types';

// NOTE: In a real app, passwords would be hashed. This is for simulation only.
export const MOCK_USERS: (User & { password_plaintext: string })[] = [
  { id: '1', email: 'owner@company.com', name: 'Alex Owner', role: 'owner', password_plaintext: 'password123' },
  { id: '2', email: 'manager@company.com', name: 'Maria Manager', role: 'manager', password_plaintext: 'password123' },
  { id: '3', email: 'leader@company.com', name: 'Leo Leader', role: 'leader', password_plaintext: 'password123' },
  { id: '4', email: 'employee@company.com', name: 'Eva Employee', role: 'employee', password_plaintext: 'password123' },
  { id: '5', email: 'admin@admin.com', name: 'Admin User', role: 'owner', password_plaintext: 'admin' },
];