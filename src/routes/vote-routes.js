const express = require("express");
const router = express.Router();
const { castVote, getRealtimeVotes, getElectionSummary } = require("../controllers/vote-controller");
const { protect } = require("../middleware/auth-middleware");

// Vote routes
router.post("/", protect, castVote);
router.get("/:electionId/realtime", protect, getRealtimeVotes);
router.get("/:electionId/summary", protect, getElectionSummary);

module.exports = router;
