const {db} = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL="SELECT * FROM  _fisrt_book WHERE 证件号=?";
module.exports=async function(cardnum){
    let connection =db.connection;
    return await connection.execute(SQL,[cardnum]).then(([row,col])=>{
        if(row.length==0)return {};
        let data=row[0];
        return {
            bookName:data['题名'],
            time: data['借书日期'].toLocaleString()
        };
    }).catch(err=>{
        log.log("第一本书查询失败--"+cardnum);
        console.log(err);
        return null;
    });
}