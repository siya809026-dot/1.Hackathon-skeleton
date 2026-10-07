const router = require('express').Router();
const Engagement = require('../models/Engagement');
const Brief = require('../models/Brief');
const Creator = require('../models/Creator');
const { STAGES } = require('../constants/enums');
const h = require('../utils/h');
const fail = (res, msg, code = 400) => res.status(code).json({ error: msg });

router.get('/', h(async (req, res) => res.json(await Engagement.find().sort({ createdAt: -1 }))));

router.post('/', h(async (req, res) => {
  const { briefId, creatorId } = req.body;
  const [b, c] = await Promise.all([Brief.findById(briefId), Creator.findById(creatorId)]);
  if (!b || !c) return fail(res, 'Brief or creator not found', 404);
  res.status(201).json(await Engagement.create({ briefId, creatorId, activityLog: [{ message: 'Invited' }] }));
}));

// Move to the next stage (Invited -> Proposal -> In production -> Review -> Delivered)
router.patch('/:id/advance', h(async (req, res) => {
  const e = await Engagement.findById(req.params.id);
  if (!e) return fail(res, 'Engagement not found', 404);
  const i = STAGES.indexOf(e.stage);
  if (i >= STAGES.length - 1) return fail(res, 'Already delivered');
  e.stage = STAGES[i + 1];
  e.activityLog.push({ message: e.stage });
  res.json(await e.save());
}));

// Request a revision: only during Review, limited by the brief's revisionRounds
router.patch('/:id/revise', h(async (req, res) => {
  const e = await Engagement.findById(req.params.id);
  if (!e) return fail(res, 'Engagement not found', 404);
  if (e.stage !== 'Review') return fail(res, 'Revisions can only be requested during Review');
  const b = await Brief.findById(e.briefId);
  if (!b || e.revisionCount >= b.revisionRounds) return fail(res, 'No revision rounds left');
  e.revisionCount += 1;
  e.stage = 'In production';
  e.activityLog.push({ message: `Revision #${e.revisionCount} requested` });
  res.json(await e.save());
}));

module.exports = router;
