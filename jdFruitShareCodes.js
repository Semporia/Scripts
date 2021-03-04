/*
东东农场互助码
此文件为Node.js专用。其他用户请忽略
支持京东N个账号
 */
//云服务器腾讯云函数等NOde.js用户在此处填写京东东农场的好友码。
// github action用户的好友互助码填写到Action->Settings->Secrets->new Secret里面(Name填写 FruitShareCodes(此处的Name必须按此来写,不能随意更改),内容处填写互助码,填写规则如下)
// 同一个京东账号的好友互助码用@符号隔开,不同京东账号之间用&符号或者换行隔开,下面给一个示例
// 如: 京东账号1的shareCode1@京东账号1的shareCode2&京东账号2的shareCode1@京东账号2的shareCode2
let FruitShareCodes = [
  'c144db23b6fc4e779cf1112d1e1b052d@ed1ccad2bcd940119d93c83b9dfa6fda@fc943e869edf479aa99e1ec01ac26401@fb7f2258765449c693098d163d86463d@b71b5b2efe75423997d05b8017d44077@93bf6db5b5a24707830342a20cd83c44@2dc3b315f6cf4bde8ee3fba309986c1d@d674f26ee3424a1fbcdfb74c799156b9@40037e4227b04bf6b44a8d6dc646381b@840731518a5043dea2e5c663fd6a03f0',//账号一的好友shareCode,不同好友中间用@符号隔开
  'c144db23b6fc4e779cf1112d1e1b052d@ed1ccad2bcd940119d93c83b9dfa6fda@fc943e869edf479aa99e1ec01ac26401@fb7f2258765449c693098d163d86463d@b71b5b2efe75423997d05b8017d44077@93bf6db5b5a24707830342a20cd83c44@2dc3b315f6cf4bde8ee3fba309986c1d@d674f26ee3424a1fbcdfb74c799156b9@40037e4227b04bf6b44a8d6dc646381b@840731518a5043dea2e5c663fd6a03f0',//账号二的好友shareCode，不同好友中间用@符号隔开
]
// 判断github action里面是否有东东农场互助码
if (process.env.FRUITSHARECODES) {
  if (process.env.FRUITSHARECODES.indexOf('&') > -1) {
    console.log(`您的东东农场互助码选择的是用&隔开\n`)
    FruitShareCodes = process.env.FRUITSHARECODES.split('&');
  } else if (process.env.FRUITSHARECODES.indexOf('\n') > -1) {
    console.log(`您的东东农场互助码选择的是用换行隔开\n`)
    FruitShareCodes = process.env.FRUITSHARECODES.split('\n');
  } else {
    FruitShareCodes = process.env.FRUITSHARECODES.split();
  }
} else if (process.env.JD_COOKIE) {
  console.log(`由于您secret里面未提供助力码，故此处运行将会给脚本内置的码进行助力，请知晓！`)
}
for (let i = 0; i < FruitShareCodes.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['FruitShareCode' + index] = FruitShareCodes[i];
}
