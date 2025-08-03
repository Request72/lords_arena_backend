const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');

let mongoServer;

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
});

describe('AuthController Tests', () => {
    describe('POST /api/auth/signup', () => {
        test('should create new user with valid data', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('email', 'test@gmail.com');
        });

        test('should return 400 for missing username', async() => {
            const userData = {
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 400 for missing email', async() => {
            const userData = {
                username: 'testuser',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 400 for missing password', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing required fields');
        });

        test('should return 409 for duplicate email', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(409);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('User already exists');
        });

        test('should return 409 for duplicate username', async() => {
            const userData1 = {
                username: 'testuser',
                email: 'test1@gmail.com',
                password: 'password123'
            };

            const userData2 = {
                username: 'testuser',
                email: 'test2@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData1)
                .expect(201);

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData2)
                .expect(409);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('User already exists');
        });

        test('should handle invalid email format', async() => {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid email format');
        });

        test('should handle short password', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: '123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Password must be at least 6 characters');
        });

        test('should handle special characters in username', async() => {
            const userData = {
                username: 'test_user@123',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('username', 'test_user@123');
        });

        test('should handle unicode characters', async() => {
            const userData = {
                username: 'test_用户_123',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('username', 'test_用户_123');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData);
        });

        test('should login with valid credentials', async() => {
            const loginData = {
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('email', 'test@gmail.com');
        });

        test('should return 400 for missing email', async() => {
            const loginData = {
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing email or password');
        });

        test('should return 400 for missing password', async() => {
            const loginData = {
                email: 'test@gmail.com'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing email or password');
        });

        test('should return 404 for non-existent user', async() => {
            const loginData = {
                email: 'nonexistent@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(404);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('User not found');
        });

        test('should return 401 for wrong password', async() => {
            const loginData = {
                email: 'test@gmail.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid credentials');
        });

        test('should handle case-insensitive email', async() => {
            const loginData = {
                email: 'TEST@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('email', 'test@gmail.com');
        });

        test('should handle whitespace in email', async() => {
            const loginData = {
                email: '  test@gmail.com  ',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('email', 'test@gmail.com');
        });

        test('should handle special characters in password', async() => {
            const userData = {
                username: 'testuser2',
                email: 'test2@gmail.com',
                password: 'P@ssw0rd!'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test2@gmail.com',
                password: 'P@ssw0rd!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });

        test('should handle very long password', async() => {
            const longPassword = 'a'.repeat(1000);
            const userData = {
                username: 'testuser3',
                email: 'test3@gmail.com',
                password: longPassword
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test3@gmail.com',
                password: longPassword
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });

        test('should handle empty request body', async() => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Missing email or password');
        });
    });

    describe('JWT Token Tests', () => {
        let authToken;

        beforeEach(async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const signupResponse = await request(app)
                .post('/api/auth/signup')
                .send(userData);

            authToken = signupResponse.body.token;
        });

        test('should have valid JWT token structure', () => {
            expect(authToken).toBeDefined();
            expect(typeof authToken).toBe('string');
            expect(authToken.split('.').length).toBe(3);
        });

        test('should contain user information in token', () => {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

            expect(payload).toHaveProperty('id');
            expect(payload).toHaveProperty('email', 'test@gmail.com');
            expect(payload).toHaveProperty('iat');
            expect(payload).toHaveProperty('exp');
        });

        test('should have token expiration', () => {
            const tokenParts = authToken.split('.');
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

            expect(payload.exp).toBeGreaterThan(payload.iat);
            expect(payload.exp - payload.iat).toBeGreaterThan(0);
        });

        test('should handle malformed token', async() => {
            const malformedToken = 'invalid.token.here';

            const response = await request(app)
                .get('/api/dashboard/testuser')
                .set('Authorization', `Bearer ${malformedToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid token');
        });

        test('should handle missing token', async() => {
            const response = await request(app)
                .get('/api/dashboard/testuser')
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('No token provided');
        });

        test('should handle expired token', async() => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDF9.invalid';

            const response = await request(app)
                .get('/api/dashboard/testuser')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Token expired');
        });

        test('should handle token without user ID', async() => {
            const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.invalid';

            const response = await request(app)
                .get('/api/dashboard/testuser')
                .set('Authorization', `Bearer ${invalidToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid token');
        });

        test('should handle token with wrong signature', async() => {
            const wrongSignatureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.wrongsignature';

            const response = await request(app)
                .get('/api/dashboard/testuser')
                .set('Authorization', `Bearer ${wrongSignatureToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid token');
        });

        test('should handle token with invalid algorithm', async() => {
            const invalidAlgoToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.invalid';

            const response = await request(app)
                .get('/api/dashboard/testuser')
                .set('Authorization', `Bearer ${invalidAlgoToken}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Invalid token');
        });
    });

    describe('Password Security Tests', () => {
        test('should hash password during signup', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const user = await User.findOne({ email: 'test@gmail.com' });
            expect(user.password).not.toBe('password123');
            expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
        });

        test('should verify password during login', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });

        test('should not verify wrong password', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test@gmail.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('error', true);
        });

        test('should handle password with special characters', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'P@ssw0rd!123'
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test@gmail.com',
                password: 'P@ssw0rd!123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });

        test('should handle very long password', async() => {
            const longPassword = 'a'.repeat(1000);
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: longPassword
            };

            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            const loginData = {
                email: 'test@gmail.com',
                password: longPassword
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
        });
    });

    describe('Input Validation Tests', () => {
        test('should validate email format', async() => {
            const invalidEmails = [
                'invalid-email',
                'test@',
                '@domain.com',
                '',
                'test..test@gmail.com',
                'test@.com',
                'test@gmail.',
            ];

            for (const email of invalidEmails) {
                const userData = {
                    username: 'testuser',
                    email: email,
                    password: 'password123'
                };

                const response = await request(app)
                    .post('/api/auth/signup')
                    .send(userData)
                    .expect(400);

                expect(response.body).toHaveProperty('error', true);
                expect(response.body.message).toContain('Invalid email format');
            }
        });

        test('should validate username length', async() => {
            const shortUsername = 'ab';
            const userData = {
                username: shortUsername,
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Username must be at least 3 characters');
        });

        test('should validate password length', async() => {
            const shortPassword = '123';
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: shortPassword
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Password must be at least 6 characters');
        });

        test('should handle SQL injection attempts', async() => {
            const maliciousData = {
                username: "'; DROP TABLE users; --",
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(maliciousData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.username).toBe("'; DROP TABLE users; --");
        });

        test('should handle XSS attempts', async() => {
            const maliciousData = {
                username: '<script>alert("xss")</script>',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(maliciousData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.username).toBe('<script>alert("xss")</script>');
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle database connection errors', async() => {
            await mongoose.disconnect();

            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(500);

            expect(response.body).toHaveProperty('error', true);
            expect(response.body.message).toContain('Internal server error');

            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
        });

        test('should handle malformed JSON', async() => {
            const response = await request(app)
                .post('/api/auth/signup')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);

            expect(response.body).toHaveProperty('error', true);
        });

        test('should handle large request body', async() => {
            const largeData = {
                username: 'a'.repeat(10000),
                email: 'test@gmail.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(largeData)
                .expect(413);

            expect(response.body).toHaveProperty('error', true);
        });

        test('should handle concurrent signup requests', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const promises = Array(5).fill().map(() =>
                request(app)
                .post('/api/auth/signup')
                .send(userData)
            );

            const responses = await Promise.all(promises);

            const successCount = responses.filter(r => r.status === 201).length;
            const conflictCount = responses.filter(r => r.status === 409).length;

            expect(successCount).toBe(1);
            expect(conflictCount).toBe(4);
        });

        test('should handle rate limiting', async() => {
            const userData = {
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'password123'
            };

            const promises = Array(100).fill().map(() =>
                request(app)
                .post('/api/auth/signup')
                .send(userData)
            );

            const responses = await Promise.all(promises);

            const rateLimitedCount = responses.filter(r => r.status === 429).length;
            expect(rateLimitedCount).toBeGreaterThan(0);
        });
    });
});