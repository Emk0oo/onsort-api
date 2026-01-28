const pool = require("../config/db");

const GameDateVote = {
  /**
   * Enregistre un vote pour une date
   * @param {number} idgame - ID de la game
   * @param {number} iduser - ID de l'utilisateur
   * @param {number} idgamedate - ID de la date proposée
   * @param {boolean} vote - true = Oui, false = Non
   */
  async create(idgame, iduser, idgamedate, vote) {
    const [result] = await pool.query(
      `INSERT INTO game_date_vote (idgame, iduser, idgamedate, vote)
       VALUES (?, ?, ?, ?)`,
      [idgame, iduser, idgamedate, vote ? 1 : 0]
    );
    return { idgame, iduser, idgamedate, vote };
  },

  /**
   * Vérifie si un utilisateur a déjà voté pour une date dans une game
   */
  async hasVoted(idgame, iduser, idgamedate) {
    const [rows] = await pool.query(
      "SELECT 1 FROM game_date_vote WHERE idgame = ? AND iduser = ? AND idgamedate = ?",
      [idgame, iduser, idgamedate]
    );
    return rows.length > 0;
  },

  /**
   * Récupère tous les votes de dates d'un utilisateur pour une game
   */
  async getByGameAndUser(idgame, iduser) {
    const [rows] = await pool.query(`
      SELECT
        gdv.idgamedate,
        gdv.vote,
        gdv.voted_at,
        gd.date_option
      FROM game_date_vote gdv
      JOIN game_dates gd ON gdv.idgamedate = gd.idgamedate
      WHERE gdv.idgame = ? AND gdv.iduser = ?
      ORDER BY gd.date_option ASC
    `, [idgame, iduser]);
    return rows;
  },

  /**
   * Récupère les résultats du vote des dates avec classement
   * Classe par taux d'approbation décroissant
   */
  async getResults(idgame) {
    const [rows] = await pool.query(`
      SELECT
        gd.idgamedate,
        gd.date_option,
        COUNT(gdv.vote) as total_votes,
        SUM(CASE WHEN gdv.vote = 1 THEN 1 ELSE 0 END) as positive_votes,
        SUM(CASE WHEN gdv.vote = 0 THEN 1 ELSE 0 END) as negative_votes,
        ROUND(
          (SUM(CASE WHEN gdv.vote = 1 THEN 1 ELSE 0 END) / COUNT(gdv.vote)) * 100,
          2
        ) as approval_rate
      FROM game_date_vote gdv
      JOIN game_dates gd ON gdv.idgamedate = gd.idgamedate
      WHERE gdv.idgame = ?
      GROUP BY gd.idgamedate
      ORDER BY approval_rate DESC, total_votes DESC, gd.date_option ASC
    `, [idgame]);

    return rows.map((row, index) => ({
      ...row,
      rank: index + 1
    }));
  },

  /**
   * Calcule la progression de vote de dates d'un utilisateur
   */
  async getUserVotingProgress(idgame, iduser) {
    const [rows] = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM game_date_vote gdv
          WHERE gdv.idgame = ? AND gdv.iduser = ?
        ) as voted_count,
        (
          SELECT COUNT(*)
          FROM game_dates gd
          WHERE gd.idgame = ?
        ) as total_dates
    `, [idgame, iduser, idgame]);

    const { voted_count, total_dates } = rows[0];

    return {
      voted_count,
      total_dates,
      progress_percentage: total_dates > 0
        ? Math.round((voted_count / total_dates) * 100)
        : 0,
      has_voted_all: total_dates > 0 && voted_count === total_dates
    };
  },

  /**
   * Vérifie si tous les participants ont voté sur toutes les dates
   */
  async getAllParticipantsVoted(idgame) {
    const [rows] = await pool.query(`
      SELECT
        COUNT(DISTINCT gu.iduser) as total_participants,
        (
          SELECT COUNT(*)
          FROM (
            SELECT gu2.iduser
            FROM game_user gu2
            WHERE gu2.idgame = ?
            AND (
              SELECT COUNT(*)
              FROM game_date_vote gdv
              WHERE gdv.idgame = ? AND gdv.iduser = gu2.iduser
            ) = (
              SELECT COUNT(*)
              FROM game_dates gd
              WHERE gd.idgame = ?
            )
          ) as completed_users
        ) as completed_count
      FROM game_user gu
      WHERE gu.idgame = ?
    `, [idgame, idgame, idgame, idgame]);

    const { total_participants, completed_count } = rows[0];

    return {
      all_participants_voted: completed_count === total_participants,
      completion_rate: total_participants > 0
        ? Math.round((completed_count / total_participants) * 100)
        : 0,
      total_participants,
      completed_count
    };
  },

  /**
   * Récupère la date gagnante (meilleur approval_rate)
   * Retourne la valeur date_option ou null si aucun vote
   */
  async getWinningDate(idgame) {
    const [rows] = await pool.query(`
      SELECT gd.date_option
      FROM game_date_vote gdv
      JOIN game_dates gd ON gdv.idgamedate = gd.idgamedate
      WHERE gdv.idgame = ?
      GROUP BY gd.idgamedate
      ORDER BY
        (SUM(CASE WHEN gdv.vote = 1 THEN 1 ELSE 0 END) / COUNT(gdv.vote)) DESC,
        COUNT(gdv.vote) DESC,
        gd.date_option ASC
      LIMIT 1
    `, [idgame]);

    return rows.length > 0 ? rows[0].date_option : null;
  },
};

module.exports = GameDateVote;
