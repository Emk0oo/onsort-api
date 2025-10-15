// src/app/models/userReviewActivity.model.js
const pool = require("../config/db");

const UserReviewActivity = {
  // Association: Belongs to User
  // Association: Belongs to Activity
  
  async create(data) {
    const { iduser, idactivity, title, rating, comment } = data;
    // Validation for rating (1-5)
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    const [result] = await pool.query(
      `INSERT INTO user_review_activity (iduser, idactivity, title, rating, comment, date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [iduser, idactivity, title, rating, comment]
    );
    return { idreview: result.insertId, ...data };
  },

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM user_review_activity WHERE idreview = ?", [id]);
    return rows[0];
  },

  async getByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM user_review_activity WHERE iduser = ?", [userId]);
    return rows;
  },

  async getByActivityId(activityId) {
    const [rows] = await pool.query("SELECT * FROM user_review_activity WHERE idactivity = ?", [activityId]);
    return rows;
  },

  async updateById(id, data) {
    const { title, rating, comment } = data;
    // Validation for rating (1-5)
    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }
    const [result] = await pool.query(
        "UPDATE user_review_activity SET title = ?, rating = ?, comment = ? WHERE idreview = ?",
        [title, rating, comment, id]
    );
    return result.affectedRows > 0;
  },
  
  async deleteById(id) {
      const [result] = await pool.query("DELETE FROM user_review_activity WHERE idreview = ?", [id]);
      return result.affectedRows > 0;
  }
};

module.exports = UserReviewActivity;