// src/app/routes/activity.router.js
const express = require("express");
const router = express.Router();
const activityController = require("../controller/activity.controller");
const auth = require("../middleware/auth");
const featureRouter = require("./feature.router");
const openingHourRouter = require("./openingHour.router");
const reviewRouter = require("./review.router");

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         idactivity:
 *           type: integer
 *           description: The unique identifier for the activity.
 *         name:
 *           type: string
 *           description: The name of the activity.
 *         description:
 *           type: string
 *           description: A brief description of the activity.
 *         address:
 *           type: string
 *           description: The address where the activity takes place.
 *         price_range:
 *           type: string
 *           description: The price range for the activity.
 *         features:
 *           type: string
 *           description: A list of features or amenities.
 *         minor_forbidden:
 *           type: integer
 *           description: Indicates if the activity is forbidden for minors (1 for true, 0 for false).
 *         company_name:
 *           type: string
 *           description: The name of the company organizing the activity.
 *         pictures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Picture'
 *     ActivityOpeningHour:
 *       type: object
 *       properties:
 *         idactivity_opening_hour:
 *           type: integer
 *           description: The unique identifier for the opening hour entry.
 *         day_of_week:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           description: The day of the week.
 *         opening_time:
 *           type: string
 *           format: time
 *           description: The opening time.
 *         closing_time:
 *           type: string
 *           format: time
 *           description: The closing time.
 *     UserReviewActivity:
 *       type: object
 *       required:
 *         - rating
 *         - comment
 *       properties:
 *         iduser_review_activity:
 *           type: integer
 *           description: The unique identifier for the review.
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: The rating given by the user (1-5).
 *         comment:
 *           type: string
 *           description: The review comment.
 *         user_name:
 *           type: string
 *           description: The name of the user who wrote the review.
 *     Picture:
 *       type: object
 *       properties:
 *         idpicture:
 *           type: integer
 *         url:
 *           type: string
 *         alt:
 *           type: string
 *
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
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       minor_forbidden:
 *                         type: integer
 *                       company_name:
 *                         type: string
 *                       pictures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             idpicture:
 *                               type: integer
 *                             url:
 *                               type: string
 *                             alt:
 *                               type: string
 *       500:
 *         description: Server error
 */
router.get("/", auth, activityController.findAll);

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
router.get("/:id", auth, activityController.findOne);

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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               minor_forbidden:
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               minor_forbidden:
 *                 type: integer
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

router.use("/:id/features", featureRouter);
router.use("/opening_hours", openingHourRouter);
router.use("/:id/reviews", reviewRouter);

module.exports = router;