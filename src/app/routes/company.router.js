// src/app/routes/company.router.js
const express = require("express");
const router = express.Router();
const companyController = require("../controller/company.controller");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idcompany:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Bowling Center"
 *                       description:
 *                         type: string
 *                         example: "Centre de bowling familial"
 *                       iduser:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Server error
 */
router.get("/", auth, companyController.getAll);

/**
 * @swagger
 * /companies/my:
 *   get:
 *     summary: Get my company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     idcompany:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Bowling Center"
 *                     description:
 *                       type: string
 *                       example: "Centre de bowling familial"
 *                     iduser:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.get("/my", auth, companyController.getMyCompany);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     idcompany:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Bowling Center"
 *                     description:
 *                       type: string
 *                       example: "Centre de bowling familial"
 *                     iduser:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth, companyController.getById);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
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
 *                 example: "Bowling Center"
 *               description:
 *                 type: string
 *                 example: "Centre de bowling familial"
 *     responses:
 *       201:
 *         description: Company created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company created successfully"
 *                 company:
 *                   type: object
 *                   properties:
 *                     idcompany:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Bowling Center"
 *                     description:
 *                       type: string
 *                       example: "Centre de bowling familial"
 *                     iduser:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Server error
 */
router.post("/", auth, companyController.create);

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bowling Center"
 *               description:
 *                 type: string
 *                 example: "Centre de bowling familial"
 *     responses:
 *       200:
 *         description: Company updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company updated successfully"
 *                 company:
 *                   type: object
 *                   properties:
 *                     idcompany:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Bowling Center"
 *                     description:
 *                       type: string
 *                       example: "Centre de bowling familial"
 *                     iduser:
 *                       type: integer
 *                       example: 1
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, companyController.update);

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Delete company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, companyController.delete);

/**
 * @swagger
 * /companies/{id}/activities:
 *   get:
 *     summary: Get activities of a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
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
 *       500:
 *         description: Server error
 */
router.get("/:id/activities", auth, companyController.getActivities);

module.exports = router;