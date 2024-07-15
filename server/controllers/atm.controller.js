const jwt = require('jsonwebtoken');
const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const Transaction = require('../models/transaction.model');
const Blacklist = require('../models/blockToken.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2m';

// Function to check if the user's account is currently blocked
const isAccountBlocked = (user) => {
  return user.blockUntil && new Date() < new Date(user.blockUntil);
};

// Function to check if a JWT token is blacklisted
const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await Blacklist.findOne({ token });
  return !!blacklistedToken;
};

// Function to handle session expiration response
const handleSessionExpired = (res) => {
  return res.status(401).json({
    success: false,
    message: 'Session expired'
  });
};

// Endpoint to invalidate a user session by blacklisting the token
exports.invalidateSession = async (req, res) => {
  const { token } = req.body;

  try {
    // Check if the token is already blacklisted
    if (await isTokenBlacklisted(token)) {
      return handleSessionExpired(res);
    }

    // Add the token to the blacklist
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();

    res.json({
      success: true,
      message: 'Session Expired'
    });
  } catch (error) {
    console.error('Error invalidating session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to invalidate session'
    });
  }
};

// Endpoint to check if an account exists and generate a JWT token for authentication
exports.checkAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    const user = await User.findOne({ accountNumber });

    // If no user found, return error response
    if (!user) {
      return res.json({
        success: false,
        message: "Account Does Not Exist"
      });
    }

    // If account is blocked, return blocked account response
    if (isAccountBlocked(user)) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Try again later.',
      });
    }

    // Generate JWT token and return success response
    const token = jwt.sign({ accountNumber }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    res.json({
      success: true,
      message: "Card Successfully Verified",
      token,
    });
  } catch (error) {
    console.error('Error checking account:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint to check PIN for authentication
exports.checkPin = async (req, res) => {
  const { token, pin } = req.body;
  try {
    // Check if the token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return handleSessionExpired(res);
    }

    let decoded;
    try {
      // Verify the JWT token
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return handleSessionExpired(res);
    }

    // Find user based on decoded accountNumber from token
    const user = await User.findOne({ accountNumber: decoded.accountNumber });

    // If no user found, return invalid account response
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Account',
      });
    }

    // If account is blocked, return blocked account response
    if (isAccountBlocked(user)) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Try again later.',
      });
    } else {
      user.blockUntil = null; // Clear blockUntil field for the user
    }

    // Reset failed attempts if past the reset time
    if (user.lastFailedAttempt && new Date() > new Date(user.lastFailedAttempt)) {
      user.failedAttempts = 0;
      user.lastFailedAttempt = null;
    }

    // If PIN doesn't match, handle failed attempts and potentially block the account
    if (user.pin !== pin) {
      user.failedAttempts += 1;
      if (!user.lastFailedAttempt) {
        user.lastFailedAttempt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Block for 24 hours on third failed attempt
      }
      if (user.failedAttempts >= 3) {
        user.blockUntil = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Block account for 24 hours after three failed attempts
      }
      await user.save();

      // Add token to blacklist on failed attempts
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid Pin',
      });
    }
    user.failedAttempts = 0;
    user.blockUntil = null; // Clear blockUntil field for the user
    await user.save();

    // Return success response with JWT token
    return res.status(200).json({
      success: true,
      message: "Pin verified successfully",
      token,
    });
  } catch (error) {
    console.error('Error checking pin:', error);
    // Add token to blacklist on error
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint to process cash withdrawal
exports.withdraw = async (req, res) => {
  try {
    const { token, amount, denomination } = req.body;
    const denominationNumber = parseInt(denomination, 10); // Convert denomination to number

    // Check if the token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return handleSessionExpired(res);
    }

    let decoded;
    try {
      // Verify the JWT token
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return handleSessionExpired(res);
    }

    // Validate amount input
    if (!amount) {
      return res.status(401).json({
        success: false,
        message: 'Please enter the amount',
      });
    }

    if (amount < 10) {
      return res.status(401).json({
        success: false,
        message: 'Minimum withdrawal amount is 10',
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

    // Find user based on decoded accountNumber from token
    const user = await User.findOne({ accountNumber: decoded.accountNumber });

    // If user balance is less than requested amount, return insufficient balance response
    if (user.balance < amount) {
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
      return res.status(400).json({
        success: false,
        message: 'Insufficient Balance',
      });
    }

    // Retrieve ATM data
    const atm = await ATM.findOne();

    // If requested denomination is not available in ATM, return unavailable denomination response
    if (atm.notes[denomination] === 0) {
      return res.status(503).json({
        success: false,
        message: 'Cannot dispense the requested amount with the available denominations. Please try another denomination.',
      });
    }

    // Attempt to dispense cash from ATM
    const { notesToDispense, remainingAmount } = dispenseCash(amount, denomination, atm);

    // If cash cannot be dispensed with available denominations, return appropriate response
    if (remainingAmount > 0) {
      return res.status(503).json({
        success: false,
        message: 'Cannot dispense the requested amount with the available denominations',
      });
    }

    // Calculate total number of notes being dispensed
    let totalNotes = 0;
    for (const note in notesToDispense) {
      totalNotes += notesToDispense[note];
    }

    // Limit total number of notes to be dispensed to 20
    if (totalNotes > 20) {
      return res.status(200).json({
        success: false,
        message: 'Total notes limit exceeded. Only 20 notes can be withdrawn at a time',
      });
    }

    // Deduct withdrawal amount from user balance
    user.balance -= amount;

    // Create transaction record
    const transaction = new Transaction({
      accountNumber: user.accountNumber,
      withdrawalAmount: amount,
      notesDispensed: notesToDispense,
    });
    await transaction.save();

    // Add transaction to user's transaction history
    user.transactions.push(transaction._id);
    await user.save();

    // Update ATM notes availability
    await ATM.updateOne({}, atm);

    // Return success response with transaction details
    return res.status(200).json({
      success: true,
      message: 'Cash withdrawal successful',
      newBalance: user.balance,
      notesToDispense,
    });
  } catch (error) {
    console.error('Error withdrawing cash:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint to generate receipt for the last transaction
exports.generateReceipt = async (req, res) => {
  const { token } = req.body;
  try {
    // Check if the token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return handleSessionExpired(res);
    }
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token not provided',
      });
    }

    let decoded;
    try {
      // Verify the JWT token
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return handleSessionExpired(res);
    }

    // Find user based on decoded accountNumber from token and populate transaction history
    const user = await User.findOne({ accountNumber: decoded.accountNumber }).populate('transactions');

    // If no user found, return user not found response
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Retrieve latest transaction details from user's transaction history
    const latestTransaction = user.transactions.length > 0 ? user.transactions[user.transactions.length - 1] : null;

    // Construct receipt object with transaction details
    const receipt = {
      accountNumber: user.accountNumber,
      newBalance: user.balance,
      transactionId: latestTransaction ? latestTransaction._id : 0,
      withdrawalAmount: latestTransaction ? latestTransaction.withdrawalAmount : 0,
      notes: latestTransaction ? latestTransaction.notesDispensed : 0,
      transactionDate: latestTransaction ? latestTransaction.date : 0,
    };

    // Return success response with receipt details
    res.status(200).json({
      success: true,
      receipt,
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    // Add token to blacklist on error
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
    });
  }
};
