import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.publisher.count();
  console.log('Total Publishers:', count);
  const publishers = await prisma.publisher.findMany({ select: { id: true, firstName: true, lastName: true, email: true } });
  console.log('Publishers:', JSON.stringify(publishers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
