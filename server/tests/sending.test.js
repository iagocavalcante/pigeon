process.env.SECRETS_KEY = process.env.SECRETS_KEY || 'test-secrets-key-not-for-prod';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../src/models/user');
const Lead = require('../src/models/lead');
const Campaign = require('../src/models/campaign');
const secretbox = require('../src/services/secretbox');
const tracker = require('../src/email/tracker');

const testUser = { email: 'sending-test@example.com', password: 'password123' };

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
  await Lead.deleteMany({});
  await Campaign.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('secretbox', () => {
  it('round-trips a plaintext value', () => {
    const enc = secretbox.encrypt('my-secret-value');
    expect(enc).not.toBe('my-secret-value');
    expect(secretbox.decrypt(enc)).toBe('my-secret-value');
  });
});

describe('/oauth/sending', () => {
  it('stores the api key encrypted and never returns it', async () => {
    const token = await registerAndLogin();

    const putRes = await request(app)
      .put('/oauth/sending')
      .set('Authorization', `bearer ${token}`)
      .send({ resendApiKey: 're_1234567890abcd', fromAddress: 'campaigns@example.com' });

    expect(putRes.status).toBe(200);
    expect(putRes.body.fromAddress).toBe('campaigns@example.com');
    expect(putRes.body.hasApiKey).toBe(true);
    expect(putRes.body.apiKeyHint).toBe('abcd');
    expect(putRes.body.resendApiKey).toBeUndefined();
    expect(putRes.body.resendApiKeyEnc).toBeUndefined();

    const user = await User.findOne({ email: testUser.email });
    expect(user.sending.resendApiKeyEnc).not.toBe('re_1234567890abcd');
    expect(secretbox.decrypt(user.sending.resendApiKeyEnc)).toBe('re_1234567890abcd');

    const getRes = await request(app)
      .get('/oauth/sending')
      .set('Authorization', `bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.fromAddress).toBe('campaigns@example.com');
    expect(getRes.body.hasApiKey).toBe(true);
    expect(getRes.body.apiKeyHint).toBe('abcd');
    expect(getRes.body.resendApiKey).toBeUndefined();
  });

  it('rejects an invalid from address', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .put('/oauth/sending')
      .set('Authorization', `bearer ${token}`)
      .send({ fromAddress: 'not-an-email' });

    expect(res.status).toBe(422);
  });

  it('accepts a "Name <a@b.c>" from address', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .put('/oauth/sending')
      .set('Authorization', `bearer ${token}`)
      .send({ fromAddress: 'Pigeon <campaigns@example.com>' });

    expect(res.status).toBe(200);
    expect(res.body.fromAddress).toBe('Pigeon <campaigns@example.com>');
  });
});

describe('/oauth/me', () => {
  it('never includes the encrypted api key', async () => {
    const token = await registerAndLogin();
    await request(app)
      .put('/oauth/sending')
      .set('Authorization', `bearer ${token}`)
      .send({ resendApiKey: 're_abcdefgh1234', fromAddress: 'campaigns@example.com' });

    const res = await request(app)
      .get('/oauth/me')
      .set('Authorization', `bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.sending.resendApiKeyEnc).toBeUndefined();
    expect(res.body.user.sending.fromAddress).toBe('campaigns@example.com');
  });
});

describe('tracker', () => {
  it('signs links and appends an unsubscribe link', () => {
    const campaignId = new mongoose.Types.ObjectId();
    const leadId = new mongoose.Types.ObjectId();
    const body = '<a href="https://example.com/page">Click</a>';

    const result = tracker(body, campaignId, leadId);

    expect(result).toContain('sig=');
    expect(result).toContain(`/campaigns/tracking/click/${campaignId}/${leadId}`);
    expect(result).toContain(`/leads/unsubscribe/${leadId}/`);
    expect(result).toContain('Unsubscribe');
  });
});

describe('click tracking with signatures', () => {
  it('404s on a bad signature', async () => {
    const campaign = await Campaign.create({ title: 'Test', body: '<p>hi</p>', start: new Date() });
    const lead = await Lead.create({ email: 'clicker@example.com', lists: [] });

    const res = await request(app)
      .get(`/campaigns/tracking/click/${campaign._id}/${lead._id}`)
      .query({ link: 'https://example.com', sig: 'deadbeef' });

    expect(res.status).toBe(404);
  });

  it('redirects on a good signature', async () => {
    const campaign = await Campaign.create({ title: 'Test', body: '<p>hi</p>', start: new Date() });
    const lead = await Lead.create({ email: 'clicker2@example.com', lists: [] });
    const link = 'https://example.com/target';
    const sig = tracker.sign(String(campaign._id), String(lead._id), link);

    const res = await request(app)
      .get(`/campaigns/tracking/click/${campaign._id}/${lead._id}`)
      .query({ link, sig });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(link);
  });
});

describe('unsubscribe', () => {
  it('sets unsubscribed on a good signature', async () => {
    const lead = await Lead.create({ email: 'unsub@example.com', lists: [] });
    const sig = tracker.signUnsubscribe(String(lead._id));

    const res = await request(app).get(`/leads/unsubscribe/${lead._id}/${sig}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('unsubscribed');

    const updated = await Lead.findById(lead._id);
    expect(updated.unsubscribed).toBe(true);
  });

  it('404s on a bad signature', async () => {
    const lead = await Lead.create({ email: 'unsub2@example.com', lists: [] });

    const res = await request(app).get(`/leads/unsubscribe/${lead._id}/deadbeef`);

    expect(res.status).toBe(404);

    const updated = await Lead.findById(lead._id);
    expect(updated.unsubscribed).toBe(false);
  });
});
