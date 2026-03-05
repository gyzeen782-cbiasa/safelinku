// ===== api/_db.js — JSONbin.io Database Helper =====
const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'admin123';
const MEMBER_KEY = process.env.MEMBER_KEY || 'member123';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function readDB() {
  const r = await fetch(`${BIN_URL}/latest`, {
    headers: { 'X-Master-Key': API_KEY, 'X-Bin-Meta': 'false' }
  });
  if (!r.ok) {
    if (r.status === 404) return { links: {} };
    throw new Error('DB read failed: ' + r.status);
  }
  const d = await r.json();
  return d || { links: {} };
}

async function writeDB(data) {
  const r = await fetch(BIN_URL, {
    method: 'PUT',
    headers: {
      'X-Master-Key': API_KEY,
      'Content-Type': 'application/json',
      'X-Bin-Versioning': 'false'
    },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('DB write failed: ' + r.status);
  return r.json();
}

function genId(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function checkAdmin(req) {
  const pw = req.headers['x-admin-password'];
  return pw === ADMIN_PW;
}

function checkMember(req) {
  const key = req.headers['x-member-key'];
  return key === MEMBER_KEY || key === ADMIN_PW; // admin juga bisa pakai endpoint member
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Password');
}

module.exports = { readDB, writeDB, genId, checkAdmin, checkMember, cors, ADMIN_PW, MEMBER_KEY };
