#!/usr/bin/env bash
set -euo pipefail

HOST="77.37.67.172"
USER="demouser"
SSH_PORT="22"
APP_PORT="8004"
REMOTE_DIR="/home/demouser/shengcai_demo_8004"
ARCHIVE="shengcai-demo.tar.gz"

if [[ -z "${DEMO_PASS:-}" ]]; then
  echo "请先设置 DEMO_PASS 环境变量后再运行，例如：DEMO_PASS='***' ./deploy.sh" >&2
  exit 1
fi

if ! command -v expect >/dev/null 2>&1; then
  echo "本机需要 expect 来自动输入 SSH 密码。" >&2
  exit 1
fi

run_ssh() {
  local remote_cmd="$1"
  expect <<EOF
set timeout -1
set remote_cmd {${remote_cmd}}
set ssh_cmd [list ssh -o StrictHostKeyChecking=no -p ${SSH_PORT} ${USER}@${HOST} \$remote_cmd]
spawn {*}\$ssh_cmd
expect {
  -re "(?i)password:" { send "${DEMO_PASS}\r"; exp_continue }
  eof
}
catch wait result
exit [lindex \$result 3]
EOF
}

run_scp() {
  expect <<EOF
set timeout -1
spawn scp -o StrictHostKeyChecking=no -P ${SSH_PORT} ${ARCHIVE} ${USER}@${HOST}:${REMOTE_DIR}/${ARCHIVE}
expect {
  -re "(?i)password:" { send "${DEMO_PASS}\r"; exp_continue }
  eof
}
catch wait result
exit [lindex \$result 3]
EOF
}

rm -f "${ARCHIVE}"
tar \
  --exclude="${ARCHIVE}" \
  --exclude="node_modules" \
  --exclude="douyin_downloads" \
  --exclude="public/generated/runs" \
  --exclude="demo.log" \
  --exclude=".git" \
  --exclude=".DS_Store" \
  -czf "${ARCHIVE}" .

run_ssh "mkdir -p ${REMOTE_DIR}"
run_scp
run_ssh "cd ${REMOTE_DIR} && tar -xzf ${ARCHIVE} && npm install && sudo lsof -t -i:${APP_PORT} | xargs -r sudo kill -9; nohup env PORT=${APP_PORT} DEMO_ONLY=1 npm start > demo.log 2>&1 &"

rm -f "${ARCHIVE}"
echo "部署完成：http://${HOST}:${APP_PORT}"
