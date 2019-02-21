var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

const url = require('url');
const crypto = require('crypto');
const sha1 = require('sha1');


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
    checkSignature(req, res);

    console.log('req.body', req.body);

    // res.send({ code: 290 });
});

// function sha1(str) {
//     const md5sum = crypto.createHash('sha1');
//     md5sum.update(str);
//     const ciphertext = md5sum.digest('hex');
//     return ciphertext;
//   }
  
  function _decode(data) {
    // const AESKey = Buffer.from('21IpFqj8qolJbaqPqe1rVTAK5sgkaQ3GQmUKiUQLwRe', 'base64')
    // const iv = AESKey.slice(0, 16)
    // const decipher = crypto.createDecipheriv('aes-256-cbc', AESKey, iv)
    // decipher.setAutoPadding(false)
    // return decodePkcs(
    //   Buffer.concat([
    //     decipher.update(data, 'base64'),
    //     decipher.final()
    //   ])
    // )
      
//       let aesKey = Buffer.from('21IpFqj8qolJbaqPqe1rVTAK5sgkaQ3GQmUKiUQLwRe' + '=', 'base64');
//       const cipherEncoding = 'base64';
//       const clearEncoding = 'utf8';
//       const cipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
//       cipher.setAutoPadding(false); // 是否取消自动填充 不取消
//       let this_text = cipher.update(data, cipherEncoding, clearEncoding) + cipher.final(clearEncoding);
//       /*
// 26         密文的构成
// 27             Base64_Encode(AES_Encrypt[random(16B) + msg_len(4B) + msg + $appId])
// 28         但是由于部分消息是不满足那个 32 位的，所以导致上面那个 cipher.final() 函数报错，所以修改为了自动填充，所以 appId后面还跟着一些字符
// 29             就无法正常解析了，所以就不返回 corpid 了，然后返回我们想要的东西。
// 30      */
//       return {
//           noncestr: this_text.substring(0, 16),
//           msg_len: this_text.substring(16, 20),
//           msg: this_text.substring(20, this_text.lastIndexOf("}") + 1)
//       };
      
      var aesCipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, this.iv);
    aesCipher.setAutoPadding(false);
    var decipheredBuff = Buffer.concat([aesCipher.update(echostr, 'base64'), aesCipher.final()]);
    decipheredBuff = this.PKCS7Decoder(decipheredBuff);
    var len_netOrder_corpid = decipheredBuff.slice(16);
    var msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
    var result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
    
    return result; // 返回一个解密后的明文
  }
  
  function decodePkcs(buf) {
    blockSize = 32;
    let padLen = buf[buf.length - 1]
    if (padLen < 1 || padLen > blockSize)
      padLen = 0
    return buf.slice(0, buf.length - padLen)
  }

  function checkSignature(req, res) {
    console.log('hhh');
    
    const query = req.query;
    console.log('Request URL: ', req.url);
    const signature = query.msg_signature;
    const timestamp = query.timestamp;
    const nonce = query.nonce;
    const echostr = query.echostr;
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
      
      res.end(echostr);
      console.log('Check Success');
    } else {
      res.end('failed');
      console.log('Check Failed');
    }
  }

app.listen(port);
console.log('Magic happens at http://localhost:' + port);