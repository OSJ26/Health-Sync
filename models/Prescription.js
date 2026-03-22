// models/Prescription.js
const mongoose = require("mongoose");

// Each medicine entry in the prescription
const medicineSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  dosage:       { type: String, default: "" },
  frequency:    { type: String, default: "" },
  duration:     { type: String, default: "" },
  instructions: { type: String, default: "" },
}, { _id: false }); // _id: false — no separate ID per medicine entry

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  // ← replaced single 'prescription' string with structured array
  medicines: {
    type: [medicineSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one medicine is required",
    },
  },
  // ← optional doctor notes
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);