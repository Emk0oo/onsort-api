// src/app/middleware/role.js
const logger = require("../config/logger");

// Middleware to check if user has admin role
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 1) { // Assuming 1 is admin
    logger.log("security", "Role: admin access denied", {
      event: "role_admin_denied",
      userId: req.user ? req.user.id : null,
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// General role check
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      logger.log("security", `Role: insufficient permissions (required: ${requiredRole})`, {
        event: "role_insufficient",
        userId: req.user ? req.user.id : null,
        requiredRole,
        actualRole: req.user ? req.user.role : null,
        ip: req.ip,
        path: req.originalUrl,
      });
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { isAdmin, hasRole };
