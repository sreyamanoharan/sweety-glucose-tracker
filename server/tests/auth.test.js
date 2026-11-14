
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";

// Mock Prisma
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.unstable_mockModule("../config/db.js", () => ({
  default: prismaMock,
}));

// Import app after mocking Prisma
const { default: app } = await import("../app.js");

describe("Authentication API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_jwt_secret";
  });

  test("POST /api/auth/register - should register a new user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    prismaMock.user.create.mockResolvedValue({
      id: "test-user-1",
      name: "Test User",
      email: "test@example.com",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Registration successful.");
    expect(response.body.user.email).toBe("test@example.com");
  });

  test("POST /api/auth/register - should reject duplicate email", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Email already registered.");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  test("POST /api/auth/login - should reject invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });
});
