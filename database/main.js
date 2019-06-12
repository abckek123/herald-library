const mysql = require('mysql');
const config = require('../database-config');

const pool = mysql.createPool({
    connectionLimit:10,
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
});
pool.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});

module.exports=pool;