/**
 * 下载工具
 */

/**
 * 下载视频到相册
 * @param {string} videoUrl - 视频地址
 * @param {function} onProgress - 进度回调
 * @returns {Promise}
 */
function downloadVideo(videoUrl, onProgress) {
  return new Promise((resolve, reject) => {
    // 先请求保存权限
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        startDownload(videoUrl, onProgress, resolve, reject);
      },
      fail() {
        // 用户拒绝授权，引导用户开启
        wx.showModal({
          title: '提示',
          content: '需要您授权保存视频到相册',
          confirmText: '去设置',
          success(res) {
            if (res.confirm) {
              wx.openSetting();
            }
            reject(new Error('用户未授权'));
          }
        });
      }
    });
  });
}

/**
 * 开始下载视频
 */
function startDownload(videoUrl, onProgress, resolve, reject) {
  const downloadTask = wx.downloadFile({
    url: videoUrl,
    success(res) {
      if (res.statusCode === 200) {
        // 下载成功，保存到相册
        wx.saveVideoToPhotosAlbum({
          filePath: res.tempFilePath,
          success() {
            resolve(res.tempFilePath);
          },
          fail(err) {
            reject(new Error('保存到相册失败'));
          }
        });
      } else {
        reject(new Error('下载失败'));
      }
    },
    fail(err) {
      reject(new Error('下载失败，请检查网络'));
    }
  });

  // 监听下载进度
  if (downloadTask && onProgress) {
    downloadTask.onProgressUpdate((res) => {
      onProgress(res.progress);
    });
  }
}

/**
 * 下载图片到相册
 * @param {string} imageUrl - 图片地址
 * @returns {Promise}
 */
function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: 'scope.writePhotosAlbum',
      success() {
        wx.downloadFile({
          url: imageUrl,
          success(res) {
            if (res.statusCode === 200) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success() {
                  resolve(res.tempFilePath);
                },
                fail(err) {
                  reject(new Error('保存图片失败'));
                }
              });
            } else {
              reject(new Error('下载图片失败'));
            }
          },
          fail(err) {
            reject(new Error('下载图片失败'));
          }
        });
      },
      fail() {
        wx.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success(res) {
            if (res.confirm) {
              wx.openSetting();
            }
            reject(new Error('用户未授权'));
          }
        });
      }
    });
  });
}

module.exports = {
  downloadVideo,
  downloadImage
};
