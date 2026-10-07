const m = require('mongoose');
const E = require('../constants/enums');

const schema = new m.Schema({
  creatorId: { type: m.Schema.Types.ObjectId, ref: 'Creator', required: true, index: true },
  title: { type: String, required: true },
  contentType: { type: String, enum: E.CONTENT_TYPES, required: true },
  aspectRatio: { type: String, enum: E.ASPECT_RATIOS },
  toolsUsed: [String],
  promptSummary: String,
  assetUrl: { type: String, default: '' },
  clientRef: { type: String, default: '' },
}, { timestamps: true });

module.exports = m.model('PortfolioItem', schema);
