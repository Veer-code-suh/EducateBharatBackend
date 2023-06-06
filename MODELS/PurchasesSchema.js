const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const Purchase = new mongoose.Schema({
    item : {
        type: Object,
        required: true
    },
    userId : {
        type: String,
        required: true
    },
    amount : {
        type: String,
        required: true
    },
    currency : {
        type: String,
        default: 'INR'
    }
},{
    timestamps: true
});

mongoose.model("Purchase", Purchase);
