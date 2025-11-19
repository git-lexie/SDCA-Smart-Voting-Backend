const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadEligibleCsv } = require("../controllers/upload-controller");

const upload = multer({ storage: multer.memoryStorage() });

// CSV upload
router.post("/eligible-voters", upload.single("file"), uploadEligibleCsv);

module.exports = router;
