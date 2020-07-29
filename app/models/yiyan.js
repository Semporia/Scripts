var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config'); //读取配置文件config.js信息
const yiyan = mongoose.createConnection(config.database1); // 连接数据库

module.exports = yiyan.model('yiYan', new Schema({
    content: String,
    from: String,
    type: String,
    creator: String,
    yid: String,
    created_at: {type: Number, default: (Date.now()/1000).toPrecision(10)}
}));