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
   */
  async updateStatus(idgame, status) {
    const [result] = await pool.query(
      "UPDATE game SET status = ? WHERE idgame = ?",
      [status, idgame]
    );
    return result.affectedRows > 0;
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
   */
  async createFilters(idgame, filters) {
    const { activity_type, price_range_min, price_range_max, location } = filters;

    // Vérifier si des filtres existent déjà
    const [existing] = await pool.query(
      "SELECT idfilter FROM game_filters WHERE idgame = ?",
      [idgame]
    );

    if (existing.length > 0) {
      // Mettre à jour les filtres existants
      const [result] = await pool.query(
        `UPDATE game_filters
         SET activity_type = ?, price_range_min = ?, price_range_max = ?, location = ?
         WHERE idgame = ?`,
        [activity_type, price_range_min, price_range_max, location, idgame]
      );
      return result.affectedRows > 0;
    } else {
      // Créer de nouveaux filtres
      const [result] = await pool.query(
        `INSERT INTO game_filters (idgame, activity_type, price_range_min, price_range_max, location)
         VALUES (?, ?, ?, ?, ?)`,
        [idgame, activity_type, price_range_min, price_range_max, location]
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
          DISTINCT JSON_OBJECT(
            'idpicture', p.idpicture,
            'url', p.url,
            'alt', p.alt
          )
        ) as pictures,
        JSON_ARRAYAGG(
          DISTINCT JSON_OBJECT(
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

    // Parser les JSON
    return rows.map(row => ({
      ...row,
      pictures: row.pictures ? JSON.parse(row.pictures).filter(p => p.idpicture) : [],
      features: row.features ? JSON.parse(row.features).filter(f => f.idfeature) : []
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
};

module.exports = Game;
