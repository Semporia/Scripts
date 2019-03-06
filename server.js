var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

const url = require('url');
const crypto = require('crypto');
// const sha1 = require('sha1');
const xmlparser = require('express-xml-bodyparser');
const parseString = require('xml2js').parseString;

// Web 服务器端口
// 微信公众平台服务器配置中的 Token
const token = '8dI6rx4iBtPqRWmEjE8h';

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
app.use(xmlparser({trim: false, explicitArray: false}));

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

app.get('/worktile', function (req, res) {
  const result = checkSignature(req, res);
  res.send(result);
  console.log('req.body', req.body);

  // res.send({ code: 290 });
});

app.post('/worktile', function (req, res) {
  const str = req.body.xml.encrypt || req.body.xml.Encrypt || '';
  if (str) {
    const xmlResult = checkSignature(req, res, str);
    parseString(xmlResult, {trim: true, explicitArray: false}, (err, result) => {
      console.log('result', JSON.parse(result));  
    })
  }
  console.log('req.body', req.body);
  console.log('req.query', req.query);

  res.send('success');

});

function sha1(str) {
    const md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    const ciphertext = md5sum.digest('hex');
    return ciphertext;
  }

function _decode(data) {
  let aesKey = Buffer.from('21IpFqj8qolJbaqPqe1rVTAK5sgkaQ3GQmUKiUQLwRe' + '=', 'base64');
  let aesCipher = crypto.createDecipheriv("aes-256-cbc", aesKey, aesKey.slice(0, 16));
  aesCipher.setAutoPadding(false);
  const decipheredBuff = Buffer.concat([aesCipher.update(data, 'base64'), aesCipher.final()]);
  decipheredBuff = PKCS7Decoder(decipheredBuff);
  const len_netOrder_corpid = decipheredBuff.slice(16);
  const msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
  const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();

  return result; // 返回一个解密后的明文
}

function PKCS7Decoder(buff) {
  let pad = buff[buff.length - 1];
  if (pad < 1 || pad > 32) {
    pad = 0;
  }
  return buff.slice(0, buff.length - pad);
}

function checkSignature(req, res, encrypt) {
  console.log('hhh');

  const query = req.query;
  console.log('Request URL: ', req.url);
  const signature = query.msg_signature;
  const timestamp = query.timestamp;
  const nonce = query.nonce;
  let echostr;
  console.log('encrypt', encrypt);
  if (!encrypt) {
    echostr = query.echostr;
  } else {
    echostr = encrypt;
  }
  console.log('timestamp: ', timestamp);
  console.log('nonce: ', nonce);
  console.log('signature: ', signature);
  // 将 token/timestamp/nonce 三个参数进行字典序排序
  const tmpArr = [token, timestamp, nonce, echostr];
  const tmpStr = sha1(tmpArr.sort().join(''));
  console.log('Sha1 String: ', tmpStr);
  // 验证排序并加密后的字符串与 signature 是否相等
  if (tmpStr === signature) {
    // 原样返回echostr参数内容
    const result = _decode(echostr);
    console.log('last', result);
    console.log('Check Success');
    return result;
  } else {
    console.log('Check Failed');
    return 'failed';
  }
}

app.listen(port);
console.log('Magic happens at http://localhost:' + port);