const Vote = require("../models/vote-model");
const Election = require("../models/election-model");
const Candidate = require("../models/candidate-model");
const Voter = require("../models/voter-model");
const HttpError = require("../models/error-model");

// Cast vote
exports.castVote = async (req, res, next) => {
  try {
    const { electionId, candidateId } = req.body;
    const voter = req.user;

    const election = await Election.findById(electionId).populate("eligibleVoters").populate("candidates");
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now < election.startDate || now > election.endDate)
      return next(new HttpError("Election not active", 403));

    const isEligible = election.eligibleVoters.some(v => v._id.toString() === voter._id.toString());
    if (!isEligible) return next(new HttpError("You are not eligible", 403));

    const alreadyVoted = await Vote.findOne({ electionId, voterId: voter._id });
    if (alreadyVoted) return next(new HttpError("Already voted", 403));

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.electionId.toString() !== electionId)
      return next(new HttpError("Candidate not valid for this election", 422));

    // Create vote
    const vote = await Vote.create({ electionId, candidateId, voterId: voter._id });

    // Update candidate votesCount
    candidate.votesCount += 1;
    candidate.votes.push(voter._id);
    await candidate.save();

    res.json({ success: true, message: "Vote recorded", vote });
  } catch (err) {
    next(new HttpError("Failed to cast vote", 500));
  }
};

// Realtime votes (all votes cast so far in the election)
exports.realtimeVotes = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;

    const election = await Election.findById(electionId).populate("candidates").populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const votes = await Vote.find({ electionId }).populate("voterId").populate("candidateId");

    // Participation
    const participation = {
      totalEligible: election.eligibleVoters.length,
      totalVoted: votes.length,
      percentage: election.eligibleVoters.length
        ? ((votes.length / election.eligibleVoters.length) * 100).toFixed(2)
        : 0,
    };

    // Candidate votes
    const candidateResults = election.candidates.map(c => {
      const voteCount = votes.filter(v => v.candidateId._id.toString() === c._id.toString()).length;
      return {
        candidate: c.fullName,
        votes: voteCount,
        percentage: votes.length ? ((voteCount / votes.length) * 100).toFixed(2) : 0,
      };
    });

    // Voter details (who voted)
    const voterList = votes.map(v => ({
      voter: v.voterId.fullName,
      candidate: v.candidateId.fullName,
      votedAt: v.votedAt,
    }));

    res.json({ participation, candidateResults, voterList });
  } catch (err) {
    next(new HttpError("Failed to fetch realtime votes", 500));
  }
};

// Final summary (after election ends)
exports.finalSummary = async (req, res, next) => {
  try {
    const electionId = req.params.electionId;

    const election = await Election.findById(electionId).populate("candidates").populate("eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const votes = await Vote.find({ electionId });

    // Candidate results
    const candidateResults = election.candidates.map(c => {
      const voteCount = votes.filter(v => v.candidateId.toString() === c._id.toString()).length;
      return {
        candidate: c.fullName,
        votes: voteCount,
        percentage: votes.length ? ((voteCount / votes.length) * 100).toFixed(2) : 0,
      };
    });

    // Top candidate
    const topCandidate = candidateResults.sort((a, b) => b.votes - a.votes)[0] || null;

    const participation = {
      totalEligible: election.eligibleVoters.length,
      totalVoted: votes.length,
      percentage: election.eligibleVoters.length
        ? ((votes.length / election.eligibleVoters.length) * 100).toFixed(2)
        : 0,
    };

    res.json({ election: election.title, participation, candidateResults, winner: topCandidate });
  } catch (err) {
    next(new HttpError("Failed to fetch final summary", 500));
  }
};
