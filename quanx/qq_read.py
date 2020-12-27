#!/usr/bin/env python3
# _*_ coding:utf-8 _*_

# 此脚本参考 https://raw.githubusercontent.com/TNanko/Scripts/master/scripts/qq_read.py

import traceback
import time
import re
import json
import sys
import os
from util import send, requests_session
from datetime import datetime, timezone, timedelta
# 实例 body 和 head 都为对象
cookies1 = {
  'QQREAD_BODY': {},
  'QQREAD_TIMEURL': '',
  'QQREAD_TIMEHD': {},
  'WITHDRAW': False,
  'HOSTING_MODE': False
}
cookies2 = {}

COOKIELIST = [cookies1, ]   # 多账号准备

upload_time = 5 # 每次上传阅读时长（单位分钟）
max_read_time = 600  # 每日最大阅读时长（单位分钟）

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

def pretty_dict(dict):
    """
    格式化输出 json 或者 dict 格式的变量
    :param dict:
    :return:
    """
    return print(json.dumps(dict, indent=4, ensure_ascii=False))


def get_user_info(headers):
    """
    获取任务信息
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/user/init'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def get_daily_beans(headers):
    """
    阅豆签到
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/sign_in/user'
    try:
        response = requests_session().post(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


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
            # pretty_dict(response['data'])
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def get_today_read_time(headers):
    """
    得到今日阅读时长
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/page/config?router=%2Fpages%2Fbook-read%2Findex&options='
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        # print('今日阅读')
        # pretty_dict(response)
        if response['code'] == 0:
            return response['data']['pageParams']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def read_time_reward_tasks(headers, seconds):
    """
    阅读奖励，好像一个号只能领一次
    :param headers:
    :param seconds:
    :return:
    """
    url = f'https://mqqapi.reader.qq.com/mqq/red_packet/user/read_time_reward?seconds={seconds}'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        # print('阅读奖励')
        # pretty_dict(response)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def get_week_read_time(headers):
    """
    周阅读时长
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/v1/bookShelfInit'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        # print('周阅读时长')
        # pretty_dict(response)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def read_now(headers):
    """
    立即阅读
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/read_book'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        # pretty_dict(response)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def read_tasks(headers, seconds):
    """
    每日阅读任务
    :param headers:
    :param seconds:
    :return:
    """
    url = f'https://mqqapi.reader.qq.com/mqq/red_packet/user/read_time?seconds={seconds}'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def daily_sign(headers):
    """
    今日打卡
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/clock_in/page'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def watch_daily_sign_ads(headers):
    """
    今日打卡看广告翻倍
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/clock_in_video'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        time.sleep(3)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def watch_videos(headers):
    """
    看视频，拿金币
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/watch_video'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
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
        time.sleep(15)
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
        time.sleep(15)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def get_week_read_tasks(headers):
    """
    周阅读奖励查询
    :param headers:
    :return:
    """
    url = 'https://mqqapi.reader.qq.com/mqq/pickPackageInit'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def get_week_read_reward(headers, read_time):
    """
    领取周阅读奖励
    :param headers:
    :param read_time: 阅读时长
    :return:
    """
    url = f'https://mqqapi.reader.qq.com/mqq/pickPackage?readTime={read_time}'
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        # print(f'领取周阅读奖励({read_time})')
        # pretty_dict(response)
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def read_books(headers, book_url, upload_time):
    """
    刷时长
    :param headers:
    :return:
    """
    findtime = re.compile(r'readTime=(.*?)&read_')
    url = re.sub(findtime.findall(book_url)[0], str(
        upload_time * 60 * 1000), str(book_url))
    # url = book_url.replace('readTime=', 'readTime=' + str(upload_time))
    try:
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return True
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


def get_red_packets(headers, pn):
    """
    今日金币统计
    :param headers:
    :param pn: 金币列表序号
    :return:
    """
    try:
        url = f'https://mqqapi.reader.qq.com/mqq/red_packet/user/trans/list?pn={pn}'
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return

def get_withdraw_list(headers):
    """
    历史提现记录
    :param headers:
    :return:
    """
    try:
        url = f'https://mqqapi.reader.qq.com/mqq/red_packet/user/trans/page'
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']
        else:
            return
    except:
        print(traceback.format_exc())
        return

def get_withdraw_info(headers):
    try:
        url = 'https://mqqapi.reader.qq.com/mqq/red_packet/user/withdraw/page'
        response = requests_session().get(url=url, headers=headers, timeout=30).json()
        if response['code'] == 0:
            return response['data']['configList']
        else:
            return
    except:
        print(traceback.format_exc())
        return


def withdraw_to_wallet(headers, amount):
    try:
        url = f"https://mqqapi.reader.qq.com/mqq/red_packet/user/withdraw?amount={amount}"
        response = requests_session().post(url=url, headers=headers, timeout=30).json()
        if response['data']['code'] == 0:
            return True
        else:
            return response['data']['msg']
    except:
        print(traceback.format_exc())
        return '访问提现接口错误！'


def qq_read():
  title = f'📚企鹅读书'
  content = ''
  result = ''
  beijing_datetime = get_standard_time()
  print(f'\n【企鹅读书】{beijing_datetime.strftime("%Y-%m-%d %H:%M:%S")}\n')
  for account in COOKIELIST:
    book_url = account['QQREAD_TIMEURL']
    headers = account['QQREAD_TIMEHD']
    body = account['QQREAD_BODY']
    withdraw = account['WITHDRAW']
    hosting_mode = account['HOSTING_MODE']

    start_time = time.time()
    error_catch = 0

    # 调用 track 接口，为保证输出结果美观，输出信息写在后面
    track_result = track(headers=headers, body=body)
    # 获取用户信息（昵称）
    user_info = get_user_info(headers=headers)
    guid = re.search(r'ywguid\=(\d+)\;', headers['Cookie'])
    result += f'【账号】：{guid.group(1)}'
    # model = re.sub(r'<.*$', "", body['common']['model'])
    if user_info and user_info['user'] and user_info['isLogin'] == True:
        content += f'【用户昵称】{user_info["user"]["nickName"]}'
    else:
        send(title=title, content=f'【账号】：{guid.group(1)} Cookie已过期，请重新获取')
        continue
    # 获取任务列表，查询金币余额
    daily_tasks = get_daily_tasks(headers=headers)
    if daily_tasks:
        content += f'\n【金币余额】剩余{daily_tasks["user"]["amount"]}金币，可提现{daily_tasks["user"]["amount"] // 10000}元'
        result += f'\n【当前剩余】：{"{:4.2f}".format(daily_tasks["user"]["amount"] / 10000)}'
    # 查询今日获得金币数量
    beijing_datetime_0 = beijing_datetime.strftime(
        '%Y-%m-%d') + ' 00:00:00'
    today_coins_total = 0
    is_today_red_packet = True
    for pn in range(1, 15):
        red_packets = get_red_packets(headers=headers, pn=pn)
        if red_packets and is_today_red_packet:
            for red_packet in red_packets['list']:
                if red_packet['content'] >= beijing_datetime_0:
                    today_coins_total += red_packet['amount']
                else:
                    is_today_red_packet = False
                    break
        elif not red_packets:
            content += f'\n【今日收益】请求接口错误！'
            result += f'\n【今日收益】：请求接口错误！'
            break
        else:
            content += f"\n【今日收益】{today_coins_total}金币，约{'{:4.2f}'.format(today_coins_total / 10000)}元"
            result += f"\n【今日收益】：+{'{:4.2f}'.format(today_coins_total / 10000)}"
            break
    # 查询本周阅读时长
    week_read_time = get_week_read_time(headers=headers)
    if week_read_time:
        content += f'\n【本周阅读】{week_read_time["readTime"] // 60}小时{week_read_time["readTime"] % 60}分钟'
    # 查询今日阅读时长
    today_read_time = get_today_read_time(headers=headers)
    if today_read_time:
        content += f'\n【今日阅读】{today_read_time["todayReadSeconds"] // 3600}小时{today_read_time["todayReadSeconds"] // 60 % 60}分钟'
    # 输出任务列表中的信息
    if daily_tasks:
        content += f'\n【{daily_tasks["taskList"][0]["title"]}】{daily_tasks["taskList"][0]["amount"]}金币，{daily_tasks["taskList"][0]["actionText"]}'
        content += f'\n【{daily_tasks["taskList"][1]["title"]}】{daily_tasks["taskList"][1]["amount"]}金币，{daily_tasks["taskList"][1]["actionText"]}'
        content += f'\n【{daily_tasks["taskList"][2]["title"]}】{daily_tasks["taskList"][2]["amount"]}金币，{daily_tasks["taskList"][2]["actionText"]}'
        content += f'\n【{daily_tasks["taskList"][3]["title"]}】{daily_tasks["taskList"][3]["amount"]}金币，{daily_tasks["taskList"][3]["actionText"]}{daily_tasks["taskList"][3]["subTitle"]}'
        content += f'\n【邀请任务】{daily_tasks["invite"]["month"]}月第{daily_tasks["invite"]["issue"]}期({daily_tasks["invite"]["dayRange"]})，已邀{daily_tasks["invite"]["inviteCount"]}人，再邀请{daily_tasks["invite"]["nextInviteConfig"]["count"]}人可获{daily_tasks["invite"]["nextInviteConfig"]["amount"]}金币'
        content += f'\n【粉丝分成】已有{daily_tasks["fans"]["fansCount"]}个粉丝，今日获得分成{daily_tasks["fans"]["todayAmount"]}金币'
        content += f'\n【宝箱任务】已开{daily_tasks["treasureBox"]["count"]}个宝箱，下一个宝箱{daily_tasks["treasureBox"]["tipText"]}'

    # 每日签到
    daily_beans = get_daily_beans(headers=headers)
    if daily_beans and daily_beans['takeTicket'] > 0:
        content += f"\n【阅豆签到】获得{daily_beans['takeTicket']}阅豆"

    # 阅读奖励，好像每个账号只能领一次
    if not today_read_time['readTimeRewardTask'][len(today_read_time['readTimeRewardTask']) - 1]['doneFlag']:
        seconds = [60, 180, 360, 600, 900, 1200, 1500]
        for i in seconds:
            read_time_reward = read_time_reward_tasks(
                headers=headers, seconds=i)
            if read_time_reward:
                content += f"\n【阅读奖励】阅读{i}秒，获得金币{read_time_reward['amount']}"
                error_catch = read_time_reward['amount']

    # 立即阅读《xxx》
    if daily_tasks['taskList'][0]['enableFlag']:
        read_now_reward = read_now(headers=headers)
        if read_now_reward:
            content += f'\n【{daily_tasks["taskList"][0]["title"]}】获得{read_now_reward["amount"]}金币'
            error_catch = read_now_reward['amount']

    # 阅读任务
    if daily_tasks['taskList'][1]['enableFlag']:
        for task in daily_tasks['taskList'][1]['config']:
            if task['enableFlag'] and not task['doneFlag']:
                read_reward = read_tasks(
                    headers=headers, seconds=task['seconds'])
                if read_reward and read_reward['amount'] > 0:
                    content += f"\n【阅读任务】阅读{task['timeStr']}，获得{read_reward['amount']}金币"
                    error_catch = read_reward['amount']

    # 今日打卡
    if daily_tasks['taskList'][2]['enableFlag']:
        sign_reward = daily_sign(headers=headers)
        if sign_reward:
            content += f"\n【{daily_tasks['taskList'][2]['title']}】获得{sign_reward['todayAmount']}金币，已连续签到{sign_reward['clockInDays']}天"
        # 打卡翻倍
        if sign_reward['videoDoneFlag'] == 0:
            sign_ads_reward = watch_daily_sign_ads(headers=headers)
            if sign_ads_reward:
                content += f"\n【打卡翻倍】获得{sign_ads_reward['amount']}金币"

    # 看视频
    if daily_tasks['taskList'][3]['enableFlag']:
        finish_count = int(daily_tasks["taskList"][3]["subTitle"][1:2])
        total_count = int(daily_tasks["taskList"][3]["subTitle"][3:4])
        # for i in range(1, total_count+1):
        watch_videos_reward = watch_videos(headers=headers)
        if watch_videos_reward:
            content += f"\n【视频奖励】获得{watch_videos_reward['amount']}金币({finish_count + 1}/{total_count})"
            error_catch = watch_videos_reward['amount']

    # 周阅读时长奖励查询
    week_read_rewards = get_week_read_tasks(headers=headers)
    # 当周阅读时间 >= 最大奖励所需要的时间(1200分钟)，领取奖励
    if week_read_time['readTime'] >= week_read_rewards[len(week_read_rewards) - 1]['readTime']:
        for week_read_reward in week_read_rewards:
            if not week_read_reward['isPick']:
                reward = get_week_read_reward(
                    headers=headers, read_time=week_read_reward['readTime'])
                if reward:
                    content += f"\n【周时长奖励】领取{week_read_reward['readTime']}时长奖励成功"

    # 开宝箱领金币
    if daily_tasks['treasureBox']['doneFlag'] == 0:
        treasure_box_reward = open_treasure_box(headers=headers)
        if treasure_box_reward:
            content += f"\n【开启第{treasure_box_reward['count']}个宝箱】获得{treasure_box_reward['amount']}金币"
            error_catch = treasure_box_reward['amount']

    # 宝箱金币奖励翻倍
    daily_tasks = get_daily_tasks(headers=headers)
    if daily_tasks['treasureBox']['videoDoneFlag'] == 0:
        treasure_box_ads_reward = watch_treasure_box_ads(
            headers=headers)
        if treasure_box_ads_reward:
            content += f"\n【宝箱奖励翻倍】获得{treasure_box_ads_reward['amount']}金币"
            error_catch = treasure_box_ads_reward['amount']

    # 读书刷时长
    if max_read_time > today_read_time["todayReadSeconds"] // 60:
        read_book = read_books(
            headers=headers, book_url=book_url, upload_time=upload_time)
        if read_book:
            content += f'\n【阅读时长】成功增加{upload_time}分钟阅读时长'
    else:
        content += f'\n【阅读时长】已达到设置的对大阅读时长，故不增加阅读时长'

    # track(headers, body)的输出信息
    if track_result:
        content += f'\n【数据跟踪】跟踪成功！'
    else:
        content += f'\n【数据跟踪】跟踪失败！请重新抓取你的参数 body '

    if withdraw:
        # 获取提现信息
        withdraw_info = get_withdraw_info(headers=headers)
        transform_info = []
        if withdraw_info:
            for i in withdraw_info:
                if i['amount'] == 6000:
                    transform_info.append({
                        'amount': i['amount'],
                        'withdraw_time': 1
                    })
                elif i['amount'] == 10000 or i['amount'] == 20000:
                    withdraw_time = re.findall('\d+', i['tipText'])
                    transform_info.append({
                        'amount': i['amount'],
                        'withdraw_time': int(withdraw_time[0])
                    })
                else:
                    transform_info.append({
                        'amount': i['amount'],
                        'withdraw_time': 999
                    })

        # 提现
        if withdraw and beijing_datetime.hour == 23:
            if hosting_mode:
                # 先把0.6元提现了
                if daily_tasks["user"]["amount"] >= 6000 and transform_info[0]['amount'] == 6000 and \
                        transform_info[0]['withdraw_time'] > 0:
                    withdraw_result = withdraw_to_wallet(
                        headers=headers, amount=6000)
                    if withdraw_result == True:
                        content += f'\n【托管提现】提现0.6元成功！'
                        # 提现成功后，如果 notify 打开就发推送
                        send(title=title, content=f"【托管提现】提现0.6元成功！")
                    else:
                        content += f'\n【托管提现】提现失败！原因：{withdraw_result}'
                elif daily_tasks["user"]["amount"] >= 10000:
                    transform_info.reverse()  # 提现尝试 大额度->小额度
                    for i in transform_info:
                        if daily_tasks["user"]["amount"] >= i['amount'] and i['withdraw_time'] > 0:
                            withdraw_result = withdraw_to_wallet(
                                headers=headers, amount=i['amount'])
                            if withdraw_result == True:
                                content += f"\n【托管提现】提现{i['amount'] // 10000}元成功！"
                                send(
                                    title=title, content=f"【托管提现】提现{i['amount'] // 10000}元成功！")
                            else:
                                content += f'\n【托管提现】提现失败！原因：{withdraw_result}'
                            break
                else:
                    content += f'\n【托管提现】余额不足或低金额提现次数耗尽，无法提现！'
            else:
                if daily_tasks["user"]["amount"] >= 100000:
                    withdraw_result = withdraw_to_wallet(
                        headers=headers, amount=100000)
                    if withdraw_result == True:
                        content += f'\n【满额提现】提现10元成功！'
                        send(title=title, content=f"【满额提现】提现10元成功！")
                    else:
                        content += f'\n【满额提现】提现失败！原因：{withdraw_result}'
                else:
                    content += f'\n【满额提现】余额不足10元，未打开托管模式，不提现！'
        else:
            content += f'\n【自动提现】未到23点'
    else:
        content += f'\n【自动提现】未启用该功能'

    # 历史收益
    history_coins_total = daily_tasks["user"]["amount"]
    withdraw_list = get_withdraw_list(headers=headers)
    if withdraw_list:
        for with_draw in withdraw_list['withdrawList']:
            history_coins_total -= with_draw['amount']
        content += f"\n【历史收益】{history_coins_total}金币，约{'{:4.2f}'.format(history_coins_total / 10000)}元"
        result += f"\n【历史收益】：{'{:4.2f}'.format(history_coins_total / 10000)}\n\n"
    else:
        content += f'\n【历史收益】请求接口错误！\n'
        result += f'\n【历史收益】：请求接口错误！\n\n'

    content += f'\n🕛耗时：%.2f秒\n\n' % (time.time() - start_time)

    if error_catch == 1:
        send(title=title, content=f'【账号】：{guid.group(1)} 数据异常')

  print(content)

  # 每天 23:00 发送消息推送
  if beijing_datetime.hour == 23 and beijing_datetime.minute < 5:
      send(title=title, content=result)
  elif not beijing_datetime.hour == 23:
      print('未进行消息推送，原因：没到对应的推送时间点\n')
  else:
      print('未在规定的时间范围内\n')


def main():
    qq_read()


if __name__ == '__main__':
    main()
