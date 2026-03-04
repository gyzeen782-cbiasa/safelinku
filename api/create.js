// api/create.js — Create new link (admin only)
const { readDB, writeDB, genId, checkAdmin, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!checkAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { title, desc, type, target, content, countdown, password } = req.body;

    if (!title) return res.status(400).json({ error: 'Judul diperlukan' });
    if (!type || !['url', 'file', 'text'].includes(type)) return res.status(400).json({ error: 'Tipe tidak valid' });
    if (type !== 'text' && !target) return res.status(400).json({ error: 'Target diperlukan' });
    if (type === 'text' && !content) return res.status(400).json({ error: 'Konten diperlukan' });

    const db = await readDB();
    if (!db.links) db.links = {};

    // Generate unique ID
    let id;
    do { id = genId(7); } while (db.links[id]);

    db.links[id] = {
      id, title, desc: desc || '',
      type, target: target || '',
      content: content || '',
      countdown: Math.min(Math.max(parseInt(countdown) || 15, 5), 60),
      password: password || '',
      clicks: 0,
      clicksToday: 0,
      lastClickDate: '',
      created: Date.now()
    };

    await writeDB(db);
    return res.status(200).json({ id, success: true });

  } catch(e) {
    console.error('create.js error:', e);
    return res.status(500).json({ error: e.message });
  }
};
