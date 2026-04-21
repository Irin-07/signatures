const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const signatureRoutes = require("./routes/signatureRoutes");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/api", signatureRoutes);

app.get("/api/health", (req, res) => {
  try {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const connectionState = mongoose.connection ? states[mongoose.connection.readyState] : "unknown";
    res.json({ status: "ok", database: connectionState });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));
} else if (!process.env.MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI is not defined in environment variables");
}

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
}

module.exports = app;