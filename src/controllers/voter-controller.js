const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Voter = require("../models/voter-model");
const HttpError = require("../models/error-model");

// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register voter
exports.registerVoter = async (req, res, next) => {
  try {
    const { fullName, email, studentID, password, password2 } = req.body;
    if (!fullName || !email || !password || !password2)
      return next(new HttpError("All fields are required", 422));

    if (password !== password2)
      return next(new HttpError("Passwords do not match", 422));

    const existing = await Voter.findOne({ email: email.toLowerCase() });
    if (existing) return next(new HttpError("Account already registered", 422));

    if (
      !email.toLowerCase().endsWith("@gmail.com") &&
      !email.toLowerCase().endsWith("@sdca.edu.ph")
    ) {
      return next(new HttpError("Email must be Gmail or SDCA email", 422));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const voter = await Voter.create({
      fullName,
      email: email.toLowerCase(),
      studentID: studentID || "",
      password: hashedPassword,
      isAdmin: email.toLowerCase() === "admin@sdca.edu.ph",
    });

    res.status(201).json({
      message: "Registration successful",
      voter: voter.toJSON(),
    });
  } catch (err) {
    next(new HttpError("Registration failed", 500));
  }
};

// Login voter
exports.loginVoter = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new HttpError("All fields are required", 422));

    const voter = await Voter.findOne({ email: email.toLowerCase() });
    if (!voter) return next(new HttpError("Invalid credentials", 401));

    const valid = await bcrypt.compare(password, voter.password || "");
    if (!valid) return next(new HttpError("Invalid credentials", 401));

    const token = generateToken({ id: voter._id, isAdmin: voter.isAdmin });
    res.json({ message: "Login successful", token, voter: voter.toJSON() });
  } catch (err) {
    next(new HttpError("Login failed", 500));
  }
};

// Get voter info
exports.getVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id).select("-password");
    if (!voter) return next(new HttpError("Voter not found", 404));
    res.json(voter);
  } catch (err) {
    next(new HttpError("Fetching voter failed", 500));
  }
};

// Update voter info
exports.updateVoter = async (req, res, next) => {
  try {
    const { fullName, email, studentID, password } = req.body;
    const voter = await Voter.findById(req.params.id);
    if (!voter) return next(new HttpError("Voter not found", 404));

    if (email && !email.toLowerCase().endsWith("@gmail.com") && !email.toLowerCase().endsWith("@sdca.edu.ph")) {
      return next(new HttpError("Email must be Gmail or SDCA email", 422));
    }

    if (email) voter.email = email.toLowerCase();
    if (fullName) voter.fullName = fullName;
    if (studentID) voter.studentID = studentID;
    if (password) voter.password = await bcrypt.hash(password, 10);

    await voter.save();
    res.json({ message: "Voter updated successfully", voter: voter.toJSON() });
  } catch (err) {
    next(new HttpError("Update failed", 500));
  }
};

// Delete voter
exports.deleteVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return next(new HttpError("Voter not found", 404));

    await voter.remove();
    res.json({ message: "Voter account deleted successfully" });
  } catch (err) {
    next(new HttpError("Deletion failed", 500));
  }
};
