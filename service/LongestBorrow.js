const db = require("../database/mainDatabase");
const log = require("../util/logger");

const SQL = "SELECT * FROM  _longest_book WHERE 证件号=?";
module.exports = async function (cardnum) {
    let connection = db.connection;
    return await connection.execute(SQL, [cardnum]).then(([row, col]) => {
        if (row.length == 0) return {};
        return {
            span: row[0]['时长'],
            books: row.map(e => {
                return {
                    bookName: e['题名'],
                    borrowTime: e['借书日期'].toLocaleString(),
                    returnTime: e['（应）还书日期'].toLocaleString()
                }
            })
        }
        console.log(row)
        return row;
    }).catch(err => {
        log.log("最长借书查询失败--" + cardnum);
        console.log(err);
        return null;
    });
}