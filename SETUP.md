# Backend Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lords_arena
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB (make sure MongoDB is running)

3. Start the server:
```bash
npm start
```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/dashboard/dashboard` - User dashboard
- `GET /api/characters` - Get all characters
- `GET /api/leaderboard` - Get leaderboard
- `POST /api/game/session/create` - Create game session
- `POST /api/player/move` - Update player movement
- `GET /api/game/stats/:userId` - Get user stats
- `GET /api/game/unlocks/:userId/weapons` - Get unlocked weapons
- `GET /api/game/unlocks/:userId/characters` - Get unlocked characters

## Socket.IO Events

- `quick-play` - Join multiplayer queue
- `init-character` - Initialize character selection
- `move-player` - Send player movement
- `game-over` - Submit game score 