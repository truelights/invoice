import express from "express";
import Business, { Plan } from "../models/Business.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Razorpay from "razorpay";
import cron from "node-cron";

const router = express.Router();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running cron job to check for expired plans...");

    const now = new Date();

    // Find businesses with expired plans
    const expiredBusinesses = await Business.find({
      planExpiry: { $lt: now },
    });

    for (const business of expiredBusinesses) {
      business.plan = null; // Remove the plan
      business.planExpiry = null; // Clear the expiry date
      business.verified = false; // Reset verified status
      await business.save();
      console.log(`Updated business: ${business.name}`);
    }

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Error in cron job for expired plans:", error.message);
  }
});
router.post("/renew-plan", async (req, res) => {
  try {
    const { businessId, planId, paymentId } = req.body;

    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Validate payment amount matches the plan price
    if (payment.amount !== plan.price * 100) {
      // Razorpay stores amount in paise
      return res
        .status(400)
        .json({ message: "Payment amount does not match plan price" });
    }

    // Update business plan and expiry
    business.plan = planId;
    business.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    business.verified = true;

    await business.save();

    res.json({ message: "Plan renewed successfully", business });
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

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    let logoUrl = null;

    // Upload logo to Cloudinary if file exists
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      logoUrl = uploadResult.secure_url;
    }

    // Verify payment if planId and paymentId are provided
    if (planId && paymentId) {
      const payment = await razorpay.payments.fetch(paymentId);
      if (payment.status !== "captured") {
        return res.status(400).json({ message: "Payment not successful" });
      }
    }

    // Get the selected plan
    const plan = planId ? await Plan.findById(planId) : null;

    // Create new business
    const business = new Business({
      name: businessName || "sample",
      gst: gst || "GST000000",
      address: address || "Sample Address",
      phone: phone || "000-000-0000",
      logo: logoUrl, // Use the logo URL if available
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
      planExpiry: plan ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days from now for paid plans
    });

    await business.save();

    // Create new user
    user = new User({
      email,
      password,
      businessId: business._id,
    });
    await user.save();

    // Create and return JWT token
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
        res.json({ token });
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

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log the hashed password stored in the database
    console.log(`Stored hashed password: ${user.password}`);

    // Use comparePassword method for checking password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log(`Password mismatch for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If password matches, create and return JWT token
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
