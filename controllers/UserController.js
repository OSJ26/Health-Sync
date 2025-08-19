// Import the User model
const User = require("../models/User");

// Create class to handle user operations
class UserController {
  // Method to return profile of currently authenticated user
  async getCurrentUser(req, res) {
    try {
      // Extract user ID from token (added by auth middleware)
      const userId = req.user.id;

      // Query the DB to fetch the user's full document
      const user = await User.findById(userId).select("-password"); // exclude password

      // If user not found (edge case)
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return profile
      res.status(200).json({
        message: "User profile fetched successfully",
        user
      });

    } catch (error) {
      console.error("User fetch error:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getDoctors(req, res) {
    try {
      const doctors = await User.find({ role: 'D' }, 'name specialization phone');
      return res.status(200).json(doctors);
    } catch (err) {
      return res.status(500).json({
        message: 'Failed to fetch doctors',
        error: err.message,
      });
    }
  }

  async getPrescriptionsByUser(userId) {
    try {
      // Validate userId
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Fetch prescriptions
      const prescriptions = await Prescription.find({ patientId: userId })
        .populate("doctorId", "name email") // show doctor's name/email
        .sort({ createdAt: -1 });

      return prescriptions;
    } catch (error) {
      throw error;
    }
  }
}

// Export the class instance
module.exports = new UserController();
