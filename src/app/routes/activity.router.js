// src/app/routes/activity.router.js
const express = require("express");
const router = express.Router();
const activityController = require("../controller/activity.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get all activities with pictures
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_minor
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter activities for minors (0=adult, 1=minor). If 0, returns only non-forbidden activities.
 *     responses:
 *       200:
 *         description: List of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idactivity:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       idcompany:
 *                         type: integer
 *                       company_name:
 *                         type: string
 *                       pictures:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/", auth, activityController.getAll);

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get activity by ID with pictures
 *     tags: [Activities]
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
 *         description: Activity data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activity:
 *                   type: object
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth, activityController.getById);

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Create a new activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - idcompany
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               idcompany:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Activity created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 activity:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.post("/", auth, activityController.create);

/**
 * @swagger
 * /activities/{id}:
 *   put:
 *     summary: Update activity by ID
 *     tags: [Activities]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activity updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, activityController.update);

/**
 * @swagger
 * /activities/{id}:
 *   delete:
 *     summary: Delete activity by ID
 *     tags: [Activities]
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
 *         description: Activity deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, activityController.delete);

module.exports = router;