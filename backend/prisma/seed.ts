import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@enterprise-platform.com' },
    update: {},
    create: {
      email: 'admin@enterprise-platform.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      isVerified: true,
      mfaEnabled: false,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('UserPassword123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@enterprise-platform.com' },
    update: {},
    create: {
      email: 'user@enterprise-platform.com',
      password: userPassword,
      name: 'Test User',
      role: UserRole.USER,
      isVerified: true,
      mfaEnabled: false,
    },
  });

  console.log('✅ Test user created:', user.email);

  // Create moderator user
  const moderatorPassword = await bcrypt.hash('ModeratorPassword123!', 12);
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@enterprise-platform.com' },
    update: {},
    create: {
      email: 'moderator@enterprise-platform.com',
      password: moderatorPassword,
      name: 'Content Moderator',
      role: UserRole.MODERATOR,
      isVerified: true,
      mfaEnabled: false,
    },
  });

  console.log('✅ Moderator user created:', moderator.email);

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@enterprise-platform.com / AdminPassword123!');
  console.log('User: user@enterprise-platform.com / UserPassword123!');
  console.log('Moderator: moderator@enterprise-platform.com / ModeratorPassword123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
