const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const EligibleVoter = require("../models/eligibleVoterModel");
const HttpError = require("../models/ErrorModel");

const router = express.Router();

// 🗂️ Multer setup — store uploaded file in "uploads/" folder
const upload = multer({ dest: "uploads/" });

// 🧠 Route: Upload CSV of eligible voters (admin only)
router.post("/upload-eligible-voters", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new HttpError("No file uploaded.", 400));
    }

    const filePath = req.file.path;
    const voters = [];

    // Parse CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const { email, studentID, fullName } = row;
        if (email && studentID) {
          voters.push({
            email: email.toLowerCase().trim(),
            studentID: studentID.trim(),
            fullName: fullName ? fullName.trim() : "",
          });
        }
      })
      .on("end", async () => {
        try {
          // Clear old data (optional)
          await EligibleVoter.deleteMany({});
          await EligibleVoter.insertMany(voters);

          fs.unlinkSync(filePath); // delete uploaded CSV after import

          res.status(200).json({
            message: "Eligible voter list imported successfully!",
            count: voters.length,
          });
        } catch (err) {
          console.error(err);
          return next(new HttpError("Failed to import eligible voters.", 500));
        }
      });
  } catch (error) {
    console.error(error);
    return next(new HttpError("CSV upload failed.", 500));
  }
});

module.exports = router;
