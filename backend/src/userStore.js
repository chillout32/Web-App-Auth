const bcrypt = require("bcrypt");

// In-memory user store (in a real app, this would be a database)
// Passwords are hashed with bcrypt (cost factor 10)
const users = [];

// Seed users on startup
async function seedUsers() {
  const seed = [
    { username: "alice", password: "password123", role: "admin" },
    { username: "bob", password: "secret456", role: "editor" },
    { username: "carol", password: "viewer789", role: "viewer" },
  ];

  for (const u of seed) {
    const hash = await bcrypt.hash(u.password, 10);
    users.push({ id: users.length + 1, username: u.username, passwordHash: hash, role: u.role });
  }

  console.log("Seeded users:", users.map((u) => `${u.username} (${u.role})`).join(", "));
}

seedUsers();

function findByUsername(username) {
  return users.find((u) => u.username === username) || null;
}

function findById(id) {
  return users.find((u) => u.id === id) || null;
}

module.exports = { findByUsername, findById };
