import Business from "../models/Business.js";
import { Plan } from "../models/Business.js";
import Plantransactions from "../models/plantransactions.js";
import express from "express";

const router = express.Router();

router.post("/plans", async (req, res) => {
  try {
    const { name, price, features } = req.body;

    const newPlan = new Plan({ name, price, features });
    await newPlan.save();

    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Error creating plan:", error.message);
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

router.put("/plans/:id", async (req, res) => {
  try {
    const { name, price, features } = req.body;
    const planId = req.params.id;

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { name, price, features },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error.message);
    res.status(500).send("Server error");
  }
});

router.delete("/plans/:id", async (req, res) => {
  try {
    const planId = req.params.id;

    const deletedPlan = await Plan.findByIdAndDelete(planId);

    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error.message);
    res.status(500).send("Server error");
  }
});

router.put("/business/:id", async (req, res) => {
  try {
    const { name, address, phone, gst, plan } = req.body;
    const businessId = req.params.id;

    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { name, address, phone, gst, plan },
      { new: true }
    ).populate("plan");

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error.message);
    res.status(500).send("Server error");
  }
});

router.post("/business/:id/subscribe", async (req, res) => {
  try {
    const businessId = req.params.id;
    const { planId, amount, paymentMethod } = req.body;

    // Validate the business and plan existence
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Create the transaction record
    const transaction = new Plantransactions({
      business: business._id,
      plan: plan._id,
      amount: amount,
      paymentMethod: paymentMethod,
      status: "Pending", // Default status, you can update later
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error processing transaction:", error.message);
    res.status(500).send("Server error");
  }
});

router.put("/transaction/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    // Validate status
    if (!["Pending", "Completed", "Failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transaction = await Plantransactions.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    transaction.status = status;
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    console.error("Error updating transaction status:", error.message);
    res.status(500).send("Server error");
  }
});

router.get("/transaction/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const transaction = await Plantransactions.findById(transactionId)
      .populate("business", "name address") // Select business details
      .populate("plan", "name price features"); // Select plan details

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error.message);
    res.status(500).send("Server error");
  }
});
router.get("/business/:id/transactions", async (req, res) => {
  try {
    const businessId = req.params.id;

    const transactions = await Plantransactions.find({
      business: businessId,
    }).populate("plan", "name price");

    if (!transactions) {
      return res
        .status(404)
        .json({ message: "No transactions found for this business" });
    }

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).send("Server error");
  }
});
export default router;
