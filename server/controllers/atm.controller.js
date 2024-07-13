const jwt = require('jsonwebtoken');
const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');
const Transaction = require('../models/transaction.model');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2m';

const isAccountBlocked = (user) => {
  return user.blockUntil && new Date() < new Date(user.blockUntil);
};

exports.checkAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const user = await User.findOne({ accountNumber });
    if (user) {
      if (isAccountBlocked(user)) {
        return res.status(403).json({
          success: false,
          message: 'Account is blocked. Try again later.',
        });
      }
      const token = jwt.sign({ accountNumber }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
      res.json({
        success: true,
        token,
      });
    } else {
      res.json({
        success: false,
        message:"Acount Does Not Exists"
      });
    }
  } catch (error) {
    console.log(error);
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
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Account',
      });
    }

    if (isAccountBlocked(user)) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Try again later.',
      });
    }

    if (user.pin !== pin) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 3) {
        user.blockUntil = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        user.failedAttempts = 0;
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid Pin',
      });
    }

    user.failedAttempts = 0;
    user.blockUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
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

    const transaction = new Transaction({
      accountNumber: user.accountNumber,
      withdrawalAmount: amount,
      notesDispensed: notesToDispense,
    });
    await transaction.save();

    user.transactions.push(transaction._id);
    await user.save();

    await ATM.updateOne({}, atm);

    return res.status(200).json({
      success: true,
      message: 'Cash Withdrawal successful',
      newBalance: user.balance,
      notesToDispense,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.generateReceipt = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token not provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    const user = await User.findOne({ accountNumber: decoded.accountNumber }).populate('transactions');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const latestTransaction = user.transactions.length > 0 ? user.transactions[user.transactions.length - 1] : null;

    const receipt = {
      accountNumber: user.accountNumber,
      newBalance: user.balance,
      transactionId: latestTransaction ? latestTransaction._id : 0,
      withdrawalAmount: latestTransaction ? latestTransaction.withdrawalAmount : 0,
      notes: latestTransaction ? latestTransaction.notesDispensed : 0,
      transactionDate: latestTransaction ? latestTransaction.date : 0,
    };

    res.status(200).json({
      success: true,
      receipt,
    });

  } catch (error) {
    console.error('Error in generateReceipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
    });
  }
};

