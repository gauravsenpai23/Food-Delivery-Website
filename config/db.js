// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // To load .env variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true, // No longer needed in Mongoose 6+
            // useUnifiedTopology: true, // No longer needed in Mongoose 6+
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
