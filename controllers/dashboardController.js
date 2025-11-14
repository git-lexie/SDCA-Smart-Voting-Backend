const Election = require("../models/electionModel");

exports.getElectionResults = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("candidates").populate("eligibleVoters");

    const results = elections.map((e) => {
      const totalVotes = e.candidates.reduce((acc, c) => acc + c.votesCount, 0);
      const totalEligible = e.eligibleVoters.length;

      return {
        title: e.title,
        description: e.description,
        bannerUrl: e.bannerUrl,
        totalVotes,
        totalEligible,
        participationRate: totalEligible > 0 ? ((totalVotes / totalEligible) * 100).toFixed(2) : 0,
        candidates: e.candidates.map((c) => ({
          name: c.fullName,
          position: c.position,
          votes: c.votesCount,
          percentage: totalVotes > 0 ? ((c.votesCount / totalVotes) * 100).toFixed(2) : 0,
          imageUrl: c.imageUrl,
        })),
      };
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

exports.getChartData = async (req, res, next) => {
  try {
    const elections = await Election.find().populate("eligibleVoters").populate("candidates");

    const chartData = elections.map((e) => ({
      title: e.title,
      totalVotes: e.candidates.reduce((acc, c) => acc + c.votesCount, 0),
      totalEligible: e.eligibleVoters.length,
      participationRate:
        e.eligibleVoters.length > 0
          ? ((e.candidates.reduce((acc, c) => acc + c.votesCount, 0) / e.eligibleVoters.length) * 100).toFixed(2)
          : 0,
    }));

    res.json(chartData);
  } catch (err) {
    next(err);
  }
};
