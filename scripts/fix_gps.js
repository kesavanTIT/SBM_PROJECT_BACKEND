import pg from 'pg/lib/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const branches = await prisma.branch.findMany();
  for (const branch of branches) {
    console.log(`Checking branch ${branch.name}: lat=${branch.latitude}, lng=${branch.longitude}`);
    let changed = false;
    let lat = branch.latitude;
    let lng = branch.longitude;

    if (Math.abs(lat) > 90) {
      let str = lat.toString().replace('.', '');
      lat = parseFloat(str.substring(0, 2) + '.' + str.substring(2));
      changed = true;
    }

    if (Math.abs(lng) > 180) {
      let str = lng.toString().replace('.', '');
      lng = parseFloat(str.substring(0, 2) + '.' + str.substring(2));
      changed = true;
    }

    if (changed) {
      await prisma.branch.update({
        where: { id: branch.id },
        data: { latitude: lat, longitude: lng }
      });
      console.log(`Updated branch ${branch.name}: ${lat}, ${lng}`);
    }
  }
  console.log("Done fixing GPS coordinates.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
