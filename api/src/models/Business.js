import mongoose from "mongoose";

const PlanEnum = Object.freeze({
  FREE: { name: "Free", price: 0 },
  BASIC: { name: "Basic", price: 100 },
  STANDARD: { name: "Standard", price: 200 },
  PREMIUM: { name: "Premium", price: 500 },
});

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gst: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  logo: { type: String },
  expenseLabels: [String],
  commission: { type: Number, default: 0 },
  plan: {
    type: String,
    enum: Object.values(PlanEnum).map((plan) => plan.name),
    default: PlanEnum.FREE.name,
  },
  verified: { type: Boolean, default: false },
  products: [{ name: String, price: Number }],
  customers: [{ name: String, address: String, phone: String }],
  vendors: [{ name: String, address: String, phone: String }],
  lastReceiptNumber: { type: Number, default: 0 },
  lastReceiptDate: { type: String, default: "" },
  lastInvoiceNumber: { type: Number, default: 0 },
});

Object.assign(businessSchema.statics, { PlanEnum });

export default mongoose.model("Business", businessSchema);
