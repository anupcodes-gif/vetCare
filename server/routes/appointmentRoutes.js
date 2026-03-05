const express = require('express');
const router = express.Router();
const { bookAppointment, getMyAppointments, updateAppointmentStatus, addAppointmentReport, updateAppointment, cancelAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(bookAppointment)
  .get(getMyAppointments);

router.put('/:id/status', authorize('Admin'), updateAppointmentStatus);
router.put('/:id/report', authorize('Admin'), addAppointmentReport);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
