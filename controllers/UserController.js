// Import the User model
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

  async getAllUsers(req, res) {
    try {
      const users = await User.find({ role: "U" }).select("_id name email");
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProfileById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select("-password"); // exclude password

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, phone, specialization, availableDays } = req.body;

      let user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Common fields (both User & Doctor)
      if (name) user.name = name;
      if (email) user.email = email;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      // Doctor-specific fields
      if (user.role === "D") {
        if (phone) user.phone = phone;
        if (specialization) user.specialization = specialization;
        if (availableDays) user.availableDays = availableDays; // array from dropdown
      }

      // Save updated user
      await user.save();

      res.json({ success: true, message: "Profile updated successfully", data: user });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

// Export the class instance
module.exports = new UserController();
