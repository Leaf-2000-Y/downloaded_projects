// Tryrevive Chrome Extension Popup logic
// 读取本地存储中的监测网站累计时间，并渲染到浮层，同时提供快捷键唤醒主界面入口。

const RESTRICTED_DOMAINS = [
  "xiaohongshu.com",
  "bilibili.com",
  "weibo.com",
  "douyin.com",
  "zhihu.com",
  "taobao.com"
];

document.addEventListener("DOMContentLoaded", () => {
  renderSiteTimes();

  const openBtn = document.getElementById("open-app-btn");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      chrome.tabs.query({}, (tabs) => {
        // Look for existing Tryrevive tab
        const target = tabs.find(t => t.url && t.url.includes("Tryrevive/index.html"));
        if (target) {
          chrome.tabs.update(target.id, { active: true });
        } else {
          // If not found, open as a new tab
          // For local files development, we can point to standard index.html path
          const localUrl = chrome.runtime.getURL("../index.html");
          chrome.tabs.create({ url: localUrl });
        }
      });
    });
  }
});

function renderSiteTimes() {
  const listContainer = document.getElementById("site-list");
  if (!listContainer) return;

  chrome.storage.local.get(RESTRICTED_DOMAINS, (result) => {
    listContainer.innerHTML = "";
    let hasData = false;

    RESTRICTED_DOMAINS.forEach(domain => {
      const ms = result[domain] || 0;
      if (ms > 0) {
        hasData = true;
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (60 * 1000));
        
        const item = document.createElement("div");
        item.className = "site-item";
        item.innerHTML = `
          <span class="site-name">${getFriendlyName(domain)}</span>
          <span class="site-time">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</span>
        `;
        listContainer.appendChild(item);
      }
    });

    if (!hasData) {
      listContainer.innerHTML = `
        <div class="site-item" style="justify-content: center; opacity: 0.5;">
          <span class="site-name" style="font-size: 0.75rem;">今日专注力饱满，未沉迷社交。</span>
        </div>
      `;
    }
  });
}

function getFriendlyName(domain) {
  const map = {
    "xiaohongshu.com": "小红书 📕",
    "bilibili.com": "哔哩哔哩 📺",
    "weibo.com": "新浪微博 💬",
    "douyin.com": "抖音短视频 🎵",
    "zhihu.com": "知乎 💡",
    "taobao.com": "淘宝网 🛍️"
  };
  return map[domain] || domain;
}
