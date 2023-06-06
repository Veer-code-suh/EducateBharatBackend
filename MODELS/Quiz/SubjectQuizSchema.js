const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const SubjectQuiz = new mongoose.Schema({
    subjectQuizName: {
        type: String,
        required: true
    },
    subjectQuizDescription: {
        type: String
    },
    subjectQuizImage: {
        type: String,
        default: 'noimage'
    },
    subjectQuizQNA: {
        type: Array,
        default: []
    },
    subjectId: {
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
    }
},
    {
        timestamps: true
    });


mongoose.model("SubjectQuiz", SubjectQuiz);