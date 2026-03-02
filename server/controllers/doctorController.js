const Doctor = require('../models/Doctor');




const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const addDoctor = async (req, res) => {
  const { name, specialization, experience, image_url } = req.body;
  try {
    const doctor = await Doctor.create({
      name,
      specialization,
      experience,
      image_url
    });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await doctor.destroy();
    res.json({ success: true, message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateDoctor = async (req, res) => {
  const { name, specialization, experience, image_url } = req.body;
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience || doctor.experience;
    doctor.image_url = image_url || doctor.image_url;
    await doctor.save();

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDoctors, addDoctor, deleteDoctor, updateDoctor };
