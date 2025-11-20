const Election = require("../models/election-model");
const HttpError = require("../models/error-model");

exports.getElectionResults = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates");
    const results = elections.map(e => ({
      electionTitle: e.title,
      totalCandidates: e.candidates.length,
      totalVotes: e.candidates.reduce((acc, c) => acc + c.votesCount, 0),
    }));
    res.json(results);
  } catch (err) {
    next(new HttpError("Failed to fetch dashboard results", 500));
  }
};

// Example chart data
exports.getChartData = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates");
    const chart = elections.map(e => ({
      election: e.title,
      candidates: e.candidates.map(c => ({ name: c.fullName, votes: c.votesCount })),
    }));
    res.json(chart);
  } catch (err) {
    next(new HttpError("Failed to fetch chart data", 500));
  }
};
