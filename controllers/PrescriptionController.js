// controllers/PrescriptionController.js
const Prescription = require("../models/Prescription");
const Appointment  = require("../models/Appointment");
const User         = require("../models/User");

class PrescriptionController {

  // ── Add Prescription ──────────────────────────────────────
  // POST /api/prescriptions/addPrescription
  // Body: { doctorId, appointmentId, medicines: [...], notes? }
  async addPrescription(req, res) {
    try {
      const { doctorId, appointmentId, medicines, notes } = req.body;

      // ── Validate required fields ──────────────────────────
      if (!doctorId || !appointmentId || !medicines) {
        return res.status(400).json({
          success: false,
          message: "doctorId, appointmentId and medicines are required",
        });
      }

      if (!Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({
          success: false,
          message: "medicines must be a non-empty array",
        });
      }

      // Validate each medicine has at least a name
      for (let i = 0; i < medicines.length; i++) {
        if (!medicines[i].name || medicines[i].name.trim() === "") {
          return res.status(400).json({
            success: false,
            message: `Medicine at index ${i} is missing a name`,
          });
        }
      }

      // ── Validate appointment ──────────────────────────────
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      // ── Validate doctor ───────────────────────────────────
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== "D") {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor",
        });
      }

      // ── Validate patient ──────────────────────────────────
      const patient = await User.findById(appointment.patientId);
      if (!patient || patient.role !== "U") {
        return res.status(400).json({
          success: false,
          message: "Invalid patient",
        });
      }

      // ── Create and save ───────────────────────────────────
      const newPrescription = new Prescription({
        doctorId,
        doctorName:    doctor.name,
        patientId:     appointment.patientId,
        patientName:   patient.name,
        appointmentId,
        medicines:     medicines.map((m) => ({
          name:         m.name?.trim()         ?? "",
          dosage:       m.dosage?.trim()       ?? "",
          frequency:    m.frequency?.trim()    ?? "",
          duration:     m.duration?.trim()     ?? "",
          instructions: m.instructions?.trim() ?? "",
        })),
        notes: notes?.trim() ?? "",
      });

      await newPrescription.save();

      res.status(201).json({
        success: true,
        message: "Prescription added successfully",
        data: newPrescription,
      });

    } catch (error) {
      console.error("Add prescription error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // ── Get prescriptions by doctor ───────────────────────────
  // GET /api/prescriptions/doctor/:doctorId
  async getPrescriptionsByDoctorId(req, res) {
    try {
      const { doctorId } = req.params;

      const prescriptions = await Prescription
        .find({ doctorId })
        .populate("appointmentId")
        .sort({ createdAt: -1 }); // newest first

      if (!prescriptions || prescriptions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No prescriptions found for this doctor",
        });
      }

      res.status(200).json(prescriptions);

    } catch (error) {
      console.error("Get prescriptions by doctor error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // ── Get prescriptions by patient ──────────────────────────
  // GET /api/prescriptions/patient/:patientId/prescriptions
  async getPrescriptionsByPatient(req, res) {
    try {
      const { patientId } = req.params;

      const prescriptions = await Prescription
        .find({ patientId })
        .populate("doctorId",      "name specialization")
        .populate("patientId",     "name")
        .populate("appointmentId", "date timeSlot status")
        .sort({ createdAt: -1 }); // newest first

      if (!prescriptions || prescriptions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No prescriptions found",
        });
      }

      res.status(200).json({ success: true, data: prescriptions });

    } catch (error) {
      console.error("Get prescriptions by patient error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = new PrescriptionController();