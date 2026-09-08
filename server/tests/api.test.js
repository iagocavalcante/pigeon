const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../src/models/user');
const List = require('../src/models/list');
const Lead = require('../src/models/lead');
const Campaign = require('../src/models/campaign');

const testUser = { email: 'test@example.com', password: 'password123' };

async function registerAndLogin() {
  await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
  const res = await request(app)
    .post('/oauth/token')
    .send({ username: testUser.email, password: testUser.password });
  return res.body.token;
}

beforeAll(async () => {
  await mongoose.connection.asPromise();
});

beforeEach(async () => {
  await User.deleteMany({});
  await List.deleteMany({});
  await Lead.deleteMany({});
  await Campaign.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('oauth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('returns a token for valid credentials', async () => {
    await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
    const res = await request(app)
      .post('/oauth/token')
      .send({ username: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects a wrong password', async () => {
    await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
    const res = await request(app)
      .post('/oauth/token')
      .send({ username: testUser.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects /oauth/me without a token', async () => {
    const res = await request(app).get('/oauth/me');
    expect(res.status).toBe(401);
  });

  it('returns the user for /oauth/me with a token', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/oauth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('does not store the plaintext password', async () => {
    await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
    const stored = await User.findOne({ email: testUser.email });
    expect(stored.password).not.toBe(testUser.password);
  });

  it('does not return a password field from /oauth/me', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get('/oauth/me').set('Authorization', `Bearer ${token}`);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects registration when ALLOW_REGISTRATION is false', async () => {
    // Zero-user bootstrap always allows registration regardless of the flag,
    // so seed a first user before exercising the disabled case.
    await request(app).post('/oauth/register').send({ name: 'Test', ...testUser });
    process.env.ALLOW_REGISTRATION = 'false';
    try {
      const res = await request(app).post('/oauth/register').send({ name: 'Second', email: 'second@example.com', password: 'password123' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Registration is disabled');
    } finally {
      delete process.env.ALLOW_REGISTRATION;
    }
  });
});

describe('api/lists', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(401);
  });

  it('supports full CRUD with a token', async () => {
    const token = await registerAndLogin();
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app)
      .post('/api/lists')
      .set(auth)
      .send({ title: 'Newsletter', quantity: 0 });
    expect(created.status).toBe(200);
    const id = created.body.data._id;

    const listed = await request(app).get('/api/lists').set(auth);
    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(1);

    const viewed = await request(app).get(`/api/lists/${id}`).set(auth);
    expect(viewed.status).toBe(200);
    expect(viewed.body.data._id).toBe(id);

    const updated = await request(app)
      .put(`/api/lists/${id}`)
      .set(auth)
      .send({ title: 'Updated Newsletter' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe('Updated Newsletter');

    const deleted = await request(app).delete(`/api/lists/${id}`).set(auth);
    expect(deleted.status).toBe(200);

    const listedAfterDelete = await request(app).get('/api/lists').set(auth);
    expect(listedAfterDelete.body.data).toHaveLength(0);
  });

  it('returns 404 viewing/editing/deleting a nonexistent id', async () => {
    const token = await registerAndLogin();
    const auth = { Authorization: `Bearer ${token}` };
    const missingId = new mongoose.Types.ObjectId().toString();

    const viewed = await request(app).get(`/api/lists/${missingId}`).set(auth);
    expect(viewed.status).toBe(404);

    const updated = await request(app).put(`/api/lists/${missingId}`).set(auth).send({ title: 'x' });
    expect(updated.status).toBe(404);

    const deleted = await request(app).delete(`/api/lists/${missingId}`).set(auth);
    expect(deleted.status).toBe(404);
  });
});

describe('leads/subscribe', () => {
  async function createList(auth, title = 'Newsletter') {
    const res = await request(app).post('/api/lists').set(auth).send({ title, quantity: 0 });
    return res.body.data;
  }

  it('rejects an invalid email', async () => {
    const token = await registerAndLogin();
    const auth = { Authorization: `Bearer ${token}` };
    const list = await createList(auth);

    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'not-an-email', list: list._id });
    expect(res.status).toBe(422);
  });

  it('rejects a non-mongo-id list', async () => {
    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: 'Newsletter' });
    expect(res.status).toBe(422);
  });

  it('404s when the list does not exist', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: missingId });
    expect(res.status).toBe(404);
  });

  it('creates a lead and a list with quantity 1', async () => {
    const token = await registerAndLogin();
    const auth = { Authorization: `Bearer ${token}` };
    const list = await createList(auth);

    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: list._id });
    expect(res.status).toBe(200);

    const updatedList = await List.findById(list._id);
    expect(updatedList.quantity).toBe(1);

    const lead = await Lead.findOne({ email: 'lead@example.com' });
    expect(lead).not.toBeNull();
    expect(lead.lists).toHaveLength(1);
  });

  it('keeps quantity at 1 when the same email subscribes to the same list again', async () => {
    const token = await registerAndLogin();
    const auth = { Authorization: `Bearer ${token}` };
    const list = await createList(auth);

    await request(app).post('/leads/subscribe').send({ email: 'lead@example.com', list: list._id });
    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: list._id });
    expect(res.status).toBe(200);

    const updatedList = await List.findById(list._id);
    expect(updatedList.quantity).toBe(1);
  });
});

describe('campaign tracking', () => {
  it('increments opens and returns an image/gif on open', async () => {
    const owner = new mongoose.Types.ObjectId();
    const campaign = await Campaign.create({ title: 'Test Campaign', body: '<p>hi</p>', start: new Date(), owner });
    const lead = await Lead.create({ email: 'tracked@example.com', lists: [], owner });

    const res = await request(app).get(`/campaigns/tracking/open/${campaign._id}/${lead._id}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/gif');

    const updated = await Campaign.findById(campaign._id);
    expect(updated.opens).toBe(1);
  });
});
