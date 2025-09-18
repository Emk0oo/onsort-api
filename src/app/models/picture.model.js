// src/app/models/picture.model.js
const pool = require("../config/db");

const Picture = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM picture");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM picture WHERE idpicture = ?", [id]);
    return rows[0];
  },

  async getByActivityId(activityId) {
    const [rows] = await pool.query("SELECT p.* FROM picture p JOIN activity_picture ap ON ap.idpicture = p.idpicture WHERE ap.idactivity = ?", [activityId]);
    return rows;
  },

  async create(data) {
    const { url, idactivity } = data;
    const [result] = await pool.query("INSERT INTO picture (url, idactivity) VALUES (?, ?)", [url, idactivity]);
    return { idpicture: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { url } = data;
    const [result] = await pool.query("UPDATE picture SET url = ? WHERE idpicture = ?", [url, id]);
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM picture WHERE idpicture = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Picture;