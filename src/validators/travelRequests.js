const { z } = require('zod')
const { TRAVEL_REQUEST_STATUS } = require('../constants/statuses')
const { TRANSPORTS } = require('../constants/travel')
const { isValidISODate } = require('../utils/dates')

const isoDate = (label) =>
  z.string(`${label} is required`).refine(isValidISODate, `${label} must be a valid date (YYYY-MM-DD)`)

const tripShape = {
  destination: z.string('Destination is required').trim().min(1, 'Destination is required').max(120, 'Destination is too long'),
  departDate: isoDate('Departure date'),
  returnDate: isoDate('Return date'),
  purpose: z
    .string('Purpose is required')
    .trim()
    .min(5, 'Purpose must be at least 5 characters')
    .max(500, 'Purpose is too long'),
  transport: z.enum(TRANSPORTS, 'Choose a valid transportation mode'),
}

function checkOrder(data, ctx) {
  if (data.departDate && data.returnDate && data.returnDate < data.departDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['returnDate'],
      message: 'Return date must not be before departure date.',
    })
  }
}

// Refinements are applied after .partial() because Zod 4 forbids deriving from refined objects.
const createBody = z.object(tripShape).superRefine(checkOrder)
const patchBody = z.object(tripShape).partial().superRefine(checkOrder)

const idParams = z.object({ id: z.string().min(1) })
const docParams = z.object({ id: z.string().min(1), docId: z.string().min(1) })

const listQuery = z.object({
  status: z.enum(Object.values(TRAVEL_REQUEST_STATUS)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

module.exports = {
  createSchema: { body: createBody },
  patchSchema: { params: idParams, body: patchBody },
  idSchema: { params: idParams },
  docSchema: { params: docParams },
  listSchema: { query: listQuery },
}
