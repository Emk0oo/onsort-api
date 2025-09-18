// src/app/routes/user.router.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const auth = require("../middleware/auth");

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);

// Protected route example
router.get("/profile", auth, userController.profile);

module.exports = router;