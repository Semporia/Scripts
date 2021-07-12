/*
如果缺少依赖：如下安装
1.进入docker容器：docker exec -it <容器id(docker ps可获取)> /bin/bash
2.npm install <要安装的库>

”<>“为替换内容
*/

const CryptoJS = require('crypto-js');
const USER_AGENT = require('./USER_AGENTS').USER_AGENT;
const axios = require('axios');
const date_fns = require('date-fns');


// console.log('时间戳：', format(new Date(), 'yyyyMMddHHmmssSSS'));

let appId=10028, fingerprint, token, enCryptMethodJD;
let cookie='', cookiesArr=[], res= '', shareCodes=[];
let homePageInfo;

let UserName, index, isLogin, nickName;

!(async () => {
    await requestAlgo();
    await requireConfig();

    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        index = i + 1;
        isLogin = true;
        nickName = '';
        await TotalBean();
        console.log(`\n开始【京东账号${index}】${nickName || UserName}\n`);

        // for (i = 0; i < 20; i++) {
        //   res = await speedUp('_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone')
        //   console.log(res)
        //   console.log('今日热气球:', res.dwTodaySpeedPeople, '/', 20)
        //   await wait(2000)
        // }

        // 任务1
        let tasks;
        /*
         tasks= await api('story/GetActTask', '_cfd_t,bizCode,dwEnv,ptag,source,strZone')
        for (let t of tasks.Data.TaskList) {
          if (t.dwCompleteNum === t.dwTargetNum && t.dwAwardStatus === 2) {
            res = await api('Award', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: t.ddwTaskId})
            if (res.ret === 0) {
              console.log(`${t.strTaskName}领奖成功:`, res.data.prizeInfo)
            }
            await wait(1000)
          }
        }
         */
        // 贝壳
        // while (1) {
        //
        //   res = await api('story/pickshell', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone', {dwType: '3'})
        //   console.log(res)
        //   await wait(1000)
        //   res = await api('story/pickshell', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone', {dwType: '2'})
        //   console.log(res)
        //   await wait(1000)
        //   res = await api('story/pickshell', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone', {dwType: '1'})
        //   console.log(res)
        //   await wait(1000)
        //   if (res.iRet !== 0) {
        //     break
        //   }
        // }

        // res = await api('story/SpecialUserOper',
        //   '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType',
        //   {strStoryId: 'stroy_1626065998453014_1', dwType: '2', triggerType: 0, ddwTriggerDay: 1626019200})
        // console.log('船到:', res)
        // await wait(31000)
        // res = await api('story/SpecialUserOper',
        //   '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType',
        //   {strStoryId: 'stroy_1626065998453014_1', dwType: '3', triggerType: 0, ddwTriggerDay: 1626019200})
        // console.log('下船:', res)

        tasks = await mainTask('GetUserTaskStatusList', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: 0});
        for (let t of tasks.data.userTaskStatusList) {
            if (t.dateType === 2) {
                // 每日任务
                if (t.awardStatus === 2 && t.completedTimes === t.targetTimes) {
                    console.log(1, t.taskName)
                    res = await mainTask('Award', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: t.taskId})
                    console.log(res)
                    if (res.ret === 0) {
                        console.log(`${t.taskName}领奖成功:`, res.data.prizeInfo)
                    }
                    await wait(2000)
                } else if (t.awardStatus === 2 && t.completedTimes < t.targetTimes && (t.orderId === 2 || t.orderId === 3)) {
                    // console.log('做任务:', t.taskId, t.taskName, t.completedTimes, t.targetTimes)
                    res = await mainTask('DoTask', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', {taskId: t.taskId, configExtra: ''})
                    console.log('做任务:', res)
                    await wait(5000)
                }
            }
        }

        for (let b of ['food', 'fun', 'shop', 'sea']) {
            res = await api('user/GetBuildInfo', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone', {strBuildIndex: b})
            console.log(`${b}升级需要:`, res.ddwNextLvlCostCoin)
            await wait(1000)
            if (res.dwCanLvlUp === 1) {
                res = await api('user/BuildLvlUp', '_cfd_t,bizCode,ddwCostCoin,dwEnv,ptag,source,strBuildIndex,strZone', {ddwCostCoin: res.ddwNextLvlCostCoin, strBuildIndex: b})
                if (res.iRet === 0) {
                    console.log(`升级成功`)
                    await wait(2000)
                }
            }
            res = await api('user/CollectCoin', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone', {strBuildIndex: b, dwType: '1'})
            console.log(`${b}收金币:`, res.ddwCoin)
            await wait(1000)
        }
    }
})()

