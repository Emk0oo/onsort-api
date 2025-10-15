// src/app/routes/openingHour.router.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const openingHourController = require("../controller/openingHour.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /opening_hours/{id}:
 *   get:
 *     summary: Get all opening hours for a specific activity
 *     tags: [Opening Hours]
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
 *         description: A list of opening hours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityOpeningHour'
 *       500:
 *         description: Server error
 */
router.get("/", auth, openingHourController.getAllByActivityId);

/**
 * @swagger
 * /opening_hours/activity/{id}:
 *   post:
 *     summary: Create opening hours for an activity
 *     tags: [Opening Hours]
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
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day_of_week:
 *                   type: string
 *                   example: "lundi,mardi"
 *                 opening_morning:
 *                   type: string
 *                   format: time
 *                 closing_morning:
 *                   type: string
 *                   format: time
 *                 opening_afternoon:
 *                   type: string
 *                   format: time
 *                 closing_afternoon:
 *                   type: string
 *                   format: time
 *     responses:
 *       201:
 *         description: Opening hours created
 *       500:
 *         description: Server error
 */
router.post("/activity/:id", auth, openingHourController.createOpeningHours);

/**
 * @swagger
 * /opening_hours/activity/{id}:
 *   put:
 *     summary: Update opening hours for an activity
 *     tags: [Opening Hours]
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
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 day_of_week:
 *                   type: string
 *                   example: "lundi,mardi"
 *                 opening_morning:
 *                   type: string
 *                   format: time
 *                 closing_morning:
 *                   type: string
 *                   format: time
 *                 opening_afternoon:
 *                   type: string
 *                   format: time
 *                 closing_afternoon:
 *                   type: string
 *                   format: time
 *     responses:
 *       200:
 *         description: Opening hours updated
 *       500:
 *         description: Server error
 */
router.put("/activity/:id", auth, openingHourController.updateOpeningHours);

/**
 * @swagger
 * /opening_hours/{id_hour}:
 *   delete:
 *     summary: Delete a specific opening hour
 *     tags: [Opening Hours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_hour
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opening Hour ID
 *     responses:
 *       200:
 *         description: Opening hour deleted
 *       404:
 *         description: Opening hour not found
 *       500:
 *         description: Server error
 */
router.delete("/:id_hour", auth, openingHourController.delete);

module.exports = router;