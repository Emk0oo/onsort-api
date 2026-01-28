const express = require("express");
const router = express.Router();
const gameController = require("../controller/game.controller");
const auth = require("../middleware/auth");

// ==================== Gestion des Rooms ====================

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Créer une nouvelle room avec configuration et sélection automatique des activités
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activity_types
 *               - allowed_prices
 *             properties:
 *               activity_types:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs des types d'activité
 *                 example: [1, 2, 5]
 *               allowed_prices:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Prix acceptés (1-5)
 *                 example: [1, 2, 3]
 *               location:
 *                 type: string
 *                 description: Localisation
 *                 example: "Caen"
 *               dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date-time
 *                 description: Dates proposées
 *                 example: ["2025-12-15 14:00:00", "2025-12-16 18:00:00"]
 *     responses:
 *       201:
 *         description: Room créée avec activités filtrées automatiquement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room créée avec succès"
 *                 game:
 *                   type: object
 *                   properties:
 *                     idgame:
 *                       type: integer
 *                       example: 1
 *                     idcreator:
 *                       type: integer
 *                       example: 1
 *                     invite_code:
 *                       type: string
 *                       example: "ABC123XYZ"
 *                     status:
 *                       type: string
 *                       example: "waiting_for_launch"
 *                     activities_count:
 *                       type: integer
 *                       example: 15
 *                     activity_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: IDs des activités filtrées pour cette game
 *                       example: [12, 45, 78, 103, 156]
 *                     activity_types:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 5]
 *                     allowed_prices:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *                     dates_count:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Paramètres invalides ou aucune activité ne correspond
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, gameController.createGame);

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

/**
 * @swagger
 * /games/{id}/status:
 *   get:
 *     summary: Récupérer le statut détaillé et la progression du vote
 *     description: Retourne le statut de la room, la progression du vote, et le temps restant. Effectue un auto-finish si le timeout est dépassé.
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
 *         description: Statut détaillé de la room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 game:
 *                   type: object
 *                   properties:
 *                     idgame:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [waiting_for_launch, voting, finished]
 *                       example: "voting"
 *                     voting_started_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15 10:30:00"
 *                     time_elapsed_minutes:
 *                       type: integer
 *                       example: 15
 *                     time_remaining_minutes:
 *                       type: integer
 *                       example: 45
 *                     timeout_minutes:
 *                       type: integer
 *                       example: 60
 *                 voting_progress:
 *                   type: object
 *                   properties:
 *                     total_participants:
 *                       type: integer
 *                       example: 5
 *                     completed_count:
 *                       type: integer
 *                       example: 3
 *                     completion_rate:
 *                       type: number
 *                       example: 60
 *                     all_participants_voted:
 *                       type: boolean
 *                       example: false
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       iduser:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       has_voted_all:
 *                         type: boolean
 *                       progress_percentage:
 *                         type: number
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/status", auth, gameController.getGameStatus);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 game:
 *                   type: object
 *                   properties:
 *                     idgame:
 *                       type: integer
 *                       example: 1
 *                     invite_code:
 *                       type: string
 *                       example: "ABC123XYZ"
 *                     status:
 *                       type: string
 *                       example: "voting"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15 10:00:00"
 *                     idcreator:
 *                       type: integer
 *                       example: 1
 *                     creator_name:
 *                       type: string
 *                       example: "Jean"
 *                     creator_surname:
 *                       type: string
 *                       example: "Dupont"
 *                     participants_count:
 *                       type: integer
 *                       example: 5
 *                     activity_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: IDs des activités filtrées pour cette game
 *                       example: [12, 45, 78, 103, 156]
 *                 filters:
 *                   type: object
 *                   properties:
 *                     location:
 *                       type: string
 *                       example: "Caen"
 *                     allowed_prices:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *                 activity_types:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idactivity_type:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Bowling"
 *                 dates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idgamedate:
 *                         type: integer
 *                         example: 1
 *                       date_option:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-12-15 14:00:00"
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

/**
 * @swagger
 * /games/{invite_code}/launch:
 *   patch:
 *     summary: Lancer le vote (créateur uniquement)
 *     description: Passage de waiting_for_launch à voting. Retourne les activités filtrées.
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invite_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Code d'invitation de la room
 *     responses:
 *       200:
 *         description: Vote lancé avec succès
 *       400:
 *         description: Aucune activité associée à la room
 *       403:
 *         description: Seul le créateur peut lancer ou room déjà lancée
 *       404:
 *         description: Code d'invitation invalide
 *       500:
 *         description: Erreur serveur
 */
