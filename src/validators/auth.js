const { z } = require('zod')

const loginSchema = {
  body: z.object({
    email: z
      .string('Email is required')
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z.string('Password is required').min(1, 'Password is required'),
  }),
}

module.exports = { loginSchema }
