import prisma from './src/config/db.js';

async function main() {
  const staff = await prisma.staff.findMany();
  console.log("All staff in DB:", staff.map(s => ({ id: s.id, staffId: s.staffId, name: s.name })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
