import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import { Admin } from "../models/Admin.js";

export const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.user.id;
    req.businessId = decoded.user.businessId;

    if (!req.businessId) {
      throw new Error("Business ID not found in token");
    }
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.user = admin;
      req.isAdmin = true;
      return next();
    }

    const business = await Business.findById(decoded.id);
    if (business) {
      req.user = business;
      req.isAdmin = false;
      return next();
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin rights required." });
  }
};

export const checkPlanExpiry = async (req, res, next) => {
  try {
    const business = await Business.findById(req.businessId);
    if (
      !business ||
      !business.plan ||
      new Date() > new Date(business.planExpiry)
    ) {
      return res
        .status(403)
        .json({ message: "Plan expired. Please renew to continue." });
    }
    next();
  } catch (error) {
    console.error("Error in plan expiry middleware:", error.message);
    res.status(500).send("Server error");
  }
};
