const router = require('koa-router')()
const constant=require('../database/mainDatabase').constant;
const config = require('../config')
const first_book = require('../service/FirstBook')
const first_enter =require('../service/FirstEnter')
const longest_book = require('../service/LongestBorrow')
const total_enter = require('../service/EnterTimes')
const total_borrow = require('../service/BorrowTimes')

router.get(['/',config.location], async ({request,response}) => {
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
    let portrayDig = total_enter>constant.avg_enter<<1 |total_borrow>constant.avg_borrow;
    let portray=portrayDig;
    switch(portrayDig){
      case 0:portray="画像:【借书少、入馆少】,待修改";break;
      case 1:portray="画像:【借书多、入馆少】,待修改";break;
      case 2:portray="画像:【借书少、入馆多】,待修改";break;
      case 3:portray="画像:【借书多、入馆多】,待修改";break;
    }
    if(firstbook&&firstenter&&totalborrow&&totalenter&&longestbook){
      ret.result=true;
      ret.data=[firstbook,firstenter,totalborrow,totalenter,longestbook,portray];
    }

    response.body=ret;
  })

module.exports= router