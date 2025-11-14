const jwt = require("jsonwebtoken");
const Voter = require("../models/voterModel");
const HttpError = require("../models/errorModel");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) 
      return next(new HttpError("Not authorized, token missing", 401));

    const token = authHeader.split(" ")[1];
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return next(new HttpError("Invalid token", 401)); }

    const user = await Voter.findById(decoded.id).select("-password");
    if (!user) return next(new HttpError("User not found", 401));

    req.user = user;
    next();
  } catch (err) {
    next(new HttpError("Authentication failed", 401));
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return next(new HttpError("Admin access required", 403));
  next();
};
