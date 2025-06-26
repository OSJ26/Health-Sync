const express = require("express");
const router = express.Router();

const auth = "../middlewares/authMiddleware";
// Auth middlewares
const authenticate = require(auth);
const authorizeRoles = require("../middlewares/roleMiddleware");

// Admin controller
const AdminController = require("../controllers/AdminController");

// Route: POST /api/admin/add-doctor
router.post(
  "/add-doctor",
  authenticate,
  authorizeRoles("A"), // Only admins can access
  AdminController.addDoctor
);

module.exports = router;
