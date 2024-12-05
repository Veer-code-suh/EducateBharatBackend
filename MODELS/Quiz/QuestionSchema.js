const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    questionName: {
        type: String,
        required: true,
    },
    questionOrder: {
        type: Number,
        required: true,
    },
    questionType: {
        type: String,
        required: true,
        enum: ["MCQ", "Short Answer", "MoreThanOne"], // Restrict to these values
        default:"MCQ"
    },
    quizType: {
        type: String,
        default: 'chapter'
    },
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz', // Assuming you have a Quiz model for referencing
        required: true,
    },
    questionOptions: {
        type: [String],
        required: function () { return this.questionType === 'MCQ'; }, // Only required for MCQ type questions
    },
    questionAnswer: {
        type: String,
        required: true,
    },
    questionMarks: {
        type: Number,
        required: true,
    },
    questionNegativeMarks: {
        type: Number,
        default: 0,
    },
    questionSubject: {
        type: String,
        required: true,
    },
    questionPdf: {
        type: String,
        default: null, // Path to PDF if available
    }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Question', questionSchema);
