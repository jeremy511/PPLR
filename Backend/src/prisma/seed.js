import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const publisherPassword = await bcrypt.hash("123456", 10);

  //Admin

  const admin = await prisma.publisher.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create regular publishers
  const publisher1 = await prisma.publisher.create({
    data: {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: publisherPassword,
      role: "PUBLISHER",
    },
  });

  const publisher2 = await prisma.publisher.create({
    data: {
      name: "María López",
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
