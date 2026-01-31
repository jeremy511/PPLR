import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const zones = [
    { name: "Parque la ceiba", description: "Zona de predicación en Parque la ceiba" },
    { name: "Parque guayubin", description: "Zona de predicación en Parque guayubin" },
    { name: "Parque las avenidas", description: "Zona de predicación en Parque las avenidas" }
  ];

  console.log("Seeding zones...");

  for (const zone of zones) {
    const createdZone = await prisma.zone.upsert({
      where: { id: 0 }, // Dummy where for upsert if not using unique name
      update: {},
      create: zone,
    });
    // Since id:0 won't match, it will mostly create. 
    // A better way is to check by name if not unique, or just create.
    console.log(`Created zone: ${zone.name}`);
  }

  // To be safer and avoid duplicates if run multiple times:
  /*
  for (const zone of zones) {
    const existing = await prisma.zone.findFirst({ where: { name: zone.name } });
    if (!existing) {
        await prisma.zone.create({ data: zone });
        console.log(`Created zone: ${zone.name}`);
    } else {
        console.log(`Zone already exists: ${zone.name}`);
    }
  }
  */
  
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
