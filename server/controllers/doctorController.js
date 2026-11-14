
import prisma from "../config/db.js";

// GET ASSIGNED PATIENTS
export const getAssignedPatients = async (req, res) => {
  try {
    const assignments = await prisma.doctorPatient.findMany({
      where: {
        doctorId: req.user.userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      count: assignments.length,
      patients: assignments.map((assignment) => ({
        ...assignment.patient,
        assignedAt: assignment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get assigned patients error:", error);

    return res.status(500).json({
      message: "Failed to fetch assigned patients.",
    });
  }
};

// ASSIGN PATIENT TO DOCTOR
export const assignPatient = async (req, res) => {
  try {
    const { patientEmail } = req.body;

    if (!patientEmail || typeof patientEmail !== "string") {
      return res.status(400).json({
        message: "Patient email is required.",
      });
    }

    const normalizedEmail = patientEmail.trim().toLowerCase();

    const patient = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    if (patient.role !== "PATIENT") {
      return res.status(400).json({
        message: "Only patient accounts can be assigned.",
      });
    }

    const assignment = await prisma.doctorPatient.create({
      data: {
        doctorId: req.user.userId,
        patientId: patient.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Patient assigned successfully.",
      patient: assignment.patient,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "This patient is already assigned to you.",
      });
    }

    console.error("Assign patient error:", error);

    return res.status(500).json({
      message: "Failed to assign patient.",
    });
  }
};

// CHECK DOCTOR-PATIENT ASSIGNMENT
export const getAssignedPatient = async (doctorId, patientId) => {
  return prisma.doctorPatient.findUnique({
    where: {
      doctorId_patientId: {
        doctorId,
        patientId,
      },
    },
  });
};
