// =====================================================
// UI Functions
// =====================================================

function setStatus(t) {
  const statusEl = $("status");
  if (!statusEl) return;
  
  const span = statusEl.querySelector('span');
  if (span) {
    span.textContent = t;
  } else {
    statusEl.innerHTML = `<i class="fas fa-circle-check"></i><span>${t}</span>`;
  }
  
  // Update chip styling based on status
  statusEl.className = 'chip';
  if (t.includes('✅') || t.includes('جاهز')) {
    statusEl.classList.add('success');
  } else if (t.includes('❌') || t.includes('خطأ')) {
    statusEl.classList.add('danger');
  }
}

function renderTabs() {
  const tabsEl = $("tabs");
  if (!tabsEl) return; // الصفحة الرئيسية لا تحتوي على عنصر tabs
  tabsEl.innerHTML = "";
  PANELS.forEach(p => {
    const b = document.createElement("button");
    b.className = "tabbtn";
    b.title = "افتح " + p.title + " في تبويبة جديدة";

    // أيقونة + اسم اللوحة + أيقونة فتح جديد
    b.innerHTML = `
      <span>${p.title}</span>
      <i class="fas fa-external-link-alt" style="font-size:0.65rem;opacity:0.55;margin-right:4px;margin-top:1px"></i>
    `;

    b.onclick = () => {
      window.open(`panel.html?panel=${encodeURIComponent(p.key)}`, "_blank");
    };

    tabsEl.appendChild(b);
  });
}

async function uniqueValues(panelKey, fieldKey) {
  const rows = await getPanelRows(panelKey);
  const set = new Set();
  for (const r of rows) {
    const v = (r[fieldKey] ?? "").toString().trim();
    if (v) set.add(v);
  }
  return Array.from(set).slice(0, 400);
}