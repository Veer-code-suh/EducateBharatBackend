const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const Admin = new mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    });

Admin.pre('save', async function (next) {
    const Admin = this;
    console.log("Just before saving before hashing  ", Admin.otp);
    if (!Admin.isModified('otp')) {
        return next();
    }
    Admin.otp = await bcrypt.hash(Admin.otp, 8);
    console.log("Just before saving after hashing  ", Admin.otp);
    next();
})

mongoose.model("Admin", Admin);