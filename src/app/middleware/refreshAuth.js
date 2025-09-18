// src/app/middleware/refreshAuth.js
const jwt = require("jsonwebtoken");

function refreshAuth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "No refresh token provided" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid refresh token format" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });
    req.user = user;
    next();
  });
}

module.exports = refreshAuth;