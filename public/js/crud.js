// // =====================================================
// // CRUD Operations
// // =====================================================

// $("btnNew").onclick = async () => {
//   window.selectedId = null;
//   if (window.activeKey === "convoys") window.__convoy_trucks = [];
//   setStatus("تم تفريغ النموذج ✅");
//   await renderAll();
// };

// $("btnSave").onclick = async () => {
//   const panel = currentPanel();
//   const rec = getCurrentFormRec(panel);
//   const err = validate(panel, rec);
//   if (err) {
//     alert(err);
//     return;
//   }

//   try {
//     const isDb = !!DB_PANEL_MAP[panel.key];

//     if (isDb) {
//       if (window.selectedId) {
//         const rows = await getPanelRows(panel.key);
//         const cur = rows.find(x => x.id === window.selectedId);
//         const pkVal = cur?.__pkVal;
//         if (!pkVal) throw new Error("لم أجد PK للسجل");
//         await apiUpdate(panel.key, pkVal, rec);
//       } else {
//         await apiCreate(panel.key, rec);
//       }
//       invalidateCache(panel.key);
//       setStatus("تم الحفظ في قاعدة البيانات ✅");

//       window.selectedId = null;
//       if (panel.key === "convoys") window.__convoy_trucks = [];
//       await renderAll();
//       return;
//     }

//     // Local storage
//     let rows = loadPanelLocal(panel.key);
//     if (window.selectedId) {
//       const idx = rows.findIndex(x => x.id === window.selectedId);
//       if (idx >= 0) rows[idx] = { ...rows[idx], ...rec, id: window.selectedId };
//     } else {
//       rec.id = uid();
//       rows.unshift(rec);
//       window.selectedId = rec.id;
//     }
//     savePanelLocal(panel.key, rows);
//     setStatus("تم الحفظ محليًا ✅");
//     await renderAll();

//   } catch (e) {
//     alert("خطأ: " + e.message);
//   }
// };

// $("btnDelete").onclick = async () => {
//   const panel = currentPanel();
//   if (!window.selectedId) {
//     alert("اختر صفًا أولاً.");
//     return;
//   }
//   if (!confirm("هل أنت متأكد من الحذف؟")) return;

//   try {
//     const isDb = !!DB_PANEL_MAP[panel.key];
//     if (isDb) {
//       const rows = await getPanelRows(panel.key);
//       const cur = rows.find(x => x.id === window.selectedId);
//       const pkVal = cur?.__pkVal;
//       if (!pkVal) throw new Error("لم أجد PK للسجل");
//       await apiDelete(panel.key, pkVal);
//       invalidateCache(panel.key);
//       window.selectedId = null;
//       setStatus("تم الحذف من قاعدة البيانات ✅");
//       await renderAll();
//       return;
//     }

//     // Local storage
//     let rows = loadPanelLocal(panel.key);
//     rows = rows.filter(x => x.id !== window.selectedId);
//     savePanelLocal(panel.key, rows);
//     window.selectedId = null;
//     setStatus("تم الحذف محليًا ✅");
//     await renderAll();

//   } catch (e) {
//     alert("خطأ: " + e.message);
//   }
// };

// $("btnClearSelect").onclick = async () => {
//   window.selectedId = null;
//   if (window.activeKey === "convoys") window.__convoy_trucks = [];
//   setStatus("تم إلغاء التحديد ✅");
//   await renderAll();
// };



// =====================================================
// CRUD Operations (LOCAL ONLY)
// =====================================================

// مساعد: تاريخ اليوم بصيغة YYYY-MM-DD
function todayDateStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

$("btnNew").onclick = async () => {
  // تحقق من صلاحية الإضافة
  const _u = window._authUser;
  if (_u && _u.can_add === 0) {
    showToast("⛔ ليس لديك صلاحية إضافة بيانات", "error");
    return;
  }
  window.selectedId = null;
  if (window.activeKey === "convoys") window.__convoy_trucks = [];
  setStatus("تم تفريغ النموذج ✅");
  showToast("تم تفريغ النموذج بنجاح", "success");
  await renderAll();
};

