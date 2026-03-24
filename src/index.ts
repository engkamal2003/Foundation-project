import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  foundation_db: D1Database
  BACKUPS?: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS للـ API
app.use('/api/*', cors())

// ═══════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════

// SHA-256 hash
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

// توليد session token
function genToken(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
}

// التحقق من الجلسة وإرجاع المستخدم
async function getSessionUser(c: any): Promise<Record<string,unknown> | null> {
  const auth = c.req.header('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  try {
    const now = new Date().toISOString()
    const row = await c.env.foundation_db
      .prepare(`SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ? AND u.is_active = 1`)
      .bind(token, now).first()
    return row || null
  } catch { return null }
}

// مساعد: تحويل قيمة الصلاحية إلى boolean
// يتعامل مع: 0, 1, "0", "1", true, false, null, undefined
function permAllowed(val: unknown): boolean {
  if (val === null || val === undefined) return true  // افتراضي: مسموح
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val !== 0
  if (typeof val === 'string') return val !== '0' && val !== 'false' && val !== ''
  return Boolean(val)
}

// مساعد: التحقق من أن اللوحة مسموح بها للمستخدم
function panelAllowed(user: Record<string,unknown>, panel: string): boolean {
  const ap = user.allowed_panels
  if (!ap) return true  // null = كل اللوحات مسموح بها
  try {
    const arr: string[] = typeof ap === 'string' ? JSON.parse(ap) : (ap as string[])
    return Array.isArray(arr) ? arr.includes(panel) : true
  } catch { return true }
}

