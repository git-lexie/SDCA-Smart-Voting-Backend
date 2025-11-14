const express = require("express");
const router = express.Router();
const { getElectionResults, getChartData } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// Dashboard results overview
router.get("/results", protect, getElectionResults);

// Chart data for participation
router.get("/charts", protect, getChartData);

module.exports = router;
