
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

const prismaMock = {
  $transaction: jest.fn(),
  reading: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
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

describe("Glucose Reading API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_jwt_secret";
  });

const token = () =>
  jwt.sign(
    { userId: "test-user-1" },
    process.env.JWT_SECRET
  );

  test("should reject glucose value below 40", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        date: "2026-11-13",
        slot: "MORNING",
        value: 30,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Value must be between 40 and 600 mg/dl."
    );
  });

  test("should reject glucose value above 600", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        date: "2026-11-13",
        slot: "MORNING",
        value: 650,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Value must be between 40 and 600 mg/dl."
    );
  });

  test("should reject a future date", async () => {
    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        date: "2099-01-01",
        slot: "MORNING",
        value: 120,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Date cannot be in the future."
    );
  });

  test("should create a valid glucose reading", async () => {
    const mockReading = {
      id: "reading-1",
      userId: "test-user-1",
      date: new Date("2026-11-13T00:00:00.000Z"),
      slot: "MORNING",
      value: 120,
    };

    prismaMock.$transaction.mockImplementation(async (callback) => {
      return callback({
        reading: {
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockResolvedValue(mockReading),
        },
      });
    });

    const response = await request(app)
      .post("/api/readings")
      .set("Authorization", `Bearer ${token()}`)
      .send({
        date: "2026-11-13",
        slot: "MORNING",
        value: 120,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe(
      "Glucose reading added successfully."
    );
    expect(response.body.reading.value).toBe(120);
  });
  test("should reject duplicate reading for the same date and slot", async () => {
  prismaMock.$transaction.mockRejectedValue({
    code: "P2002",
  });

  const response = await request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token()}`)
    .send({
      date: "2026-11-13",
      slot: "MORNING",
      value: 120,
    });

  expect(response.statusCode).toBe(409);
  expect(response.body.message).toBe(
    "You already have a reading for this slot on this date."
  );
});
test("should reject more than four readings per day", async () => {
  prismaMock.$transaction.mockImplementation(async (callback) => {
    return callback({
      reading: {
        count: jest.fn().mockResolvedValue(4),
        create: jest.fn(),
      },
    });
  });

  const response = await request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token()}`)
    .send({
      date: "2026-11-13",
      slot: "AFTER_DINNER",
      value: 140,
    });

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe(
    "You can add only 4 readings per day."
  );
});
test("should reject an invalid time slot", async () => {
  const response = await request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token()}`)
    .send({
      date: "2026-11-13",
      slot: "NIGHT",
      value: 120,
    });

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe(
    "Please select a valid time slot."
  );
});
test("should reject a missing glucose value", async () => {
  const response = await request(app)
    .post("/api/readings")
    .set("Authorization", `Bearer ${token()}`)
    .send({
      date: "2026-11-13",
      slot: "MORNING",
    });

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe(
    "Please enter a glucose value."
  );
});
});
