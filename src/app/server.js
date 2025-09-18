// src/app/server.js
const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
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

// Routes
const userRoutes = require("./routes/user.router");
app.use("/api/users", userRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API working 🚀");
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

module.exports = app;