const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../src/models/user');
const List = require('../src/models/list');
const Lead = require('../src/models/lead');
const Campaign = require('../src/models/campaign');
const Setting = require('../src/models/setting');

const userA = { email: 'admin@example.com', password: 'password123' };
const userB = { email: 'user@example.com', password: 'password123' };

async function registerAndLogin(user) {
  await request(app).post('/oauth/register').send({ name: 'User', ...user });
  const res = await request(app)
    .post('/oauth/token')
    .send({ username: user.email, password: user.password });
  return res.body.token;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

beforeAll(async () => {
  await mongoose.connection.asPromise();
});

beforeEach(async () => {
  await User.deleteMany({});
  await List.deleteMany({});
  await Lead.deleteMany({});
  await Campaign.deleteMany({});
  await Setting.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('admin', () => {
  it('makes the first registered user admin and later ones plain users', async () => {
    await request(app).post('/oauth/register').send({ name: 'Admin', ...userA });
    await request(app).post('/oauth/register').send({ name: 'User', ...userB });

    const admin = await User.findOne({ email: userA.email });
    const user = await User.findOne({ email: userB.email });

    expect(admin.role).toBe('admin');
    expect(user.role).toBe('user');
  });

  it('returns role from /oauth/me', async () => {
    const token = await registerAndLogin(userA);
    const res = await request(app).get('/oauth/me').set(authHeader(token));
    expect(res.body.user.role).toBe('admin');
  });

  it('403s a non-admin on admin routes', async () => {
    const tokenA = await registerAndLogin(userA);
    const tokenB = await registerAndLogin(userB);

    const res = await request(app).get('/api/admin/users').set(authHeader(tokenB));
    expect(res.status).toBe(403);

    // sanity: admin gets through
    const okRes = await request(app).get('/api/admin/users').set(authHeader(tokenA));
    expect(okRes.status).toBe(200);
  });

  it('lists users and stats as admin', async () => {
    const tokenA = await registerAndLogin(userA);
    await registerAndLogin(userB);

    const usersRes = await request(app).get('/api/admin/users').set(authHeader(tokenA));
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.data).toHaveLength(2);
    expect(usersRes.body.data[0]).toHaveProperty('email');
    expect(usersRes.body.data[0]).toHaveProperty('role');
    expect(usersRes.body.data[0]).toHaveProperty('enabled');
    expect(usersRes.body.data[0]).toHaveProperty('createdAt');
    expect(usersRes.body.data[0]).not.toHaveProperty('password');

    const statsRes = await request(app).get('/api/admin/stats').set(authHeader(tokenA));
    expect(statsRes.status).toBe(200);
    expect(statsRes.body).toEqual({ users: 2, lists: 0, leads: 0, campaigns: 0 });
  });

  it('disabling a user 401s their existing token and future logins', async () => {
    const tokenA = await registerAndLogin(userA);
    const tokenB = await registerAndLogin(userB);
    const userBDoc = await User.findOne({ email: userB.email });

    const patchRes = await request(app)
      .patch(`/api/admin/users/${userBDoc._id}`)
      .set(authHeader(tokenA))
      .send({ enabled: false });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.enabled).toBe(false);

    const meRes = await request(app).get('/oauth/me').set(authHeader(tokenB));
    expect(meRes.status).toBe(401);

    const loginRes = await request(app)
      .post('/oauth/token')
      .send({ username: userB.email, password: userB.password });
    expect(loginRes.status).toBe(401);
  });

  it('400s an admin trying to disable themselves', async () => {
    const tokenA = await registerAndLogin(userA);
    const adminDoc = await User.findOne({ email: userA.email });

    const res = await request(app)
      .patch(`/api/admin/users/${adminDoc._id}`)
      .set(authHeader(tokenA))
      .send({ enabled: false });
    expect(res.status).toBe(400);
  });

  it('toggling allowRegistration off blocks a third registration', async () => {
    const tokenA = await registerAndLogin(userA);
    await registerAndLogin(userB);

    const putRes = await request(app)
      .put('/api/admin/settings')
      .set(authHeader(tokenA))
      .send({ allowRegistration: false });
    expect(putRes.status).toBe(200);
    expect(putRes.body.allowRegistration).toBe(false);

    const getRes = await request(app).get('/api/admin/settings').set(authHeader(tokenA));
    expect(getRes.body.allowRegistration).toBe(false);

    const registerRes = await request(app)
      .post('/oauth/register')
      .send({ name: 'Third', email: 'third@example.com', password: 'password123' });
    expect(registerRes.status).toBe(403);
  });

  it('always allows registration with zero users, even when ALLOW_REGISTRATION=false', async () => {
    const original = process.env.ALLOW_REGISTRATION;
    process.env.ALLOW_REGISTRATION = 'false';

    try {
      const res = await request(app)
        .post('/oauth/register')
        .send({ name: 'Bootstrap Admin', ...userA });
      expect(res.status).toBe(200);

      const admin = await User.findOne({ email: userA.email });
      expect(admin.role).toBe('admin');
    } finally {
      process.env.ALLOW_REGISTRATION = original;
    }
  });
});
