const express = require("express");
const router = express.Router();
const gameController = require("../controller/game.controller");
const auth = require("../middleware/auth");

// ==================== Gestion des Rooms ====================

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Créer une nouvelle room de vote
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Room créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 game:
 *                   type: object
 *                   properties:
 *                     idgame:
 *                       type: integer
 *                     invite_code:
 *                       type: string
 *                     status:
 *                       type: string
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, gameController.createGame);

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Récupérer les détails d'une room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Détails de la room
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, gameController.getGame);

/**
 * @swagger
 * /games/code/{invite_code}:
 *   get:
 *     summary: Trouver une room par code d'invitation
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invite_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code d'invitation unique
 *     responses:
 *       200:
 *         description: Room trouvée
 *       404:
 *         description: Code d'invitation invalide
 *       500:
 *         description: Erreur serveur
 */
router.get("/code/:invite_code", auth, gameController.getGameByCode);

/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Supprimer une room (créateur uniquement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Room supprimée
 *       403:
 *         description: Seul le créateur peut supprimer
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, gameController.deleteGame);

/**
 * @swagger
 * /games/{id}/status:
 *   patch:
 *     summary: Changer le statut de la room (créateur uniquement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [waiting_for_launch, voting, finished]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       400:
 *         description: Statut invalide
 *       403:
 *         description: Seul le créateur peut changer le statut
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch("/:id/status", auth, gameController.updateStatus);

// ==================== Participation ====================

/**
 * @swagger
 * /games/{id}/join:
 *   post:
 *     summary: Rejoindre une room avec le code d'invitation
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invite_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vous avez rejoint la room
 *       403:
 *         description: Code incorrect ou room déjà démarrée
 *       404:
 *         description: Room non trouvée
 *       409:
 *         description: Vous êtes déjà participant
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/join", auth, gameController.joinGame);

/**
 * @swagger
 * /games/{id}/participants:
 *   get:
 *     summary: Liste des participants de la room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Liste des participants
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/participants", auth, gameController.getParticipants);

/**
 * @swagger
 * /games/{id}/participants/{user_id}:
 *   delete:
 *     summary: Retirer un participant (créateur uniquement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur à retirer
 *     responses:
 *       200:
 *         description: Participant retiré
 *       403:
 *         description: Seul le créateur peut retirer un participant
 *       404:
 *         description: Room ou participant non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id/participants/:user_id", auth, gameController.removeParticipant);

// ==================== Filtres ====================

/**
 * @swagger
 * /games/{id}/filters:
 *   post:
 *     summary: Configurer les filtres de sélection d'activités
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_type:
 *                 type: string
 *               price_range_min:
 *                 type: integer
 *               price_range_max:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Filtres configurés
 *       403:
 *         description: Seul le créateur peut configurer les filtres
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/filters", auth, gameController.createFilters);

/**
 * @swagger
 * /games/{id}/filters:
 *   get:
 *     summary: Récupérer les filtres d'une room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Filtres de la room
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/filters", auth, gameController.getFilters);

/**
 * @swagger
 * /games/{id}/filters:
 *   put:
 *     summary: Modifier les filtres (créateur uniquement, avant lancement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_type:
 *                 type: string
 *               price_range_min:
 *                 type: integer
 *               price_range_max:
 *                 type: integer
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Filtres mis à jour
 *       403:
 *         description: Seul le créateur peut modifier les filtres
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id/filters", auth, gameController.updateFilters);

// ==================== Dates ====================

/**
 * @swagger
 * /games/{id}/dates:
 *   post:
 *     summary: Ajouter des dates proposées
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *     responses:
 *       201:
 *         description: Dates ajoutées
 *       400:
 *         description: Format invalide
 *       403:
 *         description: Seul le créateur peut ajouter des dates
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/dates", auth, gameController.addDates);

/**
 * @swagger
 * /games/{id}/dates:
 *   get:
 *     summary: Récupérer les dates d'une room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Liste des dates
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/dates", auth, gameController.getDates);

/**
 * @swagger
 * /games/{id}/dates/{date_id}:
 *   delete:
 *     summary: Supprimer une date (créateur uniquement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *       - in: path
 *         name: date_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la date
 *     responses:
 *       200:
 *         description: Date supprimée
 *       403:
 *         description: Seul le créateur peut supprimer une date
 *       404:
 *         description: Room ou date non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id/dates/:date_id", auth, gameController.deleteDate);

// ==================== Activités et Votes ====================

/**
 * @swagger
 * /games/{id}/activities:
 *   get:
 *     summary: Liste des activités à voter (filtrées automatiquement)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Liste des activités filtrées
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/activities", auth, gameController.getActivities);

/**
 * @swagger
 * /games/{id}/vote:
 *   post:
 *     summary: Voter sur une activité (oui/non)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idactivity:
 *                 type: integer
 *               vote:
 *                 type: boolean
 *                 description: true = Oui (swipe droite), false = Non (swipe gauche)
 *     responses:
 *       201:
 *         description: Vote enregistré
 *       400:
 *         description: Format invalide
 *       403:
 *         description: Le vote n'est pas ouvert
 *       404:
 *         description: Room non trouvée
 *       409:
 *         description: Vous avez déjà voté
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/vote", auth, gameController.vote);

/**
 * @swagger
 * /games/{id}/votes/my-votes:
 *   get:
 *     summary: Mes votes pour cette room
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Liste de mes votes
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/votes/my-votes", auth, gameController.getMyVotes);

/**
 * @swagger
 * /games/{id}/results:
 *   get:
 *     summary: Récapitulatif des votes (disponible après statut finished)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la room
 *     responses:
 *       200:
 *         description: Résultats complets avec classement
 *       403:
 *         description: Les résultats ne sont pas encore disponibles
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/results", auth, gameController.getResults);

// ==================== Historique ====================

/**
 * @swagger
 * /games/my-games:
 *   get:
 *     summary: Historique des rooms de l'utilisateur
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les rooms (créées + participées)
 *       500:
 *         description: Erreur serveur
 */
router.get("/my-games", auth, gameController.getMyGames);

module.exports = router;
