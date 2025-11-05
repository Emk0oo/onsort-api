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
      {
        url: "https://1942c53a5120.ngrok-free.app/api",
        description: "Ngrok tunnel server",
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

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

module.exports = app;