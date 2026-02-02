import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const publishers = await prisma.publisher.findMany({ take: 50 });
  console.log(JSON.stringify(publishers, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
