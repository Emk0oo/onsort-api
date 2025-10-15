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

  // Add or update opening hours for an activity
  async createOrUpdate(req, res) {
    try {
      const { id } = req.params;
      const { day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon } = req.body;
      const data = { idactivity: id, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon };

      const existingHour = await ActivityOpeningHour.getByActivityId(id);
      if (existingHour.length > 0) {
        const updated = await ActivityOpeningHour.updateById(existingHour[0].id, data);
        if (!updated) return res.status(404).json({ message: "Opening hour not found" });
        res.json({ message: "Opening hour updated" });
      } else {
        const newOpeningHour = await ActivityOpeningHour.create(data);
        res.status(201).json({ message: "Opening hour created", openingHour: newOpeningHour });
      }
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