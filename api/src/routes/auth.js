import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { auth } from "../middleware/auth.js";
import Business, { Plan } from "../models/Business.js";
import User from "../models/User.js";
import Plantransactions from "../models/plantransactions.js";
import cron from "node-cron";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to verify Razorpay Payment Signature
const verifyPayment = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

// Cron Job: Expire businesses with outdated plans
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const expiredBusinesses = await Business.find({ planExpiry: { $lt: now } });

    for (const business of expiredBusinesses) {
      business.plan = null;
      business.planExpiry = null;
      business.verified = false;
      await business.save();
    }
  } catch (error) {
    console.error("Error in cron job for expired plans:", error);
  }
});

// Renew Plan
router.post("/renew-plan", auth, async (req, res) => {
  try {
    const { planId, paymentId } = req.body;
    const businessId = req.businessId;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan selected" });

    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== "captured") return res.status(400).json({ message: "Payment not successful" });

    if (payment.amount !== plan.price * 100) {
      return res.status(400).json({ message: "Payment amount does not match plan price" });
    }

    const transaction = new Plantransactions({
      business: business._id,
      plan: plan._id,
      amount: plan.price,
      paymentMethod: payment.method || "Unknown",
      status: "Completed",
    });

    await transaction.save();

    business.plan = planId;
    business.planExpiry = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    business.verified = true;
    await business.save();

    res.json({ message: "Plan renewed successfully", business, transaction });
  } catch (error) {
    console.error("Error renewing plan:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Business Registration with Payment Handling
router.post("/register", upload.single("logo"), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, businessName, gst, address, phone, planId, paymentId, orderId, signature } = req.body;

    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan selected" });

    if (plan.price > 0 && (!paymentId || !orderId || !signature)) {
      return res.status(400).json({ message: "Payment details missing" });
    }

    if (plan.price > 0 && !verifyPayment(orderId, paymentId, signature)) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    let logoUrl = null;
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      logoUrl = uploadResult.secure_url;
    }

    const business = new Business({
      name: businessName || "sample",
      gst: gst || "GST000000",
      address: address || "Sample Address",
      phone: phone || "000-000-0000",
      logo: logoUrl,
      verified: true,
      plan: plan._id,
      planExpiry: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
    });

    await business.save();

    const transaction = new Plantransactions({
      amount: plan.price,
      paymentMethod: "Online",
      business: business._id,
      plan: planId,
      status: "Completed",
    });

    await transaction.save();

    const user = new User({ email, password, businessId: business._id });
    await user.save();

    jwt.sign({ user: { id: user.id, businessId: business._id } }, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token, transaction });
    });
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// User Login with Plan Expiry Check
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const business = await Business.findById(user.businessId);
    if (!business || !business.plan || new Date() > new Date(business.planExpiry)) {
      business.plan = null;
      business.planExpiry = null;
      business.verified = false;
      await business.save();
      return res.status(403).json({ message: "Plan expired. Please renew to continue." });
    }

    jwt.sign({ user: { id: user.id, businessId: user.businessId } }, process.env.JWT_SECRET, { expiresIn: "365d" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Razorpay Webhook for Payment Confirmation
router.post("/razorpay-webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest("hex");

    if (shasum !== req.headers["x-razorpay-signature"]) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    if (req.body.event === "payment.captured") {
      console.log("Payment captured:", req.body.payload.payment.entity.id);
    }

    res.json({ status: "success" });
  } catch (error) {
    console.error("Error in webhook:", error);
    res.status(500).json({ message: "Webhook error", error: error.message });
  }
});

export default router;
