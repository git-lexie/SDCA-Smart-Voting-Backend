const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Voter = require("../models/voter-model");
const HttpError = require("../models/error-model");

// Generate JWT
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

// Register voter
exports.registerVoter = async (req, res, next) => {
  try {
    console.log("Register body:", req.body);

    const { firstName, lastName, email, studentID, password, password2 } = req.body;
    if (!firstName || !lastName || !email || !password || !password2)
      return next(new HttpError("All fields are required", 422));
    if (password !== password2)
      return next(new HttpError("Passwords do not match", 422));

    const existing = await Voter.findOne({ email: email.toLowerCase() });
    if (existing) return next(new HttpError("Account already registered", 422));

    if (
      !email.toLowerCase().endsWith("@gmail.com") &&
      !email.toLowerCase().endsWith("@sdca.edu.ph")
    )
      return next(
        new HttpError("Email must be Gmail or SDCA email", 422)
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const voter = await Voter.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      studentID: studentID || "",
      password: hashedPassword,
      isAdmin: email.toLowerCase() === "admin@sdca.edu.ph",
    });

    res.status(201).json({ message: "Registration successful", voter: voter.toJSON() });
  } catch (err) {
    console.error("Registration error:", err);
    next(new HttpError("Registration failed", 500));
  }
};

// Login voter
exports.loginVoter = async (req, res, next) => {
  try {
    console.log("Login body:", req.body);

    const { email, password } = req.body;
    if (!email || !password)
      return next(new HttpError("All fields are required", 422));

    const voter = await Voter.findOne({ email: email.toLowerCase() });
    if (!voter) return next(new HttpError("Invalid credentials", 401));

    const valid = await bcrypt.compare(password, voter.password || "");
    if (!valid) 
      return next(new HttpError("Incorrect Password", 401));

    const token = generateToken({ id: voter._id, isAdmin: voter.isAdmin });
    res.status(200).json({ message: "Login successful", token, voter: voter.toJSON() });
  } catch (err) {
    console.error("Login error:", err);
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

// Update voter
exports.updateVoter = async (req, res, next) => {
  try {
    const voterId = req.params.id;
    const { firstName, lastName, email, studentID, password, department, course } = req.body;

    if (!voterId) return next(new HttpError("Voter ID is required", 400));

    // Validate email if provided
    if (email && !email.toLowerCase().endsWith("@gmail.com") && !email.toLowerCase().endsWith("@sdca.edu.ph")) {
      return next(new HttpError("Email must be Gmail or SDCA email", 422));
    }

    // Build update object dynamically
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastNameName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (studentID) updateData.studentID = studentID.trim();
    if (department) updateData.department = department.trim();
    if (course) updateData.course = course.trim();
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Update and return the new document
    const updatedVoter = await Voter.findByIdAndUpdate(voterId, updateData, { new: true });
    if (!updatedVoter) return next(new HttpError("Voter not found", 404));

    res.status(200).json({ message: "Voter updated successfully", voter: updatedVoter.toJSON() });
  } catch (err) {
    console.error("Update voter error:", err);
    next(new HttpError("Update failed", 500));
  }
};

// Delete voter
exports.deleteVoter = async (req, res, next) => {
  console.log("🔥 DELETE VOTER REQ PARAMS:", req.params); // debug

  try {
    const { id } = req.params;
    if (!id) return next(new HttpError("Voter ID missing", 400));

    const voter = await Voter.findById(id);
    if (!voter) return next(new HttpError("Voter not found", 404));

    await voter.deleteOne(); // safer than remove()
    return res.status(200).json({ message: "Voter account deleted successfully" });
  } catch (err) {
    console.error("🔥 Delete voter error:", err);
    return next(new HttpError("Deletion failed", 500));
  }
};
