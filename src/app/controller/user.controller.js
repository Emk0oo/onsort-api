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
        idrole: 1, // Default role: user
      });

      // Auto-login after register
      const accessToken = jwt.sign(
        { id: newUser.iduser, email: newUser.email, role: newUser.idrole },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: newUser.iduser, email: newUser.email, role: newUser.idrole },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({ message: "User registered", user: newUser, access_token: accessToken, refresh_token: refreshToken });
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

      const accessToken = jwt.sign(
        { id: user.iduser, email: user.email, role: user.idrole, is_minor: user.is_minor },
        process.env.JWT_SECRET,
        { expiresIn: "240m" }
      );

      const refreshToken = jwt.sign(
        { id: user.iduser, email: user.email, role: user.idrole, is_minor: user.is_minor },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ message: "Login success", access_token: accessToken, refresh_token: refreshToken });
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

  // Update user by ID
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      if (userId != req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { name, surname, email, username, date_of_birth } = req.body;
      const updated = await User.updateById(userId, { name, surname, email, username, date_of_birth });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User updated" });
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

  // Refresh access token
  async refresh(req, res) {
    try {
      // req.user is set by refreshAuth middleware
      const accessToken = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ access_token: accessToken, refresh_token: refreshToken });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Logout (client-side, just confirmation)
  async logout(req, res) {
    try {
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update password
  async updatePassword(req, res) {
    try {
      const userId = req.params.id;
      if (userId != req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { old_password, new_password } = req.body;

      const user = await User.getById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const valid = await bcrypt.compare(old_password, user.password);
      if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

      const hashed = await bcrypt.hash(new_password, 10);
      const updated = await User.updatePassword(userId, hashed);
      if (!updated) return res.status(500).json({ message: "Failed to update password" });

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;