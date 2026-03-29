// =====================================================
// Form Rendering (LOCAL ONLY)
// =====================================================

// =====================================================
// ✅ قيود حقول الهاتف — أرقام إنجليزية فقط (مشتركة)
// =====================================================
function applyPhoneFieldRestrictions(input) {
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("type", "tel");
  input.dir = "ltr";
  input.style.textAlign = "left";

  // (1) beforeinput: يمنع الأحرف غير المسموحة قبل إدراجها
  input.addEventListener("beforeinput", (e) => {
    if (!e.data) return; // مفاتيح تحكم (Backspace، مؤشر...)
    const cleaned = e.data
      .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[^\d+\-\s]/g, "");
    if (cleaned !== e.data) {
      e.preventDefault();
      if (cleaned) {
        // أدرج القيمة المنظّفة يدوياً (أرقام عربية تُحوَّل إنجليزية)
        document.execCommand("insertText", false, cleaned);
      }
    }
  });

  // (2) input: تنظيف ما وصل من IME أو إكمال تلقائي أو مصادر أخرى
  input.addEventListener("input", () => {
    const pos = input.selectionStart;
    const cleaned = input.value
      .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[^\d+\-\s]/g, "");
    if (input.value !== cleaned) {
      input.value = cleaned;
      try { input.setSelectionRange(pos, pos); } catch(_) {}
    }
  });

  // (3) paste: تحويل ما يُلصق
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = pasted
      .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[^\d+\-\s]/g, "");
    document.execCommand("insertText", false, cleaned);
  });

  // (4) keydown: حاجز احتياطي لمنع أحرف عربية من لوحة المفاتيح مباشرةً
  input.addEventListener("keydown", (e) => {
    const allowed = [
      "Backspace","Delete","ArrowLeft","ArrowRight",
      "Home","End","Tab","Enter","+"," ","-"
    ];
    if (allowed.includes(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    // e.key قد يكون حرفاً عربياً مفرداً أو رمزاً غير مسموح
    e.preventDefault();
  });
}

// ---- Image helper (Base64) ----
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ---- Local convoy sequence ----
function nextConvoyNoLocal() {
  const rows = loadPanelLocal("convoys");
  const prefix = "QF-";
  let maxN = 0;
  for (const r of rows) {
    const s = String(r.convoyNo || "").trim();
    if (s.startsWith(prefix)) {
      const n = Number(s.slice(prefix.length));
      if (Number.isFinite(n)) maxN = Math.max(maxN, n);
    }
  }
  const next = maxN + 1;
  return prefix + String(next).padStart(6, "0");
}

async function emptyRec(panel) {
  const r = { id: uid() };

  // init all fields to empty (or today for dates)
  for (const f of panel.fields) {
    if (f.k === "date" || f.type === "date") r[f.k] = todayISO();
    else r[f.k] = "";
  }

  // ✅ auto serial + short code (Local) for ALL panels
  // shows in form even before save
  if (typeof nextSeqForPanel === "function") {
    const seq = nextSeqForPanel(panel.key);
    if (seq) {
      r.seq = seq;
      if (typeof genShortCode === "function") r.code = genShortCode(panel.key, seq);
    }
  }

  // ✅ Local only: convoys
  if (panel.key === "convoys") {
    r.convoyNo = nextConvoyNoLocal();
    r.date = todayISO();
    r._trucks = [];
  }

  return r;
}

async function renderForm() {
  const p = currentPanel();
  if (!p) {
    console.error("renderForm: لوحة غير معروفة — key:", window.activeKey);
    $("formArea").innerHTML = `<div style="color:#ef4444;padding:16px;font-size:14px;">
      ⚠️ لم يتم العثور على اللوحة: <b>${window.activeKey || "غير محدد"}</b>
    </div>`;
    return;
  }
  $("panelTitle").textContent = p.title;
  $("formArea").innerHTML = "";

  const rows = await getPanelRows(p.key);
  const rec = window.selectedId
    ? rows.find(x => (x.id === window.selectedId) || (x._id === window.selectedId))
    : await emptyRec(p);

  // ✅ حفظ السجل المحمَّل عالمياً ليستخدمه btnSave كـ oldRec (لقراءة الحقول المعطَّلة بدقة)
  window._currentFormRec = rec || null;

  // ✅ تغيير نص زر الحفظ حسب وضع التعديل أو الإضافة
  const btnSave = $("btnSave");

  // ── لوحة احتساب أجرة السيارات: حالة خاصة ──
  if (p.key === "car_billing" && rec) {
    // هل يوجد سجل تحاسب محفوظ لهذه الحركة؟
    const hasBilling = !!(rec.accountingStatus || rec.fare || rec.fullDaysCount ||
                          rec.halfDaysCount || rec.quickMissionsCount || rec.paidAmount || rec.total);
    if (window.selectedId && hasBilling) {
      btnSave.innerHTML = '<i class="fas fa-pen-to-square"></i> حفظ التعديل';
      btnSave.classList.add("editing");
    } else if (window.selectedId) {
      btnSave.innerHTML = '<i class="fas fa-calculator"></i> إضافة تحاسب';
      btnSave.classList.remove("editing");
    } else {
      btnSave.innerHTML = '<i class="fas fa-floppy-disk"></i> حفظ';
      btnSave.classList.remove("editing");
    }

    // ── بانر بيانات الحركة (للعرض فقط، لا يمكن تعديلها هنا) ──
    if (window.selectedId && rec.activityDate) {
      const banner = document.createElement("div");
      banner.className = "movement-info-banner";
      const parts = [];
      if (rec.activityDate)    parts.push("📅 " + rec.activityDate);
      if (rec.entrySystem)     parts.push("🕐 " + rec.entrySystem);
      if (rec.transport)       parts.push("🚗 " + rec.transport);
      if (rec.driverName)      parts.push("👤 " + rec.driverName);
      if (rec.tourismCompany)  parts.push("🏢 " + rec.tourismCompany);
      if (rec.beneficiaryName) parts.push("🏷️ " + rec.beneficiaryName);
      if (rec.departurePlace)  parts.push("📍 " + rec.departurePlace);
      banner.innerHTML = `
        <div class="movement-info-title"><i class="fas fa-car-side"></i> بيانات حركة السيارة</div>
        <div class="movement-info-fields">${parts.join(" &nbsp;|&nbsp; ")}</div>
      `;
      $("formArea").appendChild(banner);
    }
  } else if (window.selectedId) {
    btnSave.innerHTML = '<i class="fas fa-pen-to-square"></i> حفظ التعديل';
    btnSave.classList.add("editing");
  } else {
    btnSave.innerHTML = '<i class="fas fa-floppy-disk"></i> حفظ';
    btnSave.classList.remove("editing");
  }

  // Render fields
  for (const f of p.fields) {
    const wrap = document.createElement("div");

    // =========================
    // TRUCK / CAR NUMBER FIELDS (headNo, trailerNo, tailNo, carNo)
    // =========================
    if (f.k === "headNo" || f.k === "trailerNo" || f.k === "tailNo" || f.k === "carNo") {
      const currentValue = rec[f.k] ?? "";
      wrap.innerHTML = createTruckNumberInputs(f.k, f.label, currentValue, f.req);
      $("formArea").appendChild(wrap);
      setTimeout(() => attachTruckNumberListeners(f.k), 0);
      continue;
    }

    // =========================
    // TIME INPUT FIELD (type: "time_input")
    // =========================
    if (f.type === "time_input") {
      const currentValue = rec[f.k] ?? "";
      wrap.innerHTML = createTimeInput(f.k, f.label, currentValue, f.req);
      $("formArea").appendChild(wrap);
      setTimeout(() => attachTimeInputListeners(f.k), 0);
      continue;
    }

    const lab = document.createElement("label");
    lab.className = f.req ? "req" : "";
    lab.textContent = f.label;
    wrap.appendChild(lab);

    // =========================
    // IMAGE FIELD
    // =========================
    if (f.type === "image") {
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/*";
      file.id = "f_" + f.k;

      const img = document.createElement("img");
      img.style.cssText =
        "margin-top:8px;max-width:100%;border-radius:12px;border:1px solid var(--line);display:none";

      const saved = rec[f.k];
      if (saved) {
        img.src = saved;
        img.style.display = "block";
      }

      file.onchange = async () => {
        const f0 = file.files?.[0];
        if (!f0) return;

        // localStorage guard
        if (f0.size > 2 * 1024 * 1024) {
          alert("الصورة كبيرة جدًا. الرجاء اختيار صورة أقل من 2MB.");
          file.value = "";
          return;
        }

        const base64 = await fileToBase64(f0);
        file.dataset.base64 = base64;
        img.src = base64;
        img.style.display = "block";
      };

      const del = document.createElement("button");
      del.type = "button";
      del.className = "secondary";
      del.style.marginTop = "8px";
      del.textContent = "حذف الصورة";
      del.onclick = () => {
        file.value = "";
        file.dataset.base64 = "";
        img.src = "";
        img.style.display = "none";
      };

      wrap.appendChild(file);
      wrap.appendChild(del);
      wrap.appendChild(img);

      if (f.hint) {
        const small = document.createElement("div");
        small.className = "small";
        small.textContent = f.hint;
        wrap.appendChild(small);
      }

      $("formArea").appendChild(wrap);
      continue;
    }

    // =========================
    // SECTION HEADER (فاصل / عنوان قسم)
    // =========================
    if (f.type === "section_header") {
      wrap.innerHTML = `
        <div class="section-header-divider">
          <span>${f.label}</span>
        </div>`;
      $("formArea").appendChild(wrap);
      continue;
    }

    // =========================
    // BANK FIELD (حقل بنكي: تسمية ثنائية + إدخال LTR)
    // =========================
    if (f.type === "bank_field") {
      wrap.className = "bank-field-wrap";
      wrap.innerHTML = `
        <div class="bank-field-labels">
          <span class="bank-label-ar">${f.label}</span>
          <span class="bank-label-en">${f.labelEn || ""}</span>
        </div>
        <input
          type="text"
          id="f_${f.k}"
          class="bank-input"
          dir="ltr"
          placeholder="${f.hint || ""}"
          value="${(rec[f.k] ?? "").replace(/"/g, '&quot;')}"
          autocomplete="off"
        />`;
      $("formArea").appendChild(wrap);
      continue;
    }

    // =========================
    // SELECT FIELD (قائمة منسدلة ثابتة)
    // =========================
    if (f.type === "select") {
      const sel = document.createElement("select");
      sel.id = "f_" + f.k;
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "-- اختر --";
      sel.appendChild(emptyOpt);
      (f.options || []).forEach(opt => {
        const o = document.createElement("option");
        // فواصل المجموعات تبدأ بـ ──
        if (opt.startsWith("──")) {
          o.value = "";
          o.textContent = opt;
          o.disabled = true;
          o.style.cssText = "color:#888;font-weight:bold;background:#f0f0f0;";
        } else {
          o.value = opt;
          o.textContent = opt;
          if ((rec[f.k] ?? "") === opt) o.selected = true;
        }
        sel.appendChild(o);
      });
      if (f.readonly) { sel.disabled = true; sel.style.opacity = 0.75; }

      // ── حقل نوع القيد: فلتر مباشر بدون حفظ ──
      if (f.k === "entryType" && window.activeKey === "combined_entries") {
        // استعادة الفلتر المحفوظ
        const savedFilter = window._combinedEntriesFilter || "جميع القيود";
        const matchOpt = sel.querySelector(`option[value="${savedFilter}"]`);
        if (matchOpt) matchOpt.selected = true;

        sel.addEventListener("change", async () => {
          window._combinedEntriesFilter = sel.value || "جميع القيود";
          window.selectedId = null;
          await renderTable();
        });
      }

      wrap.appendChild(sel);
      if (f.hint) {
        const small = document.createElement("div");
        small.className = "small";
        small.textContent = f.hint;
        wrap.appendChild(small);
      }
      $("formArea").appendChild(wrap);
      continue;
    }

    // =========================
    // CONTACTS LIST (منسقون/مسوقون متعددون)
    // =========================
    if (f.type === "contacts_list") {
      wrap.innerHTML = renderContactsList(f, rec[f.k] || []);
      $("formArea").appendChild(wrap);
      setTimeout(() => attachContactsListListeners(f.k), 0);
      continue;
    }

    // =========================
    // ITEMS LIST (أصناف متعددة)
    // =========================
    if (f.type === "items_list") {
      const allNames = await uniqueValues(f.listFrom ? f.listFrom.split('.')[0] : 'items',
                                          f.listFrom ? f.listFrom.split('.')[1] : 'itemName');
      wrap.innerHTML = renderItemsList(f, rec[f.k] || [], allNames);
      $("formArea").appendChild(wrap);
      setTimeout(() => attachItemsListListeners(f.k, f), 0);
      continue;
    }

    // =========================
    // NORMAL FIELDS
    // =========================
    let el;
    if (f.type === "textarea") {
      el = document.createElement("textarea");
    } else {
      el = document.createElement("input");
      if (f.type === "date") {
        el.type = "date";
      } else if (f.type === "phone") {
        el.type = "tel";
        el.inputMode = "numeric";
        el.pattern   = "[0-9+\\-\\s]*";
        el.dir       = "ltr";
        el.style.textAlign = "left";
      } else {
        el.type = "text";
      }
    }

    el.id = "f_" + f.k;
    el.value = rec[f.k] ?? "";
    el.placeholder = f.type === "phone" ? "مثال: 0501234567" : "";

    // ✅ تقييد حقول الهاتف: أرقام إنجليزية فقط + + و -
    if (f.type === "phone") {
      applyPhoneFieldRestrictions(el);
    }

    // ✅ حقول الأسعار القابلة للتعديل (_rateField): إضافة data attribute للتمييز البصري
    if (f._rateField) {
      el.dataset.rateField = "true";
      el.title = "سعر مُعبَّأ تلقائياً من الثوابت — يمكن تعديله يدوياً";
    }

    if (f.readonly) {
      // حقول الحساب التلقائي: readOnly فقط (لا disabled) حتى يمكن لـ JS تحديث قيمتها
      const isComputed = ["totalQty","loadWeightKg","weightPerUnit","totalPrice","totalWeight"].includes(f.k);
      if (isComputed) {
        el.readOnly = true;
        el.classList.add("computed-field");
      } else {
        el.disabled = true;
        el.style.opacity = 0.75;
      }
    }

    // Datalist
    if (f.listFrom) {
      const lf = parseListFrom(f.listFrom);
      if (lf) {
        const dlId = "dl_" + p.key + "_" + f.k;
        el.setAttribute("list", dlId);
        const values = await uniqueValues(lf.p, lf.f);
        wrap.appendChild(buildDatalist(dlId, values));
      }
    }

    wrap.appendChild(el);

    if (f.hint && f.type !== "textarea") {
      const small = document.createElement("div");
      small.className = "small";
      small.textContent = f.hint;
      wrap.appendChild(small);
    }

    $("formArea").appendChild(wrap);
  }

  // Computed hook
  if (p.computed) {
    // الحقول التي يجب تحديثها تلقائياً: المعطَّلة + أي حقل في قائمة computedFields
    const autoUpdateKeys = new Set(
      (p.computedFields || []).concat(
        p.fields.filter(f => f.readonly).map(f => f.k)
      )
    );
    // حقول الأسعار القابلة للتعديل اليدوي (_rateField): تُحدَّث فقط عند تغيير نوع السيارة
    const rateFieldKeys = new Set(
      p.fields.filter(f => f._rateField).map(f => f.k)
    );

    const applyComputedToUI = (rec2, updateRateFields = false) => {
      for (const ff of p.fields) {
        if (!ff.k) continue;
        const e2 = $("f_" + ff.k);
        if (!e2) continue;
        if (e2.disabled || autoUpdateKeys.has(ff.k)) {
          e2.value = rec2[ff.k] ?? "";
        } else if (updateRateFields && rateFieldKeys.has(ff.k)) {
          // حقل سعر: حدِّث فقط إذا كانت computed() غيّرت قيمته (أي أن _fillRate قرر التعديل)
          e2.value = rec2[ff.k] ?? e2.value;
        }
      }
    };

    const runComputed = () => {
      const rec2 = getCurrentFormRec(p, rec);
      p.computed(rec2);
      applyComputedToUI(rec2, false);
    };

    // للحقل transport في car_billing: أعد تعبئة أسعار الثوابت عند تغييره
    const transportEl = $("f_transport");
    if (p.key === "car_billing" && transportEl) {
      transportEl.addEventListener("change", () => {
        const rec2 = getCurrentFormRec(p, rec);
        // امسح حقول الأسعار لإجبار _fillRate على إعادة تعبئتها من الثوابت الجديدة
        rateFieldKeys.forEach(k => { rec2[k] = ""; });
        p.computed(rec2);
        applyComputedToUI(rec2, true);
      });
    }

    for (const f of p.fields) {
      const el = $("f_" + f.k);
      if (el && !el.disabled && f.type !== "image" && f.k !== "transport") {
        el.addEventListener("input",  runComputed);
        el.addEventListener("change", runComputed);
      }
      // transport له listener خاص أعلاه (لـ car_billing)؛ للوحات الأخرى أضفه عادياً
      if (el && !el.disabled && f.k === "transport" && p.key !== "car_billing") {
        el.addEventListener("input",  runComputed);
        el.addEventListener("change", runComputed);
      }
    }

    const r0 = getCurrentFormRec(p, rec);
    p.computed(r0);
    // عند التحميل الأولي: اعرض كل القيم المحسوبة بما فيها أسعار الثوابت
    for (const ff of p.fields) {
      if (!ff.k) continue;
      const e2 = $("f_" + ff.k);
      if (!e2) continue;
      if (e2.disabled || autoUpdateKeys.has(ff.k) || rateFieldKeys.has(ff.k)) {
        e2.value = r0[ff.k] ?? "";
      }
    }
  }

  // ✅ صندوق دفع حركات السيارات — تحسينات UX
  if (p.key === "car_payment_cashbox") {
    setTimeout(() => {
      const paidAmountEl = document.getElementById("f_paidAmount");
      const payDateEl    = document.getElementById("f_payDate");

      // إذا كان مبلغ الدفعة صفراً أو فارغاً: أبرزه بلون أحمر لتنبيه المستخدم
      const checkPaidAmount = () => {
        if (!paidAmountEl) return;
        const v = parseFloat(paidAmountEl.value) || 0;
        if (v <= 0) {
          paidAmountEl.style.border = "2px solid #ef4444";
          paidAmountEl.style.background = "rgba(239,68,68,0.08)";
        } else {
          paidAmountEl.style.border = "";
          paidAmountEl.style.background = "";
        }
      };
      if (paidAmountEl) {
        paidAmountEl.addEventListener("input",  checkPaidAmount);
        paidAmountEl.addEventListener("change", checkPaidAmount);
        checkPaidAmount();
        // إذا كان صفراً: انقل التركيز للحقل لإعلام المستخدم
        if ((parseFloat(paidAmountEl.value) || 0) <= 0) {
          // لا ننقل التركيز تلقائياً لأن payDate قد يكون فارغاً أيضاً
        }
      }

      // عند تأكيد تاريخ الدفع: انقل التركيز إلى مبلغ الدفعة تلقائياً
      if (payDateEl && paidAmountEl) {
        payDateEl.addEventListener("change", () => {
          if ((parseFloat(paidAmountEl.value) || 0) <= 0) {
            setTimeout(() => paidAmountEl.focus(), 50);
          }
        });
      }
    }, 100);
  }

  // Convoy subgrid (stored locally)
  if (p.key === "convoys" && p.subgrid) {
    await renderConvoySubgrid(p, rec);
  }

  // ── سجل الدفعات الجزئية لصندوق الدفع ─────────────────────────
  if (p.key === "car_payment_cashbox" && rec._billingId) {
    await renderInstallmentsSubgrid(rec);
  }

  // ✅ التعبئة التلقائية للمالك والرخصة في لوحة الشاحنات
  if (p.key === "trucks") {
    setTimeout(() => attachTruckPartAutoFill(), 0);
  }

  // ✅ تعبئة جوال السائق ونوع السيارة تلقائياً في لوحة حركة السيارات
  if (p.key === "car_movements") {
    setTimeout(() => attachCarTypePopup(), 0);
    setTimeout(() => attachDriverAutoFill(), 0);
    setTimeout(() => attachCarNoAutoFill(), 0);
    setTimeout(() => attachBeneficiaryConditional(), 0);
  }
  // ✅ لوحة احتساب أجرة السيارات — نفس التعبئة التلقائية
  if (p.key === "car_billing") {
    setTimeout(() => attachDriverAutoFill(), 0);
    setTimeout(() => attachBeneficiaryConditional(), 0);

    // ── تاريخ الدفع → يملأ يوم الاحتساب تلقائياً (قابل للتعديل) ──
    setTimeout(() => {
      const payDateEl      = document.getElementById("f_payDate");
      const acctDateEl     = document.getElementById("f_accountingDate");
      if (payDateEl && acctDateEl) {
        payDateEl.addEventListener("change", () => {
          // فقط إذا كان يوم الاحتساب فارغاً أو مطابقاً للقيمة السابقة
          if (!acctDateEl.value || acctDateEl.dataset.syncedFromPay === "true") {
            acctDateEl.value = payDateEl.value;
            acctDateEl.dataset.syncedFromPay = "true";
          }
        });
        // إذا عدّل المستخدم يوم الاحتساب يدوياً → ألغِ المزامنة
        acctDateEl.addEventListener("input", () => {
          acctDateEl.dataset.syncedFromPay = "false";
        });
        acctDateEl.addEventListener("change", () => {
          if (acctDateEl.value !== payDateEl.value) {
            acctDateEl.dataset.syncedFromPay = "false";
          }
        });
      }
    }, 50);
  }

  // ✅ التعبئة التلقائية من رقم الاعتماد في لوحة القوافل
  if (p.key === "convoys") {
    const creditEl = $("f_creditNo");
    if (creditEl) {
      creditEl.addEventListener("change", () => autoFillFromCredit());
      creditEl.addEventListener("input",  () => {
        clearTimeout(window._creditFillTimer);
        window._creditFillTimer = setTimeout(() => autoFillFromCredit(), 600);
      });
    }
    // ✅ حساب إجمالي عدد القطع تلقائياً
    setTimeout(() => attachTotalQtyListener(), 0);
    // ✅ تعبئة بيانات السائق تلقائياً عند اختيار الاسم
    setTimeout(() => attachDriverAutoFill(), 0);
    // ✅ تعبئة وزن الوحدة تلقائياً عند اختيار الصنف
    setTimeout(() => attachItemWeightAutoFill(), 0);
    // ✅ تعبئة رقم المقطورة تلقائياً عند اختيار رقم الرأس
    setTimeout(() => attachConvoyHeadNoAutoFill(), 0);
  }

  // ✅ حساب السعر الإجمالي في لوحة الاعتمادات
  if (p.key === "credits" && p.computed) {
    ["f_qty","f_unitPrice","f_expenses"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("input", () => {
        const r = getCurrentFormRec(p, rec);
        p.computed(r);
        const tp = $("f_totalPrice");
        if (tp) tp.value = r.totalPrice || "";
      });
    });
    const r0 = getCurrentFormRec(p, rec);
    p.computed(r0);
    const tp = $("f_totalPrice");
    if (tp) tp.value = r0.totalPrice || "";
  }

  $("formHint").textContent = window.selectedId
    ? 'هذا السجل محدد للتعديل، عدّل ثم اضغط "حفظ التعديل".'
    : 'تم تفريغ النموذج، أدخل البيانات واضغط "حفظ".';
}

// preserve old images when editing
function getCurrentFormRec(panel, oldRec = null) {
  const rec = { id: window.selectedId || uid() };

  for (const f of panel.fields) {
    // تجاهل حقول الفاصل (لا قيمة لها)
    if (f.type === "section_header") continue;

    // Special handling for truck/car number fields (split inputs)
    if (f.k === "headNo" || f.k === "trailerNo" || f.k === "tailNo" || f.k === "carNo") {
      const hiddenEl = $(f.k);
      rec[f.k] = hiddenEl ? (hiddenEl.value ?? "") : "";
      continue;
    }

    // time_input: القيمة مخزنة في hidden input باسم f.k
    if (f.type === "time_input") {
      const hiddenEl = $(f.k);
      rec[f.k] = hiddenEl ? (hiddenEl.value ?? "") : "";
      continue;
    }

    // contacts_list: مصفوفة من DOM
    if (f.type === "contacts_list") {
      rec[f.k] = readContactsListFromDOM(f.k);
      continue;
    }

    // items_list: مصفوفة أصناف من DOM
    if (f.type === "items_list") {
      rec[f.k] = readItemsListFromDOM(f.k);
      continue;
    }

    const el = $("f_" + f.k);

    if (f.type === "image") {
      const newB64 = el?.dataset?.base64;
      if (newB64) rec[f.k] = newB64;
      else rec[f.k] = (oldRec && oldRec[f.k]) ? oldRec[f.k] : "";
      continue;
    }

    // الحقول المعطَّلة (disabled): قراءة قيمتها من oldRec أولاً (أكثر دقة من el.value المعطَّل)
    if (el && el.disabled && oldRec && oldRec[f.k] !== undefined) {
      rec[f.k] = oldRec[f.k];
      continue;
    }

    rec[f.k] = el ? (el.value ?? "") : "";
  }

  if (panel.key === "convoys") rec._trucks = window.__convoy_trucks || [];
  if (panel.computed) panel.computed(rec);
  return rec;
}

function validate(panel, rec) {
  for (const f of panel.fields) {
    if (f.req) {
      const v = String(rec[f.k] ?? "").trim();
      if (!v) return `${f.label} إجباري.`;
    }
    
    // Validate truck/car number fields
    if (f.k === "headNo" || f.k === "trailerNo" || f.k === "tailNo" || f.k === "carNo") {
      const value = rec[f.k];
      if (value && value.trim()) {
        const validation = validateTruckNumber(value, f.k);
        if (validation !== true && validation.valid === false) {
          return `${f.label}: ${validation.message}`;
        }
      }
    }
  }

  // ── تحقق خاص بصندوق دفع حركات السيارات ──────────────────────
  if (panel.key === "car_payment_cashbox") {
    // تاريخ الدفع إجباري
    if (!(rec.payDate || "").trim()) {
      // تمييز الحقل بصرياً
      const payDateEl = document.getElementById("f_payDate");
      if (payDateEl) {
        payDateEl.style.border = "2px solid #ef4444";
        payDateEl.focus();
        setTimeout(() => { payDateEl.style.border = ""; }, 3000);
      }
      return "تاريخ الدفع إجباري.";
    }
    // مبلغ الدفعة يجب أن يكون أكبر من صفر
    const paid = parseFloat(rec.paidAmount) || 0;
    if (paid <= 0) {
      const paidAmountEl = document.getElementById("f_paidAmount");
      if (paidAmountEl) {
        paidAmountEl.style.border = "2px solid #ef4444";
        paidAmountEl.style.background = "rgba(239,68,68,0.08)";
        paidAmountEl.focus();
        setTimeout(() => {
          paidAmountEl.style.border = "";
          paidAmountEl.style.background = "";
        }, 3000);
      }
      return "مبلغ هذه الدفعة إجباري ويجب أن يكون أكبر من صفر.";
    }
  }

  return "";
}

// Convoy subgrid rendering
async function renderConvoySubgrid(p, rec) {
  const d = document.createElement("details");
  d.open = true;
  const s = document.createElement("summary");
  s.textContent = p.subgrid.title;
  d.appendChild(s);

  const hint = document.createElement("div");
  hint.className = "small";
  hint.textContent = p.subgrid.hint || "";
  d.appendChild(hint);

  const subWrap = document.createElement("div");
  subWrap.style.marginTop = "10px";
  subWrap.className = "card";
  subWrap.style.background = "rgba(11,20,40,.35)";
  subWrap.style.borderRadius = "14px";
  subWrap.style.border = "1px solid var(--line)";
  subWrap.style.boxShadow = "none";
  subWrap.innerHTML = `<div class="pill">إضافة سطر (شاحنة + صنف)</div>`;

  const subFields = p.subgrid.fields;
  for (let i = 0; i < subFields.length; i += 2) {
    const row = document.createElement("div");
    row.className = "row";

    for (const sf of [subFields[i], subFields[i + 1]]) {
      const cell = document.createElement("div");
      if (!sf) {
        row.appendChild(cell);
        continue;
      }

      const lab = document.createElement("label");
      lab.className = sf.req ? "req" : "";
      lab.textContent = sf.label;
      cell.appendChild(lab);

      const inp = document.createElement("input");
      inp.id = "sf_" + sf.k;
      inp.type = "text";
      inp.placeholder = sf.hint || "";
      if (sf.readonly) {
        inp.disabled = true;
        inp.style.opacity = 0.75;
      }

      if (sf.listFrom) {
        const lf = parseListFrom(sf.listFrom);
        if (lf) {
          const dlId = "dl_sub_" + sf.k;
          inp.setAttribute("list", dlId);
          const values = await uniqueValues(lf.p, lf.f);
          cell.appendChild(buildDatalist(dlId, values));
        }
      }

      cell.appendChild(inp);
      row.appendChild(cell);
    }

    subWrap.appendChild(row);
  }

  const subBtns = document.createElement("div");
  subBtns.className = "btns2";
  const addBtn = document.createElement("button");
  addBtn.className = "success";
  addBtn.textContent = "إضافة للسجل";
  const clearBtn = document.createElement("button");
  clearBtn.className = "secondary";
  clearBtn.textContent = "تفريغ الحقول";
  subBtns.appendChild(addBtn);
  subBtns.appendChild(clearBtn);
  subWrap.appendChild(subBtns);

  const subTableWrap = document.createElement("div");
  subTableWrap.className = "tablewrap";
  subTableWrap.style.marginTop = "10px";
  subTableWrap.innerHTML = `<table style="min-width:1200px">
    <thead><tr>${p.subgrid.cols.map(c => `<th>${colLabel(c)}</th>`).join("")}<th>حذف</th></tr></thead>
    <tbody id="subTbody"></tbody>
  </table>`;
  subWrap.appendChild(subTableWrap);

  d.appendChild(subWrap);
  $("formArea").appendChild(d);

  function getRows() {
    return window.__convoy_trucks || (rec._trucks || []);
  }

  function setRows(arr) {
    window.__convoy_trucks = arr;
  }

  function computeSubWeight() {
    const qty = toNum($("sf_qty")?.value);
    const wpu = toNum($("sf_weightPerUnit")?.value);
    if ($("sf_totalWeight")) $("sf_totalWeight").value = (qty && wpu) ? String(qty * wpu) : "";
  }
  ["sf_qty", "sf_weightPerUnit"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("input", computeSubWeight);
  });

  async function autopopulateTruck() {
    const headNo = ($("sf_headNo")?.value || "").trim();
    if (!headNo) return;

    const trucks = await getPanelRows("trucks");
    const t = trucks.find(x => String(x.headNo || "").trim() === headNo);

    if (t) {
      $("sf_trailerNo").value = t.trailerNo || "";
      $("sf_tailNo").value = t.tailNo || "";
      $("sf_driverName").value = t.driverName || "";

      const drivers = await getPanelRows("drivers");
      const m = drivers.find(x => String(x.driverName || "").trim() === String(t.driverName || "").trim());
      $("sf_driverPhone").value = (m?.phone) || t.driverPhone || "";
    } else {
      ["sf_trailerNo", "sf_tailNo", "sf_driverName", "sf_driverPhone"].forEach(id => {
        if ($(id)) $(id).value = "";
      });
    }

    computeSubWeight();
  }

  const headEl = $("sf_headNo");
  if (headEl) {
    headEl.addEventListener("input", autopopulateTruck);
    headEl.addEventListener("change", autopopulateTruck);
  }

  function clearSub() {
    for (const sf of p.subgrid.fields) {
      const el = $("sf_" + sf.k);
      if (el) el.value = "";
    }
  }
  clearBtn.onclick = clearSub;

  function renderSub() {
    const tb = $("subTbody");
    tb.innerHTML = "";

    const arr = getRows();
    arr.forEach((r, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = p.subgrid.cols.map(c => `<td>${(r[c] ?? "")}</td>`).join("") +
        `<td><button class="danger" style="padding:6px 10px;border-radius:10px" data-i="${idx}">حذف</button></td>`;
      tb.appendChild(tr);
    });

    tb.querySelectorAll("button[data-i]").forEach(b => {
      b.onclick = () => {
        const i = Number(b.getAttribute("data-i"));
        setRows(getRows().filter((_, j) => j !== i));
        renderSub();
      };
    });
  }

  function addSub() {
    const row = {};
    for (const sf of p.subgrid.fields) {
      row[sf.k] = String($("sf_" + sf.k)?.value || "").trim();
    }

    if (!row.headNo) {
      alert("أدخل رقم الرأس");
      return;
    }

    if (!row.itemName) {
      alert("أدخل اسم الصنف");
      return;
    }

    const qty = toNum(row.qty);
    const wpu = toNum(row.weightPerUnit);
    row.totalWeight = (qty && wpu) ? String(qty * wpu) : (row.totalWeight || "");

    const arr = getRows();
    arr.push(row);
    setRows(arr);
    renderSub();
    clearSub();
    setStatus("تمت الإضافة ✅");
  }

  addBtn.onclick = addSub;

  setRows(rec._trucks || []);
  renderSub();
}

// =====================================================
// Installments Subgrid - سجل الدفعات الجزئية لصندوق الدفع
// =====================================================

/**
 * يرسم جدول الدفعات الجزئية السابقة وحقول إضافة دفعة جديدة
 * داخل نموذج صندوق الدفع (car_payment_cashbox)
 */
async function renderInstallmentsSubgrid(rec) {
  const billingId = rec._billingId || "";
  if (!billingId) return;

  const formArea = document.getElementById("formArea");
  if (!formArea) return;

  // ── جلب الدفعات الحالية ──────────────────────────────────────
  const installments = (typeof getInstallmentsForBilling === "function")
    ? await getInstallmentsForBilling(billingId)
    : [];

  const totalPaid   = installments.reduce((s, r) => s + (parseFloat(r.paidAmount) || 0), 0);
  const totalAmount = parseFloat(rec.totalAmount) || 0;
  const remaining   = Math.max(0, totalAmount - totalPaid);

  // ── حاوية الـ subgrid ─────────────────────────────────────────
  const wrap = document.createElement("div");
  wrap.id = "installmentsSubgrid";
  wrap.style.cssText = "margin-top:18px;";

  // ── عنوان ────────────────────────────────────────────────────
  const header = document.createElement("div");
  header.style.cssText = [
    "display:flex", "align-items:center", "justify-content:space-between",
    "margin-bottom:10px", "padding:10px 14px",
    "background:rgba(99,102,241,0.12)", "border-radius:10px",
    "border:1px solid rgba(99,102,241,0.3)"
  ].join(";");
  header.innerHTML = `
    <span style="font-weight:700;font-size:14px;color:var(--accent,#6366f1)">
      <i class="fas fa-list-check"></i> سجل الدفعات الجزئية
    </span>
    <span style="font-size:12px;color:var(--text-muted,#94a3b8)">
      عدد الدفعات: <b style="color:#fff">${installments.length}</b>
    </span>
  `;
  wrap.appendChild(header);

  // ── جدول الدفعات السابقة ─────────────────────────────────────
  if (installments.length > 0) {
    const tableWrap = document.createElement("div");
    tableWrap.className = "tablewrap";
    tableWrap.style.marginBottom = "14px";

    const table = document.createElement("table");
    table.style.cssText = "width:100%;min-width:500px;font-size:13px;";
    table.innerHTML = `
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th>تاريخ الدفعة</th>
          <th>المبلغ</th>
          <th>الدافع</th>
          <th>ملاحظة</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement("tbody");
    installments.forEach((inst, i) => {
      const tr = document.createElement("tr");
      const fmtDate = (ds) => {
        if (!ds) return "—";
        const parts = ds.split("-");
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ds;
      };
      tr.innerHTML = `
        <td style="text-align:center;color:#94a3b8">${i + 1}</td>
        <td style="color:#38bdf8;font-weight:600">${fmtDate(inst.payDate)}</td>
        <td style="color:#10b981;font-weight:700">${Number(inst.paidAmount || 0).toLocaleString("ar-SA")}</td>
        <td>${inst.paidBy || "—"}</td>
        <td style="color:#94a3b8;font-size:12px">${inst.notes || ""}</td>
      `;
      tbody.appendChild(tr);
    });

    // صف المجموع
    const totalTr = document.createElement("tr");
    totalTr.style.cssText = "background:rgba(16,185,129,0.1);font-weight:700;border-top:2px solid rgba(16,185,129,0.4)";
    totalTr.innerHTML = `
      <td colspan="2" style="text-align:left;padding-right:8px;color:#10b981">إجمالي المدفوع</td>
      <td style="color:#10b981;font-weight:800">${totalPaid.toLocaleString("ar-SA")}</td>
      <td colspan="2"></td>
    `;
    tbody.appendChild(totalTr);

    // صف المتبقي
    if (totalAmount > 0) {
      const remTr = document.createElement("tr");
      remTr.style.cssText = `background:${remaining > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.05)"};font-weight:700`;
      remTr.innerHTML = `
        <td colspan="2" style="text-align:left;padding-right:8px;color:${remaining > 0 ? "#ef4444" : "#10b981"}">
          ${remaining > 0 ? "المبلغ المتبقي" : "✅ تم السداد بالكامل"}
        </td>
        <td style="color:${remaining > 0 ? "#ef4444" : "#10b981"};font-weight:800">
          ${remaining > 0 ? remaining.toLocaleString("ar-SA") : "0"}
        </td>
        <td colspan="2"></td>
      `;
      tbody.appendChild(remTr);
    }

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    wrap.appendChild(tableWrap);
  } else {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.cssText = "text-align:center;color:#64748b;padding:12px;font-size:13px;margin-bottom:12px;";
    emptyMsg.innerHTML = `<i class="fas fa-inbox" style="margin-left:6px;"></i> لا توجد دفعات مسجلة بعد`;
    wrap.appendChild(emptyMsg);
  }

  // ── قسم إضافة دفعة جديدة ──────────────────────────────────────
  const addSection = document.createElement("div");
  addSection.style.cssText = [
    "padding:14px", "border-radius:10px",
    "background:rgba(16,185,129,0.07)",
    "border:1px solid rgba(16,185,129,0.25)"
  ].join(";");

  const addTitle = document.createElement("div");
  addTitle.style.cssText = "font-weight:700;font-size:13px;color:#10b981;margin-bottom:10px;";
  addTitle.innerHTML = `<i class="fas fa-plus-circle"></i> إضافة دفعة جديدة`;
  addSection.appendChild(addTitle);

  // ── صف حقول الدفعة الجديدة ───────────────────────────────────
  const fieldsRow = document.createElement("div");
  fieldsRow.className = "row";
  fieldsRow.style.cssText = "gap:10px;align-items:end;flex-wrap:wrap;";

  // حقل التاريخ
  const dateCell = document.createElement("div");
  dateCell.style.flex = "1";
  dateCell.innerHTML = `<label style="font-size:12px">تاريخ الدفعة <span style="color:#ef4444">*</span></label>`;
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id   = "inst_payDate";
  dateInput.value = rec.payDate || new Date().toISOString().split("T")[0];
  dateInput.style.cssText = "width:100%;";
  dateCell.appendChild(dateInput);
  fieldsRow.appendChild(dateCell);

  // حقل المبلغ
  const amtCell = document.createElement("div");
  amtCell.style.flex = "1";
  amtCell.innerHTML = `<label style="font-size:12px">مبلغ الدفعة <span style="color:#ef4444">*</span></label>`;
  const amtInput = document.createElement("input");
  amtInput.type        = "number";
  amtInput.id          = "inst_paidAmount";
  amtInput.placeholder = "أدخل المبلغ";
  amtInput.min         = "0";
  // اقتراح المبلغ المتبقي تلقائياً
  amtInput.value = remaining > 0 ? String(Math.round(remaining)) : "";
  amtInput.style.cssText = "width:100%;";
  amtCell.appendChild(amtInput);
  fieldsRow.appendChild(amtCell);

  // حقل الدافع
  const paidByCell = document.createElement("div");
  paidByCell.style.flex = "1.5";
  paidByCell.innerHTML = `<label style="font-size:12px">اسم الدافع</label>`;
  const paidByInput = document.createElement("input");
  paidByInput.type        = "text";
  paidByInput.id          = "inst_paidBy";
  paidByInput.placeholder = "اسم الدافع";
  paidByInput.value       = rec.paidBy || "";
  paidByInput.style.cssText = "width:100%;";
  paidByCell.appendChild(paidByInput);
  fieldsRow.appendChild(paidByCell);

  // حقل الملاحظة
  const notesCell = document.createElement("div");
  notesCell.style.flex = "2";
  notesCell.innerHTML = `<label style="font-size:12px">ملاحظة</label>`;
  const notesInput = document.createElement("input");
  notesInput.type        = "text";
  notesInput.id          = "inst_notes";
  notesInput.placeholder = "ملاحظة اختيارية";
  notesInput.style.cssText = "width:100%;";
  notesCell.appendChild(notesInput);
  fieldsRow.appendChild(notesCell);

  addSection.appendChild(fieldsRow);

  // ── زر إضافة الدفعة ──────────────────────────────────────────
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "margin-top:10px;display:flex;gap:8px;";

  const saveInstBtn = document.createElement("button");
  saveInstBtn.className = "success";
  saveInstBtn.style.cssText = "padding:8px 18px;font-size:13px;font-weight:700;";
  saveInstBtn.innerHTML = `<i class="fas fa-floppy-disk"></i> حفظ الدفعة`;

  const msgEl = document.createElement("span");
  msgEl.id = "inst_msg";
  msgEl.style.cssText = "font-size:12px;align-self:center;";

  btnRow.appendChild(saveInstBtn);
  btnRow.appendChild(msgEl);
  addSection.appendChild(btnRow);

  // ── منطق حفظ الدفعة الجديدة ──────────────────────────────────
  saveInstBtn.onclick = async () => {
    const payDate   = document.getElementById("inst_payDate")?.value?.trim() || "";
    const paidAmt   = parseFloat(document.getElementById("inst_paidAmount")?.value) || 0;
    const paidBy    = document.getElementById("inst_paidBy")?.value?.trim() || "";
    const notes     = document.getElementById("inst_notes")?.value?.trim() || "";

    if (!payDate) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = "⚠️ تاريخ الدفعة مطلوب";
      return;
    }
    if (paidAmt <= 0) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = "⚠️ المبلغ يجب أن يكون أكبر من صفر";
      return;
    }

    saveInstBtn.disabled = true;
    saveInstBtn.textContent = "جارٍ الحفظ...";
    msgEl.textContent = "";

    try {
      const newInst = {
        id:         crypto.randomUUID(),
        billingId:  billingId,
        movementId: rec.movementId || "",
        payDate,
        paidAmount: paidAmt,
        paidBy,
        notes,
        seq:        (installments.length + 1),
        code:       "INST-" + String(installments.length + 1).padStart(3, "0")
      };

      await apiCreate("car_payment_installments", newInst);

      // ── تحديث سجل car_payment_cashbox بالإجمالي الجديد ────────
      const newTotal = totalPaid + paidAmt;
      const newRemaining = Math.max(0, totalAmount - newTotal);
      const newStatus = newRemaining <= 0 ? "محاسب كامل" : "محاسب جزئي";

      // حفظ آخر دفعة في car_payment_cashbox للعرض في اللوحة
      const cashboxRec = Object.assign({}, rec, {
        payDate,
        paidBy,
        paidAmount:      String(paidAmt),
        paidAmountBefore: String(totalPaid),
        totalPaidAfter:  String(newTotal),
        remainingAmount: String(newRemaining),
        accountingStatus: newStatus,
        _savedPayId:     rec._savedPayId || rec.id || ("pay_" + billingId)
      });
      // إزالة الحقول غير الضرورية
      delete cashboxRec._id;

      // البحث عن id حقيقي للسجل في D1
      if (rec._savedPayId) {
        await apiUpdate("car_payment_cashbox", rec._savedPayId, cashboxRec);
      } else {
        cashboxRec.id = crypto.randomUUID();
        await apiCreate("car_payment_cashbox", cashboxRec);
      }

      // تحديث كاش اللوحات
      if (typeof _clearCache === "function") {
        _clearCache("car_payment_cashbox", true);
        _clearCache("car_billing", true);
      }

      msgEl.style.color = "#10b981";
      msgEl.textContent = "✅ تم حفظ الدفعة بنجاح";

      // إعادة رسم الـ subgrid بعد ثانية لتحديث الجدول
      setTimeout(async () => {
        const existingSub = document.getElementById("installmentsSubgrid");
        if (existingSub) existingSub.remove();
        // تحديث الحقول الرئيسية في النموذج
        const tpaEl = document.getElementById("f_totalPaidAfter");
        const remEl = document.getElementById("f_remainingAmount");
        const stEl  = document.getElementById("f_accountingStatus");
        const pbEl  = document.getElementById("f_paidAmountBefore");
        if (tpaEl) tpaEl.value = String(newTotal);
        if (remEl) remEl.value = String(newRemaining);
        if (stEl)  stEl.value  = newStatus;
        if (pbEl)  pbEl.value  = String(totalPaid);
        // إعادة رسم الـ subgrid
        const updatedRec = Object.assign({}, rec, {
          totalPaidAfter: String(newTotal),
          remainingAmount: String(newRemaining),
          accountingStatus: newStatus,
          paidAmountBefore: String(totalPaid),
          payDate, paidBy
        });
        await renderInstallmentsSubgrid(updatedRec);
        if (typeof renderAll === "function") renderAll();
      }, 800);

    } catch (err) {
      msgEl.style.color = "#ef4444";
      msgEl.textContent = "⚠️ فشل الحفظ: " + (err.message || err);
    } finally {
      saveInstBtn.disabled = false;
      saveInstBtn.innerHTML = `<i class="fas fa-floppy-disk"></i> حفظ الدفعة`;
    }
  };

  wrap.appendChild(addSection);
  formArea.appendChild(wrap);
}

// =====================================================
// Contacts List (منسقون / مسوقون متعددون)
// =====================================================

/**
 * يرسم قائمة جهات الاتصال (منسقون/مسوقون) داخل النموذج
 * contacts: [{ role, name, phone }, ...]
 */
function renderContactsList(field, contacts) {
  const rows = Array.isArray(contacts) ? contacts : [];
  const rowsHtml = rows.map((c, i) => `
    <div class="contact-row" data-idx="${i}">
      <select class="contact-role" style="width:110px">
        <option value="منسق"    ${c.role === 'منسق'    ? 'selected' : ''}>منسق</option>
        <option value="مسوق"    ${c.role === 'مسوق'    ? 'selected' : ''}>مسوق</option>
        <option value="مفوض"    ${c.role === 'مفوض'    ? 'selected' : ''}>مفوض</option>
        <option value="ممثل"    ${c.role === 'ممثل'    ? 'selected' : ''}>ممثل</option>
        <option value="أخرى"    ${c.role === 'أخرى'    ? 'selected' : ''}>أخرى</option>
      </select>
      <input class="contact-name"  type="text" placeholder="الاسم"   value="${c.name  || ''}" style="flex:1" />
      <input class="contact-phone" type="tel" placeholder="الجوال"  value="${c.phone || ''}" style="width:130px;direction:ltr;text-align:left" inputmode="numeric" />
      <button type="button" class="contact-del secondary" title="حذف" style="padding:4px 10px">✕</button>
    </div>
  `).join('');

  return `
    <div class="contacts-list-wrap" id="contacts_wrap_${field.k}">
      <label>${field.label}</label>
      <div class="small" style="margin-bottom:6px">${field.hint || ''}</div>
      <div class="contacts-rows" id="contacts_rows_${field.k}" style="display:flex;flex-direction:column;gap:6px">
        ${rowsHtml}
      </div>
      <button type="button" class="contacts-add-btn secondary" 
              id="contacts_add_${field.k}"
              style="margin-top:8px;padding:5px 16px;font-size:13px">
        ＋ إضافة منسق / مسوق
      </button>
    </div>
  `;
}

/** يقرأ قيم contacts_list من DOM */
function readContactsListFromDOM(fieldKey) {
  const container = document.getElementById(`contacts_rows_${fieldKey}`);
  if (!container) return [];
  const result = [];
  container.querySelectorAll('.contact-row').forEach(row => {
    const role  = row.querySelector('.contact-role')?.value  || '';
    const name  = row.querySelector('.contact-name')?.value  || '';
    const phone = row.querySelector('.contact-phone')?.value || '';
    if (name || phone) result.push({ role, name, phone });
  });
  return result;
}

/** يربط أحداث الإضافة والحذف لقائمة جهات الاتصال */
function attachContactsListListeners(fieldKey) {
  const addBtn   = document.getElementById(`contacts_add_${fieldKey}`);
  const rowsCont = document.getElementById(`contacts_rows_${fieldKey}`);
  if (!addBtn || !rowsCont) return;

  // دالة مساعدة: تطبيق قيود الهاتف على حقل
  const applyPhoneRestrictions = (input) => { applyPhoneFieldRestrictions(input);
  };

  // تطبيق القيود على الصفوف الموجودة
  rowsCont.querySelectorAll('.contact-phone').forEach(applyPhoneRestrictions);

  // حذف صف
  rowsCont.addEventListener('click', (e) => {
    if (e.target.classList.contains('contact-del')) {
      e.target.closest('.contact-row')?.remove();
    }
  });

  // إضافة صف جديد
  addBtn.addEventListener('click', () => {
    const idx = rowsCont.querySelectorAll('.contact-row').length;
    const div = document.createElement('div');
    div.className = 'contact-row';
    div.dataset.idx = idx;
    div.innerHTML = `
      <select class="contact-role" style="width:110px">
        <option value="منسق">منسق</option>
        <option value="مسوق">مسوق</option>
        <option value="مفوض">مفوض</option>
        <option value="ممثل">ممثل</option>
        <option value="أخرى">أخرى</option>
      </select>
      <input class="contact-name"  type="text" placeholder="الاسم"  style="flex:1" />
      <input class="contact-phone" type="tel"  placeholder="الجوال" style="width:130px;direction:ltr;text-align:left" inputmode="numeric" />
      <button type="button" class="contact-del secondary" title="حذف" style="padding:4px 10px">✕</button>
    `;
    rowsCont.appendChild(div);
    // تطبيق قيود الهاتف على الصف الجديد
    applyPhoneRestrictions(div.querySelector('.contact-phone'));
    div.querySelector('.contact-name')?.focus();
  });
}

// =====================================================
// قائمة الأصناف المتعددة للمورد (items_list)
// =====================================================

/** يبني HTML لقائمة أصناف/اعتمادات متعددة */
function renderItemsList(field, items, allItemNames) {
  // إذا كانت القائمة فارغة، ابدأ بصف واحد فارغ دائماً
  const rows = (Array.isArray(items) && items.length > 0) ? items : [''];
  const dlId = "dl_items_list_" + field.k;
  const opts = allItemNames.map(n => `<option value="${n}"></option>`).join('');
  // placeholder مناسب للحقل
  const ph = field.placeholder || (field.listFrom && field.listFrom.includes('credit')
    ? 'اختر أو اكتب رقم الاعتماد...'
    : 'اختر أو اكتب...');

  const rowsHtml = rows.map((item, i) => `
    <div class="items-list-row" data-idx="${i}">
      <input class="items-list-input" type="text" list="${dlId}"
        value="${item || ''}" placeholder="${ph}" />
      <button type="button" class="items-list-del" title="حذف">✕</button>
    </div>
  `).join('');

  return `
    <div class="items-list-wrap" id="items_wrap_${field.k}">
      <label class="items-list-label">${field.label}${field.req ? ' <span class="req-star">*</span>' : ''}</label>
      <datalist id="${dlId}">${opts}</datalist>
      <div class="items-list-rows" id="items_rows_${field.k}">
        ${rowsHtml}
      </div>
      <button type="button" class="items-list-add" id="items_add_${field.k}">
        <i class="fas fa-plus"></i> ${field.addLabel || 'إضافة'}
      </button>
    </div>
  `;
}

/** يقرأ قيم items_list من DOM */
function readItemsListFromDOM(fieldKey) {
  const container = document.getElementById(`items_rows_${fieldKey}`);
  if (!container) return [];
  const result = [];
  container.querySelectorAll('.items-list-input').forEach(inp => {
    const v = inp.value.trim();
    if (v) result.push(v);
  });
  return result;
}

/** يربط أحداث الإضافة والحذف لقائمة الأصناف */
function attachItemsListListeners(fieldKey, field) {
  const addBtn   = document.getElementById(`items_add_${fieldKey}`);
  const rowsCont = document.getElementById(`items_rows_${fieldKey}`);
  if (!addBtn || !rowsCont) return;

  const dlId = "dl_items_list_" + fieldKey;

  const ph = field ? (field.placeholder || 'اختر أو اكتب...') : 'اختر أو اكتب...';

  // حذف صف — إذا بقي صف واحد فقط يُفرَّغ بدل الحذف
  rowsCont.addEventListener('click', e => {
    if (e.target.classList.contains('items-list-del')) {
      const row = e.target.closest('.items-list-row');
      const allRows = rowsCont.querySelectorAll('.items-list-row');
      if (allRows.length <= 1) {
        // أبقِ صفاً فارغاً
        const inp = row?.querySelector('.items-list-input');
        if (inp) inp.value = '';
      } else {
        row?.remove();
      }
    }
  });

  // إضافة صف جديد
  addBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'items-list-row';
    div.innerHTML = `
      <input class="items-list-input" type="text" list="${dlId}"
        placeholder="${ph}" />
      <button type="button" class="items-list-del" title="حذف">✕</button>
    `;
    rowsCont.appendChild(div);
    div.querySelector('.items-list-input')?.focus();
  });
}

