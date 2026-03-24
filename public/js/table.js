// =====================================================
// Table Rendering
// =====================================================

// =====================================================
// Sort & Filter State
// =====================================================
window._tableSort   = { col: "", dir: "desc" };   // col, dir: "asc"|"desc"
window._tableFilter = { col: "", val: "", from: "", to: "" };

/** مزامنة KPI مع الشريط المصغّر */
function syncKpiMini() {
  const count    = document.getElementById("kpiCount");
  const selected = document.getElementById("kpiSelected");
  const hint     = document.getElementById("dbHint");
  const cMini    = document.getElementById("kpiCountMini");
  const sMini    = document.getElementById("kpiSelectedMini");
  const hMini    = document.getElementById("dbHintMini");
  if (cMini && count)   cMini.textContent   = count.textContent;
  if (sMini && selected) sMini.textContent  = selected.textContent;
  if (hMini && hint)    hMini.textContent   = hint.textContent;
}

/** تنسيق الرقم: يُزيل الكسر إذا كان صحيحاً، وإلا يُبقي رقمين عشريين */
function fmtNum(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return n || "";
  return v % 1 === 0 ? String(Math.round(v)) : v.toFixed(2);
}

/** تحديث عناصر الفلتر/الترتيب عند تغيير اللوحة */
function initSortFilterBar(panel) {
  const allCols = getAllPanelCols(panel);
  const labelMap = {};
  (panel.fields || []).forEach(f => { if (f.label) labelMap[f.k] = f.label; });
  labelMap["_trucks_count"] = "عدد الشاحنات";
  labelMap["_hasBilling"]   = "حالة التحاسب";

  // ملء Selects
  ["sortColSel", "filterColSel"].forEach(id => {
    const sel = $(id);
    if (!sel) return;
    const firstOpt = sel.options[0].outerHTML; // حفظ الخيار الأول
    sel.innerHTML = firstOpt;
    allCols.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = labelMap[c] || c;
      sel.appendChild(opt);
    });
  });

  // إعادة ضبط الحالة إلى الإعدادات الافتراضية
  window._tableSort   = { col: "", dir: "desc" };
  window._tableFilter = { col: "", val: "", from: "", to: "" };
  const sfbBadge = $("sfbResultBadge");
  if (sfbBadge) sfbBadge.style.display = "none";

  // إخفاء حقل القيمة
  const wrap = $("filterValWrap");
  if (wrap) wrap.style.display = "none";

  // إعادة ضبط قيم العناصر
  ["sortColSel","filterColSel"].forEach(id => { const el=$(id); if(el) el.value=""; });
  ["filterValText","filterValSelect","filterDateFrom","filterDateTo"].forEach(id => {
    const el=$(id); if(el){ el.value=""; el.style.display="none"; }
  });
}

/** عند تغيير عمود الفلتر — يُظهر عنصر الإدخال المناسب */
function onFilterColChange() {
  const panel  = currentPanel();
  const colKey = $("filterColSel").value;
  const wrap   = $("filterValWrap");

  // إخفاء كل عناصر القيمة
  ["filterValText","filterValSelect","filterDateFrom","filterDateTo"].forEach(id => {
    const el=$(id); if(el){ el.value=""; el.style.display="none"; }
  });

  if (!colKey) { wrap.style.display = "none"; return; }
  wrap.style.display = "flex";

  // هل هو حقل تاريخ؟
  const fieldDef = (panel.fields || []).find(f => f.k === colKey);
  const isDate   = (fieldDef && fieldDef.type === "date") ||
                   /[Dd]ate$/.test(colKey) || colKey === "date";

  if (isDate) {
    $("filterDateFrom").style.display = "inline-block";
    $("filterDateTo").style.display   = "inline-block";
    return;
  }

  // هل له قيم محدودة (listFrom أو select)؟
  const hasListFrom = fieldDef && fieldDef.listFrom;
  const hasOptions  = fieldDef && Array.isArray(fieldDef.options);

  if (hasListFrom || hasOptions) {
    // جمع القيم الفريدة من البيانات الموجودة
    getPanelRows(panel.key).then(rows => {
      const unique = [...new Set(
        rows.map(r => String(r[colKey] ?? "")).filter(Boolean)
      )].sort((a,b) => a.localeCompare(b, "ar"));

      const sel = $("filterValSelect");
      sel.innerHTML = '<option value="">— الكل —</option>';
      unique.forEach(v => {
        const o = document.createElement("option");
        o.value = v; o.textContent = v;
        sel.appendChild(o);
      });
      sel.style.display = "inline-block";
    });
    return;
  }

  // نص حر
  $("filterValText").style.display = "inline-block";
  $("filterValText").focus();
}

/** تبديل اتجاه الترتيب */
function toggleSortDir() {
  window._tableSort.dir = (window._tableSort.dir === "asc") ? "desc" : "asc";
  const btn   = $("sortDirBtn");
  const label = $("sortDirLabel");
  if (window._tableSort.dir === "asc") {
    btn.querySelector("i").className   = "fas fa-arrow-up-wide-short";
    label.textContent = "تصاعدي";
  } else {
    btn.querySelector("i").className   = "fas fa-arrow-down-wide-short";
    label.textContent = "تنازلي";
  }
  applyTableFilters();
}

/** تطبيق الفلتر والترتيب وإعادة رسم الجدول */
async function applyTableFilters() {
  // قراءة حالة الفلتر من العناصر
  window._tableSort.col  = ($("sortColSel")    || {}).value || "";

  const filterCol = ($("filterColSel") || {}).value || "";
  window._tableFilter.col  = filterCol;
  window._tableFilter.val  = ($("filterValText")   || {}).value || "";
  window._tableFilter.sel  = ($("filterValSelect") || {}).value || "";
  window._tableFilter.from = ($("filterDateFrom")  || {}).value || "";
  window._tableFilter.to   = ($("filterDateTo")    || {}).value || "";

  renderTable();
}

/** مسح كل الفلاتر */
function clearTableFilters() {
  window._tableSort   = { col: "", dir: "desc" };
  window._tableFilter = { col: "", val: "", from: "", to: "" };

  ["sortColSel","filterColSel"].forEach(id => { const el=$(id); if(el) el.value=""; });
  ["filterValText","filterValSelect","filterDateFrom","filterDateTo"].forEach(id => {
    const el=$(id); if(el){ el.value=""; el.style.display="none"; }
  });
  const wrap = $("filterValWrap"); if(wrap) wrap.style.display="none";

  const btn = $("sortDirBtn"), lbl = $("sortDirLabel");
  if(btn) btn.querySelector("i").className = "fas fa-arrow-down-wide-short";
  if(lbl) lbl.textContent = "تنازلي";

  const badge = $("sfbResultBadge"); if(badge) badge.style.display = "none";

  renderTable();
}

/** تطبيق الفلتر على قائمة الصفوف */
function applyAdvancedFilter(list) {
  const f = window._tableFilter;
  if (!f.col) return list;

  const isDate = /[Dd]ate$/.test(f.col) || f.col === "date";

  return list.filter(r => {
    const raw = String(r[f.col] ?? "");

    if (isDate) {
      // فلترة بنطاق تاريخ
      if (!f.from && !f.to) return true;
      // raw يكون YYYY-MM-DD
      if (f.from && raw < f.from) return false;
      if (f.to   && raw > f.to  ) return false;
      return true;
    }

    // فلتر select
    if (f.sel) return raw === f.sel;

    // فلتر نص حر
    if (f.val) return raw.toLowerCase().includes(f.val.toLowerCase());

    return true;
  });
}

/** تطبيق الترتيب على قائمة الصفوف */
function applySort(list) {
  const s = window._tableSort;
  if (!s.col) return list;

  return [...list].sort((a, b) => {
    let va = a[s.col] ?? "";
    let vb = b[s.col] ?? "";

    // أرقام
    const na = parseFloat(String(va).replace(/,/g, ""));
    const nb = parseFloat(String(vb).replace(/,/g, ""));
    if (!isNaN(na) && !isNaN(nb)) {
      return s.dir === "asc" ? na - nb : nb - na;
    }

    // تواريخ YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(String(va)) && /^\d{4}-\d{2}-\d{2}/.test(String(vb))) {
      return s.dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    }

    // نص
    return s.dir === "asc"
      ? String(va).localeCompare(String(vb), "ar")
      : String(vb).localeCompare(String(va), "ar");
  });
}

/**
 * فصل الأحرف العربية بمسافات (سيلا 1234 → س ي ل ا 1234)
 */
function spacedArabicLetters(text) {
  if (!text) return '';
  const str = String(text);
  
  // فصل الأحرف العربية فقط بمسافات
  return str.split('').map((char, index, arr) => {
    const isArabic = /[\u0600-\u06FF]/.test(char);
    const nextChar = arr[index + 1];
    const nextIsArabic = nextChar && /[\u0600-\u06FF]/.test(nextChar);
    
    // إذا كان الحرف الحالي عربي والحرف التالي عربي، أضف مسافة بعده
    if (isArabic && nextIsArabic) {
      return char + ' ';
    }
    return char;
  }).join('');
}

function filterQuick(list) {
  const q = ($("quickSearch").value || "").trim().toLowerCase();

  // ── فلتر خاص بلوحة القيود: السنة والشهر ──
  if (window.activeKey === "combined_entries") {
    const yr = (window._ceYearFilter  || "").trim();
    const mo = (window._ceMonthFilter || "").trim();
    if (yr || mo) {
      list = list.filter(r => {
        const rowYear  = String(r.payYear  || "").trim();
        const rowMonth = String(r.payMonth || "").replace(/^0+/, "").trim();
        if (yr && rowYear  !== yr)  return false;
        if (mo && rowMonth !== mo.replace(/^0+/,"")) return false;
        return true;
      });
    }
  }

  // ── فلتر خاص بصندوق دفع حركات السيارات ──
  if (window.activeKey === "car_payment_cashbox") {
    const yr    = (window._pcYearFilter  || "").trim();
    const mo    = (window._pcMonthFilter || "").trim();
    const party = (window._pcPartyFilter || "").trim().toLowerCase();
    if (yr || mo || party) {
      list = list.filter(r => {
        // فلتر السنة والشهر من payDate
        if (yr || mo) {
          const dateParts = String(r.payDate || "").split("-");
          const rowYear  = dateParts[0] || "";
          const rowMonth = String(dateParts[1] || "").replace(/^0+/, "");
          if (yr && rowYear  !== yr) return false;
          if (mo && rowMonth !== mo.replace(/^0+/, "")) return false;
        }
        // فلتر جهة التحاسب
        if (party) {
          const ap = String(r.accountingParty || "").toLowerCase();
          if (!ap.includes(party)) return false;
        }
        return true;
      });
    }
  }

  if (!q) return list;
  
  const selectedColumn = $("searchColumn").value; // العمود المحدد
  
  return list.filter(r => {
    // إذا كان هناك عمود محدد، ابحث فيه فقط
    if (selectedColumn) {
      const cellValue = r[selectedColumn];
      let valueStr = "";
      
      if (Array.isArray(cellValue)) {
        valueStr = JSON.stringify(cellValue);
      } else if (typeof cellValue === "object" && cellValue) {
        valueStr = JSON.stringify(cellValue);
      } else {
        valueStr = String(cellValue ?? "");
      }
      
      return valueStr.toLowerCase().includes(q);
    }
    
    // إذا لم يكن هناك عمود محدد، ابحث في كل الأعمدة (البحث العام)
    const blob = Object.values(r).map(v => {
      if (Array.isArray(v)) return JSON.stringify(v);
      if (typeof v === "object" && v) return JSON.stringify(v);
      return String(v ?? "");
    }).join(" ").toLowerCase();
    return blob.includes(q);
  });
}

