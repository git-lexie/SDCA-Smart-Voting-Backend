const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth-middleware");
const { castVote, realtimeVotes, finalSummary } = require("../controllers/vote-controller");

// Cast vote
router.post("/", protect, castVote);

// Realtime results
router.get("/:electionId/realtime", protect, realtimeVotes);

// Final summary
router.get("/:electionId/final", protect, finalSummary);

module.exports = router;
