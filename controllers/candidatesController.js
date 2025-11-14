const Candidate = require("../models/candidatesModel");
const Election = require("../models/electionModel");
const Voter = require("../models/voterModel");
const HttpError = require("../models/errorModel");

// Add a new candidate (Admin only, before election starts)
const addCandidate = async (req, res, next) => {
  try {
    const { fullName, position, electionId, imageUrl, motto } = req.body;

    if (!fullName || !position || !electionId) {
      return next(new HttpError("Fill all required fields", 422));
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now >= election.startDate) {
      return next(new HttpError("Cannot add candidates after election started", 403));
    }

    const candidate = await Candidate.create({
      fullName,
      position,
      electionId,
      imageUrl: imageUrl || "",
      motto: motto || "",
    });

    res.status(201).json({ success: true, candidate });
  } catch (err) {
    console.error(err);
    next(new HttpError("Failed to add candidate", 500));
  }
};

// Get candidate details
const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));
    res.json({ success: true, candidate });
  } catch (err) {
    console.error(err);
    next(new HttpError("Failed to get candidate", 500));
  }
};

// Remove candidate (Admin only, before election starts)
const removeCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));

    const election = await Election.findById(candidate.electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now >= election.startDate) {
      return next(new HttpError("Cannot delete candidates after election started", 403));
    }

    await candidate.remove();
    res.json({ success: true, message: "Candidate removed" });
  } catch (err) {
    console.error(err);
    next(new HttpError("Failed to remove candidate", 500));
  }
};

// Vote for a candidate (Voter only, during ongoing election)
const voteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return next(new HttpError("Candidate not found", 404));

    const election = await Election.findById(candidate.electionId).populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return next(new HttpError("Election is not active", 403));
    }

    const voter = req.user;

    // Check if voter is eligible
    const isEligible = election.eligibleVoters.some(v => v.toString() === voter._id.toString());
    if (!isEligible) return next(new HttpError("You are not eligible to vote in this election", 403));

    // Check if already voted
    const alreadyVoted = voter.votedElections?.some(v => v.electionId.toString() === election._id.toString());
    if (alreadyVoted) return next(new HttpError("You already voted in this election", 403));

    // Record vote
    candidate.votesCount += 1;
    await candidate.save();

    voter.votedElections.push({ electionId: election._id, candidateId: candidate._id });
    await voter.save();

    res.json({ success: true, message: "Vote recorded" });
  } catch (err) {
    console.error(err);
    next(new HttpError("Failed to vote", 500));
  }
};

module.exports = { addCandidate, getCandidate, removeCandidate, voteCandidate };
