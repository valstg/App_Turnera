import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MOCK_USERS = [
  { email: 'owner@company.com', name: 'Alex Owner', role: 'owner', password: 'password123' },
  { email: 'manager@company.com', name: 'Maria Manager', role: 'manager', password: 'password123' },
  { email: 'leader@company.com', name: 'Leo Leader', role: 'leader', password: 'password123' },
  { email: 'employee@company.com', name: 'Eva Employee', role: 'employee', password: 'password123' },
  { email: 'admin@admin.com', name: 'Admin User', role: 'owner', password: 'admin' }
];

async function main() {
  console.log('Seeding users...');
  for (const u of MOCK_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, role: u.role, passwordHash },
      create: { email: u.email.toLowerCase(), name: u.name, role: u.role, passwordHash }
    });
  }

  console.log('Seeding default schedule...');
  const defaultSchedule = {
    weeklySchedule: [
      { day: 'Monday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
      { day: 'Tuesday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
      { day: 'Wednesday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
      { day: 'Thursday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
      { day: 'Friday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
      { day: 'Saturday', isEnabled: false, startTime: '09:00', endTime: '13:00', overbookingRules: [] },
      { day: 'Sunday', isEnabled: false, startTime: '09:00', endTime: '13:00', overbookingRules: [] }
    ],
    updatedAt: new Date().toISOString()
  };

  await prisma.setting.upsert({
    where: { key: 'schedule' },
    update: { value: defaultSchedule },
    create: { key: 'schedule', value: defaultSchedule }
  });

  console.log('Seed done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
