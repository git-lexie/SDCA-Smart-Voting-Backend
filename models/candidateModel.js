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
    votesCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Candidate", candidateSchema);
