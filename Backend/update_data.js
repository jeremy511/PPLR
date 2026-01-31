import prisma from "./src/lib/prisma.js";

async function main() {
  const publishers = await prisma.publisher.findMany();
  
  for (const pub of publishers) {
    let gender = "MALE";
    let age = 30;

    const nameLower = pub.name.toLowerCase();
    if (nameLower.includes("mar") || nameLower.includes("lopez") || nameLower.includes("gar")) {
      gender = "FEMALE";
      age = 35;
    } else if (nameLower.includes("juan") || nameLower.includes("perez") || nameLower.includes("jeremy") || nameLower.includes("admin")) {
      gender = "MALE";
      age = nameLower.includes("perez") ? 45 : 32;
    }
    
    await prisma.publisher.update({
      where: { id: pub.id },
      data: { gender, age }
    });
    console.log(`Updated ${pub.name}: ${gender}, ${age}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
