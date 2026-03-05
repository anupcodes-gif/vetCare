const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Role = require('../models/Role');
const generateToken = require('../utils/generateToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture } = payload;

    let user = await User.findOne({ 
      where: { email },
      include: [{ model: Role, attributes: ['name'] }]
    });

    if (!user) {
      
      const userRole = await Role.findOne({ where: { name: 'User' } });
      const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
      const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

      user = await User.create({
        username: uniqueUsername,
        email,
        google_id,
        role_id: userRole ? userRole.id : null
      });
      
      
      user = await User.findOne({ 
        where: { id: user.id },
        include: [{ model: Role, attributes: ['name'] }]
      });
    } else if (!user.google_id) {
      
      user.google_id = google_id;
      await user.save();
    }

    res.json({
      success: true,
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.Role ? user.Role.name : 'User',
      token: generateToken(user.id)
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    const errorDetails = error.errors ? error.errors.map(e => e.message).join(', ') : error.message;
    res.status(401).json({ success: false, message: 'Google Auth Error', details: errorDetails });
  }
};

module.exports = { googleLogin };
