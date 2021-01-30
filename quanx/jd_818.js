/*
 特别声明：
 本脚本搬运自 https://gitee.com/lxk0301/jd_scripts/blob/master/jd_5g.js
 * @Author: lxk0301
 * @Github: https://github.com/whyour
 * @Date: 2021-01-30 20:00:00
 * @LastEditors: whyour
 * @LastEditTime: 2021-01-30 22:39:15
 活动地址: https://rdcseason.m.jd.com/#/index

 # quanx
 [task_local]
 0 0-18/6 * * * https://raw.githubusercontent.com/whyour/hundun/master/quanx/jd_818.js, tag=京东手机狂欢城, enabled=true
 # loon
 [Script]
 cron "0 0-18/6 * * *" script-path=https://raw.githubusercontent.com/whyour/hundun/master/quanx/jd_818.js, tag=京东手机狂欢城
 # surge
 京东手机狂欢城 = type=cron,cronexp=0 0-18/6 * * *,wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/whyour/hundun/master/quanx/jd_818.js
*/

const $ = new Env('京东手机狂欢城');

const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

const JD_API_HOST = 'https://rdcseason.m.jd.com/api/';
$.result = [];
$.cookieArr = [];
$.currentCookie = '';

!(async () => {
  if (!getCookies()) return;
  for (let i = 0; i < $.cookieArr.length; i++) {
    $.currentCookie = $.cookieArr[i];
    if ($.currentCookie) {
      const userName = decodeURIComponent(
        $.currentCookie.match(/pt_pin=(.+?);/) && $.currentCookie.match(/pt_pin=(.+?);/)[1],
      );
      $.log(`\n开始【京东账号${i + 1}】${userName}`);
      $.result.push(`【京东账号${i + 1}】${userName}`);
      $.beans = 0;
      $.score = 0;
      $.risk = false;
      await getToday();
      if ($.risk) {
        $.result.push('活动太火爆了，快去买买买吧');
        await showMsg();
        return;
      }
      await getHelp();
      await submitInviteId(userName);
      $.log(`去浏览会场`);
      await getMeetingList();
      $.log(`去浏览商品`);
      await getGoodList();
      $.log(`去浏览店铺`);
      await getShopList();
      await $.wait(10000);
      $.log(`去浏览会场`);
      await getMeetingList();
      $.log(`去浏览商品`);
      await getGoodList();
      $.log(`去浏览店铺`);
      await getShopList();
      $.log(`去帮助好友`);
      await myRank(); //领取往期排名奖励
      await getActInfo();
      await createAssistUser();
      await createAssistUser();
      await showMsg();
    }
  }
})()
  .catch(e => $.logErr(e))
  .finally(() => $.done());

function getCookies() {
  if ($.isNode()) {
    $.cookieArr = Object.values(jdCookieNode);
  } else {
    const CookiesJd = JSON.parse($.getdata('CookiesJD') || '[]')
      .filter(x => !!x)
      .map(x => x.cookie);
    $.cookieArr = [$.getdata('CookieJD') || '', $.getdata('CookieJD2') || '', ...CookiesJd];
  }
  if (!$.cookieArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
      'open-url': 'https://bean.m.jd.com/',
    });
    return false;
  }
  return true;
}

function showMsg() {
  return new Promise(resolve => {
    $.result.push(`本次运行获得${$.beans}京豆，${$.score}积分`);
    if (!jdNotify) {
      $.msg($.name, '', `${$.result.join('\n')}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${$.result.join('\n')}`);
    }
    resolve();
  });
}

function createAssistUser() {
  return new Promise(resolve => {
    $.get({ url: `https://api.ninesix.cc/api/jx-818` }, async (err, resp, _data) => {
      try {
        const { code, data: { value, extra = {} } = {} } = JSON.parse(_data);
        $.log(`\n获取随机助力码${code}\n${$.showLog ? _data : ''}`);
        if (!value) {
          $.result.push('获取助力码失败，请稍后再次手动执行脚本！');
          resolve();
          return;
        }
        $.post(taskPostUrl('task/toHelp', `shareId=${value}`), async (err, resp, data) => {
            try {
              if (err) {
                $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
              } else {
                data = JSON.parse(data);
                if (data && data['code'] === 200) {
                  $.log(`助力结果:${JSON.stringify(data)}`);
                } else {
                  $.log(data);
                }
              }
            } catch (e) {
              $.logErr(e, resp);
            } finally {
              resolve();
            }
          },
        );
      } catch (e) {
        $.logErr(e, resp);
        resolve();
      }
    });
  });
}

