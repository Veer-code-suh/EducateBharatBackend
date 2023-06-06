const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Subject = new mongoose.Schema({
    // subjectName, subjectDescription, subjectChapters, subjectImage , subjectTests
    subjectName: {
        type: String,
        required: true
    },
    subjectDescription: {
        type: String,
    },
    subjectChapters: {
        type: Array,
        default: []
    },
    subjectImage: {
        type: String,
        default: 'noimage'
    },
    subjectQuizzes: {
        type: Array,
        default: []
    }
}, { timestamps: true });

mongoose.model("Subject", Subject);