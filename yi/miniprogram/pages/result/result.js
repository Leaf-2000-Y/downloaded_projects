const downloadUtil = require('../../utils/download');

Page({
  data: {
    videoData: null,
    downloading: false,
    downloadProgress: 0,
    downloadingImages: false
  },

  onLoad(options) {
    if (options.data) {
      try {
        const videoData = JSON.parse(decodeURIComponent(options.data));
        this.setData({ videoData });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: videoData.platform || '解析结果'
        });
      } catch (e) {
        wx.showToast({ title: '数据解析失败', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 下载视频
   */
  async downloadVideo() {
    const { videoData } = this.data;
    
    if (!videoData || !videoData.video_url) {
      wx.showToast({ title: '视频地址无效', icon: 'none' });
      return;
    }

    this.setData({ downloading: true, downloadProgress: 0 });

    try {
      await downloadUtil.downloadVideo(
        videoData.video_url,
        (progress) => {
          this.setData({ downloadProgress: progress });
        }
      );

      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (err) {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ downloading: false });
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const { videoData } = this.data;
    
    const urls = videoData.image_list.map(item => {
      return typeof item === 'string' ? item : item.url;
    });

    wx.previewImage({
      current: urls[index],
      urls: urls
    });
  },

  /**
   * 下载全部图片
   */
  async downloadAllImages() {
    const { videoData } = this.data;
    
    if (!videoData || !videoData.image_list || videoData.image_list.length === 0) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' });
      return;
    }

    this.setData({ downloadingImages: true });

    try {
      let successCount = 0;
      
      for (const image of videoData.image_list) {
        const imageUrl = typeof image === 'string' ? image : image.url;
        try {
          await downloadUtil.downloadImage(imageUrl);
          successCount++;
        } catch (e) {
          console.error('下载图片失败:', e);
        }
      }

      if (successCount > 0) {
        wx.showToast({
          title: `成功保存${successCount}张图片`,
          icon: 'success'
        });
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ downloadingImages: false });
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const { videoData } = this.data;
    return {
      title: videoData ? videoData.title : '视频无水印下载',
      path: '/pages/index/index',
      imageUrl: videoData ? videoData.cover_url : ''
    };
  }
});
