
import prisma from "../config/db.js";

// Validate date format and actual calendar date
const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// Calculate report statistics
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

  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average:
      Math.round(
        (values.reduce((sum, value) => sum + value, 0) /
          values.length) * 10
      ) / 10,
    totalReadings: readings.length,
  };
};

// Verify doctor-patient assignment
const verifyAssignment = async (doctorId, patientId) => {
  return prisma.doctorPatient.findUnique({
    where: {
      doctorId_patientId: {
        doctorId,
        patientId,
      },
    },
  });
};

// Fetch patient readings within a date range
const getPatientReadings = async (patientId, startDate, endDate) => {
  return prisma.reading.findMany({
    where: {
      userId: patientId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
};

// Validate doctor access and report date
const validateRequest = async (req, res) => {
  const { patientId } = req.params;
  const { date } = req.query;

  if (!isValidDate(date)) {
    res.status(400).json({
      message: "Please provide a valid date in YYYY-MM-DD format.",
    });
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  if (date > today) {
    res.status(400).json({
      message: "Date cannot be in the future.",
    });
    return null;
  }

  const assignment = await verifyAssignment(
    req.user.userId,
    patientId
  );

  if (!assignment) {
    res.status(403).json({
      message: "You are not authorized to view this patient's reports.",
    });
    return null;
  }

  return { patientId, date };
};

// DAILY REPORT
export const getDoctorDailyReport = async (req, res) => {
  try {
    const validated = await validateRequest(req, res);
    if (!validated) return;

    const { patientId, date } = validated;

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const readings = await getPatientReadings(
      patientId,
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
          ? "No readings found for this date."
          : "Patient daily report generated successfully.",
    });
  } catch (error) {
    console.error("Doctor daily report error:", error);
    return res.status(500).json({
      message: "Failed to generate patient daily report.",
    });
  }
};

// MONTH-TO-DATE REPORT
export const getDoctorMonthToDateReport = async (req, res) => {
  try {
    const validated = await validateRequest(req, res);
    if (!validated) return;

    const { patientId, date } = validated;
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

    const readings = await getPatientReadings(
      patientId,
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
          : "Patient month-to-date report generated successfully.",
    });
  } catch (error) {
    console.error("Doctor month-to-date report error:", error);
    return res.status(500).json({
      message: "Failed to generate patient month-to-date report.",
    });
  }
};

// PREVIOUS MONTH REPORT
export const getDoctorMonthlyReport = async (req, res) => {
  try {
    const validated = await validateRequest(req, res);
    if (!validated) return;

    const { patientId, date } = validated;
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

    const readings = await getPatientReadings(
      patientId,
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
          : "Patient monthly report generated successfully.",
    });
  } catch (error) {
    console.error("Doctor monthly report error:", error);
    return res.status(500).json({
      message: "Failed to generate patient monthly report.",
    });
  }
};