// =====================================================
// التعبئة التلقائية من رقم الاعتماد في القوافل
// =====================================================
async function autoFillFromCredit() {
  const creditNoEl = $("f_creditNo");
  if (!creditNoEl) return;
  const creditNo = creditNoEl.value.trim();
  if (!creditNo) return;

  // البحث عن الاعتماد في البيانات المحلية
  const credits = loadPanelLocal("credits");
  const credit  = credits.find(c => String(c.creditNo || "").trim() === creditNo);
  if (!credit) return;

  // الحقول التي تُعبّأ تلقائياً: مفتاح الحقل في القافلة → مفتاحه في الاعتماد
  const fillMap = {
    donorName:    "donorName",
    itemName:     "itemName",
    unit:         "unit",
  };

  let filled = 0;
  for (const [convoyKey, creditKey] of Object.entries(fillMap)) {
    const el = $("f_" + convoyKey);
    if (el && credit[creditKey]) {
      if (!el.value || el.value === el.dataset.autoFilled) {
        el.value = credit[creditKey];
        el.dataset.autoFilled = credit[creditKey];
        filled++;
      }
    }
  }

  if (filled > 0) {
    showToast(`✅ تم تعبئة ${filled} حقل تلقائياً من الاعتماد رقم ${creditNo}`, "success", 3000);
  }
}

