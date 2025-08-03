const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Player = require('../models/Player');
const User = require('../models/User');

// Game Session Management
router.post('/session/create', async(req, res) => {
    try {
        const { userId, gameMode, selectedWeapon, selectedCharacter } = req.body;
        const sessionId = `session_${Date.now()}_${userId}`;

        res.status(201).json({
            sessionId,
            status: 'created',
            gameMode,
            selectedWeapon,
            selectedCharacter
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create game session' });
    }
});

router.post('/session/:sessionId/action', async(req, res) => {
    try {
        const { userId, action, actionData } = req.body;
        // Handle player actions (move, shoot, etc.)
        res.json({ message: 'Action processed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to process action' });
    }
});

// Game Results
router.post('/results', async(req, res) => {
    try {
        const { sessionId, userId, gameResult } = req.body;
        const newScore = new Score({
            username: gameResult.username || 'Player',
            score: gameResult.score || 0,
            date: new Date()
        });
        await newScore.save();
        res.json({ message: 'Game result saved' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save game result' });
    }
});

// Leaderboard
router.get('/leaderboard', async(req, res) => {
    try {
        const { limit = 10, gameMode } = req.query;
        const leaderboard = await Score.find()
            .sort({ score: -1 })
            .limit(parseInt(limit));

        res.json({ leaderboard });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch leaderboard' });
    }
});

// User Stats
router.get('/stats/:userId', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const player = await Player.findOne({ userId: req.params.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            userId: user._id,
            username: user.username,
            level: user.level,
            xp: user.xp,
            coins: user.coins,
            stats: player || {}
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user stats' });
    }
});

// Unlocked Weapons
router.get('/unlocks/:userId/weapons', async(req, res) => {
    try {
        const weapons = [
            { id: 'rifle', name: 'Rifle', unlocked: true },
            { id: 'shotgun', name: 'Shotgun', unlocked: true },
            { id: 'sniper', name: 'Sniper', unlocked: true }
        ];
        res.json({ weapons });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch weapons' });
    }
});

// Unlocked Characters
router.get('/unlocks/:userId/characters', async(req, res) => {
    try {
        const characters = [
            { id: 'kp', name: 'KP', unlocked: true },
            { id: 'sher', name: 'Sher', unlocked: true },
            { id: 'prachanda', name: 'Prachanda', unlocked: true }
        ];
        res.json({ characters });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch characters' });
    }
});

module.exports = router;