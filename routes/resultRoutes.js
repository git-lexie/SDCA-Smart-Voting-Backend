const express = require("express");
const router = express.Router();
const { getElectionResults, getAllElectionSummaries } = require("../controllers/resultController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Detailed results for a single election
router.get("/:electionId", protect, getElectionResults);

// Admin: Summary of all elections
router.get("/", protect, adminOnly, getAllElectionSummaries);

module.exports = router;
