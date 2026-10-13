// Seeds reference data and the three demo users. Runs only into empty tables.
// NOTE: policy rates below are PLACEHOLDERS. Replace with the official
// regulation values (Phase 5 adds admin master-data screens for this).

const bcrypt = require('bcryptjs')

const SEED_PASSWORD = 'Password1!'

const USERS = [
  ['usr_emp_001', 'employee@bappeda.go.id', 'Andi Pratama', 'employee', 'III/b', 'Perencanaan Ekonomi', 100000000],
  ['usr_apr_001', 'approver@bappeda.go.id', 'Siti Rahayu', 'approver', 'IV/a', 'Perencanaan Ekonomi', 150000000],
  ['usr_adm_001', 'admin@bappeda.go.id', 'Budi Santoso', 'admin', 'IV/b', 'Sekretariat', 150000000],
]

// [rankGroup, zone, dailyAllowance, lodgingCap]
const POLICIES = [
  ['II', 'IN_PROVINCE', 150000, 400000],
  ['III', 'IN_PROVINCE', 170000, 600000],
  ['IV', 'IN_PROVINCE', 190000, 900000],
  ['II', 'OUT_PROVINCE', 380000, 500000],
  ['III', 'OUT_PROVINCE', 430000, 750000],
  ['IV', 'OUT_PROVINCE', 480000, 1100000],
]

// [name, province]. Matching is "destination text contains name"; longest wins.
const DESTINATIONS = [
  ['Jawa Barat', 'Jawa Barat'],
  ['Bandung', 'Jawa Barat'],
  ['Bogor', 'Jawa Barat'],
  ['Bekasi', 'Jawa Barat'],
  ['Depok', 'Jawa Barat'],
  ['Cirebon', 'Jawa Barat'],
  ['Sukabumi', 'Jawa Barat'],
  ['Garut', 'Jawa Barat'],
  ['Tasikmalaya', 'Jawa Barat'],
  ['Karawang', 'Jawa Barat'],
  ['Cimahi', 'Jawa Barat'],
  ['Jakarta', 'DKI Jakarta'],
  ['DKI Jakarta', 'DKI Jakarta'],
  ['Banten', 'Banten'],
  ['Serang', 'Banten'],
  ['Tangerang', 'Banten'],
  ['Jawa Tengah', 'Jawa Tengah'],
  ['Semarang', 'Jawa Tengah'],
  ['Surakarta', 'Jawa Tengah'],
  ['Solo', 'Jawa Tengah'],
  ['Yogyakarta', 'DI Yogyakarta'],
  ['Jawa Timur', 'Jawa Timur'],
  ['Surabaya', 'Jawa Timur'],
  ['Malang', 'Jawa Timur'],
  ['Bali', 'Bali'],
  ['Denpasar', 'Bali'],
  ['Sumatera Utara', 'Sumatera Utara'],
  ['Medan', 'Sumatera Utara'],
  ['Sulawesi Selatan', 'Sulawesi Selatan'],
  ['Makassar', 'Sulawesi Selatan'],
  ['Kalimantan Timur', 'Kalimantan Timur'],
  ['Balikpapan', 'Kalimantan Timur'],
  ['Samarinda', 'Kalimantan Timur'],
]

function count(db, table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n
}

function seed(db) {
  if (count(db, 'users') === 0) {
    const hash = bcrypt.hashSync(SEED_PASSWORD, 10)
    const stmt = db.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, rank, department, annual_budget)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    for (const [id, email, name, role, rank, department, budget] of USERS) {
      stmt.run(id, email, hash, name, role, rank, department, budget)
    }
  }

  if (count(db, 'policies') === 0) {
    const stmt = db.prepare(
      `INSERT INTO policies (rank_group, zone, daily_allowance, lodging_cap) VALUES (?, ?, ?, ?)`,
    )
    for (const row of POLICIES) stmt.run(...row)
  }

  if (count(db, 'destinations') === 0) {
    const stmt = db.prepare(`INSERT INTO destinations (name, province) VALUES (?, ?)`)
    for (const row of DESTINATIONS) stmt.run(...row)
  }
}

module.exports = { seed, SEED_PASSWORD }
