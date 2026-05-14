// app.js - 听写词语学习系统小程序
App({
  onLaunch() {
    console.log('sxbaitest 小程序启动');
    // 加载本地数据
    this.loadLocalData();
  },

  globalData: {
    // 词库数据
    vocabulary: [],
    // 错词数据
    errorWords: [],
    // 听写记录
    sessions: [],
    // 课程列表
    lessons: []
  },

  // 加载本地存储数据
  loadLocalData() {
    try {
      const vocab = wx.getStorageSync('vocabulary');
      const errors = wx.getStorageSync('errorWords');
      const sessions = wx.getStorageSync('sessions');

      if (vocab) this.globalData.vocabulary = vocab;
      if (errors) this.globalData.errorWords = errors;
      if (sessions) this.globalData.sessions = sessions;

      // 如果没有数据，加载演示数据
      if (this.globalData.vocabulary.length === 0) {
        this.loadDemoData();
      }

      this.updateLessons();
    } catch (e) {
      console.error('加载数据失败:', e);
      this.loadDemoData();
    }
  },

  // 演示数据
  loadDemoData() {
    this.globalData.vocabulary = [
      { id: '1', word: '春天', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '2', word: '花朵', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '3', word: '阳光', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '4', word: '小鸟', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '5', word: '唱歌', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '6', word: '温暖', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '7', word: '发芽', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '8', word: '开放', lesson: '第一课', unit: '第一单元', source: 'ocr_scan' },
      { id: '9', word: '读书', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '10', word: '写字', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '11', word: '认真', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '12', word: '努力', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '13', word: '快乐', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '14', word: '成长', lesson: '第二课', unit: '第一单元', source: 'ocr_scan' },
      { id: '15', word: '聪明', lesson: '第三课', unit: '第二单元', source: 'ocr_scan' },
      { id: '16', word: '勤奋', lesson: '第三课', unit: '第二单元', source: 'ocr_scan' },
      { id: '17', word: '知识', lesson: '第三课', unit: '第二单元', source: 'ocr_scan' },
      { id: '18', word: '学习', lesson: '第三课', unit: '第二单元', source: 'ocr_scan' },
    ];

    this.globalData.errorWords = [
      { id: 'e1', word: '春天', errorText: '春大', lesson: '第一课', timestamp: Date.now() - 86400000 * 2 },
      { id: 'e2', word: '小鸟', errorText: '小乌', lesson: '第一课', timestamp: Date.now() - 86400000 * 2 },
      { id: 'e3', word: '春天', errorText: '春大', lesson: '第一课', timestamp: Date.now() - 86400000 },
      { id: 'e4', word: '努力', errorText: '努历', lesson: '第二课', timestamp: Date.now() - 86400000 },
      { id: 'e5', word: '聪明', errorText: '聪名', lesson: '第三课', timestamp: Date.now() },
    ];

    this.globalData.sessions = [
      { id: 's1', count: 5, correct: 3, accuracy: 60, timestamp: Date.now() - 86400000 * 2 },
      { id: 's2', count: 5, correct: 4, accuracy: 80, timestamp: Date.now() - 86400000 },
      { id: 's3', count: 5, correct: 5, accuracy: 100, timestamp: Date.now() },
    ];

    this.saveLocalData();
  },

  // 保存到本地存储
  saveLocalData() {
    try {
      wx.setStorageSync('vocabulary', this.globalData.vocabulary);
      wx.setStorageSync('errorWords', this.globalData.errorWords);
      wx.setStorageSync('sessions', this.globalData.sessions);
      this.updateLessons();
    } catch (e) {
      console.error('保存数据失败:', e);
    }
  },

  // 更新课程列表
  updateLessons() {
    const lessonMap = {};
    this.globalData.vocabulary.forEach(w => {
      const l = w.lesson || '未分类';
      if (!lessonMap[l]) lessonMap[l] = 0;
      lessonMap[l]++;
    });
    this.globalData.lessons = Object.entries(lessonMap).map(([name, count]) => ({ name, count }));
  },

  // 获取统计数据
  getStats() {
    const vocab = this.globalData.vocabulary;
    const errors = this.globalData.errorWords;
    const sessions = this.globalData.sessions;

    // 错词频率统计
    const freq = {};
    errors.forEach(e => {
      if (!freq[e.word]) freq[e.word] = { word: e.word, count: 0, errors: [] };
      freq[e.word].count++;
      freq[e.word].errors.push(e.errorText);
    });
    const topErrors = Object.values(freq).sort((a, b) => b.count - a.count);

    // 正确率
    const uniqueErrorWords = new Set(errors.map(e => e.word)).size;
    const currentAccuracy = vocab.length > 0
      ? Math.round(((vocab.length - uniqueErrorWords) / vocab.length) * 100)
      : 0;

    // 平均正确率
    let avgAccuracy = currentAccuracy;
    if (sessions.length > 0) {
      avgAccuracy = Math.round(sessions.reduce((s, r) => s + r.accuracy, 0) / sessions.length);
    }

    // 趋势
    let trend = 'stable';
    if (sessions.length >= 2) {
      const last = sessions[sessions.length - 1].accuracy;
      const prev = sessions[sessions.length - 2].accuracy;
      if (last > prev + 5) trend = 'up';
      else if (last < prev - 5) trend = 'down';
    }

    return {
      totalWords: vocab.length,
      totalErrors: errors.length,
      uniqueErrorWords,
      topErrors,
      currentAccuracy,
      avgAccuracy,
      trend,
      lessons: this.globalData.lessons,
      recentSessions: sessions.slice(-7)
    };
  }
});
