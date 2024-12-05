const mongoose = require("mongoose");
require("dotenv").config();

// Import the Question schema
require("./MODELS/Quiz/QuestionSchema");
const Question = mongoose.model("Question");

async function updateQuestionMarks() {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to database");

    // Update for "MCQ"
    const mcqResult = await Question.updateMany(
      { questionType: "MCQ" },
      { $set: { questionMarks: 4, questionNegativeMarks: -1 } }
    );
    console.log(`${mcqResult.modifiedCount} MCQ questions updated.`);

    // Update for "Short Answer"
    const shortAnswerResult = await Question.updateMany(
      { questionType: "Short Answer" },
      { $set: { questionMarks: 4, questionNegativeMarks: 0 } }
    );
    console.log(`${shortAnswerResult.modifiedCount} Short Answer questions updated.`);

    // Update for "MoreThanOne"
    const moreThanOneResult = await Question.updateMany(
      { questionType: "MoreThanOne" },
      { $set: { questionMarks: 4, questionNegativeMarks: -1 } }
    );
    console.log(`${moreThanOneResult.modifiedCount} MoreThanOne questions updated.`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

updateQuestionMarks();
