// =====================================================
// App Boot — index.html (Launcher only)
// =====================================================

window.activeKey       = null;
window.selectedId      = null;
window.__convoy_trucks = [];

// renderAll لصفحة البداية: فقط التبويبات
async function renderAll() {
  renderTabs();
}

// ملاحظة: DOMContentLoaded يُعالَج في index.html مباشرة
// لتجنب التعارض مع انتظار _authReady وبناء buildLauncher
