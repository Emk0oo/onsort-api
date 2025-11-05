const express = require("express");
const router = express.Router();
const featureController = require("../controller/feature.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /features:
 *   get:
 *     summary: Récupérer toutes les features
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des features récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 features:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idfeature:
 *                         type: integer
 *                       name:
 *                         type: string
 *                 total:
 *                   type: integer
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, featureController.getAll);

/**
 * @swagger
 * /features/{id}:
 *   get:
 *     summary: Récupérer une feature par son ID
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la feature
 *     responses:
 *       200:
 *         description: Feature récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feature:
 *                   type: object
 *                   properties:
 *                     idfeature:
 *                       type: integer
 *                     name:
 *                       type: string
 *       404:
 *         description: Feature non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, featureController.getById);

/**
 * @swagger
 * /features:
 *   post:
 *     summary: Créer une nouvelle feature
 *     tags: [Features]
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
 *                 description: Nom de la feature
 *                 example: "Accessible PMR"
 *     responses:
 *       201:
 *         description: Feature créée avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, featureController.create);

/**
 * @swagger
 * /features/{id}:
 *   put:
 *     summary: Mettre à jour une feature
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la feature
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
 *                 description: Nom de la feature
 *                 example: "Accessible PMR"
 *     responses:
 *       200:
 *         description: Feature mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Feature non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, featureController.update);

/**
 * @swagger
 * /features/{id}:
 *   delete:
 *     summary: Supprimer une feature
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la feature
 *     responses:
 *       200:
 *         description: Feature supprimée avec succès
 *       400:
 *         description: Impossible de supprimer (activités associées)
 *       404:
 *         description: Feature non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, featureController.delete);

module.exports = router;
