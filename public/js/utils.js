// =====================================================
// Utility Functions
// =====================================================

const $ = (id) => document.getElementById(id);

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * تحويل التاريخ من YYYY-MM-DD إلى DD/MM/YYYY للعرض
 * يقبل أيضاً DD/MM/YYYY بدون تغيير
 */
function formatDate(val) {
  if (!val || !String(val).trim()) return "";
  const s = String(val).trim();
  // YYYY-MM-DD
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m1) return `${m1[3]}/${m1[2]}/${m1[1]}`;
  // DD/MM/YYYY already
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  return s;
}


// ---- Auto serial & short code (Local) ----
function genShortCode(panelKey, seq) {
  const p = String(panelKey || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "X";
  const s = String(Number(seq || 0).toString(36)).toUpperCase();
  return p + s.padStart(4, "0"); // مثال: DR0001 (base36)
}

function toIntSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}


function toNum(v) {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return "id_" + Math.random().toString(16).slice(2);
  }
}

function parseListFrom(str) {
  if (!str) return null;
  const [p, f] = str.split(".");
  if (!p || !f) return null;
  return { p, f };
}

function buildDatalist(id, values) {
  const dl = document.createElement("datalist");
  dl.id = id;
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    dl.appendChild(opt);
  });
  return dl;
}

