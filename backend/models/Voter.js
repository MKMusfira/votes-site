const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  serial_no: Number,
  enrollment_no: String,
  name: String,
  polling_station: String,
  phone: String,
  has_voted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Voter", voterSchema);
