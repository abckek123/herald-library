const db = require('../database/mainDatabase');
const log = require("../util/logger");

const SQL="SELECT 1 FROM check_record WHERE 一卡通=? AND 姓名=?"
const simple_verify=async ({request,response},next)=>{
    let {query}=request;
    let {cardnum,name}=query;
    let ret=await db.connection.execute(SQL,[cardnum,name])
        .catch(err=>{
            log.log(`校验查询失败--${cardnum}:${name}`);
            console.log(err);
            return null;
        });
    if(!ret||ret[0].length!==1){
        response.status=401;
        response.body={
            result:false,
            data:null
        }
    }else{
        await next();
    }

}
module.exports=simple_verify;