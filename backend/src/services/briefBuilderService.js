// Turns a rough idea into a structured brief using simple keyword rules (no external AI needed)
function buildBrief(text, knownTools = []) {
  const l = text.toLowerCase(), has = (r) => r.test(l);
  const contentType =
    has(/music|song|\bmv\b/) ? 'Music video' :
    has(/animat|explainer|mascot|cartoon/) ? 'Animation' :
    has(/short film|story|film/) ? 'Short film' :
    has(/poster|banner|image|graphic|\bpost\b|illustrat/) ? 'Graphics / Image' :
    has(/packshot|product shot|product visual/) ? 'Product visual' : 'Video ad';

  const aspectRatios =
    has(/reel|tiktok|stor(y|ies)|shorts|vertical/) ? ['9:16'] :
    has(/youtube|\btv\b|cinema|film|website|hero/) ? ['16:9'] :
    has(/feed|carousel|square/) ? ['1:1', '4:5'] : ['16:9'];

  const words = { cinematic: 'Cinematic', anime: 'Anime', '3d': '3D / CGI', cgi: '3D / CGI', minimal: 'Minimal',
    retro: 'Retro', vintage: 'Retro', surreal: 'Surreal', photoreal: 'Photoreal', realistic: 'Photoreal',
    playful: 'Playful', fun: 'Playful' };
  let style = [...new Set(Object.keys(words).filter((k) => l.includes(k)).map((k) => words[k]))];
  if (!style.length) style = ['Cinematic'];

  const channels = [];
  if (has(/paid|\bads?\b|campaign|performance/)) channels.push('Paid ads');
  if (has(/insta|reel|social|tiktok|youtube|\bpost\b/)) channels.push('Organic social');
  if (has(/website|landing|\bweb\b/)) channels.push('Website');
  if (has(/\btv\b|broadcast/)) channels.push('Broadcast / TV');
  if (has(/billboard|ooh|outdoor/)) channels.push('Out-of-home');
  if (!channels.length) channels.push('Organic social');

  const d = l.match(/(\d+)\s*(s|sec|seconds|min)\b/);
  const duration = d ? d[1] + (d[2][0] === 'm' ? 'min' : 's') : contentType === 'Graphics / Image' ? '5 images' : '30s';
  const b = l.match(/(?:\$|usd|budget[^\d]{0,12})\s?(\d[\d,]*)/);
  const terr = { india: 'India', usa: 'USA', uk: 'UK', europe: 'Europe', global: 'Worldwide', worldwide: 'Worldwide' };
  const t = l.match(/\b(india|usa|uk|europe|global|worldwide)\b/);
  const territory = t ? terr[t[1]] : 'Worldwide';
  const term = channels.includes('Paid ads') ? '12 months' : '3 months';
  const revisionRounds = 2;

  return {
    title: text.trim().split(/\s+/).slice(0, 5).join(' '),
    description: `Create a ${style.join('/').toLowerCase()} ${contentType.toLowerCase()} (${duration}, ${aspectRatios.join('/')}) based on: "${text.trim()}". Deliver ${revisionRounds} regeneration/revision rounds, with prompt & tool log. Intended use: ${channels.join(', ')} in ${territory} for ${term}.`,
    contentType, style, aspectRatios, duration,
    preferredTools: knownTools.filter((x) => l.includes(x.split(' ')[0].toLowerCase())),
    ...(b && { budget: +b[1].replace(/,/g, '') }),
    revisionRounds,
    commercialUse: { channels, territory, term, exclusivity: has(/exclusive/) ? 'Category exclusive' : 'Non-exclusive', outputOwnership: 'Brand owns outputs' },
  };
}

module.exports = { buildBrief };
