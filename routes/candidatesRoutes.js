const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getCandidate,
  removeCandidate,
  voteCandidate,
} = require("../controllers/candidatesController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Add a new candidate (Admin only, before election start)
router.post("/", protect, adminOnly, addCandidate);

// Get candidate details
router.get("/:id", protect, getCandidate);

// Delete a candidate (Admin only, before election start)
router.delete("/:id", protect, adminOnly, removeCandidate);

// Vote for a candidate (Voter only, during election)
router.patch("/:id/vote", protect, voteCandidate);

module.exports = router;
