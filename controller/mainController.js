const router = require('koa-router')()
const first_book = require('../service/FirstBook')
const first_enter =require('../service/FirstEnter')
const longest_book = require('../service/LongestBorrow')
const total_enter = require('../service/EnterTimes')
const total_borrow = require('../service/BorrowTimes')

router.get('/', async ({request,response}) => {
    let {query}=request;
    let {cardnum,name}=query;
    let ret={
      result:false,
      data:null
    };
    let firstbook=await first_book(cardnum);
    let firstenter=await first_enter(cardnum);
    let totalenter = await total_enter(cardnum);
    let totalborrow = await total_borrow(cardnum);
    let longestbook = await longest_book(cardnum);

    if(firstbook&&firstenter&&totalborrow&&totalenter&&longestbook){
      ret.result=true;
      ret.data=[firstbook,firstenter,totalborrow,totalenter,longestbook];
    }

    response.body=ret;
  })

module.exports= router