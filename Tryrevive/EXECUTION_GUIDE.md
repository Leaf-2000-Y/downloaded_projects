# Tryrevive 爆款复刻助手系统执行与调试指南 (06-28-26)

本指南针对 **Tryrevive (爆款视频复刻助手 / 禅意空间自律桌宠)** 项目的交互循环机制、API 规范及本地启动测试进行系统性解构，为后续复刻与二次开发提供一键式执行参考。

---

## 🧭 一、 系统架构与双脑循环网络 (Loop Mechanism)

Tryrevive 采用 **网页自律空间 (H5 SPA) -> 本地中转网关 (Python Flask) -> 桌面动画挂件 (PyQt6 Crayon Pet)** 的三维闭环架构：

```
+-----------------------------------+
|       Tryrevive H5 禅定空间       |
|    (主导: 呼吸冥想、超时设防)     |
+-----------------------------------+
                  |
             (HTTP POST)
                  v
+-----------------------------------+
|      localhost:5678 (Bridge)      | <--- RESTful API (CORS 允许 file:// 访问)
+-----------------------------------+
                  |
             (HTTP GET)
                  v
+-----------------------------------+
|      PyQt6 Crayon Desktop Pet     | <--- 轮询并覆盖 native 窗口检测状态
|      (Black / Gray / White)       |
+-----------------------------------+
```

### 1. 状态映射与动作转换矩阵
当前系统包含三种全局专注状态，其数据流绑定转换如下：

| 全局状态 | H5 状态名称 | 对应桌宠动作 | 转换触发场景 | HSL 视觉颜色 |
| :--- | :--- | :--- | :--- | :--- |
| **Black** | `black` | `cry` (痛哭/爬行) | 用户点击外链进入娱乐站点，超时后被防线拦截 | 宁静暗色背景 + 红色发光 |
| **Gray** | `gray` | `walk` (摇摆步态) | 用户重置状态，回到 H5 首页或正常进行心流冥想 | 柔和灰色 + 粉色漫反射 |
| **White** | `white` | `jump` (招手/跳跃) | 用户完成一轮 5 分钟箱式呼吸，心流能量蓄满 | 优雅灰白 + 温暖浅棕发光 |

---

## ⚡ 二、 本地启动与端到端调试指引

你可以随时在终端运行以下步骤来检查和调试整个自律网络：

### 1. 启动本地 Flask 桥接服务
运行桥接网关，接收来自 H5 页面的状态推送：
```bash
# 激活项目虚拟环境并运行
.venv/bin/python Tryrevive/pet_server.py
```
*服务默认监听在：`http://127.0.0.1:5678`，会自动生成 `.pet.pid` 文件记录运行状态。*

### 2. 通过 Web 仪表盘或 API 启动桌宠
你可以发送一个 POST 动作指令让桥接服务自动拉起 `desktop_pet.py`：
```bash
curl -X POST -H "Content-Type: application/json" -d '{"action": "start", "pet": "desktop_pet.py"}' http://127.0.0.1:5678/api/toggle
```

### 3. 验证 H5 状态同步 API
通过向 `/api/state` 发送请求，可以手动控制桌面宠物的行为：
*   **模拟进入 Black 状态 (偏航警告)**：
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"state": "black", "action": "cry"}' http://127.0.0.1:5678/api/state
    ```
*   **模拟进入 White 状态 (心流满溢)**：
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"state": "white", "action": "jump"}' http://127.0.0.1:5678/api/state
    ```
*   **获取当前桥接状态**：
    ```bash
    curl http://127.0.0.1:5678/api/pet-state
    ```

---

## 🚀 三、 核心代码设计规范 (Best Practices)

### 1. 跨域安全策略 (CORS) Invariant
由于用户可能直接双击 `index.html` 以 `file://` 协议打开网页，在 `pet_server.py` 中必须放行所有 Origin：
```python
def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    super().end_headers()
```

### 2. 线程安全队列机制
在桌宠 GUI 主线程中，切忌直接在多线程内操纵窗口动画。桌宠后台轮询线程通过 `urllib.request` 访问 `/api/pet-state` 获取 H5 重写状态，并存入状态变量中，由桌宠主循环安全渲染。

### 3. 极简呼吸感视觉 (Anti-Slop Design)
*   **布局约束**：主页排版版芯限定在 `max-width: 65ch` (约 550px - 600px) 以内，防止用户在宽屏显示器上视线发散。
*   **物理缓动曲线**：所有的弹出框、切换视图动画必须使用物理阻尼三次贝塞尔曲线：
    ```css
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    ```
