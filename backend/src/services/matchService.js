// Match score (0-100): type 30 + format 15 + style 15 + tools 10 + license 15 + budget 10 + verification 5
const hit = (wanted, have) => wanted.filter((x) => have.includes(x)).length;

function scoreMatch(b, c) {
  let s = 0;
  if (c.contentTypes.includes(b.contentType)) s += 30;

  const rs = b.aspectRatios || [], n = hit(rs, c.supportedFormats);
  s += rs.length && n === rs.length ? 15 : n ? 7 : 0;

  const st = b.style || [];
  s += st.length ? Math.round((15 * hit(st, c.styles)) / st.length) : 8;

  const tl = b.preferredTools || [];
  s += tl.length ? Math.round((10 * hit(tl, c.tools)) / tl.length) : 5;

  const ch = (b.commercialUse && b.commercialUse.channels) || [];
  s += ch.length ? (c.commercialLicenseReady ? 15 : 0) : 8;

  if ((b.budget || 0) >= c.rateFrom) s += 10;
  s += Math.round((5 * Object.values(c.verification || {}).filter(Boolean).length) / 3);
  return Math.min(100, s);
}

module.exports = { scoreMatch };
