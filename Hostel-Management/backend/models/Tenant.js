const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  joiningDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Tenant", tenantSchema);
