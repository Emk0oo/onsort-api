// src/app/tests/public.test.js
const request = require("supertest");
const app = require("../server");

describe("Public routes", () => {
  test("GET / returns 200 and the API status text", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("API working");
  });

  test("GET /api-docs.json returns 200 with JSON swagger spec", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("openapi");
  });
});
