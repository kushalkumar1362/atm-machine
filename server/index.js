const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const app = express();

const database = require("./config/database.config");
const withdrawRoutes = require("./routes/atm.route");

require("dotenv").config();

database.connect();
const PORT = process.env.PORT || 2003;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000/', 
  credentials: true
}));

app.use("/atm", withdrawRoutes);

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
