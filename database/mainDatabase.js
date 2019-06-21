const mysql = require('mysql2/promise');
const config = require('../config');
const logger = require('../util/logger')
let db = {
    connection: null,
    constant: {
        total_borrow: 0,
        total_enter: 0,
        mid_borrow: 0,
        mid_enter: 0,
        total_borrow_dept: {},
        total_enter_dept: {}
    },
};
let _execute=mysql.PromiseConnection.prototype.execute;
mysql.PromiseConnection.prototype.execute=async function(query, params){
    return await _execute.call(db.connection,query,params)
        .catch(async err=>{
            if(err.message.includes('closed')){
                await reconnect();
                return await _execute.call(db.connection,query,params);
            }
        })
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
            RANK() OVER d as '院系排名',
            RANK() OVER s AS '校内排名',
            ROW_NUMBER() OVER s as '序号'
        FROM(
            SELECT 证件号,姓名,单位,COUNT(uuid) as ct
            FROM library_record
            GROUP BY 证件号,单位
            ) as t
        WINDOW s AS (order by t.ct DESC),d AS (PARTITION BY t.单位 order by t.ct DESC)
        ORDER BY 序号`
    ).catch(err => {
        logger.err('_borrow_times 创建失败');
        console.log(err);
        throw err;
    });
    logger.log('_borrow_times 创建完成');
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS _enter_times
    SELECT t.一卡通,t.姓名,t.院系,t.进馆次数,
        RANK() OVER d as '院系排名',
        RANK() OVER s AS '校内排名',
        ROW_NUMBER() OVER s as '序号'
    FROM check_record t
    WINDOW s as (order by t.进馆次数 DESC),d as (PARTITION BY t.院系 order by t.进馆次数 DESC) 
    ORDER BY 序号;`
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
    db.constant.mid_enter = await connection.execute(`
        SELECT 进馆次数 as mid
        from _enter_times
        where 序号=(
            SELECT round(max(序号)/2) 
            from _enter_times);`)
        .then(([row]) => Number(row[0]['mid']))
        .catch(err => {
            logger.err('常量 mid_enter 初始化失败')
            console.log(err);
            throw err;
        });

    logger.log(`常量 mid_enter 初始化完成:${db.constant.mid_enter}`);

    db.constant.total_enter_dept = await connection.execute(`
        SELECT 院系,COUNT(DISTINCT 一卡通) as count 
        FROM check_record
        GROUP BY 院系`
    ).then(([row]) => {
        let temp = {};
        row.forEach(each => {
            temp[each['院系']] = Number(each['count']);
            db.constant.total_enter += temp[each['院系']];
        })
        return temp;
    }).catch(err => {
        logger.err('常量 total_enter_dept 初始化失败')
        console.log(err);
        throw err;
    })
    logger.log('常量 total_enter_dept 初始化完成');

    db.constant.mid_borrow = await connection.execute(`
        SELECT 总借阅次数 as mid
        from _borrow_times
        where 序号=(
            SELECT round(max(序号)/2) 
            from _borrow_times);`)
        .then(([row]) => Number(row[0]['mid']))
        .catch(err => {
            logger.err('常量 total_borrow,mid_borrow 初始化失败')
            console.log(err);
            throw err;
        });
    logger.log(`常量 mid_borrow 初始化完成:${db.constant.mid_borrow}`);

    db.constant.total_borrow_dept = await connection.execute(`
        SELECT 单位,COUNT(DISTINCT 证件号) as count 
        FROM library_record
        GROUP BY 单位`
    ).then(([row]) => {
        let temp = {};
        row.forEach(each => {
            temp[each['单位']] = Number(each['count']);
            db.constant.total_borrow += temp[each['单位']];
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
async function reconnect(){
    logger.log("数据库重新连接...");
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
}
module.exports = {db,reconnect};