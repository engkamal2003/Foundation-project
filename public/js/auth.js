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
  // هذه الدالة عامة يمكن استدعاؤها في أي وقت (بعد renderAll مثلاً)
  window.applyPermissions = function applyPermissions(user) {
    if (!user) user = window._authUser;
    if (!user) return;

    // ── مساعد: تحويل القيمة إلى boolean بشكل آمن ──────────────
    // يتعامل مع: 0, 1, "0", "1", true, false, null, undefined
    // null/undefined = مسموح افتراضياً (لم يُعيَّن قيد)
    function toBool(val) {
      if (val === null || val === undefined) return true; // افتراضي: مسموح
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val !== 0;
      if (typeof val === 'string') return val !== '0' && val !== 'false' && val !== '';
      return Boolean(val);
    }

    const canAdd    = toBool(user.can_add);
    const canEdit   = toBool(user.can_edit);
    const canDelete = toBool(user.can_delete);
    const canExport = toBool(user.can_export);
    const canImport = toBool(user.can_import);
    const isAdmin   = user.role === 'admin';

    // إضافة اسم المستخدم في شريط الأدوات
    const nameEl = document.getElementById('_authUserName');
    if (nameEl) nameEl.textContent = user.display_name || user.username;

    // إظهار/إخفاء زر Admin
    const adminBtn = document.getElementById('_adminPanelBtn');
    if (adminBtn) adminBtn.style.display = isAdmin ? '' : 'none';

    // إظهار/إخفاء زر الإحصائيات (للمدير فقط)
    const dashboardBtn = document.getElementById('_dashboardBtn');
    if (dashboardBtn) dashboardBtn.style.display = isAdmin ? '' : 'none';

    // ── تطبيق كل صلاحية على جميع العناصر المقابلة ──────────────
    const permMap = {
      'add':    canAdd,
      'edit':   canEdit,
      'delete': canDelete,
      'export': canExport,
      'import': canImport,
    };

    // 1) العناصر بـ data-perm
    document.querySelectorAll('[data-perm]').forEach(el => {
      const perm = el.getAttribute('data-perm');
      if (perm in permMap) {
        el.style.display = permMap[perm] ? '' : 'none';
      }
    });

    // 2) الأزرار بـ ID محدد (احتياطي إضافي)
    const btnIdMap = {
      'btnNew':             canAdd,
      'btnSave':            canEdit || canAdd,  // الحفظ يعمل للإضافة أو التعديل
      'btnDelete':          canDelete,
      // btnDismantleEntry يُتحكم به في table.js حسب اللوحة النشطة (combined_entries فقط)
      'btnExportExcel':     canExport,
      'btnExportAllExcel':  canExport,
      'btnExportPDF':       canExport,
      'btnPrint':           canExport,
      'btnImportExcel':     canImport,
      'btnBackupAll':       canExport,
      'btnRestoreAll':      canImport,
      'btnSaveJson':        canExport,
      'btnLoadJson':        canImport,
    };

    Object.entries(btnIdMap).forEach(([id, allowed]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = allowed ? '' : 'none';
    });

    // 3) صلاحيات اللوحات المسموح بها
    try {
      let allowedPanels = null;
      if (user.allowed_panels) {
        allowedPanels = typeof user.allowed_panels === 'string'
          ? JSON.parse(user.allowed_panels)
          : user.allowed_panels;
      }
      window._allowedPanels = allowedPanels; // null = كل اللوحات مسموح بها
    } catch {
      window._allowedPanels = null;
    }
  };

  // اجعل الدالة القديمة تشير لنفس الدالة العامة (للتوافق)
  const applyPermissions = window.applyPermissions;

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
