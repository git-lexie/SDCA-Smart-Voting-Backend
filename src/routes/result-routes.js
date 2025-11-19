const express = require("express");
const router = express.Router();
const { getElectionResults, getAllElectionSummaries } = require("../controllers/result-controller");
const { protect, adminOnly } = require("../middleware/auth-middleware");

// Election results
router.get("/:electionId", protect, getElectionResults);
router.get("/", protect, adminOnly, getAllElectionSummaries);

module.exports = router;
