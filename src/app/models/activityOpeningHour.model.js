// src/app/models/activityOpeningHour.model.js
const pool = require("../config/db");

const ActivityOpeningHour = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM activity_opening_hour");
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM activity_opening_hour WHERE idactivity_opening_hour = ?", [id]);
    return rows[0];
  },

  async findByDay(idactivity, day_of_week) {
    const [rows] = await pool.query(
      "SELECT * FROM activity_opening_hour WHERE idactivity = ? AND day_of_week = ?",
      [idactivity, day_of_week]
    );
    return rows[0];
  },

  async getByActivityId(activityId) {
    const [rows] = await pool.query("SELECT * FROM activity_opening_hour WHERE idactivity = ?", [activityId]);
    return rows;
  },

  async create(data) {
    const { idactivity, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon } = data;
    const [result] = await pool.query(
      "INSERT INTO activity_opening_hour (idactivity, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon) VALUES (?, ?, ?, ?, ?, ?)",
      [idactivity, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon]
    );
    return { id: result.insertId, ...data };
  },

  async updateById(id, data) {
    const { idactivity, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon } = data;
    const [result] = await pool.query(
      "UPDATE activity_opening_hour SET idactivity = ?, day_of_week = ?, opening_morning = ?, closing_morning = ?, opening_afternoon = ?, closing_afternoon = ? WHERE idactivity_opening_hour = ?",
      [idactivity, day_of_week, opening_morning, closing_morning, opening_afternoon, closing_afternoon, id]
    );
    return result.affectedRows > 0;
  },

  async deleteById(id) {
    const [result] = await pool.query("DELETE FROM activity_opening_hour WHERE idactivity_opening_hour = ?", [id]);
    return result.affectedRows > 0;
  },

  async deleteByActivityId(activityId) {
    const [result] = await pool.query("DELETE FROM activity_opening_hour WHERE idactivity = ?", [activityId]);
    return result.affectedRows > 0;
  },
};

module.exports = ActivityOpeningHour;