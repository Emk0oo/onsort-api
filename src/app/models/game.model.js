const pool = require("../config/db");

/**
 * Génère un code d'invitation unique pour une room
 * Format : 6-10 caractères alphanumériques majuscules
 */
function generateInviteCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = Math.floor(Math.random() * 5) + 6; // Entre 6 et 10
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

const Game = {
  // ==================== CRUD Basique ====================

  /**
   * Récupère toutes les games
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT
        g.*,
        u.name as creator_name,
        u.surname as creator_surname,
        (SELECT COUNT(*) FROM game_user WHERE idgame = g.idgame) as participants_count
      FROM game g
      LEFT JOIN user u ON g.idcreator = u.iduser
      ORDER BY g.created_at DESC
    `);
    return rows;
  },

  /**
   * Récupère une game par ID avec toutes ses informations
   */
  async getById(id) {
    const [rows] = await pool.query(`
      SELECT
        g.*,
        u.name as creator_name,
        u.surname as creator_surname,
        u.email as creator_email
      FROM game g
      LEFT JOIN user u ON g.idcreator = u.iduser
      WHERE g.idgame = ?
    `, [id]);
    return rows[0];
  },

  /**
   * Trouve une game par code d'invitation
   */
  async getByInviteCode(code) {
    const [rows] = await pool.query(`
      SELECT
        g.*,
        u.name as creator_name,
        u.surname as creator_surname
      FROM game g
      LEFT JOIN user u ON g.idcreator = u.iduser
      WHERE g.invite_code = ?
    `, [code]);
    return rows[0];
  },

  /**
   * Crée une nouvelle game
   * Génère automatiquement un code d'invitation unique
   */
  async create(idcreator) {
    let inviteCode;
    let isUnique = false;

    // Génère un code unique (vérifie qu'il n'existe pas déjà)
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const [existing] = await pool.query(
        "SELECT idgame FROM game WHERE invite_code = ?",
        [inviteCode]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO game (idcreator, invite_code, status)
       VALUES (?, ?, 'waiting_for_launch')`,
      [idcreator, inviteCode]
    );

    // Ajouter automatiquement le créateur comme participant
    await this.addParticipant(result.insertId, idcreator, true);

    return {
      idgame: result.insertId,
      idcreator,
      invite_code: inviteCode,
      status: 'waiting_for_launch'
    };
  },

  /**
   * Met à jour le statut d'une game
   * Si le statut passe à 'voting_dates', enregistre date_voting_started_at
   * Si le statut passe à 'voting', enregistre voting_started_at
   */
  async updateStatus(idgame, status) {
    let query = "UPDATE game SET status = ?";
    const params = [status];

    // Si on passe en statut 'voting_dates', enregistrer le timestamp du début vote dates
    if (status === 'voting_dates') {
      query += ", date_voting_started_at = NOW()";
    }

    // Si on passe en statut 'voting', enregistrer le timestamp du début vote activités
    if (status === 'voting') {
      query += ", voting_started_at = NOW()";
    }

    query += " WHERE idgame = ?";
    params.push(idgame);

    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
  },

  /**
   * Définit la date gagnante du vote
   */
  async setWinningDate(idgame, winningDate) {
    const [result] = await pool.query(
      "UPDATE game SET winning_date = ? WHERE idgame = ?",
      [winningDate, idgame]
    );
    return result.affectedRows > 0;
  },

  /**
   * Vérifie si une game en statut 'voting_dates' a dépassé le timeout
   * et la fait passer automatiquement en 'voting' si c'est le cas
   * @param {number} idgame - ID de la game
   * @param {number} timeoutMinutes - Durée maximale du vote des dates en minutes (défaut: 5)
   * @returns {object} { auto_transitioned: boolean, reason: string }
   */
  async checkAndAutoTransitionDateVoting(idgame, timeoutMinutes = 5) {
    const [rows] = await pool.query(
      `SELECT idgame, status, date_voting_started_at,
       TIMESTAMPDIFF(MINUTE, date_voting_started_at, NOW()) as elapsed_minutes
       FROM game WHERE idgame = ?`,
      [idgame]
    );

    if (rows.length === 0) {
      return { auto_transitioned: false, reason: 'game_not_found' };
    }

    const game = rows[0];

    if (game.status !== 'voting_dates') {
      return { auto_transitioned: false, reason: 'not_voting_dates' };
    }

    if (!game.date_voting_started_at) {
      return { auto_transitioned: false, reason: 'no_start_time' };
    }

    if (game.elapsed_minutes >= timeoutMinutes) {
      // Calculer la date gagnante et transitionner vers 'voting'
      const GameDateVote = require("./gameDateVote.model");
      const winningDate = await GameDateVote.getWinningDate(idgame);
      if (winningDate) {
        await this.setWinningDate(idgame, winningDate);
      }
      await this.updateStatus(idgame, 'voting');
      return { auto_transitioned: true, reason: 'timeout', elapsed_minutes: game.elapsed_minutes, winning_date: winningDate };
    }

    return { auto_transitioned: false, reason: 'still_active', elapsed_minutes: game.elapsed_minutes };
  },

  /**
   * Vérifie si une game en statut 'voting' a dépassé le timeout
   * et la passe automatiquement en 'finished' si c'est le cas
   * Gère également le cas 'voting_dates' en déléguant à checkAndAutoTransitionDateVoting
   * @param {number} idgame - ID de la game
   * @param {number} timeoutMinutes - Durée maximale du vote en minutes (défaut: 60)
   * @returns {object} { auto_finished: boolean, reason: string }
   */
  async checkAndAutoFinishIfExpired(idgame, timeoutMinutes = 60) {
    // Récupérer la game
    const [rows] = await pool.query(
      `SELECT idgame, status, voting_started_at, date_voting_started_at,
       TIMESTAMPDIFF(MINUTE, voting_started_at, NOW()) as elapsed_minutes
       FROM game WHERE idgame = ?`,
      [idgame]
    );

    if (rows.length === 0) {
      return { auto_finished: false, reason: 'game_not_found' };
    }

    const game = rows[0];

    // Si le statut est 'voting_dates', vérifier le timeout du vote des dates
    if (game.status === 'voting_dates') {
      const dateTimeoutMinutes = parseInt(process.env.GAME_DATE_VOTING_TIMEOUT_MINUTES || 5);
      return await this.checkAndAutoTransitionDateVoting(idgame, dateTimeoutMinutes);
    }

    // Si le statut n'est pas 'voting', pas besoin de vérifier
    if (game.status !== 'voting') {
      return { auto_finished: false, reason: 'not_voting' };
    }

    // Si voting_started_at est null, ne rien faire
    if (!game.voting_started_at) {
      return { auto_finished: false, reason: 'no_start_time' };
    }

    // Vérifier si le timeout est dépassé
    if (game.elapsed_minutes >= timeoutMinutes) {
      // Auto-finish la game
      await this.updateStatus(idgame, 'finished');
      return { auto_finished: true, reason: 'timeout', elapsed_minutes: game.elapsed_minutes };
    }

    return { auto_finished: false, reason: 'still_active', elapsed_minutes: game.elapsed_minutes };
  },

  /**
   * Supprime une game
   */
  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM game WHERE idgame = ?", [id]);
    return result.affectedRows > 0;
  },

  // ==================== Gestion des participants ====================

  /**
   * Ajoute un participant à une game
   */
  async addParticipant(idgame, iduser, isCreator = false) {
    const [result] = await pool.query(
      `INSERT INTO game_user (idgame, iduser, is_creator)
       VALUES (?, ?, ?)`,
      [idgame, iduser, isCreator ? 1 : 0]
    );
    return result.affectedRows > 0;
  },

  /**
   * Récupère tous les participants d'une game avec leurs infos
   */
  async getParticipants(idgame) {
    const [rows] = await pool.query(`
      SELECT
        gu.iduser,
        u.name,
        u.surname,
        u.email,
        u.is_minor,
        gu.is_creator,
        gu.joined_at
      FROM game_user gu
      JOIN user u ON gu.iduser = u.iduser
      WHERE gu.idgame = ?
      ORDER BY gu.is_creator DESC, gu.joined_at ASC
    `, [idgame]);
    return rows;
  },

  /**
   * Retire un participant d'une game
   */
  async removeParticipant(idgame, iduser) {
    const [result] = await pool.query(
      "DELETE FROM game_user WHERE idgame = ? AND iduser = ? AND is_creator = 0",
      [idgame, iduser]
    );
    return result.affectedRows > 0;
  },

  /**
   * Vérifie si un utilisateur est participant d'une game
   */
  async isParticipant(idgame, iduser) {
    const [rows] = await pool.query(
      "SELECT idgame FROM game_user WHERE idgame = ? AND iduser = ?",
      [idgame, iduser]
    );
    return rows.length > 0;
  },

  /**
   * Vérifie si un utilisateur est le créateur d'une game
   */
  async isCreator(idgame, iduser) {
    const [rows] = await pool.query(
      "SELECT idgame FROM game_user WHERE idgame = ? AND iduser = ? AND is_creator = 1",
      [idgame, iduser]
    );
    return rows.length > 0;
  },

  /**
   * Vérifie si au moins un participant est mineur
   */
  async hasMinors(idgame) {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as minor_count
      FROM game_user gu
      JOIN user u ON gu.iduser = u.iduser
      WHERE gu.idgame = ? AND u.is_minor = 1
    `, [idgame]);
    return rows[0].minor_count > 0;
  },

  // ==================== Gestion des filtres ====================

  /**
   * Crée ou met à jour les filtres d'une game
   * Structure attendue : { allowed_prices: '[1,2,3]' (JSON string), location: 'Caen' }
   */
  async createFilters(idgame, filters) {
    const { allowed_prices, location } = filters;

    // Vérifier si des filtres existent déjà
    const [existing] = await pool.query(
      "SELECT idfilter FROM game_filters WHERE idgame = ?",
      [idgame]
    );

    if (existing.length > 0) {
      // Mettre à jour les filtres existants
      const [result] = await pool.query(
        `UPDATE game_filters
         SET allowed_prices = ?, location = ?
         WHERE idgame = ?`,
        [allowed_prices, location, idgame]
      );
      return result.affectedRows > 0;
    } else {
      // Créer de nouveaux filtres
      const [result] = await pool.query(
        `INSERT INTO game_filters (idgame, allowed_prices, location)
         VALUES (?, ?, ?)`,
        [idgame, allowed_prices, location]
      );
      return result.insertId;
    }
  },

  /**
   * Récupère les filtres d'une game
   */
  async getFilters(idgame) {
    const [rows] = await pool.query(
      "SELECT * FROM game_filters WHERE idgame = ?",
      [idgame]
    );
    return rows[0];
  },

  /**
   * Met à jour les filtres (alias de createFilters)
   */
  async updateFilters(idgame, filters) {
    return await this.createFilters(idgame, filters);
  },

  // ==================== Gestion des dates ====================

  /**
   * Ajoute des dates proposées à une game
   */
  async addDates(idgame, dates) {
    if (!Array.isArray(dates) || dates.length === 0) {
      return false;
    }

    const values = dates.map(date => [idgame, date]);
    const [result] = await pool.query(
      "INSERT INTO game_dates (idgame, date_option) VALUES ?",
      [values]
    );
    return result.affectedRows;
  },

  /**
   * Récupère toutes les dates d'une game
   */
  async getDates(idgame) {
    const [rows] = await pool.query(
      "SELECT * FROM game_dates WHERE idgame = ? ORDER BY date_option ASC",
      [idgame]
    );
    return rows;
  },

  /**
   * Supprime une date spécifique
   */
  async deleteDate(idgamedate) {
    const [result] = await pool.query(
      "DELETE FROM game_dates WHERE idgamedate = ?",
      [idgamedate]
    );
    return result.affectedRows > 0;
  },

  // ==================== Activités pour le vote ====================

  /**
   * Récupère les activités filtrées pour le vote
   * Applique les filtres de la game + exclusion des activités interdites aux mineurs si nécessaire
   */
  async getActivitiesForVoting(idgame) {
    // Récupérer les filtres de la game
    const filters = await this.getFilters(idgame);

    // Vérifier s'il y a des mineurs
    const hasMinors = await this.hasMinors(idgame);

    // Construire la requête avec les filtres
    let query = `
      SELECT DISTINCT
        a.idactivity,
        a.name,
        a.description,
        a.minor_forbidden,
        a.address,
        a.price_range,
        a.idactivity_type,
        at.name as activity_type_name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'idpicture', p.idpicture,
            'url', p.url,
            'alt', p.alt
          )
        ) as pictures,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'idfeature', f.idfeature,
            'name', f.name
          )
        ) as features
      FROM activity a
      LEFT JOIN activity_type at ON a.idactivity_type = at.idactivity_type
      LEFT JOIN activity_picture ap ON a.idactivity = ap.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
      LEFT JOIN activity_feature af ON a.idactivity = af.idactivity
      LEFT JOIN feature f ON af.idfeature = f.idfeature
      WHERE 1=1
    `;

    const params = [];

    // Filtrage automatique des activités interdites aux mineurs
    if (hasMinors) {
      query += " AND a.minor_forbidden = 0";
    }

    // Filtre par type d'activité
    if (filters && filters.activity_type) {
      query += " AND at.name = ?";
      params.push(filters.activity_type);
    }

    // Filtre par fourchette de prix
    if (filters && filters.price_range_min) {
      query += " AND a.price_range >= ?";
      params.push(filters.price_range_min);
    }
    if (filters && filters.price_range_max) {
      query += " AND a.price_range <= ?";
      params.push(filters.price_range_max);
    }

    query += " GROUP BY a.idactivity";

    const [rows] = await pool.query(query, params);

    // Filtrer les données (MySQL2 parse automatiquement les JSON)
    return rows.map(row => ({
      ...row,
      pictures: row.pictures ? row.pictures.filter(p => p.idpicture) : [],
      features: row.features ? row.features.filter(f => f.idfeature) : []
    }));
  },

  // ==================== Historique utilisateur ====================

  /**
   * Récupère toutes les games d'un utilisateur (créées + participées)
   */
  async getGamesByUser(iduser) {
    const [rows] = await pool.query(`
      SELECT
        g.idgame,
        g.invite_code,
        g.status,
        g.winning_date,
        g.created_at,
        g.updated_at,
        gu.is_creator,
        creator.name as creator_name,
        creator.surname as creator_surname,
        (SELECT COUNT(*) FROM game_user WHERE idgame = g.idgame) as participants_count
      FROM game_user gu
      JOIN game g ON gu.idgame = g.idgame
      JOIN user creator ON g.idcreator = creator.iduser
      WHERE gu.iduser = ?
      ORDER BY g.created_at DESC
    `, [iduser]);
    return rows;
  },

  // ==================== Gestion des types d'activité ====================

  /**
   * Ajoute des types d'activité à une game
   */
  async addActivityTypes(idgame, activityTypeIds) {
    if (!activityTypeIds || activityTypeIds.length === 0) return;

    const values = activityTypeIds.map(id => [idgame, id]);
    await pool.query(
      "INSERT INTO game_activity_types (idgame, idactivity_type) VALUES ?",
      [values]
    );
  },

  /**
   * Récupère les types d'activité d'une game
   */
  async getActivityTypes(idgame) {
    const [rows] = await pool.query(`
      SELECT
        gat.idactivity_type,
        at.name
      FROM game_activity_types gat
      JOIN activity_type at ON gat.idactivity_type = at.idactivity_type
      WHERE gat.idgame = ?
    `, [idgame]);
    return rows;
  },

  // ==================== Gestion des activités filtrées ====================

  /**
   * Filtre et ajoute automatiquement les activités correspondant aux critères
   * @param {number} idgame - ID de la game
   * @param {Array<number>} activityTypeIds - IDs des types d'activité
   * @param {Array<number>} allowedPrices - Prix acceptés (valeurs de price_range)
   * @returns {number} Nombre d'activités ajoutées
   */
  async filterAndAddActivities(idgame, activityTypeIds, allowedPrices) {
    if (!activityTypeIds || activityTypeIds.length === 0) {
      throw new Error("Au moins un type d'activité doit être sélectionné");
    }

    if (!allowedPrices || allowedPrices.length === 0) {
      throw new Error("Au moins un prix doit être sélectionné");
    }

    // SELECT des activités qui matchent les critères
    const [activities] = await pool.query(`
      SELECT idactivity
      FROM activity
      WHERE idactivity_type IN (?)
        AND price_range IN (?)
    `, [activityTypeIds, allowedPrices]);

    if (activities.length === 0) {
      return 0; // Aucune activité ne correspond aux critères
    }

    // INSERT dans game_activity
    const values = activities.map(a => [idgame, a.idactivity]);
    await pool.query(
      "INSERT INTO game_activity (idgame, idactivity) VALUES ?",
      [values]
    );

    return activities.length;
  },

  /**
   * Récupère uniquement les IDs des activités d'une game
   * @param {number} idgame - ID de la game
   * @returns {Array<number>} Tableau des IDs d'activité
   */
  async getActivityIds(idgame) {
    const [rows] = await pool.query(
      "SELECT idactivity FROM game_activity WHERE idgame = ? ORDER BY idactivity ASC",
      [idgame]
    );
    return rows.map(row => row.idactivity);
  },

  /**
   * Récupère les activités d'une game (avec filtrage mineur si nécessaire)
   */
  async getGameActivities(idgame) {
    // Vérifier s'il y a des mineurs dans la game
    const [minorCheck] = await pool.query(`
      SELECT COUNT(*) as minor_count
      FROM game_user gu
      JOIN user u ON gu.iduser = u.iduser
      WHERE gu.idgame = ? AND u.is_minor = 1
    `, [idgame]);

    const hasMinors = minorCheck[0].minor_count > 0;

    // Construire la requête avec ou sans filtrage mineur
    let query = `
      SELECT
        a.idactivity,
        a.name,
        a.description,
        a.address,
        a.price_range,
        a.minor_forbidden,
        a.idactivity_type,
        at.name as activity_type_name
      FROM game_activity ga
      JOIN activity a ON ga.idactivity = a.idactivity
      LEFT JOIN activity_type at ON a.idactivity_type = at.idactivity_type
      WHERE ga.idgame = ?
    `;

    if (hasMinors) {
      query += " AND a.minor_forbidden = 0";
    }

    query += " ORDER BY a.name ASC";

    const [rows] = await pool.query(query, [idgame]);

    return {
      activities: rows,
      filtered_for_minors: hasMinors,
      total: rows.length
    };
  },

  /**
   * Compte le nombre d'activités associées à une game
   */
  async getActivitiesCount(idgame) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM game_activity WHERE idgame = ?",
      [idgame]
    );
    return rows[0].count;
  },
};

module.exports = Game;
