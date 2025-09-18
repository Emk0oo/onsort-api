// src/app/middleware/role.js

// Middleware to check if user has admin role
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 1) { // Assuming 1 is admin
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// General role check
function hasRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { isAdmin, hasRole };