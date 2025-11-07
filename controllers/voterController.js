const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const VoterModel = require('../models/voterModel');
const EligibleVoterModel = require('../models/eligibleVoterModel');
const HttpError = require('../models/ErrorModel');

// ✅ Utility: Generate JWT
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined.");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ✅ Register voter with eligibility check
const registerVoter = async (req, res, next) => {
  try {
    const { email, studentID, password, password2 } = req.body;

    if (!email || !studentID || !password || !password2) {
      return next(new HttpError("Fill in all the fields.", 422));
    }

    const newEmail = email.toLowerCase();

    // --- Step 1: Check if voter is in eligible list
    const eligible = await EligibleVoterModel.findOne({ email: newEmail, studentID });
    if (!eligible) {
      return next(new HttpError("You are not on the official eligible voter list.", 422));
    }

    // --- Step 2: Prevent re-registration
    const existingVoter = await VoterModel.findOne({ email: newEmail });
    if (existingVoter) {
      return next(new HttpError("Voter already registered.", 422));
    }

    // --- Step 3: Validate password
    if (password.trim().length < 6) {
      return next(new HttpError("Password must be at least 6 characters.", 422));
    }

    if (password !== password2) {
      return next(new HttpError("Passwords do not match.", 422));
    }

    // --- Step 4: Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- Step 5: Determine if admin
    const isAdmin = newEmail === "admin@sdca.edu.ph";

    // --- Step 6: Save new voter
    const newVoter = await VoterModel.create({
      email: newEmail,
      studentID,
      password: hashedPassword,
      isAdmin,
    });

    res.status(201).json({
      message: `Voter ${eligible.fullName || studentID} successfully registered.`,
      voter: {
        id: newVoter._id,
        email: newVoter.email,
        studentID: newVoter.studentID,
        isAdmin: newVoter.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Voter registration failed.", 500));
  }
};

// ✅ Login voter
const loginVoter = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.toLowerCase();
    const voter = await VoterModel.findOne({ email: newEmail });

    if (!voter) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    const validPassword = await bcrypt.compare(password, voter.password);
    if (!validPassword) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    const { _id: id, isAdmin, VotedElection } = voter;
    const token = generateToken({ id, isAdmin });

    res.status(200).json({
      message: "Login successful.",
      token,
      voter: { id, email: voter.email, isAdmin, VotedElection },
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError("Login failed.", 500));
  }
};

// ✅ Get voter by ID
const getVoter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voter = await VoterModel.findById(id).select("-password");

    if (!voter) {
      return next(new HttpError("Voter not found.", 404));
    }

    res.status(200).json(voter);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Couldn't get voter.", 404));
  }
};

module.exports = { registerVoter, loginVoter, getVoter, generateToken };
