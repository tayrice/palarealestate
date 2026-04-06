import prismaPkg from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

async function main() {
  // Admin-Benutzer
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pala.de" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pala.de",
      passwordHash: adminHash,
      role: "admin",
    },
  });

  // Mitarbeiter
  const staffHash = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "mitarbeiter@pala.de" },
    update: {},
    create: {
      name: "Max Mustermann",
      email: "mitarbeiter@pala.de",
      passwordHash: staffHash,
      role: "staff",
    },
  });

  // Demo-Lead (Immobilie)
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
      address: "Musterstraße 12",
      city: "München",
      zip: "80331",
      livingArea: 180,
      plotArea: 600,
      rooms: "5",
      bathrooms: 2,
      yearBuilt: "1998",
      condition: "gut",
      energyClass: "C",
      hasGarage: true,
      priceExpectation: 750000,
      sellTimeline: "30days",
      lastActivityAt: new Date(),
    },
  });

  console.log("✅ Seed abgeschlossen:");
  console.log(`  Admin:      admin@pala.de / admin123`);
  console.log(`  Mitarbeiter: mitarbeiter@pala.de / staff123`);
  console.log(`  Demo-Lead:  ${lead.refNumber}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
