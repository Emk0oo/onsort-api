// src/app/models/feature.model.js
const pool = require("../config/db");

const Feature = {
  async create(name) {
    const [result] = await pool.query("INSERT INTO feature (name) VALUES (?)", [name]);
    return { idfeature: result.insertId, name };
  },

  async findByName(name) {
    const [rows] = await pool.query("SELECT * FROM feature WHERE name = ?", [name]);
    return rows[0];
  },

  async getByActivityId(activityId) {
    const [rows] = await pool.query(
      "SELECT f.* FROM feature f JOIN activity_feature af ON f.idfeature = af.idfeature WHERE af.idactivity = ?",
      [activityId]
    );
    return rows;
  },
  async deleteByName(name) {
    const [result] = await pool.query("DELETE FROM feature WHERE name = ?", [name]);
    return result.affectedRows > 0;
  },
};

const FeatureActivity = {
  async create(idfeature, idactivity) {
    const [result] = await pool.query("INSERT INTO activity_feature (idfeature, idactivity) VALUES (?, ?)", [idfeature, idactivity]);
    return { idactivity_feature: result.insertId, idfeature, idactivity };
  },

  async removeFeatureFromActivity(featureId, activityId) {
    const [result] = await pool.query(
      "DELETE FROM activity_feature WHERE idfeature = ? AND idactivity = ?",
      [featureId, activityId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = { Feature, FeatureActivity };