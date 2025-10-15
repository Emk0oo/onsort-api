// src/app/routes/review.router.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const userReviewController = require("../controller/userReview.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /reviews/{id}:
 *   post:
 *     summary: Create a new review for an activity
 *     tags: [Reviews]
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
 *             $ref: '#/components/schemas/UserReviewActivity'
 *     responses:
 *       201:
 *         description: Review created
 *       500:
 *         description: Server error
 */
router.post("/", auth, userReviewController.create);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get all reviews for a specific activity
 *     tags: [Reviews]
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
 *         description: A list of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserReviewActivity'
 *       500:
 *         description: Server error
 */
router.get("/", auth, userReviewController.getAllByActivityId);

/**
 * @swagger
 * /reviews/{id}/{id_review}:
 *   get:
 *     summary: Get a specific review by ID
 *     tags: [Reviews]
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
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserReviewActivity'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get("/:id_review", auth, userReviewController.getById);

/**
 * @swagger
 * /reviews/{id}/{id_review}:
 *   delete:
 *     summary: Delete a specific review
 *     tags: [Reviews]
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
 *         name: id_review
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete("/:id_review", auth, userReviewController.delete);

module.exports = router;