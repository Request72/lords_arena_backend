# 🏰 Lords Arena - API Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Socket.IO Events](#socketio-events)
- [Error Codes](#error-codes)
- [Testing](#testing)

---

## 🎯 Overview

The Lords Arena API provides a complete backend solution for multiplayer combat gaming, including authentication, game sessions, real-time multiplayer, and leaderboards.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcryptjs

---

## 🌐 Base URL

```
Development: http://localhost:5000
Production: https://your-domain.com
```

---

## 🔐 Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

### Token Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641600000
}
```

---

## 📚 API Endpoints

### Authentication Routes

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "username": "gamer123",
  "email": "gamer123@gmail.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "username": "gamer123",
  "email": "gamer123@gmail.com"
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: User already exists
- `500`: Internal server error

#### POST `/api/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "gamer123@gmail.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "username": "gamer123",
  "email": "gamer123@gmail.com"
}
```

**Error Responses:**
- `400`: Missing email or password
- `404`: User not found
- `401`: Invalid credentials
- `500`: Internal server error

---

### Game Routes

#### POST `/api/game/session/create`
Create a new game session.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "gameMode": "multiplayer",
  "selectedWeapon": "rifle",
  "selectedCharacter": "kp"
}
```

**Response (201):**
```json
{
  "sessionId": "session_123456",
  "status": "waiting",
  "players": [],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/game/session/:sessionId/action`
Send player action to game session.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "action": "shoot",
  "actionData": {
    "x": 100,
    "y": 200,
    "weapon": "rifle"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Action processed"
}
```

#### GET `/api/game/leaderboard`
Get global leaderboard.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `gameMode`: Filter by game mode

**Response (200):**
```json
{
  "leaderboard": [
    {
      "username": "gamer123",
      "score": 1500,
      "rank": 1,
      "wins": 25,
      "losses": 5
    }
  ]
}
```

#### POST `/api/game/results`
Save game results.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session_123456",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "gameResult": {
    "score": 1500,
    "kills": 15,
    "deaths": 3,
    "duration": 300
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Results saved"
}
```

#### GET `/api/game/stats/:userId`
Get user statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "username": "gamer123",
  "stats": {
    "totalGames": 50,
    "wins": 35,
    "losses": 15,
    "averageScore": 1200,
    "bestScore": 2000,
    "totalKills": 500,
    "totalDeaths": 200
  }
}
```

#### GET `/api/game/unlocks/:userId/weapons`
Get unlocked weapons for user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "weapons": [
    {
      "id": "weapon_1",
      "name": "Rifle",
      "unlocked": true,
      "unlockDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET `/api/game/unlocks/:userId/characters`
Get unlocked characters for user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "characters": [
    {
      "id": "character_1",
      "name": "KP",
      "unlocked": true,
      "unlockDate": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Player Routes

#### POST `/api/player/move`
Update player position.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "x": 100,
  "y": 200,
  "sessionId": "session_123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Position updated"
}
```

#### GET `/api/player/:userId`
Get player information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "username": "gamer123",
  "level": 5,
  "xp": 1250,
  "coins": 500,
  "stats": {
    "totalGames": 50,
    "wins": 35,
    "losses": 15,
    "averageScore": 1200
  }
}
```

---

### Dashboard Routes

#### GET `/api/dashboard/:userId`
Get dashboard data for user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "username": "gamer123",
    "level": 5,
    "xp": 1250,
    "coins": 500
  },
  "recentGames": [
    {
      "sessionId": "session_123456",
      "score": 1500,
      "result": "win",
      "date": "2024-01-15T10:30:00Z"
    }
  ],
  "leaderboard": [
    {
      "username": "gamer123",
      "score": 1500,
      "rank": 1
    }
  ]
}
```

---

### Character Routes

#### GET `/api/characters`
Get all available characters.

**Response (200):**
```json
{
  "characters": [
    {
      "id": "kp",
      "name": "KP",
      "type": "balanced",
      "health": 100,
      "damage": 25,
      "speed": 1.0,
      "spritePath": "assets/images/kp.png",
      "unlocked": true
    }
  ]
}
```

#### GET `/api/characters/:id`
Get character by ID.

**Response (200):**
```json
{
  "id": "kp",
  "name": "KP",
  "type": "balanced",
  "health": 100,
  "damage": 25,
  "speed": 1.0,
  "spritePath": "assets/images/kp.png",
  "unlocked": true
}
```

