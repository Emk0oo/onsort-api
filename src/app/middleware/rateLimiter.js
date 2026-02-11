// src/app/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const logger = require("../config/logger");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
  handler: (req, res, next, options) => {
    logger.warn("Rate limit hit: global", {
      event: "rate_limit_global",
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(options.statusCode).json(options.message);
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" },
  handler: (req, res, next, options) => {
    logger.log("security", "Rate limit hit: login (possible brute force)", {
      event: "rate_limit_login",
      ip: req.ip,
      email: req.body?.email || "unknown",
    });
    logger.alert("Login rate limit exceeded", {
      event: "rate_limit_login_alert",
      ip: req.ip,
    });
    res.status(options.statusCode).json(options.message);
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many registrations, please try again later" },
  handler: (req, res, next, options) => {
    logger.log("security", "Rate limit hit: registration", {
      event: "rate_limit_register",
      ip: req.ip,
    });
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = { globalLimiter, loginLimiter, registerLimiter };
