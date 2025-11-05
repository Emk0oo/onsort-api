const Game = require("../models/game.model");
const GameVote = require("../models/gameVote.model");

const gameController = {
  // ==================== Gestion des Rooms ====================

  /**
   * POST /api/games
   * Crée une nouvelle room de vote
   */
  async createGame(req, res) {
    try {
      const idcreator = req.user.id;

      const newGame = await Game.create(idcreator);

      res.status(201).json({
        message: "Room créée avec succès",
        game: newGame
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

      res.json({
        game: {
          ...game,
          participants_count: participants.length,
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
   * PATCH /api/games/:id/status
   * Change le statut d'une room (créateur uniquement)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Valider le statut
      const validStatuses = ['waiting_for_launch', 'voting', 'finished'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
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

      // Vérifier les transitions autorisées
      if (game.status === 'finished') {
        return res.status(403).json({ message: "Une room terminée ne peut pas être modifiée" });
      }

      if (game.status === 'voting' && status === 'waiting_for_launch') {
        return res.status(403).json({ message: "Impossible de revenir au statut 'waiting_for_launch'" });
      }

      await Game.updateStatus(id, status);
      res.json({
        message: "Statut mis à jour avec succès",
        status
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
      const { id } = req.params;
      const { invite_code } = req.body;
      const iduser = req.user.id;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier le code d'invitation
      if (game.invite_code !== invite_code) {
        return res.status(403).json({ message: "Code d'invitation incorrect" });
      }

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Impossible de rejoindre, la room a déjà démarré ou est terminée" });
      }

      // Vérifier que l'utilisateur n'est pas déjà participant
      const isAlreadyParticipant = await Game.isParticipant(id, iduser);
      if (isAlreadyParticipant) {
        return res.status(409).json({ message: "Vous êtes déjà participant de cette room" });
      }

      await Game.addParticipant(id, iduser, false);

      const participants = await Game.getParticipants(id);

      res.json({
        message: "Vous avez rejoint la room avec succès",
        game: {
          idgame: game.idgame,
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

      // Ajouter la progression de vote si statut = voting
      if (game.status === 'voting') {
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

  /**
   * POST /api/games/:id/filters
   * Configure les filtres de sélection d'activités
   */
  async createFilters(req, res) {
    try {
      const { id } = req.params;
      const { activity_type, price_range_min, price_range_max, location } = req.body;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut configurer les filtres" });
      }

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Les filtres ne peuvent être configurés qu'avant le lancement du vote" });
      }

      await Game.createFilters(id, {
        activity_type,
        price_range_min,
        price_range_max,
        location
      });

      res.json({ message: "Filtres configurés avec succès" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * GET /api/games/:id/filters
   * Récupère les filtres d'une room
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

      const filters = await Game.getFilters(id);
      res.json({ filters: filters || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * PUT /api/games/:id/filters
   * Modifie les filtres (créateur uniquement, avant lancement)
   */
  async updateFilters(req, res) {
    try {
      const { id } = req.params;
      const { activity_type, price_range_min, price_range_max, location } = req.body;

      const game = await Game.getById(id);
      if (!game) {
        return res.status(404).json({ message: "Room non trouvée" });
      }

      // Vérifier que l'utilisateur est le créateur
      const isCreator = await Game.isCreator(id, req.user.id);
      if (!isCreator) {
        return res.status(403).json({ message: "Seul le créateur peut modifier les filtres" });
      }

      // Vérifier le statut (uniquement waiting_for_launch)
      if (game.status !== 'waiting_for_launch') {
        return res.status(403).json({ message: "Les filtres ne peuvent être modifiés qu'avant le lancement du vote" });
      }

      await Game.updateFilters(id, {
        activity_type,
        price_range_min,
        price_range_max,
        location
      });

      res.json({ message: "Filtres mis à jour avec succès" });
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

      const activities = await Game.getActivitiesForVoting(id);
      const hasMinors = await Game.hasMinors(id);

      res.json({
        activities,
        total: activities.length,
        filtered_for_minors: hasMinors
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

      res.status(201).json({ message: "Vote enregistré avec succès" });
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

      const top3 = results.slice(0, 3).map(r => r.idactivity);

      res.json({
        game: {
          idgame: game.idgame,
          status: game.status,
          created_at: game.created_at,
          finished_at: game.updated_at,
          total_participants: participants.length,
          total_activities: results.length
        },
        results,
        top_3: top3,
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

        // Si voting, récupérer la progression
        if (game.status === 'voting') {
          const progress = await GameVote.getUserVotingProgress(game.idgame, iduser);
          game.my_voting_progress = progress.progress_percentage;
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
