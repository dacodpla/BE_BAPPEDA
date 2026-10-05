const jwt = require('jsonwebtoken')
const config = require('../config')
const usersModel = require('../models/users')
const ApiError = require('../errors/ApiError')

async function login({ email, password }) {
  const user = await usersModel.findByEmail(email)
  const ok = user && (await usersModel.verifyPassword(user, password))
  if (!ok) {
    // Return same error whether the user exists or not to prevent enumeration.
    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid email or password.')
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
  return { token, user }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
  }
}

module.exports = { login, cookieOptions }
