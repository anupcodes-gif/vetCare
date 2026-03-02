const User = require('../models/User');
const Role = require('../models/Role');
const Appointment = require('../models/Appointment');
const Product = require('../models/Product');
const { Order } = require('../models/Order');




const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalAppointments = await Appointment.count();
    const pendingAppointments = await Appointment.count({ where: { status: 'Pending' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    
    const orders = await Order.findAll({ where: { status: 'Completed' } });
    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAppointments,
        pendingAppointments,
        totalProducts,
        totalOrders,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'created_at'],
      include: [{ model: Role, attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const createUser = async (req, res) => {
  const { username, email, password, role_id } = req.body;
  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

    const user = await User.create({ username, email, password_hash: password, role_id });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const updateUser = async (req, res) => {
  const { username, email, role_id } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.username = username || user.username;
    user.email = email || user.email;
    user.role_id = role_id || user.role_id;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot delete yourself' });

    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats, getAllUsers, createUser, updateUser, deleteUser };
