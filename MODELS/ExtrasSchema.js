const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Extras = new mongoose.Schema({
    allCoursesDiscount: {
        type: Number,
        default: 0
    },
    allProductsDiscount: {
        type: Number,
        default: 0
    },
    deliveryCharges: {
        type: Number,
        default: 0
    },
});

mongoose.model("Extras", Extras);