// api/click.js — Track click on a link
const { readDB, writeDB, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID diperlukan' });

    const db = await readDB();
    if (!db.links?.[id]) return res.status(404).json({ error: 'Link tidak ditemukan' });

    // Update click count
    db.links[id].clicks = (db.links[id].clicks || 0) + 1;

    // Track today's clicks
    const today = new Date().toISOString().slice(0, 10);
    if (db.links[id].lastClickDate !== today) {
      db.links[id].clicksToday = 0;
      db.links[id].lastClickDate = today;
    }
    db.links[id].clicksToday = (db.links[id].clicksToday || 0) + 1;

    await writeDB(db);
    return res.status(200).json({ ok: true });

  } catch(e) {
    // Jangan gagal halaman karena tracking error
    console.error('click.js error:', e);
    return res.status(200).json({ ok: false });
  }
};
