const ApiError = require('../errors/ApiError')

// Usage: router.post('/x', validate({ body: schema, query: ..., params: ... }), handler)
function validate(schemas) {
  return (req, _res, next) => {
    for (const key of ['body', 'query', 'params']) {
      if (!schemas[key]) continue
      const result = schemas[key].safeParse(req[key])
      if (!result.success) {
        return next(ApiError.validation(flattenZodErrors(result.error)))
      }
      // Express 5 exposes req.query as a read-only getter, so redefine it.
      Object.defineProperty(req, key, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    }
    next()
  }
}

function flattenZodErrors(zodError) {
  const fields = {}
  for (const issue of zodError.issues) {
    const path = issue.path.join('.') || '_'
    if (!(path in fields)) fields[path] = issue.message
  }
  return fields
}

module.exports = validate
