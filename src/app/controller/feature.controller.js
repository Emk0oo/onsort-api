const Feature = require("../models/feature.model");

const featureController = {
  /**
   * GET /api/features
   * Récupère toutes les features
   */
  async getAll(req, res) {
    try {
      const features = await Feature.getAll();
      res.json({
        message: "Features récupérées avec succès",
        features: features,
        total: features.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/features/:id
   * Récupère une feature par son ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const feature = await Feature.getById(id);

      if (!feature) {
        return res.status(404).json({
          message: "Feature non trouvée"
        });
      }

      res.json({
        message: "Feature récupérée avec succès",
        feature: feature
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * POST /api/features
   * Crée une nouvelle feature
   */
  async create(req, res) {
    try {
      const { name } = req.body;

      // Validation
      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Le nom de la feature est requis"
        });
      }

      const newFeature = await Feature.create({
        name: name.trim()
      });

      res.status(201).json({
        message: "Feature créée avec succès",
        feature: newFeature
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * PUT /api/features/:id
   * Met à jour une feature
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Vérifier si la feature existe
      const exists = await Feature.exists(id);
      if (!exists) {
        return res.status(404).json({
          message: "Feature non trouvée"
        });
      }

      // Validation
      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Le nom de la feature est requis"
        });
      }

      const updated = await Feature.update(id, {
        name: name.trim()
      });

      if (!updated) {
        return res.status(500).json({
          message: "Erreur lors de la mise à jour"
        });
      }

      // Récupérer la feature mise à jour
      const feature = await Feature.getById(id);

      res.json({
        message: "Feature mise à jour avec succès",
        feature: feature
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * DELETE /api/features/:id
   * Supprime une feature
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si la feature existe
      const exists = await Feature.exists(id);
      if (!exists) {
        return res.status(404).json({
          message: "Feature non trouvée"
        });
      }

      // Vérifier s'il y a des activités associées
      const activityCount = await Feature.countActivities(id);
      if (activityCount > 0) {
        return res.status(400).json({
          message: `Impossible de supprimer cette feature : ${activityCount} activité(s) y sont associées`
        });
      }

      const deleted = await Feature.delete(id);

      if (!deleted) {
        return res.status(500).json({
          message: "Erreur lors de la suppression"
        });
      }

      res.json({
        message: "Feature supprimée avec succès"
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = featureController;
