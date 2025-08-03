const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Player Movement
router.post('/move', async(req, res) => {
    try {
        const { userId, x, y } = req.body;

        // Update player position in database
        await Player.findOneAndUpdate({ userId }, { x, y }, { upsert: true, new: true });

        res.json({ message: 'Player movement updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update player movement' });
    }
});

// Get Player Info
router.get('/:userId', async(req, res) => {
    try {
        const player = await Player.findOne({ userId: req.params.userId });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch player info' });
    }
});

module.exports = router;