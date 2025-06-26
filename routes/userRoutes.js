const express = require("express");
const router = express.Router();

const newLocal = "../middlewares/authMiddleware";
// Import JWT auth middleware
const authenticate = require(newLocal);
// Import role-checking middleware
const authorizeRoles = require("../middlewares/roleMiddleware");
// Import the User model to fetch user info from DB
const User = require("../models/User");
const AdminController = require("../controllers/AdminController");

// ✅ GET /api/users/me - returns current user's profile
router.get("/me", authenticate, async (req, res) => {
  try {
    // Step 1: Get user ID from JWT decoded data (injected by middleware)
    const userId = req.user.id;

    // Step 2: Find user in DB (exclude password for security)
    const user = await User.findById(userId).select("-password");

    // Step 3: If not found, return 404
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 4: Send user profile
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Example Admin-only route
router.get("/admin-only", authenticate, authorizeRoles("A"), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

router.post("/add-doctor", authenticate, authorizeRoles("A"), AdminController.addDoctor);

module.exports = router;
