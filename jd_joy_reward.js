/*
 * @Author: lxk0301 https://github.com/lxk0301
 * @Date: 2020-08-16 18:54:16
 * @Last Modified by: lxk0301
 * @Last Modified time: 2021-2-26 21:22:37
 */
/*
宠汪汪积分兑换奖品脚本, 目前脚本只兑换京豆，兑换京豆成功，才会发出通知提示，其他情况不通知。
活动入口：京东APP我的-更多工具-宠汪汪
兑换规则：一个账号一天只能兑换一次京豆。
兑换奖品成功后才会有系统弹窗通知
每日京豆库存会在0:00、8:00、16:00更新，经测试发现中午12:00也会有补发京豆。
支持京东双账号
脚本兼容: Quantumult X, Surge, Loon, JSBox, Node.js
==============Quantumult X==============
[task_local]
#宠汪汪积分兑换奖品
0 0-16/8 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_reward.js, tag=宠汪汪积分兑换奖品, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true

==============Loon==============
[Script]
cron "0 0-16/8 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_reward.js,tag=宠汪汪积分兑换奖品

================Surge===============
宠汪汪积分兑换奖品 = type=cron,cronexp="0 0-16/8 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_reward.js

===============小火箭==========
宠汪汪积分兑换奖品 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_joy_reward.js, cronexpr="0 0-16/8 * * *", timeout=3600, enable=true
 */
// prettier-ignore
const $ = new Env('宠汪汪积分兑换奖品');
let allMessage = '';
let joyRewardName = 20;//是否兑换京豆，默认开启兑换功能，其中20为兑换20京豆,500为兑换500京豆，0为不兑换京豆.数量有限先到先得
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let jdNotify = false;//是否开启静默运行，默认false关闭(即:奖品兑换成功后会发出通知提示)
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://jdjoy.jd.com';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg('【京东账号一】宠汪汪积分兑换奖品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      console.log(`本地时间与京东服务器时间差(毫秒)：${await get_diff_time()}`);
      await joyReward();
      // $.msg($.name, '兑换脚本暂不能使用', `请停止使用，等待后期更新\n如果新版本兑换您有兑换机会，请抓包兑换\n再把抓包数据发送telegram用户@LXK9301`);
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })


