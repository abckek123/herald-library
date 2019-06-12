/* eslint-disable no-console */
const Koa = require('koa');
const app = new Koa()
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

const mainservice = require('./controller/main');
// error handler
onerror(app)
// middleWares
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

// router
app.use(mainservice.routes(), mainservice.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
module.exports = app
