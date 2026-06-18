// src/app/tests/auth.test.js
// Exercises middleware/auth.js through a protected route (GET /api/activities),
// without touching the database (auth fails before any controller runs).
const request = require("supertest");
const app = require("../server");

describe("Auth middleware", () => {
  test("returns 401 when no Authorization header is provided", async () => {
    const res = await request(app).get("/api/activities");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test("returns 401 when the token format is invalid", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", "Bearer");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Invalid token format" });
  });

  test("returns 403 when the token is invalid or expired", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Invalid or expired token" });
  });
});