---

### Leaderboard Routes

#### POST `/api/leaderboard/score`
Save a new score.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "gamer123",
  "score": 1500,
  "gameMode": "multiplayer",
  "kills": 15,
  "deaths": 3
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Score saved",
  "rank": 5
}
```

#### GET `/api/leaderboard`
Get top scores.

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `gameMode`: Filter by game mode

**Response (200):**
```json
{
  "leaderboard": [
    {
      "username": "gamer123",
      "score": 1500,
      "rank": 1,
      "date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🌐 Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:5000');
```

### Client to Server Events

#### `init-character`
Initialize player character data.

**Data:**
```json
{
  "character": "kp",
  "username": "gamer123"
}
```

#### `quick-play`
Join matchmaking queue.

**Data:**
```json
{
  "username": "gamer123",
  "character": "kp",
  "weapon": "rifle"
}
```

#### `move-player`
Update player position.

**Data:**
```json
{
  "roomId": "room_123456",
  "x": 100,
  "y": 200
}
```

#### `game-over`
End game session and save results.

**Data:**
```json
{
  "username": "gamer123",
  "score": 1500,
  "kills": 15,
  "deaths": 3
}
```

### Server to Client Events

#### `joined-room`
Room assignment for multiplayer.

**Data:**
```json
{
  "roomId": "room_123456"
}
```

#### `init-player`
Player initialization data.

**Data:**
```json
{
  "id": "socket_123456",
  "x": 100,
  "y": 200,
  "character": "kp",
  "username": "gamer123"
}
```

#### `player-moved`
Player position update.

**Data:**
```json
{
  "id": "socket_123456",
  "x": 150,
  "y": 250
}
```

#### `player-disconnected`
Player left the game.

**Data:**
```json
{
  "playerId": "socket_123456"
}
```

---

## ❌ Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Messages

#### Authentication Errors
```json
{
  "error": true,
  "message": "Invalid credentials",
  "code": "AUTH_001"
}
```

#### Validation Errors
```json
{
  "error": true,
  "message": "Missing required fields",
  "code": "VAL_001"
}
```

#### Database Errors
```json
{
  "error": true,
  "message": "Database connection failed",
  "code": "DB_001"
}
```

---

## 🧪 Testing

### Using curl

#### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@gmail.com",
    "password": "password123"
  }'
```

#### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'
```

#### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/dashboard/user123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. **Import Collection**: Import the provided Postman collection
2. **Set Environment**: Configure base URL and variables
3. **Set Variables**:
   - `base_url`: `http://localhost:5000`
   - `jwt_token`: Your JWT token after login
4. **Run Tests**: Execute test scenarios

### Socket.IO Testing

```javascript
// Test client
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Test character initialization
  socket.emit('init-character', {
    character: 'kp',
    username: 'testuser'
  });
  
  // Test quick play
  socket.emit('quick-play');
});

socket.on('joined-room', (data) => {
  console.log('Joined room:', data.roomId);
});

socket.on('init-player', (data) => {
  console.log('Player initialized:', data);
});
```

---

## 📊 Rate Limiting

### Default Limits
- **Authentication**: 5 requests per minute
- **Game Actions**: 100 requests per minute
- **Leaderboard**: 30 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔒 Security

### CORS Configuration
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.125:3000'],
  credentials: true
}));
```

### JWT Security
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Refresh**: Not implemented (future feature)

### Input Validation
- **Username**: 3-20 characters, alphanumeric
- **Email**: Valid email format
- **Password**: Minimum 6 characters
- **Score**: Positive integer
- **Coordinates**: Valid numbers

---

## 📈 Performance

### Response Times
- **Authentication**: <100ms
- **Game Actions**: <50ms
- **Leaderboard**: <200ms
- **Socket.IO**: <10ms

### Database Queries
- **Indexed Fields**: username, email, score, createdAt
- **Connection Pool**: 10 connections
- **Query Timeout**: 30 seconds

---

## 🚀 Deployment

### Environment Variables
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://username:password@host:port/lords_arena
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### Health Check
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "memory": {
    "rss": 50000000,
    "heapTotal": 30000000,
    "heapUsed": 20000000
  },
  "version": "v16.15.0"
}
```

---

**🏰 Lords Arena API** - Powering the ultimate multiplayer combat experience! ⚔️🚀

*This API documentation provides complete reference for integrating with the Lords Arena backend.* 