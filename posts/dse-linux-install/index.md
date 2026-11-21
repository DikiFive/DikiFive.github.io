<!-- canonical: https://dikifive.github.io/posts/dse-linux-install/ -->

# 迅软 DSE Linux V6.5 (x64+x86) 版本安装卸载与命令指南

<!-- markdownlint-disable MD029 -->
<!-- 本页多数命令块位于列表项之外，编号需跨代码块手动维护，故本文件关闭 MD029（其余规则照常检查）。 -->

## 一、安装前准备：内核兼容性查询与安装包下载

在执行 DSE 客户端安装前，需先确认系统内核是否兼容，并下载对应版本的安装包，避免因内核不匹配或安装包错误导致安装失败。

### 1.1 查询系统内核并验证兼容性

1. **获取当前系统内核版本**

打开 Linux 终端，执行以下命令查看当前系统内核版本（记录输出结果，如5.4.0-150-generic）：

```bash
uname -r
```

2. **验证内核兼容性**

访问[讯软DSE内核模块库](http://linuxkernel.e-docs.cn:5080/Kernel/x64+x86/kmod/)，在页面的内核模块列表中，搜索步骤 1 获取的内核版本（列表中模块文件命名格式为DSEKernelSafeCtrl-xxx.ko，其中xxx对应内核版本）：

- 若搜索到对应内核模块文件，说明内核兼容，可继续下一步；

- 若未搜索到，需先更换为列表中存在的内核版本，或联系技术支持进行内核适配。

### 1.2 下载最新安装包

确认内核兼容后，访问[讯软安装包网址](http://linuxkernel.e-docs.cn:5080/Package/linux-setup-packageV6.5%5bx64+x86%5d/)，在安装包列表中选择**最后更新时间最新**的.run格式文件（如DSEClientSetupV6.5.10818.31816.run），下载至 Linux 系统的目标路径（建议保存到~/dse/目录，方便后续安装操作）。

## 二、DSE 客户端安装与卸载

本节仅介绍**手动安装方式**（方法 2），该方式无需依赖网络实时下载脚本，适用于有安装包本地存储的场景。

### 2.1 手动安装步骤

1. **拷贝安装包至 Linux 系统**

若安装包下载至本地电脑，需通过scp命令或 U 盘等方式，将DSEClientSetup_x.x.xxxx.xx.run安装包（如DSEClientSetupV6.5.10818.31816.run）拷贝到 Linux 系统的目标路径（例：~/dse/）；若已直接下载到 Linux 系统，可跳过此步骤。

2. **切换至 root 用户**

打开终端，执行以下命令进入 root 权限（需输入 root 密码）：

```bash
su
```

或使用sudo切换（部分系统适用）：

```bash
sudo -i
```

3. **修改安装包权限**

进入安装包所在目录（以~/dse/为例），执行命令赋予安装包可执行权限：

```bash
cd ~/dse/
chmod +x DSEClientSetup_x.x.xxxx.xx.run
```

> 提示：将命令中的DSEClientSetup_x.x.xxxx.xx.run替换为实际下载的安装包文件名。

4. **运行安装程序**

执行以下命令启动安装流程：

```bash
./DSEClientSetup_x.x.xxxx.xx.run
```

安装程序会先验证安装包完整性，显示如下信息表示验证通过：

```text
Verifying archive integrity...100% MD5 checksums are ok. All good.Uncompressing DSE Linux Client Setup 100%
```

5. **内核模块与服务器配置**

- 安装程序会自动检测内核模块，显示Find kernel module for dse表示正在匹配内核，若之前已确认内核兼容，会提示输入 DSE 服务器信息；

- 按提示输入**DSE 服务器 IP 地址**和**端口**：

- 若显示 `default 172.17.18.116`，直接回车表示使用默认 IP，也可输入自定义 IP；

- 若显示[default 5558]，直接回车表示使用默认端口，也可输入自定义端口。

- 示例配置：

```text
Machine:X64
Find kernel module for dse
Please input server ip[default 172.17.18.116]:192.168.1.100  # 自定义IP
Please input server port [default 5558]:5559  # 自定义端口
```

#### 故障排除：内核模块加载失败

若内核版本已在支持列表中确认兼容，但安装过程中内核模块加载失败，这通常表示安装包缺少针对当前内核的预编译内核文件。该问题常见于WSL（Windows Subsystem for Linux）环境中，因为 WSL 内核可能未包含标准预编译模块。

在这种情况下，需手动处理：

1. **解压安装包以提取文件**

   使用以下命令将安装包解压到指定目录（无需执行安装脚本，仅提取内容）。示例（调整路径和文件名以匹配实际环境）：

   ```bash
   cd /home/dk && bash DSEClientSetupV6.5.10817.31816.run --target /tmp/dse_manual_extract --noexec 2>&1 | head -20
   ```

   此命令将安装包内容提取至 `/tmp/dse_manual_extract` 目录。`--noexec` 参数确保仅解压而不执行安装；`2>&1 | head -20` 用于捕获并限制输出日志以便调试。

2. **下载缺失内核模块**

   访问[讯软DSE内核模块库](http://linuxkernel.e-docs.cn:5080/Kernel/x64+x86/kmod/)，搜索并下载与当前内核版本匹配的模块文件（格式：DSEKernelSafeCtrl-xxx.ko，其中 xxx 为内核版本，如通过 `uname -r` 获取）。

3. **放置模块文件**

   将下载的 `.ko` 文件复制到解压目录下的 `kmod` 子目录（例如：`/tmp/dse_manual_extract/kmod/`）。确保文件权限正确（使用 `chmod 644` 设置读取权限）。

4. **手动执行安装脚本**

   进入解压目录，运行安装脚本以继续安装：

   ```bash
   cd /tmp/dse_manual_extract && ./install.sh
   ```

   安装过程将使用手动添加的内核模块。完成后，继续后续步骤（如服务器配置和 MOK 验证）。

若问题持续存在，建议检查系统日志（`dmesg | grep DSE`）或联系技术支持提供内核版本和错误详情。

6. **MOK 验证（可选）**

- 若安装过程中出现以下提示，说明系统需要 MOK（Machine Owner Key）驱动签名验证，需设置并记住 MOK 密码（重启时需验证）：

```text
Please enter and remember the MoK password, Restart requires password.input password:  # 输入密码（建议复杂度高，避免遗忘）input password again:  # 再次输入密码确认
```

- 密码设置完成后，会显示Install DSE Client Successed.。

7. **关闭内核自动升级（重要）**

> 警告：Linux 系统内核自动升级后，可能导致 DSE 内核模块加载失败，建议安装后关闭内核自动升级功能（具体方法因系统而异，如 CentOS 可通过yum-cron服务禁用，Ubuntu 可通过unattended-upgrades配置禁用）。

8. **安装完成**

显示Install DSE Client Successed. Starting DSELinuxClient Service........表示客户端安装完毕，服务已自动启动。

### 2.2 重启 DSE 客户端服务

若安装后需重启服务，可选择以下两种方法之一：

1. 使用systemctl命令：

```bash
sudo systemctl restart DSELinuxClient
```

2. 使用service命令：

```bash
sudo service DSELinuxClient restart
```

### 2.3 卸载 DSE 客户端

若需卸载客户端，执行以下命令（需 root 权限）：

```bash
sudo /usr/local/DSELinuxClient/scripts/uninstall.sh
```

---

## 三、DSE 核心命令详解

DSE 客户端通过DSEMainService命令实现配置、加密、解密等核心功能，以下是常用命令的详细说明与示例。

### 3.1 基础配置命令

#### 3.1.1 配置服务器连接与网卡

用于设置客户端连接的服务器 IP、端口，以及客户端在服务器显示的 IP 所属网卡，命令格式：

```bash
DSEMainService configure
```

- 执行后按提示输入信息：

```text
root@ubuntu:~# DSEMainService configure
Please input server ip[default 172.17.18.116]:192.168.1.100  # 服务器IP
Please input server port [default 5558]:5559  # 服务器端口
Please input network card name [default lo]:ens32  # 网卡名称（如ens32，可通过`ip addr`查看）
```

#### 3.1.2 更新控制台策略

用于同步 Windows 控制台下发的加密策略（策略下发后约 2 分钟自动更新，也可手动触发），命令格式：

```bash
DSEMainService update
```

- 成功更新后显示：

```text
root@ubuntu:~# DSEMainService update
Update policy for success. The current encrypt program number: 8  # 8表示当前加密程序数量
```

#### 3.1.3 查看客户端状态

用于查看 DSE 驱动、连接、工作模式等状态信息，命令格式：

```bash
DSEMainService status
```

- 输出信息说明：

- Drivers status: 1 = 驱动加载成功，0 = 驱动加载失败；

- Local IP: 客户端本地 IP（可通过Setting.ini的clientnic字段修改）；

- Server IP: 连接的 DSE 服务器 IP；

- Connect status: 1 = 连接服务器成功，0 = 连接失败；

- WorkState: 1 = 工作模式，0 = 个人模式；

- NetworkCtl: 1 = 启用网关控制，0 = 未启用。

- 示例输出：

```text
root@ubuntu:~# DSEMainService status
Drivers status:1Local IP:192.168.1.101Server IP:192.168.1.100Connect status:1WorkState:1NetworkCtl:1
```

#### 3.1.4 查看客户端版本

用于查看当前 DSE 客户端版本，命令格式：

```bash
DSEMainService version
```

- 示例输出：

```text
root@ubuntu:~# DSEMainService version
Linux Client Version:6.5.1080.21406
```

#### 3.1.5 查看本机机器码

用于获取客户端所在机器的唯一标识（机器码），命令格式：

```bash
DSEMainService machineid
```

- 示例输出：

```text
root@ubuntu:~# DSEMainService machineid
Machine ID:564D833C03A77181D5DE744D9B86C3B9
```

### 3.2 文件加密与解密命令

#### 3.2.1 加密文件 / 文件夹

支持加密单个文件、多个文件夹，以及指定文件类型加密，命令格式：

```bash
DSEMainService encrypt path/file -t filetypes  # -t 可选，用于指定文件类型
```

- 常见返回信息说明：

- No encrypt privilege right, file :xxx: 无加密权限，需在 Windows 控制台配置；

- Encrypt file :xxx succeeded: 文件加密成功；

- Encrypt file :xxx failed: 文件加密失败；

- Ignore the file type: xxx: 忽略该文件类型（无需加密）；

- The file is encrypted: xxx: 文件已加密；

- xxx: No such file or directory: 文件 / 目录不存在。

- 示例 1：加密单个文件（newuser.h）

```text
root@ubuntu:~/demo# DSEMainService encrypt newuser.h
start Encrypt: newuser.hEncrypt file: newuser.h succeeded.
```

- 示例 2：加密文件夹（test/）

```text
root@ubuntu:~/demo# DSEMainService encrypt test/
start Encrypt: testEncrypt file: test/findwindow.cpp succeeded.Encrypt file: test/findwindow.h succeeded.Encrypt files:2, Not encrypt files:0, Total scan files:2
```

- 示例 3：加密文件夹中指定类型文件（test/中的.cpp和.h文件）

```text
root@ubuntu:~/demo# DSEMainService encrypt test/ -t cpp h
File type:cpp;hstart Encrypt: testEncrypt file: test/modelviewdemowidget.cpp succeeded.Ignore the file type: test/QTableview.pro.user.1cdd64b.4.8-prel.Encrypt file: test/findwindow.cpp succeeded.Encrypt file: test/findwindow.h succeeded.Encrypt file: test/modelviewdemowidget.h succeeded.Ignore the file type: test/QTableview.pro.Encrypt files:4, Not encrypt files:4, Total scan files:8
```

#### 3.2.2 解密文件 / 文件夹

支持解密单个文件、多个文件夹，以及指定文件类型解密，命令格式：

```bash
DSEMainService decrypt path/file -t filetypes  # -t 可选，用于指定文件类型
```

- 常见返回信息说明（与加密类似）：

- No decrypt privilege right, file :xxx: 无解密权限，需在 Windows 控制台配置；

- Decrypt file :xxx succeeded: 文件解密成功；

- Decrypt file :xxx failed: 文件解密失败；

- The file is not encrypted: xxx: 文件未加密（无需解密）。

- 示例 1：解密单个文件（newuser.h，控制台配置了解密密码时需输入）

```text
root@ubuntu:~/demo# DSEMainService decrypt newuser.hPlease decrypt passwd:***  # 输入解密密码start Decrypt: newuser.hDecrypt file: newuser.h succeeded.
```

- 示例 2：解密文件夹中指定类型文件（test/中的.cpp和.h文件）

```text
root@ubuntu:~/demo# DSEMainService decrypt test/ -t cpp h
File type:cpp;hstart Decrypt: testIgnore the file type: test/QTableview.pro.user.1cdd64b.4.8-prel.Decrypt file: test/findwindow.cpp succeeded.Decrypt file: test/findwindow.h succeeded.Ignore the file type: test/QTableView.pro.Decrypt files:2, Not decrypt files:3, Total scan files:5
```

### 3.3 模式切换与日志命令

#### 3.3.1 切换到个人模式

个人模式下，DSE 客户端暂停加密策略管控，命令格式：

```bash
DSEMainService stopdrv
```

- 注意事项：

- 若执行后显示set work stat fail:not allow switch work state，需先在 Windows 控制台配置：**加密策略→文档基本策略→勾选 “允许工作模式与个人模式切换功能”**，保存并下发策略，再执行DSEMainService update更新策略；

- 切换成功后，执行DSEMainService status会显示WorkState:0。

- 示例：

```text
root@ubuntu:~/demo# DSEMainService stopdrv
set work stat ok
root@ubuntu:~/demo# DSEMainService status
Drivers status:1Local IP:192.168.1.101Server IP:192.168.1.100Connect status:1WorkState:0  # 已切换到个人模式NetworkCtl:1
```

#### 3.3.2 切换到工作模式

工作模式下，DSE 客户端启用加密策略管控，命令格式：

```bash
DSEMainService startdrv
```

- 注意事项：与个人模式切换类似，若提示无权限，需先在控制台配置切换权限并更新策略；

- 切换成功后，DSEMainService status会显示WorkState:1。

#### 3.3.3 开启 dmesg 日志记录

用于记录非加密进程打开加密文件的日志（调试场景使用），命令格式：

```bash
# 开启日志记录
DSEMainService trace on
# 关闭日志记录
DSEMainService trace off
```

- 示例：检测cat命令是否能自动解密加密文件（users.txt）

1. 先加密users.txt：

```text
root@ubuntu:~/demo# DSEMainService encrypt users.txt
start Encrypt: users.txtEncrypt file: users.txt succeeded.
```

2. 开启日志记录并清空历史日志：

```text
root@ubuntu:~/demo# DSEMainService trace on
set trace success.
root@ubuntu:~/demo# dmesg -C  # 清空dmesg历史日志
```

3. 使用cat查看加密文件：

```text
root@ubuntu:~/demo# cat users.txt
# 显示乱码（表示无法自动解密）
```

4. 查看日志确认结果：

```text
root@ubuntu:~/demo# dmesg | grep auto
4061.706515] DSE:Time:[UTC time:2021-3-23 3:8:48] :process name:/bin/cat,open encrypt file:/root/demo/users.txt ,not auto decrypt!
```

> 结论：cat进程无法自动解密users.txt文件。

### 3.4 其他实用命令

#### 3.4.1 检测文件加密状态

用于检查文件 / 文件夹是否已加密，命令格式：

```bash
DSEMainService check path/file -t filetypes  # -t 可选，指定文件类型
```

- 示例：

```text
# 检测已加密文件（a.c）
root@kepler:~# DSEMainService check a.c
start Check Encrypt File: a.c.Encrypt file: a.c.
```

