import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
