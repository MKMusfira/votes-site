const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Voter = require("./models/Voter");

// ✅ Local MongoDB URI
const MONGO_URI = "mongodb://127.0.0.1:27017/manha_user";

async function importVoters() {
  try {
    // Connect to local MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Read Excel file
    const workbook = XLSX.readFile("voters_final.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data.length) {
      console.log("⚠️ Excel file is empty or not properly formatted");
      process.exit(0);
    }

    const voters = data.map(row => ({
  serial_no: row["serial_no"] || 0,             // 0 if empty
  enrollment_no: row["enrollment_no"] || "",    // empty string if missing
  name: row["name"] || "",
  polling_station: row["polling_station"] || "",
  phone: row["phone"] || "",                     // already optional
  has_voted: false
}));


    // Check for missing required fields
    const invalid = voters.filter(
      v =>
        v.serial_no === null ||
        v.enrollment_no === null ||
        v.name === null ||
        v.polling_station === null
    );

    if (invalid.length > 0) {
      console.log(
        `❌ ${invalid.length} rows have missing required fields. Fix your Excel first.`
      );
      process.exit(1);
    }

    // Delete old data & insert new
    await Voter.deleteMany({});
    await Voter.insertMany(voters);

    console.log("✅ Import successful");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
}

importVoters();