// =====================================================
// Column Picker — إدارة اختيار الأعمدة المرئية
// =====================================================
window._colPickerState = {}; // { panelKey: Set<colKey> }

/** إرجاع Set الأعمدة المرئية للوحة الحالية */
function getColPickerVisible(panel) {
  return window._colPickerState[panel.key] || null; // null = كل الأعمدة
}

/** كل أعمدة اللوحة (بدون section_header) */
function getAllPanelCols(panel) {
  // الأعمدة من fields (باستثناء section_header والأعمدة الداخلية _xxx)
  const fieldCols = panel.fields
    .filter(f => f.type !== "section_header" && f.k && !f.k.startsWith("_"))
    .map(f => f.k);

  // أعمدة خاصة بلوحات معينة
  if (panel.key === "convoys") fieldCols.push("_trucks_count");

  // إذا كانت اللوحة تحدد compactCols صراحةً، نضيف منها أي عمود خاص غير موجود
  // مثل: _hasBilling, _seq, seq, code, accountingStatus ...
  const specialFromCompact = (panel.compactCols || []).filter(c =>
    !fieldCols.includes(c)
  );
  return [...fieldCols, ...specialFromCompact];
}

/** تبديل ظهور/إخفاء القائمة */
function toggleColPicker() {
  const dd = $("colPickerDropdown");
  if (!dd) return;
  const isOpen = dd.style.display !== "none";
  dd.style.display = isOpen ? "none" : "block";
  if (!isOpen) buildColPickerList();
}

/** إغلاق القائمة عند الضغط خارجها */
document.addEventListener("click", (e) => {
  const btn = $("colPickerBtn");
  const dd  = $("colPickerDropdown");
  if (!btn || !dd) return;
  if (!btn.contains(e.target) && !dd.contains(e.target)) {
    dd.style.display = "none";
  }
});

/** بناء قائمة الـ checkboxes للوحة الحالية */
function buildColPickerList() {
  const panel = currentPanel();
  if (!panel) return;

  const allCols  = getAllPanelCols(panel);
  const visible  = getColPickerVisible(panel);
  const checkedSet = visible || new Set(allCols);

  // خريطة key → label
  const labelMap = {};
  (panel.fields || []).forEach(f => { if (f.label) labelMap[f.k] = f.label; });
  labelMap["_trucks_count"] = "عدد الشاحنات";
  labelMap["_hasBilling"]   = "حالة التحاسب";

  const list = $("colPickerList");
  list.innerHTML = "";

  allCols.forEach(colKey => {
    const item = document.createElement("div");
    item.className = "col-picker-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id   = "colcb_" + colKey;
    cb.checked = checkedSet.has(colKey);
    cb.addEventListener("change", () => {
      colPickerToggleCol(panel, colKey, cb.checked);
    });

    const lbl = document.createElement("label");
    lbl.htmlFor   = cb.id;
    lbl.textContent = labelMap[colKey] || colKey;

    item.appendChild(cb);
    item.appendChild(lbl);
    // Clicking the row also toggles the checkbox
    item.addEventListener("click", (e) => {
      if (e.target !== cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event("change")); }
    });
    list.appendChild(item);
  });
}

/** تبديل عمود واحد */
function colPickerToggleCol(panel, colKey, show) {
  const allCols = getAllPanelCols(panel);
  let set = window._colPickerState[panel.key];
  if (!set) set = new Set(allCols);
  if (show) set.add(colKey); else set.delete(colKey);
  window._colPickerState[panel.key] = set;
  updateColPickerLabel(panel);
  renderTable();
}

/** إظهار كل الأعمدة */
function colPickerSelectAll() {
  const panel = currentPanel();
  if (!panel) return;
  window._colPickerState[panel.key] = null; // null = كل الأعمدة
  buildColPickerList();
  updateColPickerLabel(panel);
  renderTable();
}

/** الوضع المختصر */
function colPickerSelectCompact() {
  const panel = currentPanel();
  if (!panel) return;
  const compact = panel.compactCols || getAllPanelCols(panel).slice(0, 5);
  window._colPickerState[panel.key] = new Set(compact);
  buildColPickerList();
  updateColPickerLabel(panel);
  renderTable();
}

/** تحديث نص الزر */
function updateColPickerLabel(panel) {
  const lbl = $("colPickerLabel");
  if (!lbl) return;
  const state = window._colPickerState[panel.key];
  if (!state) { lbl.textContent = "كامل"; return; }
  const total = getAllPanelCols(panel).length;
  const shown = state.size;
  lbl.textContent = shown === total ? "كامل" : `${shown} / ${total} عمود`;
}

function getVisibleCols(panel) {
  // ── لوحة القيود: أعمدة ديناميكية حسب نوع القيد المختار ──
  if (panel.key === "combined_entries") {
    const filter = window._combinedEntriesFilter || "جميع القيود";

    // أعمدة المفردة الموحّدة (تستخدم movementNo مثل car_movements وcar_billing)
    const singleCols = ["seq", "code", "entryCreatedAt", "entryType", "entryNo", "movementNo", "accountingParty", "beneficiaryName",
                        "transport", "totalAmount",
                        "mergedStatement", "creditNo2", "notes"];

    if (filter === "القيود المفردة") {
      return singleCols;
    }
    if (filter === "القيود المجمعة") {
      return ["seq", "code", "entryCreatedAt", "entryType", "entryNo", "accountingParty", "beneficiaryName",
              "transport", "movementNos", "recordCount",
              "totalAmount",
              "mergedStatement", "creditNo2", "notes"];
    }
    // ── الفلاتر الثلاثة: تُظهر حركات فردية فقط (بدون مجمعة) ──
    if (filter === "غير المحاسب عليها" ||
        filter === "المحاسب جزئياً" ||
        filter === "المحاسب عليها بالكامل") {
      return singleCols;
    }
    // جميع القيود: مجمعة + مفردة
    return ["seq", "code", "entryCreatedAt", "entryType", "entryNo", "accountingParty", "beneficiaryName",
            "transport", "movementNos", "recordCount",
            "totalAmount",
            "mergedStatement", "creditNo2", "notes"];
  }

  // ── صندوق دفع حركات السيارات: أعمدة ديناميكية حسب الفلتر ──
  if (panel.key === "car_payment_cashbox") {
    const pf = window._paymentCashboxFilter || "الكل";
    // الأعمدة الأساسية الموحّدة
    const baseCols = [
      "seq", "code",
      "payDate", "paymentType", "paidBy", "referenceNo",
      "movementNo", "activityDate",
      "accountingParty", "beneficiaryName", "transport",
      "totalAmount", "paidAmountBefore", "paidAmount", "totalPaidAfter", "remainingAmount",
      "accountingStatus",
      "creditNo2", "statement", "notes"
    ];
    // في حالة "المدفوعة بالكامل" نخفي remainingAmount لأنها صفر دائماً
    if (pf === "المدفوعة بالكامل") {
      return baseCols.filter(c => c !== "remainingAmount" && c !== "paidAmountBefore");
    }
    // في حالة "غير المدفوعة" نخفي paidAmountBefore وtotalPaidAfter
    if (pf === "غير المدفوعة") {
      return baseCols.filter(c => c !== "paidAmountBefore" && c !== "totalPaidAfter" && c !== "paidBy" && c !== "referenceNo");
    }
    return baseCols;
  }

  const state = getColPickerVisible(panel);

  // الأعمدة الكاملة من المصادر المختلفة
  const allCols = getAllPanelCols(panel);

  if (!state) {
    // وضع "كامل": أعِد compactCols أولاً (بترتيبها) ثم باقي الأعمدة
    const compact = panel.compactCols || [];
    const compactOrdered = compact.filter(c => allCols.includes(c) || compact.includes(c));
    const rest = allCols.filter(c => !compact.includes(c));
    return [...compactOrdered, ...rest];
  }

  // وضع "مخصص" — نحتفظ بترتيب compactCols ثم نُضيف أي عمود محدد من خارجه
  const compact = panel.compactCols || [];
  const ordered = compact.filter(c => state.has(c));
  const extra   = allCols.filter(c => state.has(c) && !compact.includes(c));
  return [...ordered, ...extra];
}


