const jwt = require("jsonwebtoken");
const Admin = require("../models/admin-model");
const Voter = require("../models/voter-model");
const HttpError = require("../models/error-model");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new HttpError("Not authorized, token missing", 403));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await Admin.findById(decoded.id).select("-password");
    if (!user) user = await Voter.findById(decoded.id).select("-password");

    if (!user) return next(new HttpError("User not found", 404));

    req.user = user;
    next();
  } catch (err) {
    return next(new HttpError("Invalid token", 403));
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return next(new HttpError("Admin access only", 403));
  next();
};

module.exports = { protect, adminOnly };
