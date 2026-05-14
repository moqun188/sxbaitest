/**
 * 错词本模块
 * 开发者: 向博(A)
 * 任务: T-303 错词记录 + 复习管理
 *
 * 记录听写错误的词语，支持复习、统计、导出
 */

const store = require('../store');

class ErrorBook {
  constructor() {
    this.collection = 'errorWords';
  }

  /**
   * 获取所有错词
   * @param {object} filter - { lesson, unit, startDate, endDate }
   */
  getAll(filter = {}) {
    let words = store.getCollection(this.collection);

    if (filter.lesson) {
      words = words.filter(w => w.lesson === filter.lesson);
    }
    if (filter.unit) {
      words = words.filter(w => w.unit === filter.unit);
    }
    if (filter.startDate) {
      words = words.filter(w => new Date(w.sessionDate) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      words = words.filter(w => new Date(w.sessionDate) <= new Date(filter.endDate));
    }

    return words;
  }

  /**
   * 按错词频率排序（错得最多的排前面）
   */
  getTopErrors(limit = 20) {
    const words = store.getCollection(this.collection);

    // 统计每个词的错误次数
    const freq = {};
    words.forEach(w => {
      if (!freq[w.word]) {
        freq[w.word] = { word: w.word, count: 0, lastError: null, details: [] };
      }
      freq[w.word].count++;
      freq[w.word].lastError = w.sessionDate;
      freq[w.word].details.push({
        written: w.written,
        similarity: w.similarity,
        date: w.sessionDate
      });
    });

    // 排序
    return Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取需要复习的词语（错过2次以上的）
   */
  getReviewWords(minErrors = 2) {
    const topErrors = this.getTopErrors(100);
    return topErrors.filter(w => w.count >= minErrors);
  }

  /**
   * 标记词语已掌握（从错词本移除特定记录）
   */
  markMastered(word) {
    const removed = store.remove(this.collection, w => w.word === word);
    console.log(`[ErrorBook] "${word}" 已标记掌握，移除 ${removed} 条记录`);
    return removed;
  }

  /**
   * 获取错词统计
   */
  getStats() {
    const words = store.getCollection(this.collection);
    const uniqueWords = new Set(words.map(w => w.word));

    // 按课分组
    const byLesson = {};
    words.forEach(w => {
      const lesson = w.lesson || '未分类';
      if (!byLesson[lesson]) byLesson[lesson] = new Set();
      byLesson[lesson].add(w.word);
    });

    return {
      totalErrors: words.length,
      uniqueWords: uniqueWords.size,
      byLesson: Object.entries(byLesson).map(([lesson, words]) => ({
        lesson,
        count: words.size,
        words: [...words]
      })),
      topErrors: this.getTopErrors(5)
    };
  }

  /**
   * 导出错词本为文本
   */
  export() {
    const stats = this.getStats();
    const topErrors = this.getTopErrors(20);

    let text = '=== 错词本 ===\n\n';
    text += `总错误次数: ${stats.totalErrors}\n`;
    text += `不重复词语: ${stats.uniqueWords}\n\n`;

    text += '--- 高频错词 ---\n';
    topErrors.forEach(w => {
      text += `  ${w.word} (错${w.count}次)\n`;
    });

    text += '\n--- 按课分类 ---\n';
    stats.byLesson.forEach(l => {
      text += `  ${l.lesson}: ${l.count}个 - ${l.words.join(', ')}\n`;
    });

    return text;
  }

  /**
   * 清空错词本
   */
  clear() {
    store.clear(this.collection);
    console.log('[ErrorBook] 错词本已清空');
  }
}

module.exports = new ErrorBook();
