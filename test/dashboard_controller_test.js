const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Score = require('../models/Score');

let mongoServer;
let authToken;
let userId;

beforeAll(async() => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async() => {
    await User.deleteMany({});
    await Score.deleteMany({});

    const userData = {
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'password123'
    };

    const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send(userData);

    authToken = signupResponse.body.token;
    userId = signupResponse.body.userId;
});

describe('DashboardController Tests', () => {
    describe('GET /api/dashboard/:userId', () => {
        beforeEach(async() => {
            const scores = [
                { username: 'testuser', score: 1500, gameMode: 'multiplayer', date: new Date() },
                { username: 'testuser', score: 1200, gameMode: 'multiplayer', date: new Date() },
                { username: 'testuser', score: 1800, gameMode: 'multiplayer', date: new Date() },
                { username: 'testuser', score: 900, gameMode: 'singleplayer', date: new Date() },
                { username: 'testuser', score: 1100, gameMode: 'singleplayer', date: new Date() }
            ];

            for (const score of scores) {
                await Score.create(score);
            }
        });

        test('should get dashboard data successfully', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('recentGames');
            expect(response.body).toHaveProperty('leaderboard');

            expect(response.body.user).toHaveProperty('username', 'testuser');
            expect(response.body.user).toHaveProperty('level');
            expect(response.body.user).toHaveProperty('xp');
            expect(response.body.user).toHaveProperty('coins');

            expect(Array.isArray(response.body.recentGames)).toBe(true);
            expect(Array.isArray(response.body.leaderboard)).toBe(true);
        });

        test('should return 401 for missing token', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('No token provided');
        });

        test('should return 404 for empty userId', async() => {
            const response = await request(app)
                .get('/api/dashboard/')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        test('should handle user with no games', async() => {
            await Score.deleteMany({});

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('username', 'testuser');
            expect(response.body.recentGames).toEqual([]);
            expect(response.body.leaderboard).toEqual([]);
        });

        test('should include recent games data', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.recentGames.length).toBeGreaterThan(0);

            response.body.recentGames.forEach(game => {
                expect(game).toHaveProperty('sessionId');
                expect(game).toHaveProperty('score');
                expect(game).toHaveProperty('result');
                expect(game).toHaveProperty('date');
            });
        });

        test('should include leaderboard data', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBeGreaterThan(0);

            response.body.leaderboard.forEach(entry => {
                expect(entry).toHaveProperty('username');
                expect(entry).toHaveProperty('score');
                expect(entry).toHaveProperty('rank');
            });
        });

        test('should handle special characters in userId', async() => {
            const specialUserId = 'user_123@test#456';

            const response = await request(app)
                .get(`/api/dashboard/${specialUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('username');
        });

        test('should handle very long userId', async() => {
            const longUserId = 'a'.repeat(1000);

            const response = await request(app)
                .get(`/api/dashboard/${longUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('username');
        });

        test('should handle unicode characters in userId', async() => {
            const unicodeUserId = 'user_123_测试';

            const response = await request(app)
                .get(`/api/dashboard/${unicodeUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('username');
        });

        test('should handle concurrent dashboard requests', async() => {
            const promises = Array(5).fill().map(() =>
                request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
            );

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('user');
                expect(response.body).toHaveProperty('recentGames');
                expect(response.body).toHaveProperty('leaderboard');
            });
        });
    });

    describe('User Statistics Tests', () => {
        test('should calculate user level correctly', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('level');
            expect(typeof response.body.user.level).toBe('number');
            expect(response.body.user.level).toBeGreaterThanOrEqual(1);
        });

        test('should calculate XP correctly', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('xp');
            expect(typeof response.body.user.xp).toBe('number');
            expect(response.body.user.xp).toBeGreaterThanOrEqual(0);
        });

        test('should calculate coins correctly', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('coins');
            expect(typeof response.body.user.coins).toBe('number');
            expect(response.body.user.coins).toBeGreaterThanOrEqual(0);
        });

        test('should handle new user with no statistics', async() => {
            await Score.deleteMany({});

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.level).toBe(1);
            expect(response.body.user.xp).toBe(0);
            expect(response.body.user.coins).toBe(0);
        });

        test('should calculate level based on total score', async() => {
            const highScores = [
                { username: 'testuser', score: 5000, gameMode: 'multiplayer' },
                { username: 'testuser', score: 3000, gameMode: 'multiplayer' },
                { username: 'testuser', score: 4000, gameMode: 'multiplayer' }
            ];

            for (const score of highScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.level).toBeGreaterThan(1);
        });

        test('should calculate XP based on games played', async() => {
            const manyGames = Array(20).fill().map((_, index) => ({
                username: 'testuser',
                score: 1000 + index * 100,
                gameMode: 'multiplayer'
            }));

            for (const score of manyGames) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.xp).toBeGreaterThan(0);
        });

        test('should calculate coins based on performance', async() => {
            const performanceGames = [
                { username: 'testuser', score: 2000, gameMode: 'multiplayer' },
                { username: 'testuser', score: 1500, gameMode: 'multiplayer' },
                { username: 'testuser', score: 1800, gameMode: 'multiplayer' }
            ];

            for (const score of performanceGames) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.coins).toBeGreaterThan(0);
        });

        test('should handle mixed game modes for statistics', async() => {
            const mixedGames = [
                { username: 'testuser', score: 1500, gameMode: 'multiplayer' },
                { username: 'testuser', score: 1200, gameMode: 'singleplayer' },
                { username: 'testuser', score: 1800, gameMode: 'practice' }
            ];

            for (const score of mixedGames) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('level');
            expect(response.body.user).toHaveProperty('xp');
            expect(response.body.user).toHaveProperty('coins');
        });

        test('should handle very high scores', async() => {
            const highScores = [
                { username: 'testuser', score: 99999, gameMode: 'multiplayer' },
                { username: 'testuser', score: 88888, gameMode: 'multiplayer' },
                { username: 'testuser', score: 77777, gameMode: 'multiplayer' }
            ];

            for (const score of highScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user.level).toBeGreaterThan(1);
            expect(response.body.user.xp).toBeGreaterThan(0);
            expect(response.body.user.coins).toBeGreaterThan(0);
        });

        test('should handle zero scores', async() => {
            const zeroScores = [
                { username: 'testuser', score: 0, gameMode: 'multiplayer' },
                { username: 'testuser', score: 0, gameMode: 'singleplayer' },
                { username: 'testuser', score: 0, gameMode: 'practice' }
            ];

            for (const score of zeroScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('level');
            expect(response.body.user).toHaveProperty('xp');
            expect(response.body.user).toHaveProperty('coins');
        });
    });

    describe('Recent Games Tests', () => {
        test('should limit recent games to 10 by default', async() => {
            const manyGames = Array(15).fill().map((_, index) => ({
                username: 'testuser',
                score: 1000 + index * 100,
                gameMode: 'multiplayer',
                date: new Date()
            }));

            for (const score of manyGames) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.recentGames.length).toBeLessThanOrEqual(10);
        });

        test('should sort recent games by date descending', async() => {
            const games = [
                { username: 'testuser', score: 1000, gameMode: 'multiplayer', date: new Date('2024-01-01') },
                { username: 'testuser', score: 2000, gameMode: 'multiplayer', date: new Date('2024-01-02') },
                { username: 'testuser', score: 3000, gameMode: 'multiplayer', date: new Date('2024-01-03') }
            ];

            for (const score of games) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const dates = response.body.recentGames.map(game => new Date(game.date));
            expect(dates).toEqual([...dates].sort((a, b) => b - a));
        });

        test('should include game result information', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            response.body.recentGames.forEach(game => {
                expect(game).toHaveProperty('result');
                expect(['win', 'loss', 'draw']).toContain(game.result);
            });
        });

        test('should handle games with no date', async() => {
            const gamesWithoutDate = [
                { username: 'testuser', score: 1000, gameMode: 'multiplayer' },
                { username: 'testuser', score: 2000, gameMode: 'multiplayer' }
            ];

            for (const score of gamesWithoutDate) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.recentGames.length).toBeGreaterThan(0);
        });

        test('should handle games with invalid dates', async() => {
            const gamesWithInvalidDate = [
                { username: 'testuser', score: 1000, gameMode: 'multiplayer', date: 'invalid-date' },
                { username: 'testuser', score: 2000, gameMode: 'multiplayer', date: null }
            ];

            for (const score of gamesWithInvalidDate) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.recentGames.length).toBeGreaterThan(0);
        });
    });

    describe('Leaderboard Tests', () => {
        test('should include current user in leaderboard', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const currentUserInLeaderboard = response.body.leaderboard.find(
                entry => entry.username === 'testuser'
            );

            expect(currentUserInLeaderboard).toBeDefined();
        });

        test('should sort leaderboard by score descending', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const scores = response.body.leaderboard.map(entry => entry.score);
            expect(scores).toEqual([...scores].sort((a, b) => b - a));
        });

        test('should include rank information', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            response.body.leaderboard.forEach((entry, index) => {
                expect(entry).toHaveProperty('rank');
                expect(entry.rank).toBe(index + 1);
            });
        });

        test('should limit leaderboard to top players', async() => {
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBeLessThanOrEqual(10);
        });

        test('should handle empty leaderboard', async() => {
            await Score.deleteMany({});

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard).toEqual([]);
        });

        test('should handle leaderboard with only current user', async() => {
            await Score.deleteMany({});

            const userScore = { username: 'testuser', score: 1500, gameMode: 'multiplayer' };
            await Score.create(userScore);

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBe(1);
            expect(response.body.leaderboard[0].username).toBe('testuser');
            expect(response.body.leaderboard[0].rank).toBe(1);
        });

        test('should handle duplicate scores in leaderboard', async() => {
            const duplicateScores = [
                { username: 'player1', score: 1500, gameMode: 'multiplayer' },
                { username: 'player2', score: 1500, gameMode: 'multiplayer' },
                { username: 'player3', score: 1500, gameMode: 'multiplayer' }
            ];

            for (const score of duplicateScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBeGreaterThan(0);
        });

        test('should handle negative scores in leaderboard', async() => {
            const negativeScores = [
                { username: 'player1', score: -100, gameMode: 'multiplayer' },
                { username: 'player2', score: -200, gameMode: 'multiplayer' },
                { username: 'player3', score: -300, gameMode: 'multiplayer' }
            ];

            for (const score of negativeScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBeGreaterThan(0);
        });

        test('should handle very high scores in leaderboard', async() => {
            const highScores = [
                { username: 'player1', score: 999999, gameMode: 'multiplayer' },
                { username: 'player2', score: 888888, gameMode: 'multiplayer' },
                { username: 'player3', score: 777777, gameMode: 'multiplayer' }
            ];

            for (const score of highScores) {
                await Score.create(score);
            }

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.leaderboard.length).toBeGreaterThan(0);
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle database connection errors', async() => {
            await mongoose.disconnect();

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(500);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Internal server error');

            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
        });

        test('should handle malformed token', async() => {
            const malformedToken = 'invalid.token.here';

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${malformedToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid token');
        });

        test('should handle expired token', async() => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDF9.invalid';

            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Token expired');
        });

        test('should handle concurrent dashboard requests', async() => {
            const promises = Array(10).fill().map(() =>
                request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
            );

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('user');
                expect(response.body).toHaveProperty('recentGames');
                expect(response.body).toHaveProperty('leaderboard');
            });
        });

        test('should handle large number of games efficiently', async() => {
            const manyGames = Array(1000).fill().map((_, index) => ({
                username: 'testuser',
                score: 1000 + index,
                gameMode: 'multiplayer',
                date: new Date()
            }));

            for (const score of manyGames) {
                await Score.create(score);
            }

            const startTime = Date.now();
            const response = await request(app)
                .get(`/api/dashboard/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(5000);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('recentGames');
            expect(response.body).toHaveProperty('leaderboard');
        });
    });
});