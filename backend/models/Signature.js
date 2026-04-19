// models/Signature.js
const mongoose = require("mongoose");

// ── Draft Model (Auto-save while signing) ──────────────────────────────────
const DraftSchema = new mongoose.Schema({
  sessionKey: { type: String, default: "current", unique: true },
  signatures: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt:  { type: Date, default: Date.now },
});
DraftSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const Draft = mongoose.model("Draft", DraftSchema);

// ── Resolution Model (Final submitted resolution) ──────────────────────────
const ShareholderSchema = new mongoose.Schema({
  id:     { type: Number, required: true },
  name:   { type: String, required: true },
  signed: { type: Boolean, default: false },
});

const ResolutionSchema = new mongoose.Schema({
  submittedAt:       { type: Date, default: Date.now },
  dateLabel:         { type: String },
  signatures:        { type: mongoose.Schema.Types.Mixed, default: {} },
  shareholderData:   [ShareholderSchema],
  signedCount:       { type: Number, default: 0 },
  totalShareholders: { type: Number, default: 12 },
});
const Resolution = mongoose.model("Resolution", ResolutionSchema);

module.exports = { Draft, Resolution };
