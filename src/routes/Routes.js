const express = require("express");
const router = express.Router();

// Import sub-routes
const adminRoutes = require("./admin-routes");
const voterRoutes = require("./voter-routes");
const candidateRoutes = require("./candidate-routes");
const electionRoutes = require("./election-routes");
const uploadRoutes = require("./upload-routes");
const dashboardRoutes = require("./dashboard-routes");
const voteRoutes = require("./vote-routes");
const resultRoutes = require("./result-routes");

// Mount routes
router.use("/admin", adminRoutes);
router.use("/voters", voterRoutes);
router.use("/candidates", candidateRoutes);
router.use("/elections", electionRoutes);
router.use("/upload", uploadRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/votes", voteRoutes);
router.use("/results", resultRoutes);

module.exports = router;