function displayCellValue(panel, colKey, value) {
  const f = (panel.fields || []).find(x => x.k === colKey);

  // حقل حالة الإدخال (هل يوجد سجل تحاسب؟)
  if (colKey === "_hasBilling") {
    return value ? "✅ محتسب" : "⏳ لم يُحتسب";
  }

  // الرقم التسلسلي
  if (colKey === "_seq" || colKey === "seq") {
    return value ? String(value) : "—";
  }

  // الكود
  if (colKey === "code") {
    return value ? String(value) : "—";
  }

  // حقل الصور
  if (f && f.type === 'image') {
    return value ? '🖼️' : '';
  }
  if (typeof value === 'string' && value.startsWith('data:image/')) return '🖼️';

  // حقل تاريخ: type=date أو مفتاحه ينتهي بـ Date أو يحتوي على date
  if (
    (f && f.type === 'date') ||
    /[Dd]ate$/.test(colKey) ||
    colKey === 'date' || colKey === 'calcDate' || colKey === 'payDate'
  ) {
    return formatDate(value);
  }

  // contacts_list: أظهر الأسماء والأدوار
  if (f && f.type === 'contacts_list') {
    const arr = Array.isArray(value) ? value : [];
    if (arr.length === 0) return '—';
    return arr.map(c => {
      const parts = [];
      if (c.role)  parts.push(`[${c.role}]`);
      if (c.name)  parts.push(c.name);
      if (c.phone) parts.push(c.phone);
      return parts.join(' ');
    }).join(' | ');
  }

  // أي مصفوفة أو object آخر
  if (Array.isArray(value)) {
    // إذا كانت مصفوفة نصوص بسيطة (items_list) — اعرضها مفصولة بـ " / "
    if (value.length && typeof value[0] === 'string') {
      return value.filter(Boolean).join(' / ');
    }
    return value.length ? JSON.stringify(value) : '';
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  const s = String(value ?? '');
  if (s.length > 120) return s.slice(0, 120) + '…';
  return s;
}

/**
 * تحديث قائمة الأعمدة في select البحث
 * تعرض جميع أعمدة اللوحة وليس فقط الأعمدة المرئية
 */
function updateSearchColumnOptions(panel) {
  const searchColumn = $("searchColumn");
  const currentValue = searchColumn.value; // حفظ القيمة الحالية
  
  searchColumn.innerHTML = '<option value="">كل الأعمدة</option>';
  
  // بناء خريطة من مفتاح الحقل إلى label من تعريف اللوحة مباشرةً
  const fieldLabelMap = {};
  (panel.fields || []).forEach(f => {
    if (f.label) fieldLabelMap[f.k] = f.label;
  });
  
  // استخدام جميع حقول اللوحة وليس فقط الأعمدة المرئية
  const allCols = panel.fields.filter(f => f.k).map(f => f.k);
  if (panel.key === "convoys") allCols.push("_trucks_count");
  // لا نضيف _hasBilling تلقائياً لأنه موجود صراحةً في compactCols

  // خريطة موسّعة تشمل الحقول الخاصة
  const specialLabels = {
    "_trucks_count" : "عدد الأسطر داخل القافلة",
    "_hasBilling"   : "حالة الإدخال",
    "_seq"          : "رقم تسلسلي",
    "seq"           : "رقم تسلسلي",
    "code"          : (panel.key === "combined_entries") ? "كود احتساب أجرة السيارات" : "كود"
  };

  allCols.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = specialLabels[c] || fieldLabelMap[c] || colLabel(c);
    searchColumn.appendChild(option);
  });
  
  // استعادة القيمة إذا كانت موجودة
  if (currentValue) {
    searchColumn.value = currentValue;
  }
}

