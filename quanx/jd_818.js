/*
 特别声明：
 本脚本搬运自 https://gitee.com/lxk0301/jd_scripts/blob/master/jd_5g.js
 * @Author: lxk0301
 * @Github: https://github.com/whyour
 * @Date: 2021-01-30 20:00:00
 * @LastEditors: whyour
 * @LastEditTime: 2021-01-30 20:44:38
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
        message += '活动太火爆了，快去买买买吧\n';
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
    message += `本次运行获得${$.beans}京豆，${$.score}积分`;
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve();
  });
}

function createAssistUser() {
  return new Promise(resolve => {
    $.get({ url: `https://api.ninesix.cc/api/jx-nc?active=${$.info.active}` }, async (err, resp, _data) => {
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
            message += `用户当前积分：${data.data.integralNum}\n`;
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
        url: `https://api.ninesix.cc/api/jd-5g/${$.shareId}/${encodeURIComponent(userName)}`,
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
        Cookie: cookie,
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
        Cookie: cookie,
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
      Cookie: cookie,
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
      Cookie: cookie,
      origin: 'https://rdcseason.m.jd.com',
      referer: 'https://rdcseason.m.jd.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1',
    },
  };
}
