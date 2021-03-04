1.群晖Docker搜索shuye,下载shuye72/jd-base

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖1.png)

2.下载完成不要启动，打开群晖File Station，在docker文件夹下创建jd_scripts文件夹，并依次创建logs、config目录用来存放日志文件，配置文件。

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖2.png)

3.打开docker，启动刚才下载的映像

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖3.png)

4.点击容器，编辑，按图设置

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖4.png)

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖5.png)

5.设置完点击保存，然后启动容器，日志如下图所示说明成功

![image](https://github.com/shuye73/MyActions/blob/main/backup/docker/群晖6.png)

6.用浏览器访问http://<ip>:5678进入控制面板，初始用户名为admin，密码为shuye72，进入后进行相应配置即可

感谢ToolXtra提供本教程，仅供参考