const { ROLES } = require('../constants/roles')
const requestsModel = require('../models/travelRequests')
const usersModel = require('../models/users')
const { todayISO } = require('../utils/dates')

async function summary(user) {
  const today = todayISO()
  const year = Number(today.slice(0, 4))
  const stored = await usersModel.findById(user.id)

  const budgetAllocation = stored.annualBudget
  const budgetUsed = requestsModel.sumBudgetUsed(user.id, year)
  const isApprover = user.role === ROLES.APPROVER || user.role === ROLES.ADMIN

  return {
    activeTrips: requestsModel.countActiveTrips(user.id, today),
    // Employees see their own pending requests; approvers/admins see the whole queue.
    pendingApprovals: requestsModel.countPending(isApprover ? null : user.id),
    budgetUsed,
    budgetAllocation,
    budgetRemaining: Math.max(0, budgetAllocation - budgetUsed),
    budgetUsedPercent: budgetAllocation > 0 ? Math.min(100, Math.round((budgetUsed / budgetAllocation) * 100)) : 0,
  }
}

function upcomingTrips(user, limit = 5) {
  return requestsModel.upcoming(user.id, todayISO(), limit).map((r) => ({
    id: r.id,
    sppdRef: r.sppdRef,
    destination: r.destination,
    purpose: r.purpose,
    departDate: r.departDate,
    returnDate: r.returnDate,
    status: r.status,
  }))
}

module.exports = { summary, upcomingTrips }
