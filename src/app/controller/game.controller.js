const Game = require("../models/game.model");
const GameVote = require("../models/gameVote.model");

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

      // 5. Ajouter les dates si fournies
      if (dates && Array.isArray(dates) && dates.length > 0) {
        await Game.addDates(idgame, dates);
      }

      // 6. Ajouter le créateur comme participant
      await Game.addParticipant(idgame, idcreator, true);

      res.status(201).json({
        message: "Room créée avec succès",
        game: {
          ...newGame,
          activities_count: activitiesCount,
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

      // Vérifier que le statut actuel est "voting"
      if (game.status !== 'voting') {
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
   * Passage de waiting_for_launch à voting
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

      // Changer le statut à "voting"
      await Game.updateStatus(idgame, 'voting');

      // Récupérer les activités (avec filtrage mineur)
      const activitiesData = await Game.getGameActivities(idgame);

      res.json({
        message: "Vote lancé avec succès",
        status: "voting",
        activities: activitiesData.activities,
        total_activities: activitiesData.total,
        filtered_for_minors: activitiesData.filtered_for_minors
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