async function renderTable() {
  const panel = currentPanel();
  if (!panel) {
    console.error("renderTable: لوحة غير معروفة — key:", window.activeKey);
    return;
  }

  // ── إظهار/إخفاء زر "الممكن تجميعه" حسب اللوحة وعدم وجود فلتر قيد نشط ──
  const btnGroupable = $("btnGroupable");
  if (btnGroupable) {
    const inBillingFilter = !!(panel.key === "car_billing" && window._billingFilter);
    btnGroupable.style.display = (panel.key === "car_billing" && !inBillingFilter) ? "inline-flex" : "none";
  }

  const rows = await getPanelRows(panel.key);

  // ── فلتر "عرض حركة واحدة فقط" (قادم من لوحة احتساب أجرة السيارات) ──
  if (panel.key === "car_movements" && window._highlightMovementNo) {
    const mvNo = window._highlightMovementNo;

    // إنشاء/تحديث شريط إشعار بالأعلى
    let noticeBar = document.getElementById("_mvSingleFilterBar");
    if (!noticeBar) {
      noticeBar = document.createElement("div");
      noticeBar.id = "_mvSingleFilterBar";
      noticeBar.style.cssText = [
        "display:flex","align-items:center","justify-content:space-between",
        "background:#fff3cd","border:1.5px solid #f59e0b","border-radius:8px",
        "padding:8px 16px","margin-bottom:10px","font-size:14px","font-weight:700",
        "color:#92400e","gap:12px","flex-wrap:wrap"
      ].join(";");
      // أضفه قبل div.tablewrap مباشرةً
      const tableWrap = document.querySelector(".tablewrap") ||
                        document.getElementById("mainTable");
      if (tableWrap && tableWrap.parentNode) {
        tableWrap.parentNode.insertBefore(noticeBar, tableWrap);
      }
    }
    noticeBar.innerHTML = `
      <span>🔍 عرض حركة واحدة فقط: <span style="color:#1d4ed8">${mvNo}</span></span>
      <button onclick="
        window._highlightMovementNo = null;
        document.getElementById('_mvSingleFilterBar').remove();
        renderTable();
      " style="
        background:#1d4ed8;color:#fff;border:none;border-radius:6px;
        padding:4px 14px;cursor:pointer;font-size:13px;font-weight:700;
      ">⬅ عرض جميع الحركات</button>
    `;

    // فلترة القائمة لصف واحد فقط
    const filtered = rows.filter(r =>
      (r.movementNo || "").toString().trim() === mvNo.trim()
    );
    const list = applySort(filtered);
    $("kpiCount").textContent = list.length;
    // تخطي باقي منطق الفلترة — انتقل مباشرةً لرسم الجدول
    // (نُعيد تعريف list كمتغير محلي ونكمل من نقطة رسم الجدول)
    window._mvFilteredList = list;
  } else {
    // أزل شريط الإشعار إن وُجد
    const old = document.getElementById("_mvSingleFilterBar");
    if (old) old.remove();
    window._mvFilteredList = null;
  }

  // ── فلتر "عرض سجلات قيد محدد فقط" (قادم من لوحة القيود المستحقة) ──
  if (panel.key === "car_billing" && window._billingFilter) {
    const bf = window._billingFilter;

    // إنشاء/تحديث شريط إشعار
    let noticeBar = document.getElementById("_billingFilterBar");
    if (!noticeBar) {
      noticeBar = document.createElement("div");
      noticeBar.id = "_billingFilterBar";
      noticeBar.style.cssText = [
        "display:flex","align-items:center","justify-content:space-between",
        "background:#ede9fe","border:1.5px solid #7c3aed","border-radius:8px",
        "padding:8px 16px","margin-bottom:10px","font-size:14px","font-weight:700",
        "color:#4c1d95","gap:12px","flex-wrap:wrap"
      ].join(";");
      const tableWrap = document.querySelector(".tablewrap");
      if (tableWrap && tableWrap.parentNode) {
        tableWrap.parentNode.insertBefore(noticeBar, tableWrap);
      }
    }
    noticeBar.innerHTML = `
      <span>🔍 عرض سجلات القيد: <span style="color:#7c3aed">${bf.label || ""}</span></span>
      <button onclick="
        window._billingFilter = null;
        document.getElementById('_billingFilterBar').remove();
        renderTable();
      " style="
        background:#7c3aed;color:#fff;border:none;border-radius:6px;
        padding:4px 14px;cursor:pointer;font-size:13px;font-weight:700;
      ">⬅ عرض جميع السجلات</button>
    `;

    // تصفية السجلات حسب نوع القيد
    let filtered;
    if (bf.type === "single") {
      // قيد مفرد: عرض سجل واحد بـ movementNo
      filtered = rows.filter(r =>
        (r.movementNo || "").trim() === (bf.movementNo || "").trim()
      );
    } else if (bf.type === "custom") {
      // قيد مجمع مخصص: عرض السجلات بمعرفاتها
      const ids = new Set((bf.billingIds || "").split("|").map(s => s.trim()));
      filtered = rows.filter(r => ids.has((r.id || r._id || "").trim()));
    } else {
      // قيد مجمع تلقائي: عرض السجلات بنفس جهة التحاسب + جهة الاستفادة
      filtered = rows.filter(r =>
        (r.accountingParty || "").trim() === (bf.accountingParty || "").trim() &&
        (r.beneficiaryName  || "").trim() === (bf.beneficiaryName  || "").trim()
      );
    }

    window._mvFilteredList = applySort(filtered);
    $("kpiCount").textContent = window._mvFilteredList.length;

    // ── شريط المجموع السفلي عند تفعيل فلتر القيد ──────────────
    const bfSummaryBar = $("billingFilterSummary");
    if (bfSummaryBar) {
      const bfList = window._mvFilteredList;
      const bfSumTotal = bfList.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
      bfSummaryBar.style.display = "flex";
      bfSummaryBar.innerHTML = `
        <span style="font-size:15px;font-weight:800;margin-left:20px;color:var(--text-primary);">
          <i class="fas fa-list-ol" style="margin-left:6px;color:#7c3aed;font-size:16px;"></i>
          إجمالي الحركات:&nbsp;<span style="color:#7c3aed;font-size:17px;">${bfList.length}</span>
        </span>
        <span style="
          color:#60a5fa;
          font-size:17px;
          font-weight:800;
          margin-left:24px;
          background:rgba(59,130,246,0.12);
          padding:5px 14px;
          border-radius:8px;
          border:1px solid rgba(59,130,246,0.3);
          letter-spacing:0.3px;
        ">
          إجمالي المبلغ المستحق:&nbsp;<span style="font-size:19px;">${fmtNum(bfSumTotal)}</span>
        </span>
      `;
    }
  } else if (panel.key === "car_billing") {
    const old = document.getElementById("_billingFilterBar");
    if (old) old.remove();
    if (!window._billingFilter) window._mvFilteredList = window._mvFilteredList; // keep existing
    // إخفاء شريط المجموع عند إلغاء الفلتر
    const bfSummaryBar = $("billingFilterSummary");
    if (bfSummaryBar) bfSummaryBar.style.display = "none";
  }

  // فلتر "عرض قيد محدد فقط" في لوحة القيود المستحقة (قادم من لوحة الاحتساب)
  if (panel.key === "combined_entries" && window._entryFilter) {
    const ef = window._entryFilter;
    let noticeBar = document.getElementById("_entryFilterBar");
    if (!noticeBar) {
      noticeBar = document.createElement("div");
      noticeBar.id = "_entryFilterBar";
      noticeBar.style.cssText = [
        "display:flex","align-items:center","justify-content:space-between",
        "background:#ecfdf5","border:1.5px solid #10b981","border-radius:8px",
        "padding:8px 16px","margin-bottom:10px","font-size:14px","font-weight:700",
        "color:#064e3b","gap:12px","flex-wrap:wrap"
      ].join(";");
      const tableWrap = document.querySelector(".tablewrap");
      if (tableWrap && tableWrap.parentNode) {
        tableWrap.parentNode.insertBefore(noticeBar, tableWrap);
      }
    }
    noticeBar.innerHTML = `
      <span>🔍 عرض قيد واحد فقط: <span style="color:#10b981">${ef.entryNo || ""}</span></span>
      <button onclick="
        window._entryFilter = null;
        document.getElementById('_entryFilterBar').remove();
        renderTable();
      " style="
        background:#10b981;color:#fff;border:none;border-radius:6px;
        padding:4px 14px;cursor:pointer;font-size:13px;font-weight:700;
      ">⬅ عرض جميع القيود</button>
    `;
    const filtered = rows.filter(r =>
      (r.entryNo || "").trim() === (ef.entryNo || "").trim()
    );
    window._mvFilteredList = applySort(filtered);
    $('kpiCount').textContent = window._mvFilteredList.length;
  } else if (panel.key === "combined_entries") {
    const old2 = document.getElementById("_entryFilterBar");
    if (old2) old2.remove();
    if (!window._entryFilter) window._mvFilteredList = null;
  }

  // 1. فلتر البحث السريع
  let list = window._mvFilteredList !== null && window._mvFilteredList !== undefined
    ? window._mvFilteredList
    : filterQuick(rows);

  // 2. فلتر الأعمدة المتقدم (فقط إذا لم يكن في وضع الحركة الواحدة)
  if (!window._mvFilteredList) list = applyAdvancedFilter(list);

  // 3. الترتيب (فقط إذا لم يكن مُرتَّباً مسبقاً)
  if (!window._mvFilteredList) list = applySort(list);

  // 4. وضع "الممكن تجميعه": إعادة ترتيب حسب (accountingParty + beneficiaryName)
  //    وتعيين رقم المجموعة لكل سجل لاستخدامه في التلوين
  if (panel.key === "car_billing" && window._groupableMode) {
    // ── إخفاء السجلات الموجودة مسبقاً في قيد مجمع مخصص ──
    const savedCombined = loadPanelLocal("combined_entries");
    const usedInCombined = new Set();
    savedCombined.forEach(e => {
      if (e._customBillingIds) {
        e._customBillingIds.split("|").forEach(id => usedInCombined.add(id.trim()));
      }
    });
    list = list.filter(r => !usedInCombined.has(r.id || r._id));
    $("kpiCount").textContent = list.length;

    // ترتيب ثابت: أولاً حسب accountingParty ثم beneficiaryName
    list = [...list].sort((a, b) => {
      const ka = ((a.accountingParty || "") + "|||" + (a.beneficiaryName || "")).trim();
      const kb = ((b.accountingParty || "") + "|||" + (b.beneficiaryName || "")).trim();
      return ka.localeCompare(kb, "ar");
    });
    // تعيين فهرس المجموعة لكل سجل
    let groupIdx = 0;
    let lastKey  = null;
    list = list.map(r => {
      const key = ((r.accountingParty || "") + "|||" + (r.beneficiaryName || "")).trim();
      if (key !== lastKey) { if (lastKey !== null) groupIdx++; lastKey = key; }
      return { ...r, _groupIdx: groupIdx };
    });
  } else {
    // إزالة _groupIdx خارج وضع التجميع
    list = list.map(r => { const c = { ...r }; delete c._groupIdx; return c; });
  }

  $("kpiCount").textContent = list.length;
  syncKpiMini();
  const sfbBadge = $("sfbResultBadge");
  const hasActiveFilter = window._tableFilter.col ||
    (window._tableFilter.val || window._tableFilter.sel ||
     window._tableFilter.from || window._tableFilter.to);
  const hasActiveSort = window._tableSort.col;
  if (sfbBadge) {
    if (hasActiveFilter || hasActiveSort) {
      sfbBadge.style.display = "inline-flex";
      sfbBadge.textContent = `${list.length} نتيجة`;
    } else {
      sfbBadge.style.display = "none";
    }
  }

  const cols = getVisibleCols(panel);

  // تحديث نص زر الـ col picker
  updateColPickerLabel(panel);

  // تحديث قائمة الأعمدة في select البحث (جميع الأعمدة)
  updateSearchColumnOptions(panel);
  
  const theadRow = $("theadRow");
  theadRow.innerHTML = "";
  
  // إضافة عمود Checkbox في البداية
  const thCheckbox = document.createElement("th");
  thCheckbox.innerHTML = `
    <input 
      type="checkbox" 
      id="selectAllCheckbox" 
      title="تحديد/إلغاء تحديد الكل"
      style="cursor: pointer; width: 18px; height: 18px;"
    />
  `;
  theadRow.appendChild(thCheckbox);
  
  // خريطة من key → label من تعريف اللوحة
  const fieldLabelMapForHeader = {};
  (panel.fields || []).forEach(f => {
    if (f.label) fieldLabelMapForHeader[f.k] = f.label;
  });
  // حقول خاصة غير موجودة في fields
  fieldLabelMapForHeader["_hasBilling"]  = "حالة الإدخال";
  fieldLabelMapForHeader["_seq"]         = "رقم تسلسلي";
  fieldLabelMapForHeader["seq"]          = "رقم تسلسلي";
  // عمود code: تسمية خاصة في لوحة القيود المستحقة
  fieldLabelMapForHeader["code"] = (panel.key === "combined_entries")
    ? "كود احتساب أجرة السيارات"
    : "كود";
  fieldLabelMapForHeader["_trucks_count"]= "عدد الأسطر داخل القافلة";
  fieldLabelMapForHeader["entryType"]    = "نوع القيد";
  fieldLabelMapForHeader["movementNo"]   = "رقم الحركة";
  fieldLabelMapForHeader["movementNos"]  = "رقم الحركة / الحركات";
  fieldLabelMapForHeader["recordCount"]  = "عدد السجلات";
  fieldLabelMapForHeader["accountingStatus"] = "حالة التحاسب";
  fieldLabelMapForHeader["payDay"]       = "يوم الدفع";
  fieldLabelMapForHeader["payMonth"]     = "شهر الدفع";
  fieldLabelMapForHeader["payYear"]          = "سنة الدفع";
  fieldLabelMapForHeader["payDate"]          = "تاريخ الدفع";
  fieldLabelMapForHeader["payDateFull"]      = "تاريخ الدفع";
  // ── صندوق دفع حركات السيارات ──
  fieldLabelMapForHeader["paymentType"]      = "نوع الدفع";
  fieldLabelMapForHeader["paidBy"]           = "الدافع";
  fieldLabelMapForHeader["referenceNo"]      = "رقم القيد";
  fieldLabelMapForHeader["activityDate"]     = "تاريخ النشاط";
  fieldLabelMapForHeader["paidAmountBefore"] = "المدفوع سابقاً";
  fieldLabelMapForHeader["paidAmount"]       = "مبلغ الدفعة";
  fieldLabelMapForHeader["totalPaidAfter"]   = "إجمالي المدفوع";
  fieldLabelMapForHeader["remainingAmount"]  = "المتبقي";
  fieldLabelMapForHeader["totalAmount"]      = "المستحق الإجمالي";
  fieldLabelMapForHeader["statement"]        = "بيان الصرف";
  fieldLabelMapForHeader["mergedStatement"]   = "القيد";
  fieldLabelMapForHeader["entryNo"]           = "رقم القيد";
  fieldLabelMapForHeader["entryCreatedAt"]    = "تاريخ إنشاء القيد";
  fieldLabelMapForHeader["calcStatus"]        = "حالة الاحتساب";

  cols.forEach(c => {
    const th = document.createElement("th");
    th.style.cursor = "pointer";
    th.title = "انقر للترتيب حسب هذا العمود";

    const label = fieldLabelMapForHeader[c] || colLabel(c);

    // أيقونة الترتيب
    const isActive = window._tableSort.col === c;
    const sortIcon = isActive
      ? (window._tableSort.dir === "asc" ? " ▲" : " ▼")
      : " ⇅";

    th.innerHTML = `<span>${label}</span><span class="sort-icon${isActive ? " sort-active" : ""}">${sortIcon}</span>`;

    th.onclick = () => {
      const sortSel = $("sortColSel");
      if (sortSel) sortSel.value = c;
      if (window._tableSort.col === c) {
        // عكس الاتجاه
        window._tableSort.dir = (window._tableSort.dir === "asc") ? "desc" : "asc";
        const btn = $("sortDirBtn"), lbl = $("sortDirLabel");
        if (btn) btn.querySelector("i").className =
          window._tableSort.dir === "asc"
            ? "fas fa-arrow-up-wide-short"
            : "fas fa-arrow-down-wide-short";
        if (lbl) lbl.textContent = window._tableSort.dir === "asc" ? "تصاعدي" : "تنازلي";
      } else {
        window._tableSort.col = c;
        window._tableSort.dir = "asc";
        const btn = $("sortDirBtn"), lbl = $("sortDirLabel");
        if (btn) btn.querySelector("i").className = "fas fa-arrow-up-wide-short";
        if (lbl) lbl.textContent = "تصاعدي";
      }
      renderTable();
    };

    theadRow.appendChild(th);
  });

  // ── إضافة مقابض تغيير عرض الأعمدة (Column Resize) ──
  initColumnResize(theadRow, cols);

  const tbody = $("tbody");
  tbody.innerHTML = "";
  
  // تهيئة مصفوفة السجلات المحددة إذا لم تكن موجودة
  if (!window.selectedRecords) {
    window.selectedRecords = new Set();
  }

  // ══════════════════════════════════════════════════
  // PAGINATION - ترقيم الصفحات
  // ══════════════════════════════════════════════════
  const PAGE_SIZE = 50; // عدد السجلات في كل صفحة
  const totalRecords = list.length;

  // تهيئة رقم الصفحة الحالية (يُحفظ لكل لوحة)
  if (!window._pageMap) window._pageMap = {};
  const panelPageKey = panel.key;

  // إعادة الصفحة للأولى إذا تغيرت اللوحة أو البحث
  const searchVal = ($("quickSearch") || {}).value || "";
  const lastSearch = window._lastSearch || "";
  if (searchVal !== lastSearch || window._lastPanelKey !== panelPageKey) {
    window._pageMap[panelPageKey] = 1;
    window._lastSearch = searchVal;
    window._lastPanelKey = panelPageKey;
  }

  const currentPage = window._pageMap[panelPageKey] || 1;
  const totalPages  = Math.ceil(totalRecords / PAGE_SIZE) || 1;
  const safePage    = Math.min(currentPage, totalPages);
  window._pageMap[panelPageKey] = safePage;

  const startIdx = (safePage - 1) * PAGE_SIZE;
  const endIdx   = Math.min(startIdx + PAGE_SIZE, totalRecords);
  const pageList = totalRecords > PAGE_SIZE ? list.slice(startIdx, endIdx) : list;

  // ── رسم أزرار الترقيم ──
  let paginationBar = document.getElementById("_paginationBar");
  if (!paginationBar) {
    paginationBar = document.createElement("div");
    paginationBar.id = "_paginationBar";
    paginationBar.style.cssText = [
      "display:flex","align-items:center","justify-content:space-between",
      "flex-wrap:wrap","gap:8px","padding:8px 4px","margin-top:6px","font-size:13px"
    ].join(";");
    const tableWrap = document.querySelector(".tablewrap") || tbody.parentNode?.parentNode;
    if (tableWrap && tableWrap.parentNode) {
      tableWrap.parentNode.insertBefore(paginationBar, tableWrap.nextSibling);
    }
  }

  if (totalRecords > PAGE_SIZE) {
    paginationBar.style.display = "flex";
    const pageButtons = [];
    // زر السابق
    pageButtons.push(`<button onclick="window._goPage('${panelPageKey}',${safePage-1})" ${safePage<=1?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-color,#334155);background:var(--card-bg,#1e293b);color:var(--text-primary,#f1f5f9);cursor:${safePage<=1?'not-allowed':'pointer'};opacity:${safePage<=1?0.4:1}">‹ السابق</button>`);
    // أرقام الصفحات
    let pStart = Math.max(1, safePage - 2), pEnd = Math.min(totalPages, safePage + 2);
    if (pStart > 1) pageButtons.push(`<button onclick="window._goPage('${panelPageKey}',1)" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color,#334155);background:var(--card-bg,#1e293b);color:var(--text-primary,#f1f5f9);cursor:pointer">1</button>`);
    if (pStart > 2) pageButtons.push(`<span style="color:var(--text-muted,#94a3b8)">…</span>`);
    for (let p = pStart; p <= pEnd; p++) {
      const isActive = p === safePage;
      pageButtons.push(`<button onclick="window._goPage('${panelPageKey}',${p})" style="padding:4px 10px;border-radius:6px;border:1px solid ${isActive?'#3b82f6':'var(--border-color,#334155)'};background:${isActive?'#3b82f6':'var(--card-bg,#1e293b)'};color:${isActive?'#fff':'var(--text-primary,#f1f5f9)'};cursor:pointer;font-weight:${isActive?700:400}">${p}</button>`);
    }
    if (pEnd < totalPages - 1) pageButtons.push(`<span style="color:var(--text-muted,#94a3b8)">…</span>`);
    if (pEnd < totalPages) pageButtons.push(`<button onclick="window._goPage('${panelPageKey}',${totalPages})" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-color,#334155);background:var(--card-bg,#1e293b);color:var(--text-primary,#f1f5f9);cursor:pointer">${totalPages}</button>`);
    // زر التالي
    pageButtons.push(`<button onclick="window._goPage('${panelPageKey}',${safePage+1})" ${safePage>=totalPages?'disabled':''} style="padding:4px 10px;border-radius:6px;border:1px solid var(--border-color,#334155);background:var(--card-bg,#1e293b);color:var(--text-primary,#f1f5f9);cursor:${safePage>=totalPages?'not-allowed':'pointer'};opacity:${safePage>=totalPages?0.4:1}">التالي ›</button>`);

    paginationBar.innerHTML = `
      <span style="color:var(--text-muted,#94a3b8)">
        عرض <strong style="color:var(--text-primary,#f1f5f9)">${startIdx+1}–${endIdx}</strong> من <strong style="color:var(--text-primary,#f1f5f9)">${totalRecords}</strong> سجل
      </span>
      <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">${pageButtons.join('')}</div>
    `;
  } else {
    paginationBar.style.display = "none";
  }

  // دالة الانتقال للصفحة
  window._goPage = function(key, page) {
    if (!window._pageMap) window._pageMap = {};
    const tp = Math.ceil((window._totalForPagination || 1) / PAGE_SIZE) || 1;
    window._pageMap[key] = Math.max(1, Math.min(page, tp));
    renderTable();
  };
  window._totalForPagination = totalRecords;

  // استخدم pageList (الصفحة الحالية فقط) لرسم الصفوف
  pageList.forEach(r => {
    const rowId = r.id || r._id || "";   // معرّف آمن للصف
    const tr = document.createElement("tr");
    tr.dataset.id = rowId;
    if (rowId && rowId === window.selectedId) tr.classList.add("selected");

    // ── لوحة حركة السيارات: تلوين الصف المُحدَّد بالبرتقالي ──────────
    if (panel.key === "car_movements" && window._highlightMovementNo) {
      const mvNo = (r.movementNo || "").toString().trim();
      if (mvNo && mvNo === window._highlightMovementNo) {
        tr.style.background    = "#fff3cd";
        tr.style.borderRight   = "4px solid #f59e0b";
        tr.style.borderLeft    = "4px solid #f59e0b";
        tr.style.fontWeight    = "700";
        tr.dataset.highlighted = "true";
      }
    }

    // ── لوحة احتساب أجرة السيارات: تلوين الصف حسب حالة التحاسب / وضع التجميع ──
    if (panel.key === "car_billing") {
      // وضع التجميع: لون المجموعة يطغى على باقي الألوان
      if (window._groupableMode && r._groupIdx !== undefined) {
        // 8 ألوان هادئة تتناوب بين المجموعات
        const GROUP_COLORS = [
          { bg: "#eff6ff", border: "#3b82f6" },  // أزرق
          { bg: "#f0fdf4", border: "#22c55e" },  // أخضر
          { bg: "#fdf4ff", border: "#a855f7" },  // بنفسجي
          { bg: "#fff7ed", border: "#f97316" },  // برتقالي
          { bg: "#fefce8", border: "#eab308" },  // أصفر
          { bg: "#f0f9ff", border: "#0ea5e9" },  // سماوي
          { bg: "#fdf2f8", border: "#ec4899" },  // وردي
          { bg: "#f0fdfa", border: "#14b8a6" },  // زمردي
        ];
        const col = GROUP_COLORS[r._groupIdx % GROUP_COLORS.length];
        tr.style.background  = col.bg;
        tr.style.borderRight = `4px solid ${col.border}`;
      } else {
        // التلوين العادي حسب حالة التحاسب
        if (!r._hasBilling) {
          tr.style.opacity = "0.65";
        } else if (r.accountingStatus === "محاسب كامل") {
          tr.style.borderRight = "3px solid #22c55e";
        } else if (r.accountingStatus === "محاسب جزئي") {
          tr.style.borderRight = "3px solid #f59e0b";
        }
      }
    }

    // ── لوحة القيود: تمييز نوع القيد بشريط جانبي + تمييز غير المحاسبة ──
    if (panel.key === "combined_entries") {
      // تحديد ما إذا كانت غير محاسبة
      const isUnaccounted = !r.accountingStatus || r.accountingStatus === "لم يُحاسب" || r.accountingStatus === "";
      const isFullyPaid   = r.accountingStatus === "محاسب كامل";
      const hasRemainingAmt = parseFloat(r.totalRemaining) > 0;
      const isGroupFullyPaid = !r._isSingle && !hasRemainingAmt && parseFloat(r.totalAmount) > 0;

      if (r._isSingle === true) {
        if (isFullyPaid) {
          tr.style.borderRight = "4px solid #22c55e";   // أخضر للمفردة المحاسبة بالكامل
          tr.style.background  = "rgba(34,197,94,0.07)";
        } else if (isUnaccounted) {
          tr.style.borderRight = "4px solid #ef4444";   // أحمر للمفردة غير المحاسبة
          tr.style.background  = "rgba(239,68,68,0.06)";
        } else {
          tr.style.borderRight = "3px solid #3b82f6";   // أزرق للقيود المفردة (محاسب جزئي)
          tr.style.opacity     = "0.9";
        }
      } else {
        if (isGroupFullyPaid) {
          tr.style.borderRight = "4px solid #22c55e";   // أخضر للمجمعة المسددة بالكامل
          tr.style.background  = "rgba(34,197,94,0.07)";
        } else if (hasRemainingAmt) {
          tr.style.borderRight = "4px solid #f97316";   // برتقالي للمجمعة التي فيها متبقٍ
          tr.style.background  = "rgba(249,115,22,0.06)";
        } else {
          tr.style.borderRight = "3px solid #8b5cf6";   // بنفسجي للقيود المجمعة الأخرى
        }
      }
    }

    // ── صندوق دفع حركات السيارات: تلوين حسب حالة التحاسب ──
    if (panel.key === "car_payment_cashbox") {
      if (r.accountingStatus === "محاسب كامل") {
        tr.style.borderRight = "4px solid #22c55e";
        tr.style.background  = "rgba(34,197,94,0.07)";
      } else if (r.accountingStatus === "محاسب جزئي") {
        tr.style.borderRight = "4px solid #f59e0b";
        tr.style.background  = "rgba(245,158,11,0.07)";
      } else if (!r.accountingStatus || r.accountingStatus === "لم يُحاسب") {
        tr.style.borderRight = "4px solid #ef4444";
        tr.style.background  = "rgba(239,68,68,0.06)";
      }
    }
    
    // إضافة عمود Checkbox
    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "row-checkbox";
    checkbox.dataset.recordId = rowId;
    checkbox.checked = rowId ? window.selectedRecords.has(rowId) : false;
    checkbox.style.cursor = "pointer";
    checkbox.style.width = "18px";
    checkbox.style.height = "18px";
    
    // تحديد/إلغاء تحديد السجل عبر الـ checkbox مع تلوين الصف
    checkbox.onclick = (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        window.selectedRecords.add(rowId);
        tr.classList.add("row-selected");
      } else {
        window.selectedRecords.delete(rowId);
        tr.classList.remove("row-selected");
        // إذا كان هذا هو selectedId الحالي وأُلغي تحديده
        if (window.selectedId === rowId) window.selectedId = null;
      }
      updateSelectedCount();
    };
    
    tdCheckbox.appendChild(checkbox);
    tr.appendChild(tdCheckbox);

    tr.onclick = async (e) => {
      // ── تجاهل النقر إذا كان المستخدم يُحدد نصاً ──
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;

      // ── تجاهل النقر إذا جاء من checkbox أو مقبض الـ resize ──
      if (e.target.type === "checkbox") return;
      if (e.target.closest(".col-resizer-handle")) return;

      // ── تحديد الصف: toggle الـ checkbox + selectedRecords ──
      const isSelected = window.selectedRecords.has(rowId);
      if (isSelected) {
        window.selectedRecords.delete(rowId);
        checkbox.checked = false;
        tr.classList.remove("row-selected");
        if (window.selectedId === rowId) window.selectedId = null;
        updateSelectedCount();
        return;
      }

      window.selectedRecords.add(rowId);
      checkbox.checked = true;
      tr.classList.add("row-selected");

      window.selectedId = rowId;
      if (panel.key === "convoys") window.__convoy_trucks = r._trucks || [];
      // ── لوحة احتساب أجرة السيارات: حفظ معرّف حركة السيارة للربط ──
      if (panel.key === "car_billing") window._billingMovementId = r.movementId || rowId;
      updateSelectedCount();
      await renderAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    cols.forEach(c => {
      const td = document.createElement("td");
      td.dataset.col = c; // إضافة data-col للتحكم في CSS
      if (c === "_trucks_count") {
        td.textContent = (r._trucks && Array.isArray(r._trucks)) ? r._trucks.length : 0;
      } else {
        // _seq يقرأ من r.seq أو r._seq
        const rawValue = c === "_seq" ? (r.seq ?? r._seq ?? "")
                       : (r[c] ?? "");
        const value = rawValue;
        // تطبيق فصل الأحرف العربية فقط على أعمدة الشاحنات
        if (c === "headNo" || c === "trailerNo" || c === "tailNo" || c === "carNo") {
          td.textContent = spacedArabicLetters(value);
        } else {
          td.textContent = displayCellValue(panel, c, value);
        }

        // ── رقم الحركة في لوحة احتساب أجرة السيارات: رابط قابل للنقر ────
        if (c === "movementNo" && panel.key === "car_billing" && value) {
          td.innerHTML = "";
          const link = document.createElement("span");
          link.textContent = value;
          link.title       = "انقر للانتقال إلى حركة السيارة " + value;
          link.style.cssText = [
            "color:#2563eb",
            "font-weight:700",
            "cursor:pointer",
            "text-decoration:underline",
            "border-radius:4px",
            "padding:1px 4px",
            "transition:background 0.15s"
          ].join(";");
          link.onmouseenter = () => { link.style.background = "#dbeafe"; };
          link.onmouseleave = () => { link.style.background = "transparent"; };
          link.onclick = (e) => {
            e.stopPropagation();
            const url = `panel.html?panel=car_movements&highlight=${encodeURIComponent(value)}`;
            window.open(url, "_blank");
          };
          td.appendChild(link);
        }

        // ── رقم القيد في لوحة احتساب أجرة السيارات: رابط ينتقل إلى combined_entries ──
        if (c === "entryNo" && panel.key === "car_billing" && value) {
          td.innerHTML = "";
          const link = document.createElement("span");
          link.textContent = value;
          link.title       = "انقر للانتقال إلى هذا القيد في لوحة القيود المستحقة";
          link.style.cssText = [
            "color:#10b981",
            "font-weight:700",
            "cursor:pointer",
            "text-decoration:underline",
            "border-radius:4px",
            "padding:1px 4px",
            "transition:background 0.15s"
          ].join(";");
          link.onmouseenter = () => { link.style.background = "#d1fae5"; };
          link.onmouseleave = () => { link.style.background = "transparent"; };
          link.onclick = (e) => {
            e.stopPropagation();
            const url = "panel.html?panel=combined_entries&ef_entryNo=" + encodeURIComponent(value);
            window.open(url, "_blank");
          };
          td.appendChild(link);
        }

        // ── رقم القيد في صندوق دفع حركات السيارات: رابط ينتقل إلى combined_entries مع إخفاء الباقي ──
        if (c === "referenceNo" && panel.key === "car_payment_cashbox" && value) {
          td.innerHTML = "";
          const link = document.createElement("span");
          link.textContent = value;
          link.title       = "انقر للانتقال إلى هذا القيد في لوحة القيود المستحقة";
          link.style.cssText = [
            "color:#a78bfa",
            "font-weight:700",
            "cursor:pointer",
            "text-decoration:underline",
            "border-radius:4px",
            "padding:1px 4px",
            "transition:background 0.15s"
          ].join(";");
          link.onmouseenter = () => { link.style.background = "rgba(167,139,250,0.15)"; };
          link.onmouseleave = () => { link.style.background = "transparent"; };
          link.onclick = (e) => {
            e.stopPropagation();
            const url = "panel.html?panel=combined_entries&ef_entryNo=" + encodeURIComponent(value);
            window.location.href = url;
          };
          td.appendChild(link);
        }

        // ── كود القيد في لوحة القيود المستحقة: رابط ينتقل إلى car_billing ──
        if (c === "code" && panel.key === "combined_entries" && value) {
          td.innerHTML = "";
          const link = document.createElement("span");
          link.textContent = value;
          link.title = "انقر لعرض سجلات هذا القيد في لوحة الاحتساب";
          link.style.cssText = [
            "color:#7c3aed",
            "font-weight:700",
            "cursor:pointer",
            "text-decoration:underline",
            "border-radius:4px",
            "padding:1px 4px",
            "transition:background 0.15s"
          ].join(";");
          link.onmouseenter = () => { link.style.background = "#ede9fe"; };
          link.onmouseleave = () => { link.style.background = "transparent"; };
          link.onclick = (e) => {
            e.stopPropagation();
            // بناء معاملات الفلتر حسب نوع القيد
            let params = `panel=car_billing`;
            if (r._isSingle) {
              // قيد مفرد: تصفية بـ movementNo
              params += `&bf_type=single&bf_movementNo=${encodeURIComponent(r.movementNo || "")}&bf_label=${encodeURIComponent(value)}`;
            } else if (r._isCustomGroup) {
              // قيد مجمع مخصص: تصفية بمعرفات السجلات
              params += `&bf_type=custom&bf_ids=${encodeURIComponent(r._customBillingIds || "")}&bf_label=${encodeURIComponent(value)}`;
            } else {
              // قيد مجمع تلقائي: تصفية بجهة التحاسب + الاستفادة
              params += `&bf_type=group&bf_party=${encodeURIComponent(r.accountingParty || "")}&bf_beneficiary=${encodeURIComponent(r.beneficiaryName || "")}&bf_label=${encodeURIComponent(value)}`;
            }
            window.open(`panel.html?${params}`, "_blank");
          };
          td.appendChild(link);
        }

        // ── تمييز عمود رقم القيد في لوحة القيود المستحقة ────────
        if (c === "entryNo" && panel.key === "combined_entries" && value) {
          td.style.color      = "#10b981"; // أخضر
          td.style.fontWeight = "700";
          td.style.fontSize   = "12px";
        }

        // ── تلوين خلية حالة الاحتساب في لوحة احتساب أجرة السيارات ──
        if (c === "calcStatus" && panel.key === "car_billing") {
          if (value === "محتسب") {
            td.style.color       = "#10b981"; // أخضر
            td.style.fontWeight  = "700";
            td.style.fontSize    = "12px";
          } else {
            td.style.color       = "#ef4444"; // أحمر
            td.style.fontWeight  = "700";
            td.style.fontSize    = "12px";
          }
        }
      }

      // ── تنسيق خلية تاريخ إنشاء القيد ────────────────────
      if (c === "entryCreatedAt" && panel.key === "combined_entries") {
        const raw = (r[c] || "").trim();
        if (raw) {
          // تحويل YYYY-MM-DD إلى DD-MM-YYYY للعرض
          const parts = raw.split("-");
          const display = parts.length === 3 ? (parts[2] + "-" + parts[1] + "-" + parts[0]) : raw;
          td.textContent = display;
          td.style.color      = "#0369a1";
          td.style.fontWeight = "600";
          td.style.fontSize   = "12px";
          td.style.whiteSpace = "nowrap";
        } else {
          td.textContent = "—";
          td.style.color = "var(--text-muted, #888)";
        }
      }

      // ── تلوين خلية نوع القيد (لوحة القيود) ───────────────
      if (c === "entryType") {
        const et = r[c] || "";
        if (et === "قيد مفرد") {
          td.style.color      = "#3b82f6"; // أزرق للمفردة
          td.style.fontWeight = "700";
          td.style.fontSize   = "12px";
        } else if (et === "قيد مجمع") {
          td.style.color      = "#8b5cf6"; // بنفسجي للمجمعة
          td.style.fontWeight = "700";
          td.style.fontSize   = "12px";
        }
      }

      // ── تلوين خلية حالة التحاسب ──────────────────────────
      if (c === "accountingStatus") {
        const status = r[c] || "";
        td.dataset.status = status;
        if (status === "محاسب كامل") {
          td.style.color       = "#10b981";
          td.style.fontWeight  = "700";
        } else if (status === "محاسب جزئي") {
          td.style.color       = "#f59e0b";
          td.style.fontWeight  = "700";
        } else if (status === "لم يُحاسب" || status === "") {
          td.style.color       = "#ef4444";
          td.style.fontWeight  = "700";
        }
      }

      // ── تلوين خلية المبلغ المتبقي ─────────────────────────
      if (c === "amount" && panel.key === "car_billing") {
        const amt = parseFloat(r[c]);
        if (!isNaN(amt) && amt === 0) {
          td.style.color      = "#10b981";
          td.style.fontWeight = "700";
        } else if (!isNaN(amt) && amt > 0) {
          td.style.color      = "#f59e0b";
          td.style.fontWeight = "700";
        }
      }

      // ── تنسيق خلية عمود القيد (mergedStatement) في لوحة القيود المستحقة ──
      if (c === "mergedStatement" && panel.key === "combined_entries") {
        const raw = (r.mergedStatement || "").trim();
        if (raw) {
          td.innerHTML = "";
          td.style.whiteSpace = "pre-line";
          td.style.maxWidth   = "260px";
          td.style.fontSize   = "12px";
          td.style.lineHeight = "1.5";
          td.style.color      = "var(--text-primary)";
          // اعرض أول 120 حرفاً وزرّ "المزيد" إذا كان أطول
          if (raw.length > 120) {
            const short = document.createElement("span");
            short.textContent = raw.slice(0, 120) + "…";
            const more = document.createElement("span");
            more.textContent = " [المزيد]";
            more.style.cssText = "color:#7c3aed;cursor:pointer;font-size:11px;font-weight:700;";
            more.onclick = (ev) => {
              ev.stopPropagation();
              td.innerHTML = "";
              td.style.whiteSpace = "pre-line";
              td.textContent = raw;
            };
            td.appendChild(short);
            td.appendChild(more);
          } else {
            td.textContent = raw;
          }
        } else {
          td.textContent = "—";
          td.style.color = "var(--text-muted, #888)";
        }
      }

      tr.appendChild(td);
    });

    // ── زر "عرض الحركات" لصفوف القيود المجمعة فقط ──────────
    if (panel.key === "combined_entries" && r._isSingle === false) {
      const tdBtn = document.createElement("td");
      tdBtn.style.whiteSpace = "nowrap";
      const btn = document.createElement("button");
      btn.className = "secondary";
      btn.style.cssText = "padding:4px 10px;font-size:12px;margin:0;";
      btn.innerHTML = '<i class="fas fa-list-ul"></i> الحركات';
      btn.onclick = (e) => {
        e.stopPropagation();
        showGroupMovementsModal(r);
      };
      tdBtn.appendChild(btn);
      tr.appendChild(tdBtn);
    }

    tbody.appendChild(tr);
  });
  
  // إضافة وظيفة "تحديد الكل"
  const selectAllCheckbox = $("selectAllCheckbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.onclick = (e) => {
      const checkboxes = document.querySelectorAll('.row-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
        const recordId = cb.dataset.recordId;
        const row = cb.closest("tr");
        if (selectAllCheckbox.checked) {
          window.selectedRecords.add(recordId);
          if (row) row.classList.add("row-selected");
        } else {
          window.selectedRecords.delete(recordId);
          if (row) row.classList.remove("row-selected");
        }
      });
      if (!selectAllCheckbox.checked) window.selectedId = null;
      updateSelectedCount();
    };
  }
  
  updateSelectedCount();

  // ── سطر المجموع الأفقي للوحة القيود ──────────────────────
  const summaryBar = $("combinedEntriesSummary");
  if (panel.key === "combined_entries" && summaryBar) {
    const sumTotal     = list.reduce((s, r) => s + (parseFloat(r.totalAmount)     || 0), 0);
    summaryBar.style.display = "flex";
    summaryBar.innerHTML = `
      <span style="font-size:15px;font-weight:800;margin-left:20px;color:var(--text-primary);">
        <i class="fas fa-sigma" style="margin-left:6px;color:var(--accent);font-size:16px;"></i>
        المجموع (${list.length} سجل):
      </span>
      <span style="
        color:#60a5fa;
        font-size:17px;
        font-weight:800;
        margin-left:24px;
        background:rgba(59,130,246,0.12);
        padding:5px 14px;
        border-radius:8px;
        border:1px solid rgba(59,130,246,0.3);
        letter-spacing:0.3px;
      ">
        الإجمالي الكلي:&nbsp;<span style="font-size:19px;">${fmtNum(sumTotal)}</span>
      </span>
    `;
  } else if (summaryBar) {
    summaryBar.style.display = "none";
  }

  // ── سطر المجموع الأفقي لصندوق دفع حركات السيارات ──────────
  const paymentSummaryBar = $("paymentCashboxSummary");
  if (panel.key === "car_payment_cashbox" && paymentSummaryBar) {
    const sumTotal     = list.reduce((s, r) => s + (parseFloat(r.totalAmount)     || 0), 0);
    const sumPaid      = list.reduce((s, r) => s + (parseFloat(r.paidAmount)      || 0), 0);
    const sumRemaining = list.reduce((s, r) => s + (parseFloat(r.remainingAmount) || 0), 0);
    const countFull    = list.filter(r => r.accountingStatus === "محاسب كامل").length;
    const countPartial = list.filter(r => r.accountingStatus === "محاسب جزئي").length;
    const countNone    = list.filter(r => !r.accountingStatus || r.accountingStatus === "لم يُحاسب").length;
    paymentSummaryBar.style.display = "flex";
    paymentSummaryBar.innerHTML = `
      <span style="font-size:14px;font-weight:800;margin-left:16px;color:var(--text-primary);">
        <i class="fas fa-wallet" style="margin-left:5px;color:var(--accent);"></i>
        الصندوق (${list.length} حركة):
      </span>
      <span style="color:#60a5fa;font-size:15px;font-weight:700;margin-left:16px;background:rgba(59,130,246,0.12);padding:4px 12px;border-radius:8px;border:1px solid rgba(59,130,246,0.3);">
        المستحق:&nbsp;<strong style="font-size:17px;">${fmtNum(sumTotal)}</strong>
      </span>
      <span style="color:#34d399;font-size:15px;font-weight:700;margin-left:16px;background:rgba(16,185,129,0.12);padding:4px 12px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);">
        المدفوع:&nbsp;<strong style="font-size:17px;">${fmtNum(sumPaid)}</strong>
      </span>
      <span style="color:#fbbf24;font-size:15px;font-weight:700;margin-left:16px;background:rgba(245,158,11,0.12);padding:4px 12px;border-radius:8px;border:1px solid rgba(245,158,11,0.3);">
        المتبقي:&nbsp;<strong style="font-size:17px;">${fmtNum(sumRemaining)}</strong>
      </span>
      <span style="color:#22c55e;font-size:13px;font-weight:600;margin-left:10px;padding:4px 10px;border-radius:6px;background:rgba(34,197,94,0.1);">
        ✅ كامل: ${countFull}
      </span>
      <span style="color:#f59e0b;font-size:13px;font-weight:600;margin-left:10px;padding:4px 10px;border-radius:6px;background:rgba(245,158,11,0.1);">
        🔶 جزئي: ${countPartial}
      </span>
      <span style="color:#ef4444;font-size:13px;font-weight:600;margin-left:10px;padding:4px 10px;border-radius:6px;background:rgba(239,68,68,0.1);">
        ⚠️ غير مدفوع: ${countNone}
      </span>
    `;
  } else if (paymentSummaryBar) {
    paymentSummaryBar.style.display = "none";
  }

  // إخفاء شريط مجموع احتساب أجرة السيارات على باقي اللوحات
  if (panel.key !== "car_billing") {
    const bfBar = $("billingFilterSummary");
    if (bfBar) bfBar.style.display = "none";
  }
}

