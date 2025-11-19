const csv = require("csv-parser");
const fs = require("fs");
const EligibleVoter = require("../models/eligibleVoterModel");

const importCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const voters = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        voters.push({
          email: row.email.toLowerCase().trim(),
          studentID: row.studentID.trim(),
          fullName: row.fullName?.trim() || "",
          department: row.department?.trim() || "General",
          course: row.course?.trim() || "N/A",
        });
      })
      .on("end", async () => {
        try {
          await EligibleVoter.deleteMany({});
          await EligibleVoter.insertMany(voters);
          resolve(voters.length);
        } catch (err) {
          reject(err);
        }
      });
  });
};

module.exports = importCSV;
