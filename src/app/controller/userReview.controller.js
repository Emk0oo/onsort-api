// src/app/controller/userReview.controller.js
const UserReviewActivity = require("../models/userReviewActivity.model");

const userReviewController = {
  // Create a new review for an activity
  async create(req, res) {
    try {
      const { id } = req.params;
      const { iduser, title, rating, comment } = req.body;
      const data = { iduser, idactivity: id, title, rating, comment };
      const newReview = await UserReviewActivity.create(data);
      res.status(201).json({ message: "Review created", review: newReview });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get all reviews for a specific activity
  async getAllByActivityId(req, res) {
    try {
      const { id } = req.params;
      const reviews = await UserReviewActivity.getByActivityId(id);
      res.json({ reviews });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get a specific review
  async getById(req, res) {
    try {
      const { id_review } = req.params;
      const review = await UserReviewActivity.getById(id_review);
      if (!review) return res.status(404).json({ message: "Review not found" });
      res.json({ review });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a specific review
  async delete(req, res) {
    try {
      const { id_review } = req.params;
      const deleted = await UserReviewActivity.deleteById(id_review);
      if (!deleted) return res.status(404).json({ message: "Review not found" });
      res.json({ message: "Review deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userReviewController;