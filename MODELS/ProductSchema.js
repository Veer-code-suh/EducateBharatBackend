const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const Product = new mongoose.Schema({

    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    productImages: {
        type: Array,
        default: []
    },
    productCategory: {
        type: String,
        default: ''
    },
    productReviews: {
        type: Array,
        default: []
    },
    productRating: {
        type: String,
        default: '4.5'
    },
    productStock: {
        type: String,
        default: 'INSTOCK'
    }

},
    {
        timestamps: true
    });



mongoose.model("Product", Product);