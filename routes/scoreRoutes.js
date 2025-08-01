const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// POST /api/game/score
router.post('/score', async (req, res) => {
    try {
        const { username, score } = req.body;

        if (!username || score == null) {
            return res.status(400).json({ error: 'Username and score are required.' });
        }

        const newScore = new Score({ username, score, date: new Date() });
        await newScore.save();

        res.status(201).json({ message: 'Score saved successfully.' });
    } catch (err) {
        console.error('Error saving score:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
