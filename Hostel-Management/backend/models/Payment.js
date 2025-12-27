const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true
  },
  month: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Paid"
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
