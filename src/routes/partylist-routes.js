const express = require("express");
const router = express.Router();

const {
  createPartylist,
  getPartylists,
  getSinglePartylist,
  updatePartylist,
  removePartylist,
} = require("../controllers/partylist-controller");

const authMiddleware = require("../middleware/auth-middleware");
const upload = require("../middleware/multer");

// ------------------------------
// PARTYLIST ROUTES
// ------------------------------

// Create partylist (Admin only)
router.post(
  "/create",
  authMiddleware,
  upload.single("banner"),
  createPartylist
);

// Get all partylists of an election
router.get("/election/:electionId", getPartylists);

// Get single partylist
router.get("/:id", getSinglePartylist);

// Update partylist (Admin only)
router.put(
  "/:id",
  authMiddleware,
  upload.single("banner"),
  updatePartylist
);

// Delete partylist (Admin only)
router.delete("/:id", authMiddleware, removePartylist);

module.exports = router;