// دالة لتحديث عدد السجلات المحددة
function updateSelectedCount() {
  const count = window.selectedRecords ? window.selectedRecords.size : 0;
  const kpiSelected = $("kpiSelected");
  if (kpiSelected) {
    kpiSelected.textContent = count;
  }
  // ── مزامنة مع الشريط المصغّر ──
  const sMini = document.getElementById("kpiSelectedMini");
  if (sMini) sMini.textContent = count;

  // ── إظهار أزرار القيد في الشريط المصغّر (تعكس نفس حالة الأزرار الرئيسية) ──
  const inBillingFilter = !!(window.activeKey === "car_billing" && window._billingFilter);
  const miniSingle   = document.getElementById("btnCreateSingleEntryMini");
  const miniCombined = document.getElementById("btnCreateCombinedEntryMini");
  if (miniSingle)   miniSingle.style.display   = (window.activeKey === "car_billing" && count === 1 && !inBillingFilter) ? "inline-flex" : "none";
  if (miniCombined) miniCombined.style.display  = (window.activeKey === "car_billing" && count >= 2 && !inBillingFilter) ? "inline-flex" : "none";

  // ── إظهار زر "إنشاء قيد مفرد" فقط في لوحة car_billing عند تحديد سجل واحد بالضبط
  //    وعدم وجود فلتر قيد نشط (السجلات لها قيد مسبق)
  const btnSingle = $("btnCreateSingleEntry");
  if (btnSingle) {
    btnSingle.style.display =
      (window.activeKey === "car_billing" && count === 1 && !inBillingFilter) ? "inline-flex" : "none";
  }
  // ── إظهار زر "إنشاء قيد مجمع" فقط في لوحة car_billing عند تحديد 2+ سجلات
  //    وعدم وجود فلتر قيد نشط
  const btnCombined = $("btnCreateCombinedEntry");
  if (btnCombined) {
    btnCombined.style.display =
      (window.activeKey === "car_billing" && count >= 2 && !inBillingFilter) ? "inline-flex" : "none";
  }
  // ── إظهار زر "الممكن تجميعه" فقط في لوحة car_billing وليس في وضع فلتر القيد ──
  const btnGroupable = $("btnGroupable");
  if (btnGroupable) {
    const inBillingFilter = !!(window.activeKey === "car_billing" && window._billingFilter);
    btnGroupable.style.display =
      (window.activeKey === "car_billing" && !inBillingFilter) ? "inline-flex" : "none";
  }

  // ── إدارة زر "حذف" و"تفكيك القيد" حسب اللوحة النشطة ──
  const btnDelete    = $("btnDelete");
  const btnDismantle = $("btnDismantleEntry");
  if (btnDelete && btnDismantle) {
    // canDelete من صلاحيات المستخدم الحالي
    const _canDel = window._authUser
      ? (function(v){ return v===null||v===undefined?true:typeof v==='boolean'?v:typeof v==='number'?v!==0:v!=='0'&&v!=='false'&&v!==''; })(window._authUser.can_delete)
      : true;

    if (window.activeKey === "combined_entries" && count > 0) {
      // في لوحة القيود المستحقة مع تحديد سجل:
      // أظهر "تفكيك" فقط إذا كان لديه صلاحية الحذف، وأخفِ "حذف"
      btnDelete.style.display    = "none";
      btnDismantle.style.display = _canDel ? "inline-flex" : "none";
    } else {
      // باقي اللوحات: أظهر حذف (حسب الصلاحية) وأخفِ تفكيك دائماً
      btnDelete.style.display    = _canDel ? "inline-flex" : "none";
      btnDismantle.style.display = "none";
    }
  }
  // مزامنة الشريط المصغّر
  syncKpiMini();
}

