// =====================================================
// Export & Print Functions
// =====================================================

function exportExcel(rows) {
  const panel = currentPanel();
  const cols = getVisibleCols(panel);
  const out = rows.map(r => {
    const obj = {};
    cols.forEach(c => {
      const k = (c === "_trucks_count") ? "عدد الأسطر داخل القافلة" : colLabel(c);
      obj[k] = (c === "_trucks_count") ? ((r._trucks || []).length) : (r[c] ?? "");
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(out);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${panel.title}.xlsx`);
}

// =====================================================
// CSS ثابت للطباعة/PDF (لا يتأثر بوضع الليل)
// =====================================================
const PRINT_PDF_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Tahoma, Arial, sans-serif;
    margin: 16px;
    background: #ffffff !important;
    color: #111827 !important;
    direction: rtl;
  }
  .report {
    background: #ffffff !important;
    color: #111827 !important;
    padding: 20px;
    display: block !important;
  }
  .report h2 {
    text-align: center;
    color: #111827 !important;
    font-size: 22px;
    margin: 0 0 14px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    font-size: 12px;
    color: #334155 !important;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e5e7eb;
  }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    border: 1px solid #d1d5db;
    border-radius: 999px;
    background: #f9fafb !important;
    color: #374151 !important;
    font-weight: 600;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  th, td {
    border: 1px solid #d1d5db;
    padding: 7px 9px;
    text-align: right;
    font-size: 11px;
    vertical-align: top;
    background: #ffffff !important;
    color: #111827 !important;
  }
  th {
    background: #f3f4f6 !important;
    color: #374151 !important;
    font-weight: 700;
  }
  tr:nth-child(even) td { background: #f9fafb !important; }
  .totals {
    display: flex;
    gap: 14px;
    justify-content: flex-end;
    font-weight: 700;
    flex-wrap: wrap;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 2px solid #e5e7eb;
    color: #111827 !important;
  }
  @media print {
    body { margin: 0; }
    @page { margin: 12mm; size: A4; }
  }
`;

// بناء HTML نظيف للتقرير (بدون dark mode)
function buildCleanReportHTML() {
  const reportEl = $("report");
  // نسخ محتوى التقرير دون أي styles مرتبطة بالـ DOM
  const title   = $("reportTitle").textContent || "تقرير";
  const metaHTML   = $("reportMeta").innerHTML || "";
  const bodyHTML   = $("reportBody").innerHTML || "";
  const totalsHTML = $("reportTotals").innerHTML || "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
  <style>${PRINT_PDF_STYLES}</style>
</head>
<body>
  <div class="report">
    <h2>${title}</h2>
    <div class="meta">${metaHTML}</div>
    <div>${bodyHTML}</div>
    <div class="totals">${totalsHTML}</div>
  </div>
</body>
</html>`;
}

function exportPDF() {
  if ($("report").style.display === "none") {
    showToast("ولّد تقريراً أولاً لتصديره PDF", "warning");
    return;
  }

  const title = $("reportTitle").textContent || "report";
  const cleanHTML = buildCleanReportHTML();

  // إنشاء iframe مؤقت بـ light theme للتصدير
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(cleanHTML);
  iframe.contentDocument.close();

  // انتظر تحميل الـ iframe ثم صدّر
  iframe.onload = () => {
    const reportDiv = iframe.contentDocument.querySelector(".report");
    html2pdf().set({
      margin: 10,
      filename: title + ".pdf",
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(reportDiv).save().then(() => {
      document.body.removeChild(iframe);
    });
  };
}

function printReport() {
  if ($("report").style.display === "none") {
    showToast("ولّد تقريراً أولاً للطباعة", "warning");
    return;
  }

  const cleanHTML = buildCleanReportHTML();
  const w = window.open("", "_blank");
  if (!w) {
    showToast("فشل فتح نافذة الطباعة — تحقق من إعدادات المتصفح", "error");
    return;
  }
  w.document.open();
  w.document.write(cleanHTML);
  w.document.close();
  w.focus();
  // انتظر تحميل الصفحة ثم اطبع
  w.onload = () => { w.print(); };
  // fallback في حال لم يُطلق onload
  setTimeout(() => { try { w.print(); } catch(e) {} }, 800);
}

$("btnExportExcel").onclick = async () => {
  const allRows = filterQuick(await getPanelRows(window.activeKey));
  
  // إذا كان هناك سجلات محددة، استخدمها فقط
  let rows = allRows;
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    rows = allRows.filter(r => window.selectedRecords.has(r.id));
    exportExcel(rows);
    showToast(`تم تصدير ${rows.length} سجل محدد إلى Excel! 📊`, "success");
  } else {
    exportExcel(rows);
    showToast("تم تصدير كل السجلات بنجاح! 📊", "success");
  }
};
$("btnExportPDF").onclick = () => {
  exportPDF();
  showToast("تم تصدير PDF بنجاح! 📄", "success");
};
$("btnPrint").onclick = printReport;

// JSON save/load (Local only)
function saveJson() {
  const panel = currentPanel();
  const data = loadPanelLocal(panel.key);
  const blob = new Blob([JSON.stringify({ version: 1, panel: panel.key, data }, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${panel.title}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("تم حفظ الملف JSON بنجاح! 💾", "success");
}

function loadJsonFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (obj && obj.panel && Array.isArray(obj.data)) {
        savePanelLocal(obj.panel, obj.data);
        if (obj.panel === window.activeKey) {
          window.selectedId = null;
          if (window.activeKey === "convoys") window.__convoy_trucks = [];
        }
        renderAll();
        setStatus("تم استيراد JSON ✅");
        showToast("تم استيراد البيانات بنجاح! 📥", "success");
      } else {
        showToast("ملف JSON غير صحيح", "error");
      }
    } catch {
      showToast("لم أستطع قراءة ملف JSON", "error");
    }
  };
  reader.readAsText(file, "utf-8");
}

$("btnSaveJson").onclick = saveJson;
$("btnLoadJson").onclick = () => $("jsonInput").click();
$("jsonInput").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) loadJsonFile(f);
});

// Backup/Restore all (Local only)
function backupAll() {
  const all = {};
  for (const p of PANELS) {
    all[p.key] = loadPanelLocal(p.key);
  }
  const blob = new Blob([JSON.stringify({ version: 1, all }, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `backup_full_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("تم حفظ نسخة احتياطية كاملة! 💾", "success");
}

function restoreAllFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      if (obj && obj.all && typeof obj.all === "object") {
        let count = 0;
        for (const p of PANELS) {
          if (Array.isArray(obj.all[p.key])) {
            savePanelLocal(p.key, obj.all[p.key]);
            count++;
          }
        }
        window.selectedId = null;
        if (window.activeKey === "convoys") window.__convoy_trucks = [];
        renderAll();
        setStatus("تم استيراد كل البيانات ✅");
        showToast(`تم استرجاع ${count} لوحة بنجاح! 📥`, "success");
      } else {
        showToast("ملف النسخة غير صحيح", "error");
      }
    } catch {
      showToast("لم أستطع قراءة ملف النسخة", "error");
    }
  };
  reader.readAsText(file, "utf-8");
}

$("btnBackupAll").onclick = backupAll;
$("btnRestoreAll").onclick = () => $("allJsonInput").click();
$("allJsonInput").addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) restoreAllFile(f);
});