$("btnSave").onclick = async () => {
  const panel = currentPanel();
  const rec = getCurrentFormRec(panel);
  const err = validate(panel, rec);
  const isEdit = !!window.selectedId;

  // تحقق من صلاحية الإضافة أو التعديل
  const _uSave = window._authUser;
  if (isEdit && _uSave && _uSave.can_edit === 0) {
    showToast("⛔ ليس لديك صلاحية تعديل البيانات", "error");
    return;
  }
  if (!isEdit && _uSave && _uSave.can_add === 0) {
    showToast("⛔ ليس لديك صلاحية إضافة بيانات", "error");
    return;
  }

  if (err) {
    showToast(err, "error");
    return;
  }

  try {
    // ── لوحة احتساب أجرة السيارات: تحقق إضافي — تاريخ الدفع إجباري عند التحاسب ──
    if (panel.key === "car_billing") {
      const status = (rec.accountingStatus || "").trim();
      const payD   = (rec.payDate || "").trim();
      if ((status === "محاسب كامل" || status === "محاسب جزئي") && !payD) {
        // تمييز الحقل بصرياً
        const payDateEl = document.getElementById("f_payDate");
        if (payDateEl) {
          payDateEl.style.border = "2px solid #ef4444";
          payDateEl.focus();
          setTimeout(() => { payDateEl.style.border = ""; }, 3000);
        }
        showToast("⚠️ تاريخ الدفع إجباري عند اختيار «" + status + "»", "error", 4000);
        setStatus("⚠️ أدخل تاريخ الدفع أولاً");
        return;
      }

      // ── يوم الاحتساب إجباري إذا كان هناك بيانات احتساب (أجرة أو إجمالي) ──
      const hasBillingData = parseFloat(rec.fare || 0) > 0
                          || parseFloat(rec.subtotal || 0) > 0
                          || parseFloat(rec.total || 0) > 0
                          || parseFloat(rec.extraAmount || 0) > 0;
      const accDate  = (rec.accountingDate || "").trim();
      if (hasBillingData && !accDate) {
        const accDateEl = document.getElementById("f_accountingDate");
        if (accDateEl) {
          accDateEl.style.border = "2px solid #ef4444";
          accDateEl.focus();
          setTimeout(() => { accDateEl.style.border = ""; }, 3000);
        }
        showToast("⚠️ يوم الاحتساب إجباري عند إدخال بيانات الاحتساب", "error", 4000);
        setStatus("⚠️ أدخل يوم الاحتساب أولاً");
        return;
      }
    }

    // ── لوحة احتساب أجرة السيارات: حفظ مستقل بمعرّف حركة السيارة ──
    if (panel.key === "car_billing") {
      const billings = loadPanelLocal("car_billing");
      const movId = window._billingMovementId || rec.movementId || rec.id;

      // جلب بيانات الحركة لإضافتها إلى rec (entrySystem, transport …)
      if (movId) {
        const movements = loadPanelLocal("car_movements");
        const mvRec = movements.find(m => (m.id || m._id) === movId);
        if (mvRec) {
          // نسخ الحقول المطلوبة من الحركة إلى rec
          ["entrySystem","transport","driverName","tourismCompany",
           "beneficiary","beneficiaryName","departurePlace","delegation","creditNo"
          ].forEach(k => { if (mvRec[k] && !rec[k]) rec[k] = mvRec[k]; });
        }
      }

      // تشغيل computed() على rec لحساب الأعداد والأسعار والإجماليات تلقائياً
      if (panel.computed) {
        panel.computed(rec);
      }

      // ابحث عن سجل تحاسب مرتبط بهذه الحركة
      const existIdx = billings.findIndex(b => b.movementId === movId);

      // بنود التحاسب المراد حفظها (تشمل الأعداد والأسعار المحسوبة)
      const billingFields = [
        "accountingDate",
        // أعداد الدوام (محسوبة تلقائياً من entrySystem)
        "fullDaysCount","halfDaysCount","quickMissionsCount",
        "partialNearCount","partialNearDesc",
        "partialFarCount","partialFarDesc",
        "extraCount",
        // أسعار الدوام (من الثوابت)
        "fullDayFare","halfDayFare","quickMissionFare",
        "partialNearFare","partialFarFare","extraFare",
        // إجماليات
        "busCount","fare","subtotal",
        // تعديلات المبلغ
        "extraAmount","extraAmountNote","discountAmount","discountNote","total",
        // تحاسب
        "accountingStatus","paidAmount","payDate",
        // فترة
        "periodFromDate","periodFromDay","periodToDate","periodToDay",
        // قيد
        "statement","amount","creditNo2","notes"
      ];
      const billingRec = { movementId: movId };
      billingFields.forEach(k => { if (rec[k] !== undefined) billingRec[k] = rec[k]; });

      if (existIdx >= 0) {
        // تحديث سجل موجود
        billingRec.id    = billings[existIdx].id;
        billingRec._id   = billings[existIdx]._id || billings[existIdx].id;
        billingRec._seq  = billings[existIdx]._seq;
        billingRec.entryNo = billings[existIdx].entryNo || (typeof genEntryNo === "function" ? genEntryNo() : "ENT-" + Math.floor(1000 + Math.random() * 9000));
        billings[existIdx] = { ...billings[existIdx], ...billingRec };
        window.selectedId = billingRec.id;
        // حفظ في D1
        try { await apiUpdate("car_billing", billingRec.id, billings[existIdx]); _clearCache("car_billing"); } catch(e) { console.warn("D1 update car_billing:", e); }
      } else {
        // إنشاء سجل جديد
        billingRec.id      = uid();
        billingRec._id     = billingRec.id;
        billingRec.entryNo = typeof genEntryNo === "function" ? genEntryNo() : "ENT-" + Math.floor(1000 + Math.random() * 9000);
        billings.unshift(billingRec);
        window.selectedId = billingRec.id;
        // حفظ في D1
        try { await apiCreate("car_billing", billingRec); _clearCache("car_billing"); } catch(e) { console.warn("D1 create car_billing:", e); }
      }

      savePanelLocal("car_billing", billings);
      setStatus(isEdit ? "تم حفظ التحاسب ✅" : "تم إضافة التحاسب ✅");
      showToast(isEdit ? "✅ تم حفظ التحاسب بنجاح!" : "💾 تم إضافة التحاسب بنجاح!", "success", 3500);
      window.selectedId = null;
      window._billingMovementId = null;
      await renderAll();
      return;
    }

    // ── لوحة القيود: حفظ الحقول اليدوية (mergedStatement/notes/creditNo2) ──
    if (panel.key === "combined_entries") {
      // ── التحقق من حالة الاحتساب: لا يُسمح بحفظ قيد لحركة غير محتسبة ──
      if (rec._isSingle) {
        const billings = await getPanelRows("car_billing");
        const linkedBilling = billings.find(b =>
          (b.movementNo || "").trim() === (rec.movementNo || "").trim() ||
          (b.id || b._id) === rec._billingId
        );
        if (!linkedBilling || linkedBilling.calcStatus === "غير محتسب") {
          showToast("⛔ لا يمكن إنشاء قيد لهذه الحركة لأنها غير محتسبة بعد", "error", 5000);
          setStatus("⛔ الحركة غير محتسبة — أضف الاحتساب أولاً");
          return;
        }
      }
      const savedEntries = loadPanelLocal("combined_entries");
      const groupKey = rec._groupKey || window.selectedId;
      const saveRec = {
        id:               rec.id || window.selectedId,
        _id:              rec._id || window.selectedId,
        _groupKey:        groupKey,
        mergedStatement:  rec.mergedStatement || "",
        _statementEdited: true,   // علامة: المستخدم عدّل القيد يدوياً
        creditNo2:        rec.creditNo2 || "",
        notes:            rec.notes || ""
      };
      const idx = savedEntries.findIndex(e => e._groupKey === groupKey || e.id === saveRec.id);
      if (idx >= 0) {
        // الاحتفاظ بـ entryNo المخزّن مسبقاً
        if (savedEntries[idx].entryNo) saveRec.entryNo = savedEntries[idx].entryNo;
        // الاحتفاظ بـ entryCreatedAt المخزّن مسبقاً
        saveRec.entryCreatedAt = savedEntries[idx].entryCreatedAt || todayDateStr();
        savedEntries[idx] = { ...savedEntries[idx], ...saveRec };
      } else {
        // إنشاء entryNo وتاريخ الإنشاء جديد عند الحفظ لأول مرة
        saveRec.entryNo = typeof genEntryNo === "function" ? genEntryNo() : "ENT-" + Math.floor(1000 + Math.random() * 9000);
        saveRec.entryCreatedAt = todayDateStr();
        savedEntries.unshift(saveRec);
      }
      savePanelLocal("combined_entries", savedEntries);
      setStatus("تم حفظ القيد ✅");
      showToast("✅ تم حفظ القيد بنجاح!", "success", 3500);
      window.selectedId = null;
      await renderAll();
      return;
    }

    // ── حفظ جميع اللوحات مباشرة في D1 ──
    if (isEdit) {
      rec.id = window.selectedId;
      try {
        await apiUpdate(panel.key, window.selectedId, rec);
        _clearCache(panel.key);
      } catch(e) {
        console.warn("D1 update failed:", e);
        showToast("⚠️ فشل الحفظ في قاعدة البيانات: " + e.message, "error");
        return;
      }
    } else {
      rec.id = uid();
      try {
        await apiCreate(panel.key, rec);
        _clearCache(panel.key);
      } catch(e) {
        console.warn("D1 create failed:", e);
        showToast("⚠️ فشل الحفظ في قاعدة البيانات: " + e.message, "error");
        return;
      }
      window.selectedId = rec.id;
    }

    // تحديث localStorage كـ cache
    const rows = loadPanelLocal(panel.key);
    if (isEdit) {
      const idx = rows.findIndex(x => x.id === window.selectedId || x._id === window.selectedId);
      if (idx >= 0) rows[idx] = { ...rows[idx], ...rec, id: window.selectedId };
      else rows.unshift(rec);
    } else {
      rows.unshift(rec);
    }
    localStorage.setItem("db_" + panel.key, JSON.stringify(rows));

    if (isEdit) {
      setStatus("تم حفظ التعديل في قاعدة البيانات ✅");
      showToast("✅ تم حفظ التعديل بنجاح!", "success", 3500);
    } else {
      setStatus("تم الحفظ في قاعدة البيانات ✅");
      showToast("💾 تم إضافة السجل بنجاح!", "success");
    }

    // تفريغ النموذج بعد الحفظ لإدخال سجل جديد
    window.selectedId = null;
    if (panel.key === "convoys") window.__convoy_trucks = [];
    await renderAll();

  } catch (e) {
    showToast("خطأ: " + e.message, "error");
  }
};

