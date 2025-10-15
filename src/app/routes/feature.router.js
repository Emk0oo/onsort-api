// src/app/routes/feature.router.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const activityController = require("../controller/activity.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /features/{id}:
 *   get:
 *     summary: Get features for a specific activity
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: A list of features
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.get("/", auth, activityController.getFeatures);

/**
 * @swagger
 * /features/{id}:
 *   post:
 *     summary: Add or update features for an activity
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Features added or updated successfully
 *       500:
 *         description: Server error
 */
router.post("/", auth, activityController.addOrUpdateFeatures);

/**
 * @swagger
 * /activities/{id}/features/{featureName}:
 *   delete:
 *     summary: Delete a feature from an activity
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity ID
 *       - in: path
 *         name: featureName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the feature to delete
 *     responses:
 *       200:
 *         description: Feature removed from activity successfully
 *       404:
 *         description: Feature not found or not associated with this activity
 *       500:
 *         description: Server error
 */
router.delete("/:featureName", auth, activityController.deleteFeature);

module.exports = router;