// models/Prescription.js
const mongoose = require("mongoose");

// Define prescription schema
const PrescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Linked to patient
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Linked to doctor
  medicines: [
    {
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      duration: { type: String, required: true }
    }
  ],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
