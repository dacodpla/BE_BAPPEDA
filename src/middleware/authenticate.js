const jwt = require('jsonwebtoken')
const config = require('../config')
const ApiError = require('../errors/ApiError')
const usersModel = require('../models/users')

async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.[config.cookie.name]
    if (!token) throw ApiError.unauthenticated()

    let payload
    try {
      payload = jwt.verify(token, config.jwt.secret)
    } catch {
      throw ApiError.unauthenticated('Session expired or invalid')
    }

    const user = await usersModel.findById(payload.sub)
    if (!user) throw ApiError.unauthenticated()

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = authenticate
