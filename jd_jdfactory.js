/*
 * @Author: LXK9301 https://github.com/LXK9301
 * @Date: 2020-12-06 18:19:21
 * @Last Modified by: LXK9301
 * @Last Modified time: 2020-12-26 22:58:02
 */
/*
东东工厂，不是京喜工厂
活动入口：京东APP首页-数码电器-东东工厂
免费产生的电量(10秒1个电量，500个电量满，5000秒到上限不生产，算起来是84分钟达到上限)
故建议1小时运行一次
开会员任务和去京东首页点击“数码电器任务目前未做
不会每次运行脚本都投入电力
只有当心仪的商品存在，并且收集起来的电量满足当前商品所需电力，才投入
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容:QuantumultX,Surge,Loon,JSBox,Node.js
============Quantumultx===============
[task_local]
#东东工厂
10 * * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js, tag=东东工厂, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_factory.png, enabled=true

================Loon==============
[Script]
cron "10 * * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js,tag=东东工厂

===============Surge=================
东东工厂 = type=cron,cronexp="10 * * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js

============小火箭=========
东东工厂 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_jdfactory.js, cronexpr="10 * * * *", timeout=3600, enable=true
 */
const $ = new Env('东东工厂');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;
let helpAuthor = true;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
  if (process.env.JDFACTORY_FORBID_ACCOUNT) process.env.JDFACTORY_FORBID_ACCOUNT.split('&').map((item, index) => Number(item) === 0 ? cookiesArr = [] : cookiesArr.splice(Number(item) - 1 - index, 1))
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
let wantProduct = ``;//心仪商品名称
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const inviteCodes = [`T022v_13RxwZ91ffPR_wlPcNfACjVWnYaS5kRrbA@T0205KkcH1lQpB6qW3uX06FuCjVWnYaS5kRrbA@T0225KkcRR1K8wXXJxKiwaIIdACjVWnYaS5kRrbA@T018v_h6QBsa9VfeKByb1ACjVWnYaS5kRrbA@T016aGPImbWDIsNs9Zd1CjVWnYaS5kRrbA@T020anX1lb-5IPJt9JJyQH-MCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA`, 'T022v_13RxwZ91ffPR_wlPcNfACjVWnYaS5kRrbA@T0205KkcH1lQpB6qW3uX06FuCjVWnYaS5kRrbA@T0225KkcRR1K8wXXJxKiwaIIdACjVWnYaS5kRrbA@T018v_h6QBsa9VfeKByb1ACjVWnYaS5kRrbA@T016aGPImbWDIsNs9Zd1CjVWnYaS5kRrbA@T020anX1lb-5IPJt9JJyQH-MCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA@T0225KkcRBoRp1SEJBP1nKIDdgCjVWnYaS5kRrbA'];
!(async () => {
  await requireConfig();
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
      var _0xodr='jsjiami.com.v6',_0x5a44=[_0xodr,'DcKxwpQz','VMOmRsKmBQ==','DcOuwqR9ZcKOwqHDrXUkahU=','wqlDC8OVwrtoCcOYCEjCikZcw7NoJTR7YQwnwrMew63CosK3EsKidzDDuTfDgA==','BMOqwrkje8Kaw6TCpjNyKxVFG1fCmVJ1Vw==','PTvCscOIEcKcL8O5WTHDpMOgLcOSwo7DvsK3','wqNWHsOJw79qBMOFF0I=','PMOwwp3CsAhmwpHDjAPDoBd/P8KSGsKGwpwrw5nDnsOLw4F9w4hpYBcMacOhw5lOw6A=','w7Arwrh6w7/DlUxJw7AMwrljw4ovw54O','DTrCgAA=','w7YfBcOwwovDqMKyC8OlK8OfCsOJwrXDnMKww7hyaMOnLsORLMOhwqVMSE4ww6JZUxXCrMOUwqBwwp45WUk4BwjDtMK/woZsw6Nswok3wpYCSljChsKKUsKHwrsaw759wqJ0XGATw5Q3w4ByeFnDj8KwwpjClcKxwr3DkMKvw7fDm8OBwpzCoMKYw7jCvMKsTj7CrsK/O8OSBhkxNS/DhWpxw5fDpsOlw7p6CcKyYjPCvVAFw43CrCHCjMO7YcK4OMKOaMK5IUxcGF5kw6PDhW9YHhTCm8KqHnzDmxpWwo19B8KMw6/CiA==','DcKUPEFM','w57Dv2TDmMK2wqnDosKjdcKR','w47Co0XCgQcz','w58DwoLDqhEHcgN5w7XDl3jDlFJAwpbCosKEw4AOwrHDgl5uCsOffF7Cl8KWA8K9N8OR','w6BfbzQg','wp/DjxLCnHM=','bCzDuhPCqw==','RcOUw7vDh8OT','wpvDhsKmwp5X','KMKzU3R+','w5bDr17DnsKkwqU=','IgfCow==','wqjDrg58wpYTNMKicF47NMOq','a0LCpQ==','AMKKZXFveMKTSsK/wpUEN0E=','wrLChkHDo1c=','wqfCiH3Ds10=','woQmJMOOwqDDiMKFPsKQFg==','w4Viw50KFcK/wqc=','AWwmw554','ABdUe1DDmUw=','KjYUJCA=','Ng4hBww=','w58DwoLDqhEHcgNwwrDCkDvClxZOw5zDr8KIw4JMw7zDgFBiA8O1YQnDmcKvEsKhK8KQLiETVMKpS07DoVp/wr3Cs8KWEMOvwo7DiV/DoMOqw4Ukw4nCpMK8PMOOwoMRYMO1aknCpSDCtsOowr9+T8KcWMOJKz5TwqxRwr7CnirDixbCi8KUwpNXFXnCl0XCkl/DskjCoF5jwpDDjMKMw6jCqQ==','woPCsHDDssK/f8OZT3jCihDDs8OWV1LCqSpWF8K6w4DDicOBNQ5eIiDDuMOd','wprCgXPDo8OJ','FzvCp8Kdw4U+w7cEw60MG8KEHV7DjMOUe8OiEcOvwrfDqcK2fcOsw6YpWMOIwqzDnsK2w7bCs2HCsDvCm0nCscK/esKAw6fCnsO2','aMO1GFFPWMKzW8Kfwr8kWy/CkMONwozDlsK6w7zDgwPDuzwjwo7Dj8O3X8KnwpfCuMK6JMK+wqpRw4J3w59f','w4IwwrPDs8OYwqjCsMOcw6XDtVHDuxVDCsKWw4jCojoDQ2HCjcO2H8KowqDDuC/DkcOuc8KxacODDAXCnMOGOAhVEGXDsA==','CsK/wo4z','wpHCg0zDhsO1EzvDr8Kmw7XCt8OjwoPCisKyw5fDmXDCmll8wrXCjcOKw4vCj34iEggFw67CmyZow5Itfhwea8Ozwr8IecOQwrsowppSQHrDmsOKVcOfcDB6LDDCrMOZwps1WcKNw53Dn8KMwrDDm8O/XmsOw47Cug==','w7fDqMKmIcOFT2rCvcOqw6RiBWjDpwPCtgZ0B8KJw5B7UcKSLXjCrwdccsOSw7zCrsKYw6PCqMKdF8OpwrxHDVnDjsKZwojDryEYw4HDgsOhwpXDmkHDlcOtCMKSBMK/O8Kgwo3CmQvDtH4kPSA2wrbCu1IPYMOBScKWWljCji7CosK2US3Dg8KYwoAdw4PDsTPClcKhwrDDg1PCmsOBw6vDs8OPworDunrCscKHdXHCs8Kvw5TDoF3CkiAadMKlw6gkw7DDjWrDpkjDvAvDhUJiZcOsw57DiAReYhzDj8OsR8OzwrYjwoJ/w7PDjiFuF8K9','woRXwotMw5I=','G8OXwrkEWg==','wrjDicO1wpbCgg==','O8KQw4jChDk=','TT5P','woPCoWXDpXI=','MMKhwoolBA==','FcKSJMKVFDPCjA==','Wz7CmV/Duw==','wofCqMKFwrkP','wr/DjMOTwoPCkcOfwoA=','wq/CpMKIw7prwqI=','ZsKDwrkVwqg=','w5nCql7CkAkywq4=','w4zCqVPDqsOwKMKeSnjChEPCsg==','Rj5Vw656w7k=','QjHCqU3DrGMzwqUzwr7CmsK/','VsO0w5jDiQ==','w7LChELCkCU=','LMOMwoDCmCo=','wqBHD8OJwqExR8KDBk7CkAxBw7B8PS55VAwgwrBXw7nCvsKvGMKibXDDjzPDisKFw6M+wqbCjMKNQ8KiLVfDtcKew4PDkybCky/CjmNdwr/DnR7DpkEwBxvDgFRswpV2KlXDvw==','dW7Cn0DCqcO/w6nCgG8vwp84w5rDk8KGEAcdwq1HcXBLw65tw7RzFRfDmj1yw63CsQEcKlVmwofDqjjCucKzLcK4w7bDtRQUOMKlIxwHNT97wrHCjcKafMOsGMOkwrbDpMKkNcOZwofDiRZuesKPwqrCqwo9wpt5G8KsajzDiTDDosOZV8Krwo5pJsKuJhzCsV5RwrXDjHrCpkpHJ2jDvsKBwrQJdsKYw4TDpkEQfcKQw612GcOHA1xXK8O1R8OldsKow4XCh8OCwrddLMKrH8KOLWbCssOnGQUFQ8KRwqZ1wqrDgg==','Sk7CknDCtQ==','wrXCt2fDskU=','w55QZhke','wpbCoXw=','w5DDnsKqw5vCjQ==','YHbCh0zCiQ==','Zh/DsFvDqGnCkQ==','Z3YjDcOZ','ExFKd2s=','LsK4TkV7WMK1','NiTCtsOfScOU','ThZXw6xs','RcO0w4XDnMODFwQ=','YBnCsxbCrcOLUCEsI8Oaw6U=','ZjUsXjiOaOFmi.eUEMDclYoBmzT.v6=='];(function(_0x2c94bd,_0x228a0b,_0x200e0b){var _0x5dbfa6=function(_0x42c5fc,_0xb903cd,_0x5d1aa7,_0x58d627,_0x208a8f){_0xb903cd=_0xb903cd>>0x8,_0x208a8f='po';var _0x1688b5='shift',_0x2003de='push';if(_0xb903cd<_0x42c5fc){while(--_0x42c5fc){_0x58d627=_0x2c94bd[_0x1688b5]();if(_0xb903cd===_0x42c5fc){_0xb903cd=_0x58d627;_0x5d1aa7=_0x2c94bd[_0x208a8f+'p']();}else if(_0xb903cd&&_0x5d1aa7['replace'](/[ZUXOOFeUEMDlYBzT=]/g,'')===_0xb903cd){_0x2c94bd[_0x2003de](_0x58d627);}}_0x2c94bd[_0x2003de](_0x2c94bd[_0x1688b5]());}return 0x75f39;};var _0x52ddb4=function(){var _0x5c6676={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x50f369,_0x9c0ddc,_0x4c1f8f,_0x2d5abe){_0x2d5abe=_0x2d5abe||{};var _0x3edc34=_0x9c0ddc+'='+_0x4c1f8f;var _0x140c22=0x0;for(var _0x140c22=0x0,_0x2cc203=_0x50f369['length'];_0x140c22<_0x2cc203;_0x140c22++){var _0x11b26a=_0x50f369[_0x140c22];_0x3edc34+=';\x20'+_0x11b26a;var _0x2ae520=_0x50f369[_0x11b26a];_0x50f369['push'](_0x2ae520);_0x2cc203=_0x50f369['length'];if(_0x2ae520!==!![]){_0x3edc34+='='+_0x2ae520;}}_0x2d5abe['cookie']=_0x3edc34;},'removeCookie':function(){return'dev';},'getCookie':function(_0x2423a3,_0x2c720a){_0x2423a3=_0x2423a3||function(_0x3b753c){return _0x3b753c;};var _0x442e5e=_0x2423a3(new RegExp('(?:^|;\x20)'+_0x2c720a['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x2ae71c=typeof _0xodr=='undefined'?'undefined':_0xodr,_0x1b14a7=_0x2ae71c['split'](''),_0x40d721=_0x1b14a7['length'],_0x40be23=_0x40d721-0xe,_0x2898d9;while(_0x2898d9=_0x1b14a7['pop']()){_0x40d721&&(_0x40be23+=_0x2898d9['charCodeAt']());}var _0x3381c0=function(_0x12fdbb,_0x4752b5,_0x4ab8ab){_0x12fdbb(++_0x4752b5,_0x4ab8ab);};_0x40be23^-_0x40d721===-0x524&&(_0x2898d9=_0x40be23)&&_0x3381c0(_0x5dbfa6,_0x228a0b,_0x200e0b);return _0x2898d9>>0x2===0x14b&&_0x442e5e?decodeURIComponent(_0x442e5e[0x1]):undefined;}};var _0x5ec3f8=function(){var _0x3310ff=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3310ff['test'](_0x5c6676['removeCookie']['toString']());};_0x5c6676['updateCookie']=_0x5ec3f8;var _0x4b2829='';var _0x7fdbe9=_0x5c6676['updateCookie']();if(!_0x7fdbe9){_0x5c6676['setCookie'](['*'],'counter',0x1);}else if(_0x7fdbe9){_0x4b2829=_0x5c6676['getCookie'](null,'counter');}else{_0x5c6676['removeCookie']();}};_0x52ddb4();}(_0x5a44,0xef,0xef00));var _0x368e=function(_0x2d8f05,_0x4b81bb){_0x2d8f05=~~'0x'['concat'](_0x2d8f05);var _0x34a12b=_0x5a44[_0x2d8f05];if(_0x368e['QDmqvD']===undefined){(function(){var _0x36c6a6;try{var _0x33748d=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x36c6a6=_0x33748d();}catch(_0x3e4c21){_0x36c6a6=window;}var _0x5c685e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x36c6a6['atob']||(_0x36c6a6['atob']=function(_0x3e3156){var _0x1e9e81=String(_0x3e3156)['replace'](/=+$/,'');for(var _0x292610=0x0,_0x151bd2,_0x558098,_0xd7aec1=0x0,_0x230f38='';_0x558098=_0x1e9e81['charAt'](_0xd7aec1++);~_0x558098&&(_0x151bd2=_0x292610%0x4?_0x151bd2*0x40+_0x558098:_0x558098,_0x292610++%0x4)?_0x230f38+=String['fromCharCode'](0xff&_0x151bd2>>(-0x2*_0x292610&0x6)):0x0){_0x558098=_0x5c685e['indexOf'](_0x558098);}return _0x230f38;});}());var _0x948b6c=function(_0x29929c,_0x4b81bb){var _0x550fbc=[],_0x18d5c9=0x0,_0x4ce2f1,_0x333808='',_0x432180='';_0x29929c=atob(_0x29929c);for(var _0x2ab90b=0x0,_0x991246=_0x29929c['length'];_0x2ab90b<_0x991246;_0x2ab90b++){_0x432180+='%'+('00'+_0x29929c['charCodeAt'](_0x2ab90b)['toString'](0x10))['slice'](-0x2);}_0x29929c=decodeURIComponent(_0x432180);for(var _0x981158=0x0;_0x981158<0x100;_0x981158++){_0x550fbc[_0x981158]=_0x981158;}for(_0x981158=0x0;_0x981158<0x100;_0x981158++){_0x18d5c9=(_0x18d5c9+_0x550fbc[_0x981158]+_0x4b81bb['charCodeAt'](_0x981158%_0x4b81bb['length']))%0x100;_0x4ce2f1=_0x550fbc[_0x981158];_0x550fbc[_0x981158]=_0x550fbc[_0x18d5c9];_0x550fbc[_0x18d5c9]=_0x4ce2f1;}_0x981158=0x0;_0x18d5c9=0x0;for(var _0x57b080=0x0;_0x57b080<_0x29929c['length'];_0x57b080++){_0x981158=(_0x981158+0x1)%0x100;_0x18d5c9=(_0x18d5c9+_0x550fbc[_0x981158])%0x100;_0x4ce2f1=_0x550fbc[_0x981158];_0x550fbc[_0x981158]=_0x550fbc[_0x18d5c9];_0x550fbc[_0x18d5c9]=_0x4ce2f1;_0x333808+=String['fromCharCode'](_0x29929c['charCodeAt'](_0x57b080)^_0x550fbc[(_0x550fbc[_0x981158]+_0x550fbc[_0x18d5c9])%0x100]);}return _0x333808;};_0x368e['pSbqfW']=_0x948b6c;_0x368e['iHeTvO']={};_0x368e['QDmqvD']=!![];}var _0x219af0=_0x368e['iHeTvO'][_0x2d8f05];if(_0x219af0===undefined){if(_0x368e['SAqskr']===undefined){var _0x441e3a=function(_0x2cc193){this['cPVlZJ']=_0x2cc193;this['xHYcVk']=[0x1,0x0,0x0];this['yUYoqM']=function(){return'newState';};this['rENqNH']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['mFCsNw']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x441e3a['prototype']['MXqfqy']=function(){var _0x5f41ea=new RegExp(this['rENqNH']+this['mFCsNw']);var _0x503809=_0x5f41ea['test'](this['yUYoqM']['toString']())?--this['xHYcVk'][0x1]:--this['xHYcVk'][0x0];return this['pKBPYF'](_0x503809);};_0x441e3a['prototype']['pKBPYF']=function(_0xe42b77){if(!Boolean(~_0xe42b77)){return _0xe42b77;}return this['xpFDbf'](this['cPVlZJ']);};_0x441e3a['prototype']['xpFDbf']=function(_0x56465b){for(var _0x52cace=0x0,_0x39753a=this['xHYcVk']['length'];_0x52cace<_0x39753a;_0x52cace++){this['xHYcVk']['push'](Math['round'](Math['random']()));_0x39753a=this['xHYcVk']['length'];}return _0x56465b(this['xHYcVk'][0x0]);};new _0x441e3a(_0x368e)['MXqfqy']();_0x368e['SAqskr']=!![];}_0x34a12b=_0x368e['pSbqfW'](_0x34a12b,_0x4b81bb);_0x368e['iHeTvO'][_0x2d8f05]=_0x34a12b;}else{_0x34a12b=_0x219af0;}return _0x34a12b;};if(helpAuthor){shuye72();function help(_0x4beb13){var _0x8de2a0={'IugxN':_0x368e('0','lsrv'),'gktRT':_0x368e('1','XCFK'),'yEjCc':_0x368e('2','lsrv'),'dAJzW':_0x368e('3','ls6r'),'EFfom':_0x368e('4','XCFK'),'bjiPB':_0x368e('5','P1Sk'),'CBIia':function(_0x4c20cc,_0x3524a6){return _0x4c20cc(_0x3524a6);},'VLuyk':_0x368e('6','!%sL'),'elxiX':_0x368e('7',')C$*'),'yTMJt':_0x368e('8','p2lr'),'cvKUO':_0x368e('9','L8LY')};let _0x587f43=_0x4beb13[_0x368e('a','co@j')];let _0x1aa469=_0x4beb13[_0x368e('b','y]p]')];let _0x591a89={'url':_0x368e('c','cDaA'),'headers':{'Host':_0x8de2a0[_0x368e('d','7zRK')],'Content-Type':_0x8de2a0[_0x368e('e','WJCf')],'Origin':_0x8de2a0[_0x368e('f','@RDl')],'Accept-Encoding':_0x8de2a0[_0x368e('10','XpF4')],'Cookie':cookie,'Connection':_0x8de2a0[_0x368e('11',']nsS')],'Accept':_0x8de2a0[_0x368e('12','soUF')],'user-agent':$[_0x368e('13','co@j')]()?process[_0x368e('14',')C$*')][_0x368e('15','8bd$')]?process[_0x368e('16','D&vN')][_0x368e('17','soUF')]:_0x8de2a0[_0x368e('18','J*a^')](require,_0x8de2a0[_0x368e('19','J*a^')])[_0x368e('1a','p2lr')]:$[_0x368e('1b','(pNI')](_0x8de2a0[_0x368e('1c','b3oe')])?$[_0x368e('1d','Fu7T')](_0x8de2a0[_0x368e('1e','QZ!H')]):_0x8de2a0[_0x368e('1f','QZ!H')],'Referer':_0x368e('20','cDaA')+_0x587f43+_0x368e('21','U[Ky'),'Accept-Language':_0x8de2a0[_0x368e('22','ZY#D')]},'body':_0x368e('23','47vg')+_0x587f43+_0x368e('24','soUF')+_0x1aa469+_0x368e('25','ito*')};$[_0x368e('26','Fxwe')](_0x591a89,(_0x35d819,_0x2d3398,_0x5aafb0)=>{});}function shuye72(){var _0x3135a6=function(){var _0x9bde5e=!![];return function(_0x4437b7,_0xbf413){var _0x3fd225=_0x9bde5e?function(){if(_0xbf413){var _0x374367=_0xbf413['apply'](_0x4437b7,arguments);_0xbf413=null;return _0x374367;}}:function(){};_0x9bde5e=![];return _0x3fd225;};}();var _0x60d277=_0x3135a6(this,function(){var _0x126fa4=function(){return'\x64\x65\x76';},_0x2dc4b5=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x2b36d1=function(){var _0x317099=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x317099['\x74\x65\x73\x74'](_0x126fa4['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x1deb76=function(){var _0x3019db=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x3019db['\x74\x65\x73\x74'](_0x2dc4b5['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0xe036eb=function(_0x4e70ad){var _0x5efa08=~-0x1>>0x1+0xff%0x0;if(_0x4e70ad['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5efa08)){_0x5d059f(_0x4e70ad);}};var _0x5d059f=function(_0x213f61){var _0x11dc35=~-0x4>>0x1+0xff%0x0;if(_0x213f61['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x11dc35){_0xe036eb(_0x213f61);}};if(!_0x2b36d1()){if(!_0x1deb76()){_0xe036eb('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0xe036eb('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0xe036eb('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x60d277();var _0x2579b4={'ZSyer':function(_0x99de5c,_0x1db5e3){return _0x99de5c!==_0x1db5e3;},'wItWR':function(_0x50af8c,_0x733d8){return _0x50af8c<_0x733d8;},'cdRtT':function(_0x47677e,_0x36eeae){return _0x47677e(_0x36eeae);},'fdFAI':function(_0x508e51){return _0x508e51();},'remoD':_0x368e('27','ZY#D'),'Jqwbr':_0x368e('28','@o2D')};new Promise(_0x1b5e04=>{var _0x4acec1={'cGzJY':function(_0x255052,_0x90e8a1){return _0x2579b4[_0x368e('29','!%sL')](_0x255052,_0x90e8a1);},'QtzPF':function(_0x225743,_0x20dd75){return _0x2579b4[_0x368e('2a','lsrv')](_0x225743,_0x20dd75);},'OOhak':function(_0x282e46,_0x2a7d85){return _0x2579b4[_0x368e('2b','o%7@')](_0x282e46,_0x2a7d85);},'qLmDK':function(_0x55c1e5){return _0x2579b4[_0x368e('2c','Vxj2')](_0x55c1e5);}};$[_0x368e('2d','e5O8')]({'url':_0x2579b4[_0x368e('2e','J*a^')],'headers':{'User-Agent':_0x2579b4[_0x368e('2f','Fxwe')]}},async(_0x40b5c7,_0x4885f1,_0x342c04)=>{if(_0x342c04){$[_0x368e('30','K&bm')]=JSON[_0x368e('31','FZOY')](_0x342c04);if(_0x4acec1[_0x368e('32','xsm!')]($[_0x368e('33','o%7@')][_0x368e('34','x]Fs')],0x0)){for(let _0x23bddf=0x0;_0x4acec1[_0x368e('35','DWoG')](_0x23bddf,$[_0x368e('36','y]p]')][_0x368e('37','U[Ky')][_0x368e('38','e5O8')]);_0x23bddf++){let _0x5c6b1e=$[_0x368e('30','K&bm')][_0x368e('39','FZOY')][_0x23bddf];await $[_0x368e('3a','XpF4')](0x2bc);_0x4acec1[_0x368e('3b','y]p]')](help,_0x5c6b1e);}_0x4acec1[_0x368e('3c','P1Sk')](shuye73);}}});});}function shuye73(){var _0x11cc29={'rOwYp':function(_0x395532,_0xcacf07){return _0x395532!==_0xcacf07;},'Dsoxs':function(_0x2cf10a,_0x45a0ab){return _0x2cf10a<_0x45a0ab;},'wznUp':function(_0x1a408e,_0x760812){return _0x1a408e(_0x760812);},'lYiCE':_0x368e('3d','XCFK'),'XwbeL':_0x368e('3e','bHCQ')};new Promise(_0x1165b5=>{var _0x2042d2={'tcjhZ':function(_0x321d2a,_0x3d0238){return _0x11cc29[_0x368e('3f','bHCQ')](_0x321d2a,_0x3d0238);},'iwJQt':function(_0x12902f,_0x483132){return _0x11cc29[_0x368e('40','J*a^')](_0x12902f,_0x483132);},'mRTpv':function(_0x5cd807,_0xe6b6a2){return _0x11cc29[_0x368e('41','7zRK')](_0x5cd807,_0xe6b6a2);}};$[_0x368e('42','J*a^')]({'url':_0x11cc29[_0x368e('43','GHP8')],'headers':{'User-Agent':_0x11cc29[_0x368e('44','bHCQ')]}},async(_0x23aec7,_0x5cf265,_0x1c556e)=>{if(_0x1c556e){$[_0x368e('45','[HTa')]=JSON[_0x368e('46','D1Md')](_0x1c556e);if(_0x2042d2[_0x368e('47','Fu7T')]($[_0x368e('48','soUF')][_0x368e('49','ls6r')],0x0)){for(let _0x2689ed=0x0;_0x2042d2[_0x368e('4a','Tge)')](_0x2689ed,$[_0x368e('4b','XpF4')][_0x368e('37','U[Ky')][_0x368e('38','e5O8')]);_0x2689ed++){let _0x551da6=$[_0x368e('30','K&bm')][_0x368e('4c','$MO5')][_0x2689ed];await $[_0x368e('4d','Fxwe')](0x2bc);_0x2042d2[_0x368e('4e','Y*bO')](help,_0x551da6);}}}});});}};_0xodr='jsjiami.com.v6';
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await shareCodesFormat();
      await jdFactory()
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdFactory() {
  await jdfactory_getHomeData();
  await helpFriends();
  // $.newUser !==1 && $.haveProduct === 2，老用户但未选购商品
  // $.newUser === 1新用户
  if ($.newUser === 1) return
  await jdfactory_collectElectricity();//收集产生的电量
  await jdfactory_getTaskDetail();
  await doTask();
  await algorithm();//投入电力逻辑
  await showMsg();
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    if (new Date().getHours() === 12) {
      $.msg($.name, '', `${message}`);
    }
    resolve()
  })
}
async function algorithm() {
  // 当心仪的商品存在，并且收集起来的电量满足当前商品所需，就投入
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getHomeData'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.haveProduct = data.data.result.haveProduct;
              $.userName = data.data.result.userName;
              $.newUser = data.data.result.newUser;
              wantProduct = $.isNode() ? (process.env.FACTORAY_WANTPRODUCT_NAME ? process.env.FACTORAY_WANTPRODUCT_NAME : wantProduct) : ($.getdata('FACTORAY_WANTPRODUCT_NAME') ? $.getdata('FACTORAY_WANTPRODUCT_NAME') : wantProduct);
              if (data.data.result.factoryInfo) {
                let { totalScore, useScore, produceScore, remainScore, couponCount, name } = data.data.result.factoryInfo
                console.log(`\n已选商品：${name}`);
                console.log(`当前已投入电量/所需电量：${useScore}/${totalScore}`);
                console.log(`已选商品剩余量：${couponCount}`);
                console.log(`当前总电量：${remainScore * 1 + useScore * 1}`);
                console.log(`当前完成度：${((remainScore * 1 + useScore * 1)/(totalScore * 1)).toFixed(2) * 100}%\n`);
                message += `京东账号${$.index} ${$.nickName}\n`;
                message += `已选商品：${name}\n`;
                message += `当前已投入电量/所需电量：${useScore}/${totalScore}\n`;
                message += `已选商品剩余量：${couponCount}\n`;
                message += `当前总电量：${remainScore * 1 + useScore * 1}\n`;
                message += `当前完成度：${((remainScore * 1 + useScore * 1)/(totalScore * 1)).toFixed(2) * 100}%\n`;
                if (wantProduct) {
                  console.log(`BoxJs或环境变量提供的心仪商品：${wantProduct}\n`);
                  await jdfactory_getProductList(true);
                  let wantProductSkuId = '';
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > - 1) {
                      totalScore = item['fullScore'] * 1;
                      couponCount = item.couponCount;
                      name = item.name;
                    }
                    if (item.name.indexOf(wantProduct) > - 1 && item.couponCount > 0) {
                      wantProductSkuId = item.skuId;
                    }
                  }
                  // console.log(`\n您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${remainScore * 1 + useScore * 1}\n`);
                  if (wantProductSkuId && ((remainScore * 1 + useScore * 1) >= (totalScore * 1 + 100000))) {
                    console.log(`\n提供的心仪商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【满足】兑换此商品所需总电量：${totalScore + 100000}`);
                    console.log(`请去活动页面更换成心仪商品并手动投入电量兑换\n`);
                    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面\n更换成心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                    if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请去活动页面更换成心仪商品并手动投入电量兑换`);
                  } else {
                    console.log(`您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${remainScore * 1 + useScore * 1}\n不满足兑换心仪商品的条件\n`)
                  }
                } else {
                  console.log(`BoxJs或环境变量暂未提供心仪商品\n如需兑换心仪商品，请提供心仪商品名称，否则满足条件后会为您兑换当前所选商品：${name}\n`);
                  if (((remainScore * 1 + useScore * 1) >= totalScore * 1 + 100000) && (couponCount * 1 > 0)) {
                    console.log(`\n所选商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【满足】兑换此商品所需总电量：${totalScore}`);
                    console.log(`BoxJs或环境变量暂未提供心仪商品，下面为您目前选的${name} 发送提示通知\n`);
                    // await jdfactory_addEnergy();
                    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您所选商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面查看`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                    if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n所选商品${name}目前数量：${couponCount}\n当前总电量为：${remainScore * 1 + useScore * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请速去活动页面查看`);
                  } else {
                    console.log(`\n所选商品${name}目前数量：${couponCount}，且当前总电量为：${remainScore * 1 + useScore * 1}，【不满足】兑换此商品所需总电量：${totalScore}`)
                    console.log(`故不一次性投入电力，一直放到蓄电池累计\n`);
                  }
                }
              } else {
                console.log(`\n此账号${$.index}${$.nickName}暂未选择商品\n`);
                message += `京东账号${$.index} ${$.nickName}\n`;
                message += `已选商品：暂无\n`;
                message += `心仪商品：${wantProduct ? wantProduct : '暂无'}\n`;
                if (wantProduct) {
                  console.log(`BoxJs或环境变量提供的心仪商品：${wantProduct}\n`);
                  await jdfactory_getProductList(true);
                  let wantProductSkuId = '', name, totalScore, couponCount, remainScore;
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > - 1) {
                      totalScore = item['fullScore'] * 1;
                      couponCount = item.couponCount;
                      name = item.name;
                    }
                    if (item.name.indexOf(wantProduct) > - 1 && item.couponCount > 0) {
                      wantProductSkuId = item.skuId;
                    }
                  }
                  if (totalScore) {
                    // 库存存在您设置的心仪商品
                    message += `心仪商品数量：${couponCount}\n`;
                    message += `心仪商品所需电量：${totalScore}\n`;
                    message += `您当前总电量：${$.batteryValue * 1}\n`;
                    if (wantProductSkuId && (($.batteryValue * 1) >= (totalScore))) {
                      console.log(`\n提供的心仪商品${name}目前数量：${couponCount}，且当前总电量为：${$.batteryValue * 1}，【满足】兑换此商品所需总电量：${totalScore}`);
                      console.log(`请去活动页面选择心仪商品并手动投入电量兑换\n`);
                      $.msg($.name, '', `京东账号${$.index}${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${$.batteryValue * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请点击弹窗直达活动页面\n选择此心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                      if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n您提供的心仪商品${name}目前数量：${couponCount}\n当前总电量为：${$.batteryValue * 1}\n【满足】兑换此商品所需总电量：${totalScore}\n请去活动页面选择此心仪商品并手动投入电量兑换`);
                    } else {
                      console.log(`您心仪商品${name}\n当前数量为：${couponCount}\n兑换所需电量为：${totalScore}\n您当前总电量为：${$.batteryValue * 1}\n不满足兑换心仪商品的条件\n`)
                    }
                  } else {
                    message += `目前库存：暂无您设置的心仪商品\n`;
                  }
                } else {
                  console.log(`BoxJs或环境变量暂未提供心仪商品\n如需兑换心仪商品，请提供心仪商品名称\n`);
                  await jdfactory_getProductList(true);
                  message += `当前剩余最多商品：${$.canMakeList[0] && $.canMakeList[0].name}\n`;
                  message += `兑换所需电量：${$.canMakeList[0] && $.canMakeList[0].fullScore}\n`;
                  message += `您当前总电量：${$.batteryValue * 1}\n`;
                  if ($.canMakeList[0] && $.canMakeList[0].couponCount > 0 && $.batteryValue * 1 >= $.canMakeList[0] && $.canMakeList[0].fullScore) {
                    let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
                    if (new Date(nowTimes).getHours() === 12) {
                      $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}【满足】兑换${$.canMakeList[0] && $.canMakeList[0] && [0].name}所需总电量：${$.canMakeList[0] && $.canMakeList[0].fullScore}\n请点击弹窗直达活动页面\n选择此心仪商品并手动投入电量兑换`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                      if ($.isNode()) await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n${message}【满足】兑换${$.canMakeList[0] && $.canMakeList[0].name}所需总电量：${$.canMakeList[0].fullScore}\n请速去活动页面查看`);
                    }
                  } else {
                    console.log(`\n目前电量${$.batteryValue * 1},不满足兑换 ${$.canMakeList[0] && $.canMakeList[0].name}所需的 ${$.canMakeList[0] && $.canMakeList[0].fullScore}电量\n`)
                  }
                }
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
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
async function helpFriends() {
  for (let code of $.newShareCodes) {
    if (!code) continue
    const helpRes = await jdfactory_collectScore(code);
    if (helpRes.code === 0 && helpRes.data.bizCode === -7) {
      console.log(`助力机会已耗尽，跳出`);
      break
    }
  }
}
async function doTask() {
  if ($.taskVos && $.taskVos.length > 0) {
    for (let item of $.taskVos) {
      if (item.taskType === 1) {
        //关注店铺任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.followShopVo) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 2) {
        //看看商品任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.productInfoVos) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 3) {
        //逛会场任务
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          for (let task of item.shoppingActivityVos) {
            if (task.status === 1) {
              await jdfactory_collectScore(task.taskToken);
            }
          }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 10) {
        if (item.status === 1) {
          if (item.threeMealInfoVos[0].status === 1) {
            //可以做此任务
            console.log(`准备做此任务：${item.taskName}`);
            await jdfactory_collectScore(item.threeMealInfoVos[0].taskToken);
          } else if (item.threeMealInfoVos[0].status === 0) {
            console.log(`${item.taskName} 任务已错过时间`)
          }
        } else if (item.status === 2){
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 21) {
        //开通会员任务
        if (item.status === 1) {
          console.log(`此任务：${item.taskName}，跳过`);
          // for (let task of item.brandMemberVos) {
          //   if (task.status === 1) {
          //     await jdfactory_collectScore(task.taskToken);
          //   }
          // }
        } else {
          console.log(`${item.taskName}已做完`)
        }
      }
      if (item.taskType === 13) {
        //每日打卡
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 14) {
        //好友助力
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          // await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
      if (item.taskType === 23) {
        //从数码电器首页进入
        if (item.status === 1) {
          console.log(`准备做此任务：${item.taskName}`);
          await queryVkComponent();
          await jdfactory_collectScore(item.simpleRecordInfoVo.taskToken);
        } else {
          console.log(`${item.taskName}已完成`);
        }
      }
    }
  }
}

//领取做完任务的奖励
function jdfactory_collectScore(taskToken) {
  return new Promise(async resolve => {
    await $.wait(1000);
    $.post(taskPostUrl("jdfactory_collectScore", { taskToken }, "jdfactory_collectScore"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.taskVos = data.data.result.taskVos;//任务列表
              console.log(`领取做完任务的奖励：${JSON.stringify(data.data.result)}`);
            } else {
              console.log(JSON.stringify(data))
            }
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
//给商品投入电量
function jdfactory_addEnergy() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_addEnergy"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`给商品投入电量：${JSON.stringify(data.data.result)}`)
              // $.taskConfigVos = data.data.result.taskConfigVos;
              // $.exchangeGiftConfigs = data.data.result.exchangeGiftConfigs;
            }
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

//收集电量
function jdfactory_collectElectricity() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_collectElectricity"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`成功收集${data.data.result.electricityValue}电量，当前蓄电池总电量：${data.data.result.batteryValue}\n`);
              $.batteryValue = data.data.result.batteryValue;
            }
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
//获取任务列表
function jdfactory_getTaskDetail() {
  return new Promise(resolve => {
    $.post(taskPostUrl("jdfactory_getTaskDetail", {}, "jdfactory_getTaskDetail"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.taskVos = data.data.result.taskVos;//任务列表
              $.taskVos.map(item => {
                if (item.taskType === 14) {
                  console.log(`\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${item.assistTaskDetailVo.taskToken}\n`)
                }
              })
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
//选择一件商品，只能在 $.newUser !== 1 && $.haveProduct === 2 并且 sellOut === 0的时候可用
function jdfactory_makeProduct(skuId) {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_makeProduct', { skuId }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              console.log(`选购商品成功：${JSON.stringify(data)}`);
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
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
function queryVkComponent() {
  return new Promise(resolve => {
    const options = {
      "url": `https://api.m.jd.com/client.action?functionId=queryVkComponent`,
      "body": `adid=0E38E9F1-4B4C-40A4-A479-DD15E58A5623&area=19_1601_50258_51885&body={"componentId":"4f953e59a3af4b63b4d7c24f172db3c3","taskParam":"{\\"actId\\":\\"8tHNdJLcqwqhkLNA8hqwNRaNu5f\\"}","cpUid":"8tHNdJLcqwqhkLNA8hqwNRaNu5f","taskSDKVersion":"1.0.3","businessId":"babel"}&build=167436&client=apple&clientVersion=9.2.5&d_brand=apple&d_model=iPhone11,8&eid=eidIf12a8121eas2urxgGc+zS5+UYGu1Nbed7bq8YY+gPd0Q0t+iviZdQsxnK/HTA7AxZzZBrtu1ulwEviYSV3QUuw2XHHC+PFHdNYx1A/3Zt8xYR+d3&isBackground=N&joycious=228&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=88732f840b77821b345bf07fd71f609e6ff12f43&osVersion=14.2&partner=TF&rfs=0000&scope=11&screen=828*1792&sign=792d92f78cc893f43c32a4f0b2203a41&st=1606533009673&sv=122&uts=0f31TVRjBSsqndu4/jgUPz6uymy50MQJFKw5SxNDrZGH4Sllq/CDN8uyMr2EAv+1xp60Q9gVAW42IfViu/SFHwjfGAvRI6iMot04FU965+8UfAPZTG6MDwxmIWN7YaTL1ACcfUTG3gtkru+D4w9yowDUIzSuB+u+eoLwM7uynPMJMmGspVGyFIgDXC/tmNibL2k6wYgS249Pa2w5xFnYHQ==&uuid=hjudwgohxzVu96krv/T6Hg==&wifiBssid=1b5809fb84adffec2a397007cc235c03`,
      "headers":  {
        "Cookie": cookie,
        "Accept": `*/*`,
        "Connection": `keep-alive`,
        "Content-Type": `application/x-www-form-urlencoded`,
        "Accept-Encoding": `gzip, deflate, br`,
        "Host": `api.m.jd.com`,
        "User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Accept-Language": `zh-Hans-CN;q=1, en-CN;q=0.9`,
      },
      "timeout": 10000,
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          // console.log('queryVkComponent', data)
          if (safeGet(data)) {
            data = JSON.parse(data);
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
//查询当前商品列表
function jdfactory_getProductList(flag = false) {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getProductList'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.canMakeList = [];
              $.canMakeList = data.data.result.canMakeList;//当前可选商品列表 sellOut:1为已抢光，0为目前可选择
              if ($.canMakeList && $.canMakeList.length > 0) {
                $.canMakeList.sort(sortCouponCount);
                console.log(`商品名称       可选状态    剩余量`)
                for (let item of $.canMakeList) {
                  console.log(`${item.name.slice(-4)}         ${item.sellOut === 1 ? '已抢光':'可 选'}      ${item.couponCount}`);
                }
                if (!flag) {
                  for (let item of $.canMakeList) {
                    if (item.name.indexOf(wantProduct) > -1 && item.couponCount > 0 && item.sellOut === 0) {
                      await jdfactory_makeProduct(item.skuId);
                      break
                    }
                  }
                }
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
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
function sortCouponCount(a, b) {
  return b['couponCount'] - a['couponCount']
}
function jdfactory_getHomeData() {
  return new Promise(resolve => {
    $.post(taskPostUrl('jdfactory_getHomeData'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            // console.log(data);
            data = JSON.parse(data);
            if (data.data.bizCode === 0) {
              $.haveProduct = data.data.result.haveProduct;
              $.userName = data.data.result.userName;
              $.newUser = data.data.result.newUser;
              if (data.data.result.factoryInfo) {
                $.totalScore = data.data.result.factoryInfo.totalScore;//选中的商品，一共需要的电量
                $.userScore = data.data.result.factoryInfo.userScore;//已使用电量
                $.produceScore = data.data.result.factoryInfo.produceScore;//此商品已投入电量
                $.remainScore = data.data.result.factoryInfo.remainScore;//当前蓄电池电量
                $.couponCount = data.data.result.factoryInfo.couponCount;//已选中商品当前剩余量
                $.hasProduceName = data.data.result.factoryInfo.name;//已选中商品当前剩余量
              }
              if ($.newUser === 1) {
                //新用户
                console.log(`此京东账号${$.index}${$.nickName}为新用户暂未开启${$.name}活动\n现在为您从库存里面现有数量中选择一商品`);
                if ($.haveProduct === 2) {
                  await jdfactory_getProductList();//选购商品
                }
                // $.msg($.name, '暂未开启活动', `京东账号${$.index}${$.nickName}暂未开启${$.name}活动\n请去京东APP->搜索'玩一玩'->东东工厂->开启\n或点击弹窗即可到达${$.name}活动`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
              }
              if ($.newUser !== 1 && $.haveProduct === 2) {
                console.log(`此京东账号${$.index}${$.nickName}暂未选购商品\n现在也能为您做任务和收集免费电力`);
                // $.msg($.name, '暂未选购商品', `京东账号${$.index}${$.nickName}暂未选购商品\n请去京东APP->搜索'玩一玩'->东东工厂->选购一件商品\n或点击弹窗即可到达${$.name}活动`, {'open-url': 'openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html%22%20%7D'});
                // await jdfactory_getProductList();//选购商品
              }
            } else {
              console.log(`异常：${JSON.stringify(data)}`)
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
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Factory.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，将切换为备用API`)
          console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
          $.get({url: `https://raw.githubusercontent.com/shuyeshuye/RandomShareCode/main/JD_Factory.json`, 'timeout': 10000},(err, resp, data)=>{
          data = JSON.parse(data);})
        } else {
          if (data) {
            console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    const shareCodes = $.isNode() ? require('./jdFactoryShareCodes.js') : '';
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify($.shareCodesArr)}`);
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.1.0`,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Host": "api.m.jd.com",
      "Origin": "https://h5.m.jd.com",
      "Referer": "https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html",
      "User-Agent": "jdapp;iPhone;9.3.4;14.3;88732f840b77821b345bf07fd71f609e6ff12f43;network/4g;ADID/1C141FDD-C62F-425B-8033-9AAB7E4AE6A3;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,8;addressid/2005183373;supportBestPay/0;appBuild/167502;jdSupportDarkMode/0;pv/414.19;apprpd/Babel_Native;ref/TTTChannelViewContoller;psq/5;ads/;psn/88732f840b77821b345bf07fd71f609e6ff12f43|1701;jdv/0|iosapp|t_335139774|appshare|CopyURL|1610885480412|1610885486;adk/;app_device/IOS;pap/JA2015_311210|9.3.4|IOS 14.3;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    },
    timeout: 10000,
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
      },
      "timeout": 10000,
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