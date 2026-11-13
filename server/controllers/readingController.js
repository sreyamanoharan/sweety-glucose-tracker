
import prisma from "../config/db.js";

const VALID_SLOTS = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

// Validate glucose value
const validateValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Please enter a glucose value.";
  }

  if (
    !Number.isInteger(Number(value)) ||
    Number(value) < 40 ||
    Number(value) > 600
  ) {
    return "Value must be between 40 and 600 mg/dl.";
  }

  return null;
};

// Validate date
const validateDate = (date) => {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return "Please provide a valid date.";
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return "Please provide a valid date.";
  }

  const today = new Date().toLocaleDateString("en-CA");

  if (date > today) {
    return "Date cannot be in the future.";
  }

  return null;
};

// Validate slot
const validateSlot = (slot) => {
  if (!VALID_SLOTS.includes(slot)) {
    return "Please select a valid time slot.";
  }

  return null;
};

// CREATE READING
export const createReading = async (req, res) => {
  try {
    const { date, slot, value } = req.body;
    const userId = req.user.userId;

    const valueError = validateValue(value);
    if (valueError) {
      return res.status(400).json({ message: valueError });
    }

    const dateError = validateDate(date);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const slotError = validateSlot(slot);
    if (slotError) {
      return res.status(400).json({ message: slotError });
    }

    const reading = await prisma.$transaction(
      async (tx) => {
        const count = await tx.reading.count({
          where: {
            userId,
            date: new Date(`${date}T00:00:00.000Z`),
          },
        });

        if (count >= 4) {
          throw new Error("DAILY_LIMIT_REACHED");
        }

        return tx.reading.create({
          data: {
            userId,
            date: new Date(`${date}T00:00:00.000Z`),
            slot,
            value: Number(value),
          },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return res.status(201).json({
      message: "Glucose reading added successfully.",
      reading,
    });
  } catch (error) {
    if (error.message === "DAILY_LIMIT_REACHED") {
      return res.status(400).json({
        message: "You can add only 4 readings per day.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "You already have a reading for this slot on this date.",
      });
    }

    console.error("Create reading error:", error);

    return res.status(500).json({
      message: "Failed to add glucose reading.",
    });
  }
};

// GET ALL READINGS
export const getReadings = async (req, res) => {
  try {
    const readings = await prisma.reading.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json({
      count: readings.length,
      readings,
    });
  } catch (error) {
    console.error("Get readings error:", error);

    return res.status(500).json({
      message: "Failed to fetch readings.",
    });
  }
};

// UPDATE READING
export const updateReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, slot, value } = req.body;
    const userId = req.user.userId;

    const valueError = validateValue(value);
    if (valueError) {
      return res.status(400).json({ message: valueError });
    }

    const dateError = validateDate(date);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const slotError = validateSlot(slot);
    if (slotError) {
      return res.status(400).json({ message: slotError });
    }

    const updatedReading = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.reading.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          throw new Error("READING_NOT_FOUND");
        }

        const newDate = new Date(`${date}T00:00:00.000Z`);

        const otherReadings = await tx.reading.count({
          where: {
            userId,
            date: newDate,
            id: { not: id },
          },
        });

        if (otherReadings >= 4) {
          throw new Error("DAILY_LIMIT_REACHED");
        }

        return tx.reading.update({
          where: { id },
          data: {
            date: newDate,
            slot,
            value: Number(value),
          },
        });
      },
      {
        isolationLevel: "Serializable",
      }
    );

    return res.status(200).json({
      message: "Glucose reading updated successfully.",
      reading: updatedReading,
    });
  } catch (error) {
    if (error.message === "READING_NOT_FOUND") {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    if (error.message === "DAILY_LIMIT_REACHED") {
      return res.status(400).json({
        message: "You can add only 4 readings per day.",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "You already have a reading for this slot for this date.",
      });
    }

    console.error("Update reading error:", error);

    return res.status(500).json({
      message: "Failed to update reading.",
    });
  }
};

// DELETE READING
export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.reading.deleteMany({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Reading not found.",
      });
    }

    return res.status(200).json({
      message: "Glucose reading deleted successfully.",
    });
  } catch (error) {
    console.error("Delete reading error:", error);

    return res.status(500).json({
      message: "Failed to delete reading.",
    });
  }
};
