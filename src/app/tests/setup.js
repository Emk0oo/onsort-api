// src/app/tests/setup.js
// Runs before each test file is loaded. Sets the env vars the app relies on
// so JWT verification and config loading behave deterministically in tests.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
