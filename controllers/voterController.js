const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Voter = require("../models/voterModel");
const EligibleVoter = require("../models/eligibleVoterModel");
const HttpError = require("../models/errorModel");

// Generate JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register voter (Gmail or SDCA email)
const registerVoter = async (req, res, next) => {
  try {
    const { fullName, email, studentID, password, password2 } = req.body;
    if (!fullName || !email || !password || !password2)
      return next(new HttpError("All fields required", 422));

    if (password !== password2)
      return next(new HttpError("Passwords do not match", 422));

    const existing = await Voter.findOne({ email: email.toLowerCase() });
    if (existing) return next(new HttpError("Voter already registered", 422));

    // Check eligibility if email is SDCA
    const eligible = await EligibleVoter.findOne({ email: email.toLowerCase() });
    if (!eligible && email.endsWith("@sdca.edu.ph")) {
      return next(new HttpError("You are not in the eligible voter list", 403));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const voter = await Voter.create({
      fullName,
      email: email.toLowerCase(),
      studentID: studentID || "",
      password: hashedPassword,
      isAdmin: email.toLowerCase() === "admin@sdca.edu.ph",
      department: eligible?.department || "General",
      course: eligible?.course || "N/A",
    });

    res.status(201).json({
      message: "Registration successful",
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email,
        studentID: voter.studentID,
        isAdmin: voter.isAdmin,
      },
    });
  } catch (err) {
    next(new HttpError("Registration failed", 500));
  }
};

// Login voter (StudentID optional)
const loginVoter = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new HttpError("All fields required", 422));

    const voter = await Voter.findOne({ email: email.toLowerCase() });
    if (!voter) return next(new HttpError("Invalid credentials", 401));

    const valid = await bcrypt.compare(password, voter.password || "");
    if (!valid) return next(new HttpError("Invalid credentials", 401));

    const token = generateToken({ id: voter._id, isAdmin: voter.isAdmin });
    res.json({
      message: "Login successful",
      token,
      voter: {
        id: voter._id,
        email: voter.email,
        studentID: voter.studentID,
        isAdmin: voter.isAdmin,
      },
    });
  } catch (err) {
    next(new HttpError("Login failed", 500));
  }
};

// Get voter info
const getVoter = async (req, res, next) => {
  try {
    const voter = await Voter.findById(req.params.id).select("-password");
    if (!voter) return next(new HttpError("Voter not found", 404));
    res.json(voter);
  } catch (err) {
    next(new HttpError("Fetching voter failed", 500));
  }
};

module.exports = { registerVoter, loginVoter, getVoter, generateToken };
