const {db} = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL="SELECT 第一次进馆 FROM  check_record WHERE 一卡通=?"
module.exports=async function(cardnum){
    let connection =db.connection;
    return await connection.execute(SQL,[cardnum]).then(([row,col])=>{
        if(row.length==0)return {};
        let data=row[0];
        return {
            time: data['第一次进馆'].toLocaleString()
        };
    }).catch(err=>{
        log.log("首次进馆查询失败--"+cardnum);
        console.log(err);
        return null;
    })
}