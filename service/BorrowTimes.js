const db = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL="SELECT * FROM  _borrow_times WHERE 证件号=?"
module.exports=async function(cardnum){
    let connection =db.connection;
    return await connection.execute(SQL,[cardnum]).then(([row,col])=>{
        if(row.length==0)return {};
        let data=row[0];
        return {
            borrowCount : data['总借阅次数'] ,
            deptName: data['单位'],
            rankDept : data['院系排名'] ,
            rankAll : data['校内排名'] ,
            studentCount : 	db.constant.total_borrow
        };
    }).catch(err=>{
        log.log("借书次数查询失败--"+cardnum);
        console.log(err);
        return null;
    })
}