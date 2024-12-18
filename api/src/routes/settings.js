import express from "express";
import { auth, checkPlanExpiry } from "../middleware/auth.js";
import Business from "../models/Business.js";

const router = express.Router();

router.get("/", auth, checkPlanExpiry, async (req, res) => {
  try {
    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }
    res.send(business);
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Server error", error });
  }
});

router.patch("/", auth, checkPlanExpiry, async (req, res) => {
  const updates = req.body;
  try {
    const business = await Business.findByIdAndUpdate(req.businessId, updates, {
      new: true,
      runValidators: true,
    });

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }

    res.send(business);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Update failed", error });
  }
});

export default router;