// =====================================================
// حساب إجمالي عدد القطع ووزن الحمولة تلقائياً
// إجمالي القطع = عدد الباليت × العدد في الباليت
// وزن الحمولة  = إجمالي القطع × وزن الوحدة
// =====================================================
function attachTotalQtyListener() {
  const palletEl  = $("f_palletCount");
  const qtyPerEl  = $("f_qtyPerPallet");
  const totalEl   = $("f_totalQty");
  const weightUEl = $("f_weightPerUnit");
  const loadWEl   = $("f_loadWeightKg");
  if (!palletEl || !qtyPerEl || !totalEl) return;

  const calc = () => {
    const p = parseFloat(palletEl.value) || 0;
    const q = parseFloat(qtyPerEl.value) || 0;
    const total = p && q ? p * q : 0;
    totalEl.value = total ? total.toString() : "";

    // وزن الحمولة = إجمالي القطع × وزن الوحدة
    if (loadWEl && weightUEl) {
      const w = parseFloat(weightUEl.value) || 0;
      loadWEl.value = total && w ? (total * w).toString() : "";
    }
  };

  // حفظ مرجع calc لاستخدامه من attachItemWeightAutoFill
  window._convoyCalcFn = calc;

  palletEl.addEventListener("input", calc);
  qtyPerEl.addEventListener("input", calc);
  if (weightUEl) weightUEl.addEventListener("input", calc);
  calc();
}

