const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const Chapter = new mongoose.Schema({
    chapterName: {
        type: String,
        required: true
    },
    chapterDescription: {
        type: String
    },
    chapterImage: {
        type: String,
        default: 'noimage'
    },
    chapterVideos: {
        type: Array,
        default: []
    },
    chapterTests: {
        type: Array,
        default: []
    },
    chapterNotes: {
        type: Array,
        default: []
    },
    subjectId: {
        type: String,
        required: true
    },
    chapterQuizzes: {
        type: Array,
        default: []
    }
},
    {
        timestamps: true
    });


mongoose.model("Chapter", Chapter);