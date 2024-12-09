import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Correctly attach userId and businessId to the request object
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
