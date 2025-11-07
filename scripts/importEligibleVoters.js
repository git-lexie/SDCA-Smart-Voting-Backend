// Import required modules
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const EligibleVoter = require("../models/eligibleVoterModel");

// Load environment variables (for MONGO_URL)
dotenv.config();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Path to CSV file
const csvFilePath = path.join(__dirname, "../eligible_voters.csv");

// Function to import voters
const importEligibleVoters = async () => {
  try {
    const voters = [];

    // Parse CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        // Expect CSV columns: email, studentID, fullName
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
          console.log(`${voters.length} records read from CSV.`);

          // Optional: Clear existing list before reimport
          await EligibleVoter.deleteMany({});
          console.log("Old eligible voter list cleared.");

          // Insert new data
          await EligibleVoter.insertMany(voters);
          console.log("Eligible voter list imported successfully!");

          process.exit(0);
        } catch (err) {
          console.error("Import failed:", err.message);
          process.exit(1);
        }
      });
  } catch (error) {
    console.error("Unexpected Error:", error.message);
    process.exit(1);
  }
};

importEligibleVoters();


// sample csv format
// email,studentID,fullName
// edel@sdca.edu.ph,2020202020,Edel Naag
// marlon@sdca.edu.ph,202302146,Marlon Elexie Aguilar
// admin@sdca.edu.ph,0000,Admin User


//run this in terminal
// node scripts/importEligibleVoters.js