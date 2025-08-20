// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/PrescriptionController");

// POST: Add new prescription
router.post("/addPrescription", prescriptionController.addPrescription);

module.exports = router;
