import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const userId = process.argv[2] ? parseInt(process.argv[2]) : null;
  if (!userId) {
    console.log("Please provide a userId as an argument.");
    return;
  }

  console.log(`Checking shifts for userId: ${userId}`);

  const shiftPublishers = await prisma.shiftPublisher.findMany({
    where: { publisherId: userId },
    include: { shift: true }
  });

  console.log(`Found ${shiftPublishers.length} entries in ShiftPublisher for this user.`);
  shiftPublishers.forEach(sp => {
    console.log(`- Shift ID: ${sp.shiftId}, Date: ${sp.shift.date}, Status: ${sp.shift.status}`);
  });

  const responsibleShifts = await prisma.shift.findMany({
    where: { responsableId: userId }
  });

  console.log(`Found ${responsibleShifts.length} shifts where user is Responsable.`);
  responsibleShifts.forEach(s => {
    console.log(`- Shift ID: ${s.id}, Date: ${s.date}, Status: ${s.status}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
