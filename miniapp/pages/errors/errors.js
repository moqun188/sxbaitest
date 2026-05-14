// pages/errors/errors.js
const app = getApp();

Page({
  data: {
    topErrors: [],
    recentErrors: [],
    errorStats: { total: 0, uniqueWords: 0 }
  },

  onShow() {
    this.loadErrors();
  },

  loadErrors() {
    const errors = app.globalData.errorWords;
    const stats = app.getStats();

    // 错词频率
    const freq = {};
    errors.forEach(e => {
      if (!freq[e.word]) freq[e.word] = { word: e.word, count: 0, errors: [] };
      freq[e.word].count++;
      if (!freq[e.word].errors.includes(e.errorText)) {
        freq[e.word].errors.push(e.errorText);
      }
    });
    const topErrors = Object.values(freq).sort((a, b) => b.count - a.count);
    const maxCount = topErrors.length > 0 ? topErrors[0].count : 1;
    topErrors.forEach(t => {
      t.percent = Math.round((t.count / maxCount) * 100);
    });

    // 最近错误
    const recentErrors = errors.slice(-10).reverse().map(e => ({
      ...e,
      date: new Date(e.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }));

    this.setData({
      topErrors,
      recentErrors,
      errorStats: {
        total: errors.length,
        uniqueWords: stats.uniqueErrorWords
      }
    });
  },

  clearErrors() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有错词记录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.errorWords = [];
          app.saveLocalData();
          this.loadErrors();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
