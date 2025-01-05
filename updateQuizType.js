const mongoose = require("mongoose");
require("dotenv").config();

// Import the User schema
require("./MODELS/UserSchema");
const User = mongoose.model("User");

async function clearCoursePurchased() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Update all users to set coursePurchased as an empty array
    const result = await User.updateMany({}, { $set: { coursePurchased: [] } });
    console.log(`${result.modifiedCount} users updated with an empty coursePurchased array.`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error occurred:", error);
    // Ensure the database connection is closed in case of error
    await mongoose.disconnect();
    console.log("Database connection closed due to an error.");
  }
}

clearCoursePurchased();
