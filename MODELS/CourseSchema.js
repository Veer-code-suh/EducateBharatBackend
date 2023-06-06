const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const Course = new mongoose.Schema({
    coursePrice: {
        type: String,
        required: true
    },
    coursePriceCurrency: {
        type: String,
        default: 'INR'
    },
    courseSubjects: {
        type: Array,
        default: []
    },
    courseName: {
        type: String,
        required: true
    },
    courseDescription: {
        type: String,
        default: ''
    },
    courseImage: {
        type: String,
        default: 'noimage'
    },
    courseRating: {
        type: String,
        default: '0'
    },
    courseReviews: {
        type: Array,
        default: []
    },
    courseQuizzes: {
        type: Array,
        default: []
    },
    introVideo: {
        type: String,
        default: ''
    }
},
    {
        timestamps: true
    });


mongoose.model("Course", Course);