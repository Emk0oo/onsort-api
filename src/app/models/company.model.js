// src/app/models/company.model.js
const pool = require("../config/db");

const Company = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM company");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM company WHERE idcompany = ?", [id]);
    return rows[0];
  },

  async getByUserId(userId) {
    const [rows] = await pool.query("SELECT c.* FROM company c JOIN user_company uc ON uc.idcompany = c.idcompany WHERE uc.iduser = ?", [userId]);
    return rows[0];
  },

  async create(data) {
    const { name, description } = data;
    const [result] = await pool.query("INSERT INTO company (name, description) VALUES (?, ?)", [name, description]);
    return { idcompany: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name, description } = data;
    const [result] = await pool.query("UPDATE company SET name = ?, description = ? WHERE idcompany = ?", [name, description, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM company WHERE idcompany = ?", [id]);
    return result.affectedRows > 0;
  },

  async getActivities(id) {
    const [rows] = await pool.query("SELECT a.* FROM activity a JOIN company_activity ca ON ca.idactivity = a.idactivity WHERE ca.idcompany = ?", [id]);
    return rows;
  },
};

module.exports = Company;