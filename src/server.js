const app = require('./app')
const config = require('./config')

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`SIPEDIS API listening on http://localhost:${config.port}/api/v1`)
})
