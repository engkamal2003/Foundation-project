// =====================================================
// Report Generation
// =====================================================

function buildReport(rows) {
  const panel = currentPanel();
  const reportEl = $("report");
  reportEl.style.display = "block";
  $("reportTitle").textContent = `تقرير: ${panel.title}`;
  $("reportMeta").innerHTML = `
    <div><span class="badge">تاريخ</span> <span>${new Date().toLocaleString("ar-EG")}</span></div>
    <div><span class="badge">عدد السجلات</span> <span>${rows.length}</span></div>
    <div><span class="badge">بحث</span> <span>${($("quickSearch").value || "—")}</span></div>
    <div><span class="badge">وضع العرض</span> <span>${($("colPickerLabel") || {textContent:"كامل"}).textContent}</span></div>
  `;

  if (!rows.length) {
    $("reportBody").innerHTML = `<div style="color:#64748b">لا توجد بيانات مطابقة.</div>`;
    $("reportTotals").innerHTML = "";
    return;
  }

  const cols = getVisibleCols(panel);
  const headers = cols.map(c => (c === "_trucks_count") ? "عدد الأسطر داخل القافلة" : colLabel(c));

  let html = "<table><thead><tr>";
  headers.forEach(h => html += `<th>${h}</th>`);
  html += "</tr></thead><tbody>";

  // حقول أرقام المركبات التي تحتاج مسافات بين الحروف
  const truckNumCols = new Set(["headNo","trailerNo","tailNo","carNo"]);

  rows.forEach(r => {
    html += "<tr>";
    cols.forEach(c => {
      let v = (c === "_trucks_count") ? ((r._trucks || []).length) : (r[c] ?? "");
      // أرقام المركبات: أضف مسافات بين الأحرف العربية
      if (truckNumCols.has(c) && typeof v === "string") {
        v = spacedArabicLetters(v);
      } else if (typeof displayCellValue === "function") {
        v = displayCellValue(panel, c, v);
      } else {
        v = String(v);
      }
      html += `<td>${v}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  $("reportBody").innerHTML = html;

  // Totals calculation
  const reportTotals = $("reportTotals");
  if (panel.key === "cashbox") {
    const sum = rows.reduce((a, r) => a + toNum(r.amount), 0);
    reportTotals.innerHTML = `<div>إجمالي المبلغ: ${Math.round(sum).toLocaleString("en-US")}</div>`;
  } else if (panel.key === "truck_items") {
    const sumW = rows.reduce((a, r) => a + toNum(r.totalWeight), 0);
    reportTotals.innerHTML = `<div>إجمالي الوزن: ${Math.round(sumW).toLocaleString("en-US")}</div>`;
  } else if (panel.key === "convoy_calc") {
    const sum = rows.reduce((a, r) => a + toNum(r.amount), 0);
    reportTotals.innerHTML = `<div>إجمالي مبالغ الاحتساب: ${Math.round(sum).toLocaleString("en-US")}</div>`;
  } else if (panel.key === "pallet_calc") {
    const net = rows.reduce((a, r) => a + (toNum(r.palletsIn) - toNum(r.palletsOut)), 0);
    reportTotals.innerHTML = `<div>صافي الباليتات (وارد-صادر): ${Math.round(net).toLocaleString("en-US")}</div>`;
  } else if (panel.key === "convoys") {
    const totalLines = rows.reduce((a, r) => a + ((r._trucks || []).length), 0);
    const totalWeight = rows.reduce((a, r) => {
      const arr = (r._trucks || []);
      return a + arr.reduce((x, t) => x + toNum(t.totalWeight), 0);
    }, 0);
    reportTotals.innerHTML = `<div>إجمالي الأسطر داخل القوافل: ${totalLines}</div><div>إجمالي الوزن: ${Math.round(totalWeight).toLocaleString("en-US")}</div>`;
  } else {
    reportTotals.innerHTML = "";
  }
}

$("btnMakeReport").onclick = async () => {
  const allRows = filterQuick(await getPanelRows(window.activeKey));
  
  // إذا كان هناك سجلات محددة، استخدمها فقط
  let rows = allRows;
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    rows = allRows.filter(r => window.selectedRecords.has(r.id));
    showToast(`تم توليد تقرير لـ ${rows.length} سجل محدد`, 'success');
  } else {
    showToast(`تم توليد تقرير لكل السجلات (${rows.length})`, 'info');
  }
  
  buildReport(rows);
  $("report").scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus("تم توليد التقرير ✅");
};

// زر إلغاء التحديد
$("btnClearSelect").onclick = () => {
  if (window.selectedRecords) {
    const count = window.selectedRecords.size;
    window.selectedRecords.clear();
    
    // إلغاء تحديد جميع Checkboxes
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    
    const selectAllCheckbox = $("selectAllCheckbox");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
    }
    
    updateSelectedCount();
    showToast(`تم إلغاء تحديد ${count} سجل`, 'success');
  }
};