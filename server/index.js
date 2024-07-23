const express = require("express");
const cors = require('cors');
const app = express();

const database = require("./config/database.config");
const withdrawRoutes = require("./routes/atm.route");

require("dotenv").config();

database.connect();
const PORT = process.env.PORT || 2003;

// Middleware
app.use(express.json());
app.use(cors());

app.use("/atm", withdrawRoutes);

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
