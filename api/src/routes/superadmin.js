import Business from "../models/Business.js";
import { Plan } from "../models/Business.js";
import express from "express";

// Manage Plans
const router = express.Router();

// Create a new plan
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

// Read all plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    res.status(500).send("Server error");
  }
});

// Update a plan
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

// Delete a plan
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

// Manage Businesses

// Update business details
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

// Export the router
export default router;
