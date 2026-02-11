// src/app/middleware/auth.js
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    logger.log("security", "Auth: no token provided", {
      event: "auth_no_token",
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    logger.log("security", "Auth: invalid token format", {
      event: "auth_invalid_format",
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "Invalid token format" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.log("security", "Auth: invalid or expired token", {
        event: "auth_token_invalid",
        ip: req.ip,
        path: req.originalUrl,
        error: err.message,
      });
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

module.exports = auth;
