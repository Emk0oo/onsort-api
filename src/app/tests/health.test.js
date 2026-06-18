// src/app/tests/health.test.js
// The /health handler lazily requires ../config/db and runs `SELECT 1`.
// We mock the pool so no real MySQL connection is opened.
const mockQuery = jest.fn();
jest.mock("../config/db", () => ({ query: (...args) => mockQuery(...args) }));

const request = require("supertest");
const app = require("../server");

describe("GET /health", () => {
  afterEach(() => mockQuery.mockReset());

  test("returns 200 and status ok when the database responds", async () => {
    mockQuery.mockResolvedValueOnce([[{ "1": 1 }]]);
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database.status).toBe("connected");
  });

  test("returns 503 and degraded status when the database is unreachable", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection refused"));
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.database.status).toBe("disconnected");
  });
});
