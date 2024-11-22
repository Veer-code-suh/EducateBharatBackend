const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Admin = mongoose.model('Admin');


async function checkAdminToken(req, res, next) {
    try {
        let token = req.headers.authorization.split(" ")[1];
        if (token) {
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                res.status(401).json({ message: "Invalid Admin Token" });
            }
            const admin = await Admin.findOne({ email: decoded.email });

            if (admin) {
                next();
            }
            else {
                res.status(401).json({ error: "Invalid Admin Token" });
            }
        }
        else {
            res.status(401).json({ error: "Invalid Admin Token" });

        }
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired", expiredAt: err.expiredAt });
        }

        return res.status(401).json({ message: "Invalid Token", error: err.message });
    }
}

module.exports = checkAdminToken;