const express = require("express");
const router = express.Router();

//routers
const voterRoutes = require("./voter-routes");
const electionRoutes = require("./election-routes");
const candidateRoutes = require("./candidate-routes");
const uploadRoutes = require("./upload-routes");
const dashboardRoutes = require("./dashboard-routes");
const resultRoutes = require("./result-routes");
const voteRoutes = require("./vote-routes");

router.use("/voters", voterRoutes);
router.use("/upload", uploadRoutes);
router.use("/elections", electionRoutes);
router.use("/candidates", candidateRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/results", resultRoutes);
router.use("/votes", voteRoutes);

module.exports = router;
