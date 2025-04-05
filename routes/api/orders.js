// routes/api/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/Order'); // Import the Order model
const { sendOrderNotification } = require('../../config/email');

// @route   POST api/orders
// @desc    Create a new order
// @access  Public
router.post('/', async (req, res) => {
    const { customerDetails, items, paymentMethod } = req.body;
    const io = req.app.get('socketio'); // Get socket.io instance from app

    // --- Validation ---
    if (!customerDetails || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
        return res.status(400).json({ msg: 'Missing required order data.' });
    }
    if (!customerDetails.name || !customerDetails.address || !customerDetails.phone) {
         return res.status(400).json({ msg: 'Missing required customer details (name, address, phone).' });
    }
     // Add more specific validation for phone format, item structure etc.

    try {
        // --- Server-side Total Calculation (CRUCIAL) ---
        let calculatedTotal = 0;
        items.forEach(item => {
            // You might want to fetch current prices from DB here instead of trusting client
            if (typeof item.price !== 'number' || typeof item.quantity !== 'number' || item.price <= 0 || item.quantity <= 0) {
                throw new Error('Invalid item price or quantity.');
            }
            calculatedTotal += item.price * item.quantity;
        });

        const newOrder = new Order({
            customerDetails,
            items,
            totalAmount: calculatedTotal, // Use server-calculated total
            paymentMethod
            // Status defaults to 'Pending'
        });

        const savedOrder = await newOrder.save();

        // --- Send Notifications ---
        // 1. Email Notification
        sendOrderNotification(savedOrder); // Asynchronous, don't need to wait

        // 2. Real-time Dashboard Notification
        io.emit('new_order', savedOrder); // Emit to all connected admin clients
        console.log('Emitted new_order event via Socket.IO');

        res.status(201).json({ msg: 'Order placed successfully!', order: savedOrder });

    } catch (err) {
        console.error("Order placement error:", err.message);
         if (err.message === 'Invalid item price or quantity.') {
             return res.status(400).json({ msg: err.message });
         }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/orders
// @desc    Get all orders (For Admin)
// @access  Private (!!! Add Authentication/Authorization later !!!)
router.get('/', async (req, res) => {
    // !!! IMPORTANT: Add authentication middleware here to protect this route !!!
    try {
        const orders = await Order.find().sort({ orderDate: -1 }); // Sort newest first
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).send('Server Error');
    }
});

// Add routes for updating order status (PUT api/orders/:id/status) etc. later

module.exports = router;
