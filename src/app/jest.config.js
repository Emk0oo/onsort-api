// src/app/jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text-summary"],
  collectCoverageFrom: [
    "server.js",
    "middleware/**/*.js",
    "controller/**/*.js",
  ],
};
