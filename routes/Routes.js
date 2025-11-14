const express = require("express");
const router = express.Router();
const { registerVoter, loginVoter, getVoter } = require("../controllers/voterController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const uploadRoutes = require("../routes/uploadRoutes");
const electionRoutes = require("../routes/electionRoutes");
const candidateRoutes = require("../routes/candidatesRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const resultRoutes = require("../routes/resultRoutes");

// Voter
router.post("/voters/register", registerVoter);
router.post("/voters/login", loginVoter);
router.get("/voters/:id", protect, getVoter);

// Upload CSV
router.use("/upload", protect, adminOnly, uploadRoutes);

// Elections
router.use("/elections", protect, electionRoutes);

// Candidates
router.use("/candidates", protect, candidateRoutes);

// Dashboard
router.use("/dashboard", protect, dashboardRoutes);

// Results
router.use("/results", protect, resultRoutes);

module.exports = router;
