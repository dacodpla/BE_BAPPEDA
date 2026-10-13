const express = require('express')
const ApiError = require('../errors/ApiError')
const authRoutes = require('./auth.routes')
const dashboardRoutes = require('./dashboard.routes')
const travelRequestsRoutes = require('./travelRequests.routes')

const router = express.Router()

router.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', uptime: process.uptime() } })
})

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/travel-requests', travelRequestsRoutes)

// 404 for unmatched /api/v1 routes.
router.use((_req, _res, next) => next(ApiError.notFound('Route not found')))

module.exports = router
