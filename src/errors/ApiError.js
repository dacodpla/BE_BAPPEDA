// Standardised error class. Controllers throw these; errorHandler formats them.
// Codes match DESIGN.md section 12 so the frontend can react consistently.

class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message)
    this.status = status
    this.code = code
    if (fields) this.fields = fields
  }

  static badRequest(message = 'Bad request', fields) {
    return new ApiError(400, 'BAD_REQUEST', message, fields)
  }
  static unauthenticated(message = 'Not authenticated') {
    return new ApiError(401, 'UNAUTHENTICATED', message)
  }
  static forbidden(message = 'Not allowed') {
    return new ApiError(403, 'FORBIDDEN', message)
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, 'NOT_FOUND', message)
  }
  static invalidTransition(message = 'Invalid status transition') {
    return new ApiError(409, 'INVALID_TRANSITION', message)
  }
  static fileTooLarge(message = 'File too large') {
    return new ApiError(413, 'FILE_TOO_LARGE', message)
  }
  static validation(fields, message = 'Some fields are invalid.') {
    return new ApiError(422, 'VALIDATION_ERROR', message, fields)
  }
  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  }
}

module.exports = ApiError