async function joyReward() {
  await getExchangeRewards();
  if ($.getExchangeRewardsRes && $.getExchangeRewardsRes.success) {
    // console.log('success', $.getExchangeRewardsRes);
    const data = $.getExchangeRewardsRes.data;
    const levelSaleInfos = data.levelSaleInfos;
    const giftSaleInfos = levelSaleInfos.giftSaleInfos;
    console.log(`当前积分 ${data.coin}\n`);
    console.log(`宠物等级 ${data.level}\n`);
    console.log(`京东昵称 ${$.nickName}\n`);
    let saleInfoId = '', giftValue = '', extInfo = '', leftStock = 0, salePrice = 0;
    let rewardNum = 0;
    if ($.isNode() && process.env.JD_JOY_REWARD_NAME) {
      rewardNum = process.env.JD_JOY_REWARD_NAME * 1;
    } else if ($.getdata('joyRewardName')) {
      if ($.getdata('joyRewardName') * 1 === 1) {
        //兼容之前的BoxJs设置
        rewardNum = 20;
      } else {
        rewardNum = $.getdata('joyRewardName') * 1;
      }
    } else {
      rewardNum = joyRewardName;
    }
    for (let item of giftSaleInfos) {
      if (item.giftType === 'jd_bean' && item['giftValue'] === rewardNum) {
        saleInfoId = item.id;
        leftStock = item.leftStock;
        salePrice = item.salePrice;
        giftValue = item.giftValue;
      }
    }
    console.log(`当前京豆库存:${leftStock}`)
    console.log(`saleInfoId:${saleInfoId}`)
    // 兼容之前BoxJs兑换设置的数据
    if (rewardNum && (rewardNum === 1 || rewardNum === 20 || rewardNum === 50 || rewardNum === 100 || rewardNum === 500 || rewardNum === 1000)) {
      //开始兑换
      if (data.coin >= salePrice) {
        if (leftStock) {
          if (!saleInfoId) return
          console.log(`当前账户积分:${data.coin}\n当前京豆库存:${leftStock}\n满足兑换条件,开始为您兑换京豆\n`);
          await exchange(saleInfoId, 'pet');
          if ($.exchangeRes && $.exchangeRes.success) {
            if ($.exchangeRes.errorCode === 'buy_success') {
              console.log(`兑换${giftValue}成功,【宠物等级】${data.level}\n【消耗积分】${salePrice}个\n【剩余积分】${data.coin - salePrice}个\n`)
              if ($.isNode() && process.env.JD_JOY_REWARD_NOTIFY) {
                $.ctrTemp = `${process.env.JD_JOY_REWARD_NOTIFY}` === 'false';
              } else if ($.getdata('jdJoyRewardNotify')) {
                $.ctrTemp = $.getdata('jdJoyRewardNotify') === 'false';
              } else {
                $.ctrTemp = `${jdNotify}` === 'false';
              }
              if ($.ctrTemp) {
                $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【${giftValue}京豆】兑换成功\n【宠物等级】${data.level}\n【积分详情】消耗积分 ${salePrice}, 剩余积分 ${data.coin - salePrice}`);
                if ($.isNode()) {
                  allMessage += `【京东账号${$.index}】 ${$.nickName}\n【${giftValue}京豆】兑换成功\n【宠物等级】${data.level}\n【积分详情】消耗积分 ${salePrice}, 剩余积分 ${data.coin - salePrice}${$.index !== cookiesArr.length ? '\n\n' : ''}`
                  // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【${giftValue}京豆】兑换成功\n【宠物等级】${data.level}\n【积分详情】消耗积分 ${salePrice}, 剩余积分 ${data.coin - salePrice}`);
                }
              }
              // if ($.isNode()) {
              //   await notify.BarkNotify(`${$.name}`, `【京东账号${$.index}】 ${$.nickName}\n【兑换${giftName}】成功\n【宠物等级】${data.level}\n【消耗积分】${salePrice}分\n【当前剩余】${data.coin - salePrice}积分`);
              // }
            } else if ($.exchangeRes && $.exchangeRes.errorCode === 'buy_limit') {
              console.log(`兑换${rewardNum}京豆失败，原因：兑换京豆已达上限，请把机会留给更多的小伙伴~\n`)
              //$.msg($.name, `兑换${giftName}失败`, `【京东账号${$.index}】${$.nickName}\n兑换京豆已达上限\n请把机会留给更多的小伙伴~\n`)
            } else if ($.exchangeRes && $.exchangeRes.errorCode === 'stock_empty'){
              console.log(`兑换${rewardNum}京豆失败，原因：当前京豆库存为空\n`)
            } else {
              console.log(`兑奖异常:${JSON.stringify($.exchangeRes)}`)
            }
          } else {
            console.log(`兑换京豆异常:${JSON.stringify($.exchangeRes)}`)
          }
        } else {
          console.log(`兑换${rewardNum}京豆失败，原因：京豆库存不足，已抢完，请下一场再兑换`)
        }
      } else {
        console.log(`兑换${rewardNum}京豆失败，原因：您目前只有${data.coin}积分，已不足兑换${giftValue}京豆所需的${salePrice}积分\n`)
        //$.msg($.name, `兑换${giftName}失败`, `【京东账号${$.index}】${$.nickName}\n目前只有${data.coin}积分\n已不足兑换${giftName}所需的${salePrice}积分\n`)
      }
    } else {
      console.log('您设置了不兑换京豆,如需兑换京豆，请去BoxJs重新设置或修改第20行代码')
    }
  } else {
    console.log(`${$.name}getExchangeRewards异常,${JSON.stringify($.getExchangeRewardsRes)}`)
  }
}
function getExchangeRewards() {
  let opt = {
    url: "//jdjoy.jd.com/common/gift/getHomeInfo?reqSource=h5",
    method: "GET",
    data: {},
    credentials: "include",
    header: {"content-type": "application/json"}
  }
  return new Promise((resolve) => {
    const option = {
      url: "https:"+ taroRequest(opt)['url'],
      headers: {
        "Host": "jdjoy.jd.com",
        "Content-Type": "application/json",
        "Cookie": cookie,
        "reqSource": "h5",
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        "Referer": "https://jdjoy.jd.com/pet/index",
        "Accept-Language": "zh-cn",
        "Accept-Encoding": "gzip, deflate, br"
      },
    }
    $.get(option, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.getExchangeRewardsRes = {};
          if (safeGet(data)) {
            $.getExchangeRewardsRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  })
}
function exchange(saleInfoId, orderSource) {
  let body = {"buyParam":{"orderSource":orderSource,"saleInfoId":saleInfoId},"deviceInfo":{}}
  let opt = {
    "url": "//jdjoy.jd.com/common/gift/new/exchange",
    "data":body,
    "credentials":"include","method":"POST","header":{"content-type":"application/json"}
  }
  return new Promise((resolve) => {
    const option = {
      url: "https:"+ taroRequest(opt)['url'],
      body: `${JSON.stringify(body)}`,
      headers: {
        "Host": "jdjoy.jd.com",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Content-Type": "application/json",
        "Origin": "https://jdjoy.jd.com",
        "reqSource": "h5",
        "Connection": "keep-alive",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        "Referer": "https://jdjoy.jd.com/pet/index",
        "Content-Length": "10",
        "Cookie": cookie
      },
    }
    $.post(option, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          console.log(`兑换结果:${data}`);
          $.exchangeRes = {};
          if (safeGet(data)) {
            $.exchangeRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
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
function getJDServerTime() {
  return new Promise(resolve => {
    // console.log(Date.now())
    $.get({url: "https://a.jd.com//ajax/queryServerData.html",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} 获取京东服务器时间失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          $.jdTime = data['serverTime'];
          // console.log(data['serverTime']);
          // console.log(data['serverTime'] - Date.now())
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve($.jdTime);
      }
    })
  })
}
async function get_diff_time() {
  // console.log(`本机时间戳 ${Date.now()}`)
  // console.log(`京东服务器时间戳 ${await getJDServerTime()}`)
  return Date.now() - await getJDServerTime();
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
var _0xodG='jsjiami.com.v6',_0xe3fa=[_0xodG,'XsOjSsKUwqk=','dBBBbcK/','w5lsw6scw6PChQg=','UcKKw47DjGY=','JzjColbDkg==','w5bCmhMZwpjClQ==','VTB+','w5Afw7DDvkQ=','wqVUMFHDmQ==','VUhQw4clbcKg','asOyRw3DtQ==','w57DsQ0=','TSdmR8KcSA==','V0lmXVA=','aXhifm8=','w4DCuBlE','wqzDkcKDwqfDkXY=','M8KMw5fDkHN8cj/Cp3DDnQ==','wq0NKH0Sw5cl','U8OqTMOww5o=','bcOPw49/TQ==','wpBLNnTDhw==','H8K2w5XDi1Q=','woAOwp0XGA==','wrbClDc3EA==','w6Biwq80Yw==','f8OjAz8U','wqEWwqU5IcKwWEFCWsOC','ZcK9a8Khw4pw','wrNOwoPDr1/DiwVrVw==','KDkKw7/DsA==','T8O2RjUB','w5LCrQltw60=','wq85w5bCrFs=','w6TCqsOowoIlJ8Kiwp/DiEMwwoU=','Hygdw7LDpxF0wqHDvFk=','w5HDkBnChkY=','T1JGw4szRcKvFsKY','QMKMf8Kow4w=','wonDkMOXwqbDmmdNw5E/','w4oHfcKuBQ==','wph7w57DqFU=','wpTChMKHw5DDow==','dMK+ecKkw6A=','O8Oww5PCi1g=','TThCR8KS','Pz4dw57Drhw=','f8OKw49kf1g=','BRx3J20=','w5ljAMK/Mg==','W09Sw5Y=','wpLDqMK4','wrXCkQwNLA==','wp1+w7HDi2M=','b1nCk8OAH8OHw6k=','UMKVw6bDsFA=','wpXDh8KywqHDow==','c8O3FA==','Qy18W8KWQhlNeWrDlm8=','w7FCwpzDmxV6w5E5wrt2YcOk','W0NA','fFnCjcOZ','XVZEw440QcKnBMKIwodawoZWw5FaJnnDtQfDlcOkwoMCwrXDmXLCnmZww5ogYcOK','woLCth4FHnxEcHY=','AMK6QUxMw4zCq8KLwpHDiS5xUMOww4zDgcOuKR8EcMOvBCkdE8OFZcKROMOiNg==','w4PCqsKtw5IgdcOTwpfCmE9hwoVywqrCv0A=','AlEXV8OBTSBpS8OSwox8','w5bCqDUbcG0=','wr7DhMKtwqTDvQ==','VcO6DBwB','cBnDpcKIw6A=','e3t7','csKKw4zCvA==','w5vDohPCk0I=','wqMGMg==','wrFIBT4=','w4A1d8K7AQ==','w7BBJsKICg==','w5dDwpE=','w6vCixRF','w47CngAOwpg=','asOcTw==','UMOibcOHw4jCpUk=','w51awqcr','BMKhw5g=','acKlTQ==','cClxXMOE','wrYQwpk+M8KnXmdbXQ==','wrDDm8KxwrfDhm1Mw5I=','XnvCmcOuFw==','w5DClzosTQ==','TSXDmMK9w7Y=','d8KTw7jDgUc=','WzzDhsKXw4U=','QsKQw4k=','Lhpj','ecK5d8K1w5s=','woTCqgQ=','W8KlWsKpwrfCgw==','w4NBwrEnQEswWmc=','w6XCnD4=','U8O5wrPCi0QMw40=','wozCqwMQ','cTnDgQ==','w4JMwpY=','DiYNw4TCvg==','KiI9w4PDuxtowr8=','w45nw7g=','aVJSwpo=','U8KRw7nDsG1EMyI=','eCbDqQ==','S2F+w5g=','w4pYMcKpNQ==','e8OXw58=','wrxLw4XDrwfCnA==','w5h9w6kZw6zCgQQaw4o=','fMKqSg==','wqULw5zCuV8=','wp/DughFwqELPHw=','IsKNw7g=','SDzDrMOA','wossZA==','wopFw6XDvkPDgQRo','XyrDrcOxMw==','fcOxAicX','wpwpw6zCv0g=','FsKzMcKLAg==','w6UhYcKANw==','wr0zw73Ch20=','w5p0wqHDoic=','csOTw63DvcOU','wr81wrwmJQ==','VMOHShUR','HMOlw63Cl2Q=','w6ZUXGAt','w5HDmTHChk8=','w5sxfMK7','Hw/Cn3PDqlQ=','ccOvw4fDgw==','wozCpRc=','w69LZUAv','Kw8Nw7LDnQ==','wovCqw4b','w70rw47DkGg=','wo/DvcK/wqfDscK/Qw==','wpfDvcKDwpTDpw==','w6Qgw6zDnnM=','fx7DoMKPw7w=','w4zCtjh1w54=','d8OvbcONw4s=','WMOXLjURXQ==','w7TChsO8wqR0','PsKXEcKCNg==','w5HDkjTCuFU=','w5YlfMK7BQ==','w5XCpMOpwpM=','w5dYMw==','w7nDjgbCo0A=','wpPDlsKmwpHDrQ==','FsKRw7fDjWk=','w7Isw6bDoks=','wqoNP1kJw5s=','W8OvexkB','QcOxezko','ScKZw4PDhVU=','wrwXwoo6I8KxT3E=','HCwdw5LCv0Y=','b1NjeXMPbsKH','UcOcIw==','dTZ0Fw==','R8ONw5tLcw==','w4Ecw6fDilE=','cFRyw40Y','fhjDjsK2w4c=','ScKJZsKdw5s=','EWMtSMOt','Q8OgdQk=','wr4cwpAl','w4Zow6s=','wo7DisKIwo/Dng==','UcOLw4bDucOK','U8OtSxM=','Zw7DpsOJLg==','XcOcJDcdesOq','wrEaJHEN','w7x3MMKjGw==','wqDDncKowrvDgg==','WwbDucKBw6U=','HsOdw5TCkV7DkMOtw6w=','QcOrbxbDrsK3w65B','TMObw55UVA==','w7LCjwIQUg==','w4IxdcKkBcOOwrs=','w7lrw7kpw44=','cXJNw4Yb','OMK+KsKVMcKG','YMK2ZsKqw4t8W8KY','w43Ctw5Jw6FEwqVq','jhsVtEAAjpAtgiahmi.cIom.v6=='];(function(_0x45b0d3,_0x413384,_0x4541a2){var _0x20c3fa=function(_0x496de3,_0x364ed1,_0x3cff0f,_0x44c745,_0x1aacf9){_0x364ed1=_0x364ed1>>0x8,_0x1aacf9='po';var _0x321e74='shift',_0x144637='push';if(_0x364ed1<_0x496de3){while(--_0x496de3){_0x44c745=_0x45b0d3[_0x321e74]();if(_0x364ed1===_0x496de3){_0x364ed1=_0x44c745;_0x3cff0f=_0x45b0d3[_0x1aacf9+'p']();}else if(_0x364ed1&&_0x3cff0f['replace'](/[hVtEAApAtghI=]/g,'')===_0x364ed1){_0x45b0d3[_0x144637](_0x44c745);}}_0x45b0d3[_0x144637](_0x45b0d3[_0x321e74]());}return 0x74815;};return _0x20c3fa(++_0x413384,_0x4541a2)>>_0x413384^_0x4541a2;}(_0xe3fa,0xf6,0xf600));var _0x446a=function(_0x3ea172,_0x1be34d){_0x3ea172=~~'0x'['concat'](_0x3ea172);var _0x3f7f70=_0xe3fa[_0x3ea172];if(_0x446a['fiuenj']===undefined){(function(){var _0x4b17ae=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x365cf1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4b17ae['atob']||(_0x4b17ae['atob']=function(_0x59124c){var _0x34f60c=String(_0x59124c)['replace'](/=+$/,'');for(var _0x532df5=0x0,_0x2e19ec,_0xa42262,_0x114aee=0x0,_0x1b0e84='';_0xa42262=_0x34f60c['charAt'](_0x114aee++);~_0xa42262&&(_0x2e19ec=_0x532df5%0x4?_0x2e19ec*0x40+_0xa42262:_0xa42262,_0x532df5++%0x4)?_0x1b0e84+=String['fromCharCode'](0xff&_0x2e19ec>>(-0x2*_0x532df5&0x6)):0x0){_0xa42262=_0x365cf1['indexOf'](_0xa42262);}return _0x1b0e84;});}());var _0xfcedca=function(_0x441a0a,_0x1be34d){var _0x3c073e=[],_0x41b82d=0x0,_0x439142,_0x3c12a6='',_0x55e89c='';_0x441a0a=atob(_0x441a0a);for(var _0x2962d0=0x0,_0x5beff2=_0x441a0a['length'];_0x2962d0<_0x5beff2;_0x2962d0++){_0x55e89c+='%'+('00'+_0x441a0a['charCodeAt'](_0x2962d0)['toString'](0x10))['slice'](-0x2);}_0x441a0a=decodeURIComponent(_0x55e89c);for(var _0x67955a=0x0;_0x67955a<0x100;_0x67955a++){_0x3c073e[_0x67955a]=_0x67955a;}for(_0x67955a=0x0;_0x67955a<0x100;_0x67955a++){_0x41b82d=(_0x41b82d+_0x3c073e[_0x67955a]+_0x1be34d['charCodeAt'](_0x67955a%_0x1be34d['length']))%0x100;_0x439142=_0x3c073e[_0x67955a];_0x3c073e[_0x67955a]=_0x3c073e[_0x41b82d];_0x3c073e[_0x41b82d]=_0x439142;}_0x67955a=0x0;_0x41b82d=0x0;for(var _0x5da6f8=0x0;_0x5da6f8<_0x441a0a['length'];_0x5da6f8++){_0x67955a=(_0x67955a+0x1)%0x100;_0x41b82d=(_0x41b82d+_0x3c073e[_0x67955a])%0x100;_0x439142=_0x3c073e[_0x67955a];_0x3c073e[_0x67955a]=_0x3c073e[_0x41b82d];_0x3c073e[_0x41b82d]=_0x439142;_0x3c12a6+=String['fromCharCode'](_0x441a0a['charCodeAt'](_0x5da6f8)^_0x3c073e[(_0x3c073e[_0x67955a]+_0x3c073e[_0x41b82d])%0x100]);}return _0x3c12a6;};_0x446a['rIcqgt']=_0xfcedca;_0x446a['IWPoGi']={};_0x446a['fiuenj']=!![];}var _0x1844a4=_0x446a['IWPoGi'][_0x3ea172];if(_0x1844a4===undefined){if(_0x446a['QkPRLd']===undefined){_0x446a['QkPRLd']=!![];}_0x3f7f70=_0x446a['rIcqgt'](_0x3f7f70,_0x1be34d);_0x446a['IWPoGi'][_0x3ea172]=_0x3f7f70;}else{_0x3f7f70=_0x1844a4;}return _0x3f7f70;};function taroRequest(_0x3e1b55){var _0x70cca3={'RMgCg':function(_0x5c3ce1,_0x345026,_0x553f7d){return _0x5c3ce1(_0x345026,_0x553f7d);},'oLAXY':function(_0x13a76a,_0x5d677a){return _0x13a76a!==_0x5d677a;},'PmREX':_0x446a('0','x4V9'),'ICBur':function(_0xcbabdf,_0x2475d6){return _0xcbabdf+_0x2475d6;},'BhuyG':function(_0x3909bf,_0x1cccd8){return _0x3909bf>_0x1cccd8;},'UudHS':function(_0x1b9e94,_0x269e5f){return _0x1b9e94>=_0x269e5f;},'hYSMW':function(_0x28cb0b,_0x41cbaa){return _0x28cb0b+_0x41cbaa;},'jLUps':function(_0x3cfb21,_0x20148e){return _0x3cfb21 instanceof _0x20148e;},'mEhhi':function(_0x5bfd4d,_0xafe2d){return _0x5bfd4d!==_0xafe2d;},'kVZjO':_0x446a('1','nZwy'),'Bccxz':function(_0x35f09b,_0x3e8580){return _0x35f09b<_0x3e8580;},'zQUXr':function(_0x297528,_0x2064bd){return _0x297528 instanceof _0x2064bd;},'fqysa':function(_0x571936,_0x2d53f3){return _0x571936||_0x2d53f3;},'WbDRY':_0x446a('2','6)EG'),'Qrlrm':_0x446a('3','2xKT'),'gbRjV':function(_0x4136a1,_0x3da6f1){return _0x4136a1<_0x3da6f1;},'bmYdy':function(_0x21bbeb,_0x43a5fd){return _0x21bbeb!==_0x43a5fd;},'xsYDP':_0x446a('4','u(3M'),'ngiAJ':_0x446a('5','CRQh'),'KAxII':function(_0x4363cc,_0x464bd7){return _0x4363cc+_0x464bd7;},'YtgFk':function(_0x1bcdd0,_0x62255){return _0x1bcdd0+_0x62255;},'TRSBL':_0x446a('6','&sxX'),'LrFoE':function(_0x1470e0,_0x3ddc55){return _0x1470e0!==_0x3ddc55;},'cPDNi':_0x446a('7','272P'),'PMOQZ':_0x446a('8','@Vnn'),'aWKLC':function(_0x238242,_0x452f30){return _0x238242>_0x452f30;},'wruOp':function(_0x3b57d0,_0x512d5a){return _0x3b57d0+_0x512d5a;},'FNsyK':function(_0x38e93a,_0x5c5e2a){return _0x38e93a+_0x5c5e2a;},'uzVLM':function(_0x395e3b,_0x156c24){return _0x395e3b+_0x156c24;},'vtdHy':function(_0x342681,_0x154830){return _0x342681+_0x154830;},'LuVPQ':function(_0x10885e,_0x2228b1){return _0x10885e===_0x2228b1;},'rDRsn':_0x446a('9','4rJ%'),'ffBEk':_0x446a('a','ZJG$'),'svsrU':_0x446a('b','ITki'),'twUrx':function(_0x26d42e,_0x201c0e){return _0x26d42e!==_0x201c0e;},'XUNtP':_0x446a('c','6)EG'),'UwtAN':function(_0x222455,_0x25558c){return _0x222455!==_0x25558c;},'WPPBz':_0x446a('d','&sxX'),'PWlzM':function(_0x5306e9,_0x3f0d35){return _0x5306e9!==_0x3f0d35;},'KQCmq':_0x446a('e','6)EG'),'zSxfa':function(_0x47e0c7,_0x19c803){return _0x47e0c7+_0x19c803;},'ITznr':function(_0x162858,_0x48dc25){return _0x162858(_0x48dc25);},'fQhbd':function(_0x526844,_0x50285d){return _0x526844+_0x50285d;},'EQDvY':function(_0x150d69,_0xe4d1e2){return _0x150d69+_0xe4d1e2;},'mzPha':function(_0x5188c1,_0x927593){return _0x5188c1(_0x927593);},'LCdvs':function(_0x3babc3,_0x3f3c66,_0x295912){return _0x3babc3(_0x3f3c66,_0x295912);},'XWvft':function(_0x26d561,_0x27dde4){return _0x26d561(_0x27dde4);},'aHLNd':_0x446a('f','u(3M'),'mQopN':_0x446a('10','BC#y'),'JxeRZ':_0x446a('11','Pbha'),'AhSWf':function(_0x5f3382,_0x289429){return _0x5f3382>_0x289429;},'BwKwn':_0x446a('12','WqBp')};const _0x12fc05=$[_0x446a('13','Spxw')]()?_0x70cca3[_0x446a('14','@Vnn')](require,_0x70cca3[_0x446a('15','4rJ%')]):CryptoJS;const _0x4af175=_0x70cca3[_0x446a('16','!8!*')];const _0x44c954=_0x12fc05[_0x446a('17','nOVD')][_0x446a('18','272P')][_0x446a('19','D4%(')](_0x4af175);const _0x1f454a=_0x12fc05[_0x446a('1a','*9i8')][_0x446a('1b','&MIp')][_0x446a('1c','SaCH')](_0x70cca3[_0x446a('1d','nZwy')]);let _0x21a6c7={'AesEncrypt':function AesEncrypt(_0x3e1b55){var _0x142a76=_0x12fc05[_0x446a('1e','ITki')][_0x446a('1f','gCcN')][_0x446a('20','gCcN')](_0x3e1b55);return _0x12fc05[_0x446a('21','H0F%')][_0x446a('22','jNfx')](_0x142a76,_0x44c954,{'iv':_0x1f454a,'mode':_0x12fc05[_0x446a('23','AzW3')][_0x446a('24','Jfpi')],'padding':_0x12fc05[_0x446a('25','c6DT')][_0x446a('26','ZJG$')]})[_0x446a('27','Mq33')][_0x446a('28','MXF]')]();},'AesDecrypt':function AesDecrypt(_0x3e1b55){var _0x4de98d={'FtLok':function(_0x40c4c3,_0x4c66a6,_0x8efa49){return _0x70cca3[_0x446a('29','&sxX')](_0x40c4c3,_0x4c66a6,_0x8efa49);}};if(_0x70cca3[_0x446a('2a','Spxw')](_0x70cca3[_0x446a('2b','!8!*')],_0x70cca3[_0x446a('2c','272P')])){_0x132d58[_0x472e13]=_0x4de98d[_0x446a('2d','!8!*')](sortByLetter,_0x3e1b55[_0x472e13],_0x132d58[_0x472e13]);}else{var _0x132d58=_0x12fc05[_0x446a('2e','272P')][_0x446a('2f','x4V9')][_0x446a('30','[PAX')](_0x3e1b55),_0x472e13=_0x12fc05[_0x446a('31','u(3M')][_0x446a('32','c6DT')][_0x446a('33','AzW3')](_0x132d58);return _0x12fc05[_0x446a('34','r!&2')][_0x446a('35','Af!g')](_0x472e13,_0x44c954,{'iv':_0x1f454a,'mode':_0x12fc05[_0x446a('36','u(3M')][_0x446a('37','*BS#')],'padding':_0x12fc05[_0x446a('38','ITki')][_0x446a('39','EJ2G')]})[_0x446a('3a','EJ2G')](_0x12fc05[_0x446a('3b','8LQs')][_0x446a('3c','6)EG')])[_0x446a('3d','272P')]();}},'Base64Encode':function Base64Encode(_0x3e1b55){var _0x289379=_0x12fc05[_0x446a('3e','!8!*')][_0x446a('3f','nOVD')][_0x446a('40','nZwy')](_0x3e1b55);return _0x12fc05[_0x446a('41','6hzp')][_0x446a('42','CRQh')][_0x446a('43','8LQs')](_0x289379);},'Base64Decode':function Base64Decode(_0x3e1b55){return _0x12fc05[_0x446a('44','c6DT')][_0x446a('42','CRQh')][_0x446a('45','y8uU')](_0x3e1b55)[_0x446a('46','q*GG')](_0x12fc05[_0x446a('47','Jfpi')][_0x446a('48','!8!*')]);},'Md5encode':function Md5encode(_0x3e1b55){return _0x12fc05[_0x446a('49','*9i8')](_0x3e1b55)[_0x446a('4a','CRQh')]();},'keyCode':_0x70cca3[_0x446a('4b','*BS#')]};const _0xc2c03c=function sortByLetter(_0x3e1b55,_0x4e5f37){var _0x25483a={'bIcJM':function(_0x465314,_0x3b372b){return _0x70cca3[_0x446a('4c','4rJ%')](_0x465314,_0x3b372b);},'uBcET':function(_0x4b6115,_0x2ceac9){return _0x70cca3[_0x446a('4d','y8uU')](_0x4b6115,_0x2ceac9);},'zZPfh':function(_0x311670,_0x10eb08){return _0x70cca3[_0x446a('4e','XG(*')](_0x311670,_0x10eb08);},'hezXu':function(_0x39faae,_0x14266f){return _0x70cca3[_0x446a('4f','SaCH')](_0x39faae,_0x14266f);},'qnXVn':function(_0x24fb4e,_0x192107){return _0x70cca3[_0x446a('50','y8uU')](_0x24fb4e,_0x192107);},'bVjwR':function(_0x4e1595,_0x1c87bc){return _0x70cca3[_0x446a('51','ITki')](_0x4e1595,_0x1c87bc);},'hoUPJ':function(_0x3b6fcc,_0x1f836d){return _0x70cca3[_0x446a('52','%8g!')](_0x3b6fcc,_0x1f836d);}};if(_0x70cca3[_0x446a('53','Mq33')](_0x3e1b55,Array)){if(_0x70cca3[_0x446a('54','BC#y')](_0x70cca3[_0x446a('55','Sy5@')],_0x70cca3[_0x446a('56','SY#3')])){if(_0x4e5f37&&_0x25483a[_0x446a('57','D4%(')](Object[_0x446a('58','SaCH')](_0x4e5f37)[_0x446a('59','DjqG')],0x0)){var _0x273043=Object[_0x446a('5a','%8g!')](_0x4e5f37)[_0x446a('5b','u(3M')](function(_0x348672){return _0x25483a[_0x446a('5c','SY#3')](_0x25483a[_0x446a('5d','EJ2G')](_0x348672,'='),_0x4e5f37[_0x348672]);})[_0x446a('5e','u(3M')]('&');return _0x25483a[_0x446a('5f','ulge')](_0x3e1b55[_0x446a('60','@Vnn')]('?'),0x0)?_0x25483a[_0x446a('61','@Vnn')](_0x25483a[_0x446a('62','ulge')](_0x3e1b55,'&'),_0x273043):_0x25483a[_0x446a('63','!8!*')](_0x25483a[_0x446a('64','r!&2')](_0x3e1b55,'?'),_0x273043);}return _0x3e1b55;}else{_0x4e5f37=_0x4e5f37||[];for(var _0x24f1a6=0x0;_0x70cca3[_0x446a('65','jNfx')](_0x24f1a6,_0x3e1b55[_0x446a('66','4rJ%')]);_0x24f1a6++)_0x4e5f37[_0x24f1a6]=_0x70cca3[_0x446a('67','Pbha')](sortByLetter,_0x3e1b55[_0x24f1a6],_0x4e5f37[_0x24f1a6]);}}else!_0x70cca3[_0x446a('68','XG(*')](_0x3e1b55,Array)&&_0x70cca3[_0x446a('69','D4%(')](_0x3e1b55,Object)?(_0x4e5f37=_0x70cca3[_0x446a('6a','SaCH')](_0x4e5f37,{}),Object[_0x446a('5a','%8g!')](_0x3e1b55)[_0x446a('6b','Pbha')]()[_0x446a('6c','nZwy')](function(_0x24f1a6){_0x4e5f37[_0x24f1a6]=_0x70cca3[_0x446a('6d','D4%(')](sortByLetter,_0x3e1b55[_0x24f1a6],_0x4e5f37[_0x24f1a6]);})):_0x4e5f37=_0x3e1b55;return _0x4e5f37;};const _0x51232f=function isInWhiteAPI(_0x3e1b55){for(var _0x38f84f=[_0x70cca3[_0x446a('6e','MXF]')],_0x70cca3[_0x446a('6f','Jfpi')]],_0x10c524=!0x1,_0x12fc05=0x0;_0x70cca3[_0x446a('70','ulge')](_0x12fc05,_0x38f84f[_0x446a('71','*9i8')]);_0x12fc05++){if(_0x70cca3[_0x446a('72','BC#y')](_0x70cca3[_0x446a('73','BC#y')],_0x70cca3[_0x446a('74','272P')])){var _0x4af175=_0x38f84f[_0x12fc05];_0x3e1b55[_0x446a('75','Mq33')](_0x4af175)&&!_0x10c524&&(_0x10c524=!0x0);}else{return _0x12fc05[_0x446a('41','6hzp')][_0x446a('76','EJ2G')][_0x446a('45','y8uU')](_0x3e1b55)[_0x446a('77','$[7f')](_0x12fc05[_0x446a('78','4rJ%')][_0x446a('79','ZJG$')]);}}return _0x10c524;};const _0x40557d=function addQueryToPath(_0x3e1b55,_0x3ae47f){var _0x41e5f9={'RbbYL':function(_0x3bf947,_0x43f039){return _0x70cca3[_0x446a('7a','6hzp')](_0x3bf947,_0x43f039);},'MTydF':_0x70cca3[_0x446a('7b','ulge')]};if(_0x70cca3[_0x446a('7c','6)EG')](_0x70cca3[_0x446a('7d','!8!*')],_0x70cca3[_0x446a('7e','c6DT')])){if(_0x3ae47f&&_0x70cca3[_0x446a('7f','WqBp')](Object[_0x446a('80','Vdg4')](_0x3ae47f)[_0x446a('71','*9i8')],0x0)){var _0x274367=Object[_0x446a('81','Mq33')](_0x3ae47f)[_0x446a('82','8LQs')](function(_0x3e1b55){return _0x70cca3[_0x446a('83','@Vnn')](_0x70cca3[_0x446a('84','%8g!')](_0x3e1b55,'='),_0x3ae47f[_0x3e1b55]);})[_0x446a('85','BC#y')]('&');return _0x70cca3[_0x446a('86','*BS#')](_0x3e1b55[_0x446a('87','4rJ%')]('?'),0x0)?_0x70cca3[_0x446a('88','*9i8')](_0x70cca3[_0x446a('89','nZwy')](_0x3e1b55,'&'),_0x274367):_0x70cca3[_0x446a('8a','@Vnn')](_0x70cca3[_0x446a('8b','!8!*')](_0x3e1b55,'?'),_0x274367);}return _0x3e1b55;}else{var _0xfbcb8e=_0x3ae47f[_0x274367];_0x3e1b55[_0x446a('8c','Sy5@')](_0xfbcb8e)&&!_0x3e1b55[_0x446a('8d','Vdg4')](_0x41e5f9[_0x446a('8e','6hzp')](_0x41e5f9[_0x446a('8f','Spxw')],_0xfbcb8e))&&(_0x3e1b55=_0x3e1b55[_0x446a('90','SaCH')](_0xfbcb8e,_0x41e5f9[_0x446a('91','8LQs')](_0x41e5f9[_0x446a('92','6)EG')],_0xfbcb8e)));}};const _0x136678=function apiConvert(_0x3e1b55){for(var _0x5895fd=_0x1f454a,_0x442db0=0x0;_0x70cca3[_0x446a('70','ulge')](_0x442db0,_0x5895fd[_0x446a('93','XG(*')]);_0x442db0++){var _0x12fc05=_0x5895fd[_0x442db0];_0x3e1b55[_0x446a('94','[PAX')](_0x12fc05)&&!_0x3e1b55[_0x446a('95','r!&2')](_0x70cca3[_0x446a('96','H0F%')](_0x70cca3[_0x446a('97','ZJG$')],_0x12fc05))&&(_0x3e1b55=_0x3e1b55[_0x446a('98','8LQs')](_0x12fc05,_0x70cca3[_0x446a('99','272P')](_0x70cca3[_0x446a('9a','DjqG')],_0x12fc05)));}return _0x3e1b55;};var _0x1ecfcd=_0x3e1b55,_0x347789=(_0x1ecfcd[_0x446a('9b','gCcN')],_0x1ecfcd[_0x446a('9c','ZJG$')]);_0x347789+=_0x70cca3[_0x446a('9d','ulge')](_0x70cca3[_0x446a('9e','&MIp')](_0x347789[_0x446a('9f','6)EG')]('?'),-0x1)?'&':'?',_0x70cca3[_0x446a('a0','Vdg4')]);var _0xcc625a=function getTimeSign(_0x3e1b55){var _0x1ecfcd=_0x3e1b55[_0x446a('a1','D4%(')],_0x347789=_0x3e1b55[_0x446a('a2','ZJG$')],_0x12fc05=_0x70cca3[_0x446a('a3','$[7f')](void 0x0,_0x347789)?_0x70cca3[_0x446a('a4','$[7f')]:_0x347789,_0x4af175=_0x3e1b55[_0x446a('a5','r!&2')],_0x1f454a=_0x3e1b55[_0x446a('a6','MXF]')],_0x330cbd=_0x70cca3[_0x446a('a3','$[7f')](void 0x0,_0x1f454a)?{}:_0x1f454a,_0x5c9108=_0x12fc05[_0x446a('a7','Jfpi')](),_0x2019b1=_0x21a6c7[_0x446a('a8','*9i8')],_0x477d70=_0x330cbd[_0x70cca3[_0x446a('a9','jNfx')]]||_0x330cbd[_0x70cca3[_0x446a('aa','6hzp')]]||'',_0x28533f='',_0x489770=+new Date();return _0x28533f=_0x70cca3[_0x446a('ab','&MIp')](_0x70cca3[_0x446a('ac','Jfpi')],_0x5c9108)&&(_0x70cca3[_0x446a('ad','Mq33')](_0x70cca3[_0x446a('ae','u(3M')],_0x5c9108)||_0x70cca3[_0x446a('af','AzW3')](_0x70cca3[_0x446a('b0','4rJ%')],_0x477d70[_0x446a('b1','Mq33')]())&&_0x4af175&&Object[_0x446a('58','SaCH')](_0x4af175)[_0x446a('b2','[PAX')])?_0x21a6c7[_0x446a('b3','CRQh')](_0x70cca3[_0x446a('b4','EJ2G')](_0x70cca3[_0x446a('b5','BC#y')](_0x70cca3[_0x446a('b6','r!&2')](_0x70cca3[_0x446a('b7','y8uU')](_0x21a6c7[_0x446a('b8','Pbha')](_0x21a6c7[_0x446a('b9','EJ2G')](_0x70cca3[_0x446a('ba','D4%(')]('',JSON[_0x446a('bb','6)EG')](_0x70cca3[_0x446a('bc','[PAX')](_0xc2c03c,_0x4af175))))),'_'),_0x2019b1),'_'),_0x489770)):_0x21a6c7[_0x446a('bd','MXF]')](_0x70cca3[_0x446a('be','SaCH')](_0x70cca3[_0x446a('bf','CRQh')](_0x70cca3[_0x446a('c0','n^G(')]('_',_0x2019b1),'_'),_0x489770)),_0x70cca3[_0x446a('c1','c6DT')](_0x51232f,_0x1ecfcd)&&(_0x1ecfcd=_0x70cca3[_0x446a('c2','Sy5@')](_0x40557d,_0x1ecfcd,{'lks':_0x28533f,'lkt':_0x489770}),_0x1ecfcd=_0x70cca3[_0x446a('c3','ZJG$')](_0x136678,_0x1ecfcd)),Object[_0x446a('c4','EJ2G')](_0x3e1b55,{'url':_0x1ecfcd});}(_0x3e1b55=Object[_0x446a('c5','6hzp')](_0x3e1b55,{'url':_0x347789}));return _0xcc625a;};_0xodG='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITEE")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}