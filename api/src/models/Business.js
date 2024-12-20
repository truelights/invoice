import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
  duration: { type: Number, required: true }, // Added duration field
  createdAt: { type: Date, default: Date.now },
});

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gst: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  logo: { type: String }, // Main logo
  expenseLabels: [String],
  commission: { type: Number, default: 0 },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: null,
  },
  planExpiry: { type: Date, default: null },
  verified: { type: Boolean, default: false },
  products: [{ name: String, price: Number }],
  customers: [{ name: String, address: String, phone: String }],
  vendors: [{ name: String, address: String, phone: String }],
  lastReceiptNumber: { type: Number, default: 0 },
  lastReceiptDate: { type: String, default: "" },
  lastInvoiceNumber: { type: Number, default: 0 },
});

export const Plan = mongoose.model("Plan", planSchema);
export default mongoose.model("Business", businessSchema);
