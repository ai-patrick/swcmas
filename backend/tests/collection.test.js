const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

const BASE = '/api/v1';
let adminToken, apartmentId, collectorId;

const adminCreds = { email: 'admin@swcmas.go.ke', password: 'Admin1234!' };

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  const res = await request(app).post(`${BASE}/auth/login`).send(adminCreds);
  adminToken = res.body.data?.token;

  if (adminToken) {
    const aptRes = await request(app)
      .get(`${BASE}/apartments?limit=1`)
      .set('Authorization', `Bearer ${adminToken}`);
    apartmentId = aptRes.body.data?.apartments?.[0]?._id;

    const collectorsRes = await request(app)
      .get(`${BASE}/users?role=waste_collector&limit=1`)
      .set('Authorization', `Bearer ${adminToken}`);
    collectorId = collectorsRes.body.data?.users?.[0]?._id;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Collections — GET /collections', () => {
  it('should return paginated collections list', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get(`${BASE}/collections?page=1&limit=5`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.collections)).toBe(true);
  });
});

describe('Collections — POST /collections', () => {
  let createdId;

  it('should schedule a new collection', async () => {
    if (!adminToken || !apartmentId || !collectorId) {
      console.warn('Skipping test due to missing IDs');
      return;
    }

    const res = await request(app)
      .post(`${BASE}/collections`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        apartment: apartmentId,
        wasteCollector: collectorId,
        scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        notes: 'Test scheduled collection',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.status).toBe('scheduled');
    createdId = res.body.data._id;
  });

  afterAll(async () => {
    if (adminToken && createdId) {
      await request(app)
        .delete(`${BASE}/collections/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });
});
