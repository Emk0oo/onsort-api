// src/app/controller/picture.controller.js
const Picture = require("../models/picture.model");
const pool = require("../config/db");

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
      let url = req.body.url;
      const { alt, idactivity } = req.body;

      // Si fichier uploadé, utiliser le chemin du fichier
      if (req.file) {
        url = req.file.path; // Chemin relatif du fichier
      }

      const newPicture = await Picture.create({ url, alt });

      // Insérer la relation dans activity_picture
      if (idactivity) {
        await pool.query("INSERT INTO activity_picture (idactivity, idpicture) VALUES (?, ?)", [idactivity, newPicture.idpicture]);
      }

      res.status(201).json({ message: "Picture created", picture: newPicture });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update picture
  async update(req, res) {
    try {
      let url = req.body.url;
      const { alt } = req.body;

      // Si fichier uploadé, utiliser le chemin du fichier
      if (req.file) {
        url = req.file.path;
      }

      const updated = await Picture.updateById(req.params.id, { url, alt });
      if (!updated) return res.status(404).json({ message: "Picture not found" });
      res.json({ message: "Picture updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete picture
  async delete(req, res) {
    try {
      // Supprimer les relations dans activity_picture
      await pool.query("DELETE FROM activity_picture WHERE idpicture = ?", [req.params.id]);

      const deleted = await Picture.deleteById(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Picture not found" });
      res.json({ message: "Picture deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = pictureController;