// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config(); // Load .env variables first

const connectDB = require('./config/db');
const orderRoutes = require('./routes/api/orders');

// --- Basic Setup ---
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, { // Initialize Socket.IO
    cors: {
        origin: "*", // Allow all origins for simplicity (Restrict in production!)
        methods: ["GET", "POST"]
    }
});

// Store io instance in app for access in routes
app.set('socketio', io);

// --- Database Connection ---
connectDB();

// --- Middleware ---
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser for JSON requests
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

// --- API Routes ---
app.use('/api/orders', orderRoutes);

// --- Basic Route for Root ---
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Serve homepage
});

// --- Socket.IO Connection Handling ---
io.on('connection', (socket) => {
    console.log('A user connected to Socket.IO:', socket.id);

    // Handle admin-specific events if needed (e.g., joining a room)
    // socket.join('admin_room');

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Add listeners for other events if needed (e.g., admin updating status)
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process (optional)
  // server.close(() => process.exit(1));
});
