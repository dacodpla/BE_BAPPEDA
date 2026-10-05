const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const config = require('./config')
const apiRouter = require('./routes')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api/v1', apiRouter)

app.use(errorHandler)

module.exports = app