function colLabel(k) {
  const map = {
    id: "ID",
    seq: "رقم تسلسلي",
    code: "كود",
    name: "الاسم",
    nameEn: "الاسم (إنجليزي)",
    country: "الدولة",
    phone: "جوال/هاتف",
    notes: "ملاحظات",
    beneficiaryNameAr: "اسم المستفيد (عربي)",
    beneficiaryName: "اسم المستفيد",
    beneficiaryAddr: "عنوان المستفيد",
    iban:            "الآيبان",
    accountNo:       "رقم الحساب (USD)",
    bankName:        "اسم البنك",
    swiftCode:       "رمز السويفت",
    branchAddress:   "عنوان فرع البنك",
    movementNo:        "رقم الحركة",
    movementNos:       "رقم الحركة / الحركات",
    entryType:         "نوع القيد",
    accountingStatus:  "حالة التحاسب",
    payDay:            "يوم الدفع",
    payMonth:          "شهر الدفع",
    payYear:           "سنة الدفع",
    payDateFull:       "تاريخ الدفع",
    driverName: "اسم السائق",
    transport:  "نوع السيارة",
    accountingParty:   "جهة التحاسب",
    recordCount:       "عدد السجلات",
    totalAmount:       "الإجمالي الكلي",
    totalPaid:         "إجمالي المدفوع",
    totalRemaining:    "إجمالي المتبقي",
    mergedStatement:   "القيد المدمج",
    // صندوق دفع حركات السيارات
    paymentType:       "نوع الدفع",
    paidBy:            "الدافع",
    referenceNo:       "رقم المرجع / الإيصال",
    activityDate:      "تاريخ النشاط",
    paidAmountBefore:  "المدفوع سابقاً",
    paidAmount:        "مبلغ الدفعة",
    totalPaidAfter:    "إجمالي المدفوع",
    remainingAmount:   "المتبقي",
    // ── لوحة ثوابت أجور الشاحنات ──────────────────────────────────
    truckType:         "نوع الشاحنة",
    transportType:     "نوع النقل",
    destination:       "الوجهة / المدينة",
    naulonRate:        "النولون (الثابت)",
    naulon:            "النولون",
    driverExpenses:    "مصاريف السائق",
    scaleExpenses:     "مصاريف الميزان",
    otherExpenses:     "مصاريف أخرى",
    // ── لوحة احتساب القوافل ────────────────────────────────────────
    convoyBillingNo:   "رقم الاحتساب",
    convoyNo:          "رقم القافلة",
    convoyDate:        "تاريخ القافلة",
    headNo:            "رقم الرأس",
    truckAccountingParty: "جهة التحاسب (شاحنة)",
    subtotal:          "المجموع الفرعي",
    extraAmountNote:   "ملاحظة الإضافي",
    discountNote:      "ملاحظة الخصم",
    driverId: "رقم الهوية",
    license: "الرخصة",
    driverType: "تصنيف السائق",
    affiliatedTo: "تابع لـ",
    idFrontImg: "صورة الهوية (الوجه)",
    idBackImg: "صورة الهوية (الظهر)",
    // الشاحنات
    ownership: "تبعية الشاحنة/السيارة",
    ownerCompany: "الشركة/المقاول المالك",
    headNo: "الرأس",
    headOwner: "مالك الرأس",
    headLicense: "رخصة الرأس",
    trailerNo: "المقطورة",
    trailerOwner: "مالك المقطورة",
    trailerLicense: "رخصة المقطورة",
    tailNo: "الذيل",
    tailOwner: "مالك الذيل",
    tailLicense: "رخصة الذيل",
    truckType: "نوع الشاحنة",
    truckModel: "موديل الشاحنة",
    carNo: "رقم السيارة",
    carType: "نوع السيارة",
    carModel: "موديل السيارة",
    carOwnerName: "اسم مالك السيارة",
    carOwnerPhone: "رقم هاتف مالك السيارة",
    driverPhone: "جوال السائق",
    // شركات النقل (contractors)
    companyName: "اسم الشركة",
    companyRegNo: "رقم الشركة",
    ownerName: "اسم المالك",
    ownerPhone: "رقم هاتف المالك",
    companyPhone: "رقم هاتف الشركة",
    delegateName: "اسم المفوض",
    delegatePhone: "رقم المفوض",
    address: "العنوان",
    service: "الخدمة",
    // الجمعيات
    main: "الجمعية الرئيسي",
    sub: "الجمعية الفرعي",
    contact: "تواصل",
    location: "الموقع",
    manager: "المسؤول",
    capacity: "السعة",
    category: "التصنيف",
    // الاعتمادات
    contacts: "المنسقون والمسوقون",
    creditNo: "رقم الاعتماد",
    date: "التاريخ",
    projectName: "اسم المشروع",
    subProjectName: "اسم المشروع الفرعي",
    projectLocation: "مكان استفادة المشروع",
    unitPrice: "السعر الفردي",
    expenses: "المصاريف",
    totalPrice: "السعر الإجمالي / بعد المصاريف",
    donorName: "المانح",
    assocMain: "الجمعية",
    // القوافل
    convoyNo: "رقم القافلة",
    warehouse: "المخزن",
    contractor: "شركة النقل/المقاول",
    supervisor: "المشرف",
    executor: "المنفذ",
    palletCount: "عدد الباليت في الشاحنة",
    qtyPerPallet: "العدد في الباليت",
    totalQty: "إجمالي عدد القطع",
    loadWeightKg: "وزن الحمولة (كيلو)",
    arrivalDate: "تاريخ الوصول",
    loadDate: "تاريخ التحميل",
    departureDate: "تاريخ الانطلاق",
    actualEntryDate: "تاريخ الدخول الفعلي",
    unloadDate: "تاريخ التنزيل",
    loadLocation: "مكان التحميل",
    banner: "البنر",
    mediaLink: "رابط الإعلاميات",
    allocation: "التخصيص",
    // الأصناف
    itemName: "اسم الصنف",
    itemCategory: "تصنيف الصنف",
    itemSpec: "مواصفات الصنف",
    defaultUnit: "الوحدة الافتراضية",
    weightPerUnit: "وزن الوحدة",
    calcDate: "تاريخ الاحتساب",
    days: "الأيام",
    amount: "المبلغ",
    palletsIn: "وارد",
    palletsOut: "صادر",
    unit: "الوحدة",
    qty: "الكمية",
    totalWeight: "إجمالي الوزن",
    payDate: "تاريخ الدفع",
    statement: "البيان النصي",
    expenseType: "نوع المصروف",
  };
  return map[k] || k;
}

