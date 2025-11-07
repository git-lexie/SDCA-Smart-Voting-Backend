const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Election title is required."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
    ],
    eligibleVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voter",
      },
    ],
    votes: [
      {
        voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter" },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Election", electionSchema);
