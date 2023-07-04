const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const CourseQuiz = new mongoose.Schema({
    courseQuizName: {
        type: String,
        required: true
    },
    courseQuizDescription: {
        type: String
    },
    courseQuizImage: {
        type: String,
        default: 'noimage'
    },
    courseQuizQNA: {
        type: Array,
        default: []
    },
    courseId: {
        type: String,
        required: true
    },
    quizType: {
        type: String,
        default: 'chapter'
    },
    access: {
        type: String,
        default: 'PAID'
    },
    afterSubmissionPdf: {
        type: String,
        default: null
    },
    timeLimit: {
        type: Number,
        default: 60000
        // 60000 ms = 1 minute
    }
},
    {
        timestamps: true
    });


mongoose.model("CourseQuiz", CourseQuiz);