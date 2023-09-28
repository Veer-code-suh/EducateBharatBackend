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
    const admin = this;
    console.log("Just before saving before hashing  ", admin.otp);
    if (!admin.isModified('otp')) {
        return next();
    }
    admin.otp = await bcrypt.hash(admin.otp, 8);
    console.log("Just before saving after hashing  ", admin.otp);
    next();
})

mongoose.model("Admin", Admin);