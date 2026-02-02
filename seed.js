const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminRawPassword = process.env.ADMIN_PASSWORD;

  
  if (!adminEmail || !adminRawPassword) {
    console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file");
    process.exit(1);
  }

  console.log('Seeding admin user...');

  // Password-ah encrypt panrom
  const hashedPassword = await bcrypt.hash(adminRawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      name: 'Innovation Coach',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('--- Database Seeded Successfully ---');
  console.log('Admin Email:', admin.email);
  console.log('Role:', admin.role);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });