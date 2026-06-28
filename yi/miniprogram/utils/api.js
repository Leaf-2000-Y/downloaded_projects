/**
 * API 请求封装
 */

// 获取应用实例
const app = getApp();

/**
 * 解析视频链接
 * @param {string} text - 视频分享链接
 * @returns {Promise} 解析结果
 */
function parseVideo(text) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '解析中...' });

    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/parse`,
      method: 'POST',
      data: { text },
      header: {
        'Content-Type': 'application/json'
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.succ) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.retdesc || '解析失败'));
        }
      },
      fail(err) {
        wx.hideLoading();
        reject(new Error('网络请求失败，请检查网络'));
      }
    });
  });
}

/**
 * 获取支持的平台列表
 * @returns {Promise} 平台列表
 */
function getPlatforms() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/platforms`,
      method: 'GET',
      success(res) {
        if (res.statusCode === 200 && res.data.succ) {
          resolve(res.data.data.platforms);
        } else {
          reject(new Error('获取平台列表失败'));
        }
      },
      fail(err) {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

module.exports = {
  parseVideo,
  getPlatforms
};
