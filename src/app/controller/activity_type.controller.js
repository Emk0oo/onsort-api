const ActivityType = require("../models/activity_type.model");

const activityTypeController = {
  /**
   * GET /api/activity-types
   * Récupère tous les types d'activité
   */
  async getAll(req, res) {
    try {
      const activityTypes = await ActivityType.getAll();
      res.json({
        message: "Types d'activité récupérés avec succès",
        activity_types: activityTypes,
        total: activityTypes.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/activity-types/:id
   * Récupère un type d'activité par son ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const activityType = await ActivityType.getById(id);

      if (!activityType) {
        return res.status(404).json({
          message: "Type d'activité non trouvé"
        });
      }

      res.json({
        message: "Type d'activité récupéré avec succès",
        activity_type: activityType
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * POST /api/activity-types
   * Crée un nouveau type d'activité
   */
  async create(req, res) {
    try {
      const { name, icon } = req.body;

      // Validation
      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Le nom du type d'activité est requis"
        });
      }

      const newActivityType = await ActivityType.create({
        name: name.trim(),
        icon: icon ? icon.trim() : null
      });

      res.status(201).json({
        message: "Type d'activité créé avec succès",
        activity_type: newActivityType
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * PUT /api/activity-types/:id
   * Met à jour un type d'activité
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, icon } = req.body;

      // Vérifier si le type d'activité existe
      const exists = await ActivityType.exists(id);
      if (!exists) {
        return res.status(404).json({
          message: "Type d'activité non trouvé"
        });
      }

      // Validation
      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Le nom du type d'activité est requis"
        });
      }

      const updated = await ActivityType.update(id, {
        name: name.trim(),
        icon: icon ? icon.trim() : null
      });

      if (!updated) {
        return res.status(500).json({
          message: "Erreur lors de la mise à jour"
        });
      }

      // Récupérer le type d'activité mis à jour
      const activityType = await ActivityType.getById(id);

      res.json({
        message: "Type d'activité mis à jour avec succès",
        activity_type: activityType
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * DELETE /api/activity-types/:id
   * Supprime un type d'activité
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si le type d'activité existe
      const exists = await ActivityType.exists(id);
      if (!exists) {
        return res.status(404).json({
          message: "Type d'activité non trouvé"
        });
      }

      // Vérifier s'il y a des activités associées
      const activityCount = await ActivityType.countActivities(id);
      if (activityCount > 0) {
        return res.status(400).json({
          message: `Impossible de supprimer ce type d'activité : ${activityCount} activité(s) y sont associées`
        });
      }

      const deleted = await ActivityType.delete(id);

      if (!deleted) {
        return res.status(500).json({
          message: "Erreur lors de la suppression"
        });
      }

      res.json({
        message: "Type d'activité supprimé avec succès"
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = activityTypeController;
