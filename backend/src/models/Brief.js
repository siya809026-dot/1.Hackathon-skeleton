const m = require('mongoose');
const E = require('../constants/enums');
const nonEmpty = { validator: (v) => Array.isArray(v) && v.length > 0, message: '{PATH} needs at least one value' };

const schema = new m.Schema({
  brandName: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  contentType: { type: String, enum: E.CONTENT_TYPES, required: true },
  style: [{ type: String, enum: E.STYLES }],
  aspectRatios: { type: [{ type: String, enum: E.ASPECT_RATIOS }], validate: nonEmpty },
  duration: { type: String, default: '' },
  preferredTools: [String],
  budget: { type: Number, min: 0, default: 0 },
  deadline: Date,
  revisionRounds: { type: Number, min: 0, default: 2 },
  commercialUse: {
    channels: { type: [{ type: String, enum: E.CHANNELS }], validate: nonEmpty },
    territory: { type: String, default: 'Worldwide' },
    term: { type: String, default: '12 months' },
    exclusivity: { type: String, default: 'Non-exclusive' },
    outputOwnership: { type: String, default: 'Brand owns outputs' },
  },
}, { timestamps: true });

module.exports = m.model('Brief', schema);
