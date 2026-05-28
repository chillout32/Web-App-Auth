const jwt = require("jsonwebtoken");

/*
Middleware: verifies the JWT in the Authorization header.
Attaches the decoded payload to req.user if valid.
*/
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Expected format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

/*
Middleware factory: restricts access to specific roles.
Usage: requireRole("admin") or requireRole("admin", "editor")
*/
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