// =====================================================
// وضع "الممكن تجميعه" — ترتيب ملوّن حسب المجموعة
// =====================================================
window._groupableMode = false;

function toggleGroupableView() {
  window._groupableMode = !window._groupableMode;

  const btn   = $("btnGroupable");
  const label = $("btnGroupableLabel");

  if (window._groupableMode) {
    // وضع التجميع: تلوين الزر للدلالة على التفعيل
    if (btn) {
      btn.style.background   = "#7c3aed";
      btn.style.borderColor  = "#7c3aed";
      btn.style.color        = "#fff";
    }
    if (label) label.textContent = "إلغاء التجميع";
    showToast("✅ وضع التجميع مفعّل — السجلات مرتبة حسب المجموعة", "success", 3000);
  } else {
    // إلغاء التجميع
    if (btn) {
      btn.style.background  = "";
      btn.style.borderColor = "";
      btn.style.color       = "";
    }
    if (label) label.textContent = "الممكن تجميعه";
    showToast("تم إلغاء وضع التجميع", "info", 2000);
  }
  renderTable();
}

// =====================================================
// نافذة منبثقة: حركات القيد المجمع
// =====================================================
async function showGroupMovementsModal(groupRec) {
  // جلب جميع سجلات الاحتساب المحسوبة
  const billingRows = await getPanelRows("car_billing");

  // تصفية السجلات التي تنتمي لهذه المجموعة
  const party      = (groupRec.accountingParty || "").trim();
  const beneficiary= (groupRec.beneficiaryName  || "").trim();
  const members    = billingRows.filter(r =>
    (r.accountingParty || "").trim() === party &&
    (r.beneficiaryName  || "").trim() === beneficiary
  );

  // أعمدة الجدول الداخلي
  const cols = [
    { k: "movementNo",      label: "رقم الحركة"      },
    { k: "activityDate",    label: "تاريخ النشاط"    },
    { k: "accountingDate",  label: "يوم الاحتساب"    },
    { k: "transport",       label: "نوع السيارة"      },
    { k: "driverName",      label: "اسم السائق"       },
    { k: "entrySystem",     label: "نوع الدوام"       },
    { k: "total",           label: "الإجمالي"         },
    { k: "paidAmount",      label: "المدفوع"          },
    { k: "amount",          label: "المتبقي"          },
    { k: "accountingStatus",label: "حالة التحاسب"     },
    { k: "statement",       label: "القيد"            },
  ];

  // بناء صفوف الجدول
  const rowsHtml = members.map(r => {
    const statusColor = r.accountingStatus === "محاسب كامل"  ? "#10b981"
                      : r.accountingStatus === "محاسب جزئي"  ? "#f59e0b"
                      : "#ef4444";
    return `<tr>
      ${cols.map(c => {
        let val = (r[c.k] ?? "");
        let style = "";
        if (c.k === "accountingStatus") style = `color:${statusColor};font-weight:700;`;
        if (c.k === "statement") style = "white-space:pre-line;max-width:260px;font-size:11px;";
        if (c.k === "amount") {
          const amt = parseFloat(val);
          style = !isNaN(amt) && amt === 0 ? "color:#10b981;font-weight:700;"
                : !isNaN(amt) && amt > 0   ? "color:#f59e0b;font-weight:700;" : "";
        }
        return `<td style="padding:8px 10px;border-bottom:1px solid var(--border);${style}">${val}</td>`;
      }).join("")}
    </tr>`;
  }).join("");

  // حساب الإجماليات
  const sumTotal   = members.reduce((s,r) => s + (parseFloat(r.total)      || 0), 0);
  const sumPaid    = members.reduce((s,r) => s + (parseFloat(r.paidAmount) || 0), 0);
  const sumRemain  = sumTotal - sumPaid;

  // إزالة Modal قديم إن وُجد
  const oldModal = document.getElementById("groupMovementsModal");
  if (oldModal) oldModal.remove();

  // بناء HTML للنافذة
  const modal = document.createElement("div");
  modal.id = "groupMovementsModal";
  modal.style.cssText = `
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.65); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center; padding:16px;
  `;
  modal.innerHTML = `
    <div style="
      background:var(--card); border-radius:12px; width:100%; max-width:1100px;
      max-height:90vh; display:flex; flex-direction:column;
      box-shadow:0 20px 60px rgba(0,0,0,0.5); border:1px solid var(--border);
    ">
      <!-- رأس النافذة -->
      <div style="
        padding:16px 20px; border-bottom:1px solid var(--border);
        display:flex; align-items:center; justify-content:space-between; gap:12px;
        background:var(--bg-secondary); border-radius:12px 12px 0 0;
      ">
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text-primary);">
            <i class="fas fa-list-ul" style="color:var(--accent);margin-left:8px;"></i>
            حركات القيد المجمع
          </div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">
            <span style="color:var(--accent);">${party}</span>
            &nbsp;←&nbsp;
            <span>${beneficiary}</span>
            &nbsp;|&nbsp;
            <strong>${members.length} سجل</strong>
          </div>
        </div>
        <button id="closeGroupModal" style="
          background:none; border:1px solid var(--border); border-radius:8px;
          color:var(--text-muted); cursor:pointer; padding:6px 12px; font-size:18px;
        ">✕</button>
      </div>

      <!-- جدول الحركات -->
      <div style="overflow:auto; flex:1; padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px; direction:rtl;">
          <thead>
            <tr style="background:var(--bg-secondary); position:sticky; top:0; z-index:2;">
              ${cols.map(c => `<th style="
                padding:10px 10px; text-align:right; font-weight:600;
                color:var(--text-secondary); border-bottom:2px solid var(--border);
                white-space:nowrap;
              ">${c.label}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="${cols.length}" style="text-align:center;padding:24px;color:var(--text-muted);">لا توجد حركات</td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- تذييل الإجماليات -->
      <div style="
        padding:14px 20px; border-top:1px solid var(--border);
        background:var(--bg-secondary); border-radius:0 0 12px 12px;
        display:flex; gap:24px; flex-wrap:wrap; align-items:center;
        font-size:13px; font-weight:600;
      ">
        <span>الإجمالي: <span style="color:var(--accent)">${fmtNum(sumTotal)}</span></span>
        <span>المدفوع: <span style="color:#10b981">${fmtNum(sumPaid)}</span></span>
        <span>المتبقي: <span style="color:${sumRemain > 0 ? '#f59e0b' : '#10b981'}">${fmtNum(sumRemain)}</span></span>
        <button onclick="document.getElementById('groupMovementsModal').remove()" style="
          margin-right:auto; background:var(--accent); color:#fff; border:none;
          border-radius:8px; padding:8px 20px; cursor:pointer; font-size:13px;
        ">إغلاق</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // إغلاق بالضغط على X أو خارج النافذة
  document.getElementById("closeGroupModal").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
}
// ══════════════════════════════════════════════════════════════
// Column Resize — مقابض سحب لتغيير عرض أعمدة الجدول
// ══════════════════════════════════════════════════════════════
function initColumnResize(theadRow, cols) {
  const STORAGE_PREFIX = "_colW_";

  // ── استعادة العروض المحفوظة لهذه اللوحة ──
  const panelKey = window.activeKey || "default";
  function getSavedWidths() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + panelKey);
      return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
  }
  function saveWidths(map) {
    try { localStorage.setItem(STORAGE_PREFIX + panelKey, JSON.stringify(map)); } catch(e) {}
  }

  const savedWidths = getSavedWidths();
  const widthMap    = {};  // colIndex → width

  // ── معالجة كل <th> ──
  const ths = Array.from(theadRow.querySelectorAll("th"));
  ths.forEach((th, idx) => {
    const colKey = cols[idx - 1] || ("col_" + idx);  // -1 لعمود الـ checkbox

    // تطبيق العرض المحفوظ
    if (savedWidths[colKey]) {
      th.style.width    = savedWidths[colKey] + "px";
      th.style.minWidth = savedWidths[colKey] + "px";
      widthMap[colKey]  = savedWidths[colKey];
    }

    // لا مقبض على عمود الـ checkbox (idx===0)
    if (idx === 0) return;

    // تأكد أن الـ th يدعم position relative للمقبض
    if (getComputedStyle(th).position === "static") {
      th.style.position = "relative";
    }

    // ── إنشاء مقبض السحب ──
    const handle = document.createElement("div");
    handle.className = "col-resizer-handle";
    handle.innerHTML = `<div class="col-resizer-grip"></div>`;
    handle.title = "اسحب لتغيير عرض العمود — نقر مزدوج لإعادة الضبط";
    th.appendChild(handle);

    let isDragging = false;
    let startX     = 0;
    let startW     = 0;

    // ── Mouse ──
    handle.addEventListener("mousedown", function(e) {
      e.stopPropagation();
      e.preventDefault();
      isDragging = true;
      startX     = e.clientX;
      startW     = th.getBoundingClientRect().width;
      handle.classList.add("dragging");
      document.body.classList.add("is-col-resizing");
    });

    document.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      const dx  = startX - e.clientX;   // RTL: يسار = زيادة العرض
      const newW = Math.max(60, startW + dx);
      th.style.width    = newW + "px";
      th.style.minWidth = newW + "px";
      // طبّق على نفس الأعمدة في tbody
      syncColWidth(theadRow, idx, newW);
    });

    document.addEventListener("mouseup", function() {
      if (!isDragging) return;
      isDragging = false;
      handle.classList.remove("dragging");
      document.body.classList.remove("is-col-resizing");
      const finalW = th.getBoundingClientRect().width;
      widthMap[colKey] = finalW;
      saveWidths(Object.assign(getSavedWidths(), widthMap));
    });

    // ── Touch ──
    handle.addEventListener("touchstart", function(e) {
      e.stopPropagation();
      const touch = e.touches[0];
      isDragging = true;
      startX     = touch.clientX;
      startW     = th.getBoundingClientRect().width;
      handle.classList.add("dragging");
      document.body.classList.add("is-col-resizing");
    }, { passive: true });

    document.addEventListener("touchmove", function(e) {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx  = startX - touch.clientX;
      const newW = Math.max(60, startW + dx);
      th.style.width    = newW + "px";
      th.style.minWidth = newW + "px";
      syncColWidth(theadRow, idx, newW);
    }, { passive: true });

    document.addEventListener("touchend", function() {
      if (!isDragging) return;
      isDragging = false;
      handle.classList.remove("dragging");
      document.body.classList.remove("is-col-resizing");
      const finalW = th.getBoundingClientRect().width;
      widthMap[colKey] = finalW;
      saveWidths(Object.assign(getSavedWidths(), widthMap));
    });

    // ── نقر مزدوج: إعادة ضبط هذا العمود ──
    handle.addEventListener("dblclick", function(e) {
      e.stopPropagation();
      th.style.removeProperty("width");
      th.style.removeProperty("min-width");
      syncColWidth(theadRow, idx, null);
      delete widthMap[colKey];
      const cur = getSavedWidths();
      delete cur[colKey];
      saveWidths(cur);
    });
  });

  // ── مزامنة عرض عمود في tbody ──
  function syncColWidth(theadRow, thIdx, width) {
    const table = theadRow.closest("table");
    if (!table) return;
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(tr => {
      const tds = tr.querySelectorAll("td");
      const td = tds[thIdx];
      if (!td) return;
      if (width === null) {
        td.style.removeProperty("width");
        td.style.removeProperty("min-width");
      } else {
        td.style.width    = width + "px";
        td.style.minWidth = width + "px";
      }
    });
  }
}
