// =====================================================
// API Functions - Cloudflare D1 Backend
// =====================================================

const API_BASE = "/api";

// ── جلب كل سجلات لوحة من D1 ──────────────────────────────────────
async function apiList(panelKey) {
  const res = await fetch(`${API_BASE}/${panelKey}`);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data || [];
}

// ── إنشاء سجل جديد في D1 ─────────────────────────────────────────
async function apiCreate(panelKey, record) {
  const res = await fetch(`${API_BASE}/${panelKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── تحديث سجل موجود في D1 ────────────────────────────────────────
async function apiUpdate(panelKey, id, record) {
  const res = await fetch(`${API_BASE}/${panelKey}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── حذف سجل من D1 ────────────────────────────────────────────────
async function apiDelete(panelKey, id) {
  const res = await fetch(`${API_BASE}/${panelKey}/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── فحص الاتصال بقاعدة البيانات ──────────────────────────────────
async function apiHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// ── Cache بسيط لتقليل طلبات الشبكة ─────────────────────────────
const _apiCache = new Map();

async function apiListCached(panelKey, forceRefresh = false) {
  if (!forceRefresh && _apiCache.has(panelKey)) {
    return _apiCache.get(panelKey);
  }
  const data = await apiList(panelKey);
  _apiCache.set(panelKey, data);
  return data;
}

function apiInvalidateCache(panelKey) {
  if (panelKey) {
    _apiCache.delete(panelKey);
  } else {
    _apiCache.clear();
  }
}
