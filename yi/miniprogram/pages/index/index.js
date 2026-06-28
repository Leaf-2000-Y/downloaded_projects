const api = require('../../utils/api');

Page({
  data: {
    inputText: '',
    loading: false,
    platforms: [
      { name: '抖音', id: 'douyin', icon: '🎵' },
      { name: '快手', id: 'kuaishou', icon: '📹' },
      { name: '小红书', id: 'xiaohongshu', icon: '📕' },
      { name: 'B站', id: 'bilibili', icon: '📺' },
      { name: '微博', id: 'weibo', icon: '💬' },
      { name: '西瓜视频', id: 'ixigua', icon: '🍉' },
      { name: '皮皮虾', id: 'pipixia', icon: '🦐' },
      { name: 'TikTok', id: 'tiktok', icon: '🎵' }
    ],
    history: []
  },

  onLoad() {
    // 加载历史记录
    this.loadHistory();
  },

  onShow() {
    // 检查剪贴板
    this.checkClipboard();
  },

  /**
   * 检查剪贴板是否有链接
   */
  async checkClipboard() {
    try {
      const res = await wx.getClipboardData();
      if (res.data && this.isValidUrl(res.data)) {
        wx.showModal({
          title: '检测到链接',
          content: '是否自动粘贴并解析？',
          confirmText: '解析',
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.setData({ inputText: res.data });
              this.parseVideo();
            }
          }
        });
      }
    } catch (e) {
      // 忽略错误
    }
  },

  /**
   * 验证是否为有效URL
   */
  isValidUrl(text) {
    const urlPatterns = [
      /v\.douyin\.com/,
      /v\.kuaishou\.com/,
      /xhslink\.com/,
      /b23\.tv/,
      /weibo\.cn/,
      /vm\.tiktok\.com/,
      /vt\.tiktok\.com/,
      /www\.xiaohongshu\.com\/explore/
    ];
    return urlPatterns.some(pattern => pattern.test(text));
  },

  /**
   * 输入变化
   */
  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  /**
   * 从剪贴板粘贴
   */
  async pasteFromClipboard() {
    try {
      const res = await wx.getClipboardData();
      if (res.data) {
        this.setData({ inputText: res.data });
        wx.showToast({ title: '已粘贴', icon: 'success' });
      } else {
        wx.showToast({ title: '剪贴板为空', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '获取剪贴板失败', icon: 'none' });
    }
  },

  /**
   * 清空输入
   */
  clearInput() {
    this.setData({ inputText: '' });
  },

  /**
   * 解析视频
   */
  async parseVideo() {
    const { inputText } = this.data;
    
    if (!inputText.trim()) {
      wx.showToast({ title: '请输入链接', icon: 'none' });
      return;
    }

    // 验证链接格式
    if (!this.isValidUrl(inputText)) {
      wx.showToast({ title: '请输入有效的视频链接', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      const result = await api.parseVideo(inputText);
      
      // 保存到历史记录
      this.saveToHistory(result, inputText);

      // 跳转到结果页
      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify(result))}`
      });
    } catch (err) {
      wx.showToast({
        title: err.message || '解析失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 保存到历史记录
   */
  saveToHistory(result, url) {
    let history = wx.getStorageSync('parse_history') || [];
    
    // 检查是否已存在
    const exists = history.find(item => item.video_id === result.video_id);
    if (!exists) {
      history.unshift({
        video_id: result.video_id,
        title: result.title,
        cover_url: result.cover_url,
        platform: result.platform,
        url: url,
        timestamp: Date.now()
      });
      
      // 最多保存20条
      if (history.length > 20) {
        history = history.slice(0, 20);
      }
      
      wx.setStorageSync('parse_history', history);
      this.setData({ history });
    }
  },

  /**
   * 加载历史记录
   */
  loadHistory() {
    const history = wx.getStorageSync('parse_history') || [];
    this.setData({ history });
  },

  /**
   * 清空历史记录
   */
  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定要清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('parse_history');
          this.setData({ history: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  /**
   * 重新解析历史记录
   */
  reparseHistory(e) {
    const { url } = e.currentTarget.dataset;
    this.setData({ inputText: url });
    this.parseVideo();
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '视频无水印下载 - 支持抖音、快手、小红书等20+平台',
      path: '/pages/index/index'
    };
  }
});
