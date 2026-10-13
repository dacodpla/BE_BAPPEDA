// SQLite-backed user repository. Interface is unchanged from the in-memory
// version: findById, findByEmail, verifyPassword, toPublic, create.

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const db = require('../db')

function fromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    rank: row.rank,
    department: row.department,
    annualBudget: row.annual_budget,
  }
}

async function findById(id) {
  return fromRow(db.prepare('SELECT * FROM users WHERE id = ?').get(id))
}

async function findByEmail(email) {
  return fromRow(db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '')))
}

async function verifyPassword(user, plainPassword) {
  if (!user || !plainPassword) return false
  return bcrypt.compare(plainPassword, user.passwordHash)
}

// Strips secrets before returning to the API.
function toPublic(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    rank: user.rank,
    department: user.department,
  }
}

async function create({ email, password, name, role, rank, department, annualBudget = 0 }) {
  const id = `usr_${crypto.randomUUID()}`
  const passwordHash = await bcrypt.hash(password, 10)
  db.prepare(
    `INSERT INTO users (id, email, password_hash, name, role, rank, department, annual_budget)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, email, passwordHash, name, role, rank, department, annualBudget)
  return findById(id)
}

module.exports = { findById, findByEmail, verifyPassword, toPublic, create }
