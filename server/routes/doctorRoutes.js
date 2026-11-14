
import express from "express";
import protect, {
  authorizeDoctor,
} from "../middleware/authMiddleware.js";

import {
  getAssignedPatients,
  assignPatient,
} from "../controllers/doctorController.js";

import {
  getDoctorDailyReport,
  getDoctorMonthToDateReport,
  getDoctorMonthlyReport,
} from "../controllers/doctorReportController.js";

const router = express.Router();

// All doctor routes require authentication and doctor role
router.use(protect);
router.use(authorizeDoctor);

// List assigned patients
router.get("/patients", getAssignedPatients);
router.get(
  "/patients/:patientId/reports/daily",
  getDoctorDailyReport
);

router.get(
  "/patients/:patientId/reports/month-to-date",
  getDoctorMonthToDateReport
);

router.get(
  "/patients/:patientId/reports/monthly",
  getDoctorMonthlyReport
);
// Assign a patient
router.post("/patients", assignPatient);

export default router;
