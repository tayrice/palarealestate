const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@pala.de" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pala.de",
      passwordHash: adminHash,
      role: "admin",
    },
  });

  const staffHash = await bcrypt.hash("staff123", 12);
  await prisma.user.upsert({
    where: { email: "mitarbeiter@pala.de" },
    update: {},
    create: {
      name: "Max Mustermann",
      email: "mitarbeiter@pala.de",
      passwordHash: staffHash,
      role: "staff",
    },
  });

  const lead = await prisma.lead.upsert({
    where: { refNumber: "DEMO-2026-001" },
    update: {},
    create: {
      refNumber: "DEMO-2026-001",
      status: "open",
      source: "ankaufstation",
      priority: "high",
      customerName: "Maria Schmidt",
      customerPhone: "+49 170 1234567",
      customerEmail: "m.schmidt@beispiel.de",
      whatsappOptIn: true,
      propertyType: "haus",
      address: "Musterstrasse 12",
      city: "Muenchen",
      zip: "80331",
      livingArea: 180,
      plotArea: 600,
      rooms: "5",
      bathrooms: 2,
      yearBuilt: "1998",
      condition: "gut",
      energyClass: "C",
      hasGarage: true,
      photos: "[]",
      priceExpectation: 750000,
      sellTimeline: "30days",
      lastActivityAt: new Date(),
    },
  });

  console.log("Seed abgeschlossen");
  console.log("Admin: admin@pala.de / admin123");
  console.log("Mitarbeiter: mitarbeiter@pala.de / staff123");
  console.log(`Demo-Lead: ${lead.refNumber}`);
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
