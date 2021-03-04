import re
import requests
import time
import hmac
import hashlib
import base64
import json
import os
from urllib import parse


class sendNotify:
    # =======================================微信server酱通知设置区域===========================================
    # 此处填你申请的SCKEY.
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入PUSH_KEY)
    SCKEY = readSecret("PUSH_KEY")

    # =======================================QQ酷推通知设置区域===========================================
    # 此处填你申请的SKEY(具体详见文档 https://cp.xuthus.cc/)
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入QQ_SKEY)
    QQ_SKEY = readSecret("QQ_SKEY")
    # 此处填写私聊或群组推送，默认私聊(send[私聊]、group[群聊]、wx[个微]、ww[企微]、email[邮件])
    QQ_MODE = readSecret("QQ_MODE")

    # =======================================Bark App通知设置区域===========================================
    # 此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
    # 注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_PUSH）
    BARK_PUSH = readSecret("BARK_PUSH")
    # BARK app推送铃声,铃声列表去APP查看复制填写
    # 注：此处设置github action用户填写到Settings-Secrets里面（Name输入BARK_SOUND , Value输入app提供的铃声名称，例如:birdsong）
    BARK_SOUND = readSecret("BARK_SOUND")

    # =======================================telegram机器人通知设置区域===========================================
    # 此处填你telegram bot 的Token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_BOT_TOKEN)
    TG_BOT_TOKEN = readSecret("TG_BOT_TOKEN")
    # 此处填你接收通知消息的telegram用户的id，例如：129xxx206
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入TG_USER_ID)
    TG_USER_ID = readSecret("TG_USER_ID")

    # =======================================钉钉机器人通知设置区域===========================================
    # 此处填你钉钉 bot 的webhook，例如：5a544165465465645d0f31dca676e7bd07415asdasd
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入DD_BOT_TOKEN)
    DD_BOT_TOKEN = readSecret("DD_BOT_TOKEN")
    # 密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串
    DD_BOT_SECRET = readSecret("DD_BOT_SECRET")

    # =======================================企业微信机器人通知设置区域===========================================
    # 此处填你企业微信机器人的 webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入QYWX_KEY)
    QYWX_KEY = readSecret("QYWX_KEY")

    #  =======================================企业微信应用消息通知设置区域===========================================
    # 此处填你企业微信应用消息的 值(详见文档 https://work.weixin.qq.com/api/doc/90000/90135/90236)，依次填上corpid的值,corpsecret的值,touser的值,agentid的值，素材库图片id（见https://github.com/lxk0301/jd_scripts/issues/519) 注意用,号隔开，例如：wwcff56746d9adwers,B-791548lnzXBE6_BWfxdf3kSTMJr9vFEPKAbh6WERQ,mingcheng,1000001,2COXgjH2UIfERF2zxrtUOKgQ9XklUqMdGSWLBoW_lSDAdafat
    # 增加一个选择推送消息类型，用图文消息直接填写素材库图片id的值，用卡片消息就填写0(就是数字零)
    # 注：此处设置github action用户填写到Settings-Secrets里面(Name输入QYWX_AM)
    QYWX_AM = readSecret("QYWX_AM")
    #  =======================================iGot聚合推送通知设置区域===========================================
    # 此处填您iGot的信息(推送key，例如：https://push.hellyw.com/XXXXXXXX)
    # 注：此处设置github action用户填写到Settings-Secrets里面（Name输入IGOT_PUSH_KEY）
    IGOT_PUSH_KEY = readSecret("IGOT_PUSH_KEY")
    # =======================================push+设置区域=======================================
    # 官方文档：https://pushplus.hxtrip.com/
    # PUSH_PLUS_TOKEN：微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送
    # PUSH_PLUS_USER： 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）
    PUSH_PLUS_TOKEN = readSecret("PUSH_PLUS_TOKEN")
    PUSH_PLUS_USER = readSecret("PUSH_PLUS_USER")

    def readSecret(self, key, default=""):
        if key in os.environ and not os.environ[key].strip() == '':
            return os.environ[key]
        else:
            return default

    def serverNotify(self, text, desp):
        if self.SCKEY != '':
            url = 'https://sc.ftqq.com/' + self.SCKEY + '.send'
            response = json.dumps(requests.post(
                url, data={'text': text, 'desp': desp}).json(), ensure_ascii=False)
            data = json.loads(response)
            # print(data)
            if data['errno'] == 0:
                print('\nserver酱发送通知消息成功\n')
            elif data['errno'] == 1024:
                print('\nPUSH_KEY 错误\n')
            else:
                print('\n发送通知调用API失败！！\n')
        else:
            print('\n您未提供server酱的SCKEY，取消微信推送消息通知\n')
            pass

    def pushPlusNotify(self, text, desp):
        if self.PUSH_PLUS_TOKEN != '':
            desp = re.sub('[\n\r]', '<br>', desp, 0)
            response = json.dumps(requests.post('https://pushplus.hxtrip.com/send', data={
                                  'token': self.PUSH_PLUS_TOKEN, 'title': text, 'content': desp, 'topic': self.PUSH_PLUS_USER}, headers={'Content-Type': 'application/json;charset=utf-8'}).json(), ensure_ascii=False)

    def BarkNotify(self, text, desp):
        if self.BARK_PUSH != '':
            url = self.BARK_PUSH + '/' + \
                parse.quote(text) + '/' + parse.quote(desp) + \
                '?sound=' + self.BARK_SOUND
            headers = {'Content-type': "application/x-www-form-urlencoded"}
            response = json.dumps(requests.get(
                url, headers=headers).json(), ensure_ascii=False)
            data = json.loads(response)
            # print(data)
            if data['code'] == 400:
                print('\n找不到 Key 对应的 DeviceToken\n')
            elif data['errno'] == 200:
                print('\nBark APP发送通知消息成功\n')
            else:
                print('\n发送通知调用API失败！！\n')
                print(data)
        else:
            print('\n您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知\n')
            pass

    def tgBotNotify(self, text, desp):
        if self.TG_BOT_TOKEN != '' or self.TG_USER_ID != '':

            url = 'https://api.telegram.org/bot' + self.TG_BOT_TOKEN + '/sendMessage'
            headers = {'Content-type': "application/x-www-form-urlencoded"}
            body = 'chat_id=' + self.TG_USER_ID + '&text=' + \
                parse.quote(text) + '\n\n' + parse.quote(desp) + \
                '&disable_web_page_preview=true'
            response = json.dumps(requests.post(
                url, data=body, headers=headers).json(), ensure_ascii=False)

            data = json.loads(response)
            if data['ok'] == True:
                print('\nTelegram发送通知消息完成\n')
            elif data['error_code'] == 400:
                print('\n请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
            elif data['error_code'] == 401:
                print('\nTelegram bot token 填写错误。\n')
            else:
                print('\n发送通知调用API失败！！\n')
                print(data)
        else:
            print('\n您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知\n')
            pass

    def ddBotNotify(self, text, desp):
        if self.DD_BOT_TOKEN != '':
            url = 'https://oapi.dingtalk.com/robot/send?access_token='+self.DD_BOT_TOKEN
            data = {
                "msgtype": "text",
                "text": {
                    'content': text+desp
                }
            }
            headers = {
                'Content-Type': 'application/json;charset=utf-8'
            }
            if self.DD_BOT_TOKEN != '' and self.DD_BOT_SECRET != '':
                timestamp = str(round(time.time() * 1000))
                secret_enc = self.DD_BOT_SECRET.encode('utf-8')
                string_to_sign = '{}\n{}'.format(
                    timestamp, self.DD_BOT_SECRET)
                string_to_sign_enc = string_to_sign.encode('utf-8')
                hmac_code = hmac.new(
                    secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
                sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
                url = 'https://oapi.dingtalk.com/robot/send?access_token=' + \
                    self.DD_BOT_TOKEN+'&timestamp='+timestamp+'&sign='+sign

            response = requests.post(
                url=url, data=json.dumps(data), headers=headers).text
            if json.loads(response)['errcode'] == 0:
                print('\n钉钉发送通知消息成功\n')
            else:
                print('\n发送通知失败！！\n')
        else:
            print('\n您未提供钉钉的有关数据，取消钉钉推送消息通知\n')
            pass

    def send(self, **args):
        title = args.get("title", "")
        msg = args.get("msg", "")
        self.serverNotify(title, msg)

        self.BarkNotify(title, msg)
        self.tgBotNotify(title, msg)
        self.ddBotNotify(title, msg)
