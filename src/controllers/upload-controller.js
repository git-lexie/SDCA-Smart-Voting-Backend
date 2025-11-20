const csv = require("csv-parser");
const stream = require("stream");
const HttpError = require("../models/error-model");
const EligibleVoter = require("../models/eligible-voter-model");

// Upload CSV for eligible voters
exports.uploadEligibleCsv = async (req, res, next) => {
  try {
    if (!req.file) return next(new HttpError("No file uploaded", 400));

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const rows = [];

    bufferStream
      .pipe(csv())
      .on("data", (row) => {
        try {
          if (row.email) {
            rows.push({
              email: row.email.toLowerCase().trim(),
              studentID: row.studentID?.trim() || "",
              fullName: row.fullName?.trim() || "",
              department: row.department?.trim() || "General",
              course: row.course?.trim() || "N/A",
            });
          }
        } catch (err) {
          console.error("ROW PARSE ERROR:", err);
        }
      })
      .on("error", (err) => {
        console.error("CSV STREAM ERROR:", err);
        return next(new HttpError("CSV parsing failed", 400));
      })
      .on("end", async () => {
        try {
          await EligibleVoter.deleteMany({});
          await EligibleVoter.insertMany(rows);
          res.json({ success: true, count: rows.length });
        } catch (err) {
          console.error("DB INSERT ERROR:", err);
          return next(new HttpError("Database insert failed", 500));
        }
      });
  } catch (err) {
    console.error("CSV UPLOAD ERROR:", err);
    next(new HttpError("CSV upload failed", 500));
  }
};
