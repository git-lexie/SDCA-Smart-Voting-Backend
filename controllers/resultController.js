const Election = require("../models/electionModel");
const Candidate = require("../models/candidatesModel");
const Voter = require("../models/voterModel");
const HttpError = require("../models/errorModel");

// Get detailed results for a single election
exports.getElectionResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId)
      .populate("eligibleVoters")
      .populate("candidates");

    if (!election) return next(new HttpError("Election not found", 404));

    const totalEligible = election.eligibleVoters.length;
    const totalVotes = election.candidates.reduce((acc, c) => acc + c.votesCount, 0);

    // Department/Course breakdown
    const deptBreakdown = {};
    const courseBreakdown = {};

    election.eligibleVoters.forEach((v) => {
      deptBreakdown[v.department] = deptBreakdown[v.department] || { eligible: 0, voted: 0 };
      deptBreakdown[v.department].eligible += 1;

      courseBreakdown[v.course] = courseBreakdown[v.course] || { eligible: 0, voted: 0 };
      courseBreakdown[v.course].eligible += 1;
    });

    election.candidates.forEach((c) => {
      c.votes.forEach((voterId) => {
        const voter = election.eligibleVoters.find((v) => v._id.toString() === voterId.toString());
        if (voter) {
          deptBreakdown[voter.department].voted += 1;
          courseBreakdown[voter.course].voted += 1;
        }
      });
    });

    const candidateResults = election.candidates.map((c) => ({
      name: c.fullName,
      votes: c.votesCount,
      percentage: totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0,
    }));

    res.json({
      electionTitle: election.title,
      totalEligible,
      totalVotes,
      participationRate: totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0,
      candidateResults,
      departmentBreakdown: deptBreakdown,
      courseBreakdown: courseBreakdown,
    });
  } catch (err) {
    next(new HttpError("Failed to fetch election results", 500));
  }
};

// Admin: summary of all elections
exports.getAllElectionSummaries = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates").populate("eligibleVoters");

    const summaries = elections.map((election) => {
      const totalVotes = election.candidates.reduce((acc, c) => acc + c.votesCount, 0);
      const totalEligible = election.eligibleVoters.length;
      const topCandidate = election.candidates.sort((a, b) => b.votesCount - a.votesCount)[0];

      return {
        id: election._id,
        title: election.title,
        totalEligible,
        totalVotes,
        participationRate: totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0,
        topCandidate: topCandidate ? topCandidate.fullName : "No votes yet",
        topVotes: topCandidate ? topCandidate.votesCount : 0,
      };
    });

    res.json(summaries);
  } catch (err) {
    next(new HttpError("Failed to fetch election summaries", 500));
  }
};
