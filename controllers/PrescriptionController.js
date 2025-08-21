// controllers/prescriptionController.js
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const user = require("../models/User");

class PrescriptionController {
  // Add Prescription
  async addPrescription(req, res) {
    try {
      const { doctorId, appointmentId, prescription } = req.body;

      // Validate appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: "Appointment not found" });
      }

      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'D') {
        return res.status(400).json({ success: false, message: "Invalid doctor" });
      }

      // Create prescription
      const newPrescription = new Prescription({
        doctorId,
        patientId: appointment.patientId,
        doctorName: doctor.name, 
        appointmentId,
        prescription
      });

      await newPrescription.save();

      res.status(201).json({ success: true, message: "Prescription added successfully", data: newPrescription });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  // Get prescriptions by doctor
  async getPrescriptionsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const prescriptions = await Prescription.find({ doctorId }).populate("patientId appointmentId");
      res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  }

  async getPrescriptionsByPatient(req, res) {
  try {
    const { patientId } = req.params;
     const prescriptions = await Prescription.find({ patientId })
        .populate("doctorId")  // Populate doctor information from User model
        .populate("patientId")  // Populate patient information from User model
        .populate("appointmentId");  // Optionally, you can populate appointmentId if needed

    if (!prescriptions.length) {
      return res.status(404).json({ success: false, message: "No prescriptions found" });
    }
    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}
}

module.exports = new PrescriptionController();
