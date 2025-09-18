// src/app/server.js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(express.json());

// Routes
const userRoutes = require("./routes/user.router");
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API working 🚀");
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

module.exports = app;