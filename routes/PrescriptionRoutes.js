// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/PrescriptionController");

// POST: Add new prescription
router.post("/addPrescription", prescriptionController.addPrescription);
router.get("/doctor/:doctorId", prescriptionController.getPrescriptionsByDoctorId);
router.get("/patient/:patientId/prescriptions", prescriptionController.getPrescriptionsByPatient);
//router.get("/doctor/:doctorId", prescriptionController.getPrescriptionsByDoctorId);

module.exports = router;
