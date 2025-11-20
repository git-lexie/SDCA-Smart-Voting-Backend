const Vote = require("../models/vote-model");
const Election = require("../models/election-model");
const HttpError = require("../models/error-model");

// Cast vote
exports.castVote = async (req, res, next) => {
  try {
    const { electionId, candidateId } = req.body;
    const voter = req.user;

    const election = await Election.findById(electionId).populate("eligibleVoters candidates");
    if (!election) return next(new HttpError("Election not found", 404));

    const now = new Date();
    if (now < election.startDate || now > election.endDate) return next(new HttpError("Election not active", 403));

    const isEligible = election.eligibleVoters.some(v => v._id.toString() === voter._id.toString());
    if (!isEligible) return next(new HttpError("You are not eligible", 403));

    const alreadyVoted = await Vote.findOne({ electionId, voterId: voter._id });
    if (alreadyVoted) return next(new HttpError("You have already voted", 403));

    const candidate = election.candidates.find(c => c._id.toString() === candidateId);
    if (!candidate) return next(new HttpError("Candidate not found", 404));

    const vote = await Vote.create({ electionId, candidateId, voterId: voter._id });
    candidate.votesCount += 1;
    candidate.votes.push(voter._id);
    await candidate.save();

    res.json({ success: true, message: "Vote recorded", vote });
  } catch (err) {
    next(new HttpError("Voting failed", 500));
  }
};

// Get realtime votes
exports.getRealtimeVotes = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate("candidates eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const totalEligible = election.eligibleVoters.length;
    const totalVotes = election.candidates.reduce((acc, c) => acc + c.votesCount, 0);
    const candidateResults = election.candidates.map(c => ({
      name: c.fullName,
      votes: c.votesCount,
      percentage: totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0
    }));

    const votedIds = await Vote.find({ electionId }).distinct("voterId");
    const participation = totalEligible > 0 ? ((votedIds.length / totalEligible) * 100).toFixed(2) : 0;

    res.json({
      electionTitle: election.title,
      totalVotes,
      totalEligible,
      participationRate: participation,
      candidateResults,
      votedVoters: votedIds,
    });
  } catch (err) {
    next(new HttpError("Failed to fetch realtime votes", 500));
  }
};

// Get election summary
exports.getElectionSummary = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId).populate("candidates eligibleVoters");
    if (!election) return next(new HttpError("Election not found", 404));

    const totalEligible = election.eligibleVoters.length;
    const totalVotes = election.candidates.reduce((acc, c) => acc + c.votesCount, 0);

    const candidateResults = election.candidates.map(c => ({
      name: c.fullName,
      votes: c.votesCount,
      percentage: totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    const topCandidate = election.candidates.sort((a, b) => b.votesCount - a.votesCount)[0];

    res.json({
      electionTitle: election.title,
      totalVotes,
      totalEligible,
      participationRate: totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0,
      candidateResults,
      winner: topCandidate ? topCandidate.fullName : "No votes",
      winnerVotes: topCandidate ? topCandidate.votesCount : 0,
    });
  } catch (err) {
    next(new HttpError("Failed to fetch election summary", 500));
  }
};
