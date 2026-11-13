
import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

// All report endpoints require authentication
router.use(protect);

router.get("/daily", getDailyReport);
router.get("/month-to-date", getMonthToDateReport);
router.get("/monthly", getMonthlyReport);

export default router;
