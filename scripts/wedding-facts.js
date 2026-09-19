// wedding-facts.js
// Single source of truth for where a wedding actually happened and who worked it.
//
// Why this exists: the SEO generators used to infer location from nothing. The
// Vimeo prompt was told to work "Bay Area" into every description, and the
// YouTube prompt then upgraded "Bay Area" to "San Francisco, CA". Arkansas
// weddings ended up titled San Francisco on YouTube and featured as California
// films on the site. Facts here come from Minh's own Facebook and Instagram
// captions (see src/data/weddingFacts.json "sources" on each entry).
//
// Rule the generators follow: use a fact only if it is here. Never guess a
// venue, a city, a state or a year.

const facts = require("../src/data/weddingFacts.json");

// "Kyle & Hayley | Luxury Wedding Film | Bay Area" -> ["kyle", "hayley"]
// Stops at the first " | " so marketing words in the tail never match.
function namesFromTitle(title) {
  const head = String(title || "").split("|")[0];
  return head
    .replace(/[^A-Za-z\s&+]/g, " ")
    .split(/\s*(?:&|\+|and)\s*|\s+/i)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const STOPWORDS = new Set([
  "the", "luxury", "wedding", "film", "films", "cinematic", "cinematography",
  "phaminh", "video", "videography", "videographer", "story", "celebration",
  "intimate", "elopement", "destination", "bay", "area", "arkansas", "california",
  "northwest", "nwa", "hot", "springs", "san", "francisco", "napa", "valley",
  "sacramento", "sonoma", "vietnamese", "chapel", "barn", "vineyard", "museum",
  "station", "beautiful", "stunning", "emotional", "colorful", "adaptable",
  "unforgettable", "moments", "dream", "city", "luxurious", "at", "in", "of",
]);

function allEntries() {
  return [...(facts.confirmed || []), ...(facts.on_social_not_on_youtube || [])];
}

/**
 * Find the cited facts for a video title. Requires at least two matching
 * first names (or one exact rare name) so "Tyler" alone can't pull the wrong
 * couple — Victoria & Tyler and Darby & Tyler are different weddings.
 */
function factsFor(title) {
  const names = namesFromTitle(title);
  if (!names.length) return null;

  let best = null;
  let bestScore = 0;

  for (const entry of allEntries()) {
    const entryNames = namesFromTitle(entry.couple);
    if (!entryNames.length) continue;
    const hits = entryNames.filter((n) => names.includes(n));
    // Two names matching is a couple. One name matching is only enough when
    // that entry has a single name on record.
    const score = hits.length;
    const enough = score >= 2 || (score === 1 && entryNames.length === 1);
    if (enough && score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Render the confirmed facts as prompt text. Returns null when we know
 * nothing, which is the generators' signal to stay generic rather than invent.
 */
function factsBlock(title) {
  const f = factsFor(title);
  if (!f) return null;

  const lines = [`Couple: ${f.couple}`];
  if (f.venue) lines.push(`Venue: ${f.venue}`);
  const place = [f.city, f.state].filter(Boolean).join(", ");
  if (place) lines.push(`Location: ${place}`);
  if (f.wedding_date) lines.push(`Wedding date: ${f.wedding_date}`);

  const vendors = f.vendors || {};
  const vendorLines = Object.entries(vendors)
    .filter(([, v]) => v)
    .map(([role, v]) => `  ${VENDOR_LABELS[role] || role}: ${v}`);
  if (vendorLines.length) lines.push("Vendor team (credit these by name):", ...vendorLines);

  if (f.sources?.length) lines.push(`Source of these facts: ${f.sources[0]}`);
  return lines.join("\n");
}

const VENDOR_LABELS = {
  photo: "Photographer",
  photography: "Photographer",
  planner: "Planner",
  coordinator: "Coordinator",
  florals: "Florals",
  florist: "Florist",
  dress: "Dress",
  designer: "Dress designer",
  cake: "Cake",
  dessert: "Dessert",
  hair: "Hair",
  makeup: "Makeup",
  hmua: "Hair & makeup",
  caterer: "Catering",
  catering: "Catering",
  dj: "DJ",
  band: "Band",
  bar: "Bar service",
  bartending: "Bar service",
  rentals: "Rentals",
  photobooth: "Photo booth",
  arch: "Arch florals",
  bouquets: "Bouquets",
};

/** Venue + vendor names, lowercased, for use as platform tags. */
function tagCandidates(title) {
  const f = factsFor(title);
  if (!f) return [];
  const out = [];
  if (f.venue) {
    // "Anthony Chapel, Garvan Woodland Gardens" -> both names are searchable tags
    for (const part of f.venue.split(/,| \+ /)) {
      const clean = part.replace(/\(.*?\)/g, "").trim();
      if (clean.length > 2 && clean.length < 40) out.push(clean.toLowerCase());
    }
  }
  for (const v of Object.values(f.vendors || {})) {
    if (!v) continue;
    const clean = String(v).split("/")[0].replace(/\(.*?\)/g, "").replace(/@/g, "").trim();
    if (clean.length > 2 && clean.length < 40) out.push(clean.toLowerCase());
  }
  return [...new Set(out)];
}

module.exports = { factsFor, factsBlock, tagCandidates, namesFromTitle };
