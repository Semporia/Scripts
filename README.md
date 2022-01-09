# jd_scripts<br>
```js
近期(始2021.10.21)将处理提交后再未助力过他人的邀请码(拉入黑名单且永不解禁！)
```
🧧部分红包会过期，记得用，在“京东极速版”或“京喜”APP上搜索“包邮”，不知道买啥选纸巾就完事了...<br>
互助码不定期清理。<br>
### 免责声明: 本仓库项目中所涉及的任何解锁和解密分析脚本，仅用于测试和学习研究，不保证其合法性，准确性，完整性和有效性，请根据情况自行判断。请勿将本项目的任何内容用于商业或非法途径，否则后果由使用者自负。如果您认为该项目的内容可能涉嫌侵犯其权利，请与我联系，我会尽快删除文件。如果您使用或复制了本仓库项目中的任何内容，则视为您已接受此免责声明。


部分脚本搜集整理自各位大佬。


### 自动互助、提交助力码（城城分现金、京喜工厂、种豆得豆、京东工厂、新财富岛、财富岛合珍珠、京东农场、京东健康、东东萌宠、闪购盲盒、5G盲盒、京喜领88元红包、锦鲤红包）<br>
__上述脚本请尽量改一下默认定时，多运行几次。__<br>

随机从数据库中选取助力码互助（建议多跑几次）


__青龙拉取__<br>
(版本小于2.10.3)
```
ql repo https://github.com/he1pu/JDHelp.git "jd_|jx_|getJDCookie" "activity|backUp|jd_delCoupon" "^jd[^_]|USER|utils"
```
(版本大于等于2.10.3)
```
ql repo https://github.com/he1pu/JDHelp.git "jd_|jx_|getJDCookie" "activity|backUp|jd_delCoupon" "^jd[^_]|USER|utils|sendNotify|ZooFaker_Necklace.js|JDJRValidator_|sign_graphics_validate"
```

__进入容器执行以下命令安装依赖__<br>

```
npm install -g png-js
npm install -g jsdom
```

[退会：JDMemberCloseAccount](https://github.com/yqchilde/JDMemberCloseAccount)<br>
[哔哩哔哩签到](https://github.com/he1pu/signin)

# Warning
### 带助力功能的脚本要使用本仓库的，其他仓库的没有适配新助力池
### iOS三件套（很多不支持）在仓库内有订阅配置文件
### Node和Docker拉取使用本仓库地址

