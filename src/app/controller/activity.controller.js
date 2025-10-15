// src/app/controller/activity.controller.js
const Activity = require("../models/activity.model");
const ActivityOpeningHour = require("../models/activityOpeningHour.model");
const UserReviewActivity = require("../models/userReviewActivity.model");

const activityController = {
  // Get all activities
  async findAll(req, res) {
    try {
      const { include } = req.query;
      const activities = await Activity.getAll();

      if (include === "opening_hours") {
        const activitiesWithOpeningHours = await Promise.all(
          activities.map(async (activity) => {
            const openingHours = await ActivityOpeningHour.getByActivityId(activity.id);
            return { ...activity, openingHours };
          })
        );
        return res.json({ activities: activitiesWithOpeningHours });
      }

      if (include === "reviews") {
        const activitiesWithReviews = await Promise.all(
          activities.map(async (activity) => {
            const reviews = await UserReviewActivity.getByActivityId(activity.id);
            return { ...activity, reviews };
          })
        );
        return res.json({ activities: activitiesWithReviews });
      }
      res.json({ activities });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get activity by ID
  async findOne(req, res) {
    try {
      const { include } = req.query;
      const activity = await Activity.getById(req.params.id);
      if (!activity) return res.status(404).json({ message: "Activity not found" });

      if (include === "opening_hours") {
        const openingHours = await ActivityOpeningHour.getByActivityId(req.params.id);
        return res.json({ activity: { ...activity, openingHours } });
      }

      if (include === "reviews") {
        const reviews = await UserReviewActivity.getByActivityId(req.params.id);
        return res.json({ activity: { ...activity, reviews } });
      }

      res.json({ activity });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create activity
  async create(req, res) {
    try {
      const { name, description, minor_forbidden, address, price_range, features } = req.body;
      const newActivity = await Activity.create({ name, description, minor_forbidden, address, price_range, features });
      res.status(201).json({ message: "Activity created", activity: newActivity });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update activity
  async update(req, res) {
    try {
      const { name, description, minor_forbidden, address, price_range, features } = req.body;
      const updated = await Activity.updateById(req.params.id, { name, description, minor_forbidden, address, price_range, features });
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