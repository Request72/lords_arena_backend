# 🏰 Lords Arena Backend

A Node.js backend server for the Lords Arena multiplayer combat game, featuring real-time multiplayer, authentication, and MongoDB integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Socket.IO Events](#socketio-events)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Lords Arena backend provides a complete server solution for multiplayer combat gaming, including:

- **REST API**: Authentication, game sessions, leaderboards
- **Real-time Communication**: Socket.IO for multiplayer
- **Database Management**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based security
- **CORS Support**: Cross-origin request handling

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcryptjs
- **Validation**: Built-in Express validation
- **CORS**: Cross-origin resource sharing

## 🏗️ Architecture

```
lords_arena_backend/
├── config/                 # Configuration files
│   └── db.js             # Database configuration
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication logic
│   ├── characterController.js # Character management
│   └── dashboardController.js # Dashboard data
├── middleware/            # Custom middleware
│   └── auth.js           # JWT authentication
├── models/               # Database schemas
│   ├── User.js          # User model
│   ├── Player.js        # Player model
│   ├── Score.js         # Score model
│   └── Character.js     # Character model
├── routes/               # API route definitions
│   ├── authRoutes.js    # Authentication routes
│   ├── gameRoutes.js    # Game session routes
│   ├── playerRoutes.js  # Player management
│   └── leaderboardRoutes.js # Leaderboard routes
├── server.js             # Main server file
├── package.json          # Dependencies
└── .env                  # Environment variables
```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

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

### Game Routes (`/api/game`)

#### POST `/api/game/session/create`
Create a new game session.

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

### Player Routes (`/api/player`)

#### POST `/api/player/move`
Update player position.

**Request Body:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "x": 100,
  "y": 200,
  "sessionId": "session_123456"
}
```

#### GET `/api/player/:userId`
Get player information.

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

### Dashboard Routes (`/api/dashboard`)

#### GET `/api/dashboard/:userId`
Get dashboard data for user.

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

## 🗄️ Database Models

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  xp: Number (default: 0),
  coins: Number (default: 0),
  level: Number (default: 1),
  createdAt: Date,
  updatedAt: Date
}
```

### Player Model
```javascript
{
  socketId: String (required),
  username: String (required),
  character: String,
  position: {
    x: Number,
    y: Number
  },
  health: Number (default: 100),
  weapon: String,
  sessionId: String
}
```

### Score Model
```javascript
{
  username: String (required),
  score: Number (required),
  gameMode: String,
  sessionId: String,
  kills: Number,
  deaths: Number,
  duration: Number,
  createdAt: Date
}
```

### Character Model
```javascript
{
  name: String (required),
  type: String (required),
  health: Number (required),
  damage: Number (required),
  speed: Number (required),
  spritePath: String (required),
  unlocked: Boolean (default: false)
}
```

## 🌐 Socket.IO Events

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

## 🚀 Setup Instructions

### Prerequisites

- **Node.js**: 16.x or higher
- **MongoDB**: 5.0 or higher
- **npm**: Package manager
- **Git**: Version control

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd lords_arena_backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/lords_arena

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (Windows)
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

#### Option B: Docker MongoDB
```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=lords_arena \
  mongo:latest
```

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Or directly with node
node server.js
```

### 5. Verify Installation

```bash
# Check server status
curl http://localhost:5000/api/auth

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"
```

## 🔧 Environment Configuration

### Development Environment

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/lords_arena_dev
JWT_SECRET=dev_secret_key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Production Environment

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://username:password@host:port/lords_arena
JWT_SECRET=production_secret_key_very_long_and_secure
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

## 🚀 Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment

#### Option A: Traditional Server

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "lords-arena-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### Option B: Docker Deployment

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```bash
# Build Docker image
docker build -t lords-arena-backend .

# Run container
docker run -d \
  --name lords-arena-backend \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://host:port/lords_arena \
  -e JWT_SECRET=your_secret \
  lords-arena-backend
```

#### Option C: Cloud Deployment

**Heroku:**
```bash
# Install Heroku CLI
# Create Heroku app
heroku create lords-arena-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGO_URI=your_mongodb_uri

# Deploy
git push heroku main
```

**AWS/Google Cloud/Azure:**
- Use container deployment
- Set up load balancer
- Configure environment variables
- Setup monitoring and logging

## 🧪 Testing

### API Testing

#### Using curl

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@gmail.com",
    "password": "password123"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "password123"
  }'

# Test protected route
curl -X GET http://localhost:5000/api/dashboard/user123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Using Postman

1. **Import Collection**: Import the provided Postman collection
2. **Set Environment**: Configure base URL and variables
3. **Run Tests**: Execute test scenarios

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

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

**load-test.yml:**
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Authentication Flow"
    flow:
      - post:
          url: "/api/auth/signup"
          json:
            username: "user{{ $randomNumber() }}"
            email: "user{{ $randomNumber() }}@test.com"
            password: "password123"
      - post:
          url: "/api/auth/login"
          json:
            email: "user{{ $randomNumber() }}@test.com"
            password: "password123"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues

**Problem**: `MongooseError: Operation users.findOne() buffering timed out`

**Solutions**:
```bash
# Check MongoDB status
mongo --eval "db.runCommand('ping')"

# Restart MongoDB service
net stop MongoDB
net start MongoDB

# Check connection string
echo $MONGO_URI
```

#### 2. Port Already in Use

**Problem**: `EADDRINUSE: address already in use 0.0.0.0:5000`

**Solutions**:
```bash
# Kill existing process
taskkill /F /IM node.exe

# Or change port in .env
PORT=5001
```

#### 3. JWT Token Issues

**Problem**: `JsonWebTokenError: invalid token`

**Solutions**:
- Check JWT_SECRET in .env
- Verify token format in requests
- Check token expiration

#### 4. CORS Issues

**Problem**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions**:
```javascript
// Update CORS configuration in server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.125:3000'],
  credentials: true
}));
```

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB status
mongo --eval "db.runCommand('ping')"

# Check server logs
tail -f logs/server.log

# Monitor system resources
top -p $(pgrep node)

# Check network connections
netstat -an | grep :5000
```

### Performance Monitoring

```bash
# Install monitoring tools
npm install -g clinic

# Run performance analysis
clinic doctor -- node server.js

# Generate flamegraph
clinic flame -- node server.js
```

## 📊 Monitoring and Logging

### Logging Configuration

```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Check Endpoint

```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});
```

## 🔒 Security Considerations

### JWT Security
- Use strong, unique JWT_SECRET
- Set appropriate token expiration
- Implement token refresh mechanism

### Database Security
- Use MongoDB authentication
- Enable SSL/TLS connections
- Regular database backups

### API Security
- Input validation and sanitization
- Rate limiting
- CORS configuration
- HTTPS in production

### Environment Variables
- Never commit .env files
- Use different secrets for dev/prod
- Rotate secrets regularly

## 📈 Performance Optimization

### Database Optimization
- Create indexes for frequently queried fields
- Use connection pooling
- Implement caching strategies

### API Optimization
- Implement response caching
- Use compression middleware
- Optimize database queries

### Socket.IO Optimization
- Use rooms for efficient broadcasting
- Implement heartbeat mechanisms
- Handle reconnection gracefully

---

**Lords Arena Backend** - Powering the ultimate multiplayer combat experience! ⚔️🚀 