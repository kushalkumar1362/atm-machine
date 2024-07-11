const express = require("express");
const app = express();
const database = require("./config/database.config");
const withdrawRoutes = require("./routes/atm.route");

require("dotenv").config();

database.connect();
const PORT = process.env.PORT || 2003;

app.use(express.json());
app.use("/atm", withdrawRoutes);

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`)
});
