const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/account.model');
const ATM = require('./models/atm.model');

const initialBalances = [
  { accountNumber: '1111111111111111', balance: 100000 },
  { accountNumber: '2222222222222222', balance: 10000 },
  { accountNumber: '3333333333333333', balance: 20000 },
  { accountNumber: '4444444444444444', balance: 15000 }
];

const initialATMNotes = {
  10: 100,
  20: 100,
  50: 100,
  100: 100,
  200: 50,
  500: 50,
  1000: 20
};

async function refreshUserBalances() {
  try {
    console.log('Connecting to database for balance refresh');
    await mongoose.connect(process.env.MONGODB_URL, {});
    console.log('Database connected for balance refresh');

    for (const user of initialBalances) {
      await User.findOneAndUpdate(
        { accountNumber: user.accountNumber },
        { balance: user.balance },
        { new: true }
      );
    }
    console.log('User balances refreshed successfully');

    await ATM.findOneAndUpdate(
      {},
      { notes: initialATMNotes },
      { new: true }
    );
    console.log('ATM notes refreshed successfully');

    await mongoose.disconnect();
    console.log('Database disconnected after balance refresh');
  } catch (error) {
    console.error('Error refreshing user balances:', error);
    await mongoose.disconnect();
  }
}

refreshUserBalances();
