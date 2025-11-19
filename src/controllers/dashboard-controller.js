const Election = require("../models/election-model");
const HttpError = require("../models/error-model");

// Dashboard: Detailed results of all elections for a voter
exports.getElectionResults = async (req, res, next) => {
  try {
    const elections = await Election.find()
      .populate("candidates")
      .populate("eligibleVoters");

    const results = elections.map((election) => {
      const totalVotes = election.candidates.reduce((acc, c) => acc + c.votesCount, 0);
      const totalEligible = election.eligibleVoters.length;
      const participationRate = totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0;

      const candidateResults = election.candidates.map(c => ({
        name: c.fullName,
        votes: c.votesCount,
        percentage: totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0
      }));

      return {
        electionId: election._id,
        title: election.title,
        totalVotes,
        totalEligible,
        participationRate,
        candidateResults
      };
    });

    res.json(results);
  } catch (err) {
    next(new HttpError("Failed to fetch dashboard data", 500));
  }
};

// Chart data (optional, for analytics)
exports.getChartData = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates");

    const data = elections.map(e => {
      return {
        title: e.title,
        candidates: e.candidates.map(c => ({ name: c.fullName, votes: c.votesCount })),
      };
    });

    res.json(data);
  } catch (err) {
    next(new HttpError("Failed to fetch chart data", 500));
  }
};
