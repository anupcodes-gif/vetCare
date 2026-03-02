const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');




const placeOrder = async (req, res) => {
  const { items, total_amount } = req.body; 
  try {
    const order = await Order.create({
      user_id: req.user.id,
      total_amount
    });

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItems);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const getMyOrders = async (req, res) => {
  try {
    const isAdmin = req.user.Role && req.user.Role.name === 'Admin';

    const queryOptions = {
      include: [
        { model: OrderItem, include: [Product] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    };

    if (!isAdmin) {
      queryOptions.where = { user_id: req.user.id };
    }

    const orders = await Order.findAll(queryOptions);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, updateOrderStatus };
