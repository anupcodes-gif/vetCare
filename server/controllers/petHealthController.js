const MedicalRecord = require('../models/MedicalRecord');
const Vaccination = require('../models/Vaccination');
const Pet = require('../models/Pet');




const addMedicalRecord = async (req, res) => {
  const { pet_id, diagnosis, treatment, visit_date } = req.body;
  try {
    const record = await MedicalRecord.create({
      pet_id,
      diagnosis,
      treatment,
      visit_date
    });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const addVaccination = async (req, res) => {
  const { pet_id, vaccine_name, date_administered, next_due_date } = req.body;
  try {
    const vaccination = await Vaccination.create({
      pet_id,
      vaccine_name,
      date_administered,
      next_due_date
    });
    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const getPetHealthHistory = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    
    const isAdmin = req.user.Role && req.user.Role.name === 'Admin';
    if (!isAdmin && pet.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const records = await MedicalRecord.findAll({ 
      where: { pet_id: pet.id },
      order: [['visit_date', 'DESC']]
    });
    const vaccinations = await Vaccination.findAll({ 
      where: { pet_id: pet.id },
      order: [['date_administered', 'DESC']]
    });

    res.json({ success: true, data: { records, vaccinations } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addMedicalRecord, addVaccination, getPetHealthHistory };
