// src/app/server.js
const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const logger = require("./config/logger");
const httpLogger = require("./middleware/httpLogger");
dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Onsort API",
      version: "1.0.0",
      description: "API documentation for Onsort application",
    },
    servers: [
      {
        url: "https://api.on-sort.fr/api",
        description: "Production server",
      },
      {
        url: `http://localhost:${port}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(httpLogger);

// Rate limiting
const { globalLimiter, loginLimiter, registerLimiter } = require("./middleware/rateLimiter");
app.use(globalLimiter);
app.use("/api/users/login", loginLimiter);
app.use("/api/users/register", registerLimiter);

// Routes
const userRoutes = require("./routes/user.router");
const roleRoutes = require("./routes/role.router");
const companyRoutes = require("./routes/company.router");
const activityRoutes = require("./routes/activity.router");
const pictureRoutes = require("./routes/picture.router");
const gameRoutes = require("./routes/game.router");
const activityTypeRoutes = require("./routes/activity_type.router");
const featureRoutes = require("./routes/feature.router");

app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/pictures", pictureRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/activity-types", activityTypeRoutes);
app.use("/api/features", featureRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API working 🚀");
});

// Health check endpoint (no auth, no rate limit)
app.get("/health", async (req, res) => {
  const healthcheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  try {
    const pool = require("./config/db");
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    healthcheck.database = {
      status: "connected",
      responseTime: `${Date.now() - dbStart}ms`,
    };
  } catch (err) {
    healthcheck.status = "degraded";
    healthcheck.database = {
      status: "disconnected",
      error: err.message,
    };
    logger.alert("Health check: database unreachable", {
      event: "health_check_db_fail",
      error: err.message,
    });
    return res.status(503).json(healthcheck);
  }

  res.json(healthcheck);
});

app.listen(port, () => {
  logger.info(`Server started on port ${port}`, {
    event: "server_start",
    port,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully", { event: "server_shutdown" });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully", { event: "server_shutdown" });
});

module.exports = app;