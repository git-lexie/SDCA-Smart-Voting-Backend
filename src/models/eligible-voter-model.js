const { Schema, model } = require("mongoose");

const eligibleVoterSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  studentID: { type: String, default: "" },
  fullName: { type: String, default: "" },
  department: { type: String, default: "General" },
  course: { type: String, default: "N/A" },
}, { timestamps: true });

module.exports = model("EligibleVoter", eligibleVoterSchema);
