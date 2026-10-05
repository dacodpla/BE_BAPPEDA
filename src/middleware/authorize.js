const ApiError = require('../errors/ApiError')

// authorize('approver', 'admin')
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthenticated())
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden())
    }
    next()
  }
}

module.exports = authorize
