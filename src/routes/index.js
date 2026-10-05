const express = require('express')
const authRoutes = require('./auth.routes')

const router = express.Router()

router.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } })
})

router.use('/auth', authRoutes)

// 404 for unmatched /api/v1 routes.
router.use((_req, _res, next) => {
  const ApiError = require('../errors/ApiError')
  next(ApiError.notFound('Route not found'))
})

module.exports = router
