// src/app/controller/activity.controller.js
const Activity = require("../models/activity.model");

const activityController = {
  // Get all activities
  async getAll(req, res) {
    try {
      const { is_minor } = req.query;
      const filter = {};
      if (is_minor !== undefined) {
        filter.is_minor = parseInt(is_minor);
      }
      const activities = await Activity.getAll(filter);
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get activity by ID
  async getById(req, res) {
    try {
      const activity = await Activity.getById(req.params.id);
      if (!activity) return res.status(404).json({ message: "Activity not found" });
      res.json({ activity });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create activity
  async create(req, res) {
    try {
      const { name, description, minor_forbidden } = req.body;
      const newActivity = await Activity.create({ name, description, minor_forbidden });
      res.status(201).json({ message: "Activity created", activity: newActivity });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update activity
  async update(req, res) {
    try {
      const { name, description, minor_forbidden } = req.body;
      const updated = await Activity.updateById(req.params.id, { name, description, minor_forbidden });
      if (!updated) return res.status(404).json({ message: "Activity not found" });
      res.json({ message: "Activity updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete activity
  async delete(req, res) {
    try {
      const deleted = await Activity.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Activity not found" });
      res.json({ message: "Activity deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = activityController;