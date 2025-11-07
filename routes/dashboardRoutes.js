const express = require("express");
const router = express.Router();
const {
  getElectionResults,
  getChartData,
} = require("../controllers/dashboard.controller");

// Results page per election
router.get("/results", getElectionResults);

// Chart data: participation vs eligible voters
router.get("/charts", getChartData);

module.exports = router;
