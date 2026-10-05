const { ZodError } = require('zod')
const ApiError = require('../errors/ApiError')

// Usage: router.post('/x', validate({ body: schema, query: ..., params: ... }), handler)
function validate(schemas) {
  return (req, _res, next) => {
    try {
      for (const key of ['body', 'query', 'params']) {
        if (!schemas[key]) continue
        const result = schemas[key].safeParse(req[key])
        if (!result.success) {
          throw ApiError.validation(flattenZodErrors(result.error))
        }
        // Replace with parsed (coerced) data.
        req[key] = result.data
      }
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return next(ApiError.validation(flattenZodErrors(err)))
      }
      next(err)
    }
  }
}

function flattenZodErrors(zodError) {
  const fields = {}
  for (const issue of zodError.issues) {
    const path = issue.path.join('.')
    if (!(path in fields)) fields[path] = issue.message
  }
  return fields
}

module.exports = validate
