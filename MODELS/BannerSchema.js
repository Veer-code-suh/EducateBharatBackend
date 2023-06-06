const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Banner = new mongoose.Schema({
    imgUrl: {
        type: String,
        required: true
    },
    redirectUrl: {
        type: String,
        default: ''
    }
});

mongoose.model("Banner", Banner);