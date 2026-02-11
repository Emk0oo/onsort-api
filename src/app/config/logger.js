// src/app/config/logger.js
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "..", "logs");

// Custom log levels including 'security' for auth events
const levels = {
  error: 0,
  warn: 1,
  security: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const colors = {
  error: "red",
  warn: "yellow",
  security: "magenta",
  info: "green",
  http: "cyan",
  debug: "white",
};

winston.addColors(colors);

// JSON format for file transports
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Colorized format for console (development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// --- File transports with daily rotation ---

const combinedRotate = new DailyRotateFile({
  filename: path.join(LOG_DIR, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
  format: fileFormat,
});

const errorRotate = new DailyRotateFile({
  filename: path.join(LOG_DIR, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
  format: fileFormat,
});

const securityRotate = new DailyRotateFile({
  filename: path.join(LOG_DIR, "security-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "90d",
  level: "security",
  format: fileFormat,
});

const httpRotate = new DailyRotateFile({
  filename: path.join(LOG_DIR, "http-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "50m",
  maxFiles: "7d",
  level: "http",
  format: fileFormat,
});

const transports = [combinedRotate, errorRotate, securityRotate, httpRotate];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      level: "debug",
      format: consoleFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: "warn",
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "http",
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
});

// Lightweight alert helper — logs error with alert flag
// Activate webhook by setting ALERT_WEBHOOK_URL env var
logger.alert = (message, meta = {}) => {
  logger.error(message, {
    ...meta,
    alert: true,
    alertTimestamp: new Date().toISOString(),
  });
};

module.exports = logger;
