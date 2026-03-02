const express = require('express');
const router = express.Router();
const { addMedicalRecord, addVaccination, getPetHealthHistory } = require('../controllers/petHealthController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/pet/:id', getPetHealthHistory);
router.post('/records', authorize('Admin'), addMedicalRecord);
router.post('/vaccinations', authorize('Admin'), addVaccination);

module.exports = router;
