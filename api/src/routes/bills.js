import express from "express";
import { auth } from "../middleware/auth.js";
import Bill from "../models/Bill.js";
import Business from "../models/Business.js";
import Transaction from "../models/Transactions.js";

const router = express.Router();

router.get("/new-numbers", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.businessId);

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    if (!business.lastReceiptDate || business.lastReceiptDate !== today) {
      business.lastReceiptNumber = 0;
      business.lastReceiptDate = today;
    }

    business.lastReceiptNumber += 1;
    const receiptNo = `${today}-${business.lastReceiptNumber
      .toString()
      .padStart(1, "0")}`;

    business.lastInvoiceNumber = business.lastInvoiceNumber || 0;
    business.lastInvoiceNumber += 1;
    const invoiceNo = business.lastInvoiceNumber.toString().padStart(1, "0");
    res.json({ receiptNo, invoiceNo });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error", error });
  }
});

router.get("/transactions", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      businessId: req.businessId,
    }).sort({ createdAt: -1 });
    res.send(transactions);
  } catch (error) {
    res.status(500).send({ message: "Error fetching transactions", error });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { paymentType, netAmount, ...otherDetails } = req.body;
    const business = await Business.findById(req.businessId);

    if (!business) {
      return res.status(404).send({ message: "Business not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    if (!business.lastReceiptDate || business.lastReceiptDate !== today) {
      business.lastReceiptNumber = 0;
      business.lastReceiptDate = today;
    }

    business.lastReceiptNumber += 1;
    const receiptNo = `${today}-${business.lastReceiptNumber
      .toString()
      .padStart(1, "0")}`;

    business.lastInvoiceNumber = business.lastInvoiceNumber || 0;
    business.lastInvoiceNumber += 1;
    const invoiceNo = business.lastInvoiceNumber.toString().padStart(1, "0");
    const recievedAmount = paymentType === "credit" ? 0 : netAmount;

    const bill = new Bill({
      ...otherDetails,
      paymentType,
      netAmount,
      invoiceNo: invoiceNo,
      receiptNo,
      recievedAmount,
      businessId: req.businessId,
    });

    await bill.save();
    await Transaction.create({
      businessId: req.businessId,
      operation: "add",
      billType: bill.type,
      billId: bill._id,
      dataSnapshot: bill.toObject(),
    });
    res.status(201).send(bill);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Error creating bill", error });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const bills = await Bill.find({ businessId: req.businessId });
    res.send(bills);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });
    if (!bill) {
      return res.status(404).send();
    }
    res.send(bill);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = req.body;
    console.log(updates);
    console.log(req.params.id);

    const existingBill = await Bill.findOne({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!existingBill) {
      return res.status(404).send({ message: "Bill not found" });
    }

    if (updates.paymentType || updates.netAmount) {
      const paymentType = updates.paymentType || existingBill.paymentType;
      const netAmount = updates.netAmount || existingBill.netAmount;

      // Use provided `recievedAmount` if available; otherwise, calculate
      if (typeof updates.recievedAmount === "undefined") {
        updates.recievedAmount = paymentType === "credit" ? 0 : netAmount;
      }

      console.log("Calculated recievedAmount:", updates.recievedAmount); // Debugging log
    }

    const updatedBill = await Bill.findOneAndUpdate(
      { _id: req.params.id, businessId: req.businessId },
      updates,
      { new: true, runValidators: true }
    );

    await Transaction.create({
      businessId: req.businessId,
      operation: "update",
      billType: updatedBill.type,
      billId: updatedBill._id,
      dataSnapshot: updatedBill.toObject(),
    });

    res.send(updatedBill);
  } catch (error) {
    res.status(400).send({ message: "Error updating bill", error });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      businessId: req.businessId,
    });

    if (!bill) {
      return res.status(404).send({ message: "Bill not found" });
    }

    await Transaction.create({
      businessId: bill.businessId,
      operation: "delete",
      billType: bill.type,
      billId: bill._id,
      dataSnapshot: bill.toObject(),
    });

    res.send(bill);
  } catch (error) {
    res.status(500).send({ message: "Error deleting bill", error });
  }
});

export default router;
