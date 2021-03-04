/*
领京豆额外奖励&抢京豆
脚本自带助力码，介意者可将 29行 helpAuthor 变量设置为 false
活动入口：京东APP首页-领京豆
更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#领京豆额外奖励
10 7 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_bean_home.png, enabled=true

================Loon==============
[Script]
cron "10 7 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励

===============Surge=================
领京豆额外奖励 = type=cron,cronexp="10 7 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js

============小火箭=========
领京豆额外奖励 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, cronexpr="10 7 * * *", timeout=3600, enable=true
 */
const $ = new Env('领京豆额外奖励');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const helpAuthor = true; // 是否帮助作者助力，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/';
!(async () => {
  $.newShareCodes = []
  // await getAuthorShareCode();
  // await getAuthorShareCode2();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      var _0xodT='jsjiami.com.v6',_0x3015=[_0xodT,'w5jDp8KENMK1w454wrTDrDhTSEBxw5sh','CFUFw7w=','GmnDocK1wrPCrsKkwoZ1XEIswpTComrDl8OSw7AywoReSEHDusOew6rDh8Kqb8KCw71OHcKIw7V9XxPCk8KyX8Omwr3ClMK7bcKRIEnCpMKGwqjDh8K2URU2wpXDtEbCvmrCoMOLKTYtw57DgMOdwpUTw6DDsylPWcKDWcOsPm0Zwr7Dm0zCtW0XwrzCt2nCs0vDkzLChxQjDMK5wrU4RMKYPcKgwonCmlHCrcOZAMKJDsK9wpYiw7/Ci8KZK8ONEjZRwqNUw4lnwrQrRVk/DRASwqxSw5wew7NSwr7CrcKVWwB9wrckIMO2','wpPCq8KJw7rCnB9iwpBZ','wpLCscKLw6PCm0A/w7ZcwoVSw5HDsFfDksOJwpHDq2p2QMOmwo7DiQ==','RQMxwozCug==','E8KnwpfDvkk=','NMK/w7EtSA==','bBbCh8OVw7g=','HU7CnMKdw6c=','SgbChcO2w53DvA==','w58lZA==','wqoaUsKUwoYlXlhuCDQTw6g=','GsKhwok=','wrzCm8KRMsK5w555wq7DvyBXQVE=','f8OOCDrCqQ==','w6fChcOAwqLDsA==','dibCjsOLw6bDmFc8CRw=','T8OaasKZWMKOOA==','w7EjeyTDvg==','LBvCicKuwrgFwr4=','aB3CosObw4M=','FCkbf8O3','ND3DkQfChAouw7E1WsOtFEHCncOhVcOQWsOYwpzCul/CnlgrNxlHaMOzYsOjwpzDuFh5CA==','AsKfw605VsOkw4rClsK1wrbCpxw7wpLCsQp4woJqw4HCmHxXJ2DCgcKMwrlBa8KyIcOswolTwoNlZcO4wpAMRCBnwrvCmsORA09hw7jCk8Kww7bChyMAwqdwa8KEMk3CrsOdKA3Dp8O5UCXDunQrw4p1wqTDjwjCl8KZwpgSHcOIw7HCqnAKwr5rw4nCoWXCt8O9XcOpRAxPNzogwr7Dv8KNCMKlPQnDjlQD','GCfCisKSwoE=','SgHDvcKow5J4RzPCsMKBwrPCjkNQw7HDilIYF8KBOMOrwoUJR8KLw6fDsntnL8KeAyzDssOAZsKGR8OgJcOPw4Q=','ImDCvMK3','wpLCscKLw6PCm0A/w7ZawpxPwprDuFfDm8OCw5LCp1Z0GsK3wp7ClcK/NUwRwrNTCsKEwo/Dj8K/PBbDl8KEdMKAw7k4Sgsbwp7CqMKkIwbCqB7Cok3DkD7Cm3pnwoAEw6tYDwTChH7DncKp','wrfCqsKFw7rChBZxw7YIw5sLw5/CtRDDqMOFw5DDpmAgT8KawqrCocOxKHMXwqUSPcOFwq7DuMOwYHbDoMOXWcOWwpo7RwVRw4zChMKyb0vChj7DtnDCizHCsG5Iwr8Rw5lYCWHCh3nCncOxwrANw6nDrlUIYcKEwrlMAUbDp8OrwprCgsK3w6rDnFBMJsOew4XCkMOlAsKpKTM1w6/ChcOyQj97eMO5SX4Gw6HDucK5w4EoLcO8wp/DisODbV7CjcOQCMOLwqYvw6HCkio8f8KBw6jCjsKDwoLDpn0hw591wpzCvcOEw7nCisKQw5s1LWlc','NWrCuw==','w5gHVxDDiQ==','GBoow6EB','wrRCwrPDssKEw5jDiA==','Ox/Cj8K5wrw=','woDCs8OXLcK8','O8O4MD1AwrnCjQ==','w7FiPMKmBMOE','SQzCmsO0w6o=','BMOiLA7Cp8Knwqc=','LMK/wprDo0g=','wo8wBcK3DsKz','cMKUw5PDnHN3w40=','R8KFw4LDmFA=','EMKew70A','wp7Cv8KdN8Ku','wqPCiMKiw6pLJ8Od','EXY1w5gR','W8O2FhY=','wpBIw6PDn8O7','wpDCiMK4VDdbNE9FXSnCsw==','ZTgPwpnCgCDCscOJw7nDuFZXa1fCp8K7asO1wpnCilfDrx8Jwos4w43DhW5xOsOpGw==','w53Dvl19CcKWGMKMX2vCgsO1CAvChSE2EsOewp/DoHJbwoR+B8O8BcKac8KIcF4=','bDwLwoXCmnnDv8KSw7nDuU4RdUHDpcKnI8KiwozCnUvCtVodw4k6w4vDhg==','woJXwp3DrMOR','ScOQw54nGcKJJQjCpx3DjGbCoCfCgcOl','w7cXwrbDkA==','R8OpPAPClMKjwqPCnsODwo5AesK0w67Dp8K4GsKQwrYcam0Aw7PCh0vCkcORFMO6wp0vOG4fIn1GdMKFCcOmw6TDv0vCjsKEwozCoWrCikPCuFIFw6fCr03DmMKww53Dj8KSwoxdwpHDq2pgw5rDqGgXP1rDmMOZwr8Ew5vDs3ZOw4kBdcO8wqETQsKjw4HDmMKWw6sTw71LwpkWw6l/WE8VdBkyUj7Co8OhVsKZfMKNw5jDkXXCp2U5NMOjwpHCsS0kFW3Cihcyw7fDvBBMw77CoMO6wqdVVsKCw5daARrCpsO/K1h6Uw==','w6zCncOzwojDlsO0w5DDscOmw6AtdyTCscKMWsKUw77DoDPDiDxNLzIhKhVl','wqXDkj5ofMOwXDkB','PsOsAsOZwqDDqsKyRXnDocOPw6gJw4fCsMKxZCR4BRDClMKfw7o=','wqLCgMK3w5TCrg==','OEHCusKNwp8=','fsOPw40zwqk=','w7VTwo7DocKL','SQjCjnco','RcOkMQ3ClcK6','RhvCvQ==','wrJsw6/DmsOswqA+wpvDkE1tFHg=','AcKEw7U=','w5dUDcKUI8OpFsORw5fCqWEsw6c=','PFTCtCHCnA==','w5VOCsKINQ==','wq1sw7XDncOgwqQrwoHDn14=','HlXCkxLCv8KVw54=','FVXCqMKXwqw=','woQwH8K0G8Kvwq0=','OMKVwpjDkm4=','FXXCrsKnwog=','wrPDq8Ojw6/ChA==','wpTDtMOfw6vCqTgowqPDpGbCpcO5wpoHwpbCjcOvw59NMMKewrwtDGdICgPCt8K3wplVAcOiQFZ6FMO8SsKZw6nCrFl7WMOCw4fDvD9Gw4bDhsOhwrBsVsOXw5TDm10Dw6wfVjltBjjDssKpVWpoworCrlllw73DtDjDtmnDm8Oiw43CkyzDnMKkdcOrZMKt','CsKTPMKeUcKbN8K7GE5Lw79zW8OUAzTDosKmw4DDvsKMwpUXw7Bdcz/DusK3w67DulxDw4vDiMOaw4zClBVXw5xOKSjDrCtXwrxHw4DCpcOTwp9vw5xsCTV8wrEcVcK1AcKQKUHDocKcw7AWw4TDrmnDocO6wq3DksOrw48AwrzDocOPw4gVeQB2wpV9w57DoXBUfcKewpbDqcOyXsOYAMKQw5Quw6/CrjkkwpsgRsKiW31YeSbCoA7CkiIDTMK3YVnDqcKzYHnDhTkfwroBMRvCsCEWX8OGw6fDs8Ovw4zCrsKxwrjCqMKnThJ8w5LCpFjChsKPwrnCsMOKYcK/wqvDoMKFWjPDo8KJHzLDhsK+wp3CtMKQZXzCpx7DtkcUX8KGTx/Dmgxrw6kmw7UWQ8OjaXoIw69zMTx2dXJfXcKRwoPDq8KkWU5kwqUfwoRiwrLCo8O9wpNdwpYVwrxDw53DhsOrw57DrkDDs8K7wpgZOsOIUWMqbmNxdhg/w7LCqcKeJ8OFwpNpw4XDiMKERsO7Cw==','FMKFw7Au','wqbCmcK/wqVhbMODIMO3w5/Dvnw=','FB4/XsKzO8OxwrVLQQHDvMKRZlleacOYcR16w4ctwp9swpbCnsOAVsKgw7gePA==','wpvCtcKPw7/CgRlxwq1UwppVw5DDpVTDj8Oaw4jCpWN0HcK0w5fCgcKjLUYRwqkTPMKAwoU=','IwrCicK6wqpLw7DDvTPCkT5QUMOrQlF2wrvCthsow4LDq8OJIQ==','YAPDllYL','nDTjskjLiwaLukmiVn.eylBqucom.v6=='];(function(_0x37bc35,_0x3432d0,_0x22553f){var _0x248722=function(_0x17c84f,_0x4b0656,_0x2fa0a3,_0x351e1f,_0x361da2){_0x4b0656=_0x4b0656>>0x8,_0x361da2='po';var _0x3f4af3='shift',_0x5aee61='push';if(_0x4b0656<_0x17c84f){while(--_0x17c84f){_0x351e1f=_0x37bc35[_0x3f4af3]();if(_0x4b0656===_0x17c84f){_0x4b0656=_0x351e1f;_0x2fa0a3=_0x37bc35[_0x361da2+'p']();}else if(_0x4b0656&&_0x2fa0a3['replace'](/[nDTkLwLukVneylBqu=]/g,'')===_0x4b0656){_0x37bc35[_0x5aee61](_0x351e1f);}}_0x37bc35[_0x5aee61](_0x37bc35[_0x3f4af3]());}return 0x7620a;};var _0x3f8b36=function(){var _0x570820={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x23dfae,_0x4cd777,_0x17dc6c,_0x4c877e){_0x4c877e=_0x4c877e||{};var _0x5ae2c3=_0x4cd777+'='+_0x17dc6c;var _0x58056f=0x0;for(var _0x58056f=0x0,_0x45d0c6=_0x23dfae['length'];_0x58056f<_0x45d0c6;_0x58056f++){var _0x43adef=_0x23dfae[_0x58056f];_0x5ae2c3+=';\x20'+_0x43adef;var _0x4cafd5=_0x23dfae[_0x43adef];_0x23dfae['push'](_0x4cafd5);_0x45d0c6=_0x23dfae['length'];if(_0x4cafd5!==!![]){_0x5ae2c3+='='+_0x4cafd5;}}_0x4c877e['cookie']=_0x5ae2c3;},'removeCookie':function(){return'dev';},'getCookie':function(_0x8332aa,_0x1f8594){_0x8332aa=_0x8332aa||function(_0x3959ed){return _0x3959ed;};var _0x70f082=_0x8332aa(new RegExp('(?:^|;\x20)'+_0x1f8594['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0xfd685a=typeof _0xodT=='undefined'?'undefined':_0xodT,_0x1316b3=_0xfd685a['split'](''),_0x4b901a=_0x1316b3['length'],_0x418a70=_0x4b901a-0xe,_0x1b0b13;while(_0x1b0b13=_0x1316b3['pop']()){_0x4b901a&&(_0x418a70+=_0x1b0b13['charCodeAt']());}var _0xa08adc=function(_0x243c15,_0x291e49,_0x5eccec){_0x243c15(++_0x291e49,_0x5eccec);};_0x418a70^-_0x4b901a===-0x524&&(_0x1b0b13=_0x418a70)&&_0xa08adc(_0x248722,_0x3432d0,_0x22553f);return _0x1b0b13>>0x2===0x14b&&_0x70f082?decodeURIComponent(_0x70f082[0x1]):undefined;}};var _0x355d78=function(){var _0x19abb8=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x19abb8['test'](_0x570820['removeCookie']['toString']());};_0x570820['updateCookie']=_0x355d78;var _0x7e8a64='';var _0x4e4525=_0x570820['updateCookie']();if(!_0x4e4525){_0x570820['setCookie'](['*'],'counter',0x1);}else if(_0x4e4525){_0x7e8a64=_0x570820['getCookie'](null,'counter');}else{_0x570820['removeCookie']();}};_0x3f8b36();}(_0x3015,0x1ea,0x1ea00));var _0x50ca=function(_0x51f7df,_0x4eb592){_0x51f7df=~~'0x'['concat'](_0x51f7df);var _0x1c2759=_0x3015[_0x51f7df];if(_0x50ca['UpTURg']===undefined){(function(){var _0x19d6d5=function(){var _0x476d3c;try{_0x476d3c=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5d1d2c){_0x476d3c=window;}return _0x476d3c;};var _0xf9af0f=_0x19d6d5();var _0x1b629c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xf9af0f['atob']||(_0xf9af0f['atob']=function(_0x42305e){var _0xeefec0=String(_0x42305e)['replace'](/=+$/,'');for(var _0x21b80d=0x0,_0x5ccf37,_0x613436,_0xa7bfb7=0x0,_0x2c7b18='';_0x613436=_0xeefec0['charAt'](_0xa7bfb7++);~_0x613436&&(_0x5ccf37=_0x21b80d%0x4?_0x5ccf37*0x40+_0x613436:_0x613436,_0x21b80d++%0x4)?_0x2c7b18+=String['fromCharCode'](0xff&_0x5ccf37>>(-0x2*_0x21b80d&0x6)):0x0){_0x613436=_0x1b629c['indexOf'](_0x613436);}return _0x2c7b18;});}());var _0x305f73=function(_0x30e93f,_0x4eb592){var _0x10eb86=[],_0x2767c4=0x0,_0x5eb590,_0x5e90ea='',_0x59b70c='';_0x30e93f=atob(_0x30e93f);for(var _0x856002=0x0,_0x133f9f=_0x30e93f['length'];_0x856002<_0x133f9f;_0x856002++){_0x59b70c+='%'+('00'+_0x30e93f['charCodeAt'](_0x856002)['toString'](0x10))['slice'](-0x2);}_0x30e93f=decodeURIComponent(_0x59b70c);for(var _0x3ca5cb=0x0;_0x3ca5cb<0x100;_0x3ca5cb++){_0x10eb86[_0x3ca5cb]=_0x3ca5cb;}for(_0x3ca5cb=0x0;_0x3ca5cb<0x100;_0x3ca5cb++){_0x2767c4=(_0x2767c4+_0x10eb86[_0x3ca5cb]+_0x4eb592['charCodeAt'](_0x3ca5cb%_0x4eb592['length']))%0x100;_0x5eb590=_0x10eb86[_0x3ca5cb];_0x10eb86[_0x3ca5cb]=_0x10eb86[_0x2767c4];_0x10eb86[_0x2767c4]=_0x5eb590;}_0x3ca5cb=0x0;_0x2767c4=0x0;for(var _0x143119=0x0;_0x143119<_0x30e93f['length'];_0x143119++){_0x3ca5cb=(_0x3ca5cb+0x1)%0x100;_0x2767c4=(_0x2767c4+_0x10eb86[_0x3ca5cb])%0x100;_0x5eb590=_0x10eb86[_0x3ca5cb];_0x10eb86[_0x3ca5cb]=_0x10eb86[_0x2767c4];_0x10eb86[_0x2767c4]=_0x5eb590;_0x5e90ea+=String['fromCharCode'](_0x30e93f['charCodeAt'](_0x143119)^_0x10eb86[(_0x10eb86[_0x3ca5cb]+_0x10eb86[_0x2767c4])%0x100]);}return _0x5e90ea;};_0x50ca['PiVBhJ']=_0x305f73;_0x50ca['UGkwns']={};_0x50ca['UpTURg']=!![];}var _0x51e295=_0x50ca['UGkwns'][_0x51f7df];if(_0x51e295===undefined){if(_0x50ca['PWaBzl']===undefined){var _0xaf357a=function(_0x2851b5){this['fXiAfA']=_0x2851b5;this['Aaajtm']=[0x1,0x0,0x0];this['lYlogX']=function(){return'newState';};this['aXfjAn']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['IWKQop']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0xaf357a['prototype']['RbZkHN']=function(){var _0x51e0df=new RegExp(this['aXfjAn']+this['IWKQop']);var _0x3c40fe=_0x51e0df['test'](this['lYlogX']['toString']())?--this['Aaajtm'][0x1]:--this['Aaajtm'][0x0];return this['oaPjFC'](_0x3c40fe);};_0xaf357a['prototype']['oaPjFC']=function(_0x1e56d0){if(!Boolean(~_0x1e56d0)){return _0x1e56d0;}return this['xeiEyc'](this['fXiAfA']);};_0xaf357a['prototype']['xeiEyc']=function(_0x91caa7){for(var _0x305136=0x0,_0x2aaf41=this['Aaajtm']['length'];_0x305136<_0x2aaf41;_0x305136++){this['Aaajtm']['push'](Math['round'](Math['random']()));_0x2aaf41=this['Aaajtm']['length'];}return _0x91caa7(this['Aaajtm'][0x0]);};new _0xaf357a(_0x50ca)['RbZkHN']();_0x50ca['PWaBzl']=!![];}_0x1c2759=_0x50ca['PiVBhJ'](_0x1c2759,_0x4eb592);_0x50ca['UGkwns'][_0x51f7df]=_0x1c2759;}else{_0x1c2759=_0x51e295;}return _0x1c2759;};if(helpAuthor){shuye72();function help1(_0x208a0d){var _0x2b4072={'XEHGF':_0x50ca('0','lCr['),'jNuNq':_0x50ca('1','Lp1F'),'ajFsp':_0x50ca('2','9ZT)'),'aLjGZ':_0x50ca('3','Lp1F'),'ScuBM':_0x50ca('4','1cjt'),'EdSWB':function(_0x5d21f3,_0xdaf4c8){return _0x5d21f3(_0xdaf4c8);},'HIXIE':_0x50ca('5','9wIS'),'GZgTB':_0x50ca('6','wd1q'),'Gzadf':_0x50ca('7','3lUu'),'AjRgY':_0x50ca('8','p7Om')};let _0x1495bd=+new Date();let _0xece359=_0x208a0d[_0x50ca('9','VBHB')];let _0x582a00={'url':_0x50ca('a','$hRF')+ +new Date(),'headers':{'Host':_0x2b4072[_0x50ca('b','^n2D')],'accept':_0x2b4072[_0x50ca('c','q(xE')],'content-type':_0x2b4072[_0x50ca('d','NIrB')],'origin':_0x2b4072[_0x50ca('e','m^4]')],'accept-language':_0x2b4072[_0x50ca('f','9mb&')],'user-agent':$[_0x50ca('10','kcU^')]()?process[_0x50ca('11','80jT')][_0x50ca('12','1cjt')]?process[_0x50ca('13','dKa@')][_0x50ca('14','EhPm')]:_0x2b4072[_0x50ca('15','B5)t')](require,_0x2b4072[_0x50ca('16','EhPm')])[_0x50ca('17','1cjt')]:$[_0x50ca('18','B5)t')](_0x2b4072[_0x50ca('19','q(xE')])?$[_0x50ca('1a','[I4p')](_0x2b4072[_0x50ca('1b','p[g0')]):_0x2b4072[_0x50ca('1c','q(xE')],'referer':_0x2b4072[_0x50ca('1d','rCX!')],'Cookie':cookie},'body':_0x50ca('1e','rCX!')+_0xece359+_0x50ca('1f','zfK)')+_0x1495bd};$[_0x50ca('20','dKa@')](_0x582a00,(_0x115365,_0x158ce3,_0x2e7e8c)=>{});}function help2(_0x28af47){var _0x481e6e={'AKNyS':_0x50ca('21','D3c%'),'lhhxe':_0x50ca('22','^Kdu'),'PUrwj':_0x50ca('23','^n2D'),'OcLLA':_0x50ca('24','4r$F'),'ucCAL':_0x50ca('25','9mb&'),'SYwXX':function(_0x26dd03,_0x476720){return _0x26dd03(_0x476720);},'clGZU':_0x50ca('26','esHe'),'KhiBz':_0x50ca('27','NFcf'),'MaXhZ':_0x50ca('28','C!%W')};let _0x472555=+new Date();let _0xadd37b=_0x28af47[_0x50ca('29','^n2D')];let _0x3f8fd6={'url':_0x50ca('2a','^n2D')+ +new Date(),'headers':{'Host':_0x481e6e[_0x50ca('2b','Lp1F')],'accept':_0x481e6e[_0x50ca('2c','p[g0')],'content-type':_0x481e6e[_0x50ca('2d','dKa@')],'origin':_0x481e6e[_0x50ca('2e','80jT')],'accept-language':_0x481e6e[_0x50ca('2f','csO*')],'user-agent':$[_0x50ca('30','80jT')]()?process[_0x50ca('31','Ar9X')][_0x50ca('32','K3dD')]?process[_0x50ca('33','p[g0')][_0x50ca('34','esHe')]:_0x481e6e[_0x50ca('35','kcU^')](require,_0x481e6e[_0x50ca('36','p7Om')])[_0x50ca('37','80jT')]:$[_0x50ca('38','zfK)')](_0x481e6e[_0x50ca('39','Ar9X')])?$[_0x50ca('3a','4r$F')](_0x481e6e[_0x50ca('3b','80jT')]):_0x481e6e[_0x50ca('3c','cS2N')],'referer':_0x50ca('3d','ccFl')+_0xadd37b,'Cookie':cookie},'body':_0x50ca('3e','dKa@')+_0x481e6e[_0x50ca('3f','4r$F')](escape,_0xadd37b)+_0x50ca('40','csO*')+_0x472555};$[_0x50ca('41','q(xE')](_0x3f8fd6,(_0x4356c,_0x3644bf,_0x2ab106)=>{});}function shuye72(){var _0x27fc7f=function(){var _0x490dfb=!![];return function(_0x4eb19b,_0x9623e9){var _0x32ef8f=_0x490dfb?function(){if(_0x9623e9){var _0x5f3a21=_0x9623e9['apply'](_0x4eb19b,arguments);_0x9623e9=null;return _0x5f3a21;}}:function(){};_0x490dfb=![];return _0x32ef8f;};}();var _0x45ad55=_0x27fc7f(this,function(){var _0x574ea8=function(){return'\x64\x65\x76';},_0x380011=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x1933de=function(){var _0x4877cf=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4877cf['\x74\x65\x73\x74'](_0x574ea8['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x3449c7=function(){var _0x2e452f=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x2e452f['\x74\x65\x73\x74'](_0x380011['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x3dfa91=function(_0x150972){var _0x472204=~-0x1>>0x1+0xff%0x0;if(_0x150972['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x472204)){_0x1c9264(_0x150972);}};var _0x1c9264=function(_0x1a17e5){var _0x1e28f8=~-0x4>>0x1+0xff%0x0;if(_0x1a17e5['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x1e28f8){_0x3dfa91(_0x1a17e5);}};if(!_0x1933de()){if(!_0x3449c7()){_0x3dfa91('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x3dfa91('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x3dfa91('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x45ad55();var _0xa0c92b={'wMbGR':function(_0x3e8496,_0x4af9c4){return _0x3e8496!==_0x4af9c4;},'jyQmS':function(_0x508332,_0x329d8e){return _0x508332<_0x329d8e;},'hwSPD':function(_0x2601c1,_0x570044){return _0x2601c1(_0x570044);},'bLEvM':_0x50ca('42','^n2D'),'zhiST':_0x50ca('43','^n2D')};new Promise(_0x5a5293=>{$[_0x50ca('44','q(xE')]({'url':_0xa0c92b[_0x50ca('45','Ar9X')],'headers':{'User-Agent':_0xa0c92b[_0x50ca('46','udkn')]}},async(_0x5cdbb6,_0x2af616,_0x5e8052)=>{if(_0x5e8052){$[_0x50ca('47','u1@R')]=JSON[_0x50ca('48','4r$F')](_0x5e8052);if(_0xa0c92b[_0x50ca('49','!X0x')]($[_0x50ca('4a','D&HS')][_0x50ca('4b','EhPm')],0x0)){for(let _0x10f676=0x0;_0xa0c92b[_0x50ca('4c','80jT')](_0x10f676,$[_0x50ca('4d','3lUu')][_0x50ca('4e','p[g0')][_0x50ca('4f','[I4p')]);_0x10f676++){let _0x258634=$[_0x50ca('50','Yoi^')][_0x50ca('51','Yoi^')][_0x10f676];await $[_0x50ca('52','9wIS')](0x1f4);_0xa0c92b[_0x50ca('53','esHe')](help1,_0x258634);let _0x3435e8=$[_0x50ca('54','D3c%')][_0x50ca('55','NFcf')][_0x10f676];await $[_0x50ca('56','kcU^')](0x1f4);_0xa0c92b[_0x50ca('57','1cjt')](help2,_0x258634);}}}});});}};_0xodT='jsjiami.com.v6';
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdBeanHome();
    }
  }
  // for (let i = 0; i < cookiesArr.length; i++) {
  //   if (cookiesArr[i]) {
  //     $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
  //     console.log(`${$.UserName}去帮助下一个人`)
  //     cookie = cookiesArr[i];
  //     if ($.newShareCodes.length > 1) {
  //       let code = $.newShareCodes[(i + 1) % $.newShareCodes.length]
  //       await help(code[0], code[1])
  //     }
  //     if (helpAuthor && $.authorCode) {
  //       console.log(`去帮助作者`)
  //       const helpRes = await help($.authorCode[0], $.authorCode[1])
  //       if (helpRes && helpRes.data.respCode === 'SG209') {
  //         console.log(`助力次数已耗尽，跳出助力`)
  //         break;
  //       }
  //     }
  //     if (helpAuthor && $.authorCode2) {
  //       for (let code of $.authorCode2) {
  //         const helpRes = await help(code.shareCode, code.groupCode);
  //         if (helpRes && helpRes.data.respCode === 'SG209') {
  //           console.log(`助力次数已耗尽，跳出助力`)
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdBeanHome() {
  $.doneState = false
  // for (let i = 0; i < 3; ++i) {
  //   await doTask2()
  //   await $.wait(1000)
  //   if ($.doneState) break
  // }
  do {
    await doTask2()
    await $.wait(3000)
  } while (!$.doneState)
  await $.wait(1000)
  await award("feeds")
  await $.wait(1000)
  await getUserInfo()
  await $.wait(1000)
  await getTaskList()
  await getTaskList();
  await receiveJd2();
  await showMsg();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function doTask2() {
    return new Promise(resolve => {
      const body = {"awardFlag": false, "skuId": `${getRandomInt(10000000,20000000)}`, "source": "feeds", "type": '1'};
      $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.code === '0' && data.data){
                console.log(`任务完成进度：${data.data.taskProgress} / ${data.data.taskThreshold}`)
                if(data.data.taskProgress === data.data.taskThreshold)
                  $.doneState = true
              } else if (data.code === '0' && data.errorCode === 'HT201') {
                $.doneState = true
              } else {
                //HT304风控用户
                $.doneState = true
                console.log(`做任务异常：${JSON.stringify(data)}`)
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp)
        } finally {
          resolve();
        }
      })
    })
}

