const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Order = new mongoose.Schema({
    orderItems: {
        type: Array,
        required: true,
    },
    shippingAddress: {
        type: Object,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    carttotal: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,

    },
    isDelivered: {
        type: String,
        default: 'Not Delivered',
    },
    isCancelled: {
        type: Boolean,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    shippingCost: {
        type: String,
        default: '0',
    },
    tax: {
        type: String,
        default: '0',
    },
    deliveryBoy: {
        type: Object,
        default: {
            name: "",
            phone: "",
        }
    }
}, { timestamps: true });

mongoose.model("Order", Order);