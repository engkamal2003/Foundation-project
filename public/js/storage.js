// =====================================================
// Storage Layer - Cloudflare D1 Backend
// يستخدم D1 API للقراءة/الكتابة، ويحتفظ بـ localStorage
// كـ cache محلي فقط للسرعة
// =====================================================

// ── بناء نص قيد احتساب أجرة السيارة تلقائياً ──────────────────
function buildCarBillingStatement(r) {
  const fmtDate = (ds) => {
    if (!ds) return "";
    const d = new Date(ds);
    return isNaN(d) ? "" : d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
  };

  let line1Parts = [];
  if (r.accountingParty) line1Parts.push("اجرة " + r.accountingParty);
  if (r.transport)       line1Parts.push("سيارة " + r.transport);
  const fromDate = r.periodFromDate || "";
  const toDate   = r.periodToDate   || "";
  if (fromDate || toDate) {
    let period = "";
    if (fromDate) period += fmtDate(fromDate);
    if (toDate)   period += (period ? " إلى " : "") + fmtDate(toDate);
    if (period)   line1Parts.push("من " + period);
  }

  let line2Parts = [];
  if (r.beneficiaryName) line2Parts.push("لصالح " + r.beneficiaryName);
  if (r.creditNo2)       line2Parts.push("رقم اعتماد " + r.creditNo2);
  if (r.creditNo)        line2Parts.push("رقم اعتماد " + r.creditNo);
  if (r.movementNo)      line2Parts.push("حركة " + r.movementNo);

  const line1 = line1Parts.join(" ");
  const line2 = line2Parts.join(" | ");
  return line2 ? line1 + "\n" + line2 : line1;
}

function storageKey(panelKey) {
  return "db_" + panelKey;
}

// ── مساعد: تاريخ اليوم بصيغة YYYY-MM-DD ──────────────────────
function todayDateStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

// ── توليد رقم قيد عشوائي ──────────────────────────────────────
function genEntryNo() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return "ENT-" + digits;
}

// ── Cache في الذاكرة (للسرعة) ─────────────────────────────────
const _memCache = {};

function _getCached(panelKey) {
  return _memCache[panelKey] || null;
}
function _setCache(panelKey, data) {
  _memCache[panelKey] = data;
}
function _clearCache(panelKey) {
  if (panelKey) delete _memCache[panelKey];
  else Object.keys(_memCache).forEach(k => delete _memCache[k]);
  // مسح كاش API أيضاً للتأكد من جلب أحدث البيانات من D1
  if (typeof apiInvalidateCache === "function") apiInvalidateCache(panelKey);
}

// ── تحميل بيانات من D1 (مع fallback إلى localStorage) ──────────
async function loadPanelD1(panelKey) {
  // إذا كان هناك cache في الذاكرة استخدمه
  const cached = _getCached(panelKey);
  if (cached) return cached;

  try {
    const data = await apiList(panelKey);
    // إذا أعاد D1 مصفوفة فارغة لكن localStorage يحتوي بيانات → استخدم localStorage
    // (حالة البيانات التجريبية المحلية التي لم تُرفع لـ D1 بعد)
    if (Array.isArray(data) && data.length === 0) {
      const localData = loadPanelLocal(panelKey);
      if (localData && localData.length > 0) {
        console.info("loadPanelD1: D1 empty for", panelKey, "- using localStorage data (", localData.length, "rows)");
        _setCache(panelKey, localData);
        return localData;
      }
    }
    _setCache(panelKey, data);
    return data;
  } catch (e) {
    console.warn("D1 load failed for", panelKey, "- falling back to localStorage:", e);
    return loadPanelLocal(panelKey);
  }
}

// ── حفظ سجل في D1 ─────────────────────────────────────────────
async function savePanelRecordD1(panelKey, record) {
  _clearCache(panelKey);
  try {
    if (record.id) {
      await apiUpdate(panelKey, record.id, record);
    } else {
      record.id = crypto.randomUUID();
      await apiCreate(panelKey, record);
    }
    return record;
  } catch (e) {
    console.error("D1 save failed:", e);
    throw e;
  }
}

