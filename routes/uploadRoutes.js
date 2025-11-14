const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadEligibleCsv } = require("../controllers/uploadController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/eligible-voters", upload.single("file"), uploadEligibleCsv);

module.exports = router;
