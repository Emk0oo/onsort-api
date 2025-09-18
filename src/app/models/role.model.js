// src/app/models/role.model.js
const pool = require("../config/db");

const Role = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM role");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM role WHERE idrole = ?", [id]);
    return rows[0];
  },

  async create(data) {
    const { name } = data;
    const [result] = await pool.query("INSERT INTO role (name) VALUES (?)", [name]);
    return { idrole: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name } = data;
    const [result] = await pool.query("UPDATE role SET name = ? WHERE idrole = ?", [name, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM role WHERE idrole = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Role;