const db = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL="SELECT * FROM  _enter_times WHERE 一卡通=?"
module.exports=async function(cardnum){
    let connection =db.connection;
    return await connection.execute(SQL,[cardnum]).then(([row,col])=>{
        if(row.length==0)return {};
        let data=row[0];
        return {
            borrowCount : data['进馆次数'] ,
            deptName: data['院系'],
            rankDept : data['院系排名'] ,
            rankAll : data['校内排名'] ,
            studentCount : 	db.constant.total_enter
        };
    }).catch(err=>{
        log.log("进馆次数查询失败--"+cardnum);
        console.log(err);
        return null;
    })
}