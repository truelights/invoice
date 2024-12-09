import express from "express";
import Business from "../models/Business.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Register route
router.post("/register", upload.single("logo"), async (req, res) => {
  try {
    const { email, password, businessName, gst, address, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    console.log(req.file.path);

    // Create new business with optional logo
    const logoUrl = await uploadOnCloudinary(req.file.path);
    console.log(logoUrl);

    const business = new Business({
      name: businessName || "Sample Business Name",
      gst: gst || "GST000000",
      address: address || "Sample Address",
      phone: phone || "000-000-0000",
      logo: logoUrl.secure_url, // Store the logo path here
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
      lastReceiptNumber: 1,
      lastReceiptDate: new Date().toISOString().split("T")[0],
      lastInvoiceNumber: 1,
    });

    await business.save();

    // Create new user (password hashing handled in the pre-save hook)
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

export default router;
