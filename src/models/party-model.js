const mongoose = require("mongoose");

const PartylistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    about: {
      type: String,
      required: true,
      trim: true,
    },

    bannerUrl: {
      type: String,
      default: "",
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partylist", PartylistSchema);
