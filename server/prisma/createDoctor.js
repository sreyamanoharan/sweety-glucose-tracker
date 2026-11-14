
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

const createDoctor = async () => {
  try {
    const name = process.env.DOCTOR_NAME;
    const email = process.env.DOCTOR_EMAIL?.trim().toLowerCase();
    const password = process.env.DOCTOR_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "Please provide DOCTOR_NAME, DOCTOR_EMAIL and DOCTOR_PASSWORD."
      );
    }

    if (password.length < 6) {
      throw new Error("Doctor password must be at least 6 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: "DOCTOR",
      },
      create: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("Doctor account created successfully:");
    console.log(doctor);
  } catch (error) {
    console.error("Doctor creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createDoctor();
