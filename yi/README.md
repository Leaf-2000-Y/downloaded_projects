# 视频无水印下载小程序

基于 media-parser 开源项目的视频无水印下载微信小程序。

## 项目结构

```
douyin-miniprogram/
├── media-parser/              # 开源解析后端（已克隆）
├── proxy-server/              # 代理服务器（解决小程序域名限制）
│   ├── server.js              # Express 代理服务
│   ├── package.json
│   ├── Dockerfile
│   └── .env                   # 配置文件
├── miniprogram/               # 微信小程序前端
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── pages/
│   │   ├── index/             # 首页（输入链接）
│   │   └── result/            # 结果页（预览和下载）
│   ├── utils/
│   │   ├── api.js             # API 请求封装
│   │   └── download.js        # 下载工具
│   └── project.config.json
└── README.md
```

## 快速开始

### 1. 启动 media-parser 后端

```bash
cd media-parser
docker-compose up -d --build

# 服务运行在 http://localhost:8051
```

### 2. 启动代理服务器

```bash
cd proxy-server

# 安装依赖
npm install

# 配置 .env（修改 MEDIA_PARSER_URL 为你的 media-parser 地址）
# MEDIA_PARSER_URL=http://localhost:8051

# 启动服务
npm start

# 服务运行在 http://localhost:3000
```

### 3. 配置小程序

1. 用微信开发者工具打开 `miniprogram/` 目录
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 修改 `app.js` 中的 `apiBaseUrl` 为你的代理服务器地址

### 4. 部署（可选）

#### 代理服务器部署

```bash
# Docker 部署
cd proxy-server
docker build -t media-parser-proxy .
docker run -d -p 3000:3000 --name proxy media-parser-proxy
```

#### 使用云服务器

1. 购买云服务器（推荐腾讯云/阿里云）
2. 安装 Docker
3. 部署 media-parser 和 proxy-server
4. 配置域名和 SSL 证书
5. 在微信小程序后台配置服务器域名

## 功能特性

- ✅ 支持 20+ 平台（抖音、快手、小红书、B站等）
- ✅ 无水印视频下载
- ✅ 视频预览播放
- ✅ 图集保存
- ✅ 历史记录
- ✅ 剪贴板自动识别
- ✅ 保存到相册

## 配置说明

### proxy-server/.env

```env
# 代理服务器端口
PORT=3000

# media-parser 后端地址
MEDIA_PARSER_URL=http://localhost:8051
```

### 微信小程序后台配置

在微信小程序后台 -> 开发管理 -> 开发设置 -> 服务器域名中添加：

- request 合法域名：`https://your-proxy-domain.com`

## 注意事项

1. **域名要求**：小程序正式版需要使用已备案的 HTTPS 域名
2. **Cookie 维护**：部分平台需要有效的 Cookie，需定期更新
3. **法律合规**：仅供个人学习使用，请勿用于商业用途
4. **并发限制**：建议配置请求频率限制，避免被封 IP

## 技术栈

- **后端解析**：media-parser (Python/Flask)
- **代理服务器**：Node.js/Express
- **小程序前端**：微信小程序原生开发
- **部署**：Docker

## 开源协议

本项目基于 media-parser 开源项目，遵循 MIT 协议。
