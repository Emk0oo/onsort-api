// src/app/config/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((conn) => {
    logger.info("Connected to MySQL database", {
      event: "db_connected",
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    });
    conn.release();
  })
  .catch((err) => {
    logger.alert("Database connection failed", {
      event: "db_connection_failed",
      error: err.message,
      host: process.env.DB_HOST,
    });
  });

module.exports = pool;
