// api/delete.js — Delete a link (admin only)
const { readDB, writeDB, checkAdmin, checkMember, cors } = require('./_db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).end();

  const isAdmin = checkAdmin(req);
  const isMember = checkMember(req);
  if (!isAdmin && !isMember) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'ID diperlukan' });

  try {
    const db = await readDB();
    if (!db.links?.[id]) return res.status(404).json({ error: 'Link tidak ditemukan' });

    // Member hanya bisa hapus link miliknya sendiri
    const memberEmail = req.headers['x-member-email'] || '';
    if (!isAdmin && db.links[id].memberEmail !== memberEmail) {
      return res.status(403).json({ error: 'Bukan link kamu' });
    }

    delete db.links[id];
    await writeDB(db);
    return res.status(200).json({ ok: true });

  } catch(e) {
    console.error('delete.js error:', e);
    return res.status(500).json({ error: e.message });
  }
};
