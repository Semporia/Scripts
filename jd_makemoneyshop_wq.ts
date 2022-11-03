/**
 * 极速版-赚钱大赢家
 * cron: 2 0,12,18 * * *
 * CK1优先助力HW.ts
 */

import {User, JDHelloWorld} from "./TS_JDHelloWorld"
import {H5ST} from "./utils/h5st_pro";

class Jd_makemoneyshop extends JDHelloWorld {
  user: User
  h5stTool: H5ST
  fp: any = undefined
  shareCodeSelf: string[] = []
  black: string[] = []

  constructor() {
    super();
  }

  async init() {
    try {
      this.fp = process.env.FP_D06F1 || ""
      if (!this.fp) this.fp = await this.getFp()
    } catch (e) {
      console.log(e.message)
    }
    await this.run(this)
  }

  async task(fn: string, body: object) {
    return await this.get(`https://wq.jd.com/newtasksys/newtasksys_front/${fn}`, {
      'Host': 'wq.jd.com',
      'user-agent': this.user.UserAgent,
      'referer': 'https://wqs.jd.com/',
      'Cookie': this.user.cookie
    }, {
      'g_ty': 'h5',
      'g_tk': '',
      'appCode': 'msc588d6d5',
      '__t': Date.now(),
      'source': 'makemoneyshop',
      'bizCode': 'makemoneyshop',
      'sceneval': '2',
      'callback': '',
      ...body
    })
  }

  async api(fn: string, _stk: string, body: object) {
    let h5st: string = await this.h5stTool.__genH5st(body)
    let text = await this.get(`https://wq.jd.com/makemoneyshop/${fn}`, {
      'Host': 'wq.jd.com',
      'Cookie': this.user.cookie,
      'user-agent': this.user.UserAgent,
      'referer': 'https://wqs.jd.com/'
    }, {
      'g_ty': 'h5',
      'g_tk': '',
      'appCode': 'msc588d6d5',
      '_ste': '1',
      'h5st': h5st,
      'sceneval': '2',
      'callback': '',
      ...body,
      '_stk': _stk
    })
    return JSON.parse(text.match(/\((.*)\)/)[1])
  }

  async main(user: User) {
    try {
      this.user = user
      this.user.UserAgent = `jdltapp;iPhone;4.2.2;Mozilla/5.0 (iPhone; CPU iPhone OS ${this.getIosVer()} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)`
      let res: any, data: any

      this.h5stTool = new H5ST('d06f1', this.user.UserAgent, this.fp, 'https://wqs.jd.com/sns/202210/20/make-money-shop/index.html', 'https://wqs.jd.com', this.user.UserName)
      await this.h5stTool.__genAlgo()

      res = await this.api('home', 'activeId', {'activeId': '63526d8f5fe613a6adb48f03'})
      if (res.code !== 0) {
        console.log('黑号')
        this.black.push(this.user.UserName)
        return
      }
      console.log('助力码', res.data.shareId)
      this.shareCodeSelf.push(res.data.shareId)

      // res = await this.task('prmt_exchange/client/exchange', {'ruleId': '1848d61655f979f8eac0dd36235586ba'})
      // this.o2s(res, 'exchange 0.3')
      // return

      res = await this.task('GetUserTaskStatusList', {})
      for (let t of res.data.userTaskStatusList) {
        if ([3538, 3539].includes(t.taskId) && t.awardStatus === 2) {
          if (t.completedTimes !== t.configTargetTimes) {
            data = await this.task('DoTask', {'isSecurity': 'true', 'taskId': t.taskId, 'configExtra': ''})
            this.o2s(data, 'DoTask')
          } else {
            data = await this.task('Award', {'taskId': t.taskId})
            this.o2s(data, 'Award')
          }
          await this.wait(3000)
        } else if (t.taskId === 3533) {
          console.log('收到助力', t.realCompletedTimes)
          for (let i = t.completedTimes; i < t.realCompletedTimes; i++) {
            data = await this.task('Award', {taskId: 3533})
            if (data.ret === 0) {
              console.log('领取助力奖励', data.data.prizeInfo * 1 / 100)
              await this.wait(1000)
            } else {
              this.o2s(data, '领取助力奖励 error')
              break
            }
          }
        }
      }


    } catch (e) {
      console.log('error', e.message)
    }
  }

  async help(users: User[]) {
    let res: any, shareCode: string[] = [], shareCodeHW: string[] = []
    for (let user of users) {
      this.user = user
      if (this.black.includes(this.user.UserName)) {
        console.log('黑号')
        continue
      }
      this.user.UserAgent = `jdltapp;iPhone;4.2.2;Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)`
      this.h5stTool = new H5ST('d06f1', this.user.UserAgent, this.fp, 'https://wqs.jd.com/sns/202210/20/make-money-shop/index.html', 'https://wqs.jd.com', this.user.UserName)
      await this.h5stTool.__genAlgo()
      this.o2s(this.shareCodeSelf, '内部助力')

      if (shareCodeHW.length === 0) {
        shareCodeHW = await this.getshareCodeHW('zqdyj')
      }
      if (user.index === 0) {
        shareCode = Array.from(new Set([...shareCodeHW, ...this.shareCodeSelf]))
      } else {
        shareCode = Array.from(new Set([...this.shareCodeSelf, ...shareCodeHW]))
      }
      try {
        for (let code of shareCode) {
          console.log(`账号${user.index + 1} ${user.UserName} 去助力 ${code}`)
          res = await this.api('querysharevenderinfo', 'activeId,shareId', {activeId: '63526d8f5fe613a6adb48f03', shareId: code})
          console.log('获取信息', res.data.guestInfo.guestErrMsg)
          if (res.data.guestInfo.guestErrMsg === '天助力次数限制') {
            break
          }
          res = await this.api('guesthelp', 'activeId,shareId', {activeId: '63526d8f5fe613a6adb48f03', shareId: code})
          console.log('助力结果', res.msg)
          await this.wait(2000)
        }
      } catch (e) {
        console.log('error', e.message)
      }
    }
  }
}

new Jd_makemoneyshop().init().then()