import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import billRoutes from "./routes/bills.js";
import settingsRoutes from "./routes/settings.js";
import paymentRoutes from "./routes/payments.js";
import admin from "./routes/superadmin.js";
import businessRoutes from "./routes/businessRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://invoice-nine-omega.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dashboard-invoice-chi.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", admin);
app.use("/api/business", businessRoutes);
app.use("/api/adminauth", adminAuthRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
