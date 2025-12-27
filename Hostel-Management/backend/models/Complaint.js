const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  issueType: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    default: "Open"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Complaint", complaintSchema);
