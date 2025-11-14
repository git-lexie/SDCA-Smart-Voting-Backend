const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  createElection,
  getElections,
  getElection,
  updateElection,
  removeElection,
  getCandidatesElection,
  getElectionVoters,
} = require("../controllers/electionController");

// Create a new election (Admin only)
router.post("/", protect, adminOnly, upload.single("banner"), createElection);

// Get all elections
router.get("/", protect, getElections);

// Get single election by ID
router.get("/:id", protect, getElection);

// Update election (Admin only, only before start date)
router.put("/:id", protect, adminOnly, upload.single("banner"), updateElection);

// Delete election (Admin only, only before start date)
router.delete("/:id", protect, adminOnly, removeElection);

// Get candidates of an election
router.get("/:id/candidates", protect, getCandidatesElection);

// Get eligible voters of an election
router.get("/:id/voters", protect, adminOnly, getElectionVoters);

module.exports = router;
