const m = require('mongoose');
const E = require('../constants/enums');
const flag = { type: Boolean, default: false };

const schema = new m.Schema({
  name: { type: String, required: true, trim: true },
  specialization: { type: String, required: true },
  location: String,
  bio: String,
  rateFrom: { type: Number, required: true, min: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  tools: [String],
  skills: [String],
  contentTypes: [{ type: String, enum: E.CONTENT_TYPES }],
  styles: [{ type: String, enum: E.STYLES }],
  supportedFormats: [{ type: String, enum: E.ASPECT_RATIOS }],
  commercialLicenseReady: flag,
  workflow: [String],
  verification: { toolsVerified: flag, workflowReviewed: flag, pastWorkConfirmed: flag },
}, { timestamps: true });

module.exports = m.model('Creator', schema);
