const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin-model");
const HttpError = require("../models/error-model");

// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// REGISTER ADMIN
exports.registerAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return next(new HttpError("All fields are required", 422));

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return next(new HttpError("Admin already registered", 422));

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: true,
    });

    res.status(201).json({ message: "Admin registered", admin });
  } catch (err) {
    next(new HttpError("Registration failed", 500));
  }
};

// LOGIN ADMIN
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new HttpError("All fields are required", 422));

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return next(new HttpError("Admin not found", 404));

    const valid = await admin.matchPassword(password); 
    if (!valid) 
      return next(new HttpError("Incorrect Password", 401));
    

    const token = generateToken({ id: admin._id, isAdmin: admin.isAdmin });
    res.json({ message: "Login successful", token, admin });
  } catch (err) {
    next(new HttpError("Login failed", 500));
  }
};
