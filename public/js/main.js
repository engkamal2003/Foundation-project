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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    initTheme();
    await renderAll();
    setStatus("جاهز ✅ (Local)");
  } catch (e) {
    console.error(e);
    setStatus("خطأ ❌");
    showToast("حدث خطأ: " + e.message, "error");
  }
});
