const express = require('express');
const router = express.Router();
const { getProducts, addProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.post('/', protect, authorize('Admin'), addProduct);
router.put('/:id', protect, authorize('Admin'), updateProduct);
router.delete('/:id', protect, authorize('Admin'), deleteProduct);

module.exports = router;
