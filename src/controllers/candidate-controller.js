const Candidate = require("../models/candidate-model");
const Election = require("../models/election-model");
const Voter = require("../models/voter-model");
const HttpError = require("../models/error-model");

// Add candidate (Admin)
exports.addCandidate = async (req, res, next) => {
  try {
    const { fullName, position, electionId, imageUrl, motto } = req.body;
    if (!fullName || !position || !electionId)
      return next(new HttpError("Fill required fields", 422));

    const election = await Election.findById(electionId);
    if (!election) return next(new HttpError("Election not found", 404));
    if (new Date() >= election.startDate) return next(new HttpError("Cannot add after election started", 403));

    const candidate = await Candidate.create({
      fullName,
      position,
      electionId,
      imageUrl: imageUrl || "",
      motto: motto || "",
    });

    res.status(201).json({ success: true, candidate });
  } catch (err) {
    next(new HttpError("Failed to add candidate", 500));
  }
};

// Get candidate
exports.getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));
    res.json(candidate);
  } catch (err) {
    next(new HttpError("Failed to get candidate", 500));
  }
};

// Remove candidate
exports.removeCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));

    const election = await Election.findById(candidate.electionId);
    if (!election) return next(new HttpError("Election not found", 404));
    if (new Date() >= election.startDate) return next(new HttpError("Cannot delete after start", 403));

    await candidate.remove();
    res.json({ success: true, message: "Candidate removed" });
  } catch (err) {
    next(new HttpError("Failed to remove candidate", 500));
  }
};

// Vote for candidate
exports.voteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));

    const election = await Election.findById(candidate.electionId).populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now < election.startDate || now > election.endDate)
      return next(new HttpError("Election not active", 403));

    const voter = req.user;
    const isEligible = election.eligibleVoters.some(v => v._id.toString() === voter._id.toString());
    if (!isEligible) return next(new HttpError("You are not eligible", 403));

    const alreadyVoted = voter.votedElections?.some(v => v.electionId.toString() === election._id.toString());
    if (alreadyVoted) return next(new HttpError("Already voted", 403));

    candidate.votesCount += 1;
    candidate.votes.push(voter._id);
    await candidate.save();

    voter.votedElections.push({ electionId: election._id, candidateId: candidate._id });
    await voter.save();

    res.json({ success: true, message: "Vote recorded" });
  } catch (err) {
    next(new HttpError("Failed to vote", 500));
  }
};
