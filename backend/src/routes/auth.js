const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findByUsername } = require("../userStore");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/*
Accepts { username, password }
Returns a signed JWT on success
*/
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Build JWT payload (never include the password hash here)
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    algorithm: "HS256",
  });

  // Decode for demo purposes
  const decoded = jwt.decode(token, { complete: true });

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
    decoded,
  });
});


router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});


router.post("/hash-demo", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const hash2 = await bcrypt.hash(password, saltRounds); 

  res.json({
    original: password,
    hash1: hash,
    hash2, 
    match: await bcrypt.compare(password, hash),
    saltRounds,
    note: "hash1 and hash2 are different despite same input — salt at work",
  });
});

module.exports = router;
