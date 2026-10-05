const config = require('../config')
const authService = require('../services/authService')
const usersModel = require('../models/users')

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const { token, user } = await authService.login({ email, password })
    res.cookie(config.cookie.name, token, authService.cookieOptions())
    res.json({ data: usersModel.toPublic(user) })
  } catch (err) {
    next(err)
  }
}

async function logout(_req, res, next) {
  try {
    res.clearCookie(config.cookie.name, { path: '/' })
    res.json({ data: { success: true } })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    res.json({ data: usersModel.toPublic(req.user) })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, logout, me }
