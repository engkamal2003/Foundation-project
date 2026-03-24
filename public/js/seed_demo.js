// =====================================================
// بيانات تجريبية عشوائية للاختبار
// لحذف هذه البيانات: استدعِ clearDemoData()
// =====================================================

(function seedDemoData() {
  const SEED_KEY = "__demo_seeded_v1__";
  if (localStorage.getItem(SEED_KEY)) return; // لا تُكرر الحقن

  const uid = () => "demo_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
  const save = (key, data) => localStorage.setItem("db_" + key, JSON.stringify(data));

  // ─── 1. المانحون ───────────────────────────────────────────────
  save("donors", [
    { id: uid(), _id: uid(), name: "منظمة إغاثة الإنسان", nameEn: "Human Relief Foundation", country: "تركيا", phone: "905321234567", contacts: [] },
    { id: uid(), _id: uid(), name: "هيئة الهلال الأحمر الإماراتي", nameEn: "UAE Red Crescent", country: "الإمارات", phone: "97143456789", contacts: [] },
    { id: uid(), _id: uid(), name: "صندوق إغاثة الأردن", nameEn: "Jordan Relief Fund", country: "الأردن", phone: "96265432100", contacts: [] },
    { id: uid(), _id: uid(), name: "منظمة أطباء بلا حدود", nameEn: "MSF", country: "فرنسا", phone: "33145678901", contacts: [] },
  ]);

  // ─── 2. السائقون ──────────────────────────────────────────────
  const drivers = [
    { id: uid(), _id: uid(), driverName: "محمد أحمد السيد",   driverId: "29301012345", phone: "01012345678", driverType: "شخصي",      residenceArea: "القاهرة" },
    { id: uid(), _id: uid(), driverName: "خالد عبدالله عمر",  driverId: "29505067891", phone: "01123456789", driverType: "مقاول",     residenceArea: "الجيزة" },
    { id: uid(), _id: uid(), driverName: "أحمد حسن إبراهيم",  driverId: "29807043210", phone: "01234567890", driverType: "شركة نقل",  residenceArea: "الإسكندرية" },
    { id: uid(), _id: uid(), driverName: "عمر فاروق النجار",   driverId: "30001056789", phone: "01098765432", driverType: "شخصي",      residenceArea: "القاهرة" },
    { id: uid(), _id: uid(), driverName: "يوسف كمال الدين",    driverId: "29612078901", phone: "01187654321", driverType: "مقاول",     residenceArea: "الجيزة" },
  ];
  save("drivers", drivers);

  // ─── 3. السيارات ──────────────────────────────────────────────
  const cars = [
    { id: uid(), _id: uid(), carNo: "أ ب ج 1234", carType: "سيارة 7 راكب",              carOwnerName: "محمد أحمد السيد",  driverName: "محمد أحمد السيد",  ownership: "شخصية" },
    { id: uid(), _id: uid(), carNo: "د هـ و 5678", carType: "سيارة 14 راكب (ميكروباص)", carOwnerName: "شركة النيل للنقل", driverName: "خالد عبدالله عمر", ownership: "شركة نقل" },
    { id: uid(), _id: uid(), carNo: "ز ح ط 9012", carType: "سيارة 7 راكب",              carOwnerName: "أحمد حسن إبراهيم", driverName: "أحمد حسن إبراهيم", ownership: "شخصية" },
    { id: uid(), _id: uid(), carNo: "ي ك ل 3456", carType: "50 راكب (أتوبيس)",          carOwnerName: "مؤسسة السفر الآمن", driverName: "عمر فاروق النجار",  ownership: "مقاول" },
    { id: uid(), _id: uid(), carNo: "م ن س 7890", carType: "سيارة 4 راكب",              carOwnerName: "يوسف كمال الدين",  driverName: "يوسف كمال الدين",  ownership: "شخصية" },
  ];
  save("cars", cars);

  // ─── 4. شركات النقل والمقاولون ────────────────────────────────
  save("contractors", [
    { id: uid(), _id: uid(), companyName: "شركة النيل للنقل والتوزيع",   service: "نقل أشخاص",    phone: "01011112233", area: "القاهرة" },
    { id: uid(), _id: uid(), companyName: "مؤسسة السفر الآمن",           service: "تأجير سيارات",  phone: "01022223344", area: "الجيزة" },
    { id: uid(), _id: uid(), companyName: "شركة الأمل للخدمات اللوجستية", service: "نقل وشحن",     phone: "01033334455", area: "الإسكندرية" },
  ]);

  // ─── 5. المنفذون ──────────────────────────────────────────────
  save("executors", [
    { id: uid(), _id: uid(), name: "سامي محمود", role: "منسق لوجستي", phone: "01044445566" },
    { id: uid(), _id: uid(), name: "ريم خالد",   role: "مشرفة برامج",  phone: "01055556677" },
    { id: uid(), _id: uid(), name: "طارق عادل",  role: "مدير عمليات",  phone: "01066667788" },
  ]);

  // ─── 6. الاعتمادات ────────────────────────────────────────────
  const credits = [
    { id: uid(), _id: uid(), creditNo: "CR-2025-001", creditDate: "2025-01-15", donorName: "منظمة إغاثة الإنسان",     assocMain: "الأردن", creditType: "اعتماد تركي",   sector: "أمن غذائي",  totalAmount: "500000" },
    { id: uid(), _id: uid(), creditNo: "CR-2025-002", creditDate: "2025-02-10", donorName: "هيئة الهلال الأحمر الإماراتي", assocMain: "تركيا", creditType: "اعتماد دولي", sector: "إيواء",       totalAmount: "750000" },
    { id: uid(), _id: uid(), creditNo: "CR-2025-003", creditDate: "2025-03-05", donorName: "صندوق إغاثة الأردن",     assocMain: "سوريا", creditType: "اعتماد محلي",  sector: "طبي",         totalAmount: "300000" },
  ];
  save("credits", credits);

  // ─── 7. حركة السيارات (car_movements) ────────────────────────
  const places     = ["مطار القاهرة", "مستشفى المبرة", "مستودع عين شمس", "محطة مصر", "ميناء الإسكندرية", "مقر المنظمة"];
  const activities = ["نقل موظفين", "توصيل مستلزمات طبية", "نقل مواد غذائية", "مهمة ميدانية", "اجتماع خارجي", "زيارة مشروع"];
  const entryTypes = ["دوام كامل", "دوام نصف يوم", "مهمة سريعة", "دوام جزئي"];
  const transports = ["سيارة 7 راكب", "سيارة 14 راكب (ميكروباص)", "سيارة 4 راكب", "50 راكب (أتوبيس)", "سيارة 7 راكب"];
  const carNos     = ["أ ب ج 1234", "د هـ و 5678", "ز ح ط 9012", "ي ك ل 3456", "م ن س 7890"];
  const driverNames= ["محمد أحمد السيد", "خالد عبدالله عمر", "أحمد حسن إبراهيم", "عمر فاروق النجار", "يوسف كمال الدين"];
  const tourismCos = ["شركة النيل للنقل والتوزيع", "مؤسسة السفر الآمن", "", "", "شركة الأمل للخدمات اللوجستية"];
  const benefNames = ["إدارة المنظمة", "مشروع صحة المجتمع", "برنامج الأمن الغذائي", "مشروع الإيواء", "مشروع التعليم"];
  const delegs     = ["الوفد التركي", "الوفد الإماراتي", "", "", "وفد المانح"];

  const movements = [];
  const dates = [
    "2025-11-01","2025-11-03","2025-11-05","2025-11-08","2025-11-10",
    "2025-11-12","2025-11-15","2025-11-17","2025-11-20","2025-11-22",
    "2025-11-25","2025-11-27","2025-12-01","2025-12-03","2025-12-05",
    "2025-12-08","2025-12-10","2025-12-12","2025-12-15","2025-12-17",
  ];

  dates.forEach((date, i) => {
    const idx    = i % 5;
    const eType  = entryTypes[i % 4];
    const isMashrou3 = i % 3 !== 0;
    const mvId = uid();
    movements.push({
      id:              mvId,
      _id:             mvId,
      requestDate:     date,
      activityDate:    date,
      entrySystem:     eType,
      beneficiary:     isMashrou3 ? "مشروع" : "إداري",
      beneficiaryName: benefNames[idx],
      transport:       transports[idx],
      carNo:           carNos[idx],
      carOwnerName:    driverNames[idx],
      tourismCompany:  tourismCos[idx],
      driverName:      driverNames[idx],
      place:           places[i % places.length],
      activity:        activities[i % activities.length],
      executor:        ["سامي محمود","ريم خالد","طارق عادل"][i % 3],
      delegation:      isMashrou3 ? delegs[idx] : "",
      creditNo:        isMashrou3 ? credits[i % 3].creditNo : "",
      departurePlace:  places[(i + 2) % places.length],
      notes:           i % 4 === 0 ? "ملاحظة: يُرجى الالتزام بمواعيد الانطلاق" : "",
    });
  });
  save("car_movements", movements);

  // ─── 8. بيانات التحاسب (car_billing) ─────────────────────────
  // نحتسب 12 حركة فقط من أصل 20 (الباقي غير محتسب)
  const rateMap = {
    "سيارة 4 راكب":                 { fullDayRate: 1700, halfDayRate: 850,  quickMissionRate: 425,  partialNearRate: 800,  partialFarRate: 1000 },
    "سيارة 7 راكب":                 { fullDayRate: 2700, halfDayRate: 1350, quickMissionRate: 675,  partialNearRate: 1000, partialFarRate: 1200 },
    "سيارة 14 راكب (ميكروباص)":     { fullDayRate: 3500, halfDayRate: 1750, quickMissionRate: 875,  partialNearRate: 1200, partialFarRate: 1500 },
    "50 راكب (أتوبيس)":             { fullDayRate: 4000, halfDayRate: 2000, quickMissionRate: 1000, partialNearRate: 1200, partialFarRate: 1200 },
  };

  const billings = [];
  const toAccount = movements.slice(0, 12); // أول 12 حركة محتسبة

  toAccount.forEach((mv, i) => {
    const rates = rateMap[mv.transport] || { fullDayRate: 2000, halfDayRate: 1000, quickMissionRate: 500, partialNearRate: 900, partialFarRate: 1100 };
    const sys = mv.entrySystem;

    let fareUnit = 0;
    let fCounts  = { fullDaysCount:"0", halfDaysCount:"0", quickMissionsCount:"0", partialNearCount:"0", partialFarCount:"0", extraCount:"0" };
    if (sys === "دوام كامل")     { fCounts.fullDaysCount = "1";      fareUnit = rates.fullDayRate; }
    else if (sys === "دوام نصف يوم") { fCounts.halfDaysCount = "1"; fareUnit = rates.halfDayRate; }
    else if (sys === "مهمة سريعة")   { fCounts.quickMissionsCount = "1"; fareUnit = rates.quickMissionRate; }
    else if (sys === "دوام جزئي")    { fCounts.partialNearCount = "1";   fareUnit = rates.partialNearRate; }

    const busCount = 1;
    const fare     = fareUnit * busCount;
    const extra    = i % 4 === 0 ? 200 : 0;
    const discount = i % 5 === 0 ? 100 : 0;
    const subtotal = fare;
    const total    = subtotal + extra - discount;
    const status   = i < 6 ? "محاسب كامل" : "محاسب جزئي";
    const paid     = i < 6 ? String(total) : String(Math.round(total * 0.5));

    const bId = uid();
    billings.push({
      id:              bId,
      _id:             bId,
      movementId:      mv.id,
      accountingDate:  mv.activityDate,
      ...fCounts,
      fullDayFare:     String(rates.fullDayRate),
      halfDayFare:     String(rates.halfDayRate),
      quickMissionFare: String(rates.quickMissionRate),
      partialNearFare: String(rates.partialNearRate),
      partialFarFare:  String(rates.partialFarRate),
      extraFare:       "0",
      busCount:        String(busCount),
      fare:            String(fare),
      subtotal:        String(subtotal),
      extraAmount:     String(extra),
      extraAmountNote: extra ? "بدل انتظار" : "",
      discountAmount:  String(discount),
      discountNote:    discount ? "تأخر الانطلاق" : "",
      total:           String(total),
      accountingStatus: status,
      paidAmount:      paid,
      payDate:         i < 6 ? "2025-12-01" : "",
      creditNo2:       mv.creditNo || "",
      statement:       "اجرة " + (mv.tourismCompany || "السائق " + mv.driverName) + " - " + mv.transport + " - " + mv.activityDate,
      amount:          String(total),
      notes:           "",
    });
  });
  save("car_billing", billings);

  // ─── 9. الصندوق (cashbox) ────────────────────────────────────
  save("cashbox", [
    { id: uid(), _id: uid(), spenderName: "سامي محمود",   cashboxName: "الصندوق الرئيسي", expenseDate: "2025-11-05", payDate: "2025-11-06", statement: "مصاريف وقود",          amount: "1500", creditNo: "CR-2025-001", expenseType: "نقل" },
    { id: uid(), _id: uid(), spenderName: "ريم خالد",     cashboxName: "صندوق المشاريع",  expenseDate: "2025-11-10", payDate: "2025-11-10", statement: "اجرة سيارة توصيل",   amount: "2700", creditNo: "CR-2025-002", expenseType: "نقل" },
    { id: uid(), _id: uid(), spenderName: "طارق عادل",    cashboxName: "الصندوق الرئيسي", expenseDate: "2025-11-15", payDate: "2025-11-16", statement: "مصاريف صيانة سيارة", amount: "850",  creditNo: "",            expenseType: "ميزان" },
    { id: uid(), _id: uid(), spenderName: "محمد أحمد",    cashboxName: "صندوق العمليات",  expenseDate: "2025-11-20", payDate: "2025-11-20", statement: "بدل سفر",            amount: "3200", creditNo: "CR-2025-003", expenseType: "بياتات" },
    { id: uid(), _id: uid(), spenderName: "خالد عمر",     cashboxName: "الصندوق الرئيسي", expenseDate: "2025-12-01", payDate: "2025-12-02", statement: "اجرة رحلة ميدانية",  amount: "4000", creditNo: "CR-2025-001", expenseType: "نقل" },
    { id: uid(), _id: uid(), spenderName: "أحمد إبراهيم", cashboxName: "صندوق المشاريع",  expenseDate: "2025-12-05", payDate: "2025-12-05", statement: "مصاريف اتصالات",     amount: "600",  creditNo: "",            expenseType: "تنسيقات" },
  ]);

  localStorage.setItem(SEED_KEY, "1");
  console.log("✅ Demo data seeded successfully!");
})();

// ── دالة حذف البيانات التجريبية ──────────────────────────────────
function clearDemoData() {
  const keys = ["donors","drivers","cars","contractors","executors","credits",
                "car_movements","car_billing","cashbox","supervisors"];
  keys.forEach(k => localStorage.removeItem("db_" + k));
  localStorage.removeItem("__demo_seeded_v1__");
  console.log("🗑️ Demo data cleared!");
  location.reload();
}
