// // =====================================================
// // Panel Definitions
// // =====================================================

// const PANELS = [
//   {
//     key: "donors",
//     title: "لوحة إدخال المانحين (DB)",
//     compactCols: ["name", "country", "phone"],
//     fields: [
//       { k: "name", label: "اسم المانح", req: true, hint: "مثال: الهلال الأحمر", listFrom: "donors.name" },
//       { k: "country", label: "الدولة", req: false, hint: "مثال: الكويت", listFrom: "donors.country" },
//       { k: "phone", label: "هاتف/تواصل", req: false, type: "phone", hint: "" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "units",
//     title: "لوحة إدخال الوحدات (Local)",
//     compactCols: ["name", "type"],
//     fields: [
//       { k: "name", label: "اسم الوحدة", req: true, hint: "مثال: شوال / كرتونة / باليت", listFrom: "units.name" },
//       { k: "type", label: "تصنيف (اختياري)", req: false, hint: "وزن/حجم/عدّ", listFrom: "units.type" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ],
//     defaults: [
//       { name: "كرتونة", type: "عدّ" },
//       { name: "شوال", type: "وزن" },
//       { name: "رزمة", type: "عدّ" },
//       { name: "درزون", type: "عدّ" },
//       { name: "باليت", type: "حجم" }
//     ]
//   },
//   {
//   key: "drivers",
//   title: "لوحة إدخال السائقين",
//   compactCols: ["driverName","driverId","phone"],
//   fields: [
//     { k:"driverName", label:"اسم السائق", req:true, listFrom:"drivers.driverName" },
//     { k:"driverId", label:"رقم هوية/تعريف", req:false, listFrom:"drivers.driverId" },
//     { k:"phone", label:"جوال", req:false, type: "phone", listFrom:"drivers.phone" },
//     { k:"license", label:"رخصة (اختياري)", req:false },
//     { k:"idFrontImg", label:"صورة الهوية (الوجه)", type:"image", req:false },
//     { k:"idBackImg",  label:"صورة الهوية (الظهر)", type:"image", req:false },
//     { k:"notes", label:"ملاحظات", type:"textarea", req:false },
//   ]
// }
// ,
//   {
//     key: "trucks",
//     title: "لوحة إدخال الشاحنات (DB)",
//     compactCols: ["headNo", "trailerNo", "tailNo", "driverName"],
//     fields: [
//       { k: "headNo", label: "رقم الرأس", req: true, hint: "", listFrom: "trucks.headNo" },
//       { k: "trailerNo", label: "رقم المقطورة", req: false, hint: "", listFrom: "trucks.trailerNo" },
//       { k: "tailNo", label: "رقم الذيل", req: false, hint: "", listFrom: "trucks.tailNo" },
//       { k: "truckType", label: "نوع الشاحنة", req: false, hint: "قلاب/براد/مغطى...", listFrom: "trucks.truckType" },
//       { k: "driverName", label: "اسم السائق", req: false, hint: "اختر/اكتب", listFrom: "drivers.driverName" },
//       { k: "driverPhone", label: "جوال السائق", req: false, type: "phone", hint: "يتعبأ تلقائياً إذا الاسم مطابق", listFrom: "drivers.phone" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "cars",
//     title: "لوحة إدخال السيارات (Local)",
//     compactCols: ["carNo", "carType", "driverName"],
//     fields: [
//       { k: "carNo", label: "رقم السيارة", req: true, hint: "", listFrom: "cars.carNo" },
//       { k: "carType", label: "نوع السيارة", req: false, hint: "بيك أب/فان/...", listFrom: "cars.carType" },
//       { k: "driverName", label: "اسم السائق", req: false, hint: "", listFrom: "drivers.driverName" },
//       { k: "driverPhone", label: "جوال السائق", req: false, type: "phone", hint: "يتعبأ تلقائياً إذا الاسم مطابق", listFrom: "drivers.phone" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "supervisors",
//     title: "لوحة إدخال المشرفين (Local)",
//     compactCols: ["name", "phone", "area"],
//     fields: [
//       { k: "name", label: "اسم المشرف", req: true, hint: "", listFrom: "supervisors.name" },
//       { k: "phone", label: "جوال", req: false, type: "phone", hint: "", listFrom: "supervisors.phone" },
//       { k: "area", label: "المنطقة/الموقع", req: false, hint: "", listFrom: "supervisors.area" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "executors",
//     title: "لوحة إدخال المنفذين (Local)",
//     compactCols: ["name", "role", "phone"],
//     fields: [
//       { k: "name", label: "اسم المنفذ", req: true, hint: "", listFrom: "executors.name" },
//       { k: "role", label: "الدور/المسمى", req: false, hint: "", listFrom: "executors.role" },
//       { k: "phone", label: "جوال", req: false, type: "phone", hint: "", listFrom: "executors.phone" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "warehouses",
//     title: "لوحة إدخال المخازن وتفاصيلها (Local)",
//     compactCols: ["name", "location", "manager"],
//     fields: [
//       { k: "name", label: "اسم المخزن", req: true, hint: "", listFrom: "warehouses.name" },
//       { k: "location", label: "الموقع", req: false, hint: "مدينة/حي", listFrom: "warehouses.location" },
//       { k: "manager", label: "المسؤول", req: false, hint: "", listFrom: "warehouses.manager" },
//       { k: "phone", label: "هاتف", req: false, type: "phone", hint: "" },
//       { k: "capacity", label: "السعة (اختياري)", req: false, hint: "" },
//       { k: "notes", label: "تفاصيل/ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "associations",
//     title: "لوحة إدخال الجمعيات (Local)",
//     compactCols: ["main", "sub", "country"],
//     fields: [
//       { k: "main", label: "اسم الجمعية الرئيسي", req: true, hint: "", listFrom: "associations.main" },
//       { k: "sub", label: "اسم الجمعية الفرعي", req: false, hint: "اختياري", listFrom: "associations.sub" },
//       { k: "country", label: "الدولة (إن وجدت)", req: false, hint: "", listFrom: "associations.country" },
//       { k: "contact", label: "تواصل", req: false, hint: "اسم/جوال/بريد" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "contractors",
//     title: "المقاولين (Local)",
//     compactCols: ["name", "service", "phone"],
//     fields: [
//       { k: "name", label: "اسم المقاول/الشركة", req: true, hint: "", listFrom: "contractors.companyName" },
//       { k: "service", label: "الخدمة", req: false, hint: "نقل/تحميل/تفريغ...", listFrom: "contractors.service" },
//       { k: "phone", label: "جوال", req: false, type: "phone", hint: "" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "suppliers",
//     title: "لوحة إدخال الموردين (Local)",
//     compactCols: ["name", "category", "phone"],
//     fields: [
//       { k: "name", label: "اسم المورد", req: true, hint: "", listFrom: "suppliers.name" },
//       { k: "category", label: "التصنيف", req: false, hint: "مواد غذائية/وقود/...", listFrom: "suppliers.category" },
//       { k: "phone", label: "جوال", req: false, type: "phone", hint: "" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "credits",
//     title: "لوحة إدخال الاعتمادات (DB)",
//     compactCols: ["creditNo", "date", "donorName", "assocMain"],
//     fields: [
//       { k: "creditNo", label: "رقم الاعتماد", req: true, hint: "", listFrom: "credits.creditNo" },
//       { k: "date", label: "التاريخ", type: "date", req: false },
//       { k: "donorName", label: "اسم المانح", req: false, hint: "", listFrom: "donors.name" },
//       { k: "assocMain", label: "الجمعية الرئيسي", req: false, hint: "", listFrom: "associations.main" },
//       { k: "projectName", label: "اسم المشروع", req: false, hint: "", listFrom: "convoys.projectName" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "items",
//     title: "لوحة إدخال الأصناف (Local)",
//     compactCols: ["itemName", "defaultUnit", "weightPerUnit"],
//     fields: [
//       { k: "itemName", label: "اسم الصنف", req: true, hint: "", listFrom: "items.itemName" },
//       { k: "defaultUnit", label: "الوحدة الافتراضية", req: false, hint: "", listFrom: "units.name" },
//       { k: "weightPerUnit", label: "وزن/وحدة (اختياري)", req: false, hint: "مثال: 25" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "convoys",
//     title: "لوحة إدخال القوافل (DB رأس القافلة + Local تفاصيل الشاحنات)",
//     compactCols: ["convoyNo", "date", "projectName", "donorName", "creditNo"],
//     fields: [
//       { k: "convoyNo", label: "رقم القافلة (تسلسلي)", req: true, hint: "يتولد تلقائياً عند الضغط على جديد", readonly: true },
//       { k: "date", label: "تاريخ القافلة", type: "date", req: false },
//       { k: "creditNo", label: "رقم الاعتماد", req: false, hint: "", listFrom: "credits.creditNo" },
//       { k: "donorName", label: "اسم المانح", req: false, hint: "", listFrom: "donors.name" },
//       { k: "assocMain", label: "الجمعية الرئيسي", req: false, hint: "", listFrom: "associations.main" },
//       { k: "projectName", label: "اسم المشروع", req: false, hint: "", listFrom: "convoys.projectName" },
//       { k: "warehouse", label: "المخزن", req: false, hint: "", listFrom: "warehouses.name" },
//       { k: "contractor", label: "شركة النقل/المقاول", req: false, hint: "", listFrom: "contractors.companyName" },
//       { k: "supervisor", label: "المشرف", req: false, hint: "", listFrom: "supervisors.name" },
//       { k: "executor", label: "المنفذ", req: false, hint: "", listFrom: "executors.name" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ],
//     subgrid: {
//       title: "الأصناف وكمياتها داخل الشاحنة (داخل القافلة) — Local الآن",
//       hint: "حاليًا تفاصيل الشاحنات/الأصناف داخل القافلة تُحفظ محليًا. إذا تريدها DB سأربطها بجداول ConvoyTrucks + TruckItems.",
//       cols: ["headNo", "trailerNo", "tailNo", "driverName", "driverPhone", "itemName", "unit", "qty", "weightPerUnit", "totalWeight", "notes"],
//       fields: [
//         { k: "headNo", label: "رقم الرأس", req: true, listFrom: "trucks.headNo" },
//         { k: "trailerNo", label: "رقم المقطورة", req: false, readonly: true },
//         { k: "tailNo", label: "رقم الذيل", req: false, readonly: true },
//         { k: "driverName", label: "اسم السائق", req: false, readonly: true, listFrom: "drivers.driverName" },
//         { k: "driverPhone", label: "جوال السائق", req: false, type: "phone", readonly: true },
//         { k: "itemName", label: "الصنف", req: true, listFrom: "items.itemName" },
//         { k: "unit", label: "الوحدة", req: false, listFrom: "units.name" },
//         { k: "qty", label: "الكمية/عدد القطع", req: false, hint: "مثال: 80" },
//         { k: "weightPerUnit", label: "وزن/وحدة", req: false, hint: "مثال: 25" },
//         { k: "totalWeight", label: "إجمالي الوزن (تلقائي)", req: false, readonly: true },
//         { k: "notes", label: "ملاحظات", req: false }
//       ]
//     }
//   },
//   {
//     key: "convoy_calc",
//     title: "لوحة إدخال احتساب القوافل (Local)",
//     compactCols: ["convoyNo", "calcDate", "days", "amount"],
//     fields: [
//       { k: "convoyNo", label: "رقم القافلة", req: true, listFrom: "convoys.convoyNo" },
//       { k: "calcDate", label: "تاريخ الاحتساب", type: "date", req: false },
//       { k: "days", label: "عدد الأيام", req: false },
//       { k: "amount", label: "المبلغ", req: false },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "pallet_calc",
//     title: "لوحة إدخال احتساب الباليتات (Local)",
//     compactCols: ["date", "warehouse", "palletsIn", "palletsOut"],
//     fields: [
//       { k: "date", label: "التاريخ", type: "date", req: false },
//       { k: "warehouse", label: "المخزن", req: false, listFrom: "warehouses.name" },
//       { k: "palletsIn", label: "باليتات وارد", req: false },
//       { k: "palletsOut", label: "باليتات صادر", req: false },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   },
//   {
//     key: "truck_items",
//     title: "لوحة إدخال الأصناف وكمياتها داخل الشاحنة (Local مستقل)",
//     compactCols: ["convoyNo", "headNo", "itemName", "qty", "unit"],
//     fields: [
//       { k: "convoyNo", label: "رقم القافلة", req: false, listFrom: "convoys.convoyNo" },
//       { k: "headNo", label: "رقم الرأس", req: true, listFrom: "trucks.headNo" },
//       { k: "itemName", label: "الصنف", req: true, listFrom: "items.itemName" },
//       { k: "unit", label: "الوحدة", req: false, listFrom: "units.name" },
//       { k: "qty", label: "الكمية/عدد القطع", req: false },
//       { k: "weightPerUnit", label: "وزن/وحدة", req: false },
//       { k: "totalWeight", label: "إجمالي الوزن (تلقائي)", req: false, readonly: true },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ],
//     computed: function (rec) {
//       const q = toNum(rec.qty),
//         w = toNum(rec.weightPerUnit);
//       rec.totalWeight = (q && w) ? String(q * w) : "";
//     }
//   },
//   {
//     key: "cashbox",
//     title: "تقرير الصندوق (إدخال) (Local)",
//     compactCols: ["payDate", "statement", "amount", "creditNo"],
//     fields: [
//       { k: "payDate", label: "تاريخ الدفع", type: "date", req: false },
//       { k: "statement", label: "البيان النصي", req: true, hint: "", listFrom: "cashbox.statement" },
//       { k: "amount", label: "المبلغ", req: true, hint: "" },
//       { k: "creditNo", label: "رقم الاعتماد", req: false, listFrom: "credits.creditNo" },
//       { k: "itemName", label: "اسم الصنف", req: false, listFrom: "items.itemName" },
//       { k: "expenseType", label: "المصروفات", req: false, hint: "ميزان/نقل/بياتات/تنسيقات", listFrom: "cashbox.expenseType" },
//       { k: "donorName", label: "اسم المانح", req: false, listFrom: "donors.name" },
//       { k: "contractor", label: "شركة النقل/المقاول", req: false, listFrom: "contractors.companyName" },
//       { k: "notes", label: "ملاحظات", type: "textarea", req: false }
//     ]
//   }
// ];

