// pages/dashboard/dashboard.js
const app = getApp();

const COLORS = ['#38bdf8', '#818cf8', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#22d3ee'];

Page({
  data: {
    stats: {},
    trendClass: 'badge-stable',
    trendText: '📊 稳定'
  },

  onShow() {
    this.refreshData();
  },

  refreshData() {
    const stats = app.getStats();

    // 课程百分比和颜色
    const maxLesson = Math.max(...stats.lessons.map(l => l.count), 1);
    stats.lessons = stats.lessons.map((l, i) => ({
      ...l,
      percent: Math.round((l.count / maxLesson) * 100),
      color: COLORS[i % COLORS.length]
    }));

    // 错词TOP5
    stats.topErrors = stats.topErrors.slice(0, 5);

    // 日期格式化
    stats.recentSessions = stats.recentSessions.map(s => ({
      ...s,
      date: new Date(s.timestamp).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
    }));

    // 趋势
    let trendClass = 'badge-stable';
    let trendText = '📊 稳定';
    if (stats.trend === 'up') { trendClass = 'badge-up'; trendText = '📈 上升'; }
    else if (stats.trend === 'down') { trendClass = 'badge-down'; trendText = '📉 下降'; }

    this.setData({ stats, trendClass, trendText });
  },

  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  }
});
