const mongoose = require("mongoose");
const Candidate = require("../models/candidate-model");
const Election = require("../models/election-model");
const HttpError = require("../models/error-model");
const cloudinary = require("../utils/cloudinary");

// Add candidate (Admin only)
exports.addCandidate = async (req, res, next) => {
  try {
    console.log("🔥 BODY:", req.body);
    console.log("🔥 FILE:", req.file);

    const { firstName, lastName, position, electionId, motto } = req.body;

    if (!firstName || !lastName || !position || !electionId) {
      return next(new HttpError("Missing required fields", 422));
    }

    if (!mongoose.Types.ObjectId.isValid(electionId)) {
      return next(new HttpError("Invalid election ID format", 422));
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    let imageUrl = "";

    // Upload image to Cloudinary if file exists
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "sdca_candidates" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const data = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      position: String(position).trim(),
      electionId,
      motto: motto || "",
      imageUrl,
    };

    const candidate = await Candidate.create(data);

    // Link candidate to election
    election.candidates.push(candidate._id);
    await election.save();

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidate,
    });
  } catch (err) {
    console.error("🔥 ERROR IN ADD CANDIDATE:", err);
    return next(new HttpError("Add candidate failed", 500));
  }
};

// Get single candidate
exports.getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));
    res.status(200).json({ success: true, candidate });
  } catch (err) {
    console.error("🔥 GET CANDIDATE ERROR:", err);
    next(new HttpError("Failed to fetch candidate", 500));
  }
};

// Remove candidate
exports.removeCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));
    await candidate.deleteOne();
    res.status(200).json({ success: true, message: "Candidate removed" });
  } catch (err) {
    console.error("🔥 REMOVE CANDIDATE ERROR:", err);
    next(new HttpError("Failed to remove candidate", 500));
  }
};

// Disallow direct voting here
exports.voteCandidate = (req, res, next) => {
  return next(new HttpError("Use /votes endpoint to cast vote", 400));
};

// ================================
// UPDATE CANDIDATE (Admin only)
// ================================
exports.updateCandidate = async (req, res, next) => {
  try {
    const { firstName, lastName, position, motto } = req.body;
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) return next(new HttpError("Candidate not found", 404));

    // Update basic fields
    if (firstName) candidate.firstName = String(firstName).trim();
    if (lastName) candidate.lastName = String(lastName).trim();
    if (position) candidate.position = String(position).trim();
    if (motto) candidate.motto = String(motto).trim();

    // Update image if file is provided
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "sdca_candidates" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
      candidate.imageUrl = imageUrl;
    }

    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (err) {
    console.error("🔥 UPDATE CANDIDATE ERROR:", err);
    return next(new HttpError("Update candidate failed", 500));
  }
};
