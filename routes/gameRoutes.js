const express = require('express');
const router = express.Router();
const Score = require('../models/Score'); // Mongoose model

router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Score.find().sort({ score: -1 }).limit(10);
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
