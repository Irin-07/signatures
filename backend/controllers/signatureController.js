// controllers/signatureController.js
const { Draft, Resolution } = require("../models/Signature");

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 1: getLatestSignatures
// GET /api/signatures/latest
// Frontend load ஆகும்போது existing draft signatures எடுத்து return செய்யும்
// ─────────────────────────────────────────────────────────────────────────────
const getLatestSignatures = async (req, res) => {
  try {
    const draft = await Draft.findOne({ sessionKey: "current" });

    if (!draft) {
      return res.status(200).json({
        success: true,
        source:  "empty",
        data:    { signatures: {} },
      });
    }

    return res.status(200).json({
      success: true,
      source:  "mongodb",
      data:    { signatures: draft.signatures },
    });

  } catch (error) {
    console.error("[getLatestSignatures] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 2: saveOneSig
// PATCH /api/signatures/current
// ஒவ்வொரு shareholder sign பண்ணும்போது உடனே MongoDB-ல் auto-save செய்யும்
// Body: { index: Number, dataUrl: String | null }
// ─────────────────────────────────────────────────────────────────────────────
const saveOneSig = async (req, res) => {
  const { index, dataUrl } = req.body;

  if (index === undefined || index === null) {
    return res.status(400).json({ success: false, error: "index is required" });
  }

  try {
    // Draft இல்லாவிட்டால் புதியது உருவாக்கு
    let draft = await Draft.findOne({ sessionKey: "current" });
    if (!draft) {
      draft = new Draft({ sessionKey: "current", signatures: {} });
    }

    // Spread செய்து மாற்று (Mixed type-க்கு markModified தேவை)
    const updated = { ...draft.signatures };
    if (dataUrl) {
      updated[String(index)] = dataUrl;   // signature save
    } else {
      delete updated[String(index)];      // signature delete (clear)
    }

    draft.signatures = updated;
    draft.markModified("signatures");
    await draft.save();

    return res.status(200).json({
      success: true,
      message: dataUrl ? "Signature saved" : "Signature cleared",
      index:   String(index),
    });

  } catch (error) {
    console.error("[saveOneSig] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 3: submitResolution
// POST /api/signatures
// "SUBMIT RESOLUTION" button click → final resolution MongoDB-ல் store செய்யும்
// Draft-ஐ delete செய்யும்
// Body: { signatures, date, shareholderData }
// ─────────────────────────────────────────────────────────────────────────────
const submitResolution = async (req, res) => {
  const { signatures = {}, date, shareholderData = [] } = req.body;

  if (!date) {
    return res.status(400).json({ success: false, error: "date is required" });
  }

  try {
    // புதிய Resolution document உருவாக்கு
    const resolution = new Resolution({
      dateLabel:         date,
      signatures:        signatures,
      shareholderData:   shareholderData,
      signedCount:       Object.keys(signatures).length,
      totalShareholders: shareholderData.length || 12,
    });

    await resolution.save();

    // Submit ஆனவுடன் draft delete செய்
    await Draft.deleteOne({ sessionKey: "current" });

    console.log(
      `[submitResolution] Saved — ID: ${resolution._id} | ` +
      `Signed: ${resolution.signedCount}/${resolution.totalShareholders}`
    );

    return res.status(201).json({
      success:       true,
      storedInMongo: true,
      resolutionId:  resolution._id,
      signedCount:   resolution.signedCount,
      message:       "Resolution stored in MongoDB Atlas",
    });

  } catch (error) {
    console.error("[submitResolution] Error:", error.message);
    return res.status(500).json({ success: false, storedInMongo: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 4: getAllResolutions
// GET /api/resolutions
// Submit ஆன எல்லா resolutions-ஐயும் list செய்யும் (admin view)
// signatures field-ஐ exclude செய்யும் (data size குறைக்க)
// ─────────────────────────────────────────────────────────────────────────────
const getAllResolutions = async (req, res) => {
  try {
    const resolutions = await Resolution
      .find({}, "-signatures")       // signatures தவிர மற்றவை
      .sort({ submittedAt: -1 });    // latest first

    return res.status(200).json({
      success: true,
      count:   resolutions.length,
      data:    resolutions,
    });

  } catch (error) {
    console.error("[getAllResolutions] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 5: getResolutionById
// GET /api/resolutions/:id
// குறிப்பிட்ட resolution-ஐ signatures உட்பட முழுதாக எடுக்கும்
// ─────────────────────────────────────────────────────────────────────────────
const getResolutionById = async (req, res) => {
  const { id } = req.params;

  try {
    const resolution = await Resolution.findById(id);

    if (!resolution) {
      return res.status(404).json({ success: false, error: "Resolution not found" });
    }

    return res.status(200).json({ success: true, data: resolution });

  } catch (error) {
    console.error("[getResolutionById] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METHOD 6: clearDraft
// DELETE /api/signatures/draft
// Draft-ஐ manually reset செய்ய (optional utility)
// ─────────────────────────────────────────────────────────────────────────────
const clearDraft = async (req, res) => {
  try {
    await Draft.deleteOne({ sessionKey: "current" });
    return res.status(200).json({ success: true, message: "Draft cleared" });
  } catch (error) {
    console.error("[clearDraft] Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getLatestSignatures,
  saveOneSig,
  submitResolution,
  getAllResolutions,
  getResolutionById,
  clearDraft,
};
