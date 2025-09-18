// src/app/models/user.model.js
const pool = require("../config/db");

const User = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM user");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM user WHERE iduser = ?", [id]);
    return rows[0];
  },

  async getByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
    return rows[0];
  },

  async create(data) {
    const { name, surname, email, username, password, date_of_birth, is_active } = data;
    const [result] = await pool.query(
      `INSERT INTO user (name, surname, email, username, password, date_of_birth, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, email, username, password, date_of_birth, is_active ?? 1]
    );
    return { iduser: result.insertId, ...data };
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM user WHERE iduser = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;