// Toast Notification System
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : 
               type === 'error' ? 'fa-circle-xmark' : 
               type === 'warning' ? 'fa-triangle-exclamation' : 'fa-info-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);
  
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const themeText = document.getElementById('themeText');
  const themeIcon = document.querySelector('#themeToggle i');
  
  if (themeText && themeIcon) {
    if (theme === 'light') {
      themeText.textContent = 'الوضع النهاري';
      themeIcon.className = 'fas fa-sun';
    } else {
      themeText.textContent = 'الوضع الليلي';
      themeIcon.className = 'fas fa-moon';
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(`تم التبديل إلى ${newTheme === 'light' ? 'الوضع النهاري' : 'الوضع الليلي'} ✨`, 'success');
}
// =====================================================
// Truck Number Validation Functions
// =====================================================

/**
 * Validates truck number format:
 * - Part 1 (Arabic letters): Maximum 4 Arabic characters
 * - Part 2 (English numbers): Maximum 4 English digits
 */
function validateTruckNumber(value, fieldKey) {
  if (!value || value.trim() === "") return true; // Allow empty (if not required)
  
  const trimmed = value.trim();
  
  // Split into Arabic and English parts
  const arabicPart = trimmed.match(/[\u0600-\u06FF]+/g)?.join('') || '';
  const englishPart = trimmed.match(/[0-9]+/g)?.join('') || '';
  
  // Check Arabic part (max 4 characters)
  if (arabicPart.length > 4) {
    return { valid: false, message: `الحروف العربية يجب ألا تتجاوز 4 أحرف (حالياً: ${arabicPart.length})` };
  }
  
  // Check English numbers (max 4 digits)
  if (englishPart.length > 4) {
    return { valid: false, message: `الأرقام الإنجليزية يجب ألا تتجاوز 4 أرقام (حالياً: ${englishPart.length})` };
  }
  
  return true;
}

/**
 * Formats truck number input in real-time
 * Restricts to 4 Arabic letters + 4 English digits
 */
function formatTruckNumberInput(input) {
  let value = input.value;
  
  // Extract Arabic letters and English numbers only
  const arabicLetters = value.match(/[\u0600-\u06FF]/g) || [];
  const englishNumbers = value.match(/[0-9]/g) || [];
  
  // Limit to 4 characters each
  const limitedArabic = arabicLetters.slice(0, 4).join('');
  const limitedEnglish = englishNumbers.slice(0, 4).join('');
  
  // Combine: Arabic first, then numbers
  input.value = limitedArabic + (limitedEnglish ? ' ' + limitedEnglish : '');
}

/**
 * Splits truck number into individual character boxes
 * Creates 4 boxes for Arabic letters + 4 boxes for English digits
 */
function createTruckNumberInputs(fieldKey, fieldLabel, currentValue = '', isRequired = false) {
  // Split existing value
  const arabicPart = (currentValue.match(/[\u0600-\u06FF]+/g) || []).join('');
  const englishPart = (currentValue.match(/[0-9]+/g) || []).join('');
  
  const reqStar = isRequired ? '<span class="req-star">*</span>' : '';
  
  // Create 4 individual boxes for Arabic letters
  let arabicBoxes = '';
  for (let i = 0; i < 4; i++) {
    const char = arabicPart[i] || '';
    arabicBoxes += `
      <input 
        type="text" 
        id="${fieldKey}_arabic_${i}"
        class="truck-char-input arabic-char-input"
        maxlength="1"
        value="${char}"
        pattern="[\u0600-\u06FF]?"
        title="حرف عربي واحد"
        data-index="${i}"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
    `;
  }
  
  // Create 4 individual boxes for English digits
  let englishBoxes = '';
  for (let i = 0; i < 4; i++) {
    const digit = englishPart[i] || '';
    englishBoxes += `
      <input 
        type="text" 
        id="${fieldKey}_english_${i}"
        class="truck-char-input english-char-input"
        maxlength="1"
        value="${digit}"
        pattern="[0-9]?"
        inputmode="numeric"
        title="رقم إنجليزي واحد"
        data-index="${i}"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
    `;
  }
  
  return `
    <div class="truck-number-group" data-field="${fieldKey}">
      <label>${fieldLabel} ${reqStar}</label>
      <div class="truck-number-container">
        <div class="truck-input-section">
          <div class="truck-char-boxes">${arabicBoxes}</div>
          <span class="input-hint">حروف عربية</span>
        </div>
        <div class="truck-input-section">
          <div class="truck-char-boxes">${englishBoxes}</div>
          <span class="input-hint">أرقام إنجليزية</span>
        </div>
      </div>
      <div class="truck-search-wrap">
        <input type="text" id="${fieldKey}_search" class="truck-search-input"
          placeholder="🔍 بحث سريع..." autocomplete="off" dir="ltr" />
        <div class="truck-suggestions" id="${fieldKey}_suggestions" style="display:none"></div>
      </div>
      <input type="hidden" id="${fieldKey}" name="${fieldKey}" value="${currentValue}" />
    </div>
  `;
}

/**
 * Attaches event listeners to individual character input boxes
 * تدفق الإدخال: الحروف العربية (arabic 0→3) ثم الأرقام (english 0→3)
 * Enter ينتقل للمربع التالي، Backspace (فارغ) يرجع للسابق
 */
function attachTruckNumberListeners(fieldKey) {
  const hiddenInput = $(fieldKey);
  if (!hiddenInput) return;

  // ترتيب التنقل: الحروف العربية أولاً ثم الأرقام
  const arabicInputs = [];
  for (let i = 0; i < 4; i++) {
    const inp = $(`${fieldKey}_arabic_${i}`);
    if (inp) arabicInputs.push(inp);
  }
  const englishInputs = [];
  for (let i = 0; i < 4; i++) {
    const inp = $(`${fieldKey}_english_${i}`);
    if (inp) englishInputs.push(inp);
  }

  // قائمة مرتبة: حروف [0..3] ثم أرقام [4..7] — الحروف أولاً
  const allInputs = [...arabicInputs, ...englishInputs];

  // تطبيق has-value على المربعات المملوءة مسبقاً
  allInputs.forEach(inp => {
    inp.classList.toggle('has-value', inp.value.trim() !== '');
  });

  // Update hidden field with combined value
  const updateHidden = () => {
    const arabic  = arabicInputs.map(inp => inp.value).join('').trim();
    const english = englishInputs.map(inp => inp.value).join('').trim();
    hiddenInput.value = arabic + (english ? ' ' + english : '');
    // تحديث class has-value لكل مربع
    allInputs.forEach(inp => {
      inp.classList.toggle('has-value', inp.value.trim() !== '');
    });
    // أطلق change مؤجلاً لتفعيل التعبئة التلقائية
    clearTimeout(hiddenInput._changeTimer);
    hiddenInput._changeTimer = setTimeout(() => {
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    }, 400);
  };

  // دالة مساعدة: انتقل للمدخل التالي في القائمة المرتبة
  const focusNext = (currentInput) => {
    const idx = allInputs.indexOf(currentInput);
    if (idx !== -1 && idx < allInputs.length - 1) {
      allInputs[idx + 1].focus();
    }
  };

  // دالة مساعدة: انتقل للمدخل السابق في القائمة المرتبة
  const focusPrev = (currentInput) => {
    const idx = allInputs.indexOf(currentInput);
    if (idx > 0) {
      allInputs[idx - 1].focus();
    }
  };

  // --- مستمعات الأرقام ---
  englishInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      const filtered = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = filtered.slice(0, 1);
      if (filtered.length === 1) focusNext(input);
      updateHidden();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'ArrowLeft') {
        e.preventDefault();
        focusNext(input);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusPrev(input);
      } else if (e.key === 'Backspace' && e.target.value === '') {
        e.preventDefault();
        focusPrev(input);
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste   = (e.clipboardData || window.clipboardData).getData('text');
      const digits  = paste.replace(/[^0-9]/g, '');
      const startIdx = englishInputs.indexOf(input);
      for (let i = 0; i < Math.min(digits.length, englishInputs.length - startIdx); i++) {
        if (englishInputs[startIdx + i]) englishInputs[startIdx + i].value = digits[i];
      }
      updateHidden();
    });
  });

  // --- مستمعات الحروف العربية ---
  arabicInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      const filtered = e.target.value.replace(/[^\u0600-\u06FF]/g, '');
      e.target.value = filtered.slice(0, 1);
      if (filtered.length === 1) focusNext(input);
      updateHidden();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'ArrowLeft') {
        e.preventDefault();
        focusNext(input);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        focusPrev(input);
      } else if (e.key === 'Backspace' && e.target.value === '') {
        e.preventDefault();
        focusPrev(input);
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste   = (e.clipboardData || window.clipboardData).getData('text');
      const letters = paste.replace(/[^\u0600-\u06FF]/g, '');
      const startIdx = arabicInputs.indexOf(input);
      for (let i = 0; i < Math.min(letters.length, arabicInputs.length - startIdx); i++) {
        if (arabicInputs[startIdx + i]) arabicInputs[startIdx + i].value = letters[i];
      }
      updateHidden();
    });
  });

  // =============================================
  // البحث السريع — اقتراحات من البيانات المحفوظة
  // =============================================
  const searchEl  = $(`${fieldKey}_search`);
  const suggestEl = $(`${fieldKey}_suggestions`);
  if (!searchEl || !suggestEl) return;

  // تحديد مصدر البيانات حسب المفتاح
  const sourceMap = {
    headNo:    { panel: "trucks",  field: "headNo" },
    trailerNo: { panel: "trucks",  field: "trailerNo" },
    tailNo:    { panel: "trucks",  field: "tailNo" },
    carNo:     { panel: "cars",    field: "carNo" },
  };
  const src = sourceMap[fieldKey];

  // دالة تعبئة المربعات من قيمة مختارة
  const fillBoxes = (val) => {
    const arabic  = (val.match(/[\u0600-\u06FF]+/g) || []).join('');
    const english = (val.match(/[0-9]+/g) || []).join('');
    arabicInputs.forEach((inp, i) => { inp.value = arabic[i] || ''; });
    englishInputs.forEach((inp, i) => { inp.value = english[i] || ''; });
    updateHidden();
    searchEl.value = '';
    suggestEl.style.display = 'none';
    // أطلق حدث change على الحقل المخفي لتفعيل التعبئة التلقائية
    hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const showSuggestions = (query) => {
    suggestEl.innerHTML = '';
    if (!query || !src) { suggestEl.style.display = 'none'; return; }

    const rows   = loadPanelLocal(src.panel);
    const values = [...new Set(
      rows.map(r => String(r[src.field] || '').trim()).filter(v => v)
    )];
    const matched = values.filter(v =>
      v.replace(/\s/g,'').toLowerCase().includes(query.replace(/\s/g,'').toLowerCase())
    );

    if (!matched.length) { suggestEl.style.display = 'none'; return; }

    matched.slice(0, 8).forEach(val => {
      const item = document.createElement('div');
      item.className = 'truck-suggestion-item';
      item.textContent = val;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        fillBoxes(val);
      });
      suggestEl.appendChild(item);
    });
    suggestEl.style.display = 'block';
  };

  searchEl.addEventListener('input', () => showSuggestions(searchEl.value));
  searchEl.addEventListener('focus', () => { if (searchEl.value) showSuggestions(searchEl.value); });
  searchEl.addEventListener('blur',  () => setTimeout(() => { suggestEl.style.display = 'none'; }, 150));
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { suggestEl.style.display = 'none'; searchEl.value = ''; }
    if (e.key === 'Enter') {
      const first = suggestEl.querySelector('.truck-suggestion-item');
      if (first) { fillBoxes(first.textContent); }
    }
  });
}

