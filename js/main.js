// ===== main.js — SafeLink Pro =====

function showToast(msg, type = 'info') {
  let c = document.getElementById('toasts');
  if (!c) { c = document.createElement('div'); c.id = 'toasts'; c.className = 'toasts'; document.body.appendChild(c); }
  const t = document.createElement('div');
  const icon = type === 'ok' ? '✓' : type === 'err' ? '✗' : 'ℹ';
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icon}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastIn .3s ease reverse'; setTimeout(() => t.remove(), 300); }, 3000);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Link disalin!', 'ok')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast('Disalin!', 'ok');
  });
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  const h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (m < 1) return 'Baru saja';
  if (h < 1) return `${m}m lalu`;
  if (d < 1) return `${h}j lalu`;
  return `${d}h lalu`;
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

// Auth check helper — admin pages harus panggil ini
function requireAdmin() {
  const token = sessionStorage.getItem('slp_admin');
  if (!token) {
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}
