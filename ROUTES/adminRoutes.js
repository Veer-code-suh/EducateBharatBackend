const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Purchase = mongoose.model('Purchase');
const Banner = mongoose.model('Banner');
const Admin = mongoose.model('Admin');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const adminTokenHandler = require('../Middleware/AdminVerificationMiddleware');


// const verifyToken = async (req, res, next) => {
//     let token = req.headers.authorization.split(" ")[1];
//     if (token) {
//         let decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const admin = await Admin.findOne({ email: decoded.email });

//         if (admin) {
//             next();
//         }
//         else {
//             res.status(401).json({ message: "Invalid Admin Token" });
//         }
//     }
//     else {
//         res.status(401).json({ message: "Invalid Admin Token" });

//     }
// }

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'educatebharat23122001@gmail.com',
        pass: 'qijvhmwyxgsyfulg'
    }
})



router.post('/sendotptoadmin', async (req, res) => {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const adminEmail = req.body.email;

    const admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
        try {
            const mailOptions = {
                from: process.env.COMPANY_EMAIL,
                to: process.env.COMPANY_EMAIL,
                subject: 'Educater Bharat Admin OTP for verification ',
                text: `Your OTP for verification is ${otp} for email ${adminEmail}`,
            };

            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) {


                    console.log(err);
                    res.status(500).json(createResponse(false, err.message));
                } else {
                    admin.otp = otp;
                    await admin.save();
                    res.json(createResponse(true, 'OTP sent successfully', { otp }));
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json(createResponse(false, err.message));
        }
    }
    else {
        res.json({ message: "Invalid Admin Email" });
    }
});


router.get('/checkAdminToken', adminTokenHandler, async (req, res) => {
    res.json({ message: "Admin token verified" });
});


router.post('/adminLogin', async (req, res) => {
    const { email, otp } = req.body;
    const adminEmail = req.body.email;

    const admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
        // otp is hashed
        const isMatch = await bcrypt.compare(otp, admin.otp);
        if (isMatch) {
            // expires in 1 hour
            const token = jwt.sign({ email: adminEmail, password: otp }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: "success", token: token });
        }
        else {
            res.json({ message: "Invalid Admin OTP" });
        }
    }
    else {
        res.json({ message: "Invalid Admin Email" });
    }


});

router.post('/getUserDataforAdmin', adminTokenHandler, async (req, res) => {

    const { userid } = req.body;

    User.findOne({ _id: userid })
        .then(user => {
            if (user) {
                res.json({ message: "success", user: user });
            }
            else {
                res.json({ message: "Invalid Token" });
            }
        })
});

module.exports = router;