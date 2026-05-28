const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// All routes below require a valid JWT
router.use(authenticateToken);


// Accessible by all authenticated users (viewer, editor, admin)

router.get("/content", (req, res) => {
  res.json({
    message: "Public content — any authenticated user can see this",
    role: req.user.role,
    items: [
      { id: 1, title: "Introduction to JWT", author: "alice" },
      { id: 2, title: "OAuth 2.0 Explained", author: "bob" },
      { id: 3, title: "RBAC Best Practices", author: "alice" },
    ],
  });
});


// Only editor and admin can create content

router.post("/content", requireRole("editor", "admin"), (req, res) => {
  const { title } = req.body;
  res.status(201).json({
    message: "Content created",
    item: { id: Date.now(), title: title || "New article", author: req.user.username },
  });
});



// Only editor and admin can edit content
router.put("/content/:id", requireRole("editor", "admin"), (req, res) => {
  res.json({
    message: `Content ${req.params.id} updated by ${req.user.username}`,
    role: req.user.role,
  });
});

// Only admin can delete

router.delete("/content/:id", requireRole("admin"), (req, res) => {
  res.json({
    message: `Content ${req.params.id} deleted by ${req.user.username} (admin)`,
  });
});


// Admin only

router.get("/admin/dashboard", requireRole("admin"), (req, res) => {
  res.json({
    message: "Admin dashboard",
    stats: {
      totalUsers: 3,
      activeTokens: 1,
      recentLogins: ["alice", "bob"],
    },
  });
});

module.exports = router;
