require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const enums = require('./constants/enums');
const Creator = require('./models/Creator');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Dropdown options + filter facets for the frontend
app.get('/api/meta', async (req, res, next) => {
  try {
    const [tools, skills, specializations] = await Promise.all([
      Creator.distinct('tools'), Creator.distinct('skills'), Creator.distinct('specialization')]);
    res.json({ ...enums, tools: tools.sort(), skills: skills.sort(), specializations: specializations.sort() });
  } catch (e) { next(e); }
});

app.use('/api/creators', require('./routes/creators'));
app.use('/api/briefs', require('./routes/briefs'));
app.use('/api/engagements', require('./routes/engagements'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the frontend from the same server -> open http://localhost:5000
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join('; ') });
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id or value' });
  if (err.code === 11000) return res.status(409).json({ error: 'Already exists (e.g. creator already invited to this brief)' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`GenHire running on http://localhost:${PORT}`)));
