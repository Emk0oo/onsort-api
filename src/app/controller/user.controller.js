// src/app/controller/user.controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const userController = {
  // Register
  async register(req, res) {
    try {
      const { name, surname, email, username, password, date_of_birth } = req.body;

      // Vérif si user existe déjà
      const existing = await User.getByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already in use" });

      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        surname,
        email,
        username,
        password: hashed,
        date_of_birth,
        is_active: 1,
      });

      res.status(201).json({ message: "User registered", user: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.getByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.iduser, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Login success", token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // (optionnel : protected route example)
  async profile(req, res) {
    try {
      res.json({ message: "Your profile", user: req.user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get user by ID (getMyself with token verification)
  async getMyself(req, res) {
    try {
      const userId = req.params.id;
      if (userId != req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const user = await User.getById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete user by ID
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      if (userId != req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const deleted = await User.deleteById(userId);
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;