// =====================================================
// تعبئة بيانات السائق تلقائياً في لوحة القوافل
// عند اختيار اسم السائق → يعبّئ الرقم القومي والهاتف
// =====================================================
function attachDriverAutoFill() {
  const nameEl  = $("f_driverName");
  const idEl    = $("f_driverId");
  const phoneEl = $("f_driverPhone");
  if (!nameEl) return;

  const doFill = () => {
    const name = nameEl.value.trim();
    if (!name) return;

    const drivers = loadPanelLocal("drivers");
    const driver  = drivers.find(d =>
      String(d.driverName || "").trim() === name
    );
    if (!driver) return;

    if (idEl && (!idEl.value || idEl.dataset.autoFilled === idEl.value)) {
      idEl.value = driver.driverId || "";
      idEl.dataset.autoFilled = idEl.value;
    }
    if (phoneEl && (!phoneEl.value || phoneEl.dataset.autoFilled === phoneEl.value)) {
      phoneEl.value = driver.phone || "";
      phoneEl.dataset.autoFilled = phoneEl.value;
    }
  };

  nameEl.addEventListener("change", doFill);
  nameEl.addEventListener("input", () => {
    clearTimeout(window._driverFillTimer);
    window._driverFillTimer = setTimeout(doFill, 500);
  });
}

