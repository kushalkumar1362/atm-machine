const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose.connect(process.env.MONGODB_URL, {})
    .then(() => {
      console.log("Data Base Sucessfully connected !!")
    })
    .catch((error) => {
      console.log("Failed to connect with database", error);
      process.exit(1);
    })
}