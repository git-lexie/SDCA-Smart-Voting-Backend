const express = require("express");
const router = express.Router();
const { addCandidate, getCandidate, removeCandidate, voteCandidate } = require("../controllers/candidate-controller");
const { protect, adminOnly } = require("../middleware/auth-middleware");

// Candidate routes
router.post("/", protect, adminOnly, addCandidate);
router.get("/:id", protect, getCandidate);
router.delete("/:id", protect, adminOnly, removeCandidate);
router.patch("/:id/vote", protect, voteCandidate);

module.exports = router;
