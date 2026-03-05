// api/create.js — Create new link (admin only)
const { readDB, writeDB, genId, checkAdmin, checkMember, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const isAdmin = checkAdmin(req);
  const isMember = checkMember(req);
  if (!isAdmin && !isMember) return res.status(401).json({ error: 'Unauthorized' });
  
  // Ambil member email dari header (kalau ada)
  const memberEmail = req.headers['x-member-email'] || '';
  const memberName  = req.headers['x-member-name'] || 'Anonymous';

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

    // Konversi Google Drive share link ke direct download link
    let finalTarget = target || '';
    if (type === 'file' && finalTarget.includes('drive.google.com')) {
      const match = finalTarget.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) finalTarget = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }

    db.links[id] = {
      memberEmail, memberName,
      id, title, desc: desc || '',
      type, target: finalTarget,
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
