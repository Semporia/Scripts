var mongoose = require('mongoose');
var config = require('../../config'); //读取配置文件config.js信息
const shici = mongoose.createConnection(config.database2); // 连接数据库
var Schema = mongoose.Schema;

module.exports = shici.model('shi', new Schema({
    author: String,
    paragraphs: [{
        type: String
    }],
    title: String,
    id: String,
    created_at: {type: Number, default: (Date.now()/1000).toPrecision(10)}
}), 'shi');