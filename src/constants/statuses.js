// Shared status enums. The frontend mirrors these values verbatim.

const TRAVEL_REQUEST_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  REVISION: 'REVISION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
})

// Allowed transitions for travel requests. Enforced in services/travelRequests.
const TRAVEL_REQUEST_TRANSITIONS = Object.freeze({
  DRAFT: ['PENDING'],
  PENDING: ['APPROVED', 'REJECTED', 'REVISION'],
  REVISION: ['PENDING'],
  APPROVED: ['COMPLETED'],
  REJECTED: [],
  COMPLETED: [],
})

const REIMBURSEMENT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REVISION: 'REVISION',
})

const REIMBURSEMENT_TRANSITIONS = Object.freeze({
  DRAFT: ['PENDING'],
  PENDING: ['APPROVED', 'REVISION'],
  REVISION: ['PENDING'],
  APPROVED: [],
})

const MASTER_DATA_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
})

function canTransition(map, from, to) {
  const allowed = map[from]
  return Array.isArray(allowed) && allowed.includes(to)
}

module.exports = {
  TRAVEL_REQUEST_STATUS,
  TRAVEL_REQUEST_TRANSITIONS,
  REIMBURSEMENT_STATUS,
  REIMBURSEMENT_TRANSITIONS,
  MASTER_DATA_STATUS,
  canTransition,
}
