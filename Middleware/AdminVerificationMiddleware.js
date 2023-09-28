const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Admin = mongoose.model('Admin');


async function checkAdminToken(req, res, next) {
    let token = req.headers.authorization.split(" ")[1];
    if (token) {
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ email: decoded.email });

        if (admin) {
            next();
        }
        else {
            res.status(401).json({ message: "Invalid Admin Token" });
        }
    }
    else {
        res.status(401).json({ message: "Invalid Admin Token" });

    }
}

module.exports = checkAdminToken;