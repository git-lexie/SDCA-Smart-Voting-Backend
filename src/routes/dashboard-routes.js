const express = require("express");
const router = express.Router();
const { getElectionResults, getChartData } = require("../controllers/dashboard-controller");
const { protect } = require("../middleware/auth-middleware");

// Dashboard results
router.get("/results", protect, getElectionResults);
router.get("/charts", protect, getChartData);

module.exports = router;
