const router = require('express').Router();
const Creator = require('../models/Creator');
const Item = require('../models/PortfolioItem');
const h = require('../utils/h');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
const trust = (c) => Object.values(c.verification || {}).filter(Boolean).length;

async function withPortfolio(creators) {
  const items = await Item.find({ creatorId: { $in: creators.map((c) => c._id) } }).lean();
  return creators.map((c) => ({ ...c, portfolio: items.filter((i) => String(i.creatorId) === String(c._id)) }));
}

// GET /api/creators?q=&specialization=&contentTypes=a,b&tools=a,b&skills=a,b&maxRate=&verified=true&licenseReady=true&sort=rel|rt|rate
router.get('/', h(async (req, res) => {
  const q = req.query, f = {};
  const types = list(q.contentTypes), tools = list(q.tools), skills = list(q.skills);
  if (types.length) f.contentTypes = { $all: types };
  if (tools.length) f.tools = { $all: tools };
  if (skills.length) f.skills = { $all: skills };
  if (q.specialization) f.specialization = q.specialization;
  if (q.licenseReady === 'true') f.commercialLicenseReady = true;
  if (q.verified === 'true') Object.assign(f, { 'verification.toolsVerified': true, 'verification.workflowReviewed': true, 'verification.pastWorkConfirmed': true });
  if (q.maxRate) f.rateFrom = { $lte: +q.maxRate };
  if (q.q && q.q.trim()) {
    f.$and = q.q.trim().split(/\s+/).map((w) => {
      const r = new RegExp(esc(w), 'i');
      return { $or: ['name', 'specialization', 'bio', 'tools', 'skills', 'contentTypes', 'styles'].map((k) => ({ [k]: r })) };
    });
  }
  const creators = await Creator.find(f).lean();
  creators.sort(q.sort === 'rate' ? (a, b) => a.rateFrom - b.rateFrom
    : q.sort === 'rt' ? (a, b) => b.rating - a.rating
    : (a, b) => trust(b) - trust(a) || b.rating - a.rating);
  res.json(await withPortfolio(creators));
}));

router.get('/:id', h(async (req, res) => {
  const c = await Creator.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ error: 'Creator not found' });
  res.json((await withPortfolio([c]))[0]);
}));

module.exports = router;
