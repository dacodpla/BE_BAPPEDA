const express = require('express')
const authenticate = require('../middleware/authenticate')
const controller = require('../controllers/dashboardController')

const router = express.Router()

router.use(authenticate)
router.get('/summary', controller.summary)
router.get('/upcoming-trips', controller.upcomingTrips)

module.exports = router
