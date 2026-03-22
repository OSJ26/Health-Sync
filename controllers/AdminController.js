// controllers/AdminController.js
const User        = require("../models/User");
const Appointment = require("../models/Appointment"); // ← CHANGE 1: added this import
const bcrypt      = require("bcryptjs");
const Joi         = require("joi");

class AdminController {

  async addDoctor(req, res) {
    try {
      const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(
          new RegExp(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/)
        ).required(),
        specialization: Joi.string().min(3).required().messages({
          'any.required': "Specialization is required for doctors"
        }),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
          'string.pattern.base': "Phone must be 10 digits"
        }),
        availableDays: Joi.array().items(
          Joi.string().valid("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
        ).min(1).required().messages({
          'any.required': "At least one available day is required"
        })
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password, specialization, phone, availableDays } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const doctor = new User({
        name,
        email,
        password: hashedPassword,
        role: "D",
        specialization,
        phone,
        availableDays
      });

      await doctor.save();

      res.status(201).json({ message: "Doctor registered successfully" });
      // ← CHANGE 2: removed the duplicate res.status(201) line that was here
      //   it caused "Cannot set headers after they are sent to the client" crash

    } catch (err) {
      console.error("Add Doctor Error:", err.message);
      res.status(500).json({ error: "Server error while adding doctor" });
    }
  }

  async getCounts(req, res) {
    try {
      const totalDoctors      = await User.countDocuments({ role: "D" });
      const totalPatients     = await User.countDocuments({ role: "U" });
      const totalAppointments = await Appointment.countDocuments(); // ← CHANGE 3: was hardcoded 0

      res.status(200).json({
        success: true,
        data: {
          totalDoctors,
          totalPatients,
          totalAppointments
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching counts", error });
    }
  }
}

module.exports = new AdminController();