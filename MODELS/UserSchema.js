const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const User = new mongoose.Schema({
    // name, mobile, age, password
    profilePic: {
        type: String,
        default: 'noimage'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    coursePurchased: {
        type: Array,
        default: []
    },
    testScores: {
        type: Array,
        default: []
    },
    userCart: {
        type: Array,
        default: []
    },
    address: {
        type: Object,
        default: {
            AddressLine1: "",
            AddressLine2: "",
            City: "",
            State: "",
            Pincode: ""
        }
    },
    orders: {
        type: Array,
        default: []
    }
},
    {
        timestamps: true
    });

User.pre('save', async function (next) {
    const user = this;
    console.log("Just before saving before hashing  ", user.password);
    if (!user.isModified('password')) {
        return next();
    }
    user.password = await bcrypt.hash(user.password, 8);
    console.log("Just before saving after hashing  ", user.password);
    next();
})

mongoose.model("User", User);