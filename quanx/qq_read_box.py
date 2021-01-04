#!/usr/bin/env python3
# _*_ coding:utf-8 _*_

import traceback
import time
import re
import json
import sys
import os
import math
from util import send, requests_session
from datetime import datetime, timezone, timedelta
from concurrent.futures import ProcessPoolExecutor

# 实例 body 和 head 都为对象
cookies1 = {
  'QQREAD_BODY': {},
  'QQREAD_TIMEHD': {}
}
cookies2 = {}

COOKIELIST = [cookies1,]  # 多账号准备

# ac读取环境变量
if "QQREAD_BODY1" in os.environ:
    print("执行自GitHub action")
    COOKIELIST = []
    for i in range(5):
        headerVar = f'QQREAD_TIMEHD{str(i+1)}'
        readBodyVar = f'QQREAD_BODY{str(i+1)}'
        if headerVar in os.environ and os.environ[headerVar] and readBodyVar in os.environ and os.environ[readBodyVar]:
            globals()['cookies'+str(i + 1)]["QQREAD_TIMEHD"] = json.loads(os.environ[headerVar])
            globals()['cookies'+str(i + 1)]["QQREAD_BODY"] = json.loads(os.environ[readBodyVar])
            COOKIELIST.append(globals()['cookies'+str(i + 1)])

cur_path = os.path.abspath(os.path.dirname(__file__))
root_path = os.path.split(cur_path)[0]
sys.path.append(root_path)

def get_standard_time():
    """
    获取utc时间和北京时间
    :return:
    """
    # <class 'datetime.datetime'>
    utc_datetime = datetime.utcnow().replace(tzinfo=timezone.utc)  # utc时间
    beijing_datetime = utc_datetime.astimezone(timezone(timedelta(hours=8)))  # 北京时间
    return beijing_datetime

def get_daily_tasks(headers):
    """
    获取今日任务列表
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/page?fromGuid='
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            # print('获取今日任务')
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def open_treasure_box(headers):
    """
    每20分钟开一次宝箱
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/treasure_box'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return

def watch_treasure_box_ads(headers):
    """
    看广告，宝箱奖励翻倍
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/treasure_box_video'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return

def track(headers, body):
    """
    数据追踪，解决1金币问题
    :param headers:
    :param body:
    :return:
    """
    try:
        url = 'https://mqqapi.reader.qq.com/log/v4/mqq/track'
        timestamp = re.compile(r'"dis": (.*?),')
        body = json.dumps(body)
        body = re.sub(timestamp.findall(body)[0], str(
            int(time.time() * 1000)), str(body))
        response = requests_session().post(
            url=url, headers=headers, data=body, timeout=30).json()
        if response['code'] == 0:
            return True
        else:
            return
    except:
        print(traceback.format_exc())
        return

def account_read(account):
    title = '📚企鹅读书'
    beijing_datetime = get_standard_time()

    headers = account['QQREAD_TIMEHD']
    body = account['QQREAD_BODY']

    guid = re.search(r'ywguid\=(\d+)\;', headers['Cookie'])
    content = f'【账号】：{guid.group(1)}'
    result = f'【账号】：{guid.group(1)}'
    error_catch = 0
    if beijing_datetime.hour == 0:
        track_result = track(headers=headers, body=body)
        if track_result:
            content += f'\n【数据跟踪】跟踪成功！'
        else:
            content += f'\n【数据跟踪】跟踪失败！请重新抓取你的参数 body '

    # 获取任务列表，查询金币余额
    daily_tasks = get_daily_tasks(headers=headers)
    boxTimeInterval = daily_tasks['treasureBox']['timeInterval']
    # 开宝箱领金币
    if boxTimeInterval <= 10000:
        print(f"等待{math.ceil(boxTimeInterval / 1000)}秒，开启宝箱")
        time.sleep(math.ceil(boxTimeInterval / 1000))
        treasure_box_reward = open_treasure_box(headers=headers)
        if treasure_box_reward:
            content += f"\n【开启第{treasure_box_reward['count']}个宝箱】获得{treasure_box_reward['amount']}金币"
            error_catch = treasure_box_reward['amount']

    # 宝箱金币奖励翻倍
    doubleBoxTimeInterval = boxTimeInterval - 600000
    if doubleBoxTimeInterval < 0:
        doubleBoxTimeInterval = 0
    if doubleBoxTimeInterval <= 10000:
        print(f"等待{math.ceil(doubleBoxTimeInterval/ 1000)}秒，开启宝箱")
        time.sleep(math.ceil(doubleBoxTimeInterval / 1000))
        treasure_box_ads_reward = watch_treasure_box_ads(
            headers=headers)
        if treasure_box_ads_reward:
            content += f"\n【宝箱奖励翻倍】获得{treasure_box_ads_reward['amount']}金币"
            error_catch = treasure_box_ads_reward['amount']

    if error_catch == 1:
        send(title=title, content=f'【账号】：{guid.group(1)} 数据异常')

    # 输出任务列表中的信息
    if daily_tasks:
        content += f'\n【宝箱任务】已开{daily_tasks["treasureBox"]["count"]}个宝箱，下一个宝箱{daily_tasks["treasureBox"]["tipText"]}\n\n'
        result += f'\n【宝箱任务】：已开{daily_tasks["treasureBox"]["count"]}个宝箱\n\n'

    print(content)
    return result

def qq_read_box():
    title = f'📚企鹅读书'
    result = ''
    beijing_datetime = get_standard_time()
    obj_l=[]
    print(f'\n【企鹅读书】{beijing_datetime.strftime("%Y-%m-%d %H:%M:%S")}\n')
    with ProcessPoolExecutor(max_workers=5) as executor:
      for i in range(0, len(COOKIELIST)):
        obj = executor.submit(account_read, COOKIELIST[i])
        obj_l.append(obj)
      executor.shutdown(wait=True)

    for future in obj_l:
      result += future.result()

    # 每天 23:00 发送消息推送
    if beijing_datetime.hour == 23 and beijing_datetime.minute < 5:
        send(title=title, content=result)
    elif not beijing_datetime.hour == 23:
        print('未进行消息推送，原因：没到对应的推送时间点\n')
    else:
        print('未在规定的时间范围内\n')


def main():
    qq_read_box()


if __name__ == '__main__':
    main()
