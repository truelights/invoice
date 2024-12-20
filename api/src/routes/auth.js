import express from "express";
import Business, { Plan } from "../models/Business.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Razorpay from "razorpay";
import cron from "node-cron";
import Plantransactions from "../models/plantransactions.js";
const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    const expiredBusinesses = await Business.find({
      planExpiry: { $lt: now },
    });

    for (const business of expiredBusinesses) {
      business.plan = null;
      business.planExpiry = null;
      business.verified = false;
      await business.save();
    }
  } catch (error) {
    console.error("Error in cron job for expired plans:", error.message);
  }
});

router.post("/renew-plan", async (req, res) => {
  try {
    const { businessId, planId, paymentId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    if (payment.amount !== plan.price * 100) {
      return res
        .status(400)
        .json({ message: "Payment amount does not match plan price" });
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
    business.planExpiry = new Date(
      Date.now() + plan.duration * 24 * 60 * 60 * 1000
    );
    business.verified = true;

    await business.save();

    res.json({ message: "Plan renewed successfully", business, transaction });
  } catch (error) {
    console.error("Error renewing plan:", error.message);
    res.status(500).send("Server error");
  }
});

router.post("/register", upload.single("logo"), async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      gst,
      address,
      phone,
      planId,
      paymentId,
    } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    let logoUrl = null;

    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      logoUrl = uploadResult.secure_url;
    }

    let transaction = null;

    if (planId && paymentId) {
      const payment = await razorpay.payments.fetch(paymentId);
      if (payment.status !== "captured") {
        return res.status(400).json({ message: "Payment not successful" });
      }

      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      transaction = new Plantransactions({
        amount: plan.price,
        paymentMethod: payment.method || "Unknown",
        business: null, // Temporary, will be updated after business creation
        plan: planId,
        status: "Completed",
      });

      await transaction.save();
    }

    const plan = planId ? await Plan.findById(planId) : null;

    const business = new Business({
      name: businessName || "sample",
      gst: gst || "GST000000",
      address: address || "Sample Address",
      phone: phone || "000-000-0000",
      logo: logoUrl,
      expenseLabels: ["Sample Expense"],
      products: [{ name: "Sample Product", price: 100 }],
      customers: [
        {
          name: "Sample Customer",
          address: "Sample Address",
          phone: "123-456-7890",
        },
      ],
      vendors: [
        {
          name: "Sample Vendor",
          address: "Sample Vendor Address",
          phone: "112-233-4455",
        },
      ],
      verified: true,
      lastReceiptNumber: 1,
      lastReceiptDate: new Date().toISOString().split("T")[0],
      lastInvoiceNumber: 1,
      plan: plan ? plan._id : null,
      planExpiry: plan
        ? new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
        : null,
    });

    await business.save();

    if (transaction) {
      transaction.business = business._id;
      await transaction.save();
    }

    user = new User({
      email,
      password,
      businessId: business._id,
    });
    await user.save();

    const payload = {
      user: {
        id: user.id,
        businessId: business._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, transaction });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const business = await Business.findById(user.businessId);
    if (
      !business ||
      !business.plan ||
      !business.planExpiry ||
      new Date() > new Date(business.planExpiry)
    ) {
      return res.status(403).json({
        message: "Plan expired or not active. Please renew to continue.",
      });
    }

    const payload = {
      user: {
        id: user.id,
        businessId: user.businessId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "365d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Error in login:", err.message);
    res.status(500).send("Server error");
  }
});

router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    res.status(500).send("Server error");
  }
});

export default router;
