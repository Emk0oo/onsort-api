// src/app/models/user.model.js
const pool = require("../config/db");

const User = {
  async getAll() {
    const [rows] = await pool.query("SELECT u.*, r.name as role_name FROM user u LEFT JOIN role r ON u.idrole = r.idrole");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT u.*, r.name as role_name FROM user u LEFT JOIN role r ON u.idrole = r.idrole WHERE u.iduser = ?", [id]);
    return rows[0];
  },

  async getByEmail(email) {
    const [rows] = await pool.query("SELECT u.*, r.name as role_name FROM user u LEFT JOIN role r ON u.idrole = r.idrole WHERE u.email = ?", [email]);
    return rows[0];
  },

  async create(data) {
    const { name, surname, email, username, password, date_of_birth, is_active, idrole } = data;
    const [result] = await pool.query(
      `INSERT INTO user (name, surname, email, username, password, date_of_birth, is_active, idrole)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, email, username, password, date_of_birth, is_active ?? 1, idrole ?? 1]
    );
    return { iduser: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { name, surname, email, username, date_of_birth } = data;
    const [result] = await pool.query(
      "UPDATE user SET name = ?, surname = ?, email = ?, username = ?, date_of_birth = ? WHERE iduser = ?",
      [name, surname, email, username, date_of_birth, id]
    );
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM user WHERE iduser = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = User;