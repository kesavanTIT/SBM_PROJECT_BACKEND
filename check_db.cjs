const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findMany();
  console.log(JSON.stringify(staff.map(s => ({
    id: s.id,
    name: s.name,
    aadhaarNumber: s.aadhaarNumber,
    hasPhotoFront: !!s.aadhaarPhotoUrl,
    hasPhotoBack: !!s.aadhaarPhotoBackUrl
  })), null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
