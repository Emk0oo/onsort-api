// src/app/tests/user.test.js
// Covers the early error branches of register/login by mocking the User model,
// so the controller logic runs without any real database access.
jest.mock("../models/user.model");

const request = require("supertest");
const User = require("../models/user.model");
const app = require("../server");

describe("User auth error cases", () => {
  afterEach(() => jest.clearAllMocks());

  test("POST /api/users/register returns 400 when the email is already in use", async () => {
    User.getByEmail.mockResolvedValueOnce({ iduser: 1, email: "taken@example.com" });

    const res = await request(app).post("/api/users/register").send({
      name: "John",
      surname: "Doe",
      email: "taken@example.com",
      username: "johndoe",
      password: "secret123",
      date_of_birth: "2000-01-01",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: "Email already in use" });
  });

  test("POST /api/users/login returns 404 when the user does not exist", async () => {
    User.getByEmail.mockResolvedValueOnce(null);

    const res = await request(app).post("/api/users/login").send({
      email: "unknown@example.com",
      password: "whatever",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
  });
});
