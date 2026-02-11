// src/app/middleware/httpLogger.js
const morgan = require("morgan");
const logger = require("../config/logger");

const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

const httpLogger = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length") || "0",
      responseTime: `${tokens["response-time"](req, res)}ms`,
      userAgent: tokens["user-agent"](req, res),
      ip: tokens["remote-addr"](req, res),
      userId: req.user ? req.user.id : null,
    });
  },
  {
    stream,
    skip: (req) => req.originalUrl === "/health",
  }
);

module.exports = httpLogger;
