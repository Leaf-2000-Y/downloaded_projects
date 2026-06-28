App({
  onLaunch() {
    // 检查更新
    this.checkUpdate();
  },

  globalData: {
    // API 基础地址（请替换为你的实际地址）
    apiBaseUrl: 'https://your-proxy-server.com'
  },

  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) return;

    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success(res) {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            }
          });
        });
      }
    });
  }
});
