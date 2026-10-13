const crypto = require('crypto')
const db = require('../db')

function fromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    sppdRef: row.sppd_ref,
    userId: row.user_id,
    destination: row.destination,
    departDate: row.depart_date,
    returnDate: row.return_date,
    purpose: row.purpose,
    transport: row.transport,
    status: row.status,
    estimatedCost: row.estimated_cost,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at,
    employeeName: row.employee_name,
  }
}

const SELECT = `
  SELECT r.*, u.name AS employee_name
  FROM travel_requests r JOIN users u ON u.id = r.user_id
`

function nextSppdRef(now) {
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const { n } = db
    .prepare('SELECT COUNT(*) AS n FROM travel_requests WHERE sppd_ref LIKE ?')
    .get(`SPPD/${year}/%`)
  return `SPPD/${year}/${month}/${String(n + 1).padStart(4, '0')}`
}

function create({ userId, destination, departDate, returnDate, purpose, transport, status }) {
  const now = new Date()
  const ts = now.toISOString()
  const id = `req_${crypto.randomUUID()}`
  db.prepare(
    `INSERT INTO travel_requests
      (id, sppd_ref, user_id, destination, depart_date, return_date, purpose, transport,
       status, estimated_cost, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
  ).run(id, nextSppdRef(now), userId, destination, departDate, returnDate, purpose, transport, status, ts, ts)
  return findById(id)
}

function findById(id) {
  return fromRow(db.prepare(`${SELECT} WHERE r.id = ?`).get(id))
}

const PATCHABLE = {
  destination: 'destination',
  departDate: 'depart_date',
  returnDate: 'return_date',
  purpose: 'purpose',
  transport: 'transport',
  status: 'status',
  estimatedCost: 'estimated_cost',
  submittedAt: 'submitted_at',
}

function update(id, patch) {
  const sets = []
  const values = []
  for (const [key, column] of Object.entries(PATCHABLE)) {
    if (key in patch) {
      sets.push(`${column} = ?`)
      values.push(patch[key])
    }
  }
  sets.push('updated_at = ?')
  values.push(new Date().toISOString())
  db.prepare(`UPDATE travel_requests SET ${sets.join(', ')} WHERE id = ?`).run(...values, id)
  return findById(id)
}

function list({ userId, status, page, pageSize }) {
  const where = ['r.user_id = ?']
  const params = [userId]
  if (status) {
    where.push('r.status = ?')
    params.push(status)
  }
  const clause = where.join(' AND ')
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM travel_requests r WHERE ${clause}`)
    .get(...params)
  const rows = db
    .prepare(`${SELECT} WHERE ${clause} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize)
  return { rows: rows.map(fromRow), total }
}

// --- Dashboard aggregates -------------------------------------------------

function countActiveTrips(userId, today) {
  return db
    .prepare(
      `SELECT COUNT(*) AS n FROM travel_requests
       WHERE user_id = ? AND status = 'APPROVED' AND return_date >= ?`,
    )
    .get(userId, today).n
}

/** userId = null counts across all employees (approver/admin view). */
function countPending(userId) {
  if (userId) {
    return db
      .prepare(`SELECT COUNT(*) AS n FROM travel_requests WHERE user_id = ? AND status = 'PENDING'`)
      .get(userId).n
  }
  return db.prepare(`SELECT COUNT(*) AS n FROM travel_requests WHERE status = 'PENDING'`).get().n
}

function sumBudgetUsed(userId, year) {
  return db
    .prepare(
      `SELECT COALESCE(SUM(estimated_cost), 0) AS total FROM travel_requests
       WHERE user_id = ? AND status IN ('APPROVED', 'COMPLETED') AND substr(depart_date, 1, 4) = ?`,
    )
    .get(userId, String(year)).total
}

function upcoming(userId, today, limit) {
  return db
    .prepare(
      `${SELECT} WHERE r.user_id = ? AND r.status IN ('PENDING', 'APPROVED') AND r.return_date >= ?
       ORDER BY r.depart_date ASC LIMIT ?`,
    )
    .all(userId, today, limit)
    .map(fromRow)
}

module.exports = { create, findById, update, list, countActiveTrips, countPending, sumBudgetUsed, upcoming }
