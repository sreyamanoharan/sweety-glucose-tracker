
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role || "PATIENT",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// Doctor-only authorization
export const authorizeDoctor = (req, res, next) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({
      message: "Access denied. Doctor privileges required.",
    });
  }

  next();
};

export default protect;
