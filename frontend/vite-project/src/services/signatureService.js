// src/services/signatureService.js
// ── Frontend API Service ─── Controller methods-ஐ call செய்யும் layer ──────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── METHOD 1: getLatestSignatures ────────────────────────────────────────────
// Controller: getLatestSignatures → GET /api/signatures/latest
export async function getLatestSignatures() {
  const res = await fetch(`${API_BASE}/api/signatures/latest`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data.signatures; // { "0": "data:image/png;...", ... }
}

// ── METHOD 2: saveOneSig ─────────────────────────────────────────────────────
// Controller: saveOneSig → PATCH /api/signatures/current
export async function saveOneSig(index, dataUrl) {
  const res = await fetch(`${API_BASE}/api/signatures/current`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ index, dataUrl: dataUrl || null }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

// ── METHOD 3: submitResolution ───────────────────────────────────────────────
// Controller: submitResolution → POST /api/signatures
export async function submitResolution(signatures, date, shareholderData) {
  const res = await fetch(`${API_BASE}/api/signatures`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ signatures, date, shareholderData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data; // { resolutionId, signedCount, ... }
}

// ── METHOD 4: getAllResolutions ──────────────────────────────────────────────
// Controller: getAllResolutions → GET /api/resolutions
export async function getAllResolutions() {
  const res = await fetch(`${API_BASE}/api/resolutions`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

// ── METHOD 5: getResolutionById ──────────────────────────────────────────────
// Controller: getResolutionById → GET /api/resolutions/:id
export async function getResolutionById(id) {
  const res = await fetch(`${API_BASE}/api/resolutions/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}
