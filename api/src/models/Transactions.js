import mongoose from "mongoose";

const Transaction = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  operation: {
    type: String,
    enum: ["add", "update", "delete"],
    required: true,
  },
  billType: {
    type: String,
    enum: ["purchase", "sales"],
    required: true,
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    required: true,
  },
  dataSnapshot: {
    type: Object, // Store the data snapshot of the bill
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", Transaction);
