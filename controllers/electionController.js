const Election = require("../models/electionModel");
const Candidate = require("../models/candidatesModel");
const EligibleVoter = require("../models/eligibleVoterModel");
const HttpError = require("../models/errorModel");
const cloudinary = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");

// ✅ Create a new election (Admin only)
const createElection = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) {
      return next(new HttpError("Only admin can create elections", 403));
    }

    const { title, description, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) {
      return next(new HttpError("Missing required fields", 422));
    }

    const data = {
      title,
      description: description?.trim() || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user._id,
    };

    // Handle banner upload if provided
    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);

      const result = await cloudinary.uploader.upload(tempPath, {
        resource_type: "image",
      });

      fs.unlinkSync(tempPath);

      if (!result.secure_url) {
        return next(new HttpError("Banner upload failed", 422));
      }

      data.bannerUrl = result.secure_url;
    }

    const election = await Election.create(data);

    // Attach all eligible voters to this election
    const eligible = await EligibleVoter.find({});
    election.eligibleVoters = eligible.map((e) => e._id);
    await election.save();

    res.status(201).json({
      success: true,
      message: "Election created successfully",
      election,
    });
  } catch (err) {
    console.error(err);
    next(new HttpError("Create election failed", 500));
  }
};

// ✅ Get all elections
const getElections = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates");
    res.status(200).json(elections);
  } catch (err) {
    next(new HttpError("Failed to fetch elections", 500));
  }
};

// ✅ Get single election by ID
const getElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate("candidates")
      .populate("eligibleVoters");

    if (!election) return next(new HttpError("Election not found", 404));
    res.status(200).json(election);
  } catch (err) {
    next(new HttpError("Failed to fetch election", 500));
  }
};

// ✅ Update election (Admin only, only before start date)
const updateElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return next(new HttpError("Election not found", 404));

    if (!req.user?.isAdmin) return next(new HttpError("Admin access required", 403));

    if (new Date() >= election.startDate) {
      return next(new HttpError("Cannot update election after it has started", 403));
    }

    const { title, description, startDate, endDate } = req.body;

    if (title) election.title = title;
    if (description) election.description = description;
    if (startDate) election.startDate = new Date(startDate);
    if (endDate) election.endDate = new Date(endDate);

    // Handle banner upload if provided
    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);

      const result = await cloudinary.uploader.upload(tempPath, { resource_type: "image" });
      fs.unlinkSync(tempPath);

      if (!result.secure_url) return next(new HttpError("Banner upload failed", 422));

      election.bannerUrl = result.secure_url;
    }

    await election.save();
    res.status(200).json({ success: true, message: "Election updated", election });
  } catch (err) {
    console.error(err);
    next(new HttpError("Update election failed", 500));
  }
};

// ✅ Delete election (Admin only, only before start date)
const removeElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return next(new HttpError("Election not found", 404));

    if (!req.user?.isAdmin) return next(new HttpError("Admin access required", 403));

    if (new Date() >= election.startDate) {
      return next(new HttpError("Cannot delete election after it has started", 403));
    }

    await election.deleteOne();
    res.status(200).json({ success: true, message: "Election deleted" });
  } catch (err) {
    next(new HttpError("Delete election failed", 500));
  }
};

// ✅ Get candidates of a specific election
const getCandidatesElection = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.id });
    res.status(200).json(candidates);
  } catch (err) {
    next(new HttpError("Failed to fetch candidates", 500));
  }
};

// ✅ Get eligible voters of a specific election (Admin only)
const getElectionVoters = async (req, res, next) => {
  try {
    if (!req.user?.isAdmin) return next(new HttpError("Admin access required", 403));

    const election = await Election.findById(req.params.id).populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    res.status(200).json(election.eligibleVoters);
  } catch (err) {
    next(new HttpError("Failed to fetch voters", 500));
  }
};

module.exports = {
  createElection,
  getElections,
  getElection,
  updateElection,
  removeElection,
  getCandidatesElection,
  getElectionVoters,
};
