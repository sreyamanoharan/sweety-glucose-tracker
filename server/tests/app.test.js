
import request from "supertest";
import { jest, describe, test, expect } from "@jest/globals";
import app from "../app.js";

describe("Sweety API", () => {
  test("GET / should return API status message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Sweety Glucose Tracker API is running!"
    );
  });

  test("Unknown route should return 404", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.statusCode).toBe(404);
  });
});
