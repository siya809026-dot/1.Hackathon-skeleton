const m = require('mongoose');
const E = require('../constants/enums');
const id = (ref) => ({ type: m.Schema.Types.ObjectId, ref, required: true });

const schema = new m.Schema({
  briefId: id('Brief'),
  creatorId: id('Creator'),
  stage: { type: String, enum: E.STAGES, default: 'Invited' },
  revisionCount: { type: Number, default: 0 },
  activityLog: [{ message: String, at: { type: Date, default: Date.now }, _id: false }],
}, { timestamps: true });

// One creator can only be invited once per brief
schema.index({ briefId: 1, creatorId: 1 }, { unique: true });

module.exports = m.model('Engagement', schema);
