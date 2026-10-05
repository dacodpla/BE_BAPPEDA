const ROLES = Object.freeze({
  EMPLOYEE: 'employee',
  APPROVER: 'approver',
  ADMIN: 'admin',
})

const ALL_ROLES = Object.freeze(Object.values(ROLES))

module.exports = { ROLES, ALL_ROLES }
