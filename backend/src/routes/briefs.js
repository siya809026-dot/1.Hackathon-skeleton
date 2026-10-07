const router = require('express').Router();
const Brief = require('../models/Brief');
const Creator = require('../models/Creator');
const Engagement = require('../models/Engagement');
const { scoreMatch } = require('../services/matchService');
const { buildBrief } = require('../services/briefBuilderService');
const h = require('../utils/h');
const notFound = (res) => res.status(404).json({ error: 'Brief not found' });

// AI-assisted brief builder: { text } -> structured brief draft
router.post('/build', h(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text is required' });
  res.json(buildBrief(text, await Creator.distinct('tools')));
}));

router.post('/', h(async (req, res) => res.status(201).json(await Brief.create(req.body))));
router.get('/', h(async (req, res) => res.json(await Brief.find().sort({ createdAt: -1 }))));

router.get('/:id', h(async (req, res) => {
  const b = await Brief.findById(req.params.id);
  b ? res.json(b) : notFound(res);
}));

// Top matching creators for a brief
router.get('/:id/matches', h(async (req, res) => {
  const b = await Brief.findById(req.params.id);
  if (!b) return notFound(res);
  const creators = await Creator.find().lean();
  res.json(creators.map((creator) => ({ creator, score: scoreMatch(b, creator) }))
    .sort((a, z) => z.score - a.score).slice(0, +req.query.limit || 3));
}));

// Deleting a brief also removes its engagements
router.delete('/:id', h(async (req, res) => {
  const b = await Brief.findByIdAndDelete(req.params.id);
  if (!b) return notFound(res);
  await Engagement.deleteMany({ briefId: b._id });
  res.json({ deleted: true });
}));

module.exports = router;
