const express = require("express");
const cors = require('cors');
const app = express();

const database = require("./config/database.config");
const withdrawRoutes = require("./routes/atm.route");

require("dotenv").config();

database.connect();
const PORT = process.env.PORT || 2003;

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// ---------------------------------comment above cors option and uncomment below for local host----------------------
// const corsOptions = {
//   origin: 'http://localhost:3000',
// };

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

app.use("/atm", withdrawRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
