require('dotenv').config()

const isProd = process.env.NODE_ENV === 'production'

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined || value === null || value === '') {
    if (isProd) throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd,
  port: Number(process.env.PORT || 3000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    secret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },

  cookie: {
    name: process.env.AUTH_COOKIE_NAME || 'sipedis_session',
    secure: String(process.env.AUTH_COOKIE_SECURE || 'false') === 'true',
    sameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
  },

  authRateLimit: {
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  },
}

module.exports = config