function speedUp(stk, params = {}) {
    return new Promise(async resolve => {
        let url = `https://m.jingxi.com/jxbfd/user/SpeedUp?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&strBuildIndex=${['food', 'shop', 'sea', 'fun'][Math.floor(Math.random() * 4)]}&_ste=1&_=${Date.now()}&sceneval=2&_stk=${encodeURIComponent(stk)}`
        if (Object.keys(params).length !== 0) {
            let key;
            for (key in params) {
                if (params.hasOwnProperty(key))
                    url += `&${key}=${params[key]}`
            }
        }
        url += '&h5st=' + decrypt(stk, url)
        let {data} = await axios.get(url, {
            headers: {
                'Host': 'm.jingxi.com',
                'Referer': 'https://st.jingxi.com/',
                'User-Agent': 'jdpingou;android;4.11.0;10;b21fede89fb4bc77;network/wifi;model/M2004J7AC;appBuild/17304;partner/xiaomi;;session/535;aid/b21fede89fb4bc77;oaid/dcb5f3e835497cc3;pap/JA2019_3111789;brand/Xiaomi;eu/8313831616035373;fv/7333732616631643;Mozilla/5.0 (Linux; Android 10; M2004J7AC Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.91 Mobile Safari/537.36',
                'Cookie': cookie
            }
        })
        resolve(data)
    })
}

function api(fn, stk, params = {}) {
    return new Promise(async resolve => {
        let url = `https://m.jingxi.com/jxbfd/${fn}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_ste=1&_=${Date.now()}&sceneval=2&_stk=${encodeURIComponent(stk)}`
        if (['GetUserTaskStatusList', 'Award', 'DoTask'].includes(fn)) {
            console.log('api2')
            url = `https://m.jingxi.com/newtasksys/newtasksys_front/${fn}?strZone=jxbfd&bizCode=jxbfddch&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_stk=${encodeURIComponent(stk)}&_ste=1&_=${Date.now()}&sceneval=2`
        }
        if (Object.keys(params).length !== 0) {
            let key;
            for (key in params) {
                if (params.hasOwnProperty(key))
                    url += `&${key}=${params[key]}`
            }
        }
        url += '&h5st=' + decrypt(stk, url)
        let {data} = await axios.get(url, {
            headers: {
                'Host': 'm.jingxi.com',
                'Referer': 'https://st.jingxi.com/',
                'User-Agent': 'jdpingou;android;4.11.0;10;b21fede89fb4bc77;network/wifi;model/M2004J7AC;appBuild/17304;partner/xiaomi;;session/535;aid/b21fede89fb4bc77;oaid/dcb5f3e835497cc3;pap/JA2019_3111789;brand/Xiaomi;eu/8313831616035373;fv/7333732616631643;Mozilla/5.0 (Linux; Android 10; M2004J7AC Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.91 Mobile Safari/537.36',
                'Cookie': cookie
            }
        })
        resolve(data)
    })
}

