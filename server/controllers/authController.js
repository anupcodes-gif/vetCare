const User = require('../models/User');
const Role = require('../models/Role');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');




const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const userRole = await Role.findOne({ where: { name: 'User' } });

    const user = await User.create({
      username,
      email,
      password_hash: password,
      role_id: userRole ? userRole.id : null
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user.id,
        username: user.username,
        email: user.email,
        role: userRole ? userRole.name : 'User',
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};




const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Role, attributes: ['name'] }]
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        success: true,
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.Role ? user.Role.name : 'User',
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser };
