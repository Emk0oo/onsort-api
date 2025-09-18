// src/app/models/activity.model.js
const pool = require("../config/db");

const Activity = {
  async getAll(filter = {}) {
    let query = `
      SELECT a.*, c.name as company_name,
             GROUP_CONCAT(p.url) as pictures
      FROM activity a
      LEFT JOIN company c ON a.idcompany = c.idcompany
      LEFT JOIN picture p ON a.idactivity = p.idactivity
    `;
    const params = [];

    if (filter.is_minor !== undefined) {
      if (filter.is_minor == 0) {
        // Adult: only activities where minor_forbidden = 0
        query += " WHERE a.minor_forbidden = 0";
      }
      // If is_minor = 1, no filter, return all
    }

    query += " GROUP BY a.idactivity";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as company_name, 
             GROUP_CONCAT(p.url) as pictures
      FROM activity a 
      LEFT JOIN company c ON a.idcompany = c.idcompany 
      LEFT JOIN picture p ON a.idactivity = p.idactivity 
      WHERE a.idactivity = ? 
      GROUP BY a.idactivity
    `, [id]);
    return rows[0];
  },

  async getByCompanyId(companyId) {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as company_name, 
             GROUP_CONCAT(p.url) as pictures
      FROM activity a 
      LEFT JOIN company c ON a.idcompany = c.idcompany 
      LEFT JOIN picture p ON a.idactivity = p.idactivity 
      WHERE a.idcompany = ? 
      GROUP BY a.idactivity
    `, [companyId]);
    return rows;
  },

  async create(data) {
    const { title, description, idcompany } = data;
    const [result] = await pool.query("INSERT INTO activity (title, description, idcompany) VALUES (?, ?, ?)", [title, description, idcompany]);
    return { idactivity: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { title, description } = data;
    const [result] = await pool.query("UPDATE activity SET title = ?, description = ? WHERE idactivity = ?", [title, description, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM activity WHERE idactivity = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Activity;