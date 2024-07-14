const jwt = require('jsonwebtoken');
const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');
const Transaction = require('../models/transaction.model');
const Blacklist = require('../models/blockToken.model');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2m';

const isAccountBlocked = (user) => {
  return user.blockUntil && new Date() < new Date(user.blockUntil);
};

const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await Blacklist.findOne({ token });
  return !!blacklistedToken;
};

exports.invalidateSession = async (req, res) => {
  const { token } = req.body;

  try {

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Session already expired' });
    }

    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();

    res.json({ success: true, message: 'Session Expired' });
  } catch (error) {
    console.error('Error invalidating session:', error);
    return res.status(500).json({ success: false, message: 'Failed to invalidate session' });
  }
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
        message:"Card Successfully Verified",
        token,
      });
    } else {
      res.json({
        success: false,
        message: "Acount Does Not Exists"
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
  const { token, pin } = req.body;
  try {
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
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
    } else {
      user.blockUntil = null;
    }

    if (user.lastFailedAttempt && new Date() > new Date(user.lastFailedAttempt)) {
      user.failedAttempts = 0;
      user.lastFailedAttempt = null;
    }

    if (user.pin !== pin) {
      user.failedAttempts += 1;
      if (!user.lastFailedAttempt) {
        user.lastFailedAttempt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      }
      if (user.failedAttempts >= 3) {
        user.blockUntil = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      }
      await user.save();

      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
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
      message:"Pin verified Successfullly",
      token,
    });
  } catch (error) {
    console.log(error);
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
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
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
    }

    if (amount.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Please Enter the amount',
      });
    }
    if (amount < 10) {
      return res.status(401).json({
        success: false,
        message: 'Minimum withdrawal Amount is 10',
      });
    }

    if (amount < denominationNumber) {
      return res.status(401).json({
        success: false,
        message: 'Denomination not fulfilled',
      });
    }

    if (amount > 10000) {
      return res.status(401).json({
        success: false,
        message: 'Amount should be less than or equal to 10000',
      });
    }

    const user = await User.findOne({ accountNumber: decoded.accountNumber });
    if (user.balance < amount) {
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
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
  const { token } = req.body;
  try {
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }
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
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
    });
  }
};

