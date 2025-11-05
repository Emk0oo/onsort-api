const pool = require("../config/db");

const ActivityType = {
  /**
   * Récupère tous les types d'activité
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT
        idactivity_type,
        name,
        icon
      FROM activity_type
      ORDER BY name ASC
    `);
    return rows;
  },

  /**
   * Récupère un type d'activité par son ID
   */
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT
        idactivity_type,
        name,
        icon
      FROM activity_type
      WHERE idactivity_type = ?`,
      [id]
    );
    return rows[0];
  },

  /**
   * Crée un nouveau type d'activité
   */
  async create(data) {
    const { name, icon } = data;

    const [result] = await pool.query(
      `INSERT INTO activity_type (name, icon)
       VALUES (?, ?)`,
      [name, icon || null]
    );

    return {
      idactivity_type: result.insertId,
      name,
      icon: icon || null
    };
  },

  /**
   * Met à jour un type d'activité
   */
  async update(id, data) {
    const { name, icon } = data;

    const [result] = await pool.query(
      `UPDATE activity_type
       SET name = ?, icon = ?
       WHERE idactivity_type = ?`,
      [name, icon || null, id]
    );

    return result.affectedRows > 0;
  },

  /**
   * Supprime un type d'activité
   */
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM activity_type WHERE idactivity_type = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Vérifie si un type d'activité existe
   */
  async exists(id) {
    const [rows] = await pool.query(
      "SELECT idactivity_type FROM activity_type WHERE idactivity_type = ?",
      [id]
    );
    return rows.length > 0;
  },

  /**
   * Compte le nombre d'activités associées à ce type
   */
  async countActivities(id) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM activity WHERE idactivity_type = ?",
      [id]
    );
    return rows[0].count;
  }
};

module.exports = ActivityType;
