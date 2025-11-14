const csv = require("csv-parser");
const HttpError = require("../models/errorModel");
const EligibleVoter = require("../models/eligibleVoterModel");
const stream = require("stream");

exports.uploadEligibleCsv = async (req, res, next) => {
  try {
    if (!req.file) return next(new HttpError("No file uploaded", 400));

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const rows = [];
    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        if (row.email) {
          rows.push({
            email: row.email.toLowerCase().trim(),
            studentID: row.studentID?.trim() || "",
            fullName: row.fullName?.trim() || "",
            department: row.department?.trim() || "General",
            course: row.course?.trim() || "N/A",
          });
        }
      })
      .on("end", async () => {
        await EligibleVoter.deleteMany({});
        await EligibleVoter.insertMany(rows);
        res.json({ success: true, count: rows.length });
      });
  } catch (err) {
    next(new HttpError("CSV upload failed", 500));
  }
};
