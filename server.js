var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var config = require('./config'); //读取配置文件config.js信息
var User = require('./app/models/yiyan'); //获取 yiyan model 信息
var port = process.env.PORT || 8080; // 设置启动端口
mongoose.connect(config.database); // 连接数据库
app.set('superSecret', config.secret); // 设置app 的超级密码--用来生成摘要的密码
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://ninesix.cc');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

//用body parser 来解析post和url信息中的参数
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 使用 morgan 将请求日志打印到控制台
app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API 路由 -------------------
app.get('/yiyan', function (req, res) {

    User.aggregate([{ $sample: { size: 1 } }], function (err, data) {
        if (err) throw err;
        res.send({ code: 200, data: data[0] });
    });

});

app.get('/yi', function (req, res) {

    var user = new User({
        content: "这是一个测试内容",
        from: "hunter",
        type: "e",
        creator: "hunter",
        yid: "12345"
    });

    user.save(function (err, data) {
        res.send(data);
    });

});

app.post('/worktile', function (req, res) {

    console.log('req.body', req.body);

    res.send({ code: 290 });
});

app.listen(port);
console.log('Magic happens at http://localhost:' + port);