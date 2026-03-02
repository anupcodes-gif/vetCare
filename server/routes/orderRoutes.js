const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(placeOrder)
  .get(getMyOrders);

router.put('/:id/status', authorize('Admin'), updateOrderStatus);

module.exports = router;
