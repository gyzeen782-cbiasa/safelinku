// api/link.js — Get link by ID
const { readDB, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'ID diperlukan' });

  try {
    const db = await readDB();
    const link = db.links?.[id];
    if (!link) return res.status(404).json({ error: 'Link tidak ditemukan' });

    // Kalau ada password, cek dulu
    if (link.password) {
      const pw = req.query.pw;
      if (!pw) {
        // Return metadata saja (tanpa target), kasih tau hasPassword
        return res.status(200).json({
          id, title: link.title, desc: link.desc,
          type: link.type, countdown: link.countdown,
          hasPassword: true
        });
      }
      if (pw !== link.password) {
        return res.status(403).json({ error: 'Password salah', unlocked: false });
      }
    }

    // Return full data (tanpa password field)
    const { password: _, ...safeLink } = link;
    return res.status(200).json({ ...safeLink, id, unlocked: true });

  } catch(e) {
    console.error('link.js error:', e);
    return res.status(500).json({ error: e.message });
  }
};
