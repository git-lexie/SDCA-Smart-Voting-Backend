const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Candidate name is required."],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required."],
    },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    votes: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voter' 
    },
    votesCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    motto: {
       type: String, 
       default: '', 
       trim: true 
    },
  },
  { timestamps: true, versionKey: false });

  // Ensure votesCount is always updated automatically
  candidateSchema.pre('save', function(next) {
  this.votesCount = this.votes ? this.votes.length : 0;
  next();
  });

module.exports = mongoose.model("Candidate", candidateSchema);
