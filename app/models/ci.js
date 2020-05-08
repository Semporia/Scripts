var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config'); //读取配置文件config.js信息
const shici = mongoose.createConnection(config.database2); // 连接数据库

module.exports = shici.model('ci', new Schema({
    author: String,
    rhythmic: String,
    paragraphs: [{
        type: String
    }]
}), 'ci');