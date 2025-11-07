const Election = require("../models/election.model");
const Candidate = require("../models/candidate.model");
const Voter = require("../models/voter.model");

// Dashboard: election overview
const getElectionResults = async (req, res, next) => {
  try {
    const elections = await Election.find()
      .populate("candidates")
      .populate("eligibleVoters");

    const results = elections.map((election) => {
      const totalVotes = election.votes.length;
      const totalEligible = election.eligibleVoters.length;
      const participationRate =
        totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0;

      const candidateResults = election.candidates.map((c) => ({
        name: c.fullName,
        position: c.position,
        votes: c.votesCount,
        percentage:
          totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0,
        imageUrl: c.imageUrl,
      }));

      return {
        electionTitle: election.title,
        description: election.description,
        totalVotes,
        totalEligible,
        participationRate: `${participationRate}%`,
        candidates: candidateResults,
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Dashboard chart data
const getChartData = async (req, res, next) => {
  try {
    const elections = await Election.find();
    const chartData = elections.map((election) => ({
      title: election.title,
      totalVotes: election.votes.length,
      totalEligible: election.eligibleVoters.length,
      participationRate:
        election.eligibleVoters.length > 0
          ? ((election.votes.length / election.eligibleVoters.length) * 100).toFixed(2)
          : 0,
    }));

    res.json(chartData);
  } catch (err) {
    next(err);
  }
};

module.exports = { getElectionResults, getChartData };
