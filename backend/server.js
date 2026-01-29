const express = require("express");
const mongoose = require("mongoose");
const Voter = require("./models/Voter");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/manha_user")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// 1️⃣ Get all voters (or search)
app.get("/voters", async (req, res) => {
  const { q } = req.query; // search query
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

// 2️⃣ Mark voter as voted
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
