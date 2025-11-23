const { Schema, model } = require("mongoose");

const voterSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentID: { type: String, default: "" },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  department: { type: String, default: "General" },
  course: { type: String, default: "N/A" },
  votedElections: [
    {
      electionId: { type: Schema.Types.ObjectId, ref: "Election" },
      candidateId: { type: Schema.Types.ObjectId, ref: "Candidate" },
      votedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

voterSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = model("Voter", voterSchema);
