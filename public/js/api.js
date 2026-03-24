// =====================================================
// API Functions - Cloudflare D1 Backend
// =====================================================

const API_BASE = "/api";

// ── مساعد: جلب الـ token من الجلسة ───────────────────────────────
function _getAuthToken() {
  return window._authToken || localStorage.getItem('_authToken') || '';
}

// ── مساعد: بناء headers مع Authorization ──────────────────────────
function _authHeaders(extra = {}) {
  const token = _getAuthToken();
  const headers = { "Content-Type": "application/json", ...extra };
  if (token) headers["Authorization"] = "Bearer " + token;
  return headers;
}

// ── مساعد: قراءة الخطأ من الـ response ────────────────────────────
async function _readError(res) {
  try {
    const json = await res.json();
    return json.error || JSON.stringify(json);
  } catch {
    try { return await res.text(); } catch { return `HTTP ${res.status}`; }
  }
}

// ── جلب كل سجلات لوحة من D1 ──────────────────────────────────────
async function apiList(panelKey) {
  const res = await fetch(`${API_BASE}/${panelKey}`, {
    headers: _authHeaders()
  });
  if (!res.ok) throw new Error(await _readError(res));
  const json = await res.json();
  return json.data || [];
}

// ── إنشاء سجل جديد في D1 ─────────────────────────────────────────
async function apiCreate(panelKey, record) {
  const res = await fetch(`${API_BASE}/${panelKey}`, {
    method: "POST",
    headers: _authHeaders(),
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(await _readError(res));
  return res.json();
}

// ── تحديث سجل موجود في D1 ────────────────────────────────────────
async function apiUpdate(panelKey, id, record) {
  const res = await fetch(`${API_BASE}/${panelKey}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: _authHeaders(),
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(await _readError(res));
  return res.json();
}

// ── حذف سجل من D1 ────────────────────────────────────────────────
async function apiDelete(panelKey, id) {
  const res = await fetch(`${API_BASE}/${panelKey}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: _authHeaders()
  });
  if (!res.ok) throw new Error(await _readError(res));
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
