// Dates are ISO 8601 date strings (YYYY-MM-DD) everywhere in the API.

function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

/** Inclusive number of days between two ISO dates (same day = 1). */
function inclusiveDays(start, end) {
  const ms = new Date(`${end}T00:00:00Z`) - new Date(`${start}T00:00:00Z`)
  return Math.round(ms / 86400000) + 1
}

module.exports = { todayISO, isValidISODate, inclusiveDays }
