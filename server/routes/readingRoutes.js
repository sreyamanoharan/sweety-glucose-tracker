
import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
} from "../controllers/readingController.js";

const router = express.Router();

// All reading routes require authentication
router.use(protect);

router.post("/", createReading);
router.get("/", getReadings);
router.put("/:id", updateReading);
router.delete("/:id", deleteReading);

export default router;
