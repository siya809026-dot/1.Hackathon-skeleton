// Connects the UI to the Express/MongoDB backend (same origin: /api)
const j = async (url, opt = {}) => {
  const r = await fetch('/api' + url, { headers: { 'Content-Type': 'application/json' }, ...opt });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
};
const hue = (s) => [...s].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 360;

// API shape -> UI shape
const mapC = (c) => ({ id: c._id, n: c.name, loc: c.location, h: hue(c.name), spec: c.specialization, rate: c.rateFrom,
  rt: c.rating, jobs: c.projectsCompleted, types: c.contentTypes, tools: c.tools, skills: c.skills, styles: c.styles,
  fm: c.supportedFormats, lic: c.commercialLicenseReady ? 1 : 0,
  v: { t: +c.verification.toolsVerified, w: +c.verification.workflowReviewed, p: +c.verification.pastWorkConfirmed },
  bio: c.bio, wf: c.workflow,
  work: (c.portfolio || []).map((w) => [w.title, w.contentType, w.aspectRatio, w.toolsUsed.join(' + '), w.promptSummary]) });
const mapB = (b) => ({ id: b._id, title: b.title, brand: b.brandName, type: b.contentType, style: b.style, ratios: b.aspectRatios,
  dur: b.duration, tools: b.preferredTools, uses: b.commercialUse.channels, terr: b.commercialUse.territory,
  term: b.commercialUse.term, excl: b.commercialUse.exclusivity, own: b.commercialUse.outputOwnership,
  budget: b.budget, due: (b.deadline || '').slice(0, 10), rounds: b.revisionRounds, desc: b.description });
const mapE = (e) => ({ id: e._id, c: e.creatorId, b: e.briefId, st: STAGES.indexOf(e.stage), rd: e.revisionCount,
  log: e.activityLog.map((l) => l.message) });
// UI shape -> API body
const toBody = (d) => ({ title: d.title, brandName: d.brand, description: d.desc, contentType: d.type, style: d.style,
  aspectRatios: d.ratios, duration: d.dur, preferredTools: d.tools, budget: +d.budget || 0, deadline: d.due || undefined,
  revisionRounds: +d.rounds, commercialUse: { channels: d.uses, territory: d.terr, term: d.term, exclusivity: d.excl, outputOwnership: d.own } });

async function load() {
  const [cs, bs, es] = await Promise.all([j('/creators'), j('/briefs'), j('/engagements')]);
  C.length = 0; C.push(...cs.map(mapC));
  SPECS = [...new Set(C.map((c) => c.spec))];
  S.briefs = bs.map(mapB); S.eng = es.map(mapE);
}

// ---- override the prototype's local functions with API calls ----
let rq = 0;
async function list() {
  const id = ++rq, p = new URLSearchParams({ sort: F.sort });
  if (F.q) p.set('q', F.q);
  if (F.spec) p.set('specialization', F.spec);
  if (F.types.length) p.set('contentTypes', F.types.join(','));
  if (F.tools.length) p.set('tools', F.tools.join(','));
  if (F.skills.length) p.set('skills', F.skills.join(','));
  if (F.ver) p.set('verified', 'true');
  if (F.lic) p.set('licenseReady', 'true');
  if (F.max < 3000) p.set('maxRate', F.max);
  try {
    const R = (await j('/creators?' + p)).map(mapC);
    if (id !== rq) return;
    $('#res').innerHTML = `<div class="mu" style="margin-bottom:8px">${R.length} creator${R.length == 1 ? '' : 's'} found</div>` +
      (R.length ? `<div class="grid">${R.map((c) => card(c)).join('')}</div>` : empty());
  } catch (e) { $('#res').innerHTML = `<div class="card">${esc(e.message)}</div>`; }
}
async function build() {
  const t = $('#rough').value; if (!t.trim()) return;
  try {
    const m = mapB({ ...(await j('/briefs/build', { method: 'POST', body: JSON.stringify({ text: t }) })), _id: 0 });
    ['id', 'brand', 'due', 'rounds'].forEach((k) => delete m[k]);
    Object.assign(draft, m, { _rough: t }); render();
  } catch (e) { alert(e.message); }
}
async function pub() {
  const d = draft;
  if (!d.title || !d.brand || !d.ratios.length || !d.uses.length) { alert('Please add title, brand, at least one aspect ratio and one commercial-use option.'); return; }
  try { await j('/briefs', { method: 'POST', body: JSON.stringify(toBody(d)) }); await load(); draft = null; nav('briefs'); }
  catch (e) { alert(e.message); }
}
async function delB(id) {
  if (!confirm('Delete this brief and its engagements?')) return;
  try { await j('/briefs/' + id, { method: 'DELETE' }); await load(); render(); } catch (e) { alert(e.message); }
}
async function invite(cid, bid) {
  bid = bid || (S.briefs[0] && S.briefs[0].id); if (!bid) { nav('new'); return; }
  try { await j('/engagements', { method: 'POST', body: JSON.stringify({ briefId: bid, creatorId: cid }) }); await load(); nav('eng'); }
  catch (e) { alert(e.message); }
}
async function mv(id, d) {
  try { await j('/engagements/' + id + (d == 'rev' ? '/revise' : '/advance'), { method: 'PATCH' }); await load(); render(); }
  catch (e) { alert(e.message); }
}

load().then(render).catch(() => { $('#app').innerHTML = '<div class="card"><h3>Cannot reach the API</h3>Start the backend (<code>npm run dev</code> in /backend) and open <b>http://localhost:5000</b>.</div>'; });
