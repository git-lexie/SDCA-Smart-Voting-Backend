const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    bannerUrl: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["upcoming", "ongoing", "ended"], default: "upcoming" },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
    eligibleVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voter" }],
    votes: [
      {
        voterId: { type: mongoose.Schema.Types.ObjectId, ref: "Voter" },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Voter", required: true },
  },
  { timestamps: true }
);

electionSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.startDate) this.status = "upcoming";
  else if (now >= this.startDate && now <= this.endDate) this.status = "ongoing";
  else this.status = "ended";
  next();
});

module.exports = mongoose.model("Election", electionSchema);
