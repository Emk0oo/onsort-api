const express = require("express");
const router = express.Router();
const activityTypeController = require("../controller/activity_type.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /activity-types:
 *   get:
 *     summary: Récupérer tous les types d'activité
 *     tags: [Activity Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types d'activité récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 activity_types:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idactivity_type:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       icon:
 *                         type: string
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, activityTypeController.getAll);

/**
 * @swagger
 * /activity-types/{id}:
 *   get:
 *     summary: Récupérer un type d'activité par son ID
 *     tags: [Activity Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type d'activité
 *     responses:
 *       200:
 *         description: Type d'activité récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 activity_type:
 *                   type: object
 *                   properties:
 *                     idactivity_type:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     icon:
 *                       type: string
 *       404:
 *         description: Type d'activité non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, activityTypeController.getById);

/**
 * @swagger
 * /activity-types:
 *   post:
 *     summary: Créer un nouveau type d'activité
 *     tags: [Activity Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du type d'activité
 *                 example: "Bowling"
 *               icon:
 *                 type: string
 *                 description: Nom de l'icône Flutter (optionnel)
 *                 example: "Icons.bowling"
 *     responses:
 *       201:
 *         description: Type d'activité créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, activityTypeController.create);

/**
 * @swagger
 * /activity-types/{id}:
 *   put:
 *     summary: Mettre à jour un type d'activité
 *     tags: [Activity Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type d'activité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du type d'activité
 *                 example: "Bowling"
 *               icon:
 *                 type: string
 *                 description: Nom de l'icône Flutter (optionnel)
 *                 example: "Icons.bowling"
 *     responses:
 *       200:
 *         description: Type d'activité mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Type d'activité non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, activityTypeController.update);

/**
 * @swagger
 * /activity-types/{id}:
 *   delete:
 *     summary: Supprimer un type d'activité
 *     tags: [Activity Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du type d'activité
 *     responses:
 *       200:
 *         description: Type d'activité supprimé avec succès
 *       400:
 *         description: Impossible de supprimer (activités associées)
 *       404:
 *         description: Type d'activité non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, activityTypeController.delete);

module.exports = router;
