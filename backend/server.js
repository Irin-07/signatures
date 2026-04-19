require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const signatureRoutes = require("./routes/signatureRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/api", signatureRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Reduced to start faster on fail
    connectTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed, running in fallback mode:", err.message);
  })
  .finally(() => {
    if (process.env.NODE_ENV !== "production") {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
    }
  });

module.exports = app;