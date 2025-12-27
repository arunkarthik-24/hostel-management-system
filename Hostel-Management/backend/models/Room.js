const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  rent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "Available"
  }
});

module.exports = mongoose.model("Room", roomSchema);