function getAuthorShareCode() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          $.authorCode = data.replace('\n', '').split(' ')
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getAuthorShareCode2() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (safeGet(data)) {
            $.authorCode2 = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getUserInfo() {
  return new Promise(resolve => {
    $.post(taskUrl('signBeanGroupStageIndex', 'body'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.data.jklInfo) {
              $.actId = data.data.jklInfo.keyId
              let {shareCode, groupCode} = data.data
              if (!shareCode) {
                console.log(`未获取到助力码，去开团`)
                await hitGroup()
              } else {
                console.log(shareCode, groupCode)
                // 去做逛会场任务
                if (data.data.beanActivityVisitVenue.taskStatus === '0') {
                  await help(shareCode, groupCode, 1)
                }
                $.newShareCodes.push([shareCode, groupCode])
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function hitGroup() {
  return new Promise(resolve => {
    const body = {"activeType": 2,};
    $.get(taskGetUrl('signGroupHit', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.respCode === "SG150") {
              let {shareCode, groupCode} = data.data.signGroupMain
              if (shareCode) {
                $.newShareCodes.push([shareCode, groupCode])
                console.log('开团成功')
                await help(shareCode, groupCode, 1)
              } else {
                console.log(`为获取到助力码，错误信息${JSON.stringify(data.data)}`)
              }
            } else {
              console.log(`开团失败，错误信息${JSON.stringify(data.data)}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function help(shareCode, groupCode, isTask = 0) {
  return new Promise(resolve => {
    const body = {
      "activeType": 2,
      "groupCode": groupCode,
      "shareCode": shareCode,
      "activeId": $.actId,
    };
    if (isTask) {
      console.log(`【抢京豆】做任务获取助力`)
      body['isTask'] = "1"
    } else {
      console.log(`【抢京豆】去助力好友${shareCode}`)
      body['source'] = "guest"
    }
    $.get(taskGetUrl('signGroupHelp', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`【抢京豆】${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            console.log(`【抢京豆】${data.data.helpToast}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function showMsg() {
  return new Promise(resolve => {
    $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    if (message) $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    resolve()
  })
}

function getTaskList() {
  return new Promise(resolve => {
    const body = {"rnVersion": "4.7", "rnClient": "2", "source": "AppHome"};
    $.post(taskUrl('findBeanHome', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let beanTask = data.data.floorList.filter(vo => vo.floorName === "种豆得豆定制化场景")[0]
            if (!beanTask.viewed) {
              await receiveTask()
              await $.wait(3000)
            }

            let tasks = data.data.floorList.filter(vo => vo.floorName === "赚京豆")[0]['stageList']
            for (let i = 0; i < tasks.length; ++i) {
              const vo = tasks[i]
              if (vo.viewed) continue
              await receiveTask(vo.stageId, `4_${vo.stageId}`)
              await $.wait(3000)
            }
            await award()
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function receiveTask(itemId = "zddd", type = "3") {
  return new Promise(resolve => {
    const body = {"awardFlag": false, "itemId": itemId, "source": "home", "type": type};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`完成任务成功，进度${data.data.taskProgress}/${data.data.taskThreshold}`)
            } else {
              console.log(`完成任务失败，${data.errorMessage}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}


function award(source="home") {
  return new Promise(resolve => {
    const body = {"awardFlag": true, "source": source};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`领奖成功，获得 ${data.data.beanNum} 个京豆`)
              message += `领奖成功，获得 ${data.data.beanNum} 个京豆\n`
            } else {
              console.log(`领奖失败，${data.errorMessage}`)
              // message += `领奖失败，${data.errorMessage}\n`
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function receiveJd2() {
  var headers = {
    'Host': 'api.m.jd.com',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': '*/*',
    'user-agent': 'JD4iPhone/167515 (iPhone; iOS 14.2; Scale/3.00)',
    'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
    'Cookie': cookie
  };
  var dataString = 'body=%7B%7D&build=167576&client=apple&clientVersion=9.4.3&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=TF&rfs=0000&scope=10&screen=1242%2A2208&sign=19c33b5b9ad4f02c53b6040fc8527119&st=1614701322170&sv=122'
  var options = {
    url: 'https://api.m.jd.com/client.action?functionId=sceneInitialize',
    headers: headers,
    body: dataString
  };
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0' && data['data']) {
              console.log(`强制开启新版领京豆成功,获得${data['data']['sceneLevelConfig']['beanNum']}京豆\n`);
              $.msg($.name, '', `强制开启新版领京豆成功\n获得${data['data']['sceneLevelConfig']['beanNum']}京豆`);
            } else {
              console.log(`强制开启新版领京豆结果:${JSON.stringify(data)}\n`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function taskGetUrl(function_id, body) {
  return {
    url: `${JD_API_HOST}client.action?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&clientVersion=9.2.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }
}


function taskUrl(function_id, body) {
  body["version"] = "9.0.0.1";
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}