const express = require("express");
const router = express.Router();
const { getElectionResults, getAllElectionSummaries } = require("../controllers/resultController");

// Get detailed results for a single election
router.get("/:electionId", getElectionResults);

// Get summary of all elections (admin)
router.get("/", getAllElectionSummaries);

module.exports = router;