// ── حذف سجل من D1 ─────────────────────────────────────────────
async function deletePanelRecordD1(panelKey, id) {
  _clearCache(panelKey);
  try {
    await apiDelete(panelKey, id);
  } catch (e) {
    console.error("D1 delete failed:", e);
    throw e;
  }
}

// ─────────────────────────────────────────────────────────────────
// الدوال الموروثة (متوافقة مع الكود القديم)
// تستخدم D1 عبر apiList/apiCreate/apiUpdate/apiDelete
// ─────────────────────────────────────────────────────────────────

function loadPanelLocal(panelKey) {
  try {
    const raw = localStorage.getItem(storageKey(panelKey));
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch { return []; }
}

function savePanelLocal(panelKey, rows) {
  // نحفظ في localStorage كـ cache محلي مؤقت فقط
  localStorage.setItem(storageKey(panelKey), JSON.stringify(rows || []));
  // وننشر إلى D1 بشكل غير متزامن
  _syncToD1(panelKey, rows);
}

// ── مزامنة بيانات مع D1 بشكل كامل ───────────────────────────────
async function _syncToD1(panelKey, rows) {
  // اللوحات التي تُدار بشكل خاص (car_billing يُحدَّث سجلاً سجلاً في crud.js)
  const skipPanels = ['car_billing', 'car_movements', 'car_payment_cashbox'];
  if (skipPanels.includes(panelKey)) return;

  _clearCache(panelKey);
  try {
    // جلب السجلات الموجودة في D1
    const existing = await apiList(panelKey);
    const existingIds = new Set(existing.map(r => r.id));

    // إنشاء/تحديث كل سجل
    for (const row of (rows || [])) {
      if (!row.id) row.id = crypto.randomUUID();
      if (existingIds.has(row.id)) {
        await apiUpdate(panelKey, row.id, row);
      } else {
        await apiCreate(panelKey, row);
      }
    }

    // حذف السجلات التي اختفت من القائمة
    const newIds = new Set((rows || []).map(r => r.id).filter(Boolean));
    for (const r of existing) {
      if (!newIds.has(r.id)) {
        await apiDelete(panelKey, r.id);
      }
    }

    _clearCache(panelKey);
  } catch (e) {
    console.warn("_syncToD1 failed for", panelKey, e);
  }
}
function ensureMetaLocal(panelKey, rows) {
  let changed = false;
  let maxSeq = 0;
  for (const r of rows) {
    const n = Number(r.seq);
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  }
  let next = maxSeq + 1;
  for (const r of rows) {
    if (!r.seq) { r.seq = next++; changed = true; }
    if (!r.code) { r.code = genShortCode(panelKey, r.seq); changed = true; }
  }
  return changed;
}

function nextSeqForPanel(panelKey) {
  const rows = loadPanelLocal(panelKey);
  let maxSeq = 0;
  for (const r of rows) {
    const n = Number(r.seq);
    if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
  }
  return maxSeq + 1;
}

// ── getPanelRows: الدالة الرئيسية لجلب بيانات أي لوحة ───────────
async function getPanelRows(panelKey) {

  // ── لوحة احتساب أجرة السيارات ──────────────────────────────
  if (panelKey === "car_billing") {
    const movements = await loadPanelD1("car_movements");
    const billings  = await loadPanelD1("car_billing");

    // ── تحديث localStorage بالبيانات الحديثة من D1 لضمان تزامن computed() ──
    try { localStorage.setItem(storageKey("car_movements"), JSON.stringify(movements)); } catch(e) {}
    try { localStorage.setItem(storageKey("car_billing"),   JSON.stringify(billings));  } catch(e) {}
    try {
      const freshCars   = await loadPanelD1("cars");
      const freshRates  = await loadPanelD1("car_rates");
      const freshPayments = await loadPanelD1("car_payment_cashbox");
      localStorage.setItem(storageKey("cars"),                JSON.stringify(freshCars));
      localStorage.setItem(storageKey("car_rates"),           JSON.stringify(freshRates));
      localStorage.setItem(storageKey("car_payment_cashbox"), JSON.stringify(freshPayments));
    } catch(e) {}

    const billingMap = {};
    billings.forEach(b => {
      if (b.movementId) billingMap[b.movementId] = b;
    });

    const merged = movements.map(m => {
      const mvId    = m.id || m._id || "";
      const billing = billingMap[mvId] || {};
      const hasBilling = !!billing.id;

      return Object.assign({}, m, billing, {
        id:          hasBilling ? billing.id : mvId,
        _id:         hasBilling ? (billing._id || billing.id) : mvId,
        seq:         billing.seq  || m.seq,
        code:        billing.code || m.code,
        movementId:  mvId,
        _hasBilling: hasBilling,
        activityDate:    m.activityDate    || "",
        transport:       m.transport       || "",
        driverName:      m.driverName      || "",
        tourismCompany:  m.tourismCompany  || "",
        beneficiary:     m.beneficiary     || "",
        beneficiaryName: m.beneficiaryName || "",
        departurePlace:  m.departurePlace  || "",
        delegation:      m.delegation      || "",
        creditNo:        m.creditNo        || "",
        entrySystem:     m.entrySystem     || "",
        ownership:       m.ownership       || "",
        carNo:           m.carNo           || "",
        movementNo:      m.movementNo      || (m.seq ? "MV-" + String(m.seq).padStart(4,"0") : ""),
      });
    });

    const billingPanel = (typeof PANELS !== "undefined") && PANELS.find(p => p.key === "car_billing");
    if (billingPanel && billingPanel.computed) {
      merged.forEach(r => billingPanel.computed(r));
    }

    merged.forEach(r => {
      const tot = parseFloat(r.total);
      const hasDate = (r.accountingDate || "").trim() !== "";
      r.calcStatus = (r._hasBilling && !isNaN(tot) && tot > 0 && hasDate) ? "محتسب" : "غير محتسب";
    });

    const savedCombined = await loadPanelD1("combined_entries");
    const billingEntryNoMap = {};
    savedCombined.forEach(e => {
      if (!e.entryNo) return;
      if (e._isCustomGroup && e._customBillingIds) {
        e._customBillingIds.split("|").forEach(id => { billingEntryNoMap[id.trim()] = e.entryNo; });
      } else if (e._isSingle) {
        if (e._billingId)  billingEntryNoMap[e._billingId]  = e.entryNo;
        if (e.movementId)  billingEntryNoMap[e.movementId]  = e.entryNo;
      } else if (e._groupKey && !e._isCustomGroup) {
        billingEntryNoMap["__group__" + e._groupKey] = e.entryNo;
      }
    });

    merged.forEach(r => {
      const rid = (r.id || r._id || "").trim();
      if (billingEntryNoMap[rid]) { r.entryNo = billingEntryNoMap[rid]; return; }
      const mid = (r.movementId || "").trim();
      if (mid && billingEntryNoMap[mid]) { r.entryNo = billingEntryNoMap[mid]; return; }
      const gKey = "__group__" + (r.accountingParty || "").trim() + "|||" + (r.beneficiaryName || "").trim();
      if (billingEntryNoMap[gKey]) r.entryNo = billingEntryNoMap[gKey];
    });

    return merged;
  }

  // ── لوحة القيود المستحقة ────────────────────────────────────
  if (panelKey === "combined_entries") {
    const activeFilter = window._combinedEntriesFilter || "جميع القيود";

    const savedEntries = await loadPanelD1("combined_entries");
    const savedMap = {};
    const singleSavedMap = {};
    savedEntries.forEach(e => {
      if (e._groupKey) savedMap[e._groupKey] = e;
      if (e._isSingle && e._billingId) singleSavedMap[e._billingId] = e;
    });

    const todayStr = todayDateStr();
    const billingRows = await getPanelRows("car_billing");

    const singleRows = billingRows.map(r => ({
      id:              "single_" + (r.id || r._id || ""),
      _id:             "single_" + (r.id || r._id || ""),
      _isSingle:       true,
      entryType:       "قيد مفرد",
      code:            r.code || "",
      entryNo:         r.entryNo || "",
      accountingParty: r.accountingParty || r.driverName || "",
      beneficiaryName: r.beneficiaryName || "",
      transport:       r.transport       || "",
      movementNo:      r.movementNo      || "",
      movementNos:     r.movementNo      || "",
      recordCount:     "1",
      totalAmount:     r.total           || "",
      mergedStatement: buildCarBillingStatement(r) || "",
      creditNo2:       r.creditNo2       || r.creditNo || "",
      notes:           r.notes           || "",
      accountingStatus: r.accountingStatus || "",
      _billingId:      r.id || r._id,
      movementId:      r.movementId || "",
      entryCreatedAt:  (singleSavedMap[r.id || r._id] || {}).entryCreatedAt || todayStr
    }));

    const customGroups = savedEntries.filter(e => e._isCustomGroup === true);
    const usedInCustom = new Set();
    customGroups.forEach(cg => {
      if (cg._customBillingIds) {
        cg._customBillingIds.split("|").forEach(id => usedInCustom.add(id.trim()));
      }
    });

    const customGroupRows = customGroups.map(cg => {
      const cgIds = cg._customBillingIds
        ? new Set(cg._customBillingIds.split("|").map(s => s.trim()))
        : new Set();
      const recs = billingRows.filter(r => cgIds.has(r.id || r._id));
      if (recs.length === 0) return null;

      const totalAmt  = recs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
      const mvNos     = recs.map(r => (r.movementNo || "").trim()).filter(Boolean).join(" + ");
      const transport = recs.map(r => (r.transport || "").trim()).filter(Boolean)[0] || "";
      const stmtLines = recs.map(r => (buildCarBillingStatement(r) || "").trim()).filter(Boolean).join("\n─────\n");
      const cgCodes   = recs.map(r => (r.code || "").trim()).filter(Boolean).join(" + ");

      return Object.assign({}, cg, {
        _isSingle:       false,
        entryType:       "قيد مجمع",
        code:            cgCodes,
        entryNo:         cg.entryNo || genEntryNo(),
        movementNos:     mvNos,
        recordCount:     String(recs.length),
        totalAmount:     totalAmt % 1 === 0 ? String(Math.round(totalAmt)) : totalAmt.toFixed(2),
        transport,
        mergedStatement: cg._statementEdited ? (cg.mergedStatement || stmtLines) : stmtLines,
        entryCreatedAt:  cg.entryCreatedAt || todayStr
      });
    }).filter(Boolean);

    const groups = {};
    billingRows.forEach(r => {
      if (usedInCustom.has(r.id || r._id)) return;
      const party      = (r.accountingParty || "").trim();
      const beneficiary = (r.beneficiaryName || "").trim();
      if (!party && !beneficiary) return;
      const key = party + "|||" + beneficiary;
      if (!groups[key]) groups[key] = { _groupKey: key, accountingParty: party, beneficiaryName: beneficiary, records: [] };
      groups[key].records.push(r);
    });

    const newSavedEntries = [...savedEntries];
    let savedChanged = false;

    const groupedRows = Object.values(groups).filter(g => g.records.length >= 2).map(g => {
      const recs        = g.records;
      const totalAmt    = recs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
      const transport   = recs.map(r => (r.transport || "").trim()).filter(Boolean)[0] || "";
      const movementNos = recs.map(r => (r.movementNo || "").trim()).filter(Boolean).join(" + ");
      const stmts       = recs.map(r => (buildCarBillingStatement(r) || "").trim()).filter(s => s.length > 0);
      const mergedAuto  = stmts.join("\n─────\n");
      const saved       = savedMap[g._groupKey] || {};
      const entryNoForGroup = saved.entryNo || genEntryNo();

      if (!saved.entryNo) {
        const idx = newSavedEntries.findIndex(e => e._groupKey === g._groupKey);
        if (idx >= 0) {
          newSavedEntries[idx].entryNo = entryNoForGroup;
        } else {
          newSavedEntries.push({ _groupKey: g._groupKey, entryNo: entryNoForGroup, id: "ce_" + g._groupKey.slice(0,20) + "_" + Date.now() });
        }
        savedChanged = true;
      }

      const groupCodes = recs.map(r => (r.code || "").trim()).filter(Boolean).join(" + ");
      return Object.assign({}, saved, {
        id:              saved.id || ("ce_" + btoa(unescape(encodeURIComponent(g._groupKey))).replace(/[^a-z0-9]/gi,"").slice(0,16)),
        _id:             saved._id || saved.id || ("ce_" + g._groupKey.slice(0,20)),
        _groupKey:       g._groupKey,
        _isSingle:       false,
        entryType:       "قيد مجمع",
        code:            groupCodes,
        entryNo:         entryNoForGroup,
        accountingParty: g.accountingParty,
        beneficiaryName: g.beneficiaryName,
        transport,
        movementNos,
        recordCount:     String(recs.length),
        totalAmount:     totalAmt % 1 === 0 ? String(Math.round(totalAmt)) : totalAmt.toFixed(2),
        mergedStatement: saved._statementEdited ? (saved.mergedStatement || mergedAuto) : mergedAuto,
        creditNo2:       saved.creditNo2 || "",
        notes:           saved.notes     || "",
        entryCreatedAt:  saved.entryCreatedAt || todayStr
      });
    });

    // حفظ entryNos الجديدة في D1
    if (savedChanged) {
      savePanelLocal("combined_entries", newSavedEntries); // يزامن مع D1 تلقائياً
    }

    const allGroupedRows = [...customGroupRows, ...groupedRows];
    if (activeFilter === "القيود المفردة")  return singleRows;
    if (activeFilter === "القيود المجمعة") return allGroupedRows;
    if (activeFilter === "غير المحاسب عليها") {
      return singleRows.filter(r => !r.accountingStatus || r.accountingStatus === "لم يُحاسب" || r.accountingStatus === "");
    }
    if (activeFilter === "المحاسب جزئياً") {
      return singleRows.filter(r => r.accountingStatus === "محاسب جزئي");
    }
    if (activeFilter === "المحاسب عليها بالكامل") {
      return singleRows.filter(r => r.accountingStatus === "محاسب كامل");
    }
    return [...allGroupedRows, ...singleRows];
  }

  // ── لوحة احتساب القوافل ─────────────────────────────────────
  if (panelKey === "convoy_billing") {
    const rows = await loadPanelD1("convoy_billing");
    const convoyPanel = (typeof PANELS !== "undefined") && PANELS.find(p => p.key === "convoy_billing");
    if (convoyPanel && convoyPanel.computed) rows.forEach(r => convoyPanel.computed(r));
    return rows;
  }

  // ── لوحة حركة السيارات ──────────────────────────────────────
  if (panelKey === "car_movements") {
    const rows = await loadPanelD1("car_movements");
    // تحديث localStorage لضمان تزامن computed() مع D1
    try { localStorage.setItem(storageKey("car_movements"), JSON.stringify(rows)); } catch(e) {}
    const mvPanel = (typeof PANELS !== "undefined") && PANELS.find(p => p.key === "car_movements");
    if (mvPanel && mvPanel.computed) rows.forEach(r => mvPanel.computed(r));
    return rows;
  }

  // ── صندوق دفع حركات السيارات ────────────────────────────────
  if (panelKey === "car_payment_cashbox") {
    const billingRows = await getPanelRows("car_billing");
    const savedPayments = await loadPanelD1("car_payment_cashbox");

    // ── بناء خريطة الدفعات: المفتاح الأساسي هو movementId (ثابت دائماً)
    // ثم billingId كاحتياط، ثم id السجل
    const savedMap = {};
    // تجميع كل الدفعات لنفس movementId أو billingId (لأخذ الأحدث فقط)
    const movPayMap = {};
    savedPayments.forEach(p => {
      // استخدم movementId كمفتاح أساسي إذا كان موجوداً وغير فارغ
      const movKey  = (p.movementId  || "").trim();
      const billKey = (p._billingId  || "").trim();
      // المفتاح هو movementId إن وُجد، وإلا billingId
      const mvKey = movKey || billKey;
      if (!mvKey) return;  // تجاهل السجلات بدون مفاتيح
      if (!movPayMap[mvKey]) movPayMap[mvKey] = [];
      movPayMap[mvKey].push(p);
    });
    // لكل مفتاح: احتفظ بالأحدث فقط (sort by updated_at أو id)
    Object.entries(movPayMap).forEach(([mvKey, recs]) => {
      const latest = recs.sort((a,b) => (b.updated_at || b.id || "").localeCompare(a.updated_at || a.id || ""))[0];
      savedMap[mvKey] = latest;
      // أضف أيضاً مفتاح movementId و billingId بشكل منفصل إذا اختلفا
      const movKey  = (latest.movementId  || "").trim();
      const billKey = (latest._billingId  || "").trim();
      if (movKey  && !savedMap[movKey])  savedMap[movKey]  = latest;
      if (billKey && !savedMap[billKey]) savedMap[billKey] = latest;
    });

    // ── بناء خريطة entryNo من لوحة القيود المستحقة ──────────────
    // لكل billing record نحدد entryNo الخاص به من القيود المستحقة
    const savedCombined = await loadPanelD1("combined_entries");
    const billingEntryMap = {};
    savedCombined.forEach(e => {
      if (!e.entryNo) return;
      // قيود مجمعة مخصصة
      if (e._customBillingIds) {
        e._customBillingIds.split("|").forEach(id => { billingEntryMap[id.trim()] = e.entryNo; });
      }
      // قيود مفردة أو مجمعة عبر _billingId
      if (e._billingId) billingEntryMap[e._billingId] = e.entryNo;
      if (e.movementId) billingEntryMap[e.movementId] = e.entryNo;
      // قيود مجمعة تلقائية عبر _groupKey
      if (e._groupKey) billingEntryMap["__group__" + e._groupKey] = e.entryNo;
    });

    const paymentRows = [];
    billingRows.forEach((r, idx) => {
      const billingId = r.id || r._id || "";
      // البحث أولاً بـ movementId (الأكثر ثباتاً)، ثم بـ billingId
      const saved = savedMap[r.movementId] || savedMap[billingId] || {};

      // ── هل يوجد سجل دفع حقيقي (paidAmount > 0)؟ ───────────────
      // السجل يُعتبر "مدفوعاً" فقط إذا كان paidAmount أو totalPaidAfter > 0
      const hasSavedPayment = Object.keys(saved).length > 0 && 
        (parseFloat(saved.paidAmount) > 0 || parseFloat(saved.totalPaidAfter) > 0);

      // ── المبالغ: المصدر الأساسي للإجمالي دائماً من car_billing (الأحدث والأدق) ─
      const total = parseFloat(r.total) || parseFloat(saved.totalAmount) || 0;

      // المدفوع الإجمالي: من حقل totalPaidAfter المحفوظ (الأكثر دقة) أو من paidAmount
      const totalPaidAfter = hasSavedPayment
        ? (parseFloat(saved.totalPaidAfter) || parseFloat(saved.paidAmount) || 0)
        : 0;

      // المدفوع الحالي (آخر دفعة): paidAmount في السجل المحفوظ (فقط إذا كان سجل دفع حقيقي)
      const currentPaid = hasSavedPayment ? (parseFloat(saved.paidAmount) || 0) : 0;

      // المدفوع سابقاً = من السجل المحفوظ
      const paidAmountBefore = hasSavedPayment ? (parseFloat(saved.paidAmountBefore) || 0) : 0;

      // المتبقي = الإجمالي - الإجمالي المدفوع
      const remainingAfter = Math.max(0, total - totalPaidAfter);

      // حالة التحاسب: من السجل المحفوظ (أكثر دقة)، مع إعادة الحساب إذا لزم
      let status = (hasSavedPayment && saved.accountingStatus) ? saved.accountingStatus : "";
      if (!status) {
        if (total <= 0) status = "";
        else if (totalPaidAfter <= 0) status = "لم يُحاسب";
        else if (remainingAfter <= 0) status = "محاسب كامل";
        else status = "محاسب جزئي";
      }

      const seq = saved.seq || (idx + 1);

      // ── استخراج رقم القيد تلقائياً من entryNo ───────────────────
      const autoEntryNo = r.entryNo
        || billingEntryMap[billingId]
        || billingEntryMap[r.movementId]
        || "";
      const referenceNo = saved.referenceNo || autoEntryNo;

      // ── قيمة paidAmount المعروضة في النموذج ─────────────────────
      // إذا لم يوجد سجل دفع حقيقي: اقترح المبلغ الكامل المستحق
      // إذا كان هناك سجل حقيقي: استخدم المبلغ المحفوظ فعلاً
      const displayPaidAmount = hasSavedPayment
        ? String(Math.round(currentPaid))
        : (total > 0 ? String(Math.round(total)) : "0");

      paymentRows.push({
        id:              "pay_" + billingId,
        _id:             "pay_" + billingId,
        seq,
        code:            saved.code || ("PAY-" + String(seq).padStart(4, "0")),
        _billingId:      billingId,
        movementId:      r.movementId || "",
        payDate:         (hasSavedPayment && saved.payDate) ? saved.payDate : "",
        // إذا لم تُسجَّل دفعة حقيقية بعد: افتراضي "دفعة كاملة"
        paymentType:     (hasSavedPayment && saved.paymentType) ? saved.paymentType : "دفعة كاملة",
        paidBy:          (hasSavedPayment && saved.paidBy) ? saved.paidBy : "",
        referenceNo,
        movementNo:      r.movementNo          || "",
        activityDate:    r.activityDate        || "",
        accountingParty: r.accountingParty     || r.driverName || "",
        beneficiaryName: r.beneficiaryName     || "",
        transport:       r.transport           || "",
        driverName:      r.driverName          || "",
        totalAmount:     total > 0 ? String(Math.round(total)) : "",
        paidAmountBefore: paidAmountBefore > 0 ? String(Math.round(paidAmountBefore)) : "0",
        paidAmount:      displayPaidAmount,
        totalPaidAfter:  totalPaidAfter > 0 ? String(Math.round(totalPaidAfter)) : "0",
        remainingAmount: String(Math.round(remainingAfter)),
        accountingStatus: status,
        periodFromDate:  (hasSavedPayment && saved.periodFromDate) ? saved.periodFromDate : "",
        periodToDate:    (hasSavedPayment && saved.periodToDate)   ? saved.periodToDate   : "",
        creditNo2:       saved.creditNo2       || r.creditNo2 || "",
        statement:       (hasSavedPayment && saved.statement) ? saved.statement : "",
        notes:           saved.notes           || "",
        _statementManual: !!(hasSavedPayment && saved._statementManual),
        // حفظ مفتاح البحث للاستخدام في crud.js
        _savedPayId:     hasSavedPayment ? (saved.id || "") : ""
      });
    });

    const payFilter = window._paymentCashboxFilter || "الكل";
    paymentRows.sort((a, b) => {
      const da = a.payDate || a.activityDate || "";
      const db = b.payDate || b.activityDate || "";
      return db.localeCompare(da);
    });

    if (payFilter === "المدفوعة بالكامل")  return paymentRows.filter(r => r.accountingStatus === "محاسب كامل");
    if (payFilter === "المدفوعة جزئياً")   return paymentRows.filter(r => r.accountingStatus === "محاسب جزئي");
    if (payFilter === "غير المدفوعة")       return paymentRows.filter(r => !r.accountingStatus || r.accountingStatus === "لم يُحاسب" || r.accountingStatus === "");
    if (payFilter === "بها مبلغ مدفوع")    return paymentRows.filter(r => r.accountingStatus === "محاسب كامل" || r.accountingStatus === "محاسب جزئي");
    return paymentRows;
  }

  // ── باقي اللوحات: جلب من D1 مباشرة ─────────────────────────
  return loadPanelD1(panelKey);
}