router.patch("/:invite_code/launch", auth, gameController.launchGame);

// ==================== Participation ====================

/**
 * @swagger
 * /games/join:
 *   post:
 *     summary: Rejoindre une room avec le code d'invitation
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invite_code
 *             properties:
 *               invite_code:
 *                 type: string
 *                 description: Code d'invitation de la room
 *                 example: "ABC123XYZ"
 *     responses:
 *       200:
 *         description: Vous avez rejoint la room
 *       400:
 *         description: Code d'invitation manquant
 *       403:
 *         description: Room déjà démarrée ou terminée
 *       404:
 *         description: Code d'invitation invalide
 *       409:
 *         description: Vous êtes déjà participant
 *       500:
 *         description: Erreur serveur
 */
router.post("/join", auth, gameController.joinGame);

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
 *   get:
 *     summary: Récupérer les filtres configurés pour une room
 *     description: Les filtres sont définis à la création de la room et ne peuvent plus être modifiés. Inclut les prix autorisés, la localisation et les types d'activité.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                   properties:
 *                     allowed_prices:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Prix autorisés (1-5)
 *                       example: [1, 2, 3]
 *                     location:
 *                       type: string
 *                       description: Localisation
 *                       example: "Caen"
 *                     activity_types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idactivity_type:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Bowling"
 *                       description: Types d'activité sélectionnés
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/filters", auth, gameController.getFilters);

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

// ==================== Vote des Dates ====================

/**
 * @swagger
 * /games/{id}/dates/vote:
 *   post:
 *     summary: Voter sur une date proposée (oui/non)
 *     description: Vote de type swipe sur chaque date. Disponible uniquement pendant le statut voting_dates.
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
 *             required:
 *               - idgamedate
 *               - vote
 *             properties:
 *               idgamedate:
 *                 type: integer
 *                 description: ID de la date proposée
 *                 example: 1
 *               vote:
 *                 type: boolean
 *                 description: true = Oui, false = Non
 *                 example: true
 *     responses:
 *       201:
 *         description: Vote enregistré. Peut inclure auto_transitioned=true si tous ont voté.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 auto_transitioned:
 *                   type: boolean
 *                   description: True si passage automatique au vote des activités
 *                 winning_date:
 *                   type: string
 *                   format: date-time
 *                   description: La date gagnante (si auto_transitioned)
 *                 status:
 *                   type: string
 *                   description: Nouveau statut (si auto_transitioned)
 *       400:
 *         description: Paramètre invalide ou date non liée à cette room
 *       403:
 *         description: Vote des dates non ouvert ou déjà terminé
 *       409:
 *         description: Déjà voté pour cette date
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post("/:id/dates/vote", auth, gameController.voteDate);

/**
 * @swagger
 * /games/{id}/date-results:
 *   get:
 *     summary: Résultats du vote des dates
 *     description: Classement des dates par taux d'approbation. Disponible après le début du vote des dates.
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
 *         description: Résultats du vote des dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 game:
 *                   type: object
 *                   properties:
 *                     idgame:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     winning_date:
 *                       type: string
 *                       format: date-time
 *                 date_results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idgamedate:
 *                         type: integer
 *                       date_option:
 *                         type: string
 *                         format: date-time
 *                       total_votes:
 *                         type: integer
 *                       positive_votes:
 *                         type: integer
 *                       negative_votes:
 *                         type: integer
 *                       approval_rate:
 *                         type: number
 *                       rank:
 *                         type: integer
 *       403:
 *         description: Vote des dates pas encore commencé ou non participant
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/date-results", auth, gameController.getDateResults);

/**
 * @swagger
 * /games/{id}/votes/my-date-votes:
 *   get:
 *     summary: Mes votes de dates pour cette room
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
 *         description: Liste de mes votes de dates avec progression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 votes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idgamedate:
 *                         type: integer
 *                       vote:
 *                         type: integer
 *                       voted_at:
 *                         type: string
 *                         format: date-time
 *                       date_option:
 *                         type: string
 *                         format: date-time
 *                 voted_count:
 *                   type: integer
 *                 total_dates:
 *                   type: integer
 *                 progress_percentage:
 *                   type: number
 *                 has_voted_all:
 *                   type: boolean
 *       403:
 *         description: Vous ne faites pas partie de cette room
 *       404:
 *         description: Room non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id/votes/my-date-votes", auth, gameController.getMyDateVotes);

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

module.exports = router;