// =====================================================
// Excel Import/Export for Current Panel
// =====================================================

// Export current panel to Excel
function exportCurrentPanelExcel() {
  const panel = currentPanel();
  const allRows = loadPanelLocal(panel.key);
  
  if (!allRows || allRows.length === 0) {
    showToast("لا توجد بيانات للتصدير في هذه اللوحة", "warning");
    return;
  }
  
  // إذا كان هناك سجلات محددة، استخدمها فقط
  let rows = allRows;
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    rows = allRows.filter(r => window.selectedRecords.has(r.id));
    if (rows.length === 0) {
      showToast("لا توجد سجلات محددة للتصدير", "warning");
      return;
    }
  }

  // Get visible columns
  const cols = getVisibleCols(panel);
  
  // Prepare data for Excel
  const excelData = rows.map(r => {
    const obj = {};
    cols.forEach(c => {
      const label = colLabel(c);
      
      // Handle special cases
      if (c === "_trucks_count") {
        obj[label] = (r._trucks || []).length;
      } else if (c === "idFrontImg" || c === "idBackImg") {
        obj[label] = r[c] ? "يوجد صورة" : "";
      } else {
        // تحويل التواريخ إلى DD/MM/YYYY عند التصدير
        const rawVal = r[c] ?? "";
        const fieldDef = (panel.fields || []).find(f => f.k === c);
        const isDateField = (fieldDef && fieldDef.type === 'date') ||
          /[Dd]ate$/.test(c) || c === 'date' || c === 'calcDate' || c === 'payDate';
        obj[label] = isDateField ? formatDate(rawVal) : rawVal;
      }
    });
    return obj;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = cols.map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, panel.title.substring(0, 31)); // Excel limit
  
  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const selectedText = (window.selectedRecords && window.selectedRecords.size > 0) ? '_محدد' : '';
  const filename = `${panel.title}${selectedText}_${date}.xlsx`;
  
  // Download
  XLSX.writeFile(wb, filename);
  
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    showToast(`تم تصدير ${rows.length} سجل محدد إلى Excel! 📊`, "success");
  } else {
    showToast(`تم تصدير ${rows.length} سجل إلى Excel! 📊`, "success");
  }
}

