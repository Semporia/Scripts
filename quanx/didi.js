/*
 * @Author: whyour
 * @Github: https://github.com/whyour
 * @Date: 2020-11-16 20:35:13
 * @LastEditors: whyour
 * @LastEditTime: 2020-11-30 13:10:47
 */

const $ = new Env("滴滴出行");
const didiTokenKey = "didi_token";
const didiCityIdKey = "didi_city_id";
const didiLidKey = "didi_lid";
const didiMySourceIdKey = "didi_my_source_id";
const didiActivityIdKey = "didi_activity_id";
const didiChannelIdKey = "didi_channel_id";
const sourceIdConf = {
  "7mO4XP93fb84VMSC8Xk5vg%3D%3D": 7,
  "pDmWW7HoWUkNu2nmJ3HJEQ%3D%3D": 3,
};
$.cityId = $.getdata(didiCityIdKey);
$.token = $.getdata(didiTokenKey);
$.lid = $.getdata(didiLidKey);
$.channelId = $.getdata(didiChannelIdKey);
$.activityId = $.getdata(didiActivityIdKey);
$.sourceId = $.getdata(didiMySourceIdKey);
$.clientId = 1;
$.result = [];

!(async () => {
  if (!getCookies()) return;
  await checkIn();
  await collectPoint();
  await goldLottery();
  await dayLottery();
  await getOrderGold();
  await showMsg();
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function getCookies() {
  if (!$.token || !$.cityId) {
    $.msg($.name, "【提示】请先获取滴滴Token");
    return false;
  }
  return true;
}

function checkIn() {
  return new Promise((resolve) => {
    const source_id = getSourceId();
    const sourceStr = source_id ? `&share_source_id=${source_id}` : "";
    const url = `https://bosp-api.xiaojukeji.com/wechat/benefit/public/index?city_id=${
      $.cityId
    }${sourceStr}&share_date=${$.time("yyyy-MM-dd")}`;
    $.log(`当前使用的source_id：${source_id}`);
    const options = {
      url: url,
      headers: {
        "Didi-Ticket": $.token,
      },
      body: "",
    };
    $.get(options, (err, resp, data) => {
      try {
        $.log(`滴滴签到接口响应：${data}`);
        let {
          errno,
          data: { share, sign, welfare },
        } = JSON.parse(data);
        if (errno == 0) {
          if (share && share["source_id"]) {
            $.setdata(didiMySourceIdKey, share.source_id);
            $.log(`您的source_id：${share.source_id}`);
          }
          if (sign.sign) {
            let subsidy = Number(
              sign.sign.subsidy_state.subsidy_amount +
                sign.sign.subsidy_state.extra_subsidy_amount
            );
            $.result.push(
              `🚕[签到] 签到成功！获得${subsidy}福利金！账户共${welfare.balance}福利金`
            );
          } else {
            $.result.push(
              `🚕[签到] 今天已经签到过了。账户共${welfare.balance}福利金`
            );
          }
        } else {
          $.result.push(`🚕[签到] 签到失败，${obj.errmsg}`);
        }
      } catch (err) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

// 随机获取SourceId
function getSourceId() {
  let mySourceId = $.getdata(didiMySourceIdKey);
  if (!!mySourceId) {
    delete sourceIdConf[mySourceId];
  }
  sourceIdList = Object.keys(sourceIdConf);
  let newSourceIdList = [];
  for (sourceId in sourceIdConf) {
    let sourceIdArray = new Array(sourceIdConf[sourceId]).fill(sourceId);
    newSourceIdList = newSourceIdList.concat(sourceIdArray);
  }
  return newSourceIdList[
    Math.round(Math.random() * (newSourceIdList.length - 1))
  ];
}

function collectPoint() {
  return new Promise((resolve) => {
    let options = {
      url: `https://quartz.xiaojukeji.com/volcano/quartz/points/collect?ts=${new Date().getTime()}`,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        Connection: "keep-alive",
        "Content-Length": "238",
        "Content-Type": "application/x-www-form-urlencoded",
        Host: "quartz.xiaojukeji.com",
        Origin: "https://page.udache.com",
        Referer: "https://page.udache.com/activity/apps/gain-points/index.html",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 didi.passenger/6.0.12 FusionKit/1.2.14",
      },
      body: `app_id=common&token=${$.token}`,
    };
    $.post(options, async (err, resp, data) => {
      try {
        $.log(`领取积分接口响应：${data}`);
        let obj = JSON.parse(data);
        const {
          account: {
            dcoin: { coin, expire_balance, expire_date },
          },
        } = await getUserInfo();
        if (obj.errno === 0) {
          $.result.push(
            `🚕[积分] 领取成功, 账户共有积分${coin}\n${expire_balance}积分在${expire_date}过期`
          );
        } else {
          $.result.push(
            `🚕[积分] 领取失败, 账户共有积分${coin}\n${expire_balance}积分在${expire_date}过期`
          );
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

// 福利金抽奖
function goldLottery() {
  return new Promise(async (resolve) => {
    if ($.lid) {
      const drawCount = await getDrawAmount();
      if (drawCount > 0) {
        for (let i = 0; i < drawCount; i++) {
          await $.wait(5000);
          await lotteryDraw(i);
        }
      }
    } else {
      resolve();
    }
  });
}

function getDrawAmount() {
  return new Promise((resolve) => {
    let url = `https://bosp-api.xiaojukeji.com/bosp-api/lottery/info?lid=${$.lid}&token=${$.token}&lucky_users=0`;
    $.get(url, (err, resp, data) => {
      try {
        $.log(`福利金抽奖，接口响应：${data}`);
        let obj = JSON.parse(data);
        if (obj.code == 0) {
          $.log(`福利金抽奖次数：${obj.data.eliminate_info.base_share_amount}`);
          $.result.push(
            `🚕[福利金抽奖] 次数：${obj.data.eliminate_info.base_share_amount}`
          );
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function lotteryDraw(index) {
  return new Promise((resolve) => {
    let url = `https://bosp-api.xiaojukeji.com/bosp-api/lottery/draw?lid=${$.lid}&token=${$.token}`;
    $.get(url, (err, resp, data) => {
      try {
        $.log(`福利金抽奖，接口响应：${data}`);
        let obj = JSON.parse(data);
        if (obj.code === 0) {
          $.result.push(`🚕[福利金抽奖] 第${index}次：${obj.data.prize.name}`);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

// 天天有奖
function dayLottery() {
  return new Promise((resolve) => {
    if ($.channelId && $.activityId) {
      let options = {
        url:
          "https://manhattan.webapp.xiaojukeji.com/marvel/api/manhattan-signin-task/signIn/execute",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: $.token,
          channelId: $.channelId,
          activityId: $.activityId,
          clientId: $.clientId,
        }),
      };
      $.post(options, (err, resp, data) => {
        try {
          $.log(`天天有奖，接口响应：${data}`);
          const obj = JSON.parse(data);
          if (obj.errorCode === 0) {
            obj.data.giftDetail.forEach((gift) => {
              $.log(
                `天天有奖签到结果：${gift.displayJson.displayName} ${gift.displayValue} ${gift.displayUnit}`
              );
              $.result.push(
                `🚕[天天有奖] ${gift.displayJson.displayName} ${gift.displayValue} ${gift.displayUnit} 过期 ${gift.giftEndDate}`
              );
            });
          }
          // else if (obj.errorCode === 500000 && obj.errorMsg === "断签") {
          // await DailyLotteryRestart(token, activityId, clientId);
          // }
          else {
            $.log(`天天有奖签到失败，${obj.errorMsg}`);
            $.result.push(`🚕[天天有奖] 签到失败，${obj.errorMsg}`);
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

// 领取福利金
function getOrderGold() {
  return new Promise(async (resolve) => {
    let orderList = await getOrderList();
    if (orderList.length === 0) {
      $.result.push(`🚕[订单福利金] 今天没有忘记领取的福利金`);
      resolve();
    }
    let rewardList = [];
    let total = 0;
    orderList.forEach((element) => {
      total += Number(element.bonus_info.amount);
      rewardList.push(getRewards(element.oid));
    });

    await Promise.all(rewardList);

    $.result.push(`🚕[订单福利金] 捡回遗忘的福利金 ${total}。`);
    resolve();
  });
}

function getOrderList() {
  return new Promise((resolve) => {
    let url = `https://api.udache.com/gulfstream/passenger/v2/other/pListReward?token=${$.token}`;
    $.get({ url }, (err, resp, data) => {
      $.log(`获取待领取的福利金，接口响应：${data}`);
      try {
        let obj = JSON.parse(data);
        if (obj.errno == 0) {
          resolve(obj.data || []);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve([]);
      }
    });
  });
}

function getRewards(orderId) {
  return new Promise((resolve) => {
    let url = `https://api.udache.com/gulfstream/passenger/v2/otherpGetRewards?order_id=${orderId}&token=${$.token}`;
    $.get(url, (err, resp, data) => {
      $.log(`领取福利金，接口响应：${data}`);
      resolve();
    });
  });
}

function getUserInfo() {
  return new Promise((resolve) => {
    let url = `https://quartz.xiaojukeji.com/volcano/quartz/user/info?ts=${new Date().getTime()}&app_id=common&token=${
      $.token
    }&source_id=wdcn_1000&partition_id=1007`;
    $.get({ url }, (err, resp, data) => {
      $.log(`获取用户信息，接口响应：${data}`);
      try {
        let obj = JSON.parse(data);
        if (obj.errno === 0) {
          resolve(obj.data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function showMsg() {
  return new Promise((resolve) => {
    $.msg($.name, "", $.result.join("\n"));
    resolve();
  });
}

// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
