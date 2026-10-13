const db = require('../db')

function findRate(rankGroup, zone) {
  const row = db
    .prepare(
      `SELECT daily_allowance, lodging_cap FROM policies
       WHERE rank_group = ? AND zone = ? AND status = 'ACTIVE'`,
    )
    .get(rankGroup, zone)
  if (!row) return null
  return { dailyAllowance: row.daily_allowance, lodgingCap: row.lodging_cap }
}

/** Longest destination name contained in the text wins; null if none match. */
function findProvince(destinationText) {
  const text = String(destinationText || '').toLowerCase()
  const rows = db.prepare('SELECT name, province FROM destinations').all()
  let best = null
  for (const row of rows) {
    if (text.includes(row.name.toLowerCase())) {
      if (!best || row.name.length > best.name.length) best = row
    }
  }
  return best ? best.province : null
}

module.exports = { findRate, findProvince }
