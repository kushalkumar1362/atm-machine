const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/account.model');
const ATM = require('./models/atm.model');

// Connect to the database
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Database connected successfully');

    // Default accounts
    const users = [
      {
        name: 'John Doe',
        accountNumber: '12345671',
        balance: 5000,
        pin: '1234'
      },
      {
        name: 'Jane Smith',
        accountNumber: '12345672',
        balance: 3000,
        pin: '5678'
      },
      {
        name: 'Alice Johnson',
        accountNumber: '12345673',
        balance: 7000,
        pin: '4321'
      }
    ];

    // Default ATM notes
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

    // Clear the collections
    await User.deleteMany({});
    await ATM.deleteMany({});

    // Insert default users
    await User.insertMany(users);
    console.log('Default users added successfully');

    // Insert default ATM notes
    await ATM.create(atm);
    console.log('Default ATM notes added successfully');

    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    mongoose.disconnect();
  });
