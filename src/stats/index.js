/**
 * 统计报表模块
 * 任务: T-304 统计报表（正确率趋势、错词TOP10）
 */

const store = require('../store');
const vocab = require('../vocabulary');
const errorBook = require('../errorbook');

class StatsReporter {
  /**
   * 生成完整统计报告
   */
  generateReport() {
    const vocabStats = this._getVocabStats();
    const errorStats = this._getErrorStats();
    const accuracy = this._getAccuracyTrend();

    return {
      vocabulary: vocabStats,
      errors: errorStats,
      accuracy,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 打印格式化报告
   */
  printReport() {
    const report = this.generateReport();

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║        📊 学习统计报告                   ║');
    console.log('╠══════════════════════════════════════════╣');

    // 词库统计
    console.log('║  📚 词库:');
    console.log(`║     总词语数: ${report.vocabulary.total}`);
    console.log(`║     按课分布:`);
    report.vocabulary.byLesson.forEach(l => {
      console.log(`║       ${l.lesson}: ${l.count} 个`);
    });

    // 错词统计
    console.log('║');
    console.log('║  ❌ 错词:');
    console.log(`║     总错误次数: ${report.errors.totalErrors}`);
    console.log(`║     不重复错词: ${report.errors.uniqueWords}`);
    if (report.errors.topWords.length > 0) {
      console.log('║     高频错词 TOP5:');
      report.errors.topWords.slice(0, 5).forEach((w, i) => {
        console.log(`║       ${i + 1}. "${w.word}" — 错 ${w.count} 次`);
      });
    }

    // 正确率
    console.log('║');
    console.log('║  📈 正确率:');
    console.log(`║     本次: ${report.accuracy.current}%`);
    console.log(`║     平均: ${report.accuracy.average}%`);
    console.log(`║     趋势: ${report.accuracy.trend}`);

    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    return report;
  }

  /**
   * 导出报告为 JSON
   */
  exportJSON() {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  // ========== 内部方法 ==========

  _getVocabStats() {
    const words = vocab.getAllWords();
    const byLesson = {};

    words.forEach(w => {
      const lesson = w.lesson || '未分类';
      if (!byLesson[lesson]) byLesson[lesson] = 0;
      byLesson[lesson]++;
    });

    return {
      total: words.length,
      byLesson: Object.entries(byLesson).map(([lesson, count]) => ({ lesson, count }))
    };
  }

  _getErrorStats() {
    const errors = store.getCollection('errorWords');
    const uniqueWords = new Set(errors.map(e => e.word));

    // 统计频率
    const freq = {};
    errors.forEach(e => {
      if (!freq[e.word]) freq[e.word] = { word: e.word, count: 0 };
      freq[e.word].count++;
    });

    const topWords = Object.values(freq).sort((a, b) => b.count - a.count);

    return {
      totalErrors: errors.length,
      uniqueWords: uniqueWords.size,
      topWords
    };
  }

  _getAccuracyTrend() {
    const errors = store.getCollection('errorWords');
    const words = vocab.getAllWords();

    // 当前正确率（基于错词占比）
    const totalTested = words.length || 1;
    const uniqueErrors = new Set(errors.map(e => e.word)).size;
    const current = Math.round(((totalTested - uniqueErrors) / totalTested) * 100);

    // 平均正确率
    const sessions = store.getCollection('sessions');
    let average = current;
    if (sessions.length > 0) {
      const totalAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0);
      average = Math.round(totalAccuracy / sessions.length);
    }

    // 趋势
    let trend = '📊 稳定';
    if (sessions.length >= 2) {
      const last = sessions[sessions.length - 1].accuracy || 0;
      const prev = sessions[sessions.length - 2].accuracy || 0;
      if (last > prev + 5) trend = '📈 上升';
      else if (last < prev - 5) trend = '📉 下降';
    }

    return { current, average, trend };
  }
}

module.exports = new StatsReporter();
