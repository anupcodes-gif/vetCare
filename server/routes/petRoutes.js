const express = require('express');
const router = express.Router();
const { getPets, registerPet, getPet, updatePet, deletePet } = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 

router.route('/')
  .get(getPets)
  .post(registerPet);

router.route('/:id')
  .get(getPet)
  .put(updatePet)
  .delete(deletePet);

module.exports = router;