/**
 * يضيف مسافة بين الأحرف العربية المتتالية في رقم اللوحة
 * مثال: "كمال 1234" → "ك م ا ل 1234"
 */
function spacedArabicLetters(text) {
  if (!text) return '';
  return String(text).split('').map((char, i, arr) => {
    const isAr   = /[\u0600-\u06FF]/.test(char);
    const nextAr = arr[i + 1] && /[\u0600-\u06FF]/.test(arr[i + 1]);
    return (isAr && nextAr) ? char + ' ' : char;
  }).join('');
}

/* =====================================================
 * Time Input — مربعات إدخال الوقت (HH:MM)
 * ===================================================== */

/**
 * ينشئ HTML لمربعات إدخال الوقت بتنسيق HH:MM
 * @param {string} fieldKey  - مفتاح الحقل (مثال: activityTime)
 * @param {string} label     - تسمية الحقل
 * @param {string} value     - القيمة الحالية "HH:MM"
 * @param {boolean} req      - مطلوب؟
 */
function createTimeInput(fieldKey, label, value = "", req = false) {
  const [hh = "", mm = ""] = (value || "").split(":");
  const reqStar = req ? '<span style="color:var(--danger);margin-right:2px">*</span>' : "";

  return `
  <div class="time-input-wrap" id="ti_wrap_${fieldKey}">
    <label class="${req ? 'req' : ''}" style="margin-bottom:6px;display:block">
      ${reqStar}${label}
    </label>
    <div class="time-input-box">
      <div class="time-segment">
        <span class="time-seg-label">ساعة</span>
        <div class="time-digits">
          <input class="time-digit" id="ti_h1_${fieldKey}" maxlength="1"
            inputmode="numeric" placeholder="0" value="${hh[0]||''}" />
          <input class="time-digit" id="ti_h2_${fieldKey}" maxlength="1"
            inputmode="numeric" placeholder="0" value="${hh[1]||''}" />
        </div>
      </div>
      <div class="time-colon">:</div>
      <div class="time-segment">
        <span class="time-seg-label">دقيقة</span>
        <div class="time-digits">
          <input class="time-digit" id="ti_m1_${fieldKey}" maxlength="1"
            inputmode="numeric" placeholder="0" value="${mm[0]||''}" />
          <input class="time-digit" id="ti_m2_${fieldKey}" maxlength="1"
            inputmode="numeric" placeholder="0" value="${mm[1]||''}" />
        </div>
      </div>
      <div class="time-ampm" id="ti_ampm_${fieldKey}">
        <button type="button" class="ampm-btn" data-v="ص" onclick="timeAmpmClick('${fieldKey}','ص')">ص</button>
        <button type="button" class="ampm-btn" data-v="م" onclick="timeAmpmClick('${fieldKey}','م')">م</button>
      </div>
    </div>
    <input type="hidden" id="${fieldKey}" name="${fieldKey}" value="${value||''}" />
    <div class="time-preview" id="ti_preview_${fieldKey}">${value ? value : '‑‑:‑‑'}</div>
  </div>`;
}

