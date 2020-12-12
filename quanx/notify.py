#!/usr/bin/env python3
# _*_ coding:utf-8 _*_

import sys
import os
cur_path = os.path.abspath(os.path.dirname(__file__))
root_path = os.path.split(cur_path)[0]
sys.path.append(root_path)
import requests
import json
import traceback
import time
import hmac
import hashlib
import base64
import urllib.parse

# 通知服务
BARK = ''                   # bark服务,自行搜索; secrets可填;形如jfjqxDx3xxxxxxxxSaK的字符串
SCKEY = ''                  # Server酱的SCKEY; secrets可填
TG_BOT_TOKEN = ''           # tg机器人的TG_BOT_TOKEN; secrets可填
TG_USER_ID = ''             # tg机器人的TG_USER_ID; secrets可填
TG_PROXY_IP = ''            # tg机器人的TG_PROXY_IP; secrets可填
TG_PROXY_PORT = '' # tg机器人的TG_PROXY_PORT; secrets可填
BARK_MACHINE_CODE = ''
DD_BOT_ACCESS_TOKEN = ''
DD_BOT_SECRET = ''

def bark(bark_machine_code, title, content):
    print("\n")
    if not BARK_MACHINE_CODE:
        print("bark服务的bark_token未设置!!\n取消推送")
        return
    print("bark服务启动")
    response = requests.get(
        f"""https://api.day.app/{BARK_MACHINE_CODE}/{title}/{content}""").json()
    if response['code'] == 200:
        print('推送成功！')
    else:
        print('推送失败！')

def telegram_bot(title, content):
    print("\n")
    bot_token = TG_BOT_TOKEN
    user_id = TG_USER_ID
    if not bot_token or not user_id:
        print("tg服务的bot_token或者user_id未设置!!\n取消推送")
        return
    print("tg服务启动")
    url=f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    payload = {'chat_id': str(TG_USER_ID), 'text': f'{title}\n\n{content}', 'disable_web_page_preview': 'true'}
    proxyStr = "http://{}:{}".format(TG_PROXY_IP, TG_PROXY_PORT)
    proxies = {"http": proxyStr, "https": proxyStr }
    response = requests.post(url=url,headers=headers, params=payload,proxies=proxies).json()
    if response['ok']:
        print('推送成功！')
    else:
        print('推送失败！')

def dingding_bot(title, content):
    timestamp = str(round(time.time() * 1000))  # 时间戳
    secret_enc = DD_BOT_SECRET.encode('utf-8')
    string_to_sign = '{}\n{}'.format(timestamp, DD_BOT_SECRET)
    string_to_sign_enc = string_to_sign.encode('utf-8')
    hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
    sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))  # 签名
    print('开始使用 钉钉机器人 推送消息...', end='')
    url = f'https://oapi.dingtalk.com/robot/send?access_token={DD_BOT_ACCESS_TOKEN}&timestamp={timestamp}&sign={sign}'
    headers = {'Content-Type': 'application/json;charset=utf-8'}
    data = {
        'msgtype': 'text',
        'text': {'content': f'{title}\n\n{content}'}
    }
    response = requests.post(url=url, data=json.dumps(data), headers=headers, timeout=15).json()
    if not response['errcode']:
        print('推送成功！')
    else:
        print('推送失败！')

def send(title, content, notify_mode):
    """
    使用 bark, telegram bot, dingding bot, serverJ 发送手机推送
    :param title:
    :param content:
    :return:
    """
    for i in notify_mode:
        if i == 'bark':
            if BARK_MACHINE_CODE:
                bark(title=title, content=content)
            else:
                print('未启用 bark')
            continue
        elif i == 'dingding_bot':
            if DD_BOT_ACCESS_TOKEN and DD_BOT_SECRET:
                dingding_bot(title=title, content=content)
            else:
                print('未启用 钉钉机器人')
            continue
        elif i == 'telegram_bot':
            if TG_BOT_TOKEN and TG_USER_ID:
                telegram_bot(title=title, content=content)
            else:
                print('未启用 telegram机器人')
            continue
        else:
            print('此类推送方式不存在')


def main():
    send('title', 'content', notify_mode=['bark'])


if __name__ == '__main__':
    main()
