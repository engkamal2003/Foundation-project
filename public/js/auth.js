// =====================================================
// Auth Guard - حماية الصفحات بتسجيل الدخول
// يُضمَّن في كل صفحة تحتاج حماية
// =====================================================

(function() {
  'use strict';

  // ── المتغيرات العامة ─────────────────────────────────────────
  window._authToken = localStorage.getItem('_authToken') || '';
  window._authUser  = null;
  try {
    const raw = localStorage.getItem('_authUser');
    if (raw) window._authUser = JSON.parse(raw);
  } catch {}

  // ── التحقق من الجلسة عند تحميل الصفحة ──────────────────────
  async function checkAuth() {
    const token = window._authToken;
    if (!token) {
      redirectToLogin();
      return null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!res.ok) {
        clearAuth();
        redirectToLogin();
        return null;
      }

      const data = await res.json();
      window._authUser = data.user;
      localStorage.setItem('_authUser', JSON.stringify(data.user));

      // تطبيق صلاحيات المستخدم
      applyPermissions(data.user);

      return data.user;
    } catch {
      // في حالة فشل الاتصال استخدم البيانات المخزنة محلياً
      if (window._authUser) {
        applyPermissions(window._authUser);
        return window._authUser;
      }
      redirectToLogin();
      return null;
    }
  }

  // ── تطبيق صلاحيات المستخدم على الواجهة ─────────────────────
  function applyPermissions(user) {
    if (!user) return;

    // إضافة اسم المستخدم في شريط الأدوات
    const nameEl = document.getElementById('_authUserName');
    if (nameEl) nameEl.textContent = user.display_name || user.username;

    // إظهار/إخفاء زر Admin
    const adminBtn = document.getElementById('_adminPanelBtn');
    if (adminBtn) adminBtn.style.display = user.role === 'admin' ? '' : 'none';

    // صلاحية الإضافة
    if (!user.can_add) {
      document.querySelectorAll('#btnNew, [data-perm="add"]').forEach(el => {
        el.style.display = 'none';
      });
    }

    // صلاحية التعديل
    if (!user.can_edit) {
      document.querySelectorAll('#btnSave, [data-perm="edit"]').forEach(el => {
        el.style.display = 'none';
      });
    }

    // صلاحية الحذف
    if (!user.can_delete) {
      document.querySelectorAll('#btnDelete, #btnDismantleEntry, [data-perm="delete"]').forEach(el => {
        el.style.display = 'none';
      });
    }

    // صلاحية التصدير
    if (!user.can_export) {
      document.querySelectorAll('[data-perm="export"], .export-btn').forEach(el => {
        el.style.display = 'none';
      });
    }

    // صلاحية الاستيراد
    if (!user.can_import) {
      document.querySelectorAll('[data-perm="import"], .import-btn').forEach(el => {
        el.style.display = 'none';
      });
    }

    // صلاحيات اللوحات
    const allowedPanels = user.allowed_panels ? JSON.parse(user.allowed_panels) : null;
    if (allowedPanels) {
      window._allowedPanels = allowedPanels;
    }
  }

  // ── تسجيل الخروج ────────────────────────────────────────────
  window.authLogout = async function() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + window._authToken }
      });
    } catch {}
    clearAuth();
    redirectToLogin();
  };

  function clearAuth() {
    localStorage.removeItem('_authToken');
    localStorage.removeItem('_authUser');
    window._authToken = '';
    window._authUser  = null;
  }

  function redirectToLogin() {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = '/login.html?next=' + next;
  }

  // ── تشغيل الحماية ────────────────────────────────────────────
  window._authReady = checkAuth();

})();
