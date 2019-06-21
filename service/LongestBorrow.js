const {db} = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL = "SELECT * FROM  _longest_book WHERE 证件号=?";
module.exports = async function (cardnum) {
    let connection = db.connection;
    return await connection.execute(SQL, [cardnum]).then(([row, col]) => {
        if (row.length == 0) return {};
        return {
            span: row[0]['时长'],
            bookName: row[0]['题名'],
            borrowTime: row[0]['借书日期'].toLocaleString(),
            returnTime: row[0]['（应）还书日期'].toLocaleString(),
        }
    }).catch(err => {
        log.log("最长借书查询失败--" + cardnum);
        console.log(err);
        return null;
    });
}