// api/links.js — Get all links (admin) or public stats
const { readDB, checkAdmin, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db = await readDB();
    const allLinks = Object.values(db.links || {});

    // Public stats request
    if (req.query.stats === '1') {
      const totalClicks = allLinks.reduce((a, l) => a + (l.clicks || 0), 0);
      return res.status(200).json({
        totalLinks: allLinks.length,
        totalClicks
      });
    }

    // Admin request — check auth
    if (req.query.admin === '1') {
      if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      // Return all links sorted by created desc, hide passwords
      const links = allLinks
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .map(({ password, content, ...l }) => ({
          ...l,
          hasPassword: !!password,
          hasContent: !!content
        }));
      return res.status(200).json({ links });
    }

    return res.status(400).json({ error: 'Parameter tidak valid' });

  } catch(e) {
    console.error('links.js error:', e);
    return res.status(500).json({ error: e.message });
  }
};
