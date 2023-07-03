const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Purchase = mongoose.model('Purchase');
const Banner = mongoose.model('Banner');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


app.get('/checkAdminToken', async (req, res) => {
    let adminEmail = process.env.ADMIN_EMAIL;
    let adminPassword = process.env.ADMIN_PASSWORD;

    let token = req.headers.authorization.split(" ")[1];
    if (token) {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email === adminEmail && decoded.password === adminPassword) {
            res.json({ message: "success" });
        }
        else {
            res.json({ message: "Invalid Admin Token" });
        }
    }


});


app.post('/adminLogin', async (req, res) => {
    let adminEmail = process.env.ADMIN_EMAIL;
    let adminPassword = process.env.ADMIN_PASSWORD;

    const { email, password } = req.body;
    if (email === adminEmail && password === adminPassword) {
        let token = jwt.sign({ email, password }, process.env.JWT_SECRET);
        res.json({ message: "success", token });
    }
    else {
        res.json({ message: "Invalid Credentials" });
    }
});

app.post('/getUserDataforAdmin', async (req, res) => {
    let token = req.headers.authorization.split(" ")[1];
    const { userid} = req.body;

    if (token) {
        User.findOne({ _id: userid }, (err, user) => {
            if (err) {
                res.json({ message: "error" });
            }
            else {
                res.json({ message: "success", user });
            }
        })
    }
    else {
        res.json({ message: "Invalid Token" });
    }
});

module.exports = app;