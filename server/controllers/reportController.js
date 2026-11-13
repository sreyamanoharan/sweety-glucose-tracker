
import prisma from "../config/db.js";

// Validate selected date
const isValidDate = (date) => {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// Get report statistics
const calculateStats = (readings) => {
  if (readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      totalReadings: 0,
    };
  }

  const values = readings.map((reading) => reading.value);

  const highest = Math.max(...values);
  const lowest = Math.min(...values);

  const average =
    Math.round(
      (values.reduce((sum, value) => sum + value, 0) /
        values.length) *
        10
    ) / 10;

  return {
    highest,
    lowest,
    average,
    totalReadings: readings.length,
  };
};

// Get readings within a date range
const getReadingsInRange = async (userId, startDate, endDate) => {
  return prisma.reading.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: [
      { date: "asc" },
      { createdAt: "asc" },
    ],
  });
};

// DAILY REPORT
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);

    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const readings = await getReadingsInRange(
      req.user.userId,
      startDate,
      endDate
    );

    return res.status(200).json({
      reportType: "daily",
      date,
      ...calculateStats(readings),
      readings,
      message:
        readings.length === 0
          ? "No readings found for this date. Start by adding your first reading!"
          : "Daily report generated successfully.",
    });
  } catch (error) {
    console.error("Daily report error:", error);

    return res.status(500).json({
      message: "Failed to generate daily report.",
    });
  }
};

// MONTH-TO-DATE REPORT
export const getMonthToDateReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const startDate = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        1
      )
    );

    const endDate = new Date(selectedDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const readings = await getReadingsInRange(
      req.user.userId,
      startDate,
      endDate
    );

    return res.status(200).json({
      reportType: "month-to-date",
      dateRange: {
        from: startDate.toISOString().slice(0, 10),
        to: date,
      },
      ...calculateStats(readings),
      message:
        readings.length === 0
          ? "No readings found for this period."
          : "Month-to-date report generated successfully.",
    });
  } catch (error) {
    console.error("Month-to-date report error:", error);

    return res.status(500).json({
      message: "Failed to generate month-to-date report.",
    });
  }
};

// PREVIOUS MONTH REPORT
export const getMonthlyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (date > today) {
      return res.status(400).json({
        message: "Date cannot be in the future.",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    const startDate = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth() - 1,
        1
      )
    );

    const endDate = new Date(
      Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        1
      )
    );

    const readings = await getReadingsInRange(
      req.user.userId,
      startDate,
      endDate
    );

    return res.status(200).json({
      reportType: "monthly",
      dateRange: {
        from: startDate.toISOString().slice(0, 10),
        to: new Date(endDate.getTime() - 86400000)
          .toISOString()
          .slice(0, 10),
      },
      ...calculateStats(readings),
      message:
        readings.length === 0
          ? "No readings found for the previous month."
          : "Monthly report generated successfully.",
    });
  } catch (error) {
    console.error("Monthly report error:", error);

    return res.status(500).json({
      message: "Failed to generate monthly report.",
    });
  }
};
