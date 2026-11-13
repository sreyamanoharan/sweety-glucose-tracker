
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Demo@12345", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "demo@sweety.com",
    },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@sweety.com",
      password: hashedPassword,
    },
  });

  const readings = [
    { date: "2026-11-10", slot: "MORNING", value: 95 },
    { date: "2026-11-10", slot: "AFTER_BREAKFAST", value: 145 },
    { date: "2026-11-10", slot: "AFTER_LUNCH", value: 132 },
    { date: "2026-11-10", slot: "AFTER_DINNER", value: 118 },
    { date: "2026-11-11", slot: "MORNING", value: 102 },
    { date: "2026-11-11", slot: "AFTER_BREAKFAST", value: 155 },
    { date: "2026-11-12", slot: "MORNING", value: 98 },
  ];

  for (const reading of readings) {
    await prisma.reading.upsert({
      where: {
        userId_date_slot: {
          userId: user.id,
          date: new Date(`${reading.date}T00:00:00.000Z`),
          slot: reading.slot,
        },
      },
      update: {
        value: reading.value,
      },
      create: {
        userId: user.id,
        date: new Date(`${reading.date}T00:00:00.000Z`),
        slot: reading.slot,
        value: reading.value,
      },
    });
  }

  console.log("Demo user and glucose readings seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
