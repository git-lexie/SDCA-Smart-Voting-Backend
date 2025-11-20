const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload-middleware");
const { uploadEligibleCsv } = require("../controllers/upload-controller");

// Upload eligible voters CSV
// Key in form-data: "file"
router.post("/eligible-voters", upload.single("file"), uploadEligibleCsv);

module.exports = router;
