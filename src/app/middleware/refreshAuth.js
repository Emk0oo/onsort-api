// src/app/middleware/refreshAuth.js
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

function refreshAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    logger.log("security", "RefreshAuth: no refresh token provided", {
      event: "refresh_no_token",
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    logger.log("security", "RefreshAuth: invalid refresh token format", {
      event: "refresh_invalid_format",
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "Invalid refresh token format" });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.log("security", "RefreshAuth: invalid or expired refresh token", {
        event: "refresh_token_invalid",
        ip: req.ip,
        path: req.originalUrl,
        error: err.message,
      });
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
    req.user = user;
    next();
  });
}

module.exports = refreshAuth;
