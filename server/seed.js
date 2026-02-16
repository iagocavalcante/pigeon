const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  created: { type: Date, default: Date.now }
});

const listSchema = new mongoose.Schema({
  name: String,
  description: String,
  created: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  title: String,
  subject: String,
  body: String,
  list: String,
  status: { type: String, default: 'draft' },
  sent: { type: Date },
  opens: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);
const List = mongoose.model('List', listSchema);
const Campaign = mongoose.model('Campaign', campaignSchema);

async function seed() {
  // Clear existing data
  await Lead.deleteMany({});
  await List.deleteMany({});
  await Campaign.deleteMany({});

  // Create lists
  const list1 = await List.create({ name: 'Newsletter', description: 'Weekly newsletter subscribers' });
  const list2 = await List.create({ name: 'Clients', description: 'Active clients' });

  // Create leads
  await Lead.create([
    { email: 'john@example.com', name: 'John Doe', phone: '+5511999999999' },
    { email: 'jane@example.com', name: 'Jane Smith', phone: '+5511888888888' },
    { email: 'bob@example.com', name: 'Bob Wilson', phone: '+5511777777777' },
    { email: 'alice@example.com', name: 'Alice Brown', phone: '+5511666666666' },
    { email: 'charlie@example.com', name: 'Charlie Davis', phone: '+5511555555555' }
  ]);

  // Create campaigns
  await Campaign.create([
    { title: 'Welcome Email', subject: 'Welcome to our newsletter!', body: 'Thanks for subscribing!', list: list1._id.toString(), status: 'sent', sent: new Date(), opens: 45, clicks: 12 },
    { title: 'March Newsletter', subject: 'March Updates', body: 'Here are this month updates', list: list1._id.toString(), status: 'sent', sent: new Date(Date.now() - 86400000), opens: 38, clicks: 8 },
    { title: 'Product Launch', subject: 'New Product Coming!', body: 'Check out our new features', list: list2._id.toString(), status: 'draft' },
    { title: 'Promo Email', subject: '50% Off Sale!', body: 'Limited time offer', list: list2._id.toString(), status: 'scheduled', sent: new Date(Date.now() + 86400000) }
  ]);

  console.log('✅ Seed data created!');
  console.log(`   - ${await Lead.countDocuments()} leads`);
  console.log(`   - ${await List.countDocuments()} lists`);
  console.log(`   - ${await Campaign.countDocuments()} campaigns`);

  process.exit(0);
}

module.exports = seed;
