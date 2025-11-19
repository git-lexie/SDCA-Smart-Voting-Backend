const express = require("express");
const router = express.Router();
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
} = require("../controllers/election-controller");
const { protect, adminOnly } = require("../middleware/auth-middleware");

// Election routes
router.post("/", protect, adminOnly, upload.single("banner"), createElection);
router.get("/", protect, getElections);
router.get("/:id", protect, getElection);
router.put("/:id", protect, adminOnly, upload.single("banner"), updateElection);
router.delete("/:id", protect, adminOnly, removeElection);
router.get("/:id/candidates", protect, getCandidatesElection);
router.get("/:id/voters", protect, adminOnly, getElectionVoters);

module.exports = router;
