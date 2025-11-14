const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  addElection,
  getElections,
  getElection,
  updateElection,
  removeElection,
  getCandidatesElection,
  getElectionVoters
} = require("../controllers/electionController");

const {
  addCandidate,
  getCandidate,
  removeCandidate,
  voteCandidate
} = require("../controllers/candidateController");

// 🔹 Election routes
router.post("/elections", protect, adminOnly, addElection);
router.get("/elections", protect, adminOnly, getElections);
router.get("/elections/:id", protect, adminOnly, getElection);
router.patch("/elections/:id", protect, adminOnly, updateElection);
router.delete("/elections/:id", protect, adminOnly, removeElection);
router.get("/elections/:id/candidates", protect, adminOnly, getCandidatesElection);
router.get("/elections/:id/voters", protect, adminOnly, getElectionVoters);

// 🔹 Candidate routes
router.post("/candidates", protect, adminOnly, addCandidate);
router.get("/candidates/:id", protect, adminOnly, getCandidate);
router.delete("/candidates/:id", protect, adminOnly, removeCandidate);
router.patch("/candidates/:id/vote", protect, voteCandidate); // Admin can record vote (optional)

module.exports = router;
