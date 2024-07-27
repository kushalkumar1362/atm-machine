const jwt = require('jsonwebtoken');
const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const Transaction = require('../models/transaction.model');
const Blacklist = require('../models/blockToken.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');
const { isTokenBlacklisted } = require('../middlewares/auth.middleware');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2m';

// Function to check if the user's account is currently blocked
const isAccountBlocked = (user) => {
  return user.blockUntil && new Date() < new Date(user.blockUntil);
};

// Endpoint to invalidate a user session by blacklisting the token
exports.invalidateSession = async (req, res) => {
  // 1. Fetch token from header
  // 2. check is token is already exists in blockList
  // 3. otherwise block the token
  // 4. Return response
  const token = req.headers.authorization.split(' ')[1];
  try {
    // Check if the token is already blacklisted
    if (await isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired'
      });
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
  // 1. Get account number from header
  // 2. return response if user not exists
  // 3. check is user block or not
  // 4. Generate JWT
  // 5. Add token in cookie
  // 6. Return response
  try {
    const { accountNumber } = req.body;
    const user = await User.findOne({ accountNumber });

    if (!user) {
      return res.json({
        success: false,
        message: "Account Does Not Exist"
      });
    }

    if (isAccountBlocked(user)) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked. Try again later.',
      });
    }

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
  // 1. Get pin number from req.body and token from header
  // 2. check is token blocked means expired
  // 3. Decode token
  // 4. find user
  // 5. check is user block or not
  // 6. Reset Last wrong pin attempts date after 24 hour
  // 7. Validate the pin or block user after 3 wrong attempts
  // 8. Reset Last wrong pin attempts after correct pin
  // 9. Return response
  const { pin } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ accountNumber: decoded.accountNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account',
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
    user.lastFailedAttempt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Pin verified successfully",
      token,
    });
  } catch (error) {
    console.error('Error checking pin:', error);
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint to check PIN for authentication
exports.checkBalance = async (req, res) => {
  // 1.Fetch token from body
  // 2. check is token blocked means expired
  // 3. Validate token
  // 4. find user and validate
  // 5. Return Resposne
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ accountNumber: decoded.accountNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Balance checked successfully',
      balance: user.balance
    });
  } catch (error) {
    console.error('Error checking balance:', error);
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
  // 1. Fetch Amount, token and denomination from req
  // 2. validate the token
  // 3. validate the amount and denomination
  // 4. find user 
  // 5. validate balance
  // 6. Fetch all notes present in ATM
  // 7. Withdraw the cash
  // 8. if remaining amount is not 0 and denomination notes greater than 20 return response
  // 9. Update the balance in database
  // 10. Generate transacction  
  // 11 Update user, transaction, notes in DB 
  // 12. Return response
  const { amount, denomination } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const denominationNumber = parseInt(denomination, 10);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

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

    const user = await User.findOne({ accountNumber: decoded.accountNumber });

    if (user.balance < amount) {
      const blacklistedToken = new Blacklist({ token });
      await blacklistedToken.save();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    const atm = await ATM.findOne();

    if (atm.notes[denomination] === 0) {
      return res.status(503).json({
        success: false,
        message: 'Cannot dispense the requested amount with the available denominations. Please try another denomination.',
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
        message: 'Total notes limit exceeded. Only 20 notes can be withdrawn at a time',
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

    // Update ATM notes
    await ATM.updateOne({}, atm);

    return res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      notesDispensed: notesToDispense,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint to generate receipt for the last transaction
exports.generateReceipt = async (req, res) => {
  // 1. fetch token from body
  // 2. check is token blocked means expired
  // 3. validate token
  // 4. find user
  // 5. generate receipt
  // 6. Return response
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

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
    console.error('Error generating receipt:', error);
    const blacklistedToken = new Blacklist({ token });
    await blacklistedToken.save();
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
    });
  }
};

// Endpoint to get all accounts details
exports.getAllAccounts = async (req, res) => {
  try {
    const users = await User.find({}, { accountNumber: 1, pin: 1, balance: 1 });
    res.status(200).json({
      success: true,
      accounts: users
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts',
    });
  }
}
