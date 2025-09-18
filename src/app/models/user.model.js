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
    // Calculate is_minor: 1 if age < 18
    const birthDate = new Date(date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const isMinor = (age < 18 || (age === 18 && today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()))) ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO user (name, surname, email, username, password, date_of_birth, is_active, idrole, is_minor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, surname, email, username, password, date_of_birth, is_active ?? 1, idrole ?? 1, isMinor]
    );
    return { iduser: result.insertId, ...data, is_minor: isMinor };
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