require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Voter = require("./models/Voter");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err.message));

// ===== VOTERS API ===== //

// Get all voters (with optional search)
app.get("/voters", async (req, res) => {
  const { q } = req.query;
  let filter = {};
  if (q) {
    filter = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { enrollment_no: { $regex: q, $options: "i" } }
      ]
    };
  }
  const voters = await Voter.find(filter).limit(500);
  res.json(voters);
});

// Mark voter as voted
app.post("/voters/:id/vote", async (req, res) => {
  try {
    const voter = await Voter.findByIdAndUpdate(
      req.params.id,
      { has_voted: true },
      { new: true }
    );
    res.json(voter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SERVE REACT FRONTEND ===== //
const buildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ===== START SERVER ===== //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
