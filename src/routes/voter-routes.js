const express = require("express");
const router = express.Router();
const { registerVoter, loginVoter, getVoter, updateVoter, deleteVoter } = require("../controllers/voter-controller");
const { protect } = require("../middleware/auth-middleware");

// Voter routes
router.post("/register", registerVoter);
router.post("/login", loginVoter);
router.get("/:id", protect, getVoter);
router.patch("/:id", protect, updateVoter);
router.delete("/:id", protect, deleteVoter);

module.exports = router;
