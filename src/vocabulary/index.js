/**
 * 词语管理模块
 * 开发者: 陈总(B)
 * 任务: T-104 词语管理API：增删改查
 */

const store = require('../store');

const COLLECTION = 'vocabulary';

class VocabularyManager {
  /**
   * 添加词语到词库
   * @param {string} word - 词语
   * @param {object} meta - 元信息 { lesson, unit, source }
   */
  addWord(word, meta = {}) {
    if (!word || typeof word !== 'string') {
      return { success: false, error: '词语不能为空' };
    }

    // 检查是否已存在
    const existing = store.find(COLLECTION, v => v.word === word.trim());
    if (existing.length > 0) {
      return { success: false, error: `词语"${word}"已存在` };
    }

    const record = store.insert(COLLECTION, {
      word: word.trim(),
      lesson: meta.lesson || '',
      unit: meta.unit || '',
      source: meta.source || 'manual',
      pinyin: meta.pinyin || '',
      meaning: meta.meaning || ''
    });

    return { success: true, data: record };
  }

  /**
   * 批量添加词语
   * @param {string[]} words - 词语数组
   * @param {object} meta - 共同元信息
   */
  addWords(words, meta = {}) {
    const results = { added: 0, skipped: 0, errors: [] };

    words.forEach(word => {
      const result = this.addWord(word, meta);
      if (result.success) {
        results.added++;
      } else {
        results.skipped++;
        results.errors.push(result.error);
      }
    });

    console.log(`[Vocab] 批量添加: ${results.added}个成功, ${results.skipped}个跳过`);
    return results;
  }

  /**
   * 获取所有词语
   * @param {object} filter - 过滤条件 { lesson, unit }
   */
  getAllWords(filter = {}) {
    let words = store.getCollection(COLLECTION);

    if (filter.lesson) {
      words = words.filter(w => w.lesson === filter.lesson);
    }
    if (filter.unit) {
      words = words.filter(w => w.unit === filter.unit);
    }

    return words;
  }

  /**
   * 按ID获取词语
   */
  getWordById(id) {
    return store.findById(COLLECTION, id);
  }

  /**
   * 搜索词语
   */
  search(keyword) {
    return store.find(COLLECTION, w =>
      w.word.includes(keyword) ||
      (w.pinyin && w.pinyin.includes(keyword)) ||
      (w.meaning && w.meaning.includes(keyword))
    );
  }

  /**
   * 更新词语信息
   */
  updateWord(id, updates) {
    const updated = store.update(COLLECTION, w => w.id === id, updates);
    return updated > 0;
  }

  /**
   * 删除词语
   */
  deleteWord(id) {
    return store.removeById(COLLECTION, id) > 0;
  }

  /**
   * 随机获取N个词语（用于听写）
   */
  getRandomWords(count = 10, filter = {}) {
    const allWords = this.getAllWords(filter);
    if (allWords.length === 0) return [];

    // Fisher-Yates 洗牌
    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    console.log(`[Vocab] 随机选取 ${selected.length} 个词语`);
    return selected;
  }

  /**
   * 获取词语总数
   */
  count(filter = {}) {
    return this.getAllWords(filter).length;
  }
}

module.exports = new VocabularyManager();
