const Election = require("../models/election-model");
const Candidate = require("../models/candidate-model");
const EligibleVoter = require("../models/eligible-voter-model");
const HttpError = require("../models/error-model");
const cloudinary = require("../utils/cloudinary");

const EligibleVoter = require("../models/eligible-voter-model");
const sendEmail = require("../utils/sendEmail");

const path = require("path");
const fs = require("fs");

// Create election (Admin)
exports.createElection = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));

    const { title, description, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) return next(new HttpError("Missing required fields", 422));

    const data = {
      title,
      description: description?.trim() || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user._id,
    };

    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);
      const result = await cloudinary.uploader.upload(tempPath, { resource_type: "image" });
      fs.unlinkSync(tempPath);

      if (!result.secure_url) return next(new HttpError("Banner upload failed", 422));
      data.bannerUrl = result.secure_url;
    }

    const election = await Election.create(data);
    const eligible = await EligibleVoter.find({});
    election.eligibleVoters = eligible.map(e => e._id);
    await election.save();

    res.status(201).json({ success: true, message: "Election successfully created", election });
  } catch (err) {
    next(new HttpError("Create election failed", 500));
  }
};

// Get all elections
exports.getElections = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates");
    res.json(elections);
  } catch (err) {
    next(new HttpError("Failed to fetch elections", 500));
  }
};

// Get single election
exports.getElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).populate("candidates eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));
    res.json(election);
  } catch (err) {
    next(new HttpError("Failed to fetch election", 500));
  }
};

// Update election (Admin only, before start)
exports.updateElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return next(new HttpError("Election not found", 404));
    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));
    if (new Date() >= election.startDate) return next(new HttpError("Cannot update after start", 403));

    const { title, description, startDate, endDate } = req.body;
    if (title) election.title = title;
    if (description) election.description = description;
    if (startDate) election.startDate = new Date(startDate);
    if (endDate) election.endDate = new Date(endDate);

    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);
      const result = await cloudinary.uploader.upload(tempPath, { resource_type: "image" });
      fs.unlinkSync(tempPath);
      if (!result.secure_url) return next(new HttpError("Banner upload failed", 422));
      election.bannerUrl = result.secure_url;
    }

    await election.save();
    res.json({ success: true, message: "Election updated", election });
  } catch (err) {
    next(new HttpError("Update election failed", 500));
  }
};

// Delete election (Admin only, before start)
exports.removeElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return next(new HttpError("Election not found", 404));
    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));
    if (new Date() >= election.startDate) return next(new HttpError("Cannot delete after start", 403));

    await election.deleteOne();
    res.json({ success: true, message: "Election deleted" });
  } catch (err) {
    next(new HttpError("Delete election failed", 500));
  }
};

// Get candidates of election
exports.getCandidatesElection = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.id });
    res.json(candidates);
  } catch (err) {
    next(new HttpError("Failed to fetch candidates", 500));
  }
};

// Get eligible voters of election (Admin only)
exports.getElectionVoters = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));
    const election = await Election.findById(req.params.id).populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));
    res.json(election.eligibleVoters);
  } catch (err) {
    next(new HttpError("Failed to fetch voters", 500));
  }
};


