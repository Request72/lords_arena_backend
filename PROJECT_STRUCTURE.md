# Lords Arena Project Structure

## 🏗️ Complete Architecture Overview

```
Lords Arena Ecosystem
├── 📱 lords_arena_android/          # Flutter Mobile App
├── 🖥️ lords_arena_backend/          # Node.js Backend Server
└── 🌐 lords_arena_web/              # React Web App
```

## 📱 Android App Structure (Flutter)

```
lords_arena_android/
├── lib/
│   ├── app/
│   │   ├── app.dart                 # Main app widget
│   │   └── app_router.dart          # Route definitions
│   ├── core/
│   │   ├── service_locator/         # Dependency injection
│   │   ├── storage/                 # Local data storage
│   │   ├── theme/                   # App theming
│   │   └── utils/                   # Utility functions
│   └── features/
│       ├── auth/                    # Authentication
│       │   ├── data/
│       │   │   ├── datasources/     # API calls
│       │   │   ├── models/          # Data models
│       │   │   └── repositories/    # Data layer
│       │   ├── domain/
│       │   │   ├── entities/        # Business entities
│       │   │   └── repositories/    # Repository interfaces
│       │   └── presentation/
│       │       ├── cubit/           # State management
│       │       └── screens/         # UI screens
│       ├── dashboard/               # Dashboard feature
│       ├── ingame/                  # Game logic
│       │   ├── data/
│       │   │   ├── game_api_service.dart
│       │   │   ├── player_api_service.dart
│       │   │   └── repositories/
│       │   ├── game/
│       │   │   └── lords_arena_game.dart
│       │   └── presentation/
│       │       ├── components/      # Game components
│       │       ├── cubit/           # Game state
│       │       └── screens/         # Game screens
│       └── user/                    # User management
├── assets/
│   ├── audio/                       # Game sounds
│   ├── fonts/                       # Custom fonts
│   └── images/                      # Game assets
└── test/                            # Unit tests
```

## 🖥️ Backend Structure (Node.js)

```
lords_arena_backend/
├── config/
│   └── db.js                        # Database configuration
├── controllers/
│   ├── authController.js            # Authentication logic
│   ├── characterController.js       # Character management
│   └── dashboardController.js       # Dashboard data
├── middleware/
│   └── auth.js                      # JWT authentication
├── models/
│   ├── User.js                      # User schema
│   ├── Player.js                    # Player schema
│   ├── Character.js                 # Character schema
│   ├── Score.js                     # Score schema
│   └── Leaderboard.js              # Leaderboard schema
├── routes/
│   ├── authRoutes.js               # Auth endpoints
│   ├── characterRoutes.js          # Character endpoints
│   ├── dashboardRoutes.js          # Dashboard endpoints
│   ├── gameRoutes.js               # Game endpoints
│   ├── leaderboardRoutes.js        # Leaderboard endpoints
│   ├── playerRoutes.js             # Player endpoints
│   └── scoreRoutes.js              # Score endpoints
├── server.js                        # Main server file
├── package.json                     # Dependencies
├── .env                             # Environment variables
└── README.md                        # Documentation
```

## 🌐 Web App Structure (React)

```
lords_arena_web/
├── public/
│   ├── assets/
│   │   ├── audio/                   # Game sounds
│   │   └── images/                  # Game assets
│   └── index.html                   # Main HTML
├── src/
│   ├── Auth/                        # Authentication
│   │   ├── component/               # Auth components
│   │   └── css/                     # Auth styles
│   ├── landing_page/                # Main game
│   │   ├── component/               # Game components
│   │   │   ├── dashboard/           # Dashboard UI
│   │   │   └── game/                # Game logic
│   │   └── css/                     # Game styles
│   ├── utils/                       # Utility functions
│   └── App.tsx                      # Main app component
└── package.json                     # Dependencies
```

## 🔄 Data Flow Architecture

```
┌─────────────────┐    HTTP/Socket.IO    ┌─────────────────┐
│   Android App   │ ◄─────────────────► │   Backend API   │
│   (Flutter)     │                     │   (Node.js)      │
└─────────────────┘                     └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   Local Cache   │                     │   MongoDB DB    │
│   (Hive)        │                     │   (Atlas/Local) │
└─────────────────┘                     └─────────────────┘
```

## 🎮 Game Features Architecture

### Authentication Flow
```
User Input → AuthCubit → AuthRepository → AuthDataSource → Backend API → MongoDB
```

### Game Session Flow
```
Game Start → GameCubit → GameRepository → GameApiService → Backend API → Socket.IO
```

### Multiplayer Flow
```
Player Action → Socket.IO → Backend → Socket.IO → Other Players
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  xp: Number,
  coins: Number,
  level: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Scores Collection
```javascript
{
  _id: ObjectId,
  username: String,
  score: Number,
  gameMode: String,
  timestamp: Date
}
```

### Characters Collection
```javascript
{
  _id: ObjectId,
  name: String,
  type: String,
  stats: {
    health: Number,
    speed: Number,
    damage: Number
  },
  unlocked: Boolean,
  price: Number
}
```

## 🔧 Technology Stack

### Frontend (Android)
- **Framework**: Flutter
- **State Management**: BLoC/Cubit
- **Local Storage**: Hive
- **HTTP Client**: http package
- **WebSocket**: socket_io_client
- **Game Engine**: Flame

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Password Hashing**: bcryptjs

### Web App
- **Framework**: React
- **Language**: TypeScript
- **Game Engine**: Phaser.js
- **Styling**: CSS
- **HTTP Client**: Axios

## 🚀 Deployment Architecture

```
Production Environment
├── Load Balancer (Nginx)
├── Backend Servers (Node.js)
├── MongoDB Cluster (Atlas)
├── CDN (Static Assets)
└── Mobile Apps (App Store/Play Store)
```

## 📊 Monitoring & Analytics

- **Backend Logs**: Console + File logging
- **Database Monitoring**: MongoDB Atlas
- **Performance**: Response time tracking
- **Error Tracking**: Try-catch with logging
- **User Analytics**: Game session tracking

## 🔒 Security Architecture

- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Data Protection**: Password hashing
- **Input Validation**: Request sanitization
- **CORS**: Cross-origin configuration
- **Rate Limiting**: API protection

---

*This structure provides a scalable, maintainable architecture for the Lords Arena multiplayer game ecosystem.* 