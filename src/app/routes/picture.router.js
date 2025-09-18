// src/app/routes/picture.router.js
const express = require("express");
const router = express.Router();
const pictureController = require("../controller/picture.controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /pictures:
 *   get:
 *     summary: Get all pictures
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pictures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pictures:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/", auth, pictureController.getAll);

/**
 * @swagger
 * /pictures/{id}:
 *   get:
 *     summary: Get picture by ID
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Picture ID
 *     responses:
 *       200:
 *         description: Picture data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 picture:
 *                   type: object
 *                   properties:
 *                     idpicture:
 *                       type: integer
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth, pictureController.getById);

/**
 * @swagger
 * /pictures/activity/{activityId}:
 *   get:
 *     summary: Get pictures by activity ID
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: List of pictures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pictures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idpicture:
 *                         type: integer
 *                       url:
 *                         type: string
 *                       alt:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/activity/:activityId", auth, pictureController.getByActivityId);

/**
 * @swagger
 * /pictures:
 *   post:
 *     summary: Create a new picture
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               alt:
 *                 type: string
 *                 description: Alt text for the image
 *               idactivity:
 *                 type: integer
 *                 description: Activity ID
 *     responses:
 *       201:
 *         description: Picture created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 picture:
 *                   type: object
 *                   properties:
 *                     idpicture:
 *                       type: integer
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post("/", auth, upload.single('image'), pictureController.create);

/**
 * @swagger
 * /pictures/{id}:
 *   put:
 *     summary: Update picture by ID
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Picture ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (optional for update)
 *               alt:
 *                 type: string
 *                 description: Alt text for the image
 *     responses:
 *       200:
 *         description: Picture updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, upload.single('image'), pictureController.update);

/**
 * @swagger
 * /pictures/{id}:
 *   delete:
 *     summary: Delete picture by ID
 *     tags: [Pictures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Picture ID
 *     responses:
 *       200:
 *         description: Picture deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Picture not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, pictureController.delete);

module.exports = router;