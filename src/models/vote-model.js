const { Schema, model } = require("mongoose");

const voteSchema = new Schema({
  electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
  voterId: { type: Schema.Types.ObjectId, ref: "Voter", required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
  votedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = model("Vote", voteSchema);
