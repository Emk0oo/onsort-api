// src/app/controller/picture.controller.js
const Picture = require("../models/picture.model");

const pictureController = {
  // Get all pictures
  async getAll(req, res) {
    try {
      const pictures = await Picture.getAll();
      res.json({ pictures });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get picture by ID
  async getById(req, res) {
    try {
      const picture = await Picture.getById(req.params.id);
      if (!picture) return res.status(404).json({ message: "Picture not found" });
      res.json({ picture });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get pictures by activity ID
  async getByActivityId(req, res) {
    try {
      const pictures = await Picture.getByActivityId(req.params.activityId);
      res.json({ pictures });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Create picture
  async create(req, res) {
    try {
      const { url, idactivity } = req.body;
      const newPicture = await Picture.create({ url, idactivity });
      res.status(201).json({ message: "Picture created", picture: newPicture });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update picture
  async update(req, res) {
    try {
      const { url } = req.body;
      const updated = await Picture.updateById(req.params.id, { url });
      if (!updated) return res.status(404).json({ message: "Picture not found" });
      res.json({ message: "Picture updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete picture
  async delete(req, res) {
    try {
      const deleted = await Picture.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Picture not found" });
      res.json({ message: "Picture deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = pictureController;