# 🚀 Lords Arena Complete Setup Guide

## 📋 Overview

This guide will help you set up the complete Lords Arena ecosystem with MongoDB database, including the Android app, backend server, and web application.

## 🎯 What You'll Get

- ✅ **Android App** (Flutter) - Mobile game client
- ✅ **Backend Server** (Node.js) - API & multiplayer
- ✅ **Web App** (React) - Browser-based game
- ✅ **MongoDB Database** - Data persistence
- ✅ **Real-time Multiplayer** - Socket.IO
- ✅ **Authentication System** - JWT-based

## 🛠️ Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **Flutter SDK** (v3.0 or higher)
- **MongoDB** (v5.0 or higher)
- **Git** (for version control)
- **Android Studio** (for Android development)

### System Requirements
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **OS**: Windows 10/11, macOS, or Linux

## 📦 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IdeaProjects
```

### 2. Install MongoDB

#### Windows (Recommended)
```bash
# Using winget
winget install MongoDB.Server

# Or download from MongoDB website
# https://www.mongodb.com/try/download/community
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 3. Start MongoDB Service

#### Windows
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### macOS
```bash
# Start MongoDB service
brew services start mongodb-community
```

#### Linux
```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Set Up Backend Server

```bash
cd lords_arena_backend

# Install dependencies
npm install

# Create environment file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/lords_arena" >> .env
echo "JWT_SECRET=your_super_secret_jwt_key_here_change_in_production" >> .env
echo "NODE_ENV=development" >> .env

# Start the server
npm start
```

### 5. Set Up Android App

```bash
cd lords_arena_android

# Install Flutter dependencies
flutter pub get

# Run the app
flutter run
```

### 6. Set Up Web App (Optional)

```bash
cd lords_arena_web

# Install dependencies
npm install

# Start development server
npm start
```

## 🔧 Configuration

### Backend Configuration

#### Environment Variables (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lords_arena
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

#### Database Configuration
- **Database Name**: `lords_arena`
- **Collections**: `users`, `scores`, `characters`, `players`
- **Connection**: `mongodb://localhost:27017`

### Android App Configuration

#### API Base URL
The app automatically detects the platform and uses:
- **Android**: `http://192.168.118.207:5000`
- **Web**: `http://localhost:5000`
- **iOS/Desktop**: `http://localhost:5000`

## 🎮 Testing the Setup

### 1. Test Backend API

```bash
# Test server health
curl http://localhost:5000/api/auth/signup

# Test MongoDB connection
curl http://localhost:5000/api/dashboard/dashboard
```

### 2. Test Android App

1. **Connect your Android device**
2. **Run the app**: `flutter run`
3. **Try signing up** with a new account
4. **Test login** with the same credentials
5. **Navigate through** all game screens

### 3. Test Web App

1. **Open browser**: `http://localhost:3000`
2. **Sign up/login** to test authentication
3. **Play the game** to test multiplayer

## 🗄️ Database Management

### MongoDB Compass (GUI)

1. **Download MongoDB Compass**
2. **Connect to**: `mongodb://localhost:27017`
3. **Browse collections**: `lords_arena` database

### Database Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  xp: Number,
  coins: Number,
  level: Number
}
```

#### Scores Collection
```javascript
{
  _id: ObjectId,
  username: String,
  score: Number,
  timestamp: Date
}
```

## 🚀 Production Deployment

### Backend Deployment

#### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server.js --name "lords-arena-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker
```bash
# Build Docker image
docker build -t lords-arena-backend .

# Run container
docker run -p 5000:5000 lords-arena-backend
```

### MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas account**
2. **Create cluster**
3. **Get connection string**
4. **Update MONGO_URI in .env**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lords_arena
```

## 🔒 Security Checklist

- [ ] **Change JWT_SECRET** in production
- [ ] **Enable HTTPS** for production
- [ ] **Set up CORS** properly
- [ ] **Configure rate limiting**
- [ ] **Set up monitoring**
- [ ] **Backup database** regularly

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
netstat -an | findstr :27017

# Start MongoDB service
net start MongoDB
```

#### Android App Can't Connect
```bash
# Check server IP address
ipconfig

# Update baseUrl in Android app
# lib/features/auth/data/datasources/auth_remote_data_source.dart
```

#### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F
```

## 📊 Monitoring

### Backend Logs
```bash
# View real-time logs
pm2 logs lords-arena-backend

# Monitor performance
pm2 monit
```

### Database Monitoring
```bash
# Check MongoDB status
mongo --eval "db.serverStatus()"

# Monitor connections
mongo --eval "db.currentOp()"
```

## 🎯 Next Steps

1. **Customize game assets** (images, sounds)
2. **Add more game features** (power-ups, levels)
3. **Implement analytics** (user behavior tracking)
4. **Add admin dashboard** (user management)
5. **Optimize performance** (caching, indexing)
6. **Add tests** (unit, integration)

## 📞 Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify all services** are running
3. **Test each component** individually
4. **Check network connectivity**
5. **Review configuration** files

---

**🎮 Your Lords Arena game is now ready to play! Enjoy the multiplayer experience!** 