// src/app/controller/openingHour.controller.js
const ActivityOpeningHour = require("../models/activityOpeningHour.model");

const openingHourController = {
  // Get all opening hours for a specific activity
  async getAllByActivityId(req, res) {
    try {
      const { id } = req.params;
      const openingHours = await ActivityOpeningHour.getByActivityId(id);
      res.json({ openingHours });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add opening hours for an activity
  async createOpeningHours(req, res) {
    try {
      const { id } = req.params;
      const openingHours = req.body;

      await ActivityOpeningHour.deleteByActivityId(id);

      for (const oh of openingHours) {
        const days = oh.day_of_week.split(",").map((day) => day.trim());
        for (const day of days) {
          const data = {
            idactivity: id,
            day_of_week: day,
            opening_morning: oh.opening_morning,
            closing_morning: oh.closing_morning,
            opening_afternoon: oh.opening_afternoon,
            closing_afternoon: oh.closing_afternoon,
          };
          await ActivityOpeningHour.create(data);
        }
      }

      res.status(201).json({ message: "Opening hours created successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update opening hours for an activity
  async updateOpeningHours(req, res) {
    try {
      const { id } = req.params;
      const openingHours = req.body;

      await ActivityOpeningHour.deleteByActivityId(id);

      for (const oh of openingHours) {
        const days = oh.day_of_week.split(",").map((day) => day.trim());
        for (const day of days) {
          const data = {
            idactivity: id,
            day_of_week: day,
            opening_morning: oh.opening_morning,
            closing_morning: oh.closing_morning,
            opening_afternoon: oh.opening_afternoon,
            closing_afternoon: oh.closing_afternoon,
          };
          await ActivityOpeningHour.create(data);
        }
      }

      res.status(200).json({ message: "Opening hours updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a specific opening hour
  async delete(req, res) {
    try {
      const { id_hour } = req.params;
      const deleted = await ActivityOpeningHour.deleteById(id_hour);
      if (!deleted) return res.status(404).json({ message: "Opening hour not found" });
      res.json({ message: "Opening hour deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = openingHourController;