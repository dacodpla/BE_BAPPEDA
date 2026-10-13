const service = require('../services/dashboardService')

async function summary(req, res) {
  res.json({ data: await service.summary(req.user) })
}

async function upcomingTrips(req, res) {
  res.json({ data: service.upcomingTrips(req.user) })
}

module.exports = { summary, upcomingTrips }
