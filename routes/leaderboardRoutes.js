const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/LeaderboardModel');

// Save score to DB
router.post('/score', async (req, res) => {
    const { username, score } = req.body;

    if (!username || typeof score !== 'number') {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const existing = await Leaderboard.findOne({ username });
        if (existing) {
            if (score > existing.score) {
                existing.score = score;
                await existing.save();
            }
        } else {
            await Leaderboard.create({ username, score });
        }
        res.json({ message: 'Score saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save score' });
    }
});

// Get top scores
router.get('/', async (req, res) => {
    try {
        const topScores = await Leaderboard.find().sort({ score: -1 }).limit(10);
        res.json(topScores);
    } catch (err) {
        res.status(500).json({ message: 'Failed to load leaderboard' });
    }
});

module.exports = router;