// =====================================================
// تعبئة تلقائية في لوحة الشاحنات
// headNo  → headOwner  + headLicense
// trailerNo → trailerOwner + trailerLicense
// tailNo  → tailOwner  + tailLicense
// كل جزء مستقل: يمكن ربط رأس بمقطورة مختلفة أو ذيل مختلف
// =====================================================
function attachTruckPartAutoFill() {
  const parts = [
    { key: "headNo",    owner: "f_headOwner",    license: "f_headLicense"    },
    { key: "trailerNo", owner: "f_trailerOwner",  license: "f_trailerLicense" },
    { key: "tailNo",    owner: "f_tailOwner",     license: "f_tailLicense"    },
  ];

  parts.forEach(({ key, owner: ownerSel, license: licenseSel }) => {
    const hiddenEl  = $(key);          // hidden input من createTruckNumberInputs
    const ownerEl   = $(ownerSel);
    const licenseEl = $(licenseSel);
    if (!hiddenEl || (!ownerEl && !licenseEl)) return;

    const doFill = () => {
      const val = (hiddenEl.value || "").trim();
      if (!val) return;

      const trucks = loadPanelLocal("trucks");

      // ابحث عن أي سجل يحتوي على هذا الرقم في الحقل المناسب
      const match = trucks.find(r => String(r[key] || "").trim() === val);
      if (!match) return;

      if (ownerEl && (!ownerEl.value || ownerEl.dataset.autoFilled === ownerEl.value)) {
        ownerEl.value = match[key.replace("No", "Owner")] || "";
        ownerEl.dataset.autoFilled = ownerEl.value;
      }
      if (licenseEl && (!licenseEl.value || licenseEl.dataset.autoFilled === licenseEl.value)) {
        licenseEl.value = match[key.replace("No", "License")] || "";
        licenseEl.dataset.autoFilled = licenseEl.value;
      }
    };

    hiddenEl.addEventListener("change", doFill);
  });
}

