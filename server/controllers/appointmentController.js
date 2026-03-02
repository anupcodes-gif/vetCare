const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const Doctor = require('../models/Doctor');
const User = require('../models/User');




const bookAppointment = async (req, res) => {
  const { pet_id, doctor_id, appointment_date, reason } = req.body;
  try {
    const appointment = await Appointment.create({
      user_id: req.user.id,
      pet_id,
      doctor_id,
      appointment_date,
      reason
    });
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const getMyAppointments = async (req, res) => {
  try {
    const isAdmin = req.user.Role && req.user.Role.name === 'Admin';

    const queryOptions = {
      include: [
        { model: Pet, attributes: ['name', 'species'] },
        { model: Doctor, attributes: ['name', 'specialization'] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    };

    
    if (!isAdmin) {
      queryOptions.where = { user_id: req.user.id };
    }

    const appointments = await Appointment.findAll(queryOptions);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body; 
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const addAppointmentReport = async (req, res) => {
  const { report } = req.body;
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.report = report;
    appointment.status = 'Completed';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { bookAppointment, getMyAppointments, updateAppointmentStatus, addAppointmentReport };