$("btnDelete").onclick = async () => {
  // تحقق من صلاحية الحذف قبل أي شيء
  const _uDel = window._authUser;
  if (_uDel && _uDel.can_delete === 0) {
    showToast("⛔ ليس لديك صلاحية حذف البيانات", "error");
    return;
  }

  const panel = currentPanel();

  // جمع كل الـ IDs المراد حذفها من selectedRecords أو selectedId
  const idsToDelete = new Set();
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    window.selectedRecords.forEach(id => idsToDelete.add(id));
  } else if (window.selectedId) {
    idsToDelete.add(window.selectedId);
  }

  if (idsToDelete.size === 0) {
    showToast("اختر صفًا أولاً للحذف", "warning");
    return;
  }

  const countMsg = idsToDelete.size > 1 ? `${idsToDelete.size} سجلات` : "هذا السجل";
  if (!confirm(`هل أنت متأكد من حذف ${countMsg}؟ لن يمكن التراجع عن هذا الإجراء.`)) return;

  try {
    // ── لوحة احتساب أجرة السيارات: حذف بيانات التحاسب فقط (لا تحذف الحركة) ──
    if (panel.key === "car_billing") {
      let billings = loadPanelLocal("car_billing");
      const before = billings.length;
      billings = billings.filter(b =>
        !idsToDelete.has(b.id) && !idsToDelete.has(b._id) && !idsToDelete.has(b.movementId)
      );
      if (billings.length < before) {
        savePanelLocal("car_billing", billings);
        showToast(`تم حذف ${before - billings.length} سجل(ات) تحاسب بنجاح 🗑️`, "success");
      } else {
        showToast("لا توجد بيانات تحاسب لهذه الحركات", "warning");
      }
      window.selectedId = null;
      window._billingMovementId = null;
      window.selectedRecords && window.selectedRecords.clear();
      setStatus("تم حذف التحاسب ✅");
      await renderAll();
      return;
    }

    // ── لوحة القيود المستحقة: منطق حذف خاص ──
    if (panel.key === "combined_entries") {
      // جلب جميع الصفوف المعروضة (تشمل المفردة والمجمعة)
      const allDisplayed = await getPanelRows("combined_entries");
      const toDelete = allDisplayed.filter(e =>
        idsToDelete.has(e.id) || idsToDelete.has(e._id)
      );

      if (toDelete.length === 0) {
        showToast("لم يُعثر على السجلات المحددة", "warning");
        return;
      }

      let savedEntries = loadPanelLocal("combined_entries");
      let billings     = loadPanelLocal("car_billing");
      let deletedCount = 0;

      toDelete.forEach(entry => {
        if (entry._isSingle) {
          // ── قيد مفرد: احذف من savedEntries + امسح entryNo من car_billing ──
          const billingId = entry._billingId || entry.id.replace(/^single_/, "");
          const before = savedEntries.length;
          savedEntries = savedEntries.filter(e =>
            !(e._groupKey === ("single_" + billingId) || e.id === ("single_" + billingId) || e._id === ("single_" + billingId))
          );
          deletedCount++;
          // امسح entryNo من car_billing
          billings.forEach(b => {
            if (b.id === billingId || b._id === billingId || b.movementId === entry.movementId) {
              b.entryNo = "";
            }
          });

        } else if (entry._isCustomGroup) {
          // ── قيد مجمع مخصص: احذف من savedEntries + امسح entryNo ──
          const before = savedEntries.length;
          savedEntries = savedEntries.filter(e =>
            !(e._customGroupKey === entry._customGroupKey ||
              e._customGroupKey === entry._groupKey ||
              e.id === entry.id || e._id === entry._id)
          );
          deletedCount++;
          // امسح entryNo من جميع السجلات المدرجة
          if (entry._customBillingIds) {
            const ids = new Set(entry._customBillingIds.split("|").map(s => s.trim()));
            billings.forEach(b => {
              if (ids.has(b.id) || ids.has(b._id)) b.entryNo = "";
            });
          }

        } else {
          // ── قيد مجمع تلقائي: احذف من savedEntries + امسح entryNo ──
          savedEntries = savedEntries.filter(e =>
            !(e._groupKey === entry._groupKey || e.id === entry.id || e._id === entry._id)
          );
          deletedCount++;
          // امسح entryNo من السجلات بنفس جهة التحاسب + جهة الاستفادة
          const [party, beneficiary] = (entry._groupKey || "").split("|||");
          billings.forEach(b => {
            if (
              (b.accountingParty || "").trim() === (party || "").trim() &&
              (b.beneficiaryName  || "").trim() === (beneficiary || "").trim()
            ) {
              b.entryNo = "";
            }
          });
        }
      });

      savePanelLocal("combined_entries", savedEntries);
      savePanelLocal("car_billing", billings);

      window.selectedId = null;
      window.selectedRecords && window.selectedRecords.clear();
      setStatus("تم حذف القيد ✅");
      showToast(`تم حذف ${deletedCount} قيد(ات) بنجاح 🗑️`, "success");
      await renderAll();
      return;
    }

    // حذف من D1 مباشرة
    const allRows = await loadPanelD1(panel.key);
    const deletedIds = allRows.filter(x => idsToDelete.has(x.id) || idsToDelete.has(x._id)).map(x => x.id).filter(Boolean);
    const before = allRows.length;

    let d1Errors = 0;
    for (const did of deletedIds) {
      try {
        await apiDelete(panel.key, did);
      } catch(e) {
        console.warn("D1 delete failed for", did, e);
        d1Errors++;
      }
    }
    _clearCache(panel.key);

    // تحديث localStorage كـ cache
    const remainingRows = allRows.filter(x => !idsToDelete.has(x.id) && !idsToDelete.has(x._id));
    localStorage.setItem("db_" + panel.key, JSON.stringify(remainingRows));

    window.selectedId = null;
    window.selectedRecords && window.selectedRecords.clear();
    if (window.activeKey === "convoys") window.__convoy_trucks = [];
    setStatus("تم الحذف من قاعدة البيانات ✅");
    showToast(`تم حذف ${deletedIds.length} سجل(ات) بنجاح 🗑️`, "success");
    await renderAll();

  } catch (e) {
    showToast("خطأ: " + e.message, "error");
  }
};