// =====================================================
// تعبئة بيانات السيارة تلقائياً في لوحة حركة السيارات
// عند اختيار رقم السيارة → يعبّئ: نوع السيارة + اسم المالك
// =====================================================
function attachCarNoAutoFill() {
  // رقم السيارة يُعرض كمربعات منقسمة، والحقل المخفي هو id="carNo" (بدون f_)
  const carNoEl      = $("carNo");   // hidden input from createTruckNumberInputs
  const transportEl  = $("f_transport");
  const ownerEl      = $("f_carOwnerName");
  if (!carNoEl) return;

  const doFill = () => {
    const val = (carNoEl.value || "").trim();
    if (!val) return;

    const cars = loadPanelLocal("cars");
    const car  = cars.find(c => String(c.carNo || "").trim() === val);
    if (!car) return;

    // تعبئة نوع السيارة / وسيلة النقل
    if (transportEl && (!transportEl.value || transportEl.dataset.autoFilled === transportEl.value)) {
      transportEl.value = car.carType || "";
      transportEl.dataset.autoFilled = transportEl.value;
      transportEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
    // تعبئة اسم مالك السيارة
    if (ownerEl && (!ownerEl.value || ownerEl.dataset.autoFilled === ownerEl.value)) {
      ownerEl.value = car.carOwnerName || "";
      ownerEl.dataset.autoFilled = ownerEl.value;
    }
  };

  carNoEl.addEventListener("change", doFill);
  carNoEl.addEventListener("input", () => {
    clearTimeout(window._carNoFillTimer);
    window._carNoFillTimer = setTimeout(doFill, 400);
  });
}

// =====================================================
// تعبئة وزن الوحدة تلقائياً من لوحة الأصناف
// عند اختيار الصنف → يعبّئ weightPerUnit + unit ثم يُعيد حساب وزن الحمولة
// =====================================================
function attachItemWeightAutoFill() {
  const itemEl    = $("f_itemName");
  const weightEl  = $("f_weightPerUnit");
  const unitEl    = $("f_unit");
  if (!itemEl || !weightEl) return;

  const doFill = () => {
    const name = itemEl.value.trim();
    if (!name) return;

    const items = loadPanelLocal("items");
    const item  = items.find(i => String(i.itemName || "").trim() === name);
    if (!item) return;

    // تعبئة وزن الوحدة
    if (item.weightPerUnit) {
      if (!weightEl.value || weightEl.dataset.autoFilled === weightEl.value) {
        weightEl.value = item.weightPerUnit;
        weightEl.dataset.autoFilled = item.weightPerUnit;
        if (typeof window._convoyCalcFn === "function") window._convoyCalcFn();
      }
    }

    // تعبئة الوحدة الافتراضية تلقائياً
    if (unitEl && item.defaultUnit) {
      if (!unitEl.value || unitEl.dataset.autoFilled === unitEl.value) {
        unitEl.value = item.defaultUnit;
        unitEl.dataset.autoFilled = item.defaultUnit;
      }
    }
  };

  itemEl.addEventListener("change", doFill);
  itemEl.addEventListener("input", () => {
    clearTimeout(window._itemWeightTimer);
    window._itemWeightTimer = setTimeout(doFill, 500);
  });
}

// =====================================================
// في لوحة القوافل: عند اختيار رقم الرأس → يُعبّأ رقم المقطورة تلقائياً
// يبحث في لوحة الشاحنات عن آخر سجل يحتوي على نفس رقم الرأس
// =====================================================
function attachConvoyHeadNoAutoFill() {
  // في لوحة القوافل headNo وtrailerNo يُعرَضان كمربعات (createTruckNumberInputs)
  // لذا الـ hidden input id = "headNo" و"trailerNo" (بدون f_)
  const headEl    = $("headNo");
  const trailerEl = $("trailerNo");
  if (!headEl) return;

  // دالة تعبئة مربعات المقطورة من قيمة نصية
  const fillTrailerBoxes = (val) => {
    if (!val) return;
    const arabic  = (val.match(/[\u0600-\u06FF]+/g) || []).join('');
    const english = (val.match(/[0-9]+/g) || []).join('');
    // عبّئ مربعات الحروف
    for (let i = 0; i < 4; i++) {
      const box = $("trailerNo_arabic_" + i);
      if (box) box.value = arabic[i] || '';
    }
    // عبّئ مربعات الأرقام
    for (let i = 0; i < 4; i++) {
      const box = $("trailerNo_english_" + i);
      if (box) box.value = english[i] || '';
    }
    // حدّث الـ hidden input
    if (trailerEl) {
      trailerEl.value = arabic + (english ? ' ' + english : '');
      trailerEl.dataset.autoFilled = trailerEl.value;
    }
  };

  const doFill = () => {
    const val = (headEl.value || "").trim();
    if (!val) return;

    const trucks = loadPanelLocal("trucks");
    // ابحث عن آخر سجل في لوحة الشاحنات يطابق رقم الرأس
    const match = [...trucks].reverse().find(r => String(r.headNo || "").trim() === val);
    if (!match || !match.trailerNo) return;

    // عبّئ فقط إن كان فارغاً أو مُعبّأ تلقائياً من قبل
    const currentVal = trailerEl ? (trailerEl.value || "").trim() : "";
    if (!currentVal || (trailerEl && trailerEl.dataset.autoFilled === currentVal)) {
      fillTrailerBoxes(match.trailerNo);
    }
  };

  // استمع لتغيير headNo hidden input (يُطلَق من fillBoxes في utils.js)
  headEl.addEventListener("change", doFill);
}

// =====================================================
// POPUP اختيار السيارة — يفتح عند تغيير نوع السيارة
// يعرض السيارات المتاحة من نفس النوع مع تفاصيلها
// =====================================================
function attachCarTypePopup() {
  const transportEl = $("f_transport");
  if (!transportEl) return;

  transportEl.addEventListener("change", () => {
    const selectedType = (transportEl.value || "").trim();
    // تجاهل الفواصل
    if (!selectedType || selectedType.startsWith("──")) return;
    openCarPickerPopup(selectedType);
  });
}

function openCarPickerPopup(filterType) {
  // احذف popup قديم إن وجد
  const oldPopup = document.getElementById("carPickerPopup");
  if (oldPopup) oldPopup.remove();

  const allCars = loadPanelLocal("cars");
  // فلتر بالنوع إذا وُجد، وإلا اعرض الكل
  let filtered = filterType
    ? allCars.filter(c => String(c.carType || "").trim() === filterType)
    : allCars;

  // للباصات: يمكن استخدام شركة النقل كمعرّف أساسي
  const isBusType = /باص|أتوبيس|ميني|ميكرو/i.test(filterType || "");
  const companies = isBusType
    ? [...new Set(allCars.map(c => (c.carOwnerName || c.ownerCompany || "").trim()).filter(Boolean))].sort()
    : [];

  function buildCarRows(cars) {
    if (!cars.length) {
      return `<tr><td colspan="6" style="text-align:center;padding:1rem;color:var(--text-muted)">
               لا توجد سيارات من هذا النوع — أضفها في لوحة السيارات أولاً
             </td></tr>`;
    }
    return cars.map(c => `
      <tr class="car-picker-row" data-carno="${c.carNo || ''}" data-cartype="${c.carType || ''}"
          data-owner="${c.carOwnerName || ''}" data-drivername="${c.driverName || ''}" data-driverphone="${c.driverPhone || ''}">
        <td>${c.carNo || '—'}</td>
        <td>${c.carType || '—'}</td>
        <td>${c.carModel || '—'}</td>
        <td>${c.carOwnerName || '—'}</td>
        <td><button type="button" class="car-pick-btn btn-sm btn-primary">اختيار</button></td>
      </tr>`).join('');
  }

  const companyFilterHtml = isBusType && companies.length > 0 ? `
    <select id="carCompanyFilter"
      style="padding:5px 10px;border-radius:8px;border:1px solid var(--border,#ccc);font-size:.85rem;direction:rtl">
      <option value="">كل الشركات</option>
      ${companies.map(c => `<option value="${c}">${c}</option>`).join('')}
    </select>` : '';

  const popup = document.createElement("div");
  popup.id = "carPickerPopup";
  popup.innerHTML = `
    <div class="car-picker-overlay" id="carPickerOverlay"></div>
    <div class="car-picker-modal" dir="rtl">
      <div class="car-picker-header">
        <span class="car-picker-title">
          <i class="fas fa-car"></i>
          اختر السيارة — ${filterType || 'جميع السيارات'}
        </span>
        <button type="button" class="car-picker-close" id="carPickerClose">✕</button>
      </div>
      <div class="car-picker-body">
        <div style="display:flex;gap:.5rem;margin-bottom:.6rem;align-items:center;flex-wrap:wrap;">
          <input type="text" id="carSearchInput" placeholder="🔍 بحث برقم السيارة أو المالك..."
            style="flex:1;min-width:150px;padding:5px 10px;border-radius:8px;border:1px solid var(--border,#ccc);font-size:.85rem;direction:rtl">
          ${companyFilterHtml}
        </div>
        <div style="margin-bottom:.5rem;font-size:.8rem;color:var(--text-muted)" id="carCountLabel">
          ${filtered.length} سيارة متاحة
        </div>
        <div style="overflow-x:hidden;overflow-y:auto;max-height:300px">
          <table class="car-picker-table" style="width:100%;min-width:0">
            <thead>
              <tr>
                <th>رقم السيارة</th>
                <th>النوع</th>
                <th>الموديل</th>
                <th>المالك / الشركة</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="carPickerTbody">${buildCarRows(filtered)}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  function filterCars() {
    const searchVal   = ((document.getElementById("carSearchInput")    || {}).value || "").trim().toLowerCase();
    const companyVal  = ((document.getElementById("carCompanyFilter")  || {}).value || "").trim();
    let result = filterType ? allCars.filter(c => String(c.carType || "").trim() === filterType) : allCars;
    if (searchVal)  result = result.filter(c =>
      (c.carNo || "").toLowerCase().includes(searchVal) ||
      (c.carOwnerName || "").toLowerCase().includes(searchVal));
    if (companyVal) result = result.filter(c =>
      (c.carOwnerName || c.ownerCompany || "").trim() === companyVal);
    const tbody = document.getElementById("carPickerTbody");
    const label = document.getElementById("carCountLabel");
    if (tbody) tbody.innerHTML = buildCarRows(result);
    if (label) label.textContent = result.length + " سيارة";
    attachCarPickBtnListeners();
  }

  function attachCarPickBtnListeners() {
    const tbody = document.getElementById("carPickerTbody");
    if (!tbody) return;
    tbody.querySelectorAll(".car-pick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const row    = btn.closest(".car-picker-row");
        const carNo  = row.dataset.carno;
        const carType= row.dataset.cartype;
        const owner  = row.dataset.owner;
        const drName = row.dataset.drivername;
        const drPhone= row.dataset.driverphone;

        // عبّئ حقول السيارة
        // رقم السيارة: الحقل المخفي يحمل id="carNo" وليس "f_carNo"
        const carNoHidden = $("carNo");      // hidden input in truck-number widget
        const carNoSearch = $("carNo_search"); // search box in truck-number widget
        const transEl   = $("f_transport");
        const ownerEl   = $("f_carOwnerName");

        if (carNoHidden) { carNoHidden.value = carNo; carNoHidden.dataset.autoFilled = carNo; }
        if (carNoSearch) { carNoSearch.value = carNo; }
        // fill arabic/english split boxes too
        if (carNo) {
          const arabicPart = (carNo.match(/[\u0600-\u06FF]+/g) || []).join('');
          const englishPart = (carNo.match(/[0-9]+/g) || []).join('');
          for (let i = 0; i < 4; i++) {
            const aEl = $("carNo_arabic_" + i);
            if (aEl) aEl.value = arabicPart[i] || '';
            const eEl = $("carNo_english_" + i);
            if (eEl) eEl.value = englishPart[i] || '';
          }
        }
        if (transEl)  { transEl.value  = carType; transEl.dataset.autoFilled = carType; }
        if (ownerEl)  { ownerEl.value  = owner;   ownerEl.dataset.autoFilled = owner; }

        // للباصات: عبّئ شركة النقل تلقائياً من المالك
        const isBusSelected = /باص|أتوبيس|ميني|ميكرو/i.test(carType || "");
        if (isBusSelected && owner) {
          const tcEl = $("f_tourismCompany");
          if (tcEl && (!tcEl.value || tcEl.dataset.autoFilled === tcEl.value)) {
            tcEl.value = owner;
            tcEl.dataset.autoFilled = owner;
          }
        }

        // أطلق حدث change على transport لتحديث الأسعار تلقائياً
        if (transEl) transEl.dispatchEvent(new Event("change", { bubbles: true }));

        popup.remove();

        // افتح popup اختيار السائق بعد اختيار السيارة
        openDriverPickerPopup(drName, drPhone, carType);
      });
    });
  }

  // ربط أحداث البحث والفلتر
  const searchInput   = document.getElementById("carSearchInput");
  const companyFilter = document.getElementById("carCompanyFilter");
  if (searchInput)   searchInput.addEventListener("input", filterCars);
  if (companyFilter) companyFilter.addEventListener("change", filterCars);

  // أحداث الإغلاق
  document.getElementById("carPickerClose").addEventListener("click", () => popup.remove());
  document.getElementById("carPickerOverlay").addEventListener("click", () => popup.remove());

  // تفعيل أزرار الاختيار
  attachCarPickBtnListeners();
}

// =====================================================
// POPUP اختيار السائق — يفتح بعد اختيار السيارة
// يعرض السائقين مع تحديد: سائق 1 / 2 / 3
// =====================================================
function openDriverPickerPopup(defaultDriverName, defaultDriverPhone, carType) {
  const oldPopup = document.getElementById("driverPickerPopup");
  if (oldPopup) oldPopup.remove();

  const allDrivers = loadPanelLocal("drivers");

  // تحديد عدد خانات السائقين: سائق واحد فقط للسيارة
  const driverSlots = 1;

  // جمع مناطق الإقامة الفريدة للفلتر
  const areas = [...new Set(
    allDrivers.map(d => (d.residenceArea || "").trim()).filter(Boolean)
  )].sort();

  // لوحة حركة السيارات: اجلب شركة النقل المختارة للباصات
  const tourismCompanyEl = $("f_tourismCompany");
  const selectedCompany = (tourismCompanyEl && tourismCompanyEl.value) ? tourismCompanyEl.value.trim() : "";

  // دالة بناء صفوف الجدول
  function buildRows(drivers) {
    if (!drivers.length) {
      return `<tr><td colspan="5" style="text-align:center;padding:1rem;color:var(--text-muted)">
               لا يوجد سائقون — أضفهم في لوحة السائقين أولاً
             </td></tr>`;
    }
    return drivers.map(d => `
      <tr class="driver-picker-row"
          data-name="${d.driverName || ''}"
          data-phone="${d.phone || d.driverPhone || ''}"
          data-id="${d.driverId || ''}"
          data-area="${d.residenceArea || ''}">
        <td>${d.driverName || '—'}</td>
        <td>${d.phone || d.driverPhone || '—'}</td>
        <td>${d.driverId || '—'}</td>
        <td style="color:var(--text-muted);font-size:.8rem">${d.residenceArea || '—'}</td>
        <td>
          <button type="button" class="driver-pick-btn btn-sm btn-primary" data-slot="1">اختيار</button>
        </td>
      </tr>`).join('');
  }

  const areaOptions = areas.map(a => `<option value="${a}">${a}</option>`).join('');

  const popup = document.createElement("div");
  popup.id = "driverPickerPopup";
  popup.innerHTML = `
    <div class="car-picker-overlay" id="driverPickerOverlay"></div>
    <div class="car-picker-modal" dir="rtl">
      <div class="car-picker-header">
        <span class="car-picker-title">
          <i class="fas fa-id-badge"></i>
          اختر السائق
          ${selectedCompany ? `<span style="font-size:.75rem;background:var(--primary-alpha,rgba(34,197,94,.15));padding:2px 8px;border-radius:12px;margin-right:6px">${selectedCompany}</span>` : ''}
        </span>
        <button type="button" class="car-picker-close" id="driverPickerClose">✕</button>
      </div>
      <div class="car-picker-body">
        <div style="display:flex;gap:.5rem;margin-bottom:.6rem;align-items:center;flex-wrap:wrap;">
          <input type="text" id="driverSearchInput" placeholder="🔍 بحث باسم السائق..."
            style="flex:1;min-width:150px;padding:5px 10px;border-radius:8px;border:1px solid var(--border,#ccc);font-size:.85rem;direction:rtl">
          ${areas.length > 0 ? `
          <select id="driverAreaFilter"
            style="padding:5px 10px;border-radius:8px;border:1px solid var(--border,#ccc);font-size:.85rem;direction:rtl">
            <option value="">كل المناطق</option>
            ${areaOptions}
          </select>` : ''}
        </div>
        <div style="margin-bottom:.5rem;font-size:.8rem;color:var(--text-muted)" id="driverCountLabel">
          ${allDrivers.length} سائق متاح
        </div>
        <div style="overflow-x:hidden;overflow-y:auto;max-height:300px">
          <table class="car-picker-table" style="width:100%;min-width:0">
            <thead>
              <tr>
                <th>اسم السائق</th>
                <th>الجوال</th>
                <th>الرقم القومي</th>
                <th>منطقة الإقامة</th>
                <th>تعيين كـ</th>
              </tr>
            </thead>
            <tbody id="driverPickerTbody">${buildRows(allDrivers)}</tbody>
          </table>
        </div>
        <div style="margin-top:.75rem;padding:.5rem;background:var(--surface2,rgba(255,255,255,.05));border-radius:8px;font-size:.82rem;">
          <strong>المختارون:</strong>
          <span id="selectedDriversSummary" style="color:var(--text-muted)">لم يُختر بعد</span>
        </div>
        <div style="text-align:center;margin-top:.75rem">
          <button type="button" id="confirmDriversBtn" class="btn-primary" style="padding:8px 24px;border-radius:8px;border:none;cursor:pointer;font-size:.95rem;">
            <i class="fas fa-check"></i> تأكيد الاختيار
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // قاموس الاختيارات: slot → {name, phone}
  const chosen = {};
  // إذا كان هناك سائق معتاد من السيارة، اقترحه تلقائياً
  if (defaultDriverName) {
    chosen[1] = { name: defaultDriverName, phone: defaultDriverPhone || "" };
    updateSummary();
  }

  function updateSummary() {
    const parts = Object.entries(chosen).map(([slot, d]) =>
      `سائق ${slot}: <strong>${d.name}</strong>`);
    const el = document.getElementById("selectedDriversSummary");
    if (el) el.innerHTML = parts.length ? parts.join(" | ") : "لم يُختر بعد";
  }

  // دالة فلترة ديناميكية
  function filterDrivers() {
    const searchVal = ((document.getElementById("driverSearchInput") || {}).value || "").trim().toLowerCase();
    const areaVal   = ((document.getElementById("driverAreaFilter")  || {}).value || "").trim();
    let filtered = allDrivers;
    if (searchVal) filtered = filtered.filter(d => (d.driverName || "").toLowerCase().includes(searchVal));
    if (areaVal)   filtered = filtered.filter(d => (d.residenceArea || "").trim() === areaVal);
    const tbody = document.getElementById("driverPickerTbody");
    const label = document.getElementById("driverCountLabel");
    if (tbody) tbody.innerHTML = buildRows(filtered);
    if (label) label.textContent = filtered.length + " سائق";
    attachPickBtnListeners();
  }

  function attachPickBtnListeners() {
    const tbody = document.getElementById("driverPickerTbody");
    if (!tbody) return;
    tbody.querySelectorAll(".driver-pick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const row   = btn.closest(".driver-picker-row");
        const slot  = parseInt(btn.dataset.slot);
        chosen[slot] = {
          name:  row.dataset.name,
          phone: row.dataset.phone
        };
        updateSummary();
        // تمييز الصف
        tbody.querySelectorAll(".driver-picker-row").forEach(r => {
          r.style.background = "";
          r.querySelectorAll(".driver-pick-btn").forEach(b => b.style.outline = "");
        });
        row.style.background = "var(--primary-alpha, rgba(34,197,94,.12))";
        btn.style.outline = "2px solid var(--primary, #22c55e)";
      });
    });
  }

  // ربط أحداث البحث والفلتر
  const searchInput = document.getElementById("driverSearchInput");
  const areaFilter  = document.getElementById("driverAreaFilter");
  if (searchInput) searchInput.addEventListener("input", filterDrivers);
  if (areaFilter)  areaFilter.addEventListener("change", filterDrivers);

  // أحداث الإغلاق
  document.getElementById("driverPickerClose").addEventListener("click", () => popup.remove());
  document.getElementById("driverPickerOverlay").addEventListener("click", () => popup.remove());

  // تأكيد — سائق واحد فقط للسيارة
  document.getElementById("confirmDriversBtn").addEventListener("click", () => {
    // سائق 1 فقط
    if (chosen[1]) {
      const n1 = $("f_driverName");  const p1 = $("f_driverPhone");
      if (n1) { n1.value = chosen[1].name;  n1.dataset.autoFilled = chosen[1].name; }
      if (p1) { p1.value = chosen[1].phone; p1.dataset.autoFilled = chosen[1].phone; }
      // أطلق أحداث change لتحديث القيد
      if (n1) n1.dispatchEvent(new Event("change", { bubbles: true }));
    }
    popup.remove();
  });

  // تفعيل أزرار الاختيار للصفوف الأولى
  attachPickBtnListeners();
}

