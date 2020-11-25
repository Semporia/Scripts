/**
 *
  参考自： https://raw.githubusercontent.com/799953468/Quantumult-X/master/Scripts/JD/jd_factory.js
  增加随机助力，每次随机助力一位
  增加box自动充电配置
  拷贝定时任务时删掉 *\/1 中的 \
  quanx:
  [task_local]
  0 *\/1 * * * https://raw.githubusercontent.com/whyour/hundun/master/quanx/dd_factory.js, tag=东东工厂, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_factory.png enabled=true

  loon:
  [Script]
  cron "0 *\/1 * * *" script-path=https://raw.githubusercontent.com/whyour/hundun/master/quanx/dd_factory.js, tag=东东工厂

  surge:
  [Script]
  东东工厂 = type=cron,cronexp=0 *\/1 * * *,timeout=60,script-path=https://raw.githubusercontent.com/whyour/hundun/master/quanx/dd_factory.js,
 *
 *  
 **/

const $ = new Env("东东工厂");
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
const JD_API_HOST = "https://api.m.jd.com/client.action";
$.autoCharge = $.getdata("jd_autoCharge")
  ? $.getdata("jd_autoCharge") === "true"
  : false;
$.result = [];
$.cookieArr = [];
$.allTask = [];
$.factoryInfo = {};

