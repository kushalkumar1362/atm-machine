const User = require('../models/account.model');
const ATM = require('../models/atm.model');
const { dispenseCash } = require('../utils/cashDispenser.utils');

exports.withdraw = async (req, res) => {
  try {
    const { accountNumber, amount, pin, denomination } = req.body;

    if (!accountNumber || !amount || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide accountNumber, amount, and pin'
      });
    }

    if (amount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than or equals to 10.'
      });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user',
      });
    }

    if (user.pin !== pin) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect PIN'
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Balance',
      });
    }

    const atm = await ATM.findOne();
    if (atm.notes[denomination] === 0 && amount < denomination) {
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
    console.log(notesToDispense);
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
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
