# Docker2 V3 gitee库使用教程（注意，如果你不看此教程进群提问教程里面的内容会触发屏蔽操作！！！）

## ！！！阅读须知！！！
1. 此教程虽然本着0基础搭建的宗旨，但是如果你没有一定的学习能力，或者不想去掌握一些常用的docker基础命令，再或者你甚至懒得打开某度去了解什么是docker，那么我建议你关掉教程页面转为github action
2. 在阅读此教程之前请确保你有相应的设备支持
3. 此教程所提供的方案源码为@EvineDeng编写而成能够做到每天自动运行，自动更新
[如果你是群晖那么请看此处](Docker群晖.md)

## 教程主体
1.安装docker (已经安装的跳至第2步)
	
	sudo yum check-update
	curl -fsSL https://get.docker.com/ | sh
	sudo systemctl start docker
	sudo systemctl status docker
	sudo systemctl enable docker 
注①：此处强烈建议顺便安装`Portainer`(一款可视化容器管理工具)如果你不清楚什么是`Portainer`，那么我建议你回看阅读须知第一条

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/Portainer.png)

2.既然是0基础那么你肯定是第一次安装docker，所以这一步你并不需要清除原有的容器，如果你之前有在用容器，那么建议你安装`Portainer`手动删除容器以及镜像重新拉取安装

3.创建容器

	docker run -dit \
	-v /你想存放的路径/jd/config:/jd/config `# 配置保存目录，冒号左边请修改为你想存放的路径`\
	-v /你想存放的路径/jd/log:/jd/log `# 日志保存目录，冒号左边请修改为你想存放的路径` \
	-v /你想存放的路径/jd/scripts:/jd/scripts  `# 脚本文件目录，映射脚本文件到安装路径` \
    -p 5678:5678 \
	--name jd \
	--hostname jd \
	--restart always \
	shuye72/jd-base:gitee

注②：如果是旁路由，建议用`--network host \`代替`-p 5678:5678 \`这一行，此时控制面板为`http://<ip>:5678`

4.多容器示例

	docker run -dit \
	-v /你想存放的路径/jd1/config:/jd/config `# 配置保存目录，冒号左边请修改为你想存放的路径`\
	-v /你想存放的路径/jd1/log:/jd/log `# 日志保存目录，冒号左边请修改为你想存放的路径` \
	-v /你想存放的路径/jd/scripts:/jd/scripts  `# 脚本文件目录，映射脚本文件到安装路径` \
    -p 5679:5678 \
	--name jd1 \
	--hostname jd1 \
	--restart always \
	shuye72/jd-base:gitee

注③：如果是旁路由，建议用`--network host \`代替`-p 5679:5678 \`这一行，此时控制面板为`http://<ip>:5679`

注④：容器本身默认会在启动时自动启动挂机程序（就一个jd_crazy_joy_coin），如不想自动启动，请增加一行 `-e ENABLE_HANGUP=false \`。

注⑤：容器本身默认会在启动时自动启动控制面板，如不想自动启动，请增加一行 `-e ENABLE_WEB_PANEL=false \` 。

注⑥：群晖和威联通用户，以及其他非root用户的，请在ssh登陆后，切换为root用户再运行： `sudo -i`

5.自动更新Docker容器（除群晖之外，建议安装，能够自动同步我的docker镜像）
安装`containrrr/watchtower`可以自动更新容器

    docker run -d \
    --name watchtower \
    --restart unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower -c \
    --schedule "0 3 * * * *" \
    jd

### 注意：
1. 请在创建后使用`docker logs -f jd`查看创建日志，直到出现容器启动成功…字样才代表启动成功（不是以此结束的请更新镜像），按`Ctrl+C`退出查看日志。

   ![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/success.png)

2. 访问 `http://<ip>:5678` （ip是指你Docker宿主机的局域网ip），初始用户名： `admin` ，初始密码： `shuye72` ，请登陆后务必修改密码，并在线编辑`config.sh` 和 `crontab.list` ，其中 `config.sh` 可以对比修改，如何修改请仔细阅读各文件注释。如未启用控制面板自动启动功能，请运行 `docker exec -it jd node /jd/panel/server.js` 来启动，使用完控制面板后Ctrl+C 即可结束进程。如无法访问，请从防火墙、端口转发、网络方面着手解决。实在无法访问，就使用winscp工具sftp连接进行修改。

3. 只有Cookie是必填项，其他根据你自己需要填。编辑好后，如果需要启动挂机程序（目前只有一个疯狂的JOY需要挂机），请重启容器： `docker restart jd `。在创建容器前`config.sh`中就有有效Cookie的，无需重启容器。

4. 如何重置控制面板用户名和密码

   `docker exec -it jd bash jd resetpwd`

### 手动运行脚本


   `docker exec -it jd bash git_pull` 手动 git pull 更新脚本

   `docker exec -it jd bash rm_log`#手动删除指定时间以前的旧日志

   `docker exec jd bash jd xxx` # 手动执行某个脚本，如果设置了随机延迟并且当时时间不在0-2、30-31、59分内，将随机延迟一定秒数
   
   `docker exec jd bash jd xxx now`# 手动执行某个脚本，无论是否设置了随机延迟，均立即运行

如测试下京豆变动通知脚本

   `docker exec jd bash jd jd_bean_change now`