// ── تسجيل نشاط في activity_log ───────────────────────────
async function logActivity(
  db: D1Database,
  user: Record<string, unknown>,
  action: string,
  panelKey?: string,
  recordId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await db.prepare(
      `INSERT INTO activity_log (id, user_id, username, display_name, action, panel_key, record_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      user.id as string,
      user.username as string,
      user.display_name as string,
      action,
      panelKey || null,
      recordId || null,
      details ? JSON.stringify(details) : null
    ).run()
  } catch { /* لا نوقف العملية الرئيسية بسبب فشل التسجيل */ }
}

// ── POST /api/auth/login ─────────────────────────────────────
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json() as { username: string; password: string }
    if (!username || !password) return c.json({ error: 'أدخل اسم المستخدم وكلمة المرور' }, 400)

    const hash = await sha256(password)
    const user = await c.env.foundation_db
      .prepare(`SELECT * FROM users WHERE username = ? AND password_hash = ? AND is_active = 1`)
      .bind(username.trim().toLowerCase(), hash).first() as Record<string,unknown> | null

    if (!user) return c.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401)

    // إنشاء جلسة تدوم 7 أيام
    const sessionId = genToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await c.env.foundation_db
      .prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`)
      .bind(sessionId, user.id, expiresAt).run()

    const { password_hash: _, ...safeUser } = user
    // تسجيل نشاط الدخول
    await logActivity(c.env.foundation_db, user, 'login')
    return c.json({ token: sessionId, user: safeUser })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── POST /api/auth/logout ────────────────────────────────────
app.post('/api/auth/logout', async (c) => {
  const auth = c.req.header('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token) {
    // تسجيل نشاط الخروج قبل حذف الجلسة
    const logUser = await getSessionUser(c)
    if (logUser) await logActivity(c.env.foundation_db, logUser, 'logout')
    await c.env.foundation_db.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run()
  }
  return c.json({ success: true })
})

// ── GET /api/auth/me ─────────────────────────────────────────
app.get('/api/auth/me', async (c) => {
  const user = await getSessionUser(c)
  if (!user) return c.json({ error: 'غير مخوّل' }, 401)
  const { password_hash: _, ...safeUser } = user
  return c.json({ user: safeUser })
})

// ── GET /api/auth/users (Admin only) ────────────────────────
app.get('/api/auth/users', async (c) => {
  const user = await getSessionUser(c)
  if (!user || user.role !== 'admin') return c.json({ error: 'غير مخوّل' }, 403)
  try {
    const { results } = await c.env.foundation_db
      .prepare(`SELECT id,username,display_name,role,is_active,allowed_panels,can_add,can_edit,can_delete,can_export,can_import,created_at FROM users ORDER BY created_at ASC`)
      .all()
    return c.json({ users: results || [] })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── GET /api/auth/users/:id (Admin only) ─────────────────────
app.get('/api/auth/users/:id', async (c) => {
  const me = await getSessionUser(c)
  if (!me || me.role !== 'admin') return c.json({ error: 'غير مخوّل' }, 403)
  try {
    const user = await c.env.foundation_db
      .prepare(`SELECT id,username,display_name,role,is_active,allowed_panels,can_add,can_edit,can_delete,can_export,can_import FROM users WHERE id = ?`)
      .bind(c.req.param('id')).first()
    if (!user) return c.json({ error: 'المستخدم غير موجود' }, 404)
    return c.json({ user })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── POST /api/auth/users (Admin only) ───────────────────────
app.post('/api/auth/users', async (c) => {
  const me = await getSessionUser(c)
  if (!me || me.role !== 'admin') return c.json({ error: 'غير مخوّل' }, 403)
  try {
    const body = await c.req.json() as Record<string,unknown>
    if (!body.username || !body.password || !body.display_name)
      return c.json({ error: 'اسم المستخدم وكلمة المرور والاسم المميز مطلوبة' }, 400)

    const hash = await sha256(body.password as string)
    const id   = crypto.randomUUID()
    await c.env.foundation_db.prepare(`
      INSERT INTO users (id,username,display_name,password_hash,role,is_active,allowed_panels,can_add,can_edit,can_delete,can_export,can_import)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      id,
      (body.username as string).trim().toLowerCase(),
      body.display_name,
      hash,
      body.role || 'user',
      body.is_active ?? 1,
      body.allowed_panels != null
        ? (typeof body.allowed_panels === 'string' ? body.allowed_panels : JSON.stringify(body.allowed_panels))
        : null,
      body.can_add    ?? 1,
      body.can_edit   ?? 1,
      body.can_delete ?? 0,
      body.can_export ?? 1,
      body.can_import ?? 0
    ).run()
    return c.json({ success: true, id })
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.includes('UNIQUE')) return c.json({ error: 'اسم المستخدم موجود مسبقاً' }, 409)
    return c.json({ error: msg }, 500)
  }
})

// ── PUT /api/auth/users/:id (Admin only) ────────────────────
app.put('/api/auth/users/:id', async (c) => {
  const me = await getSessionUser(c)
  if (!me || me.role !== 'admin') return c.json({ error: 'غير مخوّل' }, 403)
  try {
    const id   = c.req.param('id')
    const body = await c.req.json() as Record<string,unknown>
    const sets: string[] = []
    const vals: unknown[] = []

    if (body.display_name !== undefined) { sets.push('display_name=?'); vals.push(body.display_name) }
    if (body.username     !== undefined) { sets.push('username=?');     vals.push((body.username as string).trim().toLowerCase()) }
    if (body.password)                   { sets.push('password_hash=?'); vals.push(await sha256(body.password as string)) }
    if (body.role         !== undefined) { sets.push('role=?');         vals.push(body.role) }
    if (body.is_active    !== undefined) { sets.push('is_active=?');    vals.push(body.is_active) }
    if (body.allowed_panels !== undefined) {
      sets.push('allowed_panels=?')
      vals.push(
        body.allowed_panels != null
          ? (typeof body.allowed_panels === 'string' ? body.allowed_panels : JSON.stringify(body.allowed_panels))
          : null
      )
    }
    if (body.can_add    !== undefined) { sets.push('can_add=?');    vals.push(body.can_add) }
    if (body.can_edit   !== undefined) { sets.push('can_edit=?');   vals.push(body.can_edit) }
    if (body.can_delete !== undefined) { sets.push('can_delete=?'); vals.push(body.can_delete) }
    if (body.can_export !== undefined) { sets.push('can_export=?'); vals.push(body.can_export) }
    if (body.can_import !== undefined) { sets.push('can_import=?'); vals.push(body.can_import) }

    sets.push('updated_at=?'); vals.push(new Date().toISOString())
    vals.push(id)

    await c.env.foundation_db
      .prepare(`UPDATE users SET ${sets.join(',')} WHERE id=?`)
      .bind(...vals).run()
    return c.json({ success: true })
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.includes('UNIQUE')) return c.json({ error: 'اسم المستخدم موجود مسبقاً' }, 409)
    return c.json({ error: msg }, 500)
  }
})

// ── DELETE /api/auth/users/:id (Admin only) ─────────────────
app.delete('/api/auth/users/:id', async (c) => {
  const me = await getSessionUser(c)
  if (!me || me.role !== 'admin') return c.json({ error: 'غير مخوّل' }, 403)
  const id = c.req.param('id')
  if (id === 'admin-default-001') return c.json({ error: 'لا يمكن حذف المدير الرئيسي' }, 403)
  try {
    await c.env.foundation_db.prepare(`DELETE FROM users WHERE id=?`).bind(id).run()
    return c.json({ success: true })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── قائمة اللوحات والجداول المقابلة ──────────────────────────────
const TABLE_MAP: Record<string, string> = {
  donors:              'donors',
  units:               'units',
  drivers:             'drivers',
  trucks:              'trucks',
  cars:                'cars',
  supervisors:         'supervisors',
  executors:           'executors',
  warehouses:          'warehouses',
  associations:        'associations',
  contractors:         'contractors',
  suppliers:           'suppliers',
  credits:             'credits',
  items:               'items',
  convoys:             'convoys',
  convoy_calc:         'convoy_calc',
  pallet_calc:         'pallet_calc',
  truck_items:         'truck_items',
  cashbox:             'cashbox',
  car_movements:       'car_movements',
  car_billing:         'car_billing',
  car_rates:           'car_rates',
  truck_rates:         'truck_rates',
  convoy_billing:      'convoy_billing',
  combined_entries:    'combined_entries',
  car_payment_cashbox: 'car_payment_cashbox',
}

// ── مساعد: دمج حقول الجدول مع حقل data (JSON) ───────────────────
function mergeRow(row: Record<string, unknown>): Record<string, unknown> {
  if (!row) return {}
  let extra: Record<string, unknown> = {}
  try {
    if (row.data && typeof row.data === 'string') {
      extra = JSON.parse(row.data as string)
    }
  } catch {}
  const { data: _data, created_at: _ca, updated_at: _ua, ...rest } = row as Record<string, unknown>
  return { ...extra, ...rest }
}

// ── GET /api/health - فحص الحالة ─────────────────────────────────
app.get('/api/health', (c) => c.json({ status: 'ok', db: 'D1 connected' }))


// ── GET /api/activity_log - جلب سجل النشاطات ────────────────────
app.get('/api/activity_log', async (c) => {
  const user = await getSessionUser(c)
  if (!user) return c.json({ error: 'غير مخوّل' }, 401)
  const limit  = parseInt(c.req.query('limit')  || '50')
  const offset = parseInt(c.req.query('offset') || '0')
  const action = c.req.query('action') || ''
  try {
    const whereClause = action ? `WHERE action = ?` : ``
    const bindings: unknown[] = action
      ? [action, Math.min(limit, 200), offset]
      : [Math.min(limit, 200), offset]
    const { results } = await c.env.foundation_db
      .prepare(`SELECT * FROM activity_log ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...bindings).all()
    const countBindings: unknown[] = action ? [action] : []
    const { results: countRow } = await c.env.foundation_db
      .prepare(`SELECT COUNT(*) as total FROM activity_log ${whereClause}`)
      .bind(...countBindings).all()
    return c.json({ data: results || [], total: (countRow[0] as any)?.total || 0 })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── POST /api/backup/create - إنشاء نسخة احتياطية ───────────────
app.post('/api/backup/create', async (c) => {
  const user = await getSessionUser(c)
  if (!user || user.role !== 'admin') return c.json({ error: 'للمدير فقط' }, 403)

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupData: Record<string, unknown[]> = {}

    // تصدير جميع الجداول
    for (const [panelKey, table] of Object.entries(TABLE_MAP)) {
      try {
        const { results } = await c.env.foundation_db
          .prepare(`SELECT * FROM ${table}`)
          .all()
        backupData[panelKey] = (results || []).map(mergeRow)
      } catch { backupData[panelKey] = [] }
    }

    // تصدير جدول المستخدمين (بدون كلمات المرور)
    try {
      const { results } = await c.env.foundation_db
        .prepare(`SELECT id, username, display_name, role, is_active, allowed_panels, can_add, can_edit, can_delete, can_export, can_import, created_at FROM users`)
        .all()
      backupData['_users'] = results || []
    } catch {}

    // تصدير سجل النشاطات (آخر 1000)
    try {
      const { results } = await c.env.foundation_db
        .prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 1000`)
        .all()
      backupData['_activity_log'] = results || []
    } catch {}

    const backupJson = JSON.stringify({
      version: '1.0',
      created_at: new Date().toISOString(),
      created_by: user.username,
      tables: backupData
    }, null, 2)

    const filename = `backup_${timestamp}.json`
    let storageResult = 'local_only'

    // حفظ في R2 إذا كان متاحاً
    if (c.env.BACKUPS) {
      try {
        await c.env.BACKUPS.put(filename, backupJson, {
          httpMetadata: { contentType: 'application/json' },
          customMetadata: { created_by: user.username as string, timestamp }
        })
        storageResult = 'r2'
      } catch { storageResult = 'r2_failed' }
    }

    // تسجيل النشاط
    await logActivity(c.env.foundation_db, user, 'backup', undefined, filename)

    // حفظ سجل النسخة في قاعدة البيانات
    await c.env.foundation_db.prepare(
      `INSERT OR IGNORE INTO activity_log (id, user_id, username, display_name, action, panel_key, record_id, details)
       VALUES (?, ?, ?, ?, 'backup', NULL, ?, ?)`
    ).bind(
      crypto.randomUUID(), user.id, user.username, user.display_name,
      filename,
      JSON.stringify({ storage: storageResult, size: backupJson.length })
    ).run().catch(() => {})

    return c.json({
      success: true,
      filename,
      storage: storageResult,
      size: backupJson.length,
      // إرجاع البيانات للتحميل المباشر إذا R2 غير متاح
      data: storageResult !== 'r2' ? backupJson : undefined
    })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── GET /api/backup/list - قائمة النسخ الاحتياطية ───────────────
app.get('/api/backup/list', async (c) => {
  const user = await getSessionUser(c)
  if (!user || user.role !== 'admin') return c.json({ error: 'للمدير فقط' }, 403)

  try {
    if (c.env.BACKUPS) {
      const list = await c.env.BACKUPS.list({ prefix: 'backup_' })
      return c.json({
        backups: (list.objects || []).map(obj => ({
          name: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        }))
      })
    }
    // إذا لم يكن R2 متاحاً، أرجع قائمة فارغة
    return c.json({ backups: [], note: 'R2 غير مُفعَّل' })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── GET /api/stats - إحصائيات شاملة لجميع اللوحات (للمدير فقط) ──
app.get('/api/stats', async (c) => {
  const user = await getSessionUser(c)
  if (!user) return c.json({ error: 'غير مخوّل' }, 401)
  if (user.role !== 'admin') return c.json({ error: 'هذه الصفحة للمدير فقط' }, 403)

  try {
    // عدد السجلات لكل لوحة
    const panelCounts: Record<string, number> = {}
    for (const [panelKey, table] of Object.entries(TABLE_MAP)) {
      try {
        const row = await c.env.foundation_db
          .prepare(`SELECT COUNT(*) as cnt FROM ${table}`)
          .first() as { cnt: number } | null
        panelCounts[panelKey] = row?.cnt || 0
      } catch { panelCounts[panelKey] = 0 }
    }

    // إحصائيات المستخدمين
    const usersRow = await c.env.foundation_db
      .prepare(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active=1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active=0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as admins
      FROM users`).first() as Record<string, number> | null

    // إحصائيات النشاطات (آخر 30 يوم)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const activityRow = await c.env.foundation_db
      .prepare(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN action='add'    THEN 1 ELSE 0 END) as adds,
        SUM(CASE WHEN action='edit'   THEN 1 ELSE 0 END) as edits,
        SUM(CASE WHEN action='delete' THEN 1 ELSE 0 END) as deletes,
        SUM(CASE WHEN action='login'  THEN 1 ELSE 0 END) as logins
      FROM activity_log WHERE created_at >= ?`)
      .bind(thirtyDaysAgo).first() as Record<string, number> | null

    // آخر 10 نشاطات
    const { results: recentActivity } = await c.env.foundation_db
      .prepare(`SELECT id, username, display_name, action, panel_key, record_id, created_at
                FROM activity_log ORDER BY created_at DESC LIMIT 10`)
      .all()

    // إجمالي سجلات جميع اللوحات
    const totalRecords = Object.values(panelCounts).reduce((a, b) => a + b, 0)

    return c.json({
      success: true,
      panels: panelCounts,
      totalRecords,
      users: usersRow || { total: 0, active: 0, inactive: 0, admins: 0 },
      activity30d: activityRow || { total: 0, adds: 0, edits: 0, deletes: 0, logins: 0 },
      recentActivity: recentActivity || [],
      generatedAt: new Date().toISOString()
    })
  } catch (e: unknown) { return c.json({ error: String(e) }, 500) }
})

// ── GET /api/:panel - جلب سجلات لوحة (مع Pagination اختياري) ────
app.get('/api/:panel', async (c) => {
  const panel = c.req.param('panel')
  const table = TABLE_MAP[panel]
  if (!table) return c.json({ error: 'لوحة غير معروفة' }, 404)

  // التحقق من صلاحية الوصول إلى اللوحة
  const _getUser = await getSessionUser(c)
  if (!_getUser) return c.json({ error: 'غير مخوّل' }, 401)
  if (!panelAllowed(_getUser, panel)) return c.json({ error: 'ليس لديك صلاحية الوصول إلى هذه اللوحة' }, 403)

  // Pagination: ?page=1&limit=100  (الافتراضي: كل السجلات)
  const pageParam  = c.req.query('page')
  const limitParam = c.req.query('limit')
  const usePagination = pageParam !== undefined || limitParam !== undefined

  try {
    if (usePagination) {
      const limit  = Math.min(parseInt(limitParam || '100'), 500)
      const page   = Math.max(parseInt(pageParam  || '1'),   1)
      const offset = (page - 1) * limit

      const { results } = await c.env.foundation_db
        .prepare(`SELECT * FROM ${table} ORDER BY seq ASC, created_at ASC LIMIT ? OFFSET ?`)
        .bind(limit, offset).all()

      const countRow = await c.env.foundation_db
        .prepare(`SELECT COUNT(*) as cnt FROM ${table}`)
        .first() as { cnt: number } | null

      const total = countRow?.cnt || 0
      return c.json({
        success: true,
        data: (results || []).map(mergeRow),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      })
    }

    // بدون pagination - جلب الكل (الوضع الافتراضي للتوافق مع الكود القديم)
    const { results } = await c.env.foundation_db
      .prepare(`SELECT * FROM ${table} ORDER BY seq ASC, created_at ASC`)
      .all()
    return c.json({ success: true, data: (results || []).map(mergeRow) })
  } catch (e: unknown) {
    return c.json({ error: String(e) }, 500)
  }
})

// ── POST /api/:panel - إنشاء سجل جديد ───────────────────────────
app.post('/api/:panel', async (c) => {
  const panel = c.req.param('panel')
  const table = TABLE_MAP[panel]
  if (!table) return c.json({ error: 'لوحة غير معروفة' }, 404)

  // التحقق من صلاحية الإضافة
  const _postUser = await getSessionUser(c)
  if (!_postUser) return c.json({ error: 'غير مخوّل' }, 401)
  if (!panelAllowed(_postUser, panel)) return c.json({ error: 'ليس لديك صلاحية الوصول إلى هذه اللوحة' }, 403)
  if (!permAllowed(_postUser.can_add)) return c.json({ error: 'ليس لديك صلاحية إضافة بيانات' }, 403)

  try {
    const body = await c.req.json() as Record<string, unknown>

    // استخراج الحقول المعروفة وتخزين الباقي في data
    const known = getKnownFields(table)
    const knownData: Record<string, unknown> = {}
    const extraData: Record<string, unknown> = {}

    for (const [k, v] of Object.entries(body)) {
      if (known.includes(k)) knownData[k] = v
      else extraData[k] = v
    }

    // ضمان وجود id
    if (!knownData.id) knownData.id = crypto.randomUUID()
    knownData.data = JSON.stringify(extraData)
    knownData.updated_at = new Date().toISOString()

    const cols = Object.keys(knownData)
    const vals = Object.values(knownData)
    const placeholders = cols.map(() => '?').join(', ')

    await c.env.foundation_db
      .prepare(`INSERT OR REPLACE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`)
      .bind(...vals)
      .run()

    // تسجيل النشاط
    await logActivity(c.env.foundation_db, _postUser, 'add', panel, knownData.id as string)

    return c.json({ success: true, id: knownData.id })
  } catch (e: unknown) {
    return c.json({ error: String(e) }, 500)
  }
})

// ── PUT /api/:panel/:id - تحديث سجل ─────────────────────────────
app.put('/api/:panel/:id', async (c) => {
  const panel = c.req.param('panel')
  const table = TABLE_MAP[panel]
  const id    = c.req.param('id')
  if (!table) return c.json({ error: 'لوحة غير معروفة' }, 404)

  // التحقق من صلاحية التعديل
  const _putUser = await getSessionUser(c)
  if (!_putUser) return c.json({ error: 'غير مخوّل' }, 401)
  if (!panelAllowed(_putUser, panel)) return c.json({ error: 'ليس لديك صلاحية الوصول إلى هذه اللوحة' }, 403)
  if (!permAllowed(_putUser.can_edit)) return c.json({ error: 'ليس لديك صلاحية تعديل البيانات' }, 403)

  try {
    const body = await c.req.json() as Record<string, unknown>
    const known = getKnownFields(table)
    const knownData: Record<string, unknown> = {}
    const extraData: Record<string, unknown> = {}

    for (const [k, v] of Object.entries(body)) {
      if (k === 'id') continue
      if (known.includes(k)) knownData[k] = v
      else extraData[k] = v
    }

    knownData.data = JSON.stringify(extraData)
    knownData.updated_at = new Date().toISOString()

    const sets = Object.keys(knownData).map(k => `${k} = ?`).join(', ')
    const vals = [...Object.values(knownData), id]

    await c.env.foundation_db
      .prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`)
      .bind(...vals)
      .run()

    // تسجيل النشاط
    await logActivity(c.env.foundation_db, _putUser, 'edit', panel, id)

    return c.json({ success: true })
  } catch (e: unknown) {
    return c.json({ error: String(e) }, 500)
  }
})

// ── DELETE /api/:panel/:id - حذف سجل ────────────────────────────
app.delete('/api/:panel/:id', async (c) => {
  const panel = c.req.param('panel')
  const table = TABLE_MAP[panel]
  const id    = c.req.param('id')
  if (!table) return c.json({ error: 'لوحة غير معروفة' }, 404)

  // التحقق من صلاحية الحذف
  const _delUser = await getSessionUser(c)
  if (!_delUser) return c.json({ error: 'غير مخوّل' }, 401)
  if (!panelAllowed(_delUser, panel)) return c.json({ error: 'ليس لديك صلاحية الوصول إلى هذه اللوحة' }, 403)
  if (!permAllowed(_delUser.can_delete)) return c.json({ error: 'ليس لديك صلاحية حذف البيانات' }, 403)

  try {
    await c.env.foundation_db
      .prepare(`DELETE FROM ${table} WHERE id = ?`)
      .bind(id)
      .run()
    // تسجيل النشاط
    await logActivity(c.env.foundation_db, _delUser, 'delete', panel, id)
    return c.json({ success: true })
  } catch (e: unknown) {
    return c.json({ error: String(e) }, 500)
  }
})

// ── DELETE /api/:panel (حذف كل سجلات لوحة) ──────────────────────
app.delete('/api/:panel', async (c) => {
  const panel = c.req.param('panel')
  const table = TABLE_MAP[panel]
  if (!table) return c.json({ error: 'لوحة غير معروفة' }, 404)

  // التحقق من صلاحية الحذف
  const _delAllUser = await getSessionUser(c)
  if (!_delAllUser) return c.json({ error: 'غير مخوّل' }, 401)
  if (!panelAllowed(_delAllUser, panel)) return c.json({ error: 'ليس لديك صلاحية الوصول إلى هذه اللوحة' }, 403)
  if (!permAllowed(_delAllUser.can_delete)) return c.json({ error: 'ليس لديك صلاحية حذف البيانات' }, 403)

  try {
    await c.env.foundation_db.prepare(`DELETE FROM ${table}`).run()
    return c.json({ success: true })
  } catch (e: unknown) {
    return c.json({ error: String(e) }, 500)
  }
})

// ── GET /api/health - فحص الحالة ─────────────────────────────────
// (تم نقله للأعلى قبل /:panel لمنع التعارض)

// ── الحقول المعروفة لكل جدول ──────────────────────────────────────
function getKnownFields(table: string): string[] {
  const common = ['id', 'seq', 'code', 'data', 'created_at', 'updated_at']
  const specific: Record<string, string[]> = {
    donors:              [...common, 'name', 'nameEn', 'country', 'phone'],
    units:               [...common, 'name', 'type'],
    drivers:             [...common, 'driverName', 'driverId', 'phone', 'driverType', 'residenceArea'],
    trucks:              [...common, 'headNo', 'headOwner', 'headLicense', 'trailerNo', 'trailerOwner', 'trailerLicense', 'tailNo', 'tailOwner', 'tailLicense', 'driverName', 'ownership'],
    cars:                [...common, 'carNo', 'carType', 'carOwnerName', 'driverName', 'ownership'],
    supervisors:         [...common, 'name', 'phone', 'area'],
    executors:           [...common, 'name', 'role', 'phone'],
    warehouses:          [...common, 'name', 'location', 'manager'],
    associations:        [...common, 'main', 'sub', 'country'],
    contractors:         [...common, 'companyName', 'companyPhone', 'ownerName', 'service'],
    suppliers:           [...common, 'name', 'companyNo', 'category', 'phone', 'address', 'beneficiaryName', 'iban'],
    credits:             [...common, 'creditNo', 'creditType', 'creditCategory', 'date', 'donorName', 'projectName', 'projectLocation'],
    items:               [...common, 'itemName', 'itemCategory', 'defaultUnit', 'weightPerUnit'],
    convoys:             [...common, 'convoyNo', 'carType', 'headNo', 'trailerNo', 'driverName', 'driverId', 'driverPhone', 'contractor', 'creditNo', 'donorName', 'itemName', 'unit', 'palletCount', 'qtyPerPallet', 'totalQty', 'loadWeightKg', 'arrivalDate', 'loadDate', 'departureDate', 'actualEntryDate', 'unloadDate', 'loadLocation', 'banner', 'mediaLink', 'allocation'],
    convoy_calc:         [...common, 'convoyNo', 'calcDate', 'days', 'amount'],
    pallet_calc:         [...common, 'date', 'warehouse', 'palletsIn', 'palletsOut'],
    truck_items:         [...common, 'convoyNo', 'headNo', 'itemName', 'qty', 'unit'],
    cashbox:             [...common, 'expenseDate', 'payDate', 'spenderName', 'cashboxName', 'statement', 'amount', 'creditNo'],
    car_movements:       [...common, 'movementNo', 'requestDate', 'activityDate', 'day', 'entrySystem', 'transport', 'carNo', 'tourismCompany', 'driverName', 'beneficiary', 'beneficiaryName', 'place', 'activity'],
    car_billing:         [...common, 'activityDate', 'accountingDate', 'movementNo', 'driverName', 'transport', 'ownership', 'accountingParty', 'beneficiaryName', 'fare', 'busCount', 'subtotal', 'extraAmount', 'extraAmountNote', 'discountAmount', 'discountNote', 'total', 'calcStatus', 'creditNo', 'entryNo'],
    car_rates:           [...common, 'carType', 'driverName', 'fullDayRate', 'halfDayRate', 'quickMissionRate', 'partialNearRate', 'partialFarRate', 'extraRate'],
    truck_rates:         [...common, 'truckType', 'transportType', 'destination', 'naulonRate', 'driverExpenses', 'scaleExpenses', 'otherExpenses'],
    convoy_billing:      [...common, 'accountingStatus', 'convoyBillingNo', 'accountingDate', 'headNo', 'truckType', 'driverName', 'ownership', 'truckAccountingParty', 'transportType', 'destination', 'naulon', 'driverExpenses', 'scaleExpenses', 'otherExpenses', 'subtotal', 'extraAmount', 'discountAmount', 'total', 'paidAmount', 'amount', 'payDate', 'beneficiary', 'beneficiaryName', 'delegation', 'creditNo', 'statement', 'notes'],
    combined_entries:    [...common, 'entryNo', 'entryCreatedAt', 'entryType', 'accountingParty', 'beneficiaryName', 'transport', 'movementNos', 'recordCount', 'totalAmount', 'mergedStatement', 'creditNo2', 'notes', '_groupKey', '_isSingle', '_isCustomGroup', '_billingId', 'movementId'],
    car_payment_cashbox: [...common, 'accountingStatus', 'payDate', 'movementNo', 'accountingParty', 'beneficiaryName', 'transport', 'totalAmount', 'paidAmount', 'paidAmountBefore', 'remainingAmount', 'paymentType', 'paidBy', 'periodFromDate', 'periodFromDay', 'periodToDate', 'periodToDay', 'statement', 'creditNo2', 'referenceNo', 'notes'],
  }
  return specific[table] || common
}

export default app
