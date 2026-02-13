import prisma from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";


async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const publisherPassword = await bcrypt.hash("123456", 10);

  //Admin
  const admin = await prisma.publisher.create({
    data: {
      firstName: "Admin",
      lastName: "Principal",
      phone: "+541122334455",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create regular publishers
  const publisher1 = await prisma.publisher.create({
    data: {
      firstName: "Juan",
      lastName: "Pérez",
      phone: "+541122334466",
      email: "juan@example.com",
      password: publisherPassword,
      role: "PUBLISHER",
    },
  });

  const publisher2 = await prisma.publisher.create({
    data: {
      firstName: "María",
      lastName: "López",
      phone: "+541122334477",
      email: "maria@example.com",
      password: publisherPassword,
      role: "PUBLISHER",
    },
  });

  // Crear un horario
  const schedule = await prisma.schedule.create({
    data: {
      startTime: new Date("2025-08-27T08:00:00Z"),
      endTime: new Date("2025-08-27T10:00:00Z"),
    },
  });

  // Crear un carrito
  const cart = await prisma.cart.create({
    data: {
      number: 1,
    },
  });

  // Crear una zona
  const zone = await prisma.zone.create({
    data: {
      name: "Zona Norte",
      description: "Cobertura norte de la ciudad",
    },
  });

  // Special Zone: Jardin Botanico
  const specialZoneName = "Jardin Botanico";
  const existingSpecialZone = await prisma.zone.findFirst({
    where: { name: specialZoneName }
  });

  if (!existingSpecialZone) {
    await prisma.zone.create({
      data: {
        name: specialZoneName,
        description: "Zona especial para la reunión anual (5-8 Marzo)",
        color: "#10b981", // Emerald-500
        active: true,
        location: "Jardin Botanico",
        warehouse: "N/A",
        instructions: "Solo disponible del 5 al 8 de Marzo."
      }
    });
    console.log(`Zone '${specialZoneName}' created.`);
  } else if (!existingSpecialZone.active) {
      await prisma.zone.update({
          where: { id: existingSpecialZone.id },
          data: { active: true }
      });
      console.log(`Zone '${specialZoneName}' activated.`);
  }

  // Relacionar carrito con zona
  await prisma.cartZone.create({
    data: {
      cartId: cart.id,
      zoneId: zone.id,
    },
  });

  console.log({ admin, publisher1, publisher2, schedule, cart, zone });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
