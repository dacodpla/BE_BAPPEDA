// SQLite via Node's built-in node:sqlite (no native module to compile).
// The models/ layer is the only code that talks to this handle.

const fs = require('fs')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const config = require('../config')
const { applySchema } = require('./schema')
const { seed } = require('./seed')

if (config.db.file !== ':memory:') {
  fs.mkdirSync(path.dirname(config.db.file), { recursive: true })
}

const db = new DatabaseSync(config.db.file)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

applySchema(db)
seed(db)

module.exports = db
