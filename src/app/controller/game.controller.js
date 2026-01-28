const Game = require("../models/game.model");
const GameVote = require("../models/gameVote.model");
const GameDateVote = require("../models/gameDateVote.model");
const pool = require("../config/db");

const gameController = {
  // ==================== Gestion des Rooms ====================

  /**
   * POST /api/games
   * Crée une nouvelle room de vote avec configuration et filtrage automatique
   */
  async createGame(req, res) {
    try {
      const idcreator = req.user.id;
      const { activity_types, allowed_prices, location, dates } = req.body;

      // Validation des paramètres obligatoires
      if (!activity_types || !Array.isArray(activity_types) || activity_types.length === 0) {
        return res.status(400).json({
          message: "Au moins un type d'activité doit être sélectionné"
        });
      }

      if (!allowed_prices || !Array.isArray(allowed_prices) || allowed_prices.length === 0) {
        return res.status(400).json({
          message: "Au moins un prix doit être sélectionné"
        });
      }

      // 1. Créer la game
      const newGame = await Game.create(idcreator);
      const idgame = newGame.idgame;

      // 2. Ajouter les types d'activité sélectionnés
      await Game.addActivityTypes(idgame, activity_types);

      // 3. Créer les filtres avec les prix autorisés
      await Game.createFilters(idgame, {
        allowed_prices: JSON.stringify(allowed_prices),
        location: location || null
      });

      // 4. Filtrer et ajouter automatiquement les activités correspondantes
      const activitiesCount = await Game.filterAndAddActivities(
        idgame,
        activity_types,
        allowed_prices
      );

      if (activitiesCount === 0) {
        // Nettoyer la game si aucune activité ne correspond
        await Game.delete(idgame);
        return res.status(400).json({
          message: "Aucune activité ne correspond aux critères sélectionnés. Veuillez ajuster vos filtres."
        });
      }

      // 5. Récupérer les IDs des activités filtrées
      const activityIds = await Game.getActivityIds(idgame);

      // 6. Ajouter les dates si fournies
      if (dates && Array.isArray(dates) && dates.length > 0) {
        await Game.addDates(idgame, dates);
      }

      // Note: Le créateur est déjà ajouté automatiquement dans Game.create()

      res.status(201).json({
        message: "Room créée avec succès",
        game: {
          ...newGame,
          activities_count: activitiesCount,
          activity_ids: activityIds,
          activity_types: activity_types,
          allowed_prices: allowed_prices,
          dates_count: dates ? dates.length : 0
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id
   * Récupère les détails d'une room
   */
  async getGame(req, res) {
    try {
      const { id } = req.params;

      // Vérifier et auto-finish si timeout dépassé (60 minutes par défaut)
      const timeoutMinutes = process.env.GAME_VOTING_TIMEOUT_MINUTES || 60;
      await Game.checkAndAutoFinishIfExpired(id, parseInt(timeoutMinutes));

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Récupérer les informations complémentaires
      const participants = await Game.getParticipants(id);
      const filters = await Game.getFilters(id);
      const dates = await Game.getDates(id);
      const activityIds = await Game.getActivityIds(id);

      res.json({
        game: {
          ...game,
          participants_count: participants.length,
          activity_ids: activityIds,
          filters: filters || null,
          dates: dates || []
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/code/:invite_code
   * Trouve une room par code d'invitation
   */
  async getGameByCode(req, res) {
    try {
      const { invite_code } = req.params;

      const game = await Game.getByInviteCode(invite_code);
      if (!game) {
        return res.status(404).json({ message: "Code d'invitation invalide" });
      }

      const participants = await Game.getParticipants(game.idgame);

      res.json({
        game: {
          ...game,
          participants_count: participants.length
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * DELETE /api/games/:id
   * Supprime une room (créateur uniquement)
   */
  async deleteGame(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut supprimer la room" });
      }

      await Game.deleteById(id);
      res.json({ message: "Room supprimée avec succès" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/status
   * Récupère le statut détaillé d'une room avec la progression du vote
   */
  async getGameStatus(req, res) {
    try {
      const { id } = req.params;
      const activityTimeoutMinutes = parseInt(process.env.GAME_VOTING_TIMEOUT_MINUTES || 60);
      const dateTimeoutMinutes = parseInt(process.env.GAME_DATE_VOTING_TIMEOUT_MINUTES || 5);

      // Vérifier et auto-transition/auto-finish si timeout dépassé
      await Game.checkAndAutoFinishIfExpired(id, activityTimeoutMinutes);

      // Récupérer les infos de la game
      const [gameRows] = await pool.query(
        `SELECT idgame, status, created_at, updated_at, voting_started_at,
         date_voting_started_at, winning_date,
         CASE
           WHEN status = 'voting_dates' AND date_voting_started_at IS NOT NULL
           THEN TIMESTAMPDIFF(MINUTE, date_voting_started_at, NOW())
           WHEN voting_started_at IS NOT NULL
           THEN TIMESTAMPDIFF(MINUTE, voting_started_at, NOW())
           ELSE NULL
         END as time_elapsed_minutes,
         CASE
           WHEN status = 'voting_dates' AND date_voting_started_at IS NOT NULL
           THEN GREATEST(0, ? - TIMESTAMPDIFF(MINUTE, date_voting_started_at, NOW()))
           WHEN voting_started_at IS NOT NULL
           THEN GREATEST(0, ? - TIMESTAMPDIFF(MINUTE, voting_started_at, NOW()))
           ELSE NULL
         END as time_remaining_minutes
         FROM game WHERE idgame = ?`,
        [dateTimeoutMinutes, activityTimeoutMinutes, id]
      );

      if (gameRows.length === 0) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      const game = gameRows[0];

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Récupérer les participants
      const participants = await Game.getParticipants(id);

      // Déterminer la phase actuelle et récupérer la progression appropriée
      let currentPhase = null;
      let votingProgress = null;
      let participantsWithProgress = [];
      let timeoutMinutes = null;

      if (game.status === 'voting_dates') {
        currentPhase = 'date_voting';
        timeoutMinutes = dateTimeoutMinutes;
        votingProgress = await GameDateVote.getAllParticipantsVoted(id);

        participantsWithProgress = await Promise.all(
          participants.map(async (participant) => {
            const progress = await GameDateVote.getUserVotingProgress(id, participant.iduser);
            return {
              iduser: participant.iduser,
              name: participant.name,
              surname: participant.surname,
              is_creator: participant.is_creator,
              has_voted_all: progress.has_voted_all,
              progress_percentage: progress.progress_percentage
            };
          })
        );
      } else if (game.status === 'voting') {
        currentPhase = 'activity_voting';
        timeoutMinutes = activityTimeoutMinutes;
        votingProgress = await GameVote.getAllParticipantsVoted(id);

        participantsWithProgress = await Promise.all(
          participants.map(async (participant) => {
            const progress = await GameVote.getUserVotingProgress(id, participant.iduser);
            return {
              iduser: participant.iduser,
              name: participant.name,
              surname: participant.surname,
              is_creator: participant.is_creator,
              has_voted_all: progress.has_voted_all,
              progress_percentage: progress.progress_percentage
            };
          })
        );
      } else {
        // waiting_for_launch ou finished
        participantsWithProgress = participants.map(p => ({
          iduser: p.iduser,
          name: p.name,
          surname: p.surname,
          is_creator: p.is_creator
        }));
      }

      res.json({
        game: {
          idgame: game.idgame,
          status: game.status,
          current_phase: currentPhase,
          created_at: game.created_at,
          voting_started_at: game.voting_started_at,
          date_voting_started_at: game.date_voting_started_at,
          winning_date: game.winning_date,
          time_elapsed_minutes: game.time_elapsed_minutes,
          time_remaining_minutes: game.time_remaining_minutes,
          timeout_minutes: timeoutMinutes
        },
        voting_progress: votingProgress ? {
          total_participants: votingProgress.total_participants,
          completed_count: votingProgress.completed_count,
          completion_rate: votingProgress.completion_rate,
          all_participants_voted: votingProgress.all_participants_voted
        } : null,
        participants: participantsWithProgress
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * PATCH /api/games/:id/status
   * Change le statut d'une room (créateur uniquement)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Seul "finished" est accepté ici (le passage à "voting" se fait via /launch)
      if (status !== 'finished') {
        return res.status(400).json({
          message: "Seul le statut 'finished' peut être défini via cet endpoint. Utilisez /launch pour démarrer le vote."
        });
      }

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut changer le statut" });
      }

      // Vérifier que le statut actuel est "voting" ou "voting_dates"
      if (game.status !== 'voting' && game.status !== 'voting_dates') {
        return res.status(403).json({
          message: "Seule une room en cours de vote peut être terminée"
        });
      }

      await Game.updateStatus(id, status);
      res.json({
        message: "Vote terminé avec succès",
        status: "finished"
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * PATCH /api/games/:invite_code/launch
   * Lance le vote (créateur uniquement)
   * Si 2+ dates : passage à voting_dates
   * Si 0-1 date : passage direct à voting
   */
  async launchGame(req, res) {
    try {
      const { invite_code } = req.params;
      const iduser = req.user.id;

      // Trouver la game par code
      const game = await Game.getByInviteCode(invite_code);
      if (!game) {
        return res.status(404).json({ message: "Code d'invitation invalide" });
      }

      const idgame = game.idgame;

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(idgame, iduser);
      if (!isCreator) {
        return res.status(403).json({
          message: "Seul le créateur peut lancer le vote"
        });
      }

      // Vérifier que le statut est waiting_for_launch
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({
          message: "La room a déjà été lancée ou est terminée"
        });
      }

      // Vérifier qu'il y a au moins une activité
      const activitiesCount = await Game.getActivitiesCount(idgame);
      if (activitiesCount === 0) {
        return res.status(400).json({
          message: "Impossible de lancer le vote : aucune activité n'est associée à cette room"
        });
      }

      // Récupérer les dates proposées
      const dates = await Game.getDates(idgame);

      // Si 2+ dates, démarrer le vote des dates
      if (dates.length >= 2) {
        await Game.updateStatus(idgame, 'voting_dates');

        return res.json({
          message: "Vote des dates lancé avec succès",
          status: "voting_dates",
          dates: dates,
          total_dates: dates.length
        });
      }

      // Si 0 ou 1 date, passer directement au vote des activités
      if (dates.length === 1) {
        // Auto-sélectionner la seule date comme gagnante
        await Game.setWinningDate(idgame, dates[0].date_option);
      }

      await Game.updateStatus(idgame, 'voting');

      // Récupérer les activités (avec filtrage mineur)
      const activitiesData = await Game.getGameActivities(idgame);

      res.json({
        message: "Vote lancé avec succès",
        status: "voting",
        activities: activitiesData.activities,
        total_activities: activitiesData.total,
        filtered_for_minors: activitiesData.filtered_for_minors,
        winning_date: dates.length === 1 ? dates[0].date_option : null
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Participation ====================

  /**
   * POST /api/games/:id/join
   * Rejoint une room avec le code d'invitation
   */
  async joinGame(req, res) {
    try {
      const { invite_code } = req.body;
      const iduser = req.user.id;

      // Validation du code
      if (!invite_code) {
        return res.status(400).json({ message: "Code d'invitation requis" });
      }

      // Trouver la game par code
      const game = await Game.getByInviteCode(invite_code);
      if (!game) {
        return res.status(404).json({ message: "Code d'invitation invalide" });
      }

      const idgame = game.idgame;

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Impossible de rejoindre, la room a déjà démarré ou est terminée" });
      }

      // Vérifier que l'utilisateur n'est pas déjà participant
      const isAlreadyParticipant = await Game.isParticipant(idgame, iduser);
      if (isAlreadyParticipant) {
        return res.status(409).json({ message: "Vous êtes déjà participant de cette room" });
      }

      await Game.addParticipant(idgame, iduser, false);

      const participants = await Game.getParticipants(idgame);

      res.json({
        message: "Vous avez rejoint la room avec succès",
        game: {
          idgame: game.idgame,
          invite_code: game.invite_code,
          status: game.status,
          creator: `${game.creator_name} ${game.creator_surname}`,
          participants_count: participants.length
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/participants
   * Liste des participants d'une room
   */
  async getParticipants(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      const participants = await Game.getParticipants(id);

      // Ajouter la progression de vote selon le statut
      if (game.status === 'voting_dates') {
        for (let participant of participants) {
          const progress = await GameDateVote.getUserVotingProgress(id, participant.iduser);
          participant.has_voted_all_dates = progress.has_voted_all;
          participant.date_voting_progress = progress.progress_percentage;
        }
      } else if (game.status === 'voting') {
        for (let participant of participants) {
          const progress = await GameVote.getUserVotingProgress(id, participant.iduser);
          participant.has_voted_all = progress.has_voted_all;
          participant.voting_progress = progress.progress_percentage;
        }
      }

      // Vérifier s'il y a des mineurs
      const hasMinors = participants.some(p => p.is_minor === 1);

      res.json({
        participants,
        total: participants.length,
        has_minors: hasMinors
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * DELETE /api/games/:id/participants/:user_id
   * Retire un participant (créateur uniquement)
   */
  async removeParticipant(req, res) {
    try {
      const { id, user_id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut retirer un participant" });
      }

      // Empêcher de retirer le créateur
      const isTargetCreator = await Game.isCreator(id, user_id);
      if (isTargetCreator) {
        return res.status(403).json({ message: "Impossible de retirer le créateur" });
      }

      const removed = await Game.removeParticipant(id, user_id);
      if (!removed) {
        return res.status(404).json({ message: "Participant non trouvé" });
      }

      res.json({ message: "Participant retiré avec succès" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Filtres ====================
  // NOTE: Les filtres sont maintenant configurés directement lors de la création de la game (POST /api/games)
  // Ces endpoints separés pour créer/modifier les filtres sont obsolètes et ont été supprimés

  /**
   * GET /api/games/:id/filters
   * Récupère les filtres d'une room (prix autorisés, localisation, types d'activités)
   */
  async getFilters(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Récupérer les filtres de prix et localisation
      const filters = await Game.getFilters(id);

      // Récupérer les types d'activité sélectionnés
      const activityTypes = await Game.getActivityTypes(id);

      res.json({
        filters: {
          allowed_prices: filters?.allowed_prices ? JSON.parse(filters.allowed_prices) : [],
          location: filters?.location || null,
          activity_types: activityTypes
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Dates ====================

  /**
   * POST /api/games/:id/dates
   * Ajoute des dates proposées
   */
  async addDates(req, res) {
    try {
      const { id } = req.params;
      const { dates } = req.body;

      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ message: "Le champ 'dates' doit être un tableau non vide" });
      }

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut ajouter des dates" });
      }

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Les dates ne peuvent être ajoutées qu'avant le lancement du vote" });
      }

      const count = await Game.addDates(id, dates);

      res.status(201).json({
        message: "Dates ajoutées avec succès",
        count
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/dates
   * Récupère les dates d'une room
   */
  async getDates(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      const dates = await Game.getDates(id);
      res.json({ dates });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * DELETE /api/games/:id/dates/:date_id
   * Supprime une date (créateur uniquement)
   */
  async deleteDate(req, res) {
    try {
      const { id, date_id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut supprimer une date" });
      }

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Les dates ne peuvent être supprimées qu'avant le lancement du vote" });
      }

      const deleted = await Game.deleteDate(date_id);
      if (!deleted) {
        return res.status(404).json({ message: "Date non trouvée" });
      }

      res.json({ message: "Date supprimée avec succès" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Vote des Dates ====================

  /**
   * POST /api/games/:id/dates/vote
   * Vote sur une date proposée (oui/non)
   */
  async voteDate(req, res) {
    try {
      const { id } = req.params;
      const { idgamedate, vote } = req.body;
      const iduser = req.user.id;

      // Validation du vote
      if (typeof vote !== 'boolean') {
        return res.status(400).json({
          message: "Le champ 'vote' doit être un boolean (true = Oui, false = Non)"
        });
      }

      // Validation de idgamedate
      if (!idgamedate) {
        return res.status(400).json({
          message: "Le champ 'idgamedate' est requis"
        });
      }

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, iduser);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Vérifier le statut (uniquement voting_dates)
      if (game.status !== 'voting_dates') {
        return res.status(403).json({
          message: "Le vote des dates n'est pas ouvert ou est déjà terminé"
        });
      }

      // Vérifier que l'utilisateur n'a pas déjà voté pour cette date
      const hasVoted = await GameDateVote.hasVoted(id, iduser, idgamedate);
      if (hasVoted) {
        return res.status(409).json({
          message: "Vous avez déjà voté pour cette date"
        });
      }

      // Vérifier que la date appartient bien à cette game
      const dates = await Game.getDates(id);
      const dateExists = dates.some(d => d.idgamedate === parseInt(idgamedate));
      if (!dateExists) {
        return res.status(400).json({
          message: "Cette date n'appartient pas à cette room"
        });
      }

      // Créer le vote
      await GameDateVote.create(id, iduser, idgamedate, vote);

      // Vérifier si tous les participants ont voté sur toutes les dates
      const progress = await GameDateVote.getAllParticipantsVoted(id);

      if (progress.all_participants_voted) {
        // Auto-transition vers le vote des activités
        const winningDate = await GameDateVote.getWinningDate(id);
        if (winningDate) {
          await Game.setWinningDate(id, winningDate);
        }
        await Game.updateStatus(id, 'voting');

        const activitiesData = await Game.getGameActivities(id);

        return res.status(201).json({
          message: "Vote enregistré. Tous les participants ont voté sur les dates, passage au vote des activités !",
          auto_transitioned: true,
          winning_date: winningDate,
          status: "voting",
          activities: activitiesData.activities,
          total_activities: activitiesData.total
        });
      }

      res.status(201).json({
        message: "Vote de date enregistré avec succès",
        date_voting_progress: {
          completed_count: progress.completed_count,
          total_participants: progress.total_participants,
          completion_rate: progress.completion_rate
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/date-results
   * Résultats du vote des dates
   */
  async getDateResults(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Permettre l'accès aux résultats une fois le vote des dates commencé
      if (game.status === 'waiting_for_launch') {
        return res.status(403).json({
          message: "Le vote des dates n'a pas encore commencé"
        });
      }

      const results = await GameDateVote.getResults(id);

      res.json({
        game: {
          idgame: game.idgame,
          status: game.status,
          winning_date: game.winning_date
        },
        date_results: results
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/votes/my-date-votes
   * Mes votes de dates pour cette room
   */
  async getMyDateVotes(req, res) {
    try {
      const { id } = req.params;
      const iduser = req.user.id;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, iduser);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      const votes = await GameDateVote.getByGameAndUser(id, iduser);
      const progress = await GameDateVote.getUserVotingProgress(id, iduser);

      res.json({
        votes,
        ...progress
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Activités et Votes ====================

  /**
   * GET /api/games/:id/activities
   * Liste des activités à voter (filtrées automatiquement)
   */
  async getActivities(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Récupérer les activités filtrées (avec protection mineurs)
      const activitiesData = await Game.getGameActivities(id);

      res.json({
        activities: activitiesData.activities,
        total: activitiesData.total,
        filtered_for_minors: activitiesData.filtered_for_minors
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * POST /api/games/:id/vote
   * Vote sur une activité (oui/non)
   */
  async vote(req, res) {
    try {
      const { id } = req.params;
      const { idactivity, vote } = req.body;
      const iduser = req.user.id;

      if (typeof vote !== 'boolean') {
        return res.status(400).json({ message: "Le champ 'vote' doit être un boolean (true = Oui, false = Non)" });
      }

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, iduser);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Vérifier le statut (uniquement voting)
      if (game.status !== 'voting') {
        return res.status(403).json({ message: "Le vote n'est pas encore ouvert ou est déjà terminé" });
      }

      // Vérifier que l'utilisateur n'a pas déjà voté
      const hasVoted = await GameVote.hasVoted(id, iduser, idactivity);
      if (hasVoted) {
        return res.status(409).json({ message: "Vous avez déjà voté pour cette activité" });
      }

      await GameVote.create(id, iduser, idactivity, vote);

      // Vérifier si tous les participants ont terminé de voter
      const progress = await GameVote.getAllParticipantsVoted(id);

      if (progress.all_participants_voted) {
        // Auto-finish : tous les participants ont voté
        await Game.updateStatus(id, 'finished');
        return res.status(201).json({
          message: "Vote enregistré avec succès. Tous les participants ont voté, la room est terminée !",
          auto_finished: true,
          voting_stats: {
            total_participants: progress.total_participants,
            completion_rate: 100
          }
        });
      }

      res.status(201).json({
        message: "Vote enregistré avec succès",
        voting_progress: {
          completed_count: progress.completed_count,
          total_participants: progress.total_participants,
          completion_rate: progress.completion_rate
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/votes/my-votes
   * Mes votes pour cette room
   */
  async getMyVotes(req, res) {
    try {
      const { id } = req.params;
      const iduser = req.user.id;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, iduser);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      const votes = await GameVote.getByGameAndUser(id, iduser);
      const progress = await GameVote.getUserVotingProgress(id, iduser);

      res.json({
        votes,
        ...progress
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/results
   * Récapitulatif des votes (disponible uniquement si status = finished)
   */
  async getResults(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est participant
      const isParticipant = await Game.isParticipant(id, req.user.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Vous ne faites pas partie de cette room" });
      }

      // Vérifier le statut (uniquement finished)
      if (game.status !== 'finished') {
        return res.status(403).json({ message: "Les résultats ne sont pas encore disponibles" });
      }

      const results = await GameVote.getResults(id);
      const participants = await Game.getParticipants(id);
      const votingStats = await GameVote.getAllParticipantsVoted(id);
      const dateResults = await GameDateVote.getResults(id);

      const top3 = results.slice(0, 3).map(r => r.idactivity);

      res.json({
        game: {
          idgame: game.idgame,
          status: game.status,
          created_at: game.created_at,
          finished_at: game.updated_at,
          winning_date: game.winning_date,
          total_participants: participants.length,
          total_activities: results.length
        },
        results,
        top_3: top3,
        date_results: dateResults,
        voting_stats: votingStats
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ==================== Historique ====================

  /**
   * GET /api/games/my-games
   * Historique des rooms de l'utilisateur
   */
  async getMyGames(req, res) {
    try {
      const iduser = req.user.id;

      const games = await Game.getGamesByUser(iduser);

      // Enrichir les données pour chaque game
      for (let game of games) {
        // Si finished, récupérer l'activité gagnante
        if (game.status === 'finished') {
          const results = await GameVote.getResults(game.idgame);
          if (results.length > 0) {
            game.winner_activity = {
              idactivity: results[0].idactivity,
              name: results[0].name,
              approval_rate: results[0].approval_rate
            };
            game.activities_count = results.length;
          }
        }

        // Si voting_dates, récupérer la progression du vote des dates
        if (game.status === 'voting_dates') {
          const dateProgress = await GameDateVote.getUserVotingProgress(game.idgame, iduser);
          game.my_date_voting_progress = dateProgress.progress_percentage;
          game.current_phase = "date_voting";
        }

        // Si voting, récupérer la progression
        if (game.status === 'voting') {
          const progress = await GameVote.getUserVotingProgress(game.idgame, iduser);
          game.my_voting_progress = progress.progress_percentage;
          game.current_phase = "activity_voting";
        }
      }

      res.json({
        games,
        total: games.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = gameController;
