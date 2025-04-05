// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerDetails: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String }, // Optional
    },
    items: [{ // Array of items in the order
        id: { type: String, required: true }, // Your product ID
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price per unit at time of order
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        required: true, // e.g., 'cod', 'card'
    }
    // Add more fields as needed (e.g., delivery instructions)
});

module.exports = mongoose.model('Order', OrderSchema);
