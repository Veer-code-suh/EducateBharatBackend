const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    questionName: {
        type: String
    },
    questionOrder: {
        type: Number,
    },
    questionType: {
        type: String,
        enum: ["MCQ", "Short Answer", "MoreThanOne"], // Restrict to these values
        default: "MCQ"
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
        default: ['A', 'B', 'C', 'D']
    },
    questionAnswer: {
        type: [String],
    },
    questionMarks: {
        type: Number,
        default: 4,
    },
    questionNegativeMarks: {
        type: Number,
        default: () => {
            return this.questionType === 'Short Answer' ? 0 : -1;
        }
    },
    questionSubject: {
        type: String,
    },
    questionPdf: {
        type: String,
        default: null, // Path to PDF if available
    }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Question', questionSchema);
