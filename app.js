/* eslint-disable no-console */
const Koa = require('koa');
const app = new Koa()
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyParser = require('koa-bodyparser');
const logger = require('./util/logger')
const simple_verify=require('./util/simpleVerify')

const mainservice = require('./controller/mainController');
// error handler
onerror(app)
// middleWares
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger.koalogger)
app.use(simple_verify);

// router
app.use(mainservice.routes(), mainservice.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
module.exports = app
