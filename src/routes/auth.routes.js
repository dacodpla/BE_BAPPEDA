const express = require('express')
const rateLimit = require('express-rate-limit')
const config = require('../config')
const validate = require('../middleware/validate')
const authenticate = require('../middleware/authenticate')
const controller = require('../controllers/authController')
const { loginSchema } = require('../validators/auth')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'BAD_REQUEST',
      message: 'Too many attempts. Please try again later.',
    },
  },
})

router.post('/login', authLimiter, validate(loginSchema), controller.login)
router.post('/logout', authenticate, controller.logout)
router.get('/me', authenticate, controller.me)

module.exports = router
