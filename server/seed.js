const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/account.model');
const ATM = require('./models/atm.model');
const Transaction = require('./models/transaction.model');

mongoose.connect(process.env.MONGODB_URL, {})
  .then(async () => {
    console.log('Database connected successfully');

    // Default accounts
    const users = [
      {
        name: 'Kushal kumar',
        accountNumber: '1111111111111111',
        balance: 100000,
        pin: '1111'
      },
      {
        name: 'Jatin',
        accountNumber: '2222222222222222',
        balance: 10000,
        pin: '2222'
      },
      {
        name: 'Jane Smith',
        accountNumber: '3333333333333333',
        balance: 20000,
        pin: '3333'
      },
      {
        name: 'John Doe',
        accountNumber: '4444444444444444',
        balance: 15000,
        pin: '4444'
      },
    ];

    const atm = {
      notes: {
        10: 100,
        20: 100,
        50: 100,
        100: 100,
        200: 50,
        500: 50,
        1000: 20
      }
    };

    await User.deleteMany({});
    await ATM.deleteMany({});
    await Transaction.deleteMany({}); // Clear transactions

    await User.insertMany(users);
    console.log('Default users added successfully');

    await ATM.create(atm);
    console.log('Default ATM notes added successfully');

    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    mongoose.disconnect();
  });
