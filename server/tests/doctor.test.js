
import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

const prismaMock = {
  doctorPatient: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  reading: {
    findMany: jest.fn(),
  },
};

jest.unstable_mockModule("../config/db.js", () => ({
  default: prismaMock,
}));

const { default: app } = await import("../app.js");

describe("Doctor API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_jwt_secret";
  });

  const token = (role = "DOCTOR") =>
    jwt.sign(
      { userId: "doctor-1", role },
      process.env.JWT_SECRET
    );

  const patientId = "patient-1";
  const reportDate = "2026-11-13";

  // GET ASSIGNED PATIENTS
  test("should fetch assigned patients", async () => {
    prismaMock.doctorPatient.findMany.mockResolvedValue([
      {
        patient: {
          id: patientId,
          name: "Test Patient",
          email: "patient@test.com",
        },
        createdAt: new Date("2026-11-01"),
      },
    ]);

    const response = await request(app)
      .get("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.patients[0].email).toBe(
      "patient@test.com"
    );
  });

  // ASSIGN PATIENT
  test("should assign a patient successfully", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: patientId,
      name: "Test Patient",
      email: "patient@test.com",
      role: "PATIENT",
    });

    prismaMock.doctorPatient.create.mockResolvedValue({
      patient: {
        id: patientId,
        name: "Test Patient",
        email: "patient@test.com",
      },
    });

    const response = await request(app)
      .post("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`)
      .send({ patientEmail: "PATIENT@test.com" });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe(
      "Patient assigned successfully."
    );
    expect(response.body.patient.email).toBe(
      "patient@test.com"
    );
  });

  test("should reject assignment without patient email", async () => {
    const response = await request(app)
      .post("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Patient email is required."
    );
  });

  test("should reject assignment when patient does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`)
      .send({ patientEmail: "unknown@test.com" });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Patient not found.");
  });

  test("should reject assigning another doctor account", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "another-doctor",
      name: "Another Doctor",
      email: "another@test.com",
      role: "DOCTOR",
    });

    const response = await request(app)
      .post("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`)
      .send({ patientEmail: "another@test.com" });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Only patient accounts can be assigned."
    );
  });

  test("should reject duplicate patient assignment", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: patientId,
      name: "Test Patient",
      email: "patient@test.com",
      role: "PATIENT",
    });

    prismaMock.doctorPatient.create.mockRejectedValue({
      code: "P2002",
    });

    const response = await request(app)
      .post("/api/doctor/patients")
      .set("Authorization", `Bearer ${token()}`)
      .send({ patientEmail: "patient@test.com" });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe(
      "This patient is already assigned to you."
    );
  });

  // DOCTOR ACCESS CONTROL
  test("should reject unauthenticated doctor requests", async () => {
    const response = await request(app)
      .get("/api/doctor/patients");

    expect(response.statusCode).toBe(401);
  });

  test("should reject patient access to doctor routes", async () => {
    const response = await request(app)
      .get("/api/doctor/patients")
      .set("Authorization", `Bearer ${token("PATIENT")}`);

    expect(response.statusCode).toBe(403);
  });

  // DAILY REPORT
  test("should generate a daily report for an assigned patient", async () => {
    prismaMock.doctorPatient.findUnique.mockResolvedValue({
      doctorId: "doctor-1",
      patientId,
    });

    prismaMock.reading.findMany.mockResolvedValue([
      { value: 100 },
      { value: 120 },
      { value: 140 },
    ]);

    const response = await request(app)
      .get(
        `/api/doctor/patients/${patientId}/reports/daily?date=${reportDate}`
      )
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.reportType).toBe("daily");
    expect(response.body.highest).toBe(140);
    expect(response.body.lowest).toBe(100);
    expect(response.body.average).toBe(120);
    expect(response.body.totalReadings).toBe(3);
  });

  test("should reject an invalid report date", async () => {
    const response = await request(app)
      .get(
        `/api/doctor/patients/${patientId}/reports/daily?date=2026-02-30`
      )
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Please provide a valid date in YYYY-MM-DD format."
    );
  });

  test("should reject a future report date", async () => {
    const response = await request(app)
      .get(
        `/api/doctor/patients/${patientId}/reports/daily?date=2099-01-01`
      )
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Date cannot be in the future."
    );
  });

  test("should block reports for unassigned patients", async () => {
    prismaMock.doctorPatient.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .get(
        `/api/doctor/patients/${patientId}/reports/daily?date=${reportDate}`
      )
      .set("Authorization", `Bearer ${token()}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to view this patient's reports."
    );
  });
});