// Import Excel to current panel
function importExcelToPanel(file) {
  const panel = currentPanel();
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get first sheet
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      if (!jsonData || jsonData.length === 0) {
        showToast("ملف Excel فارغ أو غير صحيح", "error");
        return;
      }

      // Get field mappings (Arabic label -> field key)
      const fieldMap = {};
      panel.fields.forEach(f => {
        fieldMap[colLabel(f.k)] = f.k;
      });

      // Convert Excel rows to panel format
      const convertedRows = [];
      let skipped = 0;
      
      jsonData.forEach(excelRow => {
        const newRow = {
          id: uid()
        };
        
        // Map Excel columns to fields
        let hasData = false;
        Object.keys(excelRow).forEach(excelCol => {
          const fieldKey = fieldMap[excelCol];
          if (fieldKey) {
            const value = excelRow[excelCol];
            if (value !== null && value !== undefined && value !== "") {
              newRow[fieldKey] = String(value).trim();
              hasData = true;
            }
          }
        });
        
        // Only add if row has at least one field
        if (hasData) {
          // Auto-generate seq and code
          const seq = convertedRows.length + 1;
          newRow.seq = seq;
          if (typeof genShortCode === "function") {
            newRow.code = genShortCode(panel.key, seq);
          }
          
          // Initialize missing fields
          panel.fields.forEach(f => {
            if (!newRow[f.k]) {
              newRow[f.k] = "";
            }
          });
          
          convertedRows.push(newRow);
        } else {
          skipped++;
        }
      });

      if (convertedRows.length === 0) {
        showToast("لم يتم العثور على بيانات صالحة في الملف", "error");
        return;
      }

      // Ask for confirmation
      const confirmed = confirm(
        `تم العثور على ${convertedRows.length} سجل في ملف Excel.\n` +
        (skipped > 0 ? `(تم تجاهل ${skipped} صف فارغ)\n\n` : "\n") +
        `هل تريد:\n` +
        `1. استبدال جميع البيانات الحالية؟ (اضغط OK)\n` +
        `2. إضافة إلى البيانات الموجودة؟ (اضغط Cancel ثم OK في الرسالة التالية)`
      );

      if (confirmed) {
        // Replace all data
        savePanelLocal(panel.key, convertedRows);
        showToast(`تم استبدال البيانات بـ ${convertedRows.length} سجل من Excel! 📥`, "success");
      } else {
        const addToExisting = confirm(
          `هل تريد إضافة الـ ${convertedRows.length} سجل إلى البيانات الموجودة؟`
        );
        
        if (addToExisting) {
          // Add to existing data
          const existingRows = loadPanelLocal(panel.key);
          
          // Update seq numbers for new rows
          let maxSeq = 0;
          existingRows.forEach(r => {
            const n = Number(r.seq);
            if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
          });
          
          convertedRows.forEach((r, idx) => {
            r.seq = maxSeq + idx + 1;
            if (typeof genShortCode === "function") {
              r.code = genShortCode(panel.key, r.seq);
            }
          });
          
          const mergedRows = [...existingRows, ...convertedRows];
          savePanelLocal(panel.key, mergedRows);
          showToast(`تمت إضافة ${convertedRows.length} سجل جديد! 📥`, "success");
        } else {
          showToast("تم إلغاء الاستيراد", "info");
          return;
        }
      }

      // Refresh display
      window.selectedId = null;
      if (window.activeKey === "convoys") window.__convoy_trucks = [];
      renderAll();

    } catch (error) {
      console.error("Excel import error:", error);
      showToast("خطأ في قراءة ملف Excel: " + error.message, "error");
    }
  };
  
  reader.onerror = () => {
    showToast("فشل في قراءة الملف", "error");
  };
  
  reader.readAsArrayBuffer(file);
}