// =====================================================
// تعبئة جوال السائق تلقائياً (سائق واحد فقط)
// =====================================================
function attachMultiDriverAutoFill() {
  // السائق الأول فقط
  attachDriverAutoFill();
}

function _attachSingleDriverFill(nameId, phoneId) {
  const nameEl  = $(nameId);
  const phoneEl = $(phoneId);
  if (!nameEl || !phoneEl) return;

  const doFill = () => {
    const name = (nameEl.value || "").trim();
    if (!name) return;
    const drivers = loadPanelLocal("drivers");
    const dr = drivers.find(d => String(d.driverName || "").trim() === name);
    if (!dr) return;
    if (!phoneEl.value || phoneEl.dataset.autoFilled === phoneEl.value) {
      phoneEl.value = dr.phone || dr.driverPhone || "";
      phoneEl.dataset.autoFilled = phoneEl.value;
    }
  };

  nameEl.addEventListener("change", doFill);
  nameEl.addEventListener("input", () => {
    clearTimeout(nameEl._fillTimer);
    nameEl._fillTimer = setTimeout(doFill, 400);
  });
}

// =====================================================
// جهة الاستفادة: إظهار/إخفاء الحقول الشرطية
// إداري → يظهر اسم الجهة فقط
// مشروع → يظهر رقم الاعتماد + الوفد + المانح
// =====================================================
function attachBeneficiaryConditional() {
  const benefEl = $("f_beneficiary");
  if (!benefEl) return;

  // الحقول التي تظهر فقط عند اختيار "مشروع"
  const projectFields = ["delegation", "creditNo"];

  function getWrap(fieldKey) {
    const el = $("f_" + fieldKey);
    if (!el) return null;
    // البحث عن أقرب أب مباشر (div wrapper من حلقة renderForm)
    return el.parentElement;
  }

  function toggleFields() {
    const val = (benefEl.value || "").trim();
    const isProject = val === "مشروع";

    // حقول المشروع فقط: اعرضها عند المشروع، أخفها عند الإداري أو بدون اختيار
    projectFields.forEach(fk => {
      const wrap = getWrap(fk);
      if (!wrap) return;
      wrap.style.display = isProject ? "" : "none";
      if (!isProject) {
        const el = $("f_" + fk);
        if (el) el.value = "";
      }
    });

    // حقل اسم جهة الاستفادة يظهر دائماً (لا يُخفى أبداً)
    // لا حاجة لإخفائه
  }

  // إخفاء حقول المشروع عند التحميل الأول (قبل أي اختيار)
  projectFields.forEach(fk => {
    const wrap = getWrap(fk);
    if (wrap) wrap.style.display = "none";
  });

  // ربط حدث التغيير
  benefEl.addEventListener("change", toggleFields);

  // تشغيل عند التحميل إذا كانت هناك قيمة محفوظة
  if (benefEl.value) toggleFields();

  // تعبئة المانح والوفد تلقائياً من رقم الاعتماد
  const creditEl = $("f_creditNo");
  if (creditEl) {
    const doAutoFill = () => {
      const creditNo = (creditEl.value || "").trim();
      if (!creditNo) return;
      const credits = loadPanelLocal("credits");
      const cr = credits.find(c => (c.creditNo || "").trim() === creditNo);
      if (!cr) return;
      const creditNo2El = $("f_creditNo2");
      if (creditNo2El && !creditNo2El.value) creditNo2El.value = cr.creditNo || "";
      const delegEl = $("f_delegation");
      if (delegEl && !delegEl.value) delegEl.value = cr.assocMain || cr.donorName || "";
    };
    creditEl.addEventListener("change", doAutoFill);
    creditEl.addEventListener("input", () => {
      clearTimeout(creditEl._benefFillTimer);
      creditEl._benefFillTimer = setTimeout(doAutoFill, 500);
    });
  }
}
