// Allowance and compliance calculation. The frontend only displays this result.

const config = require('../config')
const policiesModel = require('../models/policies')
const { ZONES, TRANSPORT_ESTIMATE } = require('../constants/travel')
const { inclusiveDays } = require('../utils/dates')

/**
 * Issues are machine-readable codes the frontend translates:
 *  - blocking:  TRIP_TOO_LONG, NO_POLICY_FOR_RANK
 *  - warnings:  DESTINATION_NOT_IN_CATALOG
 */
function evaluate(user, request) {
  const days = inclusiveDays(request.departDate, request.returnDate)
  const nights = Math.max(0, days - 1)
  const rankGroup = String(user.rank || '').split('/')[0]

  const province = policiesModel.findProvince(request.destination)
  const zone = province === config.policy.homeProvince ? ZONES.IN_PROVINCE : ZONES.OUT_PROVINCE

  const issues = []
  const warnings = []
  if (!province) warnings.push({ code: 'DESTINATION_NOT_IN_CATALOG' })
  if (days > config.policy.maxTripDays) {
    issues.push({ code: 'TRIP_TOO_LONG', params: { max: config.policy.maxTripDays } })
  }

  const rates = policiesModel.findRate(rankGroup, zone)
  if (!rates) issues.push({ code: 'NO_POLICY_FOR_RANK', params: { rank: user.rank } })

  const allowance = rates ? rates.dailyAllowance * days : 0
  const lodging = rates ? rates.lodgingCap * nights : 0
  const transport = TRANSPORT_ESTIMATE[request.transport]?.[zone] ?? 0

  return {
    compliant: issues.length === 0,
    issues,
    warnings,
    days,
    nights,
    zone,
    province,
    rank: user.rank,
    rates: rates || { dailyAllowance: 0, lodgingCap: 0 },
    breakdown: { allowance, lodging, transport, total: allowance + lodging + transport },
  }
}

module.exports = { evaluate }