function mainTask(fn, stk, params= {}) {
    return new Promise(async resolve => {
        let url = `https://m.jingxi.com/newtasksys/newtasksys_front/${fn}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_stk=${encodeURIComponent(stk)}&_ste=1&_=${Date.now()}&sceneval=2`
        if (Object.keys(params).length !== 0) {
            let key;
            for (key in params) {
                if (params.hasOwnProperty(key))
                    url += `&${key}=${params[key]}`
            }
        }
        url += '&h5st=' + decrypt(stk, url)
        let {data} = await axios.get(url, {
            headers: {
                'Sec-Fetch-Dest': 'script',
                'X-Proxyman-Repeated-ID': '09920498',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'X-Requested-With': 'com.jd.pingou',
                'Referer': 'https://st.jingxi.com/',
                'Host': 'm.jingxi.com',
                'User-Agent': 'jdpingou;android;4.11.0;10;b21fede89fb4bc77;network/wifi;model/M2004J7AC;appBuild/17304;partner/xiaomi;;session/535;aid/b21fede89fb4bc77;oaid/dcb5f3e835497cc3;pap/JA2019_3111789;brand/Xiaomi;eu/8313831616035373;fv/7333732616631643;Mozilla/5.0 (Linux; Android 10; M2004J7AC Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.91 Mobile Safari/537.36',
                'Sec-Fetch-Site': 'same-site',
                'Connection': 'close',
                'Sec-Fetch-Mode': 'no-cors',
                'Cookie': cookie
            }
        })
        resolve(data)
    })
}

async function requestAlgo() {
    fingerprint = await generateFp();
    return new Promise(async resolve => {
        let {data} = await axios.post('https://cactus.jd.com/request_algo?g_ty=ajax', {
            "version": "1.0",
            "fp": fingerprint,
            "appId": appId,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        }, {
            "headers": {
                'Authority': 'cactus.jd.com',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json',
                'Origin': 'https://st.jingxi.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://st.jingxi.com/',
                'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
            },
        })
        if (data['status'] === 200) {
            token = data.data.result.tk;
            let enCryptMethodJDString = data.data.result.algo;
            if (enCryptMethodJDString) enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
        } else {
            console.log(`fp: ${fingerprint}`)
            console.log('request_algo 签名参数API请求失败:')
        }
        resolve(200)
    })
}

function decrypt(stk, url) {
    const timestamp = date_fns.format(new Date(), 'yyyyMMddhhmmssSSS')
    let hash1;
    if (fingerprint && token && enCryptMethodJD) {
        hash1 = enCryptMethodJD(token, fingerprint.toString(), timestamp.toString(), appId.toString(), CryptoJS).toString(CryptoJS.enc.Hex);
    } else {
        const random = '5gkjB6SpmC9s';
        token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
        fingerprint = 9686767825751161;
        // $.fingerprint = 7811850938414161;
        const str = `${token}${fingerprint}${timestamp}${appId}${random}`;
        hash1 = CryptoJS.SHA512(str, token).toString(CryptoJS.enc.Hex);
    }
    let st = '';
    stk.split(',').map((item, index) => {
        st += `${item}:${getQueryString(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = CryptoJS.HmacSHA256(st, hash1.toString()).toString(CryptoJS.enc.Hex);
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)].join(";"))
}

function requireConfig() {
    return new Promise(resolve => {
        console.log('开始获取配置文件\n')
        const jdCookieNode = require('./jdCookie.js');
        Object.keys(jdCookieNode).forEach((item) => {
            if (jdCookieNode[item]) {
                cookiesArr.push(jdCookieNode[item])
            }
        })
        console.log(`共${cookiesArr.length}个京东账号\n`)
        resolve()
    })
}

function TotalBean() {
    return new Promise(async resolve => {
        axios.get('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion', {
            headers: {
                Host: "me-api.jd.com",
                Connection: "keep-alive",
                Cookie: cookie,
                "User-Agent": USER_AGENT,
                "Accept-Language": "zh-cn",
                "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
                "Accept-Encoding": "gzip, deflate, br"
            }
        }).then(res => {
            if (res.data) {
                let data = res.data
                if (data['retcode'] === "1001") {
                    isLogin = false; //cookie过期
                    return;
                }
                if (data['retcode'] === "0" && data['data'] && data.data.hasOwnProperty("userInfo")) {
                    nickName = data.data.userInfo.baseInfo.nickname;
                }
            } else {
                console.log('京东服务器返回空数据');
            }
        }).catch(e => {
            console.log('Error:', e)
        })
        resolve();
    })
}

function generateFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--;)
        i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0, 16)
}

function getQueryString(url, name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = url.split('?')[1].match(reg);
    if (r != null) return unescape(r[2]);
    return '';
}

function wait(t) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, t)
    })
}

