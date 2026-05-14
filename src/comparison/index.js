/**
 * 比对纠错模块
 * 开发者: 向博(A)
 * 任务: T-302 比对引擎：逐词比对 + 相似度计算
 *
 * 将学生手写识别结果与原文逐词比对，
 * 支持精确匹配和模糊匹配（编辑距离）
 */

const store = require('../store');

class ComparisonEngine {
  constructor(threshold = 0.8) {
    this.threshold = threshold; // 相似度阈值
    console.log(`[Compare] 比对引擎初始化，阈值: ${threshold}`);
  }

  /**
   * 比对两组词语
   * @param {string[]} original - 原始词语列表（听写原文）
   * @param {string[]} written - 学生手写识别的词语列表
   * @returns {object} 比对结果
   */
  compare(original, written) {
    console.log(`[Compare] 比对开始: ${original.length} 个原文 vs ${written.length} 个手写`);

    const results = [];
    const maxLen = Math.max(original.length, written.length);

    for (let i = 0; i < maxLen; i++) {
      const origWord = i < original.length ? original[i] : null;
      const writtenWord = i < written.length ? written[i] : null;

      if (!origWord) {
        // 多写的词
        results.push({
          index: i,
          original: null,
          written: writtenWord,
          status: 'extra',
          similarity: 0,
          message: `多写: "${writtenWord}"`
        });
      } else if (!writtenWord) {
        // 漏写
        results.push({
          index: i,
          original: origWord,
          written: null,
          status: 'missing',
          similarity: 0,
          message: `漏写: "${origWord}"`
        });
      } else {
        // 逐字比对
        const similarity = this._calcSimilarity(origWord, writtenWord);
        const isCorrect = similarity >= this.threshold;

        results.push({
          index: i,
          original: origWord,
          written: writtenWord,
          status: isCorrect ? 'correct' : 'wrong',
          similarity: Math.round(similarity * 100) / 100,
          message: isCorrect
            ? `✓ 正确: "${origWord}"`
            : `✗ 错误: "${origWord}" → "${writtenWord}" (相似度: ${(similarity * 100).toFixed(0)}%)`
        });
      }
    }

    // 统计
    const summary = this._buildSummary(results);

    console.log(`[Compare] 比对完成: ${summary.correct}正确, ${summary.wrong}错误, ${summary.missing}漏写, ${summary.extra}多写`);
    return { results, summary };
  }

  /**
   * 将比对结果保存到错词本
   * @param {object} comparisonResult - compare() 的返回结果
   * @param {object} session - 听写会话信息
   */
  saveErrorWords(comparisonResult, session = {}) {
    const wrongWords = comparisonResult.results.filter(r => r.status === 'wrong' || r.status === 'missing');

    wrongWords.forEach(item => {
      store.insert('errorWords', {
        word: item.original,
        written: item.written || '',
        similarity: item.similarity,
        lesson: session.lesson || '',
        unit: session.unit || '',
        sessionDate: new Date().toISOString()
      });
    });

    console.log(`[Compare] 保存 ${wrongWords.length} 个错词到错词本`);
    return wrongWords.length;
  }

  /**
   * 打印比对报告
   */
  printReport(comparisonResult) {
    const { results, summary } = comparisonResult;

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║     📊 听写比对报告                  ║');
    console.log('╠══════════════════════════════════════╣');

    results.forEach(r => {
      let icon = '';
      switch (r.status) {
        case 'correct': icon = '✅'; break;
        case 'wrong':   icon = '❌'; break;
        case 'missing': icon = '⬜'; break;
        case 'extra':   icon = '➕'; break;
      }
      console.log(`║  ${icon} ${r.message}`);
    });

    console.log('╠══════════════════════════════════════╣');
    console.log(`║  总计: ${summary.total} 个`);
    console.log(`║  正确: ${summary.correct} 个 (${summary.accuracy}%)`);
    console.log(`║  错误: ${summary.wrong} 个`);
    if (summary.missing > 0) console.log(`║  漏写: ${summary.missing} 个`);
    if (summary.extra > 0)   console.log(`║  多写: ${summary.extra} 个`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    return summary;
  }

  // ========== 内部方法 ==========

  /**
   * 计算两个词语的相似度（基于编辑距离）
   */
  _calcSimilarity(a, b) {
    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0;

    const distance = this._levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return 1 - (distance / maxLen);
  }

  /**
   * 计算编辑距离 (Levenshtein Distance)
   */
  _levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // 删除
            dp[i][j - 1],     // 插入
            dp[i - 1][j - 1]  // 替换
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 构建统计摘要
   */
  _buildSummary(results) {
    const total = results.length;
    const correct = results.filter(r => r.status === 'correct').length;
    const wrong = results.filter(r => r.status === 'wrong').length;
    const missing = results.filter(r => r.status === 'missing').length;
    const extra = results.filter(r => r.status === 'extra').length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, wrong, missing, extra, accuracy };
  }
}

module.exports = ComparisonEngine;
