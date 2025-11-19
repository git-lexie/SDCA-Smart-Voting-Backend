const { Schema, model } = require("mongoose");

const candidateSchema = new Schema({
  fullName: { type: String, required: true },
  position: { type: String, required: true },
  electionId: { type: Schema.Types.ObjectId, ref: "Election", required: true },
  votesCount: { type: Number, default: 0 },
  votes: [{ type: Schema.Types.ObjectId, ref: "Voter" }],
  imageUrl: { type: String, default: "" },
  motto: { type: String, default: "" },
}, { timestamps: true });

module.exports = model("Candidate", candidateSchema);
