import prisma from "../lib/prisma.js";


async function main() {
  // Listar usuarios
  const users = await prisma.user.findMany();
  console.log("Usuarios en DB:", users);

  // Crear un usuario de prueba
  const nuevo = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@prueba.com"
    }
  });
  console.log("Usuario creado:", nuevo);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
