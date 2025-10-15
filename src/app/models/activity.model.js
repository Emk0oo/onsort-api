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
             ) as pictures,
             COALESCE(
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'day_of_week', aoh.day_of_week,
                   'opening_morning', aoh.opening_morning,
                   'closing_morning', aoh.closing_morning,
                   'opening_afternoon', aoh.opening_afternoon,
                   'closing_afternoon', aoh.closing_afternoon
                 )
               ),
               JSON_ARRAY()
             ) as opening_hours
      FROM activity a
      LEFT JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN activity_picture ap ON ap.idactivity = a.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
      LEFT JOIN activity_opening_hour aoh ON a.idactivity = aoh.idactivity
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
          // Filter out null pictures if no pictures exist
          if (row.pictures.length === 1 && row.pictures[0].idpicture === null) {
            row.pictures = [];
          }
        }
      } catch (e) {
        row.pictures = [];
      }
      try {
        if (typeof row.opening_hours === 'string') {
          row.opening_hours = JSON.parse(row.opening_hours);
          // Filter out null opening_hours if none exist
          if (row.opening_hours.length === 1 && row.opening_hours[0].day_of_week === null) {
            row.opening_hours = [];
          }
        }
      } catch (e) {
        row.opening_hours = [];
      }
    });
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(`
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
             ) as pictures,
             COALESCE(
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                    'day_of_week', aoh.day_of_week,
                    'opening_morning', aoh.opening_morning,
                    'closing_morning', aoh.closing_morning,
                    'opening_afternoon', aoh.opening_afternoon,
                    'closing_afternoon', aoh.closing_afternoon
                 )
               ),
               JSON_ARRAY()
             ) as opening_hours
      FROM activity a
      LEFT JOIN company_activity ca ON ca.idactivity = a.idactivity
      LEFT JOIN company c ON ca.idcompany = c.idcompany
      LEFT JOIN activity_picture ap ON ap.idactivity = a.idactivity
      LEFT JOIN picture p ON ap.idpicture = p.idpicture
      LEFT JOIN activity_opening_hour aoh ON a.idactivity = aoh.idactivity
      WHERE a.idactivity = ?
      GROUP BY a.idactivity
    `, [id]);
    const activity = rows[0];
    if (activity) {
      try {
        if (typeof activity.pictures === 'string') {
          activity.pictures = JSON.parse(activity.pictures);
          if (activity.pictures.length === 1 && activity.pictures[0].idpicture === null) {
            activity.pictures = [];
          }
        }
      } catch (e) {
        activity.pictures = [];
      }
      try {
        if (typeof activity.opening_hours === 'string') {
          activity.opening_hours = JSON.parse(activity.opening_hours);
          if (activity.opening_hours.length === 1 && activity.opening_hours[0].day_of_week === null) {
            activity.opening_hours = [];
          }
        }
      } catch (e) {
        activity.opening_hours = [];
      }
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
    const { name, description, minor_forbidden, address, price_range, features } = data;
    const [result] = await pool.query("INSERT INTO activity (name, description, minor_forbidden, address, price_range, features) VALUES (?, ?, ?, ?, ?, ?)", [name, description, minor_forbidden || 0, address, price_range, features]);
    return { idactivity: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name, description, minor_forbidden, address, price_range, features } = data;
    const [result] = await pool.query("UPDATE activity SET name = ?, description = ?, minor_forbidden = ?, address = ?, price_range = ?, features = ? WHERE idactivity = ?", [name, description, minor_forbidden, address, price_range, features, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM activity WHERE idactivity = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Activity;