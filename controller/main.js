const router = require('koa-router')()
const pool = require('../database/main')

router.get('/', async ({request,response}) => {
    let {query}=request;
  })

module.exports= router