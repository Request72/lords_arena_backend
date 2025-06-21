const authRoutes = require('./routes/authRoutes');
const characterRoutes = require('./routes/characterRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const playerRoutes = require('./routes/characterRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', playerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/characters', characterRoutes);
// Connect DB and Start Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log('Server running...');
        });
    })
    .catch(err => console.error(err));