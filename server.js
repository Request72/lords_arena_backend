const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const characterRoutes = require('./routes/characterRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const gameRoutes = require('./routes/gameRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const playerRoutes = require('./routes/playerRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const path = require('path');

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/game', scoreRoutes);
app.use('/api/player', playerRoutes);

// ✅ Score Model
const Score = require('./models/Score');

// ✅ Socket.IO logic
const playerData = {};
let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log('🟢 Player connected:', socket.id);

    socket.on('init-character', ({ character, username }) => {
        playerData[socket.id] = { character, username };
    });

    socket.on('quick-play', () => {
        if (waitingPlayer && playerData[waitingPlayer.id] && playerData[socket.id]) {
            const roomId = `room-${waitingPlayer.id}-${socket.id}`;
            socket.join(roomId);
            waitingPlayer.join(roomId);
            socket.roomId = roomId;
            waitingPlayer.roomId = roomId;

            io.to(roomId).emit('joined-room', { roomId });

            io.to(waitingPlayer.id).emit('init-player', {
                id: waitingPlayer.id,
                x: 100,
                y: 200,
                ...playerData[waitingPlayer.id],
            });

            io.to(socket.id).emit('init-player', {
                id: socket.id,
                x: 600,
                y: 200,
                ...playerData[socket.id],
            });

            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
        }
    });

    socket.on('move-player', ({ roomId, x, y }) => {
        socket.to(roomId).emit('player-moved', { id: socket.id, x, y });
    });

    socket.on('game-over', async({ username, score }) => {
        try {
            const newScore = new Score({ username, score });
            await newScore.save();
            console.log(`✅ Score saved: ${username} - ${score}`);
        } catch (err) {
            console.error('❌ Error saving score:', err);
        }
    });

    socket.on('disconnect', () => {
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }

        if (socket.roomId) {
            socket.to(socket.roomId).emit('player-disconnected', socket.id);
        }
        delete playerData[socket.id];
        console.log('🔴 Player disconnected:', socket.id);
    });
});

// ✅ IP Utility
function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// ✅ Dynamic Port Startup
function tryListen(port) {
    server.listen(port, '0.0.0.0')
        .on('listening', () => {
            const ip = getLocalIp();
            console.log(`✅ Server running on port ${port}`);
            console.log(`🌐 Accessible at: http://${ip}:${port}`);
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️ Port ${port} in use. Trying ${port + 1}...`);
                tryListen(port + 1);
            } else {
                console.error('❌ Server error:', err);
            }
        });
}

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lords_arena')
    .then(() => {
        console.log('✅ Connected to MongoDB');
        const startPort = process.env.PORT ? parseInt(process.env.PORT) : 5000;
        tryListen(startPort);
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        console.log('⚠️ Starting server without MongoDB...');
        const startPort = process.env.PORT ? parseInt(process.env.PORT) : 5000;
        tryListen(startPort);
    });