// =====================================================
// تفكيك القيد — إرجاع السجلات إلى لوحة احتساب أجرة السيارات
// =====================================================
$("btnDismantleEntry").onclick = async () => {
  const panel = currentPanel();
  if (panel.key !== "combined_entries") return;

  // جمع IDs المحددة
  const idsToDismantle = new Set();
  if (window.selectedRecords && window.selectedRecords.size > 0) {
    window.selectedRecords.forEach(id => idsToDismantle.add(id));
  } else if (window.selectedId) {
    idsToDismantle.add(window.selectedId);
  }

  if (idsToDismantle.size === 0) {
    showToast("اختر قيداً أولاً للتفكيك", "warning");
    return;
  }

  try {
    // جلب الصفوف المعروضة لمعرفة تفاصيل كل قيد
    const allDisplayed = await getPanelRows("combined_entries");
    const toDismantle  = allDisplayed.filter(e =>
      idsToDismantle.has(e.id) || idsToDismantle.has(e._id)
    );

    if (toDismantle.length === 0) {
      showToast("لم يُعثر على القيود المحددة", "warning");
      return;
    }

    // ── بناء رسالة التأكيد مع تفاصيل كل قيد ──
    const detailLines = toDismantle.map(e => {
      const type  = e.entryType  || "قيد";
      const entNo = e.entryNo    || "—";
      const party = e.accountingParty || "—";
      const mvNos = e.movementNos || e.movementNo || "—";
      return `• ${type} | رقم القيد: ${entNo} | جهة التحاسب: ${party} | الحركة/الحركات: ${mvNos}`;
    }).join("\n");

    const confirmMsg =
      `⚠️ هل تريد تفكيك ${toDismantle.length === 1 ? "هذا القيد" : `هذه القيود (${toDismantle.length})`}؟\n\n` +
      `${detailLines}\n\n` +
      `سيتم إلغاء ربط السجلات وإرجاعها إلى لوحة احتساب أجرة السيارات.\n` +
      `لا يمكن التراجع عن هذا الإجراء.`;

    if (!confirm(confirmMsg)) return;

    let savedEntries = loadPanelLocal("combined_entries");
    let billings     = loadPanelLocal("car_billing");
    let dismantledCount = 0;

    toDismantle.forEach(entry => {
      if (entry._isSingle) {
        // ── قيد مفرد: احذف من savedEntries + امسح entryNo من car_billing ──
        const billingId = entry._billingId || entry.id.replace(/^single_/, "");
        savedEntries = savedEntries.filter(e =>
          !(e._groupKey === ("single_" + billingId) ||
            e.id === ("single_" + billingId) ||
            e._id === ("single_" + billingId))
        );
        billings.forEach(b => {
          if (b.id === billingId || b._id === billingId || b.movementId === entry.movementId) {
            b.entryNo = "";
          }
        });

      } else if (entry._isCustomGroup) {
        // ── قيد مجمع مخصص: احذف من savedEntries + امسح entryNo من جميع السجلات ──
        savedEntries = savedEntries.filter(e =>
          !(e._customGroupKey === entry._customGroupKey ||
            e._customGroupKey === entry._groupKey ||
            e.id === entry.id || e._id === entry._id)
        );
        if (entry._customBillingIds) {
          const ids = new Set(entry._customBillingIds.split("|").map(s => s.trim()));
          billings.forEach(b => {
            if (ids.has(b.id) || ids.has(b._id)) b.entryNo = "";
          });
        }

      } else {
        // ── قيد مجمع تلقائي: احذف من savedEntries + امسح entryNo بنفس جهة التحاسب ──
        savedEntries = savedEntries.filter(e =>
          !(e._groupKey === entry._groupKey || e.id === entry.id || e._id === entry._id)
        );
        const [party, beneficiary] = (entry._groupKey || "").split("|||");
        billings.forEach(b => {
          if (
            (b.accountingParty || "").trim() === (party       || "").trim() &&
            (b.beneficiaryName  || "").trim() === (beneficiary || "").trim()
          ) {
            b.entryNo = "";
          }
        });
      }

      dismantledCount++;
    });

    savePanelLocal("combined_entries", savedEntries);
    savePanelLocal("car_billing", billings);

    window.selectedId = null;
    window.selectedRecords && window.selectedRecords.clear();
    setStatus("تم تفكيك القيد ✅");
    showToast(
      `✅ تم تفكيك ${dismantledCount} قيد(ات) بنجاح — السجلات أُعيدت إلى لوحة الاحتساب`,
      "success", 5000
    );
    await renderAll();

  } catch (e) {
    showToast("خطأ أثناء تفكيك القيد: " + e.message, "error");
    console.error("btnDismantleEntry:", e);
  }
};

$("btnClearSelect").onclick = async () => {
  window.selectedId = null;
  window.selectedRecords && window.selectedRecords.clear();
  if (window.activeKey === "convoys") window.__convoy_trucks = [];
  // إزالة تلوين جميع الصفوف المحددة
  document.querySelectorAll("tr.row-selected").forEach(tr => tr.classList.remove("row-selected"));
  document.querySelectorAll(".row-checkbox").forEach(cb => cb.checked = false);
  const selectAll = document.getElementById("selectAllCheckbox");
  if (selectAll) selectAll.checked = false;
  setStatus("تم إلغاء التحديد ✅");
  showToast("تم إلغاء التحديد", "success");
  await renderAll();
};

// ربط زر إلغاء التحديد المصغّر بنفس الوظيفة
document.addEventListener("DOMContentLoaded", () => {
  const miniClear = document.getElementById("btnClearSelectMini");
  if (miniClear) miniClear.onclick = () => $("btnClearSelect").click();
});

// =====================================================
// إنشاء قيد مفرد يدوي من سجل car_billing واحد محدد
// =====================================================
async function createManualSingleEntry() {
  try {
    // ── 1. التحقق من تحديد سجل واحد بالضبط ──
    const selectedIds = window.selectedRecords
      ? Array.from(window.selectedRecords)
      : [];
    if (selectedIds.length === 0) {
      showToast("⚠️ حدّد سجلاً واحداً من لوحة الاحتساب", "error", 4000);
      return;
    }
    if (selectedIds.length > 1) {
      showToast("⚠️ لا يمكن اختيار أكثر من سجل واحد لإنشاء قيد مفرد", "error", 4000);
      return;
    }

    // ── 2. جلب السجل المحدد ──
    const allBillings = await getPanelRows("car_billing");
    const rec = allBillings.find(r => selectedIds.includes(r.id || r._id));
    if (!rec) {
      showToast("⚠️ لم يُعثر على السجل المحدد", "error", 4000);
      return;
    }

    // ── 3. التحقق من حالة الاحتساب ──
    if (rec.calcStatus === "غير محتسب" || !rec._hasBilling) {
      showModalAlert(
        "⛔ لا يمكن إنشاء القيد المفرد",
        `<p>السجل المحدد <strong>غير محتسب</strong> بعد (لا يوجد إجمالي له).</p>
         <p>يجب <strong>إتمام الاحتساب</strong> أولاً قبل إنشاء القيد.</p>`
      );
      return;
    }

    // ── 4. التحقق من عدم وجوده في قيد مجمع مسبقاً ──
    const savedEntries = loadPanelLocal("combined_entries");
    const billingId = rec.id || rec._id || "";
    const inCombined = savedEntries.find(e =>
      e._isCustomGroup && e._customBillingIds &&
      e._customBillingIds.split("|").map(s => s.trim()).includes(billingId)
    );
    if (inCombined) {
      showModalAlert(
        "⛔ لا يمكن إنشاء القيد المفرد",
        `<p>هذا السجل موجود مسبقاً في قيد مجمع:</p>
         <p><strong>${inCombined.entryNo || inCombined.id || "—"}</strong></p>
         <p>لا يمكن إنشاء قيد مفرد لسجل مُدرج في قيد مجمع.</p>`
      );
      return;
    }

    // ── 5. التحقق من عدم وجود قيد مفرد مسبق لهذا السجل ──
    const singleKey = "single_" + billingId;
    const existingSingle = savedEntries.find(e =>
      !e._isCustomGroup && (e._groupKey === singleKey || e.id === singleKey)
    );
    if (existingSingle) {
      const ok = await showConfirmModal(
        "القيد موجود مسبقاً",
        `يوجد قيد مفرد لهذا السجل بالفعل (رقم القيد: <strong>${existingSingle.entryNo || "—"}</strong>).<br>هل تريد <strong>تحديثه</strong>؟`
      );
      if (!ok) return;
    }

    // ── 6. عرض نافذة تأكيد ──
    const totalAmt = parseFloat(rec.total) || 0;
    const totalPaid = parseFloat(rec.paidAmount) || 0;
    const totalRem  = totalAmt - totalPaid;
    const confirmed = await showConfirmModal(
      "📄 تأكيد إنشاء القيد المفرد",
      `<div style="text-align:right;line-height:2">
        <div><strong>رقم الحركة:</strong> ${rec.movementNo || "—"}</div>
        <div><strong>جهة التحاسب:</strong> ${rec.accountingParty || rec.driverName || "—"}</div>
        <div><strong>جهة الاستفادة:</strong> ${rec.beneficiaryName || "—"}</div>
        <div><strong>نوع السيارة:</strong> ${rec.transport || "—"}</div>
        <hr style="margin:6px 0;border-color:#ddd">
        <div><strong>الإجمالي الكلي:</strong>
          <span style="color:#1d4ed8;font-size:1.1em">${totalAmt % 1 === 0 ? Math.round(totalAmt) : totalAmt.toFixed(2)}</span>
        </div>
        <div><strong>إجمالي المدفوع:</strong> ${totalPaid % 1 === 0 ? Math.round(totalPaid) : totalPaid.toFixed(2)}</div>
        <div><strong>إجمالي المتبقي:</strong>
          <span style="color:${totalRem > 0 ? "#dc2626" : "#16a34a"}">${totalRem % 1 === 0 ? Math.round(totalRem) : totalRem.toFixed(2)}</span>
        </div>
      </div>`
    );
    if (!confirmed) return;

    // ── 7. حفظ القيد المفرد في combined_entries ──
    const entryId  = existingSingle ? existingSingle.id : singleKey;
    const entryNo  = existingSingle ? (existingSingle.entryNo || rec.entryNo || genEntryNo()) : (rec.entryNo || genEntryNo());
    const entryCreatedAt = existingSingle ? (existingSingle.entryCreatedAt || todayDateStr()) : todayDateStr();

    const newEntry = {
      id:              entryId,
      _id:             entryId,
      _groupKey:       singleKey,
      _isSingle:       true,
      _isCustomGroup:  false,
      entryNo:         entryNo,
      entryCreatedAt:  entryCreatedAt,
      entryType:       "قيد مفرد",
      code:            rec.code || "",
      accountingParty: rec.accountingParty || rec.driverName || "",
      beneficiaryName: rec.beneficiaryName || "",
      transport:       rec.transport || "",
      movementNo:      rec.movementNo || "",
      movementNos:     rec.movementNo || "",
      recordCount:     "1",
      totalAmount:     totalAmt  % 1 === 0 ? String(Math.round(totalAmt))  : totalAmt.toFixed(2),
      mergedStatement: (typeof buildCarBillingStatement === "function" ? buildCarBillingStatement(rec) : rec.statement) || "",
      creditNo2:       rec.creditNo2 || rec.creditNo || "",
      notes:           "",
      accountingStatus: rec.accountingStatus || "",
      _billingId:      billingId,
      movementId:      rec.movementId || ""
    };

    // حفظ entryNo أيضاً على سجل car_billing نفسه
    const billings = loadPanelLocal("car_billing");
    const bIdx = billings.findIndex(b => (b.id || b._id) === billingId || b.movementId === rec.movementId);
    if (bIdx >= 0) {
      billings[bIdx].entryNo = entryNo;
      savePanelLocal("car_billing", billings);
    }

    const idxE = savedEntries.findIndex(e => e._groupKey === singleKey || e.id === entryId);
    if (idxE >= 0) {
      savedEntries[idxE] = Object.assign({}, savedEntries[idxE], newEntry);
    } else {
      savedEntries.unshift(newEntry);
    }
    savePanelLocal("combined_entries", savedEntries);

    showToast(`✅ تم إنشاء القيد المفرد — رقم القيد: ${entryNo}`, "success", 5000);
    window.selectedRecords && window.selectedRecords.clear();
    await renderAll();

  } catch (e) {
    console.error("createManualSingleEntry:", e);
    showToast("❌ خطأ أثناء إنشاء القيد المفرد", "error", 4000);
  }
}

