const multer = require('multer')
const ApiError = require('../errors/ApiError')
const config = require('../config')

function normalize(err) {
  if (err instanceof ApiError) return err
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiError.fileTooLarge(`File exceeds the ${config.upload.maxFileMb} MB limit.`)
    }
    return ApiError.validation({ files: err.message })
  }
  if (err?.type === 'entity.parse.failed') return ApiError.badRequest('Malformed JSON body.')
  return null
}

// Express 5 forwards async errors automatically. This is the last middleware.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const known = normalize(err)
  const apiErr =
    known || ApiError.internal(config.isProd ? undefined : err.message || 'Internal server error')

  if (!known && !config.isProd) {
    // eslint-disable-next-line no-console
    console.error(err)
  }

  const body = { error: { code: apiErr.code, message: apiErr.message } }
  if (apiErr.fields) body.error.fields = apiErr.fields

  res.status(apiErr.status).json(body)
}

module.exports = errorHandler
