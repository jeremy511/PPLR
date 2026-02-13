
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const zoneName = "Jardin Botanico";
  
  console.log(`Checking for zone: ${zoneName}...`);

  const existingZone = await prisma.zone.findFirst({
    where: { name: zoneName }
  });

  if (existingZone) {
    console.log(`Zone '${zoneName}' already exists.`);
    // Ensure it is active
    if (!existingZone.active) {
        await prisma.zone.update({
            where: { id: existingZone.id },
            data: { active: true }
        });
        console.log(`Zone '${zoneName}' activated.`);
    }
  } else {
    console.log(`Creating zone '${zoneName}'...`);
    await prisma.zone.create({
      data: {
        name: zoneName,
        description: "Zona especial para la reunión anual (5-8 Marzo)",
        color: "#10b981", // Emerald-500
        active: true,
        location: "Jardin Botanico",
        warehouse: "N/A",
        instructions: "Solo disponible del 5 al 8 de Marzo."
      }
    });
    console.log(`Zone '${zoneName}' created successfully.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
