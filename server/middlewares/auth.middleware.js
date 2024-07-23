const jwt = require('jsonwebtoken');
const Blacklist = require('../models/blockToken.model');
const { JWT_SECRET } = process.env;

const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await Blacklist.findOne({ token });
  return !!blacklistedToken;
};

const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not provided',
    });
  }

  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Session expired',
    });
  }
  next();
};

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({
      success: false,
      message: 'Token is not valid'
    });
    req.user = user;
    next();
  });
};

module.exports = { checkBlacklist, authenticateToken, isTokenBlacklisted };
