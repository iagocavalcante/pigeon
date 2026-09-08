const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../src/models/user');
const List = require('../src/models/list');
const Lead = require('../src/models/lead');
const Campaign = require('../src/models/campaign');

const userA = { email: 'a@example.com', password: 'password123' };
const userB = { email: 'b@example.com', password: 'password123' };

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
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('tenancy', () => {
  it('scopes lists, leads and campaigns per owner', async () => {
    const tokenA = await registerAndLogin(userA);
    const tokenB = await registerAndLogin(userB);
    const authA = authHeader(tokenA);
    const authB = authHeader(tokenB);

    const list = (await request(app).post('/api/lists').set(authA).send({ title: 'A List', quantity: 0 })).body.data;

    const subscribeRes = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: list._id });
    expect(subscribeRes.status).toBe(200);
    const lead = await Lead.findOne({ email: 'lead@example.com' });

    const campaign = (await request(app)
      .post('/api/campaigns')
      .set(authA)
      .send({ title: 'A Campaign', subject: 'Hi', body: '<p>hi</p>', start: new Date().toISOString(), opens: 999 })).body.data;

    // B sees nothing of A's data
    const bLists = await request(app).get('/api/lists').set(authB);
    expect(bLists.body.data).toHaveLength(0);

    const bLeads = await request(app).get('/api/leads').set(authB);
    expect(bLeads.body.data).toHaveLength(0);

    const bCampaigns = await request(app).get('/api/campaigns').set(authB);
    expect(bCampaigns.body.data).toHaveLength(0);

    // B cannot view/edit/delete A's records
    const bViewList = await request(app).get(`/api/lists/${list._id}`).set(authB);
    expect(bViewList.status).toBe(404);
    const bEditList = await request(app).put(`/api/lists/${list._id}`).set(authB).send({ title: 'hijacked' });
    expect(bEditList.status).toBe(404);
    const bDeleteList = await request(app).delete(`/api/lists/${list._id}`).set(authB);
    expect(bDeleteList.status).toBe(404);

    const bViewLead = await request(app).get(`/api/leads/${lead._id}`).set(authB);
    expect(bViewLead.status).toBe(404);
    const bEditLead = await request(app).put(`/api/leads/${lead._id}`).set(authB).send({ email: 'hijacked@example.com' });
    expect(bEditLead.status).toBe(404);
    const bDeleteLead = await request(app).delete(`/api/leads/${lead._id}`).set(authB);
    expect(bDeleteLead.status).toBe(404);

    const bViewCampaign = await request(app).get(`/api/campaigns/${campaign._id}`).set(authB);
    expect(bViewCampaign.status).toBe(404);
    const bEditCampaign = await request(app).put(`/api/campaigns/${campaign._id}`).set(authB).send({ title: 'hijacked' });
    expect(bEditCampaign.status).toBe(404);
    const bDeleteCampaign = await request(app).delete(`/api/campaigns/${campaign._id}`).set(authB);
    expect(bDeleteCampaign.status).toBe(404);

    // A can still see its own data
    const aLists = await request(app).get('/api/lists').set(authA);
    expect(aLists.body.data).toHaveLength(1);

    // totals only counts each owner's own campaigns
    const bTotals = await request(app).get('/api/campaigns/totals').set(authB);
    expect(bTotals.body).toEqual([]);

    const aTotals = await request(app).get('/api/campaigns/totals').set(authA);
    expect(aTotals.body).toHaveLength(1);
    expect(aTotals.body[0].opens).toBe(0);

    // opens is not settable from the request body — allowlist ignores it, default applies
    const storedCampaign = await Campaign.findById(campaign._id);
    expect(storedCampaign.opens).toBe(0);
  });

  it('404s subscribing to a nonexistent list id', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/leads/subscribe')
      .send({ email: 'lead@example.com', list: missingId });
    expect(res.status).toBe(404);
  });
});
