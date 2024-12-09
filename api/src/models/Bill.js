import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  type: { type: String, enum: ["purchase", "sales"], required: true },
  receiptNo: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  date: { type: Date, required: true },
  vendorDetails: { type: String },
  items: [
    {
      item: String,
      bags: Number,
      weight: Number,
      rate: Number,
      amount: Number,
      otherCharges: Number,
      applyCommission: Boolean,
    },
  ],
  expenses: [
    {
      type: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  duedate: { type: Date, default: Date.now },
  recievedAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  totalExpense: { type: Number, required: true },
  totalOtherCharges: { type: Number },
  totalCommission: { type: Number },
  netAmount: { type: Number, required: true },
  paymentType: { type: String },
});

export default mongoose.model("Bill", billSchema);