!(async () => {
  if (!getCookies()) return;
  for (let i = 0; i < $.cookieArr.length; i++) {
    const cookie = $.cookieArr[i];
    if (cookie) {
      const userName = decodeURIComponent(
        cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]
      );
      $.log(`\n开始【京东账号${i + 1}】${userName}`);
      const startHomeInfo = await getFactoryInfo(cookie);
      await getAllTask(cookie);
      await browserTask(cookie);
      await $.wait(500);
      await collectElectricity(cookie);
      await $.wait(500);
      await addEnergy(cookie);
      await $.wait(500);
      const endHomeInfo = await getFactoryInfo(cookie);
      await $.wait(500);
      await submitInviteId(userName);
      await $.wait(500);
      await createAssistUser(cookie);
      $.result.push(
        `名称：${startHomeInfo.name}  剩余:${startHomeInfo.couponCount}`,
        `任务前电量：${startHomeInfo.remainScore} 任务后电量：${endHomeInfo.remainScore}`,
        `获得电量：${
          endHomeInfo.remainScore - startHomeInfo.remainScore
        } 还需电量：${endHomeInfo.totalScore - endHomeInfo.remainScore}`
      );
    }
  }
  await showMsg();
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function getCookies() {
  if ($.isNode()) {
    $.cookieArr = Object.values(jdCookieNode);
  } else {
    $.cookieArr = [$.getdata("CookieJD") || "", $.getdata("CookieJD2") || ""];
  }
  if (!$.cookieArr[0]) {
    $.msg(
      $.name,
      "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取",
      "https://bean.m.jd.com/",
      { "open-url": "https://bean.m.jd.com/" }
    );
    return false;
  }
  return true;
}

function showMsg() {
  return new Promise((resolve) => {
    $.msg($.name, "", `\n${$.result.join("\n")}`);
    resolve();
  });
}

function getFactoryInfo(cookie) {
  return new Promise((resolve) => {
    $.post(taskPostUrl("jdfactory_getHomeData", {}, cookie), (err, resp, data) => {
      try {
        const {
          data: {
            result: { factoryInfo },
            bizMsg,
          },
        } = JSON.parse(data);
        $.log(`\n${bizMsg}`);
        $.factoryInfo = factoryInfo;
        resolve(factoryInfo);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getAllTask(cookie) {
  return new Promise((resolve) => {
    $.post(
      taskPostUrl("jdfactory_getTaskDetail", {}, cookie),
      (err, resp, _data) => {
        try {
          const {
            data: {
              result: { taskVos },
              bizMsg,
            },
          } = JSON.parse(_data);
          $.allTask = taskVos;
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

async function browserTask(cookie) {
  return new Promise(async (resolve) => {
    const signIn = $.allTask.find((x) => x.taskId === 1);
    const digitalAppliance = $.allTask.find((x) => x.taskId === 3);
    const browserMeeting = $.allTask.find((x) => x.taskId === 4);
    const lookCommodity = $.allTask.find((x) => x.taskId === 5);
    const followShop = $.allTask.find((x) => x.taskId === 6);
    const patrolFactory = $.allTask.find((x) => x.taskId === 8);
    const times = Math.max(
      browserMeeting.maxTimes,
      lookCommodity.maxTimes,
      followShop.maxTimes
    );
    await browserMeetingFun(
      signIn.simpleRecordInfoVo.taskToken,
      cookie,
      signIn
    );
    await $.wait(500);
    await browserMeetingFun(
      digitalAppliance.simpleRecordInfoVo.taskToken,
      cookie,
      digitalAppliance
    );
    await $.wait(500);
    await browserMeetingFun(
      patrolFactory.threeMealInfoVos.taskToken,
      cookie,
      patrolFactory
    );
    await $.wait(500);
    const status = [true, true, true];
    for (let i = 0; i < times; i++) {
      if (status[0]) {
        status[0] = await browserMeetingFun(
          browserMeeting.shoppingActivityVos[i].taskToken,
          cookie,
          browserMeeting
        );
        await $.wait(500);
        await getAllTask(cookie);
        await $.wait(500);
      }
      if (status[1]) {
        status[1] = await browserMeetingFun(
          lookCommodity.productInfoVos[i].taskToken,
          cookie,
          lookCommodity
        );
        await $.wait(500);
        await getAllTask(cookie);
        await $.wait(500);
      }
      if (status[2]) {
        await followShopFun(followShop.followShopVo[i].shopId, followShop);
        await $.wait(500);
        status[2] = await browserMeetingFun(
          followShop.followShopVo[i].taskToken,
          cookie,
          followShop
        );
        await $.wait(500);
        await getAllTask(cookie);
        await $.wait(300);
      }
    }
    resolve();
  });
}

function submitInviteId(userName) {
  const inviteTask = $.allTask.find((x) => x.taskId === 2);
  $.log("你的互助码: " + inviteTask.assistTaskDetailVo.taskToken);
  return new Promise((resolve) => {
    $.get(
      {
        url: `https://api.ninesix.cc/factory/${inviteTask.assistTaskDetailVo.taskToken}/${userName}`,
      },
      (err, resp, _data) => {
        try {
          const { data = {} } = JSON.parse(_data);
          $.log(`\n${data.value}\n${_data}`);
          if (data.value) {
            $.result.push("邀请码提交成功！");
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

function createAssistUser(cookie) {
  return new Promise((resolve) => {
    $.get({ url: "https://api.ninesix.cc/factory" }, (err, resp, _data) => {
      try {
        const { data = {} } = JSON.parse(_data);
        $.log(`\n${data.value}\n${_data}`);
        $.post(
          taskPostUrl(
            "jdfactory_collectScore",
            { taskToken: data.value },
            cookie
          ),
          (err, resp, _data) => {
            try {
              const { data: { bizMsg } = {}, msg } = JSON.parse(_data);
              $.log(`\n${bizMsg || msg}\n${_data}`);
            } catch (e) {
              $.logErr(e, resp);
            } finally {
              resolve();
            }
          }
        );
      } catch (e) {
        $.logErr(e, resp);
      }
    });
  });
}

function browserMeetingFun(token, cookie, task) {
  return new Promise((resolve) => {
    if (parseInt(task.times) >= parseInt(task.maxTimes)) {
      resolve();
    }
    $.post(
      taskPostUrl("jdfactory_collectScore", { taskToken: token }, cookie),
      (err, resp, _data) => {
        try {
          const { data: { bizCode, bizMsg } = {}, msg } = JSON.parse(_data);
          $.log(`\n${task.taskName}  ${bizMsg || msg}\n${_data}`);
          resolve(bizCode === 0);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

function followShopFun(shopId, shopTask) {
  return new Promise((resolve) => {
    if (parseInt(shopTask.times) >= parseInt(shopTask.maxTimes)) {
      resolve();
    }
    $.post(
      taskPostUrl("followShop", {
        follow: "true",
        shopId: `${shopId}`,
        award: "false",
        sourceRpc: "shop_app_home_follow",
      }),
      (err, resp, _data) => {
        try {
          const { data: { bizMsg } = {}, msg } = JSON.parse(_data);
          $.log(`\n${shopTask.taskName}  ${bizMsg || msg}\n${_data}`);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

function addEnergy(cookie) {
  return new Promise((resolve) => {
    if (
      $.autoCharge &&
      parseInt($.factoryInfo.totalScore) <= parseInt($.factoryInfo.remainScore)
    ) {
      $.get(
        taskUrl("jdfactory_addEnergy", {}, cookie),
        async (err, resp, _data) => {
          try {
            const {
              data: { bizMsg },
              msg,
            } = JSON.parse(_data);
            $.log(`\n${bizMsg || msg}\n${_data}`);
          } catch (e) {
            $.logErr(e, resp);
          } finally {
            resolve();
          }
        }
      );
    }
    resolve();
  });
}

function collectElectricity(cookie) {
  return new Promise((resolve) => {
    $.post(
      taskPostUrl("jdfactory_collectElectricity", {}, cookie),
      async (err, resp, _data) => {
        try {
          const {
            data: { bizMsg },
            msg,
          } = JSON.parse(_data);
          $.log(`\n${bizMsg || msg}\n${_data}`);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  });
}

function taskUrl(function_id, body = {}, cookie) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${JSON.stringify(
      body
    )}&client=wh5&clientVersion=1.0.0`,
    headers: {
      Accept: `application/json, text/plain, */*`,
      Origin: `https://h5.m.jd.com`,
      "Accept-Encoding": `gzip, deflate, br`,
      Cookie: cookie,
      "Content-Type": `application/x-www-form-urlencoded`,
      Host: `api.m.jd.com`,
      Connection: `keep-alive`,
      "User-Agent": `jdapp;iPhone;9.2.4;14.2.1;93c009c471d3d33feeef2f4f3ae808c64cdd42b2;network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,2;addressid/2340668675;supportBestPay/0;appBuild/167432;pushNoticeIsOpen/0;jdSupportDarkMode/0;pv/60.15;apprpd/Search_ProductList;ref/FinalSearchListViewController;psq/5;ads/;psn/93c009c471d3d33feeef2f4f3ae808c64cdd42b2|380;jdv/0|iosapp|t_335139774|appshare|CopyURL|1606278176973|1606278183;adk/;app_device/IOS;pap/JA2015_311210|9.2.4|IOS 14.2.1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Referer: `https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html?babelChannel=ttt10&lng=116.356219&lat=40.046567&sid=0c8bb35d3e7e2f0822432b0fbeb2833w&un_area=1_2800_55833_0`,
      "Accept-Language": `zh-cn`,
    },
  };
}

function taskPostUrl(functionId, body, cookie) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    headers: {
      Accept: `application/json, text/plain, */*`,
      Origin: `https://h5.m.jd.com`,
      "Accept-Encoding": `gzip, deflate, br`,
      Cookie: cookie,
      "Content-Type": `application/x-www-form-urlencoded`,
      Host: `api.m.jd.com`,
      Connection: `keep-alive`,
      "User-Agent": `jdapp;iPhone;9.2.4;14.2.1;93c009c471d3d33feeef2f4f3ae808c64cdd42b2;network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone13,2;addressid/2340668675;supportBestPay/0;appBuild/167432;pushNoticeIsOpen/0;jdSupportDarkMode/0;pv/60.15;apprpd/Search_ProductList;ref/FinalSearchListViewController;psq/5;ads/;psn/93c009c471d3d33feeef2f4f3ae808c64cdd42b2|380;jdv/0|iosapp|t_335139774|appshare|CopyURL|1606278176973|1606278183;adk/;app_device/IOS;pap/JA2015_311210|9.2.4|IOS 14.2.1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Referer: `https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html?babelChannel=ttt10&lng=116.356219&lat=40.046567&sid=0c8bb35d3e7e2f0822432b0fbeb2833w&un_area=1_2800_55833_0`,
      "Accept-Language": `zh-cn`,
    },
    body: `functionId=${functionId}&body=${JSON.stringify(
      body
    )}&client=wh5&clientVersion=1.0.0`,
  };
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
