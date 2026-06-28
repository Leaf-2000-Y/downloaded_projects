#!/bin/bash
cd /home/demouser/yi

# 停止现有服务
echo 'Stopping existing services...'
pkill -f 'python.*app.py' 2>/dev/null || true
pkill -f 'node.*server.js' 2>/dev/null || true
sleep 1

# 启动 media-parser 后端
echo 'Starting media-parser backend...'
cd media-parser
source venv/bin/activate
nohup python app.py > /tmp/media-parser.log 2>&1 &
echo $! > /tmp/media-parser.pid
cd ..

# 等待后端启动
sleep 3

# 启动代理服务器
echo 'Starting proxy server...'
cd proxy-server
nohup node server.js > /tmp/proxy-server.log 2>&1 &
echo $! > /tmp/proxy-server.pid
cd ..

echo 'Services started!'
echo 'Proxy server: http://localhost:8008'
echo 'Media parser: http://localhost:8051'