/**
 * يُرفق مستمعات الأحداث لمربعات الوقت
 */
function attachTimeInputListeners(fieldKey) {
  const ids = ["h1","h2","m1","m2"];
  const inputs = ids.map(id => document.getElementById(`ti_${id}_${fieldKey}`));
  const hidden  = document.getElementById(fieldKey);
  const preview = document.getElementById(`ti_preview_${fieldKey}`);
  const ampmDiv = document.getElementById(`ti_ampm_${fieldKey}`);

  // تحديد AM/PM الحالي من القيمة المخزنة
  let ampm = "";
  if (hidden && hidden.value) {
    const parts = hidden.value.split(" ");
    if (parts[1]) ampm = parts[1];
  }
  _syncAmpmBtns(fieldKey, ampm);

  function updateHidden() {
    const [h1,h2,m1,m2] = inputs.map(i => i ? i.value.trim() : "");
    const hStr = (h1||"0") + (h2||"0");
    const mStr = (m1||"0") + (m2||"0");
    const hNum = parseInt(hStr)||0, mNum = parseInt(mStr)||0;
    // تقييد النطاق: الساعات 1-12 والدقائق 0-59
    const hSafe = Math.min(Math.max(hNum, 0), 12);
    const mSafe = Math.min(mNum, 59);
    const formatted = `${String(hSafe).padStart(2,"0")}:${String(mSafe).padStart(2,"0")}`;
    const full = ampm ? `${formatted} ${ampm}` : formatted;
    if (hidden)  hidden.value  = full;
    if (preview) preview.textContent = full;
    // أطلق change على الحقل المخفي ليعمل computed
    hidden && hidden.dispatchEvent(new Event("change", { bubbles: true }));
  }

  inputs.forEach((inp, idx) => {
    if (!inp) return;
    const isHour   = idx < 2;  // h1, h2
    const isMinute = idx >= 2; // m1, m2
    // أرقام فقط
    inp.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !inp.value && idx > 0) {
        inputs[idx-1].focus();
        return;
      }
      if (!/^\d$/.test(e.key) && !["Backspace","Tab","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        return;
      }
      // تقييد أول رقم الساعة: 0 أو 1 فقط
      if (isHour && idx === 0 && /^\d$/.test(e.key)) {
        if (parseInt(e.key) > 1) { e.preventDefault(); return; }
      }
      // تقييد أول رقم الدقيقة: 0-5 فقط
      if (isMinute && idx === 2 && /^\d$/.test(e.key)) {
        if (parseInt(e.key) > 5) { e.preventDefault(); return; }
      }
    });
    inp.addEventListener("input", e => {
      // اسمح برقم واحد فقط
      inp.value = inp.value.replace(/\D/g, "").slice(-1);
      // تقييد: إذا h1=1 فـh2 يجب 0-2 فقط
      if (isHour && idx === 1) {
        const h1Val = inputs[0] ? parseInt(inputs[0].value) : 0;
        if (h1Val === 1 && parseInt(inp.value) > 2) inp.value = "2";
      }
      updateHidden();
      // انتقل للمربع التالي
      if (inp.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    inp.addEventListener("focus", () => inp.select());
  });
}

function timeAmpmClick(fieldKey, val) {
  const ids = ["h1","h2","m1","m2"];
  const inputs = ids.map(id => document.getElementById(`ti_${id}_${fieldKey}`));
  const hidden  = document.getElementById(fieldKey);
  const preview = document.getElementById(`ti_preview_${fieldKey}`);

  // تحديث القيمة
  const [h1,h2,m1,m2] = inputs.map(i => i ? i.value.trim() : "");
  const hStr = (h1||"0") + (h2||"0");
  const mStr = (m1||"0") + (m2||"0");
  const formatted = `${hStr.padStart(2,"0")}:${mStr.padStart(2,"0")}`;
  const full = `${formatted} ${val}`;
  if (hidden)  hidden.value  = full;
  if (preview) preview.textContent = full;
  _syncAmpmBtns(fieldKey, val);
  hidden && hidden.dispatchEvent(new Event("change", { bubbles: true }));
}

function _syncAmpmBtns(fieldKey, active) {
  const div = document.getElementById(`ti_ampm_${fieldKey}`);
  if (!div) return;
  div.querySelectorAll(".ampm-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.v === active);
  });
}
