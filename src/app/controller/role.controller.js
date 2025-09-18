// src/app/controller/role.controller.js
const Role = require("../models/role.model");

const roleController = {
  // Get all roles
  async getAll(req, res) {
    try {
      const roles = await Role.getAll();
      res.json({ roles });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get role by ID
  async getById(req, res) {
    try {
      const role = await Role.getById(req.params.id);
      if (!role) return res.status(404).json({ message: "Role not found" });
      res.json({ role });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create role
  async create(req, res) {
    try {
      const { name } = req.body;
      const newRole = await Role.create({ name });
      res.status(201).json({ message: "Role created", role: newRole });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update role
  async update(req, res) {
    try {
      const { name } = req.body;
      const updated = await Role.updateById(req.params.id, { name });
      if (!updated) return res.status(404).json({ message: "Role not found" });
      res.json({ message: "Role updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete role
  async delete(req, res) {
    try {
      const deleted = await Role.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Role not found" });
      res.json({ message: "Role deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = roleController;