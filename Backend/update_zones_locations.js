import prisma from "./src/lib/prisma.js";

async function main() {
  const updates = [
    { name: "Parque la ceiba", location: "https://maps.app.goo.gl/yquq5UdNr2AnSyo3A" },
    { name: "Parque guayubin", location: "https://maps.app.goo.gl/RqS1n89FCTEyi9z29" },
    { name: "Parque las avenidas", location: "https://maps.app.goo.gl/a2Qfe9pKjCs98ne86" }
  ];

  console.log("Updating zone locations...");

  for (const update of updates) {
    const zone = await prisma.zone.findFirst({
        where: { name: { contains: update.name, mode: 'insensitive' } }
    });
    
    if (zone) {
        await prisma.zone.update({
            where: { id: zone.id },
            data: { location: update.location }
        });
        console.log(`Updated ${zone.name} with location: ${update.location}`);
    } else {
        console.log(`Zone not found: ${update.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