function getToday() {
  return new Promise(resolve => {
    $.post(taskPostUrl('task/getPresetJingTie', 'presentAmt=20'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.log(data.data.rsMsg);
          } else {
            $.log(data.msg);
            if (data.code === 1002) {
              $.risk = true;
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getActInfo() {
  return new Promise(resolve => {
    $.get(taskUrl('task/findJingTie'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.result.push(`用户当前积分：${data.data.integralNum}`);
            $.log(`用户当前积分：${data.data.integralNum}`);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getMeetingList() {
  return new Promise(resolve => {
    $.get(taskUrl('task/listMeeting'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            for (let vo of data.data.meetingList) {
              await browseMeeting(vo['id']);
              await getMeetingPrize(vo['id']);
            }
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function browseMeeting(id) {
  return new Promise(resolve => {
    $.post(taskPostUrl('task/browseMeeting', `meetingId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.log(data.msg);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getMeetingPrize(id) {
  return new Promise(resolve => {
    $.post(taskPostUrl('task/getMeetingPrize', `meetingId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.beans += parseInt(data.data.jdNum);
            $.score += parseInt(data.data.integralNum);
            $.log(`获得${data.data.jdNum}京豆，${data.data.integralNum}积分`);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getGoodList() {
  return new Promise(resolve => {
    $.get(taskUrl('task/listGoods'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            for (let vo of data.data.goodsList) {
              await browseGood(vo['id']);
              await getGoodPrize(vo['id']);
            }
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function browseGood(id) {
  return new Promise(resolve => {
    $.get(taskUrl('task/browseGoods', `skuId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.log(data.msg);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getGoodPrize(id) {
  return new Promise(resolve => {
    $.get(taskUrl('task/getGoodsPrize', `skuId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.beans += parseInt(data.data.jdNum);
            $.score += parseInt(data.data.integralNum);
            $.log(`获得${data.data.jdNum}京豆，${data.data.integralNum}积分`);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getShopList() {
  return new Promise(resolve => {
    $.get(taskUrl('task/shopInfo'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            for (let vo of data.data) {
              await browseShop(vo['shopId']);
              await getShopPrize(vo['shopId']);
            }
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function browseShop(id) {
  return new Promise(resolve => {
    $.post(taskPostUrl('task/browseShop', `shopId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.log(data.msg);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getShopPrize(id) {
  return new Promise(resolve => {
    $.post(taskPostUrl('task/getShopPrize', `shopId=${id}`), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.beans += parseInt(data.data.jdNum);
            $.score += parseInt(data.data.integralNum);
            $.log(`获得${data.data.jdNum}京豆，${data.data.integralNum}积分`);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getHelp() {
  return new Promise(resolve => {
    $.get(taskUrl('task/getHelp'), async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data && data['code'] === 200) {
            $.shareId = data.data.shareId;
            $.log(`您的好友助力码为：${data.data.shareId}`);
          } else {
            $.log(JSON.stringify(data));
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function submitInviteId(userName) {
  return new Promise(resolve => {
    if (!$.shareId) {
      resolve();
      return;
    }
    $.post(
      {
        url: `https://api.ninesix.cc/api/jd-818/${$.shareId}/${encodeURIComponent(userName)}`,
      },
      (err, resp, _data) => {
        try {
          const { code, data = {} } = JSON.parse(_data);
          $.log(`\n邀请码提交：${code}\n${$.showLog ? _data : ''}`);
          if (data.value) {
            $.result.push('【邀请码】提交成功！');
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      },
    );
  });
}


function myRank() {
  return new Promise(resolve => {
    const options = {
      url: `${JD_API_HOST}task/myRank?t=${Date.now()}`,
      headers: {
        Host: 'rdcseason.m.jd.com',
        Accept: 'application/json, text/plain, */*',
        Connection: 'keep-alive',
        Cookie: $.currentCookie,
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'zh-cn',
        Referer: 'https://rdcseason.m.jd.com/',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    };
    $.jbeanNum = '';
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
          if (data.code === 200 && data.data.myHis) {
            for (let i = 0; i < data.data.myHis.length; i++) {
              $.date = data.data.myHis[0].date;
              if (data.data.myHis[i].status === '21') {
                await $.wait(1000);
                $.log('开始领奖');
                let res = await saveJbean(data.data.myHis[i].id);
                // $.log('领奖结果', res)
                if (res.code === 200 && res.data.rsCode === 200) {
                  $.log(`${data.data.myHis[i].date}日奖励领取成功${JSON.stringify(res.data.jbeanNum)}`);
                }
              }
              if (i === 0 && data.data.myHis[i].status === '22') {
                $.jbeanNum = data.data.myHis[i].prize;
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
  });
}

function saveJbean(id) {
  return new Promise(resolve => {
    const options = {
      url: `${JD_API_HOST}task/saveJbean`,
      body: `prizeId=${id}`,
      headers: {
        Host: 'rdcseason.m.jd.com',
        Accept: 'application/json, text/plain, */*',
        Connection: 'keep-alive',
        Cookie: $.currentCookie,
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'zh-cn',
        Referer: 'https://rdcseason.m.jd.com/',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    };
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败，${JSON.stringify(err)}`);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
  });
}

function taskUrl(function_id, body) {
  let url = `${JD_API_HOST}${function_id}?t=${new Date().getTime()}&${body}`;
  return {
    url,
    headers: {
      Cookie: $.currentCookie,
      origin: 'https://rdcseason.m.jd.com',
      referer: 'https://rdcseason.m.jd.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
    },
  };
}

function taskPostUrl(function_id, body = '') {
  let url = `${JD_API_HOST}${function_id}`;
  return {
    url,
    body: body,
    headers: {
      Cookie: $.currentCookie,
      origin: 'https://rdcseason.m.jd.com',
      referer: 'https://rdcseason.m.jd.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
    },
  };
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
