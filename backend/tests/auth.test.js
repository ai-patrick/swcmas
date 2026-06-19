const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

const BASE = '/api/v1/auth';

// Test user credentials
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test_${Date.now()}@swcmas.test`,
  password: 'SecurePass123!',
  role: 'resident',
};

let authToken;

beforeAll(async () => {
  // Wait for DB connection
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  // Clean up test user
  if (testUser.email) {
    const User = require('../src/models/User');
    await User.deleteMany({ email: testUser.email });
  }
  await mongoose.connection.close();
});

describe('Auth — POST /auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app).post(`${BASE}/register`).send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should reject duplicate email with 409', async () => {
    const res = await request(app).post(`${BASE}/register`).send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields with 400', async () => {
    const res = await request(app).post(`${BASE}/register`).send({ email: 'bad@test.com' });
    expect(res.status).toBe(400);
  });

  it('should reject weak password', async () => {
    const res = await request(app).post(`${BASE}/register`).send({
      ...testUser,
      email: 'weak@test.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /auth/login', () => {
  it('should login with valid credentials and return JWT', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    authToken = res.body.data.token;
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: testUser.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
  });

  it('should reject non-existent email with 401', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'nobody@swcmas.test',
      password: 'AnyPass123!',
    });
    expect(res.status).toBe(401);
  });
});

describe('Auth — GET /auth/me', () => {
  it('should return current user when authenticated', async () => {
    // Ensure we have a token from previous test
    if (!authToken) {
      const loginRes = await request(app).post(`${BASE}/login`).send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = loginRes.body.data?.token;
    }

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

describe('Auth — POST /auth/logout', () => {
  it('should logout and return 200', async () => {
    if (!authToken) return;
    const res = await request(app)
      .post(`${BASE}/logout`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
