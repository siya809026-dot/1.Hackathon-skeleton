// Usage: npm run seed   (WARNING: clears creators, portfolio items, briefs and engagements)
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const Creator = require('../models/Creator');
const Item = require('../models/PortfolioItem');
const Brief = require('../models/Brief');
const Engagement = require('../models/Engagement');
const data = require('./seedData.json');

(async () => {
  await connectDB();
  await Promise.all([Creator.deleteMany(), Item.deleteMany(), Brief.deleteMany(), Engagement.deleteMany()]);
  for (const { portfolio, ...c } of data) {
    const doc = await Creator.create(c);
    await Item.insertMany(portfolio.map((p) => ({ ...p, creatorId: doc._id })));
  }
  console.log(`Seeded ${data.length} creators`);
  process.exit(0);
})();
