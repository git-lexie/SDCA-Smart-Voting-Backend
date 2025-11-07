const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
    },
    studentID: {
      type: String,
      required: [true, "Student ID is required."],
      unique: true,
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
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    votedElections: [
      {
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
        votedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Hide password when converting to JSON
    voterSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("Voter", voterSchema);
