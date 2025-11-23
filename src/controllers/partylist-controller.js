const Partylist = require("../models/party-model");
const Election = require("../models/election-model");
const HttpError = require("../models/error-model");
const cloudinary = require("../utils/cloudinary");

const path = require("path");
const fs = require("fs");

// ----------------------------
// Create Partylist (Admin Only)
// ----------------------------
exports.createPartylist = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(new HttpError("Admin only", 403));
    }

    const { title, about, electionId } = req.body;

    if (!title || !about || !electionId) {
      return next(new HttpError("Missing required fields", 422));
    }

    const election = await Election.findById(electionId);
    if (!election) return next(new HttpError("Election not found", 404));
    if (new Date() >= election.startDate) {
      return next(new HttpError("Cannot create partylist after election has started", 403));
    }

    const data = {
      title: title.trim(),
      about: about.trim(),
      electionId,
      createdBy: req.user._id,
    };

    // Upload banner if included
    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);

      const result = await cloudinary.uploader.upload(tempPath, { resource_type: "image" });
      fs.unlinkSync(tempPath);

      if (!result.secure_url) {
        return next(new HttpError("Partylist banner upload failed", 422));
      }

      data.bannerUrl = result.secure_url;
    }

    const newPartylist = await Partylist.create(data);

    res.status(201).json({
      success: true,
      message: "Partylist successfully created",
      partylist: newPartylist,
    });
  } catch (err) {
    next(new HttpError("Create Partylist failed", 500));
  }
};

// ----------------------------
// Get All Partylists Per Election
// ----------------------------
exports.getPartylists = async (req, res, next) => {
  try {
    const { electionId } = req.params;

    const partylists = await Partylist.find({ electionId });

    res.json({ success: true, partylists });
  } catch (err) {
    next(new HttpError("Failed to fetch partylist", 500));
  }
};

// ----------------------------
// Get Single Partylist
// ----------------------------
exports.getSinglePartylist = async (req, res, next) => {
  try {
    const partylist = await Partylist.findById(req.params.id);

    if (!partylist) return next(new HttpError("Partylist not found", 404));

    res.json({ success: true, partylist });
  } catch (err) {
    next(new HttpError("Failed to fetch partylist", 500));
  }
};

// ----------------------------
// Update Partylist (Admin Only)
// ----------------------------
exports.updatePartylist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partylist = await Partylist.findById(id);
    if (!partylist) return next(new HttpError("Partylist not found", 404));

    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));

    // Check election start date
    const election = await Election.findById(partylist.electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    if (new Date() >= election.startDate) {
      return next(new HttpError("Cannot update after election start", 403));
    }

    const { title, about } = req.body;

    if (title) partylist.title = title.trim();
    if (about) partylist.about = about.trim();

    // Banner update
    if (req.file) {
      const tempPath = path.join(__dirname, "..", "uploads", req.file.originalname);
      fs.writeFileSync(tempPath, req.file.buffer);

      const result = await cloudinary.uploader.upload(tempPath, { resource_type: "image" });
      fs.unlinkSync(tempPath);

      if (!result.secure_url) {
        return next(new HttpError("Partylist banner upload failed", 422));
      }

      partylist.bannerUrl = result.secure_url;
    }

    await partylist.save();

    res.json({ success: true, message: "Partylist updated", partylist });
  } catch (err) {
    next(new HttpError("Update Partylist failed", 500));
  }
};

// ----------------------------
// Delete Partylist (Admin Only)
// ----------------------------
exports.removePartylist = async (req, res, next) => {
  try {
    const partylist = await Partylist.findById(req.params.id);
    if (!partylist) return next(new HttpError("Partylist not found", 404));

    if (!req.user.isAdmin) return next(new HttpError("Admin only", 403));

    const election = await Election.findById(partylist.electionId);
    if (!election) return next(new HttpError("Election not found", 404));

    if (new Date() >= election.startDate) {
      return next(new HttpError("Cannot delete after election start", 403));
    }

    await partylist.deleteOne();

    res.json({ success: true, message: "Partylist deleted" });
  } catch (err) {
    next(new HttpError("Delete Partylist failed", 500));
  }
};
