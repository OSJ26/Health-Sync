const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/AppointmentController');

// Routes
router.post('/book', appointmentController.bookAppointment);
router.put('/cancel', appointmentController.cancelAppointment);
router.put('/reschedule', appointmentController.rescheduleAppointment);
router.get('/user/:userId', appointmentController.getUserAppointments);
router.get('/doctor', appointmentController.getDoctorAppointments); // ?doctorId=123&date=2025-07-28

module.exports = router;
    