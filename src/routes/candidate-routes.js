const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getCandidate,
  removeCandidate,
  voteCandidate,
  updateCandidate
} = require("../controllers/candidate-controller");
const { protect, adminOnly } = require("../middleware/auth-middleware");
const upload = require("../middleware/upload-middleware");

// Add candidate
router.post("/", protect, adminOnly, upload.single("imageUrl"), addCandidate);

// Get single candidate
router.get("/:id", protect, getCandidate);

// Remove candidate
router.delete("/:id", protect, adminOnly, removeCandidate);

// Direct voting disallowed
router.patch("/:id/vote", protect, voteCandidate);

// Update candidate
router.patch("/:id", protect, adminOnly, upload.single("imageUrl"), updateCandidate);

module.exports = router;
