// src/app/models/activity.model.js
const pool = require("../config/db");

const Activity = {
  async getAll(filter = {}) {
    let query = `
      SELECT
        a.*,
        c.name AS company_name,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('idpicture', p.idpicture, 'url', p.url, 'alt', p.alt)
          )
          FROM activity_picture ap
          JOIN picture p ON ap.idpicture = p.idpicture
          WHERE ap.idactivity = a.idactivity
        ) AS pictures,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'day_of_week', aoh.day_of_week,
              'opening_morning', aoh.opening_morning,
              'closing_morning', aoh.closing_morning,
              'opening_afternoon', aoh.opening_afternoon,
              'closing_afternoon', aoh.closing_afternoon
            )
          )
          FROM activity_opening_hour aoh
          WHERE aoh.idactivity = a.idactivity
        ) AS opening_hours,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT('idfeature', f.idfeature, 'name', f.name)
          )
          FROM activity_feature af
          JOIN feature f ON af.idfeature = f.idfeature
          WHERE af.idactivity = a.idactivity
        ) AS features
      FROM activity a
      LEFT JOIN company_activity ca ON a.idactivity = ca.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
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
        row.pictures = row.pictures || [];
        row.opening_hours = row.opening_hours || [];
        row.features = row.features || [];
    });
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
      SELECT
        a.*,
        c.name as company_name,
        p.pictures,
        o.opening_hours,
        f.features
      FROM activity a
      LEFT JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN (
        SELECT
          ap.idactivity,
          JSON_ARRAYAGG(JSON_OBJECT('idpicture', p.idpicture, 'url', p.url, 'alt', p.alt)) as pictures
        FROM activity_picture ap
        JOIN picture p ON ap.idpicture = p.idpicture
        WHERE ap.idactivity = ?
        GROUP BY ap.idactivity
      ) p ON a.idactivity = p.idactivity
      LEFT JOIN (
        SELECT
          aoh.idactivity,
          JSON_ARRAYAGG(JSON_OBJECT('day_of_week', aoh.day_of_week, 'opening_morning', aoh.opening_morning, 'closing_morning', aoh.closing_morning, 'opening_afternoon', aoh.opening_afternoon, 'closing_afternoon', aoh.closing_afternoon)) as opening_hours
        FROM activity_opening_hour aoh
        WHERE aoh.idactivity = ?
        GROUP BY aoh.idactivity
      ) o ON a.idactivity = o.idactivity
      LEFT JOIN (
        SELECT
          af.idactivity,
          JSON_ARRAYAGG(JSON_OBJECT('idfeature', f.idfeature, 'name', f.name)) as features
        FROM activity_feature af
        JOIN feature f ON af.idfeature = f.idfeature
        WHERE af.idactivity = ?
        GROUP BY af.idactivity
      ) f ON a.idactivity = f.idactivity
      WHERE a.idactivity = ?
    `, [id, id, id, id]);
    const activity = rows[0];
    if (activity) {
        activity.pictures = activity.pictures || [];
        activity.opening_hours = activity.opening_hours || [];
        activity.features = activity.features || [];
    }
    return activity;
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
    const { name, description, minor_forbidden, address, price_range } = data;
    const [result] = await pool.query("INSERT INTO activity (name, description, minor_forbidden, address, price_range) VALUES (?, ?, ?, ?, ?)", [name, description, minor_forbidden || 0, address, price_range]);
    return { idactivity: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name, description, minor_forbidden, address, price_range } = data;
    const [result] = await pool.query("UPDATE activity SET name = ?, description = ?, minor_forbidden = ?, address = ?, price_range = ? WHERE idactivity = ?", [name, description, minor_forbidden, address, price_range, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM activity WHERE idactivity = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Activity;