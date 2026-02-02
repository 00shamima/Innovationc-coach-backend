const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Unga password-ah encrypt panrom (Security mukkiyam)
  const hashedPassword = await bcrypt.hash('282868##vs', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'shami28@gmail.com' },
    update: {
      password: hashedPassword 
    },
    create: {
      name: 'Innovation Coach',
      email: 'shami28@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('--- Database Seeded Successfully ---');
  console.log('Email:', admin.email);
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