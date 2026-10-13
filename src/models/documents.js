const crypto = require('crypto')
const db = require('../db')

function fromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    requestId: row.request_id,
    originalName: row.original_name,
    storedName: row.stored_name,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
  }
}

function create({ requestId, originalName, storedName, mimeType, size }) {
  const id = `doc_${crypto.randomUUID()}`
  db.prepare(
    `INSERT INTO documents (id, request_id, original_name, stored_name, mime_type, size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, requestId, originalName, storedName, mimeType, size, new Date().toISOString())
  return findById(id)
}

function findById(id) {
  return fromRow(db.prepare('SELECT * FROM documents WHERE id = ?').get(id))
}

function listByRequest(requestId) {
  return db
    .prepare('SELECT * FROM documents WHERE request_id = ? ORDER BY created_at ASC')
    .all(requestId)
    .map(fromRow)
}

function countByRequest(requestId) {
  return db.prepare('SELECT COUNT(*) AS n FROM documents WHERE request_id = ?').get(requestId).n
}

function remove(id) {
  db.prepare('DELETE FROM documents WHERE id = ?').run(id)
}

module.exports = { create, findById, listByRequest, countByRequest, remove }
