const Election = require("../models/electionModel");
const Candidate = require("../models/candidateModel");
const Voter = require("../models/voterModel");
const HttpError = require("../models/ErrorModel");

// 📊 Get results for one election
const getElectionResults = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    const candidates = await Candidate.find({ election: electionId });
    const voters = await Voter.find({});

    const totalEligible = voters.length;
    const totalVoted = voters.filter(v => v.VotedElection?.includes(electionId)).length;

    const candidateResults = candidates.map(c => {
      const totalVotes = c.votes?.length || 0;
      const percentage = totalVoted > 0 ? ((totalVotes / totalVoted) * 100).toFixed(2) : 0;
      return {
        candidateName: c.fullName,
        totalVotes,
        percentage,
        image: c.image || "/default-candidate.png"
      };
    });

    const participationRate = totalEligible > 0 ? ((totalVoted / totalEligible) * 100).toFixed(2) : 0;

    res.status(200).json({
      electionTitle: election.title,
      date: election.date,
      totalEligible,
      totalVoted,
      participationRate,
      candidateResults,
    });
  } catch (err) {
    console.error("Error getting election results:", err);
    return next(new HttpError("Failed to fetch election results", 500));
  }
};

// 🗳️ Get summary of all elections for Admin dashboard
const getAllElectionSummaries = async (req, res, next) => {
  try {
    const elections = await Election.find({});
    const voters = await Voter.find({});

    const summaries = await Promise.all(
      elections.map(async (election) => {
        const candidates = await Candidate.find({ election: election._id });
        const totalEligible = voters.length;
        const totalVoted = voters.filter(v => v.VotedElection?.includes(election._id)).length;

        const participationRate = totalEligible > 0 ? ((totalVoted / totalEligible) * 100).toFixed(2) : 0;

        const topCandidate = candidates
          .map(c => ({
            name: c.fullName,
            votes: c.votes?.length || 0,
          }))
          .sort((a, b) => b.votes - a.votes)[0];

        return {
          id: election._id,
          title: election.title,
          date: election.date,
          totalEligible,
          totalVoted,
          participationRate,
          topCandidate: topCandidate ? topCandidate.name : "No Votes Yet",
          topVotes: topCandidate ? topCandidate.votes : 0,
        };
      })
    );

    res.status(200).json(summaries);
  } catch (err) {
    console.error("Error getting election summaries:", err);
    return next(new HttpError("Failed to fetch election summaries", 500));
  }
};

module.exports = { getElectionResults, getAllElectionSummaries };
