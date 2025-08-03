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

describe('GameController Tests', () => {
    describe('POST /api/game/session/create', () => {
        test('should create game session with valid data', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'multiplayer',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(201);

            expect(response.body).toHaveProperty('sessionId');
            expect(response.body).toHaveProperty('status', 'waiting');
            expect(response.body).toHaveProperty('players');
            expect(response.body).toHaveProperty('createdAt');
        });

        test('should return 400 for missing userId', async() => {
            const sessionData = {
                gameMode: 'multiplayer',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 400 for invalid game mode', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'invalid_mode',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid game mode');
        });

        test('should return 401 for missing token', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'multiplayer',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .send(sessionData)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('No token provided');
        });

        test('should handle different weapon types', async() => {
            const weapons = ['rifle', 'pistol', 'shotgun', 'sniper'];

            for (const weapon of weapons) {
                const sessionData = {
                    userId: userId,
                    gameMode: 'multiplayer',
                    selectedWeapon: weapon,
                    selectedCharacter: 'kp'
                };

                const response = await request(app)
                    .post('/api/game/session/create')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(sessionData)
                    .expect(201);

                expect(response.body).toHaveProperty('sessionId');
            }
        });

        test('should handle different character types', async() => {
            const characters = ['kp', 'sher', 'prachanda'];

            for (const character of characters) {
                const sessionData = {
                    userId: userId,
                    gameMode: 'multiplayer',
                    selectedWeapon: 'rifle',
                    selectedCharacter: character
                };

                const response = await request(app)
                    .post('/api/game/session/create')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(sessionData)
                    .expect(201);

                expect(response.body).toHaveProperty('sessionId');
            }
        });

        test('should handle single player mode', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'singleplayer',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(201);

            expect(response.body).toHaveProperty('sessionId');
            expect(response.body).toHaveProperty('status', 'active');
        });

        test('should handle practice mode', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'practice',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(201);

            expect(response.body).toHaveProperty('sessionId');
            expect(response.body).toHaveProperty('status', 'active');
        });

        test('should handle empty weapon selection', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'multiplayer',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(201);

            expect(response.body).toHaveProperty('sessionId');
        });

        test('should handle empty character selection', async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'multiplayer',
                selectedWeapon: 'rifle'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData)
                .expect(201);

            expect(response.body).toHaveProperty('sessionId');
        });
    });

    describe('POST /api/game/session/:sessionId/action', () => {
        let sessionId;

        beforeEach(async() => {
            const sessionData = {
                userId: userId,
                gameMode: 'multiplayer',
                selectedWeapon: 'rifle',
                selectedCharacter: 'kp'
            };

            const response = await request(app)
                .post('/api/game/session/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(sessionData);

            sessionId = response.body.sessionId;
        });

        test('should send game action successfully', async() => {
            const actionData = {
                userId: userId,
                action: 'shoot',
                actionData: {
                    x: 100,
                    y: 200,
                    weapon: 'rifle'
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Action processed');
        });

        test('should return 400 for missing userId', async() => {
            const actionData = {
                action: 'shoot',
                actionData: {
                    x: 100,
                    y: 200,
                    weapon: 'rifle'
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 400 for missing action', async() => {
            const actionData = {
                userId: userId,
                actionData: {
                    x: 100,
                    y: 200,
                    weapon: 'rifle'
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should handle different action types', async() => {
            const actions = ['shoot', 'move', 'jump', 'reload', 'switch_weapon'];

            for (const action of actions) {
                const actionData = {
                    userId: userId,
                    action: action,
                    actionData: {
                        x: 100,
                        y: 200,
                        weapon: 'rifle'
                    }
                };

                const response = await request(app)
                    .post(`/api/game/session/${sessionId}/action`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(actionData)
                    .expect(200);

                expect(response.body).toHaveProperty('success', true);
            }
        });

        test('should handle move action with coordinates', async() => {
            const actionData = {
                userId: userId,
                action: 'move',
                actionData: {
                    x: 150,
                    y: 250,
                    direction: 'up'
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle jump action', async() => {
            const actionData = {
                userId: userId,
                action: 'jump',
                actionData: {
                    x: 100,
                    y: 200,
                    height: 50
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle reload action', async() => {
            const actionData = {
                userId: userId,
                action: 'reload',
                actionData: {
                    weapon: 'rifle',
                    ammo: 30
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle switch weapon action', async() => {
            const actionData = {
                userId: userId,
                action: 'switch_weapon',
                actionData: {
                    fromWeapon: 'rifle',
                    toWeapon: 'pistol'
                }
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle empty action data', async() => {
            const actionData = {
                userId: userId,
                action: 'shoot',
                actionData: {}
            };

            const response = await request(app)
                .post(`/api/game/session/${sessionId}/action`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should return 404 for invalid session', async() => {
            const actionData = {
                userId: userId,
                action: 'shoot',
                actionData: {
                    x: 100,
                    y: 200,
                    weapon: 'rifle'
                }
            };

            const response = await request(app)
                .post('/api/game/session/invalid_session/action')
                .set('Authorization', `Bearer ${authToken}`)
                .send(actionData)
                .expect(404);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Session not found');
        });
    });

    describe('GET /api/game/leaderboard', () => {
        beforeEach(async() => {
            const scores = [
                { username: 'player1', score: 1500, gameMode: 'multiplayer' },
                { username: 'player2', score: 1200, gameMode: 'multiplayer' },
                { username: 'player3', score: 1800, gameMode: 'multiplayer' },
                { username: 'player4', score: 900, gameMode: 'singleplayer' },
                { username: 'player5', score: 1100, gameMode: 'singleplayer' }
            ];

            for (const score of scores) {
                await Score.create(score);
            }
        });

        test('should get leaderboard successfully', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard')
                .expect(200);

            expect(response.body).toHaveProperty('leaderboard');
            expect(Array.isArray(response.body.leaderboard)).toBe(true);
            expect(response.body.leaderboard.length).toBeGreaterThan(0);
        });

        test('should limit results by default', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard')
                .expect(200);

            expect(response.body.leaderboard.length).toBeLessThanOrEqual(10);
        });

        test('should respect limit parameter', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard?limit=3')
                .expect(200);

            expect(response.body.leaderboard.length).toBe(3);
        });

        test('should filter by game mode', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard?gameMode=singleplayer')
                .expect(200);

            expect(response.body.leaderboard.length).toBe(2);
            response.body.leaderboard.forEach(entry => {
                expect(entry.gameMode).toBe('singleplayer');
            });
        });

        test('should sort by score in descending order', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard')
                .expect(200);

            const scores = response.body.leaderboard.map(entry => entry.score);
            expect(scores).toEqual([...scores].sort((a, b) => b - a));
        });

        test('should include rank information', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard')
                .expect(200);

            response.body.leaderboard.forEach((entry, index) => {
                expect(entry).toHaveProperty('rank');
                expect(entry.rank).toBe(index + 1);
            });
        });

        test('should handle empty leaderboard', async() => {
            await Score.deleteMany({});

            const response = await request(app)
                .get('/api/game/leaderboard')
                .expect(200);

            expect(response.body.leaderboard).toEqual([]);
        });

        test('should handle invalid limit parameter', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard?limit=invalid')
                .expect(200);

            expect(response.body.leaderboard.length).toBeLessThanOrEqual(10);
        });

        test('should handle very large limit', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard?limit=1000')
                .expect(200);

            expect(response.body.leaderboard.length).toBeLessThanOrEqual(1000);
        });

        test('should handle non-existent game mode', async() => {
            const response = await request(app)
                .get('/api/game/leaderboard?gameMode=nonexistent')
                .expect(200);

            expect(response.body.leaderboard).toEqual([]);
        });
    });

    describe('POST /api/game/results', () => {
        test('should save game results successfully', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Results saved');
        });

        test('should return 400 for missing sessionId', async() => {
            const gameResult = {
                userId: userId,
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 400 for missing userId', async() => {
            const gameResult = {
                sessionId: 'session123',
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should handle negative score values', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: -100,
                    kills: -5,
                    deaths: 3,
                    duration: 300
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle zero values', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 0,
                    kills: 0,
                    deaths: 0,
                    duration: 0
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle very high score values', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 999999,
                    kills: 1000,
                    deaths: 500,
                    duration: 3600
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle missing game result fields', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {}
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should handle additional game result fields', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300,
                    accuracy: 85.5,
                    headshots: 5,
                    assists: 2
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        test('should return 401 for missing token', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300
                }
            };

            const response = await request(app)
                .post('/api/game/results')
                .send(gameResult)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('No token provided');
        });

        test('should handle concurrent result submissions', async() => {
            const gameResult = {
                sessionId: 'session123',
                userId: userId,
                gameResult: {
                    score: 1500,
                    kills: 15,
                    deaths: 3,
                    duration: 300
                }
            };

            const promises = Array(5).fill().map(() =>
                request(app)
                .post('/api/game/results')
                .set('Authorization', `Bearer ${authToken}`)
                .send(gameResult)
            );

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            });
        });
    });

    describe('GET /api/game/stats/:userId', () => {
        beforeEach(async() => {
            const scores = [
                { username: 'testuser', score: 1500, gameMode: 'multiplayer' },
                { username: 'testuser', score: 1200, gameMode: 'multiplayer' },
                { username: 'testuser', score: 1800, gameMode: 'multiplayer' },
                { username: 'testuser', score: 900, gameMode: 'singleplayer' },
                { username: 'testuser', score: 1100, gameMode: 'singleplayer' }
            ];

            for (const score of scores) {
                await Score.create(score);
            }
        });

        test('should get user stats successfully', async() => {
            const response = await request(app)
                .get(`/api/game/stats/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('userId', userId);
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('totalGames');
            expect(response.body.stats).toHaveProperty('wins');
            expect(response.body.stats).toHaveProperty('losses');
            expect(response.body.stats).toHaveProperty('averageScore');
            expect(response.body.stats).toHaveProperty('bestScore');
            expect(response.body.stats).toHaveProperty('totalKills');
            expect(response.body.stats).toHaveProperty('totalDeaths');
        });

        test('should return 400 for empty userId', async() => {
            const response = await request(app)
                .get('/api/game/stats/')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        test('should return 401 for missing token', async() => {
            const response = await request(app)
                .get(`/api/game/stats/${userId}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('No token provided');
        });

        test('should handle user with no games', async() => {
            await Score.deleteMany({});

            const response = await request(app)
                .get(`/api/game/stats/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.stats.totalGames).toBe(0);
            expect(response.body.stats.wins).toBe(0);
            expect(response.body.stats.losses).toBe(0);
            expect(response.body.stats.averageScore).toBe(0);
            expect(response.body.stats.bestScore).toBe(0);
            expect(response.body.stats.totalKills).toBe(0);
            expect(response.body.stats.totalDeaths).toBe(0);
        });

        test('should calculate correct statistics', async() => {
            const response = await request(app)
                .get(`/api/game/stats/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.stats.totalGames).toBe(5);
            expect(response.body.stats.bestScore).toBe(1800);
            expect(response.body.stats.averageScore).toBe(1300);
        });

        test('should handle special characters in userId', async() => {
            const specialUserId = 'user_123@test#456';

            const response = await request(app)
                .get(`/api/game/stats/${specialUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('userId', specialUserId);
        });

        test('should handle very long userId', async() => {
            const longUserId = 'a'.repeat(1000);

            const response = await request(app)
                .get(`/api/game/stats/${longUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('userId', longUserId);
        });

        test('should handle unicode characters in userId', async() => {
            const unicodeUserId = 'user_123_测试';

            const response = await request(app)
                .get(`/api/game/stats/${unicodeUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('userId', unicodeUserId);
        });

        test('should handle whitespace in userId', async() => {
            const userIdWithSpaces = '  user123  ';

            const response = await request(app)
                .get(`/api/game/stats/${userIdWithSpaces}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('userId', userIdWithSpaces);
        });

        test('should handle concurrent stat requests', async() => {
            const promises = Array(5).fill().map(() =>
                request(app)
                .get(`/api/game/stats/${userId}`)
                .set('Authorization', `Bearer ${authToken}`)
            );

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('userId', userId);
            });
        });
    });
});