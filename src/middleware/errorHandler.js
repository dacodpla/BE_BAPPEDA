const ApiError = require('../errors/ApiError')
const config = require('../config')

// Express 5 forwards async errors automatically. This is the last middleware.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const apiErr =
    err instanceof ApiError
      ? err
      : ApiError.internal(config.isProd ? undefined : err.message || 'Internal server error')

  if (!config.isProd && !(err instanceof ApiError)) {
    // Log stack for unexpected errors during development.
    // eslint-disable-next-line no-console
    console.error(err)
  }

  const body = {
    error: {
      code: apiErr.code,
      message: apiErr.message,
    },
  }
  if (apiErr.fields) body.error.fields = apiErr.fields

  res.status(apiErr.status).json(body)
}

module.exports = errorHandler