// =====================================================
// إنشاء قيد مجمع يدوي من سجلات car_billing المحددة
// =====================================================
async function createManualCombinedEntry() {
  try {
    // ── 1. التحقق من وجود تحديد ──
    const selectedIds = window.selectedRecords
      ? Array.from(window.selectedRecords)
      : [];
    if (selectedIds.length < 2) {
      showToast("⚠️ حدّد سجلَين على الأقل من لوحة الاحتساب", "error", 4000);
      return;
    }

    // ── 2. جلب سجلات الاحتساب المحددة ──
    const allBillings = await getPanelRows("car_billing");
    const selected = allBillings.filter(r =>
      selectedIds.includes(r.id || r._id)
    );

    if (selected.length < 2) {
      showToast("⚠️ لم يُعثر على سجلات الاحتساب المحددة", "error", 4000);
      return;
    }

    // ── 3-أ. التحقق من حالة الاحتساب: لا يُسمح بالتجميع إذا كان أي سجل غير محتسب ──
    const uncalculated = selected.filter(r => r.calcStatus === "غير محتسب" || !r._hasBilling);
    if (uncalculated.length > 0) {
      const mvNos = uncalculated.map(r => r.movementNo || r.code || "-").join("، ");
      showModalAlert(
        "⛔ لا يمكن إنشاء القيد المجمع",
        `<p>السجلات التالية <strong>غير محتسبة</strong> بعد (لا يوجد إجمالي لها):</p>
         <ul style="text-align:right;margin:8px 0">${uncalculated.map(r =>
           `<li>${r.movementNo || r.code || "-"} — ${r.driverName || r.accountingParty || ""}</li>`
         ).join("")}</ul>
         <p>يجب <strong>إتمام الاحتساب</strong> لجميع السجلات قبل إنشاء القيد المجمع.</p>`
      );
      return;
    }

    // ── 3-ب. التحقق من الشرط: جهة التحاسب + جهة الاستفادة متطابقتان ──
    const parties     = [...new Set(selected.map(r => (r.accountingParty || "").trim()))].filter(Boolean);
    const benefics    = [...new Set(selected.map(r => (r.beneficiaryName  || "").trim()))].filter(Boolean);

    if (parties.length > 1) {
      const names = parties.join(" / ");
      showModalAlert(
        "⚠️ خطأ في إنشاء القيد المجمع",
        `<p>السجلات المحددة تحتوي على <strong>أكثر من جهة تحاسب</strong>:</p>
         <ul style="text-align:right;margin:8px 0">${parties.map(p=>`<li>${p}</li>`).join("")}</ul>
         <p>يجب أن تكون <strong>جهة التحاسب واحدة</strong> في جميع السجلات المجمعة.</p>`
      );
      return;
    }

    if (benefics.length > 1) {
      const names = benefics.join(" / ");
      showModalAlert(
        "⚠️ خطأ في إنشاء القيد المجمع",
        `<p>السجلات المحددة تحتوي على <strong>أكثر من جهة استفادة</strong>:</p>
         <ul style="text-align:right;margin:8px 0">${benefics.map(b=>`<li>${b}</li>`).join("")}</ul>
         <p>يجب أن تكون <strong>جهة الاستفادة واحدة</strong> في جميع السجلات المجمعة.</p>`
      );
      return;
    }

    const party      = parties[0]  || "";
    const beneficiary= benefics[0] || "";

    // ── 4. حساب الإجماليات ──
    const movementNos = selected.map(r => (r.movementNo || "").trim()).filter(Boolean).join(" + ");
    const totalAmount = selected.reduce((s, r) => s + (parseFloat(r.total)      || 0), 0);
    const totalPaid   = selected.reduce((s, r) => s + (parseFloat(r.paidAmount) || 0), 0);
    const totalRem    = totalAmount - totalPaid;
    const transport   = selected.map(r => (r.transport || "").trim()).filter(Boolean)[0] || "";
    const creditNo    = selected.map(r => (r.creditNo || r.creditNo2 || "")).filter(Boolean)[0] || "";

    // بناء نص القيد التلقائي
    const stmtLines = selected
      .map(r => (typeof buildCarBillingStatement === "function" ? buildCarBillingStatement(r) : (r.statement || "")).trim())
      .filter(s => s.length > 0)
      .join("\n─────\n");

    // ── 5. مفتاح القيد المجمع المخصص (فريد لهذه المجموعة من الحركات) ──
    const billingIds = selected
      .map(r => r.id || r._id)
      .sort()
      .join("|");
    const customGroupKey = "custom|||" + billingIds;

    // ── 6. التحقق من عدم وجود قيد مجمع مخصص لنفس المجموعة ──
    const savedEntries = loadPanelLocal("combined_entries");
    const existing = savedEntries.find(e => e._customGroupKey === customGroupKey);

    // ── 6-ب. التحقق من عدم تواجد أي سجل في قيد مجمع آخر ──
    const selectedIdSet = new Set(selected.map(r => r.id || r._id));
    const conflictEntries = savedEntries.filter(e => {
      // تجاهل القيد الحالي (في حال التحديث)
      if (e._customGroupKey === customGroupKey) return false;
      // التحقق من أن هذا القيد مجمع مخصص ويحتوي على معرّفات
      if (!e._customBillingIds) return false;
      const entryIds = e._customBillingIds.split("|").map(s => s.trim());
      return entryIds.some(id => selectedIdSet.has(id));
    });

    if (conflictEntries.length > 0) {
      // جمع أرقام الحركات المتعارضة من كل قيد مجمع
      const conflictDetails = conflictEntries.map(e => {
        const conflictingIds = (e._customBillingIds || "").split("|").map(s => s.trim()).filter(id => selectedIdSet.has(id));
        const conflictingRows = selected.filter(r => conflictingIds.includes(r.id || r._id));
        const mvNos = conflictingRows.map(r => r.movementNo || r.code || "-").join("، ");
        return `<li>القيد <strong>${e.entryNo || e.id || "—"}</strong>: يحتوي على الحركة/الحركات [ ${mvNos} ]</li>`;
      }).join("");
      showModalAlert(
        "⛔ لا يمكن إنشاء القيد المجمع",
        `<p>أحد أو أكثر من السجلات المحددة <strong>موجودة مسبقاً</strong> في قيود مجمعة أخرى:</p>
         <ul style="text-align:right;margin:8px 0">${conflictDetails}</ul>
         <p>لا يمكن إدراج سجل في أكثر من قيد مجمع في آنٍ واحد.</p>`
      );
      return;
    }

    if (existing) {
      const ok = await showConfirmModal(
        "القيد موجود مسبقاً",
        `يوجد قيد مجمع مخصص لهذه السجلات بالفعل.<br>هل تريد <strong>تحديثه</strong>؟`
      );
      if (!ok) return;
    }

    // ── 7. فتح نافذة تأكيد مع ملخص ──
    const confirmed = await showConfirmModal(
      "📋 تأكيد إنشاء القيد المجمع",
      `<div style="text-align:right;line-height:2">
        <div><strong>جهة التحاسب:</strong> ${party || "—"}</div>
        <div><strong>جهة الاستفادة:</strong> ${beneficiary || "—"}</div>
        <div><strong>نوع السيارة:</strong> ${transport || "—"}</div>
        <div><strong>عدد السجلات:</strong> ${selected.length}</div>
        <div><strong>أرقام الحركات:</strong> ${movementNos}</div>
        <hr style="margin:6px 0;border-color:#ddd">
        <div><strong>الإجمالي الكلي:</strong>
          <span style="color:#1d4ed8;font-size:1.1em">${totalAmount % 1 === 0 ? Math.round(totalAmount) : totalAmount.toFixed(2)}</span>
        </div>
        <div><strong>إجمالي المدفوع:</strong> ${totalPaid % 1 === 0 ? Math.round(totalPaid) : totalPaid.toFixed(2)}</div>
        <div><strong>إجمالي المتبقي:</strong>
          <span style="color:${totalRem > 0 ? "#dc2626" : "#16a34a"}">${totalRem % 1 === 0 ? Math.round(totalRem) : totalRem.toFixed(2)}</span>
        </div>
        ${creditNo ? `<div><strong>رقم الاعتماد:</strong> ${creditNo}</div>` : ""}
      </div>`
    );
    if (!confirmed) return;

    // ── 8. حفظ القيد المجمع المخصص في combined_entries ──
    const entryId = existing
      ? existing.id
      : ("ce_custom_" + Date.now().toString(36));

    const newEntry = {
      id:               entryId,
      _id:              entryId,
      _customGroupKey:  customGroupKey,
      _customBillingIds: billingIds,
      _groupKey:        customGroupKey,   // لتوافق storage.js
      _isSingle:        false,
      _isCustomGroup:   true,
      entryType:        "قيد مجمع",
      code:             selected.map(r => (r.code || "").trim()).filter(Boolean).join(" + "),
      accountingParty:  party,
      beneficiaryName:  beneficiary,
      transport:        transport,
      movementNos:      movementNos,
      recordCount:      String(selected.length),
      totalAmount:      totalAmount % 1 === 0 ? String(Math.round(totalAmount)) : totalAmount.toFixed(2),
      mergedStatement:  stmtLines,
      creditNo2:        creditNo,
      notes:            "",
      entryCreatedAt:   todayDateStr()
    };

    const idx = savedEntries.findIndex(e => e._customGroupKey === customGroupKey);
    if (idx >= 0) {
      // تحديث الموجود مع الحفاظ على بيانات القيد اليدوية
      savedEntries[idx] = {
        ...savedEntries[idx],
        ...newEntry,
        // حافظ على entryNo الموجود (لا يتغيّر)
        entryNo:   savedEntries[idx].entryNo || (typeof genEntryNo === "function" ? genEntryNo() : "ENT-" + Math.floor(1000 + Math.random() * 9000)),
        // حافظ على تعديلات المستخدم اليدوية إن وُجدت
        mergedStatement: savedEntries[idx]._statementEdited
          ? savedEntries[idx].mergedStatement
          : stmtLines,
        creditNo2: savedEntries[idx].creditNo2 || creditNo,
        notes:     savedEntries[idx].notes     || "",
        // حافظ على تاريخ الإنشاء الأصلي
        entryCreatedAt: savedEntries[idx].entryCreatedAt || todayDateStr()
      };
    } else {
      // توليد entryNo للقيد المجمع الجديد
      newEntry.entryNo = typeof genEntryNo === "function" ? genEntryNo() : "ENT-" + Math.floor(1000 + Math.random() * 9000);
      savedEntries.unshift(newEntry);
    }

    savePanelLocal("combined_entries", savedEntries);

    // ── 9. إلغاء التحديد وإظهار رسالة نجاح ──
    window.selectedRecords = new Set();
    updateSelectedCount();
    setStatus("تم إنشاء القيد المجمع ✅");
    showToast(
      `✅ تم إنشاء القيد المجمع بنجاح! (${selected.length} سجلات — إجمالي: ${totalAmount % 1 === 0 ? Math.round(totalAmount) : totalAmount.toFixed(2)})`,
      "success", 5000
    );

    // ── 10. عرض رابط للانتقال إلى لوحة القيود المستحقة ──
    setTimeout(() => {
      showToast(
        `<span>📋 انتقل إلى <a href="panel.html?panel=combined_entries" target="_blank"
           style="color:#fff;font-weight:700;text-decoration:underline">
           لوحة القيود المستحقة</a> لمراجعة القيد</span>`,
        "info", 6000
      );
    }, 1000);

    await renderAll();

  } catch (e) {
    showToast("خطأ: " + e.message, "error");
    console.error("createManualCombinedEntry:", e);
  }
}

