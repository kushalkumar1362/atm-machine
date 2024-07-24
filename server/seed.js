const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();

const User = require('./models/account.model');
const ATM = require('./models/atm.model');
const Transaction = require('./models/transaction.model');
const SeedStatus = require('./models/seedStatus.model');

const initialBalances = [
  { accountNumber: '1111111111111111', balance: 100000 },
  { accountNumber: '2222222222222222', balance: 10000 },
  { accountNumber: '3333333333333333', balance: 20000 },
  { accountNumber: '4444444444444444', balance: 15000 }
];

async function seedDatabase() {
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
  await Transaction.deleteMany({});

  await User.insertMany(users);
  console.log('Default users added successfully');

  await ATM.create(atm);
  console.log('Default ATM notes added successfully');
}

async function refreshUserBalances() {
  try {
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

    mongoose.disconnect();
    console.log('Database disconnected after balance refresh');
  } catch (error) {
    console.error('Error refreshing user balances:', error);
    mongoose.disconnect();
  }
}

async function connectAndSeed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {});
    console.log('Database connected successfully');

    const seedStatus = await SeedStatus.findOne();
    if (!seedStatus || !seedStatus.seeded) {
      await seedDatabase(); // Seed the database initially
      await SeedStatus.updateOne({}, { seeded: true }, { upsert: true });
      console.log('Database seeded successfully');
    } else {
      console.log('Database already seeded');
    }

    mongoose.disconnect();
    console.log('Database disconnected after seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    mongoose.disconnect();
  }
}

// Schedule the task to run every minute for testing
cron.schedule('* * * * *', () => {
  console.log('Running balance refresh task every minute');
  refreshUserBalances(); // Refresh balances every minute
});

// Start the initial seeding
connectAndSeed();
