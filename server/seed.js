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
        name: 'John Doe',
        accountNumber: '12345671',
        balance: 50000,
        pin: '1234'
      },
      {
        name: 'Jane Smith',
        accountNumber: '12345672',
        balance: 10000,
        pin: '5678'
      },
      {
        name: 'Alice Johnson',
        accountNumber: '12345673',
        balance: 7000,
        pin: '4321'
      }
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
