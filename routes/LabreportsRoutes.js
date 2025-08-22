// routes/reportRoutes.js
const express = require("express");
const multer = require("multer");
const ReportController = require("../controllers/LabreportsController");

const router = express.Router();

// Multer setup (store in uploads folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique file name
  }
});     

const upload = multer({ storage: storage });

// Upload API
router.post("/upload", upload.single("report"), ReportController.uploadReport);
router.get("/reports",ReportController.getLabReports);
module.exports = router;
