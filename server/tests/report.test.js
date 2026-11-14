
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

const prismaMock = {
  reading: {
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.unstable_mockModule("../config/db.js", () => ({
  default: prismaMock,
}));

const { default: app } = await import("../app.js");

describe("Glucose Report API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_jwt_secret";
  });

  const token = () =>
    jwt.sign(
      { userId: "test-user-1" },
      process.env.JWT_SECRET
    );

  test("should generate daily report with statistics", async () => {
    prismaMock.reading.findMany.mockResolvedValue([
      { id: "1", value: 100, slot: "MORNING" },
      { id: "2", value: 150, slot: "AFTER_BREAKFAST" },
      { id: "3", value: 125, slot: "AFTER_LUNCH" },
    ]);

    const response = await request(app)
      .get("/api/reports/daily?date=2026-11-13")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.reportType).toBe("daily");
    expect(response.body.highest).toBe(150);
    expect(response.body.lowest).toBe(100);
    expect(response.body.average).toBe(125);
    expect(response.body.totalReadings).toBe(3);
  });

  test("should reject an invalid report date", async () => {
    const response = await request(app)
      .get("/api/reports/daily?date=invalid-date")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Please provide a valid date in YYYY-MM-DD format."
    );
  });

  test("should generate month-to-date report", async () => {
    prismaMock.reading.findMany.mockResolvedValue([
      { id: "1", value: 100 },
      { id: "2", value: 200 },
    ]);

    const response = await request(app)
      .get("/api/reports/month-to-date?date=2026-11-13")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.reportType).toBe("month-to-date");
    expect(response.body.highest).toBe(200);
    expect(response.body.lowest).toBe(100);
    expect(response.body.average).toBe(150);
    expect(response.body.totalReadings).toBe(2);
  });

  test("should generate previous monthly report", async () => {
    prismaMock.reading.findMany.mockResolvedValue([
      { id: "1", value: 110 },
      { id: "2", value: 130 },
    ]);

    const response = await request(app)
      .get("/api/reports/monthly?date=2026-11-13")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.reportType).toBe("monthly");
    expect(response.body.dateRange.from).toBe("2026-10-01");
    expect(response.body.dateRange.to).toBe("2026-10-31");
    expect(response.body.average).toBe(120);
  });

  test("should return empty statistics when no readings exist", async () => {
    prismaMock.reading.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get("/api/reports/daily?date=2026-11-13")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.highest).toBeNull();
    expect(response.body.lowest).toBeNull();
    expect(response.body.average).toBeNull();
    expect(response.body.totalReadings).toBe(0);
  });
});
