import Business, { Plan } from "../models/Business.js";

export const updateBusinessInfo = async (req, res) => {
  console.log(req.params._id);
  console.log(req.body);
  try {
    const {
      name,
      gst,
      address,
      phone,
      logo,
      expenseLabels,
      commission,
      products,
      customers,
      vendors,
    } = req.body;

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params._id,
      {
        name,
        gst,
        address,
        phone,
        logo,
        expenseLabels,
        commission,
        products,
        customers,
        vendors,
      },
      { new: true }
    );
    res.status(200).json(updatedBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.business._id,
      { plan: planId, planExpiry: oneMonthFromNow },
      { new: true }
    );

    res.status(200).json(updatedBusiness);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBusinessInfo = async (req, res) => {
  try {
    const business = await Business.find();
    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, price, features } = req.body;
    const newPlan = new Plan({ name, price, features });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, features } = req.body;
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { name, price, features },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.status(200).json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const countAnalytics = async (req, res) => {
  try {
    const totalBusinesses = await Business.countDocuments();
    const totalCustomers = await Business.aggregate([
      { $unwind: "$customers" },
      { $count: "count" },
    ]);
    const totalVendors = await Business.aggregate([
      { $unwind: "$vendors" },
      { $count: "count" },
    ]);
    const totalProducts = await Business.aggregate([
      { $unwind: "$products" },
      { $count: "count" },
    ]);
    const packageUsage = await Business.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "plans",
          localField: "_id",
          foreignField: "_id",
          as: "plan",
        },
      },
    ]);

    res.status(200).json({
      totalBusinesses,
      totalCustomers: totalCustomers[0]?.count || 0,
      totalVendors: totalVendors[0]?.count || 0,
      totalProducts: totalProducts[0]?.count || 0,
      packageUsage: packageUsage.map((pkg) => ({
        plan: pkg.plan[0]?.name || "Unknown",
        count: pkg.count,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};
