const mongoose = require("mongoose");
require("dotenv").config();

// Import the Question schema
require("./MODELS/Quiz/QuestionSchema");
const Question = mongoose.model("Question");

async function updateQuestionOptions() {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Find and update MCQs with specific questionOptions
    const result = await Question.updateMany(
      { 
        quizType:"fullquiz"
      },
      { 
        $set: { quizType: "course" }
      }
    );
    console.log(`${result.modifiedCount} MCQ questions updated.`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

updateQuestionOptions();