// function currentPanel() {
//   return PANELS.find(p => p.key === window.activeKey);
// }




// =====================================================
// Panel Definitions (LOCAL ONLY)
// =====================================================

const PANELS = [
  {
    key: "donors",
    title: "لوحة إدخال المانحين (Local)",
    compactCols: ["name", "nameEn", "country", "phone"],
    fields: [
      { k: "name",     label: "اسم المانح (عربي)",    req: true,  hint: "مثال: الهلال الأحمر", listFrom: "donors.name" },
      { k: "nameEn",   label: "Donor Name (English)", req: false, hint: "e.g. Red Crescent",   listFrom: "donors.nameEn" },
      { k: "country",  label: "الدولة",               req: false, hint: "مثال: الكويت", listFrom: "donors.country" },
      { k: "phone",    label: "هاتف/تواصل",           req: false, type: "phone", hint: "" },
      { k: "notes",    label: "ملاحظات",              type: "textarea", req: false },
      { k: "contacts", label: "المنسقون والمسوقون",   type: "contacts_list", req: false,
        hint: "يمكن إضافة أكثر من منسق أو مسوق" }
    ]
  },

  {
    key: "units",
    title: "لوحة إدخال الوحدات (Local)",
    compactCols: ["name", "type"],
    fields: [
      { k: "name", label: "اسم الوحدة", req: true, hint: "مثال: شوال / كرتونة / باليت", listFrom: "units.name" },
      { k: "type", label: "تصنيف (اختياري)", req: false, hint: "وزن/حجم/عدّ", listFrom: "units.type" },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ],
    defaults: [
      { name: "كرتونة", type: "عدّ" },
      { name: "شوال", type: "وزن" },
      { name: "رزمة", type: "عدّ" },
      { name: "درزون", type: "عدّ" },
      { name: "باليت", type: "حجم" }
    ]
  },

  {
    key: "drivers",
    title: "لوحة إدخال السائقين (Local)",
    compactCols: ["driverName", "driverId", "phone", "driverType", "residenceArea"],
    fields: [
      { k: "driverName",   label: "اسم السائق",       req: true,  listFrom: "drivers.driverName" },
      { k: "driverId",     label: "رقم هوية/تعريف",   req: false, type: "phone", listFrom: "drivers.driverId" },
      { k: "phone",        label: "جوال",              req: false, type: "phone", listFrom: "drivers.phone" },
      { k: "license",      label: "رخصة (اختياري)",   req: false },

      // ✅ صور الهوية (LocalStorage: Base64)
      { k: "idFrontImg", label: "صورة هوية السائق (الوجه)", type: "image", req: false },
      { k: "idBackImg",  label: "صورة هوية السائق (الظهر)", type: "image", req: false },

      { k: "driverType",   label: "تصنيف السائق",     req: false,
        type: "select",
        options: ["شخصي", "مقاول", "شركة نقل"],
        hint: "شخصي / مقاول / شركة نقل" },
      { k: "affiliatedTo", label: "تابع لـ (جهة/شركة)", req: false,
        hint: "اسم الشركة أو جهة المقاول إن وُجدت",
        listFrom: "contractors.companyName" },
      { k: "residenceArea", label: "منطقة الإقامة / السكن", req: false,
        hint: "مثال: أكتوبر / الإسماعيلية / الغربية...",
        listFrom: "drivers.residenceArea" },

      { k: "notes", label: "ملاحظات", type: "textarea", req: false },
    ]
  },

  {
    key: "trucks",
    title: "لوحة إدخال الشاحنات (Local)",
    compactCols: ["headNo", "headOwner", "headLicense", "trailerNo", "trailerOwner", "trailerLicense", "tailNo", "tailOwner", "tailLicense", "driverName", "ownership"],
    fields: [
      // --- تبعية الشاحنة ---
      { k: "ownership",       label: "تبعية الشاحنة",        req: false,
        type: "select",
        options: ["شخصية", "شركة نقل", "مقاول"],
        hint: "شخصية / شركة نقل / مقاول" },
      { k: "ownerCompany",    label: "اسم الشركة/المقاول المالك", req: false,
        hint: "إن كانت تابعة لشركة أو مقاول",
        listFrom: "contractors.companyName" },

      { k: "headNo",          label: "رقم الرأس",            req: true,  hint: "", listFrom: "trucks.headNo" },
      { k: "headOwner",       label: "اسم مالك الرأس",       req: false, hint: "", listFrom: "trucks.headOwner" },
      { k: "headLicense",     label: "رقم رخصة الرأس",       req: false, hint: "", listFrom: "trucks.headLicense" },
      
      { k: "trailerNo",       label: "رقم المقطورة",          req: false, hint: "", listFrom: "trucks.trailerNo" },
      { k: "trailerOwner",    label: "اسم مالك المقطورة",     req: false, hint: "", listFrom: "trucks.trailerOwner" },
      { k: "trailerLicense",  label: "رقم رخصة المقطورة",     req: false, hint: "", listFrom: "trucks.trailerLicense" },
      
      { k: "tailNo",          label: "رقم الذيل",             req: false, hint: "", listFrom: "trucks.tailNo" },
      { k: "tailOwner",       label: "اسم مالك الذيل",        req: false, hint: "", listFrom: "trucks.tailOwner" },
      { k: "tailLicense",     label: "رقم رخصة الذيل",        req: false, hint: "", listFrom: "trucks.tailLicense" },
      
      { k: "truckType", label: "نوع الشاحنة", req: false, type: "select",
        options: [
          "ربع نقل (دبابة)",
          "ربع نقل (دبابة مبردة)",
          "نقل جامبو",
          "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق",
          "شاحنة مبردة",
          "شاحنة نقل مواد",
          "شاحنة فرش",
          "سيارة سحب (ونش)",
          "شاحنة جنب",
          "شاحنة ستارة"
        ]
      },
      { k: "truckModel",      label: "موديل الشاحنة",          req: false, hint: "مثال: مرسيدس 2024", listFrom: "trucks.truckModel" },
      { k: "driverName",      label: "اسم السائق",            req: false, hint: "اختر/اكتب", listFrom: "drivers.driverName" },
      { k: "driverPhone",     label: "جوال السائق",           req: false, type: "phone", hint: "يتعبأ تلقائياً إذا الاسم مطابق", listFrom: "drivers.phone" },
      { k: "notes",           label: "ملاحظات",               type: "textarea", req: false }
    ]
  },

  {
    key: "cars",
    title: "لوحة إدخال السيارات (Local)",
    compactCols: ["carNo", "carType", "carOwnerName", "driverName", "ownership"],
    fields: [
      { k: "ownership",    label: "تبعية السيارة",           req: false,
        type: "select",
        options: ["شخصية", "شركة نقل", "مقاول"],
        hint: "شخصية / شركة نقل / مقاول" },
      { k: "ownerCompany", label: "اسم الشركة/المقاول المالك", req: false,
        hint: "إن كانت تابعة لشركة أو مقاول",
        listFrom: "contractors.companyName" },
      { k: "carNo", label: "رقم السيارة", req: true },
      { k: "carType", label: "نوع السيارة", req: false, type: "select",
        options: [
          "── حسب عدد الركاب ──",
          "سيارة 4 راكب",
          "سيارة 5 راكب",
          "سيارة 7 راكب",
          "سيارة 8 راكب",
          "سيارة 14 راكب (ميكروباص)",
          "سيارة 26 راكب (ميني باص)",
          "50 راكب (أتوبيس)",
          "7 راكب (جيب)",
          "4 راكب (جيب)",
          "── مركبات تجارية ونقل ──",
          "ربع نقل (دبابة)",
          "ربع نقل (دبابة مبردة)",
          "نقل جامبو",
          "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق",
          "شاحنة مبردة",
          "شاحنة نقل مواد",
          "شاحنة فرش",
          "سيارة سحب (ونش)",
          "شاحنة جنب",
          "شاحنة ستارة"
        ]
      },
      { k: "carModel",     label: "موديل السيارة",            req: false, hint: "مثال: تويوتا 2025", listFrom: "cars.carModel" },
      { k: "carOwnerName", label: "اسم مالك السيارة",        req: false, hint: "", listFrom: "cars.carOwnerName" },
      { k: "carOwnerPhone",label: "رقم هاتف المالك",         req: false, type: "phone", hint: "" },
      { k: "driverName",   label: "اسم السائق",              req: false, hint: "", listFrom: "drivers.driverName" },
      { k: "driverPhone",  label: "جوال السائق",             req: false, type: "phone", hint: "يتعبأ تلقائياً إذا الاسم مطابق", listFrom: "drivers.phone" },
      { k: "notes",        label: "ملاحظات",                 type: "textarea", req: false }
    ]
  },

  {
    key: "supervisors",
    title: "لوحة إدخال المشرفين (Local)",
    compactCols: ["name", "phone", "area"],
    fields: [
      { k: "name", label: "اسم المشرف", req: true, hint: "", listFrom: "supervisors.name" },
      { k: "phone", label: "جوال", req: false, type: "phone", hint: "", listFrom: "supervisors.phone" },
      { k: "area", label: "المنطقة/الموقع", req: false, hint: "", listFrom: "supervisors.area" },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "executors",
    title: "لوحة إدخال المنفذين (Local)",
    compactCols: ["name", "role", "phone"],
    fields: [
      { k: "name", label: "اسم المنفذ", req: true, hint: "", listFrom: "executors.name" },
      { k: "role", label: "الدور/المسمى", req: false, hint: "", listFrom: "executors.role" },
      { k: "phone", label: "جوال", req: false, type: "phone", hint: "", listFrom: "executors.phone" },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "warehouses",
    title: "لوحة إدخال المخازن وتفاصيلها (Local)",
    compactCols: ["name", "location", "manager"],
    fields: [
      { k: "name", label: "اسم المخزن", req: true, hint: "", listFrom: "warehouses.name" },
      { k: "location", label: "الموقع", req: false, hint: "مدينة/حي", listFrom: "warehouses.location" },
      { k: "manager", label: "المسؤول", req: false, hint: "", listFrom: "warehouses.manager" },
      { k: "phone", label: "هاتف", req: false, type: "phone", hint: "" },
      { k: "capacity", label: "السعة (اختياري)", req: false, hint: "" },
      { k: "notes", label: "تفاصيل/ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "associations",
    title: "لوحة إدخال الجمعيات (Local)",
    compactCols: ["main", "sub", "country"],
    fields: [
      { k: "main", label: "اسم الجمعية الرئيسي", req: true, hint: "", listFrom: "associations.main" },
      { k: "sub", label: "اسم الجمعية الفرعي", req: false, hint: "اختياري", listFrom: "associations.sub" },
      { k: "country", label: "الدولة (إن وجدت)", req: false, hint: "", listFrom: "associations.country" },
      { k: "contact", label: "تواصل", req: false, hint: "اسم/جوال/بريد" },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "contractors",
    title: "شركات النقل والخدمات اللوجستية (Local)",
    compactCols: ["companyName", "companyPhone", "ownerName", "service"],
    fields: [
      { k: "companyName",    label: "اسم الشركة",             req: true,  hint: "", listFrom: "contractors.companyName" },
      { k: "companyRegNo",   label: "رقم الشركة (سجل تجاري)", req: false, hint: "" },
      { k: "ownerName",      label: "اسم مالك الشركة",        req: false, hint: "", listFrom: "contractors.ownerName" },
      { k: "ownerPhone",     label: "رقم هاتف المالك",        req: false, type: "phone", hint: "" },
      { k: "companyPhone",   label: "رقم هاتف الشركة",        req: false, type: "phone", hint: "" },
      { k: "delegateName",   label: "اسم المفوض",             req: false, hint: "" },
      { k: "delegatePhone",  label: "رقم المفوض",             req: false, type: "phone", hint: "" },
      { k: "address",        label: "العنوان",                req: false, hint: "المدينة / الحي / الشارع" },
      { k: "service",        label: "الخدمة",                 req: false, hint: "نقل/تحميل/تفريغ/لوجستيات...", listFrom: "contractors.service" },
      { k: "notes",          label: "ملاحظات",                type: "textarea", req: false }
    ]
  },

  {
    key: "suppliers",
    title: "لوحة إدخال الموردين (Local)",
    compactCols: ["name", "companyNo", "category", "phone", "address", "beneficiaryName", "iban"],
    fields: [
      { k: "name",            label: "اسم المورد",           req: true,  hint: "", listFrom: "suppliers.name" },
      { k: "companyNo",       label: "رقم الشركة",           req: false, hint: "رقم تسجيل الشركة / رقم السجل التجاري", listFrom: "suppliers.companyNo" },
      { k: "address",         label: "العنوان",               req: false, hint: "العنوان التفصيلي للمورد", listFrom: "suppliers.address" },
      { k: "locationUrl",     label: "رابط الموقع / اللوكيشن", req: false, hint: "https://maps.google.com/... أو أي رابط خرائط" },
      { k: "category",        label: "الأصناف",               req: false, type: "items_list", listFrom: "items.itemName", placeholder: "اختر أو اكتب اسم الصنف...", addLabel: "إضافة صنف" },
      { k: "phone",           label: "جوال",                  req: false, type: "phone", hint: "" },
      { k: "notes",           label: "ملاحظات",               type: "textarea", req: false },
      { k: "_bankHeader",     label: "المعلومات البنكية",      type: "section_header" },
      { k: "beneficiaryNameAr", label: "اسم المستفيد (عربي)", req: false, hint: "اسم الشركة أو المورد بالعربية" },
      { k: "beneficiaryName", label: "اسم المستفيد",     req: false, type: "bank_field",
        labelEn: "BENEFICIARY NAME", hint: "اسم الشركة باللغة الإنجليزية" },
      { k: "beneficiaryAddr", label: "عنوان المستفيد",   req: false, type: "bank_field",
        labelEn: "BENEFICIARY ADDRESS", hint: "عنوان الشركة باللغة الإنجليزية" },
      { k: "iban",            label: "الآيبان",           req: false, type: "bank_field",
        labelEn: "IBAN", hint: "" },
      { k: "accountNo",       label: "رقم الحساب (USD)", req: false, type: "bank_field",
        labelEn: "ACCOUNT NUMBER (USD)", hint: "" },
      { k: "bankName",        label: "اسم البنك",         req: false, type: "bank_field",
        labelEn: "BANK NAME", hint: "اسم البنك باللغة الإنجليزية" },
      { k: "swiftCode",       label: "رمز السويفت",       req: false, type: "bank_field",
        labelEn: "SWIFT CODE", hint: "" },
      { k: "branchAddress",   label: "عنوان فرع البنك",  req: false, type: "bank_field",
        labelEn: "BRANCH ADDRESS", hint: "عنوان الفرع باللغة الإنجليزية" },
      { k: "notes",           label: "ملاحظات",           type: "textarea", req: false }
    ]
  },

  {
    key: "credits",
    title: "لوحة إدخال الاعتمادات (Local)",
    compactCols: ["creditNo", "creditType", "creditCategory", "date", "donorName", "projectName", "projectLocation"],
    fields: [
      { k: "creditNo",        label: "رقم الاعتماد",            req: true,  hint: "", listFrom: "credits.creditNo" },
      { k: "creditType",      label: "نوع الاعتماد",            req: false,
        type: "select",
        options: ["اعتماد تركي", "اعتماد مصري", "اعتماد دولي", "اعتماد محلي", "اعتماد داخلي", "أخرى"],
        hint: "حدد جهة مصدر الاعتماد" },
      { k: "creditCategory",  label: "تصنيف الاعتماد",          req: false,
        type: "select",
        options: ["إيواء", "أمن غذائي", "طبي", "تعليم", "بنية تحتية", "نقل وخدمات لوجستية", "عالقين", "حالات خاصة", "أخرى"],
        hint: "تصنيف نوع النشاط" },
      { k: "date",            label: "التاريخ",                 type: "date", req: false },
      { k: "donorName",       label: "اسم المانح",              req: false,  hint: "", listFrom: "donors.name" },
      { k: "assocMain",       label: "الجمعية الرئيسية",        req: false,  hint: "", listFrom: "associations.main" },
      { k: "projectName",     label: "اسم المشروع",             req: false,  hint: "", listFrom: "credits.projectName" },
      { k: "subProjectName",  label: "اسم المشروع الفرعي",      req: false,  hint: "" },
      { k: "projectLocation", label: "مكان استفادة المشروع",    req: false,  hint: "المحافظة / المنطقة / القرية", listFrom: "credits.projectLocation" },
      { k: "itemName",        label: "الصنف",                   req: false,  hint: "", listFrom: "items.itemName" },
      { k: "unit",            label: "الوحدة",                  req: false,  hint: "", listFrom: "units.name" },
      { k: "qty",             label: "الكمية",                  req: false,  hint: "مثال: 100" },
      { k: "unitPrice",       label: "السعر الفردي",            req: false,  hint: "سعر الوحدة الواحدة" },
      { k: "expenses",        label: "المصاريف",                req: false,  hint: "مصاريف النقل والتشغيل..." },
      { k: "totalPrice",      label: "السعر الإجمالي",          req: false,  readonly: true, hint: "يحسب تلقائياً" },
      { k: "notes",           label: "ملاحظات",                 type: "textarea", req: false }
    ],
    computed: function(rec) {
      const q  = toNum(rec.qty);
      const up = toNum(rec.unitPrice);
      const ex = toNum(rec.expenses);
      rec.totalPrice = (q && up) ? String((q * up) + ex) : (ex ? String(ex) : "");
    }
  },

  {
    key: "items",
    title: "لوحة إدخال الأصناف (Local)",
    compactCols: ["itemName", "itemCategory", "defaultUnit", "weightPerUnit"],
    fields: [
      { k: "itemName",     label: "اسم الصنف",            req: true,  hint: "", listFrom: "items.itemName" },
      { k: "itemCategory", label: "تصنيف الصنف",          req: false,
        type: "select",
        options: ["إيواء", "أمن غذائي", "طبي", "عالقين", "حالات خاصة"],
        hint: "إيواء / أمن غذائي / طبي / عالقين / حالات خاصة" },
      { k: "itemSpec",     label: "مواصفات الصنف",         req: false, hint: "النوع، الحجم، المادة، أي مواصفات تفصيلية...", type: "textarea" },
      { k: "defaultUnit",  label: "الوحدة الافتراضية",    req: false, hint: "", listFrom: "units.name" },
      { k: "weightPerUnit",label: "وزن الوحدة (اختياري)", req: false, hint: "مثال: 25 (كجم)" },
      { k: "notes",        label: "ملاحظات",               type: "textarea", req: false }
    ]
  },

  {
    key: "convoys",
    title: "لوحة إدخال القوافل (Local)",
    compactCols: ["convoyNo", "carType", "headNo", "trailerNo", "driverName", "driverId", "driverPhone", "contractor", "creditNo", "donorName", "itemName", "unit", "palletCount", "qtyPerPallet", "totalQty", "loadWeightKg", "arrivalDate", "loadDate", "departureDate", "actualEntryDate", "unloadDate", "loadLocation", "banner", "mediaLink", "allocation"],
    fields: [
      // ── بيانات أساسية ──────────────────────────────────────
      { k: "convoyNo",        label: "رقم القافلة",              req: true,  hint: "يتولد تلقائياً", readonly: true },
      { k: "carType",         label: "نوع السيارة",              req: false, type: "select",
        options: [
          "── حسب عدد الركاب ──",
          "سيارة 4 راكب", "سيارة 5 راكب", "سيارة 7 راكب", "سيارة 8 راكب",
          "سيارة 14 راكب (ميكروباص)", "سيارة 26 راكب (ميني باص)",
          "50 راكب (أتوبيس)", "7 راكب (جيب)", "4 راكب (جيب)",
          "── مركبات تجارية ونقل ──",
          "ربع نقل (دبابة)", "ربع نقل (دبابة مبردة)",
          "نقل جامبو", "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق", "شاحنة مبردة", "شاحنة نقل مواد",
          "شاحنة فرش", "سيارة سحب (ونش)", "شاحنة جنب", "شاحنة ستارة"
        ]
      },
      { k: "headNo",          label: "رقم الرأس",                req: false, hint: "اختر لتعبئة رقم المقطورة تلقائياً", listFrom: "trucks.headNo" },
      { k: "trailerNo",       label: "رقم المقطورة",              req: false, hint: "يُعبّأ تلقائياً عند اختيار رقم الرأس" },
      // ── السائق ──────────────────────────────────────────────
      { k: "driverName",      label: "اسم السائق",               req: false, hint: "", listFrom: "drivers.driverName" },
      { k: "driverId",        label: "الرقم القومي للسائق",      req: false, type: "phone", hint: "" },
      { k: "driverPhone",     label: "رقم هاتف السائق",          req: false, type: "phone", hint: "يتعبأ تلقائياً", listFrom: "drivers.phone" },
      // ── شركة النقل ──────────────────────────────────────────
      { k: "contractor",      label: "شركة النقل",               req: false, hint: "", listFrom: "contractors.companyName" },
      // ── الاعتماد والمانح والأصناف (متعددة) ──────────────────
      { k: "creditNo",        label: "أرقام الاعتمادات",          req: false, hint: "", type: "items_list",
        listFrom: "credits.creditNo", placeholder: "اختر أو اكتب رقم الاعتماد...", addLabel: "➕ إضافة اعتماد" },
      { k: "donorName",       label: "المانحون",                  req: false, hint: "يمكن إضافة أكثر من مانح", type: "items_list",
        listFrom: "donors.name", placeholder: "اختر أو اكتب اسم المانح...", addLabel: "➕ إضافة مانح" },
      // ── الصنف والكميات ──────────────────────────────────────
      { k: "itemName",        label: "الأصناف",                   req: false, hint: "يمكن إضافة أكثر من صنف", type: "items_list",
        listFrom: "items.itemName", placeholder: "اختر أو اكتب اسم الصنف...", addLabel: "➕ إضافة صنف" },
      { k: "unit",            label: "الوحدة",                   req: false, hint: "يُعبّأ تلقائياً", listFrom: "units.name" },
      { k: "palletCount",     label: "عدد الباليت في الشاحنة",   req: false, hint: "مثال: 20" },
      { k: "qtyPerPallet",    label: "العدد في الباليت",          req: false, hint: "مثال: 50" },
      { k: "totalQty",        label: "إجمالي عدد القطع",         req: false, hint: "يُحسب تلقائياً", readonly: true },
      { k: "weightPerUnit",   label: "وزن الوحدة (كجم)",          req: false, hint: "يُعبّأ تلقائياً من الصنف", readonly: true },
      { k: "loadWeightKg",    label: "وزن الحمولة (كيلو)",        req: false, hint: "يُحسب تلقائياً", readonly: true },
      // ── التواريخ ─────────────────────────────────────────────
      { k: "_datesHeader",    label: "التواريخ",                 type: "section_header" },
      { k: "arrivalDate",     label: "تاريخ الوصول",             type: "date", req: false },
      { k: "loadDate",        label: "تاريخ التحميل",            type: "date", req: false },
      { k: "departureDate",   label: "تاريخ الانطلاق",           type: "date", req: false },
      { k: "actualEntryDate", label: "تاريخ الدخول الفعلي",      type: "date", req: false },
      { k: "unloadDate",      label: "تاريخ التنزيل",            type: "date", req: false },
      // ── معلومات إضافية ───────────────────────────────────────
      { k: "_extraHeader",    label: "معلومات إضافية",           type: "section_header" },
      { k: "loadLocation",    label: "مكان التحميل",             req: false, hint: "", listFrom: "convoys.loadLocation" },
      { k: "banner",          label: "البنر",                    req: false, hint: "اسم أو وصف البنر" },
      { k: "mediaLink",       label: "رابط الإعلاميات",          req: false, hint: "https://..." },
      { k: "allocation",      label: "التخصيص",                  req: false, hint: "", listFrom: "convoys.allocation" },
      { k: "notes",           label: "ملاحظات",                  type: "textarea", req: false }
    ],
    // الشاحنات داخل القافلة — كل شاحنة تحمل اعتماداً أو أكثر مع أصناف متعددة
    subgrid: {
      title: "الشاحنات داخل القافلة",
      hint: "يمكن إضافة شاحنة أو أكثر، كل شاحنة تحمل صنفاً أو أكثر / اعتماداً أو أكثر.",
      cols: ["headNo", "trailerNo", "driverName", "creditNo", "itemName", "unit", "qty", "totalWeight", "notes"],
      fields: [
        { k: "headNo",        label: "رقم الرأس",       req: true,  listFrom: "trucks.headNo" },
        { k: "trailerNo",     label: "رقم المقطورة",     req: false, readonly: true },
        { k: "tailNo",        label: "رقم الذيل",        req: false, readonly: true },
        { k: "driverName",    label: "اسم السائق",       req: false, readonly: true },
        { k: "driverPhone",   label: "جوال السائق",      req: false, type: "phone", readonly: true },
        { k: "creditNo",      label: "رقم الاعتماد",     req: false, listFrom: "credits.creditNo" },
        { k: "itemName",      label: "الصنف",            req: true,  listFrom: "items.itemName" },
        { k: "unit",          label: "الوحدة",           req: false, listFrom: "units.name" },
        { k: "qty",           label: "الكمية",           req: false, hint: "مثال: 80" },
        { k: "weightPerUnit", label: "وزن/وحدة",         req: false, hint: "مثال: 25" },
        { k: "totalWeight",   label: "إجمالي الوزن",     req: false, readonly: true },
        { k: "notes",         label: "ملاحظات",          req: false }
      ]
    }
  },

  {
    key: "convoy_calc",
    title: "لوحة إدخال احتساب القوافل (Local)",
    compactCols: ["convoyNo", "calcDate", "days", "amount"],
    fields: [
      { k: "convoyNo", label: "رقم القافلة", req: true, listFrom: "convoys.convoyNo" },
      { k: "calcDate", label: "تاريخ الاحتساب", type: "date", req: false },
      { k: "days", label: "عدد الأيام", req: false },
      { k: "amount", label: "المبلغ", req: false },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "pallet_calc",
    title: "لوحة إدخال احتساب الباليتات (Local)",
    compactCols: ["date", "warehouse", "palletsIn", "palletsOut"],
    fields: [
      { k: "date", label: "التاريخ", type: "date", req: false },
      { k: "warehouse", label: "المخزن", req: false, listFrom: "warehouses.name" },
      { k: "palletsIn", label: "باليتات وارد", req: false },
      { k: "palletsOut", label: "باليتات صادر", req: false },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ]
  },

  {
    key: "truck_items",
    title: "لوحة إدخال الأصناف وكمياتها داخل الشاحنة (Local مستقل)",
    compactCols: ["convoyNo", "headNo", "itemName", "qty", "unit"],
    fields: [
      { k: "convoyNo", label: "رقم القافلة", req: false, listFrom: "convoys.convoyNo" },
      { k: "headNo", label: "رقم الرأس", req: true, listFrom: "trucks.headNo" },
      { k: "itemName", label: "الصنف", req: true, listFrom: "items.itemName" },
      { k: "unit", label: "الوحدة", req: false, listFrom: "units.name" },
      { k: "qty", label: "الكمية/عدد القطع", req: false },
      { k: "weightPerUnit", label: "وزن/وحدة", req: false },
      { k: "totalWeight", label: "إجمالي الوزن (تلقائي)", req: false, readonly: true },
      { k: "notes", label: "ملاحظات", type: "textarea", req: false }
    ],
    computed: function (rec) {
      const q = toNum(rec.qty), w = toNum(rec.weightPerUnit);
      rec.totalWeight = (q && w) ? String(q * w) : "";
    }
  },

  {
    key: "car_movements",
    title: "لوحة حركة السيارات (Local)",
    compactCols: ["movementNo", "requestDate", "activityDate", "day", "entrySystem", "transport", "carNo", "tourismCompany", "driverName", "beneficiary", "beneficiaryName", "place", "activity"],
    fields: [
      { k: "requestDate",      label: "تاريخ الطلب",               type: "date",     req: false },
      { k: "activityDate",     label: "تاريخ النشاط",              type: "date",     req: false },
      { k: "day",              label: "يوم النشاط",                req: false,       readonly: true,
        hint: "يُحسب تلقائياً من تاريخ النشاط" },
      { k: "activityTime",     label: "الوقت",                     type: "time_input", req: false },
      { k: "timeNotes",        label: "ملاحظات الوقت",             req: false,       listFrom: "car_movements.timeNotes",
        hint: "مثال: تأخر الانطلاق / تغيير المسار" },
      { k: "departurePlace",   label: "مكان الانطلاق",             req: false,       listFrom: "car_movements.departurePlace" },
      { k: "entrySystem",      label: "نوع الدوام",                req: false,
        type: "select",
        options: ["دوام كامل", "دوام نصف يوم", "دوام جزئي", "مهمة سريعة"],
        hint: "دوام كامل: يوم عمل كامل — نصف يوم: 50% — دوام جزئي: جزء من اليوم — مهمة سريعة: رحلة قصيرة" },
      // ── جهة الاستفادة ──────────────────────────────────────
      { k: "beneficiary",      label: "جهة الاستفادة",             req: false,
        type: "select",
        options: ["إداري", "مشروع"],
        hint: "إداري: يظهر اسم الجهة فقط — مشروع: يظهر رقم الاعتماد والوفد والمانح" },
      { k: "beneficiaryName",  label: "اسم جهة الاستفادة",         req: false,       listFrom: "car_movements.beneficiaryName",
        hint: "اسم المؤسسة / الجهة المستفيدة (مثال: فيرنال، سلام)" },
      // ── السيارة ──────────────────────────────────────────────
      { k: "transport",        label: "نوع السيارة / وسيلة النقل",  req: false,
        type: "select",
        options: [
          "── حسب عدد الركاب ──",
          "سيارة 4 راكب", "سيارة 5 راكب", "سيارة 7 راكب", "سيارة 8 راكب",
          "سيارة 14 راكب (ميكروباص)", "سيارة 26 راكب (ميني باص)",
          "50 راكب (أتوبيس)", "7 راكب (جيب)", "4 راكب (جيب)",
          "── مركبات تجارية ونقل ──",
          "ربع نقل (دبابة)", "ربع نقل (دبابة مبردة)",
          "نقل جامبو", "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق", "شاحنة مبردة", "شاحنة نقل مواد",
          "شاحنة فرش", "سيارة سحب (ونش)", "شاحنة جنب", "شاحنة ستارة"
        ],
        hint: "اختر النوع → تظهر السيارات المتاحة للاختيار" },
      { k: "carNo",            label: "رقم السيارة",               req: false,       listFrom: "cars.carNo",
        hint: "يُعبَّأ تلقائياً عند الاختيار من القائمة" },
      { k: "carOwnerName",     label: "مالك السيارة",              req: false,       listFrom: "cars.carOwnerName",
        hint: "يُعبَّأ تلقائياً" },
      { k: "tourismCompany",   label: "شركة السياحة / شركة النقل", req: false,       listFrom: "contractors.companyName",
        hint: "من لوحة شركات النقل والخدمات اللوجستية" },
      // ── السائق ──────────────────────────────────────────────
      { k: "driverName",       label: "اسم السائق",                req: false,       listFrom: "drivers.driverName",
        hint: "اختر السائق — يُعبَّأ الجوال تلقائياً" },
      { k: "driverPhone",      label: "جوال السائق",               req: false,       type: "phone",
        hint: "يتعبأ تلقائياً", readonly: true },
      { k: "place",            label: "المكان",                    req: false,       listFrom: "car_movements.place" },
      { k: "activity",         label: "النشاط",                    req: false,       listFrom: "car_movements.activity" },
      { k: "executor",         label: "المنفذ",                    req: false,       listFrom: "executors.name",
        hint: "من لوحة المنفذين" },
      // حقول المشروع (تظهر عند اختيار جهة الاستفادة = مشروع)
      { k: "delegation",       label: "الوفد",                     req: false,       listFrom: "car_movements.delegation" },
      { k: "creditNo",         label: "رقم اعتماد المشروع",        req: false,       listFrom: "credits.creditNo" },
      { k: "notes",            label: "ملاحظات",                   type: "textarea", req: false }
    ],
    computedFields: ["day", "movementNo"],
    computed(r) {
      const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
      if (r.activityDate) {
        const d = new Date(r.activityDate);
        if (!isNaN(d)) r.day = DAYS[d.getDay()];
      }
      // رقم الحركة: MV- + رقم تسلسلي بـ4 خانات
      if (r.seq) r.movementNo = "MV-" + String(r.seq).padStart(4, "0");
    }
  },

  // =====================================================
  // لوحة احتساب أجرة السيارات
  // =====================================================
  {
    key: "car_billing",
    title: "لوحة احتساب أجرة السيارات (Local)",
    compactCols: [
      // ── معرّفات السجل ────────────────────────────────────────────
      "_seq", "code",
      // ── بيانات الاحتساب الأساسية ─────────────────────────────────
      "activityDate", "accountingDate",
      // ── رقم الحركة ───────────────────────────────────────────────
      "movementNo",
      // ── بيانات السيارة والسائق ───────────────────────────────────
      "driverName", "transport", "ownership", "accountingParty", "beneficiaryName",
      // ── الأجرة ───────────────────────────────────────────────────
      "fare", "busCount", "subtotal",
      // ── تعديلات المبلغ ───────────────────────────────────────────
      "extraAmount", "extraAmountNote", "discountAmount", "discountNote",
      // ── الإجمالي ──────────────────────────────────────────────────
      "total",
      // ── حالة الاحتساب ────────────────────────────────────────────
      "calcStatus",
      // ── رقم الاعتماد ─────────────────────────────────────────────
      "creditNo",
      // ── رقم القيد (مرتبط بلوحة القيود المستحقة) ─────────────
      "entryNo"
    ],
    // الحقول المأخوذة من car_movements (للعرض في الجدول فقط، لا تُعرض في النموذج)
    _movementCols: ["activityDate","entrySystem","transport","driverName","tourismCompany",
                    "beneficiary","beneficiaryName","departurePlace","delegation","creditNo","ownership","carNo","movementNo"],
    // حقول بيانات الحركة التي تظهر أيضاً في النموذج (للقراءة فقط)
    _movementFormCols: ["beneficiaryName"],  // تُعبَّأ تلقائياً من حركة السيارة
    fields: [
      // يوم الاحتساب فقط (يُدخل هنا، تاريخ النشاط يأتي من حركة السيارات)
      { k: "activityDate",     label: "تاريخ النشاط",             type: "date",     req: false,
        readonly: true,
        hint: "يُملأ تلقائياً من لوحة حركة السيارات" },
      { k: "accountingDate",   label: "يوم الاحتساب",              type: "date",     req: false,
        hint: "تاريخ احتساب الأجر / يوم العمل المحتسب (إذا يختلف عن تاريخ النشاط)" },
      { k: "accountingParty",  label: "جهة التحاسب",               req: false,
        readonly: true,
        hint: "تُملأ تلقائياً: شخصية → اسم السائق | شركة نقل/مقاول → اسم الشركة" },
      // ── التحاسب حسب الثوابت (السعر فقط - العدد محسوب تلقائياً من نوع الدوام) ────
      { type: "section_header", label: "─── التحاسب حسب الثوابت ───" },
      // السعر فقط لكل نوع دوام — العدد يُحدَّد تلقائياً من حقل "نوع الدوام" في حركة السيارات
      { k: "fare",             label: "الأجرة للفترة",             type: "phone",    req: false,
        hint: "يُحسب تلقائياً = نوع الدوام × السعر من الثوابت", readonly: true },
      { k: "busCount",         label: "عدد السيارات / الباصات",    type: "phone",    req: false,
        hint: "عدد صحيح (1 إذا سيارة واحدة) — يُعبَّأ افتراضياً بـ 1" },
      { k: "subtotal",         label: "المجموع (أجرة × عدد السيارات)", type: "phone", req: false,
        hint: "يُحسب تلقائياً", readonly: true },
      // ── مبلغ إضافي وخصم ─────────────────────────────────────
      { type: "section_header", label: "─── تعديلات المبلغ ───" },
      { k: "extraAmount",      label: "مبلغ إضافي",                type: "phone",    req: false,
        hint: "أي مبلغ إضافي يُضاف للإجمالي (مثال: بدل انتظار / وقود إضافي)" },
      { k: "extraAmountNote",  label: "ملاحظة المبلغ الإضافي",     req: false,
        hint: "سبب المبلغ الإضافي" },
      { k: "discountAmount",   label: "خصم",                       type: "phone",    req: false,
        hint: "أي خصم يُطرح من الإجمالي (مثال: تأخر / غياب)" },
      { k: "discountNote",     label: "ملاحظة الخصم",              req: false,
        hint: "سبب الخصم" },
      { k: "total",            label: "الإجمالي النهائي",          type: "phone",    req: false,
        hint: "يُحسب تلقائياً = المجموع + الإضافي - الخصم", readonly: true },
      { k: "creditNo",         label: "رقم اعتماد المشروع",        req: false,
        readonly: true,
        hint: "يُملأ تلقائياً من لوحة حركة السيارات" },
    ],
    // الأعداد تُحسب تلقائياً من entrySystem، الأسعار قابلة للتعديل اليدوي
    computedFields: ["fare", "subtotal", "total", "ownership", "accountingParty", "movementNo", "activityDate", "creditNo"],
    computed(r) {
      const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

      // ── رقم الحركة: توحيد مع car_movements (MV-XXXX من seq) ──────
      if (!r.movementNo) {
        if (r.seq) {
          r.movementNo = "MV-" + String(r.seq).padStart(4, "0");
        } else if (r.movementId && typeof loadPanelLocal === "function") {
          const mvs = loadPanelLocal("car_movements");
          const mv  = mvs.find(m => (m.id || m._id) === r.movementId);
          if (mv) r.movementNo = mv.movementNo || (mv.seq ? "MV-" + String(mv.seq).padStart(4, "0") : "");
        }
      }

      // ── جلب تاريخ النشاط ورقم الاعتماد من car_movements ────────
      if (r.movementNo && typeof loadPanelLocal === "function") {
        const mvs = loadPanelLocal("car_movements");
        const mv  = mvs.find(m => (m.movementNo || "") === (r.movementNo || ""));
        if (mv) {
          if (mv.activityDate) r.activityDate = mv.activityDate;
          if (mv.creditNo)     r.creditNo     = mv.creditNo;
        }
      }

      // ── جلب تبعية السيارة + جهة التحاسب من لوحة cars عبر carNo ──
      if (r.carNo && typeof loadPanelLocal === "function") {
        const cars = loadPanelLocal("cars");
        const carRec = cars.find(c => (c.carNo || "").trim() === (r.carNo || "").trim());
        if (carRec) {
          if (carRec.ownership) r.ownership = carRec.ownership;
          // جهة التحاسب: شخصية → اسم السائق، شركة نقل/مقاول → اسم الشركة/المقاول
          const own = (carRec.ownership || "").trim();
          if (own === "شخصية") {
            r.accountingParty = r.driverName || carRec.driverName || "";
          } else if (own === "شركة نقل" || own === "مقاول") {
            r.accountingParty = carRec.ownerCompany || r.tourismCompany || "";
          } else {
            r.accountingParty = "";
          }
        }
      }

      // ── جلب ثوابت الأسعار من لوحة car_rates ──────────────────
      const carType = (r.transport || "").trim();
      let rateFullDay = 0, rateHalfDay = 0, rateQuick = 0;
      let rateNear = 0, rateFar = 0, rateExtra = 0;
      if (carType && typeof loadPanelLocal === "function") {
        const rates = loadPanelLocal("car_rates");
        const rateRec = [...rates].reverse().find(x => (x.carType || "").trim() === carType);
        if (rateRec) {
          rateFullDay = parseFloat(rateRec.fullDayRate)       || 0;
          // نصف يوم: من الثابت أو = نصف الدوام الكامل تلقائياً
          rateHalfDay = parseFloat(rateRec.halfDayRate)       || (rateFullDay > 0 ? rateFullDay / 2 : 0);
          // مهمة سريعة: من الثابت أو = ربع الدوام الكامل تلقائياً
          rateQuick   = parseFloat(rateRec.quickMissionRate)  || (rateFullDay > 0 ? rateFullDay / 4 : 0);
          rateNear    = parseFloat(rateRec.partialNearRate)   || 0;
          rateFar     = parseFloat(rateRec.partialFarRate)    || 0;
          rateExtra   = parseFloat(rateRec.extraRate)         || 0;
        }
      }

      // ── تعبئة أسعار الدوام من الثوابت (فقط إذا لم يدخل المستخدم قيمة يدوياً) ─
      // القاعدة: إذا كان الحقل فارغاً أو يحمل نفس قيمة الثابت السابق → استبدله بالثابت الجديد
      // إذا كان المستخدم غيّره يدوياً (قيمة مختلفة عن الثابت) → احتفظ بقيمته
      const _fillRate = (fieldKey, rateVal) => {
        if (!rateVal) return;
        const cur = parseFloat(r[fieldKey]);
        // اعتبر الحقل "يدوي" فقط إذا كان غير فارغ ويختلف عن قيمة الثابت بفارق > 1 ريال
        // هذا يسمح للمستخدم بتعديل السعر يدوياً والاحتفاظ به
        const isManual = !isNaN(cur) && cur > 0 && Math.abs(cur - rateVal) > 0.9;
        if (!isManual) r[fieldKey] = String(rateVal);
      };
      _fillRate("fullDayFare",      rateFullDay);
      _fillRate("halfDayFare",      rateHalfDay);
      _fillRate("quickMissionFare", rateQuick);
      _fillRate("partialNearFare",  rateNear);
      _fillRate("partialFarFare",   rateFar);
      _fillRate("extraFare",        rateExtra);

      // ── تحديد أعداد الدوام دائماً من نوع الدوام (entrySystem) ──────
      // هذه القيم محسوبة تلقائياً وليست حقولاً في النموذج
      const sys = (r.entrySystem || "").trim();
      r.fullDaysCount      = (sys === "دوام كامل")    ? "1" : "0";
      r.halfDaysCount      = (sys === "دوام نصف يوم") ? "1" : "0";
      r.quickMissionsCount = (sys === "مهمة سريعة")   ? "1" : "0";
      r.partialNearCount   = (sys === "دوام جزئي")    ? "1" : "0";
      r.partialFarCount    = "0";
      r.extraCount         = "0";

      // ── حساب الأجرة الإجمالية للفترة ─────────────────────────
      const nFull   = parseFloat(r.fullDaysCount)      || 0;
      const nHalf   = parseFloat(r.halfDaysCount)      || 0;
      const nQuick  = parseFloat(r.quickMissionsCount) || 0;
      const nNear   = parseFloat(r.partialNearCount)   || 0;
      const nFar    = parseFloat(r.partialFarCount)    || 0;
      const nExtra  = parseFloat(r.extraCount)         || 0;

      const fFull   = parseFloat(r.fullDayFare)      || rateFullDay;
      const fHalf   = parseFloat(r.halfDayFare)      || rateHalfDay;
      const fQuick  = parseFloat(r.quickMissionFare) || rateQuick;
      const fNear   = parseFloat(r.partialNearFare)  || rateNear;
      const fFar    = parseFloat(r.partialFarFare)   || rateFar;
      const fExtra  = parseFloat(r.extraFare)        || rateExtra;

      const fareTotal = (nFull  * fFull)  + (nHalf  * fHalf)  + (nQuick * fQuick)
                      + (nNear  * fNear)  + (nFar   * fFar)   + (nExtra * fExtra);
      if (fareTotal > 0) r.fare = fareTotal.toFixed(2);

      // ── المجموع الفرعي = الأجرة × عدد السيارات ───────────────
      // عدد السيارات: افتراضي 1 إذا كان فارغاً أو أقل من 1
      if (!r.busCount || parseFloat(r.busCount) < 1) r.busCount = "1";
      const count    = parseFloat(r.busCount) || 1;
      const fare     = fareTotal || (parseFloat(r.fare) || 0);
      const subtotal = fare > 0 ? fare * count : 0;
      if (subtotal > 0) r.subtotal = subtotal.toFixed(2);

      // ── الإجمالي النهائي = المجموع + الإضافي - الخصم ─────────
      const extraAmt    = parseFloat(r.extraAmount)    || 0;
      const discountAmt = parseFloat(r.discountAmount) || 0;
      const total = subtotal + extraAmt - discountAmt;
      if (total > 0) r.total = total.toFixed(2);

      // ── حالة التحاسب: من سجل الدفع الواحد المرتبط (movementId أو movementNo) ──
      if (typeof loadPanelLocal === "function") {
        const payments = loadPanelLocal("car_payment_cashbox");
        // البحث بـ movementId (الأكثر دقة) أولاً، ثم movementNo
        const mvId = r.movementId || "";
        const mvNo = (r.movementNo || "").trim();
        // تجميع السجلات المطابقة وأخذ الأحدث فقط
        let relatedPay = null;
        if (mvId) {
          const byId = payments.filter(p => (p.movementId || "") === mvId);
          if (byId.length > 0) {
            relatedPay = byId.sort((a,b) => (b.updated_at || b.id || "").localeCompare(a.updated_at || a.id || ""))[0];
          }
        }
        if (!relatedPay && mvNo) {
          const byNo = payments.filter(p => (p.movementNo || "").trim() === mvNo);
          if (byNo.length > 0) {
            relatedPay = byNo.sort((a,b) => (b.updated_at || b.id || "").localeCompare(a.updated_at || a.id || ""))[0];
          }
        }
        // استخدام البيانات من سجل الدفع (totalPaidAfter هو الإجمالي المدفوع)
        const totalPaid = relatedPay
          ? (parseFloat(relatedPay.totalPaidAfter) || parseFloat(relatedPay.paidAmount) || 0)
          : 0;
        r.paidAmount = totalPaid > 0 ? String(totalPaid.toFixed(2)) : "0";
        const remaining = total - totalPaid;
        r.amount = remaining > 0 ? remaining.toFixed(2) : "0.00";
        if (total <= 0) {
          r.accountingStatus = "لم يُحاسب";
        } else if (totalPaid <= 0) {
          r.accountingStatus = "لم يُحاسب";
        } else if (Math.abs(totalPaid - total) < 0.01 || totalPaid >= total) {
          r.accountingStatus = "محاسب كامل";
        } else {
          r.accountingStatus = "محاسب جزئي";
        }
      } else {
        if (!r.accountingStatus) r.accountingStatus = "لم يُحاسب";
      }

    }
  },

  // =====================================================
  // لوحة ثوابت أجور السيارات
  // =====================================================
  {
    key: "car_rates",
    title: "لوحة ثوابت أجور السيارات (Local)",
    compactCols: ["carType", "driverName", "fullDayRate", "halfDayRate", "quickMissionRate", "partialNearRate", "partialFarRate", "extraRate"],
    fields: [
      { k: "carType",           label: "نوع / وسيلة النقل",       req: true,
        type: "select",
        options: [
          "── حسب عدد الركاب ──",
          "سيارة 4 راكب", "سيارة 5 راكب", "سيارة 7 راكب", "سيارة 8 راكب",
          "سيارة 14 راكب (ميكروباص)", "سيارة 26 راكب (ميني باص)",
          "50 راكب (أتوبيس)", "7 راكب (جيب)", "4 راكب (جيب)",
          "── مركبات تجارية ونقل ──",
          "ربع نقل (دبابة)", "ربع نقل (دبابة مبردة)",
          "نقل جامبو", "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق", "شاحنة مبردة", "شاحنة نقل مواد",
          "شاحنة فرش", "سيارة سحب (ونش)", "شاحنة جنب", "شاحنة ستارة"
        ],
        hint: "اختر نوع وسيلة النقل" },
      { k: "driverName",        label: "اسم السائق",                req: false,
        hint: "اختياري - اسم السائق المرتبط بهذا الثابت", listFrom: "car_movements.driverName" },
      { k: "_ratesHeader",      label: "أسعار الدوام (بالجنيه)",  type: "section_header" },
      { k: "fullDayRate",       label: "دوام كامل",                req: false, type: "phone",
        hint: "السعر لليوم الكامل" },
      { k: "halfDayRate",       label: "دوام نصف يوم",             req: false, type: "phone",
        hint: "50% من اليوم — يُملأ تلقائياً بنصف الدوام الكامل إن تُرك فارغاً" },
      { k: "quickMissionRate",  label: "مهمة سريعة",               req: false, type: "phone",
        hint: "رحلة قصيرة / مهمة محددة — أقل من نصف يوم" },
      { k: "partialNearRate",   label: "دوام جزئي قريب",           req: false, type: "phone",
        hint: "السعر للدوام الجزئي القريب" },
      { k: "partialFarRate",    label: "دوام جزئي بعيد",           req: false, type: "phone",
        hint: "السعر للدوام الجزئي البعيد" },
      { k: "extraRate",         label: "إضافي",                    req: false, type: "phone",
        hint: "سعر الساعات الإضافية (0 إذا لا يوجد)" },
      { k: "notes",             label: "ملاحظات",                   type: "textarea", req: false }
    ],
    // بيانات افتراضية — halfDayRate = نصف fullDayRate، quickMissionRate = ربع fullDayRate
    defaults: [
      { carType: "سيارة 4 راكب",        fullDayRate: "1700", halfDayRate: "850",  quickMissionRate: "425", partialNearRate: "800",  partialFarRate: "1000", extraRate: "0" },
      { carType: "سيارة 5 راكب",        fullDayRate: "1700", halfDayRate: "850",  quickMissionRate: "425", partialNearRate: "800",  partialFarRate: "1000", extraRate: "0" },
      { carType: "سيارة 7 راكب",        fullDayRate: "2700", halfDayRate: "1350", quickMissionRate: "675", partialNearRate: "1000", partialFarRate: "1200", extraRate: "0" },
      { carType: "سيارة 8 راكب",        fullDayRate: "2700", halfDayRate: "1350", quickMissionRate: "675", partialNearRate: "1000", partialFarRate: "1200", extraRate: "0" },
      { carType: "سيارة 14 راكب (ميكروباص)", fullDayRate: "3500", halfDayRate: "1750", quickMissionRate: "875", partialNearRate: "1200", partialFarRate: "1500", extraRate: "0" },
      { carType: "سيارة 26 راكب (ميني باص)", fullDayRate: "3800", halfDayRate: "1900", quickMissionRate: "950", partialNearRate: "1200", partialFarRate: "1500", extraRate: "0" },
      { carType: "50 راكب (أتوبيس)",    fullDayRate: "4000", halfDayRate: "2000", quickMissionRate: "1000", partialNearRate: "1200", partialFarRate: "1200", extraRate: "0" },
      { carType: "7 راكب (جيب)",        fullDayRate: "2700", halfDayRate: "1350", quickMissionRate: "675", partialNearRate: "1000", partialFarRate: "1200", extraRate: "0" },
      { carType: "4 راكب (جيب)",        fullDayRate: "1700", halfDayRate: "850",  quickMissionRate: "425", partialNearRate: "800",  partialFarRate: "1000", extraRate: "0" }
    ]
  },

  {
    key: "cashbox",
    title: "تقرير الصندوق (إدخال) (Local)",
    compactCols: ["expenseDate", "payDate", "spenderName", "cashboxName", "statement", "amount", "creditNo"],
    fields: [
      { k: "spenderName",  label: "اسم الشخص الذي صرف",  req: false, listFrom: "cashbox.spenderName",  hint: "اكتب أو اختر الاسم" },
      { k: "cashboxName",  label: "اسم الصندوق الدافع",  req: false, listFrom: "cashbox.cashboxName",  hint: "مثال: صندوق المشاريع / الصندوق الرئيسي" },
      { k: "expenseDate",  label: "تاريخ المصروف",        type: "date", req: false },
      { k: "payDate",      label: "تاريخ الدفع",          type: "date", req: false },
      { k: "statement",    label: "البيان النصي",         req: true,  hint: "", listFrom: "cashbox.statement" },
      { k: "amount",       label: "المبلغ",               req: true,  hint: "" },
      { k: "creditNo",     label: "رقم الاعتماد",         req: false, listFrom: "credits.creditNo" },
      { k: "itemName",     label: "اسم الصنف",            req: false, listFrom: "items.itemName" },
      { k: "expenseType",  label: "المصروفات",            req: false, hint: "ميزان/نقل/بياتات/تنسيقات", listFrom: "cashbox.expenseType" },
      { k: "donorName",    label: "اسم المانح",           req: false, listFrom: "donors.name" },
      { k: "contractor",   label: "شركة النقل/المقاول",   req: false, listFrom: "contractors.companyName" },
      { k: "notes",        label: "ملاحظات",              type: "textarea", req: false }
    ]
  },

  // =====================================================
  // لوحة ثوابت أجور الشاحنات
  // =====================================================
  {
    key: "truck_rates",
    title: "لوحة ثوابت أجور الشاحنات (Local)",
    compactCols: ["truckType", "transportType", "destination", "naulonRate", "driverExpenses", "scaleExpenses", "otherExpenses"],
    fields: [
      { type: "section_header", label: "─── تصنيف الشاحنة ───" },
      { k: "truckType",       label: "نوع الشاحنة",       req: true,  type: "select",
        options: [
          "ربع نقل (دبابة)",
          "ربع نقل (دبابة مبردة)",
          "نقل جامبو",
          "نقل جامبو (مبردة)",
          "شاحنة صندوق مغلق",
          "شاحنة مبردة",
          "شاحنة نقل مواد",
          "شاحنة فرش",
          "شاحنة جنب",
          "شاحنة ستارة",
          "سيارة سحب (ونش)"
        ]
      },
      { k: "transportType",   label: "نوع النقل",         req: false, type: "select",
        options: ["نقل داخلي", "نقل خارجي (معبر)"],
        hint: "داخلي: من المخزن أو المطحنة للفرع — خارجي: عبر المعبر"
      },
      { k: "destination",     label: "الوجهة / المدينة",  req: false,
        hint: "المدينة أو المنطقة التي يذهب إليها النقل",
        listFrom: "truck_rates.destination"
      },
      { type: "section_header", label: "─── تكاليف النقل (بالجنيه) ───" },
      { k: "naulonRate",      label: "النولون (أجرة النقل)", type: "phone", req: false,
        hint: "المبلغ المتفق عليه مقابل نقل البضاعة"
      },
      { k: "driverExpenses",  label: "مصاريف السائق",      type: "phone", req: false,
        hint: "مصاريف الوقود والمبيت وغيرها للسائق"
      },
      { k: "scaleExpenses",   label: "مصاريف الميزان",     type: "phone", req: false,
        hint: "رسوم وزن البضاعة عند المعابر أو المخازن"
      },
      { k: "otherExpenses",   label: "مصاريف أخرى",        type: "phone", req: false,
        hint: "أي مصاريف إضافية غير مدرجة"
      },
      { k: "notes",           label: "ملاحظات",             type: "textarea", req: false }
    ]
  },

  // =====================================================
  // لوحة احتساب القوافل
  // =====================================================
  {
    key: "convoy_billing",
    title: "لوحة احتساب القوافل (Local)",
    compactCols: [
      "accountingStatus",
      "convoyBillingNo",
      "accountingDate",
      "headNo", "truckType", "driverName",
      "ownership", "truckAccountingParty",
      "transportType", "destination",
      "naulon", "driverExpenses", "scaleExpenses", "otherExpenses",
      "subtotal", "extraAmount", "discountAmount", "total",
      "paidAmount", "amount", "payDate",
      "beneficiary", "beneficiaryName",
      "delegation", "creditNo",
      "statement", "notes"
    ],
    computedFields: [
      "convoyBillingNo", "subtotal", "total", "amount",
      "accountingStatus", "truckAccountingParty",
      "ownership", "truckType", "driverName", "statement"
    ],
    computed(r) {
      // ── رقم الاحتساب التسلسلي ──────────────────────────────────
      if (r.seq) r.convoyBillingNo = "CB-" + String(r.seq).padStart(4, "0");

      // ── جلب بيانات الشاحنة من لوحة trucks ──────────────────────
      if (r.headNo && typeof loadPanelLocal === "function") {
        const trucks = loadPanelLocal("trucks");
        const truck = trucks.find(t => (t.headNo || "").trim() === (r.headNo || "").trim());
        if (truck) {
          if (!r.truckType  || r.truckType  === "") r.truckType  = truck.truckType  || "";
          if (!r.driverName || r.driverName === "") r.driverName = truck.driverName || "";
          if (!r.ownership  || r.ownership  === "") r.ownership  = truck.ownership  || "";
          if (!r.ownerCompany) r.ownerCompany = truck.ownerCompany || truck.headOwner || "";
        }
      }

      // ── جلب ثوابت النولون من لوحة truck_rates ──────────────────
      if (r.truckType && typeof loadPanelLocal === "function") {
        const rates = loadPanelLocal("truck_rates");
        const rate = rates.find(rt =>
          (rt.truckType || "").trim() === (r.truckType || "").trim() &&
          (!rt.transportType || !r.transportType ||
            (rt.transportType || "").trim() === (r.transportType || "").trim())
        );
        if (rate) {
          const setIfAuto = (field, val) => {
            const cur = parseFloat(r[field]);
            const nv  = parseFloat(val);
            if (!r[field] || (!isNaN(nv) && !isNaN(cur) && Math.abs(cur - nv) < 0.9)) {
              r[field] = val || r[field];
            }
          };
          setIfAuto("naulon",         rate.naulonRate);
          setIfAuto("driverExpenses", rate.driverExpenses);
          setIfAuto("scaleExpenses",  rate.scaleExpenses);
          setIfAuto("otherExpenses",  rate.otherExpenses);
        }
      }

      // ── حساب الأرقام ────────────────────────────────────────────
      const nNaulon   = parseFloat(r.naulon)         || 0;
      const nDriver   = parseFloat(r.driverExpenses) || 0;
      const nScale    = parseFloat(r.scaleExpenses)  || 0;
      const nOther    = parseFloat(r.otherExpenses)  || 0;
      const nExtra    = parseFloat(r.extraAmount)    || 0;
      const nDiscount = parseFloat(r.discountAmount) || 0;
      const nPaid     = parseFloat(r.paidAmount)     || 0;

      const sub   = nNaulon + nDriver + nScale + nOther;
      const total = sub + nExtra - nDiscount;
      const rem   = total > 0 ? Math.max(0, total - nPaid) : 0;

      r.subtotal = sub.toFixed(2);
      r.total    = total > 0 ? total.toFixed(2) : "";
      r.amount   = total > 0
        ? (nPaid >= total - 0.01 ? "0.00" : rem.toFixed(2))
        : "";

      // ── حالة التحاسب ────────────────────────────────────────────
      if (!r.total || parseFloat(r.total) === 0) {
        r.accountingStatus = "لم يُحاسب";
      } else if (nPaid > 0 && nPaid >= parseFloat(r.total) - 0.01) {
        r.accountingStatus = "محاسب كامل";
      } else if (nPaid > 0) {
        r.accountingStatus = "محاسب جزئي";
      } else {
        r.accountingStatus = "لم يُحاسب";
      }

      // ── جهة التحاسب (من تبعية الشاحنة) ─────────────────────────
      const ow = (r.ownership || "").trim();
      if (ow === "شخصية") {
        r.truckAccountingParty = (r.driverName || "").trim();
      } else if (ow === "شركة نقل" || ow === "مقاول") {
        r.truckAccountingParty = (r.ownerCompany || r.driverName || "").trim();
      } else {
        r.truckAccountingParty = (r.driverName || "").trim();
      }

      // ── بناء نص القيد ───────────────────────────────────────────
      const acctDate   = r.accountingDate || r.convoyDate || "";
      const dateStr    = acctDate ? acctDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1") : "";
      const tType      = (r.truckType     || "").trim();
      const tTransport = (r.transportType || "").trim();
      const dest       = (r.destination   || "").trim();
      const convoyNo   = (r.convoyNo      || "").trim();
      const party      = (r.truckAccountingParty || r.driverName || "").trim();

      // السطر الأول: نولون شاحنة + رقم الرأس + نوع + نقل + وجهة + تاريخ
      let line1Parts = [];
      if (party)      line1Parts.push("نولون " + party);
      if (tType)      line1Parts.push(tType);
      if (r.headNo)   line1Parts.push("رأس " + r.headNo);
      if (convoyNo)   line1Parts.push("قافلة " + convoyNo);
      if (tTransport) line1Parts.push(tTransport);
      if (dest)       line1Parts.push("إلى " + dest);
      if (dateStr)    line1Parts.push(dateStr);
      const line1 = line1Parts.join(" - ");

      // السطر الثاني: جهة الاستفادة + اعتماد + تاريخ الدفع
      let line2Parts = [];
      const bName = (r.beneficiaryName || "").trim();
      const deleg = (r.delegation      || "").trim();
      const cNo   = (r.creditNo        || r.creditNo2 || "").trim();
      const pDate = r.payDate ? r.payDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1") : "";
      if (bName) line2Parts.push("لصالح " + bName);
      if (deleg) line2Parts.push("لوفد " + deleg);
      if (cNo)   line2Parts.push("اعتماد " + cNo);
      if (pDate) line2Parts.push("تاريخ الدفع " + pDate);
      const line2 = line2Parts.join(" - ");

      r.statement = line2 ? (line1 + "\n" + line2) : line1;
    },

    fields: [
      { type: "section_header", label: "─── بيانات القافلة ───" },
      { k: "convoyBillingNo", label: "رقم الاحتساب",      req: false, readonly: true,
        hint: "يتولد تلقائياً (CB-0001)" },
      { k: "accountingDate",  label: "تاريخ الاحتساب",    type: "date", req: false,
        hint: "تاريخ إجراء الاحتساب" },
      { k: "convoyNo",        label: "رقم القافلة",        req: false,
        hint: "رقم القافلة المرتبطة",
        listFrom: "convoys.convoyNo" },
      { k: "convoyDate",      label: "تاريخ القافلة",      type: "date", req: false,
        hint: "تاريخ انطلاق القافلة" },

      { type: "section_header", label: "─── بيانات الشاحنة ───" },
      { k: "headNo",          label: "رقم الرأس (الشاحنة)", req: false,
        hint: "اختر رقم الرأس لتعبئة بيانات الشاحنة تلقائياً",
        listFrom: "trucks.headNo" },
      { k: "truckType",       label: "نوع الشاحنة",        req: false, readonly: true,
        hint: "تُملأ تلقائياً من لوحة الشاحنات" },
      { k: "driverName",      label: "اسم السائق",          req: false, readonly: true,
        hint: "تُملأ تلقائياً من لوحة الشاحنات" },
      { k: "ownership",       label: "تبعية الشاحنة",       req: false, readonly: true,
        hint: "شخصية / شركة نقل / مقاول — تُملأ تلقائياً" },
      { k: "truckAccountingParty", label: "جهة التحاسب",   req: false, readonly: true,
        hint: "السائق إذا شخصية، أو الشركة/المقاول إذا شركة نقل" },

      { type: "section_header", label: "─── بيانات النقل ───" },
      { k: "transportType",   label: "نوع النقل",           req: false, type: "select",
        options: ["نقل داخلي", "نقل خارجي (معبر)"],
        hint: "داخلي: من المخزن للفرع — خارجي: عبر المعبر"
      },
      { k: "destination",     label: "الوجهة / المدينة",    req: false,
        hint: "المدينة أو المنطقة الوجهة",
        listFrom: "truck_rates.destination" },

      { type: "section_header", label: "─── احتساب النولون (بالجنيه) ───" },
      { k: "naulon",          label: "النولون (أجرة النقل)", type: "phone", req: false,
        hint: "تُملأ تلقائياً من لوحة الثوابت — يمكن تعديلها" },
      { k: "driverExpenses",  label: "مصاريف السائق",        type: "phone", req: false,
        hint: "مصاريف الوقود والمبيت وغيرها" },
      { k: "scaleExpenses",   label: "مصاريف الميزان",       type: "phone", req: false,
        hint: "رسوم وزن البضاعة" },
      { k: "otherExpenses",   label: "مصاريف أخرى",          type: "phone", req: false,
        hint: "أي مصاريف إضافية" },
      { k: "subtotal",        label: "المجموع الفرعي",        type: "phone", req: false, readonly: true,
        hint: "النولون + مصاريف السائق + الميزان + أخرى (يُحسب تلقائياً)" },
      { k: "extraAmount",     label: "مبلغ إضافي",           type: "phone", req: false,
        hint: "أي مبلغ إضافي يُضاف للإجمالي" },
      { k: "extraAmountNote", label: "ملاحظة الإضافي",        req: false,
        hint: "سبب المبلغ الإضافي" },
      { k: "discountAmount",  label: "مبلغ خصم",             type: "phone", req: false,
        hint: "خصم يُطرح من الإجمالي" },
      { k: "discountNote",    label: "ملاحظة الخصم",          req: false,
        hint: "سبب الخصم" },
      { k: "total",           label: "الإجمالي",              type: "phone", req: false, readonly: true,
        hint: "المجموع الفرعي + إضافي - خصم (يُحسب تلقائياً)" },

      { type: "section_header", label: "─── التحاسب ───" },
      { k: "paidAmount",      label: "المبلغ المدفوع",        type: "phone", req: false,
        hint: "المبلغ المدفوع فعلياً" },
      { k: "payDate",         label: "تاريخ الدفع",           type: "date",  req: false },
      { k: "amount",          label: "المبلغ المتبقي",         type: "phone", req: false, readonly: true,
        hint: "الإجمالي − المدفوع (يُحسب تلقائياً)" },
      { k: "accountingStatus", label: "حالة التحاسب",         req: false, readonly: true,
        hint: "تُحسب تلقائياً: لم يُحاسب / محاسب جزئي / محاسب كامل" },

      { type: "section_header", label: "─── جهة الاستفادة والاعتماد ───" },
      { k: "beneficiary",     label: "جهة الاستفادة",         req: false, type: "select",
        options: ["إداري", "مشروع"],
        hint: "إداري: يُدرج تحت الإدارة — مشروع: يُدرج تحت رقم الاعتماد" },
      { k: "beneficiaryName", label: "اسم جهة الاستفادة",     req: false,
        hint: "اسم الجهة أو المشروع المستفيد",
        listFrom: "car_movements.beneficiaryName" },
      { k: "delegation",      label: "الوفد",                 req: false,
        listFrom: "car_movements.delegation" },
      { k: "creditNo",        label: "رقم اعتماد المشروع",    req: false,
        listFrom: "credits.creditNo" },

      { type: "section_header", label: "─── القيد المحاسبي ───" },
      { k: "statement",       label: "نص القيد",               type: "textarea", req: false,
        hint: "يُبنى تلقائياً — يمكن تعديله يدوياً" },
      { k: "notes",           label: "ملاحظات",                type: "textarea", req: false }
    ]
  },

  // =====================================================
  // لوحة القيود (مفردة + مجمعة)
  // =====================================================
  {
    key: "combined_entries",
    title: "لوحة القيود المستحقة (Local)",
    compactCols: [
      "_payBtn",
      "entryNo",
      "entryCreatedAt",
      "entryType",
      "accountingParty", "beneficiaryName", "transport",
      "movementNos", "recordCount",
      "totalAmount",
      "mergedStatement", "creditNo2", "notes"
    ],
    fields: [
      { k: "entryCreatedAt",   label: "تاريخ إنشاء القيد",     type: "date",     req: false, readonly: true,
        hint: "يتولد تلقائياً عند إنشاء القيد" },
      { type: "section_header", label: "─── نوع القيد ───" },
      { k: "entryType",        label: "نوع القيد",            req: false,
        type: "select",
        options: ["جميع القيود", "القيود المفردة", "القيود المجمعة", "غير المحاسب عليها", "المحاسب جزئياً", "المحاسب عليها بالكامل"],
        hint: "اختر نوع القيود لتصفية العرض — لا يُحفظ مع السجل"
      },
      { type: "section_header", label: "─── بيانات المجموعة ───" },
      { k: "accountingParty",  label: "جهة التحاسب",         req: false, readonly: true,
        hint: "السائق أو شركة النقل — تُملأ تلقائياً" },
      { k: "beneficiaryName",  label: "جهة الاستفادة",        req: false, readonly: true,
        hint: "تُملأ تلقائياً من لوحة الاحتساب" },
      { k: "transport",        label: "نوع السيارة",          req: false, readonly: true,
        hint: "تُملأ تلقائياً من لوحة الاحتساب" },
      { k: "movementNos",      label: "أرقام الحركات",         req: false, readonly: true,
        hint: "أرقام حركات السيارات المجمّعة — تُملأ تلقائياً" },
      { k: "recordCount",      label: "عدد السجلات المجمّعة", req: false, readonly: true,
        hint: "عدد حركات السيارات المتشابهة" },
      { type: "section_header", label: "─── المبالغ ───" },
      { k: "totalAmount",      label: "الإجمالي الكلي",       type: "phone", req: false, readonly: true,
        hint: "مجموع إجمالي جميع السجلات" },
      { type: "section_header", label: "─── القيد ───" },
      { k: "mergedStatement",  label: "القيد",                 type: "textarea", req: false,
        hint: "نص القيد — يمكن تعديله يدوياً" },
      { k: "creditNo2",        label: "رقم اعتماد المشروع",   req: false, listFrom: "credits.creditNo" },
      { k: "notes",            label: "ملاحظات",               type: "textarea", req: false }
    ]
  },

  // =====================================================
  // صندوق دفع حركات السيارات — سجل كل دفعة مدفوعة
  // =====================================================
  {
    key: "car_payment_cashbox",
    title: "صندوق دفع حركات السيارات (Local)",
    compactCols: [
      "accountingStatus",
      "payDate", "movementNo", "accountingParty", "beneficiaryName",
      "transport", "totalAmount", "paidAmount", "remainingAmount",
      "paymentType", "paidBy",
      "periodFromDate", "periodFromDay", "periodToDate", "periodToDay",
      "statement", "creditNo2", "notes"
    ],
    fields: [
      { type: "section_header", label: "─── بيانات الدفعة ───" },
      { k: "payDate",          label: "تاريخ الدفع",           type: "date",   req: false,
        hint: "تاريخ تسجيل الدفعة في الصندوق" },
      { k: "paymentType",      label: "نوع الدفع",             req: false,
        type: "select",
        options: ["دفعة كاملة", "دفعة جزئية", "سلفة", "تسوية"],
        hint: "نوع عملية الدفع" },
      { k: "paidBy",           label: "الدافع",                req: false,
        listFrom: "cashbox.cashboxName",
        hint: "اسم الصندوق أو الشخص الذي صرف الدفعة" },
      { k: "referenceNo",      label: "رقم القيد",  req: false,
        hint: "رقم القيد المرتبط بلوحة القيود المستحقة" },

      { type: "section_header", label: "─── بيانات الحركة المرتبطة ───" },
      { k: "movementNo",       label: "رقم الحركة",            req: false, readonly: true,
        hint: "يُملأ تلقائياً من سجل الاحتساب المرتبط" },
      { k: "activityDate",     label: "تاريخ النشاط",          type: "date",   req: false, readonly: true,
        hint: "تاريخ النشاط الأصلي للحركة" },
      { k: "accountingParty",  label: "جهة التحاسب",           req: false, readonly: true,
        hint: "السائق أو شركة النقل" },
      { k: "beneficiaryName",  label: "جهة الاستفادة",          req: false, readonly: true,
        hint: "الجهة المستفيدة من الرحلة" },
      { k: "transport",        label: "نوع السيارة",            req: false, readonly: true },
      { k: "driverName",       label: "اسم السائق",             req: false, readonly: true },

      { type: "section_header", label: "─── المبالغ ───" },
      { k: "totalAmount",      label: "المستحق الإجمالي",       type: "phone", req: false, readonly: true,
        hint: "الإجمالي المحتسب من سجل الاحتساب" },
      { k: "paidAmountBefore", label: "المدفوع سابقاً",         type: "phone", req: false, readonly: true,
        hint: "إجمالي ما دُفع قبل هذه الدفعة" },
      { k: "paidAmount",       label: "مبلغ هذه الدفعة",        type: "phone", req: true,
        hint: "المبلغ المدفوع في هذه العملية" },
      { k: "totalPaidAfter",   label: "إجمالي المدفوع بعد الدفعة", type: "phone", req: false, readonly: true,
        hint: "يُحسب تلقائياً = المدفوع سابقاً + مبلغ هذه الدفعة" },
      { k: "remainingAmount",  label: "المتبقي بعد الدفعة",     type: "phone", req: false, readonly: true,
        hint: "يُحسب تلقائياً = المستحق الإجمالي − إجمالي المدفوع" },
      { k: "accountingStatus", label: "حالة التحاسب",           req: false, readonly: true,
        hint: "تُحدَّد تلقائياً: محاسب كامل / محاسب جزئي / لم يُحاسب" },

      { type: "section_header", label: "─── نطاق الفترة ───" },
      { k: "periodFromDate",   label: "من تاريخ",               type: "date",  req: false,
        hint: "بداية فترة التشغيل" },
      { k: "periodFromDay",    label: "من يوم",                  req: false, readonly: true,
        hint: "يُحسب تلقائياً" },
      { k: "periodToDate",     label: "حتى تاريخ",              type: "date",  req: false,
        hint: "نهاية فترة التشغيل" },
      { k: "periodToDay",      label: "حتى يوم",                 req: false, readonly: true,
        hint: "يُحسب تلقائياً" },

      { type: "section_header", label: "─── القيد والملاحظات ───" },
      { k: "creditNo2",        label: "رقم اعتماد المشروع",     req: false, listFrom: "credits.creditNo" },
      { k: "statement",        label: "القيد / بيان الصرف",     type: "textarea", req: false,
        hint: "يتولد تلقائياً — يمكن تعديله يدوياً" },
      { k: "notes",            label: "ملاحظات",                 type: "textarea", req: false }
    ],
    computedFields: ["totalPaidAfter", "remainingAmount", "accountingStatus", "statement", "periodFromDay", "periodToDay"],
    computed(r) {
      const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

      // ── أيام نطاق الفترة ──────────────────────────────────────
      if (r.periodFromDate) {
        const d = new Date(r.periodFromDate);
        if (!isNaN(d)) r.periodFromDay = DAYS[d.getDay()];
      }
      if (r.periodToDate) {
        const d = new Date(r.periodToDate);
        if (!isNaN(d)) r.periodToDay = DAYS[d.getDay()];
      }

      // ── حساب المبالغ ──────────────────────────────────────────
      const total    = parseFloat(r.totalAmount)      || 0;
      const before   = parseFloat(r.paidAmountBefore) || 0;
      const current  = parseFloat(r.paidAmount)       || 0;
      const afterPay = before + current;
      const remaining = Math.max(0, total - afterPay);

      r.totalPaidAfter  = afterPay  > 0 ? String(Math.round(afterPay))  : "";
      r.remainingAmount = remaining >= 0 && total > 0 ? String(Math.round(remaining)) : "";

      // ── حالة التحاسب ──────────────────────────────────────────
      if (total <= 0) {
        r.accountingStatus = "";
      } else if (remaining <= 0) {
        r.accountingStatus = "محاسب كامل";
      } else if (afterPay > 0) {
        r.accountingStatus = "محاسب جزئي";
      } else {
        r.accountingStatus = "لم يُحاسب";
      }

      // ── بناء القيد / بيان الصرف تلقائياً ─────────────────────
      if (!r._statementManual) {
        const fmtDate = (ds) => {
          if (!ds) return "";
          const d = new Date(ds);
          return isNaN(d) ? "" : d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
        };

        // السطر الأول: جهة التحاسب + نوع السيارة + نطاق الفترة
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

        // السطر الثاني: جهة الاستفادة + رقم الاعتماد + مبلغ الدفعة
        let line2Parts = [];
        if (r.beneficiaryName) line2Parts.push("لصالح " + r.beneficiaryName);
        if (r.creditNo2)       line2Parts.push("رقم اعتماد " + r.creditNo2);
        if (r.movementNo)      line2Parts.push("حركة " + r.movementNo);
        if (r.paymentType)     line2Parts.push(r.paymentType);
        if (current > 0)       line2Parts.push("مبلغ " + Math.round(current).toLocaleString("en-US"));
        if (remaining > 0)     line2Parts.push("متبقي " + Math.round(remaining).toLocaleString("en-US"));

        const line1 = line1Parts.join(" ");
        const line2 = line2Parts.join(" | ");
        r.statement = line2 ? line1 + "\n" + line2 : line1;
      }
    }
  }
];


// ---- Inject seq + code into ALL panels (Local) ----
(function injectMetaFields(){
  for (const p of PANELS) {
    p.fields = p.fields || [];
    const hasSeq = p.fields.some(f => f.k === 'seq');
    const hasCode = p.fields.some(f => f.k === 'code');

    // add at top (readonly)
    const meta = [];
    if (!hasSeq) meta.push({ k: 'seq', label: 'رقم تسلسلي', req: false, readonly: true });
    if (!hasCode) meta.push({ k: 'code', label: 'كود', req: false, readonly: true, hint: 'يتولد تلقائياً' });
    if (meta.length) p.fields = meta.concat(p.fields);

    // compact columns: show code + seq first
    p.compactCols = p.compactCols || [];
    if (!p.compactCols.includes('seq')) p.compactCols.unshift('seq');
    if (!p.compactCols.includes('code')) p.compactCols.splice(1, 0, 'code');
  }
})();

function currentPanel() {
  return PANELS.find(p => p.key === window.activeKey);
}
