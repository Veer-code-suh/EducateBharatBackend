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
    },
    razorpay_payment_id : {
        type: String,
    },
    upi_transaction_id : {
        type: String,
    }
},{
    timestamps: true
});

mongoose.model("Purchase", Purchase);
