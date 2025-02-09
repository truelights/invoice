// Transaction Schema for plan purchase records
import mongoose from "mongoose";

const Plantransactions = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Razorpay", "Debit Card", "PayPal", "Bank Transfer"],
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  receiptId: {
    type: String,
    unique: true,
  },
});

// Pre-save middleware to generate unique receipt ID
Plantransactions.pre("save", function (next) {
  if (!this.receiptId) {
    this.receiptId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }
  next();
});

export default mongoose.model("PlanTransaction", Plantransactions);
