const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../util/logger')
let db = {
    connection: null,
    constant: {
        total_borrow: 0,
        total_enter: 0,
        avg_borrow: 0,
        avg_enter: 0,
        total_borrow_dept: {},
        total_enter_dept: {}
    }
};
(async function () {
    db.connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        database: config.database
    }).catch(err => {
        logger.err('数据库连接失败');
        console.log(err.stack);
        throw err;
    });
    let connection = db.connection;
    logger.log('数据库初始化...')
    //结果表创建
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS _fisrt_book
        SELECT ori.*
        FROM library_record as ori,(
            SELECT 证件号,MIN(借书日期) as fi
            FROM library_record
            GROUP BY 证件号
            ) as f
        WHERE ori.证件号=f.证件号 AND ori.借书日期=f.fi;`
    ).catch(err => {
        logger.err('_first_book 创建失败');
        console.log(err.stack);
        throw err;
    });
    logger.log('_first_book 创建完成');
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS _borrow_times
        SELECT t.证件号,t.姓名,t.单位,t.ct as '总借阅次数',
            RANK() OVER (PARTITION BY t.单位 order by t.ct DESC) as '院系排名',
            RANK() OVER (order by t.ct DESC) AS '校内排名'
        FROM(
            SELECT 证件号,姓名,单位,COUNT(uuid) as ct
            FROM library_record
            GROUP BY 证件号,单位) as t;`
    ).catch(err => {
        logger.err('_borrow_times 创建失败');
        console.log(err);
        throw err;
    });
    logger.log('_borrow_times 创建完成');
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS _enter_times
        SELECT t.一卡通,t.姓名,t.院系,t.进馆次数,
        RANK() OVER (PARTITION BY t.院系 order by t.进馆次数 DESC) as '院系排名',
        RANK() OVER (order by t.进馆次数 DESC) AS '校内排名'
    FROM check_record t;`
    ).catch(err => {
        logger.err('_enter_times 创建失败');
        console.log(err);
        throw err;
    });
    logger.log('_enter_times 创建完成');

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS _longest_book
        SELECT ori.*,DATEDIFF(ori.（应）还书日期,ori.借书日期) as 时长
        FROM library_record as ori,(
            SELECT 证件号,MAX(DATEDIFF(（应）还书日期,借书日期)) as longest
            FROM library_record
            GROUP BY 证件号
            ) as max
        WHERE ori.证件号=max.证件号 AND DATEDIFF(ori.（应）还书日期,ori.借书日期)=max.longest;`
    ).catch(err => {
        logger.err('_longest_book 创建失败');
        console.log(err);
        throw err;
    });
    logger.log('_longest_book 创建完成');

    //常量初始化
    [db.constant.total_enter,db.constant.avg_enter]=
    await connection.execute('SELECT COUNT(一卡通) as count,AVG(进馆次数) as avg FROM check_record')
            .then(([row]) => [row[0]['count'],row[0]['avg']])
            .catch(err => {
                logger.err('常量 total_enter,avg_enter 初始化失败')
                console.log(err);
                throw err;
            });
            
    logger.log(`常量 total_enter,avg_enter 初始化完成:${db.constant.total_enter},${db.constant.avg_enter}`);

    db.constant.total_enter_dept = await connection.execute(`
        SELECT 院系,COUNT(DISTINCT 一卡通) as count 
        FROM check_record
        GROUP BY 院系`
    ).then(([row]) => {
        let temp = {};
        row.forEach(each => {
            temp[each['院系']] = each['count'];
        })
        return temp;
    }).catch(err => {
        logger.err('常量 total_enter_dept 初始化失败')
        console.log(err);
        throw err;
    })
    logger.log('常量 total_enter_dept 初始化完成');

    [db.constant.total_borrow,db.constant.avg_borrow] = 
    await connection.execute('SELECT SUM(总借阅次数) as count,AVG(总借阅次数) as avg FROM _borrow_times')
        .then(([row]) => [row[0]['count'],row[0]['avg']])
        .catch(err => {
            logger.err('常量 total_borrow,avg_borrow 初始化失败')
            console.log(err);
            throw err;
        });
    logger.log(`常量 total_borrow,avg_borrow 初始化完成:${db.constant.total_borrow},${db.constant.avg_borrow}`);

    db.constant.total_borrow_dept = await connection.execute(`
        SELECT 单位,COUNT(DISTINCT 证件号) as count 
        FROM library_record
        GROUP BY 单位`
    ).then(([row]) => {
        let temp = {};
        row.forEach(each => {
            temp[each['单位']] = each['count'];
        })
        return temp;
    }).catch(err => {
        logger.err('常量 total_borrow_dept 初始化失败')
        console.log(err);
        throw err;
    });
    logger.log('常量 total_borrow_dept 初始化完成');


    logger.log('数据库初始化完成');
    logger.log('服务开始');
})()

module.exports = db;