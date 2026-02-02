
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma Client...');
    // Try to find a zone with the active field selected (or just check the model)
    // We can just try to count zones active: true
    const count = await prisma.zone.count({
        where: { active: true }
    });
    console.log('SUCCESS: Active field recognized. Count:', count);
  } catch (e) {
    console.error('FAILURE:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
