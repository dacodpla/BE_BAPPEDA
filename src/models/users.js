// In-memory user repository. Replace this module with a DB-backed implementation
// (e.g. Prisma, Knex) when a database is added — controllers depend only on this
// interface: findById(id), findByEmail(email), verifyPassword(user, password),
// toPublic(user).

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { ROLES } = require('../constants/roles')

const SEED_PASSWORD = 'Password1!'
const SEED_HASH = bcrypt.hashSync(SEED_PASSWORD, 10)

const users = [
  {
    id: 'usr_emp_001',
    email: 'employee@bappeda.go.id',
    passwordHash: SEED_HASH,
    name: 'Andi Pratama',
    role: ROLES.EMPLOYEE,
    rank: 'III/b',
    department: 'Perencanaan Ekonomi',
  },
  {
    id: 'usr_apr_001',
    email: 'approver@bappeda.go.id',
    passwordHash: SEED_HASH,
    name: 'Siti Rahayu',
    role: ROLES.APPROVER,
    rank: 'IV/a',
    department: 'Perencanaan Ekonomi',
  },
  {
    id: 'usr_adm_001',
    email: 'admin@bappeda.go.id',
    passwordHash: SEED_HASH,
    name: 'Budi Santoso',
    role: ROLES.ADMIN,
    rank: 'IV/b',
    department: 'Sekretariat',
  },
]

async function findById(id) {
  return users.find((u) => u.id === id) || null
}

async function findByEmail(email) {
  const needle = String(email || '').toLowerCase()
  return users.find((u) => u.email.toLowerCase() === needle) || null
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

// Convenience for future callers.
async function create({ email, password, name, role, rank, department }) {
  const passwordHash = await bcrypt.hash(password, 10)
  const user = {
    id: `usr_${crypto.randomUUID()}`,
    email,
    passwordHash,
    name,
    role,
    rank,
    department,
  }
  users.push(user)
  return user
}

module.exports = { findById, findByEmail, verifyPassword, toPublic, create }
