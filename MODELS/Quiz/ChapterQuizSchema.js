const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const ChapterQuiz = new mongoose.Schema({
    chapterQuizName: {
        type: String,
        required: true
    },
    chapterQuizDescription: {
        type: String
    },
    chapterQuizImage: {
        type: String,
        default: 'noimage'
    },
    chapterQuizQNA: {
        type: Array,
        default: []
    },
    chapterId: {
        type: String,
        required: true
    },
    QuizType: {
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


mongoose.model("ChapterQuiz", ChapterQuiz);