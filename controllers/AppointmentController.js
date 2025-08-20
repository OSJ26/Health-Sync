// controllers/AppointmentController.js

const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Book Appointment
const bookAppointment = async (req, res) => {
  try {
    const { patientId, patientName, doctorId, date, timeSlot } = req.body;

    // Check if slot is already booked
    const existing = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' } // exclude cancelled appointments
    });

    if (existing) {
      return res.status(409).json({ message: 'Slot already booked. Please choose another.' });
    }

    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      status: "Booked"
    });

    await appointment.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

// Cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed', error: err.message });
  }
};

// Reschedule Appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId, newDate, newTimeSlot } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if new slot is available
    const isBooked = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      timeSlot: newTimeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (isBooked) {
      return res.status(409).json({ message: 'New time slot already booked. Choose another.' });
    }

    // Optional: Only allow reschedule before 1 hour of original appointment
    const originalTime = new Date(`${appointment.date}T${appointment.timeSlot}`);
    const now = new Date();
    const diffMinutes = (originalTime - now) / (1000 * 60);

    if (diffMinutes < 60) {
      return res.status(400).json({ message: 'Reschedule not allowed within 1 hour of appointment' });
    }

    appointment.date = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'Rescheduled';
    await appointment.save();

    res.status(200).json({ message: 'Appointment rescheduled', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Reschedule failed', error: err.message });
  }
};

// Get Appointments by User
const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await Appointment.find({ patientId: userId })
      .sort({ date: -1 })
      .populate('doctorId', 'name specialization phone')   // Populate doctor details
      .populate('patientId', 'name');                      // (Optional) Populate patient name

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

// Get Appointments by Doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;

    const query = { doctorId };

    const appointments = await Appointment.find(query).sort({ timeSlot: 1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor appointments', error: err.message });
  }
};

module.exports = {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUserAppointments,
  getDoctorAppointments
};
