// routes/reportRoutes.js
// const express = require("express");
// const multer = require("multer");
// const ReportController = require("../controllers/LabreportsController");

// const router = express.Router();

// // Multer setup (store in uploads folder)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // unique file name
//   }
// });     

// const upload = multer({ storage: storage });

// // Upload API
// router.post("/upload", upload.single("report"), ReportController.uploadReport);
// router.get("/reports",ReportController.getLabReports);
// module.exports = router;

// routes/reportRoutes.js
const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const ReportController = require("../controllers/LabreportsController");

const router = express.Router();

// Configure cloudinary (keep credentials in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage directly to cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "health-sync/reports", // optional folder in Cloudinary
    allowed_formats: ["jpg", "png", "pdf"], // restrict types
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage });

// Upload API
router.post("/upload", upload.single("report"), ReportController.uploadReport);
router.post("/reports", ReportController.getReportsByRole);

module.exports = router;

