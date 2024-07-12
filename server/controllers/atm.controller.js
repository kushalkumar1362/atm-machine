const jwt = require('jsonwebtoken');
const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2m';

exports.checkAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const user = await User.findOne({ accountNumber });
    if (user) {
      const token = jwt.sign({ accountNumber }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
      res.json({
        success: true,
        token
      });
    } else {
      res.json({
        success: false,
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.checkPin = async (req, res) => {
  try {
    const { token, pin } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    const user = await User.findOne({ accountNumber: decoded.accountNumber });
    if (!user || user.pin !== pin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pin',
      });
    }
    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { token, amount, denomination } = req.body;
    const denominationNumber = parseInt(denomination, 10);

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    if (amount < denominationNumber) {
      return res.status(401).json({
        success: false,
        message: 'Denomination not fulfilled',
      });
    }

    const user = await User.findOne({ accountNumber: decoded.accountNumber });
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Balance',
      });
    }

    const atm = await ATM.findOne();
    if (atm.notes[denomination] === 0) {
      return res.status(503).json({
        success: false,
        message: 'Cannot dispense the requested amount with the available denominations please check another denomination',
      });
    }

    const { notesToDispense, remainingAmount } = dispenseCash(amount, denomination, atm);
    if (remainingAmount > 0) {
      return res.status(503).json({
        success: false,
        message: 'Cannot dispense the requested amount with the available denominations',
      });
    }

    let totalNotes = 0;
    for (const note in notesToDispense) {
      totalNotes += notesToDispense[note];
    }
    if (totalNotes > 20) {
      return res.status(200).json({
        success: false,
        message: 'Total Notes Limit exceeded, only 20 notes can be withdrawn at a time',
      });
    }

    user.balance -= amount;
    await user.save();
    await ATM.updateOne({}, atm);

    return res.status(200).json({
      success: true,
      message: 'Cash Withdrawal successful',
      newBalance: user.balance,
      notesToDispense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
