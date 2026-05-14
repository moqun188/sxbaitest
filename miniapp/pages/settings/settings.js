// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    intervals: [
      { label: '2秒', value: 2000 },
      { label: '3秒', value: 3000 },
      { label: '5秒', value: 5000 },
      { label: '8秒', value: 8000 },
    ],
    repeats: [1, 2, 3],
    counts: [5, 10, 15, 20],
    intervalIndex: 1,
    repeatIndex: 0,
    countIndex: 1
  },

  onIntervalChange(e) {
    this.setData({ intervalIndex: e.detail.value });
    wx.showToast({ title: '已更新', icon: 'success' });
  },

  onRepeatChange(e) {
    this.setData({ repeatIndex: e.detail.value });
    wx.showToast({ title: '已更新', icon: 'success' });
  },

  onCountChange(e) {
    this.setData({ countIndex: e.detail.value });
    wx.showToast({ title: '已更新', icon: 'success' });
  },

  exportData() {
    const data = {
      vocabulary: app.globalData.vocabulary,
      errorWords: app.globalData.errorWords,
      sessions: app.globalData.sessions
    };
    // 小程序中复制到剪贴板
    wx.setClipboardData({
      data: JSON.stringify(data, null, 2),
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    });
  },

  resetData() {
    wx.showModal({
      title: '确认重置',
      content: '将重置为演示数据，当前数据会丢失',
      success: (res) => {
        if (res.confirm) {
          app.loadDemoData();
          wx.showToast({ title: '已重置', icon: 'success' });
        }
      }
    });
  },

  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '将清空所有数据，此操作不可恢复',
      confirmColor: '#fb7185',
      success: (res) => {
        if (res.confirm) {
          app.globalData.vocabulary = [];
          app.globalData.errorWords = [];
          app.globalData.sessions = [];
          app.saveLocalData();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
