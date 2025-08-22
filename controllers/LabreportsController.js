const Report = require("../models/Labreports");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Cloudinary config (make sure your .env has these values)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ReportController {
  static async uploadReport(req, res) {
    try {
        console.log(req);
      const { userId, doctorId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if(reportName == ""){
        return res.status(400).json({message: "Report Name Required"});
      }

      // Find doctor
      const doctor = await User.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Upload to Cloudinary
    //   const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    //     folder: "reports", // creates "reports" folder in Cloudinary
    //     resource_type: "auto", // supports images, pdf, docs, etc.
    //   });

      // Save report entry in DB with Cloudinary URL
      const newReport = new Report({
        userName: user.name,
        doctorName: doctor.name,
        userId,
        doctorId,
        fileUrl: req.file?.path || req.file?.secure_url,
        uploadedAt: new Date(),
      });

      await newReport.save();

      res.status(201).json({
        message: "Report uploaded successfully",
        data: newReport,
      });
    } catch (error) {
        console.error("Upload error:", error); // logs full object in server console
        res.status(500).json({
            message: "Error uploading report",
            error: error, // return full error
            stack: error.stack, // shows stack trace
        });
    }

  }

  static async getLabReports(req, res) {
    try {
      const reports = await Report.find().sort({ uploadedAt: -1 });
      res.json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching reports",
        error: error.message,
      });
    }
  }
}

module.exports = ReportController;
