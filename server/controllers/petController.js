const Pet = require('../models/Pet');




const getPets = async (req, res) => {
  try {
    const pets = await Pet.findAll({ where: { user_id: req.user.id } });
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const registerPet = async (req, res) => {
  const { name, species, breed, age } = req.body;
  try {
    const pet = await Pet.create({
      user_id: req.user.id,
      name,
      species,
      breed,
      age
    });
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const getPet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updatePet = async (req, res) => {
  try {
    let pet = await Pet.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    
    pet = await pet.update(req.body);
    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    
    await pet.destroy();
    res.json({ success: true, message: 'Pet removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPets, registerPet, getPet, updatePet, deletePet };
