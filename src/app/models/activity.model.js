// src/app/models/activity.model.js
const pool = require("../config/db");

const Activity = {
  async getAll(filter = {}) {
    let query = `
      SELECT a.*, c.name as company_name,
             COALESCE(
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'idpicture', p.idpicture,
                   'url', p.url,
                   'alt', p.alt
                 )
               ),
               JSON_ARRAY()
             ) as pictures
      FROM activity a
      LEFT JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN activity_picture ap ON ap.idactivity = a.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
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
    // Convert JSON string to array
    rows.forEach(row => {
      try {
        if (typeof row.pictures === 'string') {
          row.pictures = JSON.parse(row.pictures);
        } else if (Array.isArray(row.pictures)) {
          // Already an array
        } else {
          row.pictures = [];
        }
      } catch (e) {
        row.pictures = [];
      }
    });
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT a.*, c.name as company_name,
             GROUP_CONCAT(p.url) as pictures
      FROM activity a
      LEFT JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN activity_picture ap ON ap.idactivity = a.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
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
      JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN activity_picture ap ON ap.idactivity = a.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
      WHERE ca.idcompany = ?
      GROUP BY a.idactivity
    `, [companyId]);
    return rows;
  },

  async create(data) {
    const { name, description, minor_forbidden } = data;
    const [result] = await pool.query("INSERT INTO activity (name, description, minor_forbidden) VALUES (?, ?, ?)", [name, description, minor_forbidden || 0]);
    return { idactivity: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name, description, minor_forbidden } = data;
    const [result] = await pool.query("UPDATE activity SET name = ?, description = ?, minor_forbidden = ? WHERE idactivity = ?", [name, description, minor_forbidden, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM activity WHERE idactivity = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Activity;