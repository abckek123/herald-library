const chalk = require('chalk')
const log = (msg) => {
    console.log(new Date().toLocaleString()+'\t'+chalk.green(msg));
}
const err =(msg)=>{
    console.log(new Date().toLocaleString()+'\t'+chalk.red(msg));
}
const koalogger = async (ctx, next) => {
    await next();
    let color;
    if(ctx.status==200){
        color=chalk.green;
    }else if(ctx.status>=300&&ctx.status<400){
        color=chalk.yellow;
    }else if(ctx.status>=400&&ctx.status<500){
        color=chalk.red;
    }else{
        color=chalk.white;
    }
    console.log(`${new Date().toLocaleString()} >\t${ctx.method} ${decodeURIComponent(ctx.querystring)} ${color(ctx.status)}`)

}
module.exports = {
    log,
    err,
    koalogger
}