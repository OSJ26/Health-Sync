// controllers/reportController.js
const Report = require("../models/Labreports");
const User = require("../models/User");

class ReportController {
  static async uploadReport(req, res) {
    try {
      const { userId, doctorId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const doctor = await User.findById(doctorId);
          if (!doctor) {
            return res.status(404).json({ message: 'Doctor Name Not Found' });
          }

        const user = await User.findById(userId);
          if (!doctor) {
            return res.status(404).json({ message: 'User Name Not Found' });
          }

      // Save report entry in DB
      const newReport = new Report({
        userName: user.name,
        doctorName: doctor.name,
        userId,
        doctorId,
        fileUrl: `tmp/${req.file.filename}`,
        uploadedAt: new Date(),
      });

      await newReport.save();

      res.status(201).json({
        message: "Report uploaded successfully",
        data: newReport,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading report" });
    }
  }

   static async getLabReports(req, res) {
        try {
            const { userId, doctorId } = req.query; // Read query params

            let filter = {};
            if (userId) {
                filter.userId = userId; // If user
            } else if (doctorId) {
                filter.doctorId = doctorId; // If doctor
            } else {
                return res.status(400).json({
                    message: "Either patientId or doctorId is required"
                });
            }

            // Fetch lab reports from DB
            const reports = await Report.find(filter);

            res.status(200).json({
                success: true,
                data: reports
            });

        } catch (error) {
            console.error("Error fetching lab reports:", error);
            res.status(500).json({
                success: false,
                message: "Server error",
                error: error.message
            });
        }
    }
}

module.exports = ReportController;
