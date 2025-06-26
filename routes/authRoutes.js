// Import required modules
const express = require("express");
const router = express.Router();

// Import controller
const AuthController = require("../controllers/AuthController");

// Define route to register new patient user
router.post("/register", AuthController.registerUser);
// Login route
router.post("/login", AuthController.loginUser);


// Export router for use in main app
module.exports = router;
