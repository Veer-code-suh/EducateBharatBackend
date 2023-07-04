const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const QuestionSchema = new mongoose.Schema({
    // quizid, question, questiontype, options, answer, marks, negativeMarks , quiztype
    questionName: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true
    },
    quizType: {
        type: String,
        required: true
    },
    quizId : {
        type: String,
        required: true
    },
    questionOptions: {
        type: Array,
        default: []
    },
    questionAnswer: {
        type: String,
        required: true
    },
    questionMarks: {
        type: Number,
        required: true
    },
    questionNegativeMarks: {
        type: Number,
        required: true,
        default: 0
    },
    questionSubject: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    });


mongoose.model("QuestionSchema", QuestionSchema);