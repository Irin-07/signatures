// routes/signatureRoutes.js
const express = require("express");
const router  = express.Router();

const {
  getLatestSignatures,
  saveOneSig,
  submitResolution,
  getAllResolutions,
  getResolutionById,
  clearDraft,
} = require("../controllers/signatureController");

// ── Draft Signature Routes ───────────────────────────────────────────────────
router.get   ("/signatures/latest",  getLatestSignatures); // Page load → signatures எடு
router.patch ("/signatures/current", saveOneSig);          // Auto-save ஒவ்வொரு signature
router.delete("/signatures/draft",   clearDraft);          // Draft reset

// ── Resolution Routes ────────────────────────────────────────────────────────
router.post  ("/signatures",         submitResolution);    // Final submit
router.get   ("/resolutions",        getAllResolutions);   // எல்லா submissions
router.get   ("/resolutions/:id",    getResolutionById);   // ஒரு குறிப்பிட்ட resolution

module.exports = router;
