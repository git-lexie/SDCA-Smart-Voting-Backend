const mongoose = require("mongoose");

const eligibleVoterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  studentID: {
    type: String,
    required: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: false, // Optional, if you have names in your voter list
  },
  department: { 
    type: String, 
    default: 'General', 
    trim: true 
  },
  course: { 
    type: String, 
    default: 'N/A', 
    trim: true 
  },
  }, 
  { timestamps: true, versionKey: false });


module.exports = mongoose.model("EligibleVoter", eligibleVoterSchema);
