const pool = require("../config/db");

const GameVote = {
  /**
   * Enregistre un vote pour une activité
   * @param {number} idgame - ID de la game
   * @param {number} iduser - ID de l'utilisateur
   * @param {number} idactivity - ID de l'activité
   * @param {boolean} vote - true = Oui (swipe droite), false = Non (swipe gauche)
   */
  async create(idgame, iduser, idactivity, vote) {
    const [result] = await pool.query(
      `INSERT INTO game_vote (idgame, iduser, idactivity, vote)
       VALUES (?, ?, ?, ?)`,
      [idgame, iduser, idactivity, vote ? 1 : 0]
    );
    return { idvote: result.insertId, idgame, iduser, idactivity, vote };
  },

  /**
   * Récupère tous les votes d'un utilisateur pour une game
   */
  async getByGameAndUser(idgame, iduser) {
    const [rows] = await pool.query(`
      SELECT
        gv.idvote,
        gv.idactivity,
        gv.vote,
        gv.voted_at,
        a.name as activity_name,
        a.description as activity_description
      FROM game_vote gv
      JOIN activity a ON gv.idactivity = a.idactivity
      WHERE gv.idgame = ? AND gv.iduser = ?
      ORDER BY gv.voted_at ASC
    `, [idgame, iduser]);
    return rows;
  },

  /**
   * Vérifie si un utilisateur a déjà voté pour une activité dans une game
   */
  async hasVoted(idgame, iduser, idactivity) {
    const [rows] = await pool.query(
      "SELECT idvote FROM game_vote WHERE idgame = ? AND iduser = ? AND idactivity = ?",
      [idgame, iduser, idactivity]
    );
    return rows.length > 0;
  },

  /**
   * Compte les votes pour une activité spécifique dans une game
   */
  async getVoteCount(idgame, idactivity) {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) as total_votes,
        SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as positive_votes,
        SUM(CASE WHEN vote = 0 THEN 1 ELSE 0 END) as negative_votes
      FROM game_vote
      WHERE idgame = ? AND idactivity = ?
    `, [idgame, idactivity]);
    return rows[0];
  },

  /**
   * Récupère les résultats complets d'une game avec classement
   * Calcule le taux d'approbation et classe les activités par score décroissant
   */
  async getResults(idgame) {
    const [rows] = await pool.query(`
      SELECT
        a.idactivity,
        a.name,
        a.description,
        a.address,
        a.price_range,
        a.idactivity_type,
        at.name as activity_type_name,
        COUNT(gv.idvote) as total_votes,
        SUM(CASE WHEN gv.vote = 1 THEN 1 ELSE 0 END) as positive_votes,
        SUM(CASE WHEN gv.vote = 0 THEN 1 ELSE 0 END) as negative_votes,
        ROUND(
          (SUM(CASE WHEN gv.vote = 1 THEN 1 ELSE 0 END) / COUNT(gv.idvote)) * 100,
          2
        ) as approval_rate,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'idpicture', p.idpicture,
            'url', p.url,
            'alt', p.alt
          )
        ) as pictures
      FROM game_vote gv
      JOIN activity a ON gv.idactivity = a.idactivity
      LEFT JOIN activity_type at ON a.idactivity_type = at.idactivity_type
      LEFT JOIN activity_picture ap ON a.idactivity = ap.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
      WHERE gv.idgame = ?
      GROUP BY a.idactivity
      ORDER BY approval_rate DESC, total_votes DESC
    `, [idgame]);

    // Ajouter le rang et filtrer les pictures (MySQL2 parse automatiquement les JSON)
    return rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      pictures: row.pictures ? row.pictures.filter(p => p.idpicture) : []
    }));
  },

  /**
   * Calcule la progression de vote d'un utilisateur dans une game
   * Retourne le pourcentage d'activités sur lesquelles il a voté
   */
  async getUserVotingProgress(idgame, iduser) {
    const [rows] = await pool.query(`
      SELECT
        (
          SELECT COUNT(DISTINCT gv.idactivity)
          FROM game_vote gv
          WHERE gv.idgame = ? AND gv.iduser = ?
        ) as voted_count,
        (
          SELECT COUNT(DISTINCT gv2.idactivity)
          FROM game_vote gv2
          WHERE gv2.idgame = ?
        ) as total_activities
    `, [idgame, iduser, idgame]);

    const { voted_count, total_activities } = rows[0];

    return {
      voted_count,
      total_activities,
      progress_percentage: total_activities > 0
        ? Math.round((voted_count / total_activities) * 100)
        : 0,
      has_voted_all: voted_count > 0 && voted_count === total_activities
    };
  },

  /**
   * Vérifie si tous les participants ont voté sur toutes les activités
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
              SELECT COUNT(DISTINCT gv.idactivity)
              FROM game_vote gv
              WHERE gv.idgame = ? AND gv.iduser = gu2.iduser
            ) = (
              SELECT COUNT(DISTINCT gv2.idactivity)
              FROM game_vote gv2
              WHERE gv2.idgame = ?
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
        : 0
    };
  },
};

module.exports = GameVote;
