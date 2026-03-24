// =====================================================
// API Configuration
// =====================================================
const API_BASE = "http://localhost:3001/api";

// Database panel mapping
const DB_PANEL_MAP = {
  donors: {
    table: "dbo.Donors",
    toDb: (ui) => ({
      Name: ui.name,
      Country: ui.country,
      Phone: ui.phone,
      Notes: ui.notes
    }),
    fromDb: (db) => ({
      id: String(db.DonorId),
      __pkVal: db.DonorId,
      name: db.Name || "",
      country: db.Country || "",
      phone: db.Phone || "",
      notes: db.Notes || ""
    })
  },
  drivers: {
    table: "dbo.Drivers",
    toDb: (ui) => ({
      DriverName: ui.driverName,
      DriverIdNo: ui.driverId,
      Phone: ui.phone,
      License: ui.license,
      Notes: ui.notes
    }),
    fromDb: (db) => ({
      id: String(db.DriverId),
      __pkVal: db.DriverId,
      driverName: db.DriverName || "",
      driverId: db.DriverIdNo || "",
      phone: db.Phone || "",
      license: db.License || "",
      notes: db.Notes || ""
    })
  },
  trucks: {
    table: "dbo.Trucks",
    toDb: (ui) => ({
      HeadNo: ui.headNo,
      TrailerNo: ui.trailerNo,
      TailNo: ui.tailNo,
      TruckType: ui.truckType,
      DriverName: ui.driverName,
      DriverPhone: ui.driverPhone,
      Notes: ui.notes
    }),
    fromDb: (db) => ({
      id: String(db.TruckId),
      __pkVal: db.TruckId,
      headNo: db.HeadNo || "",
      trailerNo: db.TrailerNo || "",
      tailNo: db.TailNo || "",
      truckType: db.TruckType || "",
      driverName: db.DriverName || "",
      driverPhone: db.DriverPhone || "",
      notes: db.Notes || ""
    })
  },
  credits: {
    table: "dbo.Credits",
    toDb: (ui) => ({
      CreditNo: ui.creditNo,
      CreditDate: ui.date,
      ProjectName: ui.projectName,
      Notes: ui.notes,
      DonorName: ui.donorName,
      AssocMain: ui.assocMain
    }),
    fromDb: (db) => ({
      id: String(db.CreditId),
      __pkVal: db.CreditId,
      creditNo: db.CreditNo || "",
      date: (db.CreditDate || "").slice(0, 10),
      donorName: db.DonorName || "",
      assocMain: db.AssocMain || "",
      projectName: db.ProjectName || "",
      notes: db.Notes || ""
    })
  },
  convoys: {
    table: "dbo.Convoys",
    toDb: (ui) => ({
      ConvoyNo: ui.convoyNo,
      ConvoyDate: ui.date,
      ProjectName: ui.projectName,
      Warehouse: ui.warehouse,
      Contractor: ui.contractor,
      Supervisor: ui.supervisor,
      Executor: ui.executor,
      Notes: ui.notes,
      CreditNo: ui.creditNo,
      DonorName: ui.donorName,
      AssocMain: ui.assocMain
    }),
    fromDb: (db) => ({
      id: String(db.ConvoyId),
      __pkVal: db.ConvoyId,
      convoyNo: db.ConvoyNo || "",
      date: (db.ConvoyDate || "").slice(0, 10),
      creditNo: db.CreditNo || "",
      donorName: db.DonorName || "",
      assocMain: db.AssocMain || "",
      projectName: db.ProjectName || "",
      warehouse: db.Warehouse || "",
      contractor: db.Contractor || "",
      supervisor: db.Supervisor || "",
      executor: db.Executor || "",
      notes: db.Notes || "",
      _trucks: []
    })
  }
};


// js/config.js
window.APP_CONFIG = {
  MODE: "LOCAL_ONLY",     // ✅ كل شيء محلي
  API_BASE: ""            // غير مستخدم
};
