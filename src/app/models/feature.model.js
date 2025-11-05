const pool = require("../config/db");

const Feature = {
  /**
   * Récupère toutes les features
   */
  async getAll() {
    const [rows] = await pool.query(`
      SELECT
        idfeature,
        name
      FROM feature
      ORDER BY name ASC
    `);
    return rows;
  },

  /**
   * Récupère une feature par son ID
   */
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT
        idfeature,
        name
      FROM feature
      WHERE idfeature = ?`,
      [id]
    );
    return rows[0];
  },

  /**
   * Crée une nouvelle feature
   */
  async create(data) {
    const { name } = data;

    const [result] = await pool.query(
      `INSERT INTO feature (name)
       VALUES (?)`,
      [name]
    );

    return {
      idfeature: result.insertId,
      name
    };
  },

  /**
   * Met à jour une feature
   */
  async update(id, data) {
    const { name } = data;

    const [result] = await pool.query(
      `UPDATE feature
       SET name = ?
       WHERE idfeature = ?`,
      [name, id]
    );

    return result.affectedRows > 0;
  },

  /**
   * Supprime une feature
   */
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM feature WHERE idfeature = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Vérifie si une feature existe
   */
  async exists(id) {
    const [rows] = await pool.query(
      "SELECT idfeature FROM feature WHERE idfeature = ?",
      [id]
    );
    return rows.length > 0;
  },

  /**
   * Compte le nombre d'activités associées à cette feature
   */
  async countActivities(id) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM activity_feature WHERE idfeature = ?",
      [id]
    );
    return rows[0].count;
  }
};

module.exports = Feature;