// ── دالة مساعدة: نافذة تنبيه بتصميم موحد ──
function showModalAlert(title, htmlContent) {
  // إزالة أي مودال سابق
  const old = document.getElementById("_alertModal");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "_alertModal";
  overlay.style.cssText = [
    "position:fixed","inset:0","background:rgba(0,0,0,0.55)",
    "z-index:9999","display:flex","align-items:center","justify-content:center"
  ].join(";");

  overlay.innerHTML = `
    <div style="
      background:var(--bg,#fff);border-radius:12px;padding:28px 32px;
      max-width:480px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.25);
      text-align:center;direction:rtl;
    ">
      <div style="font-size:1.15rem;font-weight:700;margin-bottom:14px;color:var(--danger,#dc2626)">
        ${title}
      </div>
      <div style="font-size:0.95rem;color:var(--text,#333);margin-bottom:20px;text-align:right">
        ${htmlContent}
      </div>
      <button onclick="document.getElementById('_alertModal').remove()"
        style="background:#1d4ed8;color:#fff;border:none;border-radius:8px;
               padding:8px 28px;font-size:1rem;cursor:pointer;font-weight:700">
        حسناً
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── دالة مساعدة: نافذة تأكيد بتصميم موحد — تُرجع Promise<boolean> ──
function showConfirmModal(title, htmlContent) {
  return new Promise(resolve => {
    const old = document.getElementById("_confirmModal");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "_confirmModal";
    overlay.style.cssText = [
      "position:fixed","inset:0","background:rgba(0,0,0,0.55)",
      "z-index:9999","display:flex","align-items:center","justify-content:center"
    ].join(";");

    overlay.innerHTML = `
      <div style="
        background:var(--bg,#fff);border-radius:12px;padding:28px 32px;
        max-width:520px;width:92%;box-shadow:0 8px 32px rgba(0,0,0,0.25);
        text-align:center;direction:rtl;
      ">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:14px;color:var(--primary,#1d4ed8)">
          ${title}
        </div>
        <div style="font-size:0.92rem;color:var(--text,#333);margin-bottom:22px;text-align:right">
          ${htmlContent}
        </div>
        <div style="display:flex;gap:12px;justify-content:center">
          <button id="_confirmYes"
            style="background:#16a34a;color:#fff;border:none;border-radius:8px;
                   padding:9px 28px;font-size:1rem;cursor:pointer;font-weight:700">
            ✅ نعم، أنشئ القيد
          </button>
          <button id="_confirmNo"
            style="background:#6b7280;color:#fff;border:none;border-radius:8px;
                   padding:9px 28px;font-size:1rem;cursor:pointer;font-weight:700">
            إلغاء
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("_confirmYes").onclick = () => { overlay.remove(); resolve(true);  };
    document.getElementById("_confirmNo" ).onclick = () => { overlay.remove(); resolve(false); };
  });
}
