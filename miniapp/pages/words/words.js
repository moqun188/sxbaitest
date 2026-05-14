// pages/words/words.js
const app = getApp();

Page({
  data: {
    words: [],
    filteredWords: [],
    lessons: [],
    filter: '',
    keyword: '',
    newWord: ''
  },

  onShow() {
    this.loadWords();
  },

  loadWords() {
    const words = app.globalData.vocabulary;
    const lessons = app.globalData.lessons;
    this.setData({ words, lessons, filteredWords: words });
    this.applyFilter();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.applyFilter();
  },

  setFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.filter });
    this.applyFilter();
  },

  applyFilter() {
    let list = app.globalData.vocabulary;
    const { filter, keyword } = this.data;

    if (filter) {
      list = list.filter(w => w.lesson === filter);
    }
    if (keyword) {
      list = list.filter(w => w.word.includes(keyword));
    }

    this.setData({ filteredWords: list });
  },

  onNewWordInput(e) {
    this.setData({ newWord: e.detail.value });
  },

  addWord() {
    const word = this.data.newWord.trim();
    if (!word) {
      wx.showToast({ title: '请输入词语', icon: 'none' });
      return;
    }

    // 检查重复
    if (app.globalData.vocabulary.some(w => w.word === word)) {
      wx.showToast({ title: '词语已存在', icon: 'none' });
      return;
    }

    app.globalData.vocabulary.push({
      id: Date.now().toString(),
      word,
      lesson: '手动添加',
      unit: '',
      source: 'manual'
    });

    app.saveLocalData();
    this.setData({ newWord: '' });
    this.loadWords();
    wx.showToast({ title: '添加成功', icon: 'success' });
  }
});
