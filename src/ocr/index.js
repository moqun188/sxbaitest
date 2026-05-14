/**
 * OCR识别模块 - 增强版
 * 开发者: 向博(A)
 * 任务: T-201 OCR接入 (模拟实现 + 可插拔真实引擎)
 *
 * 当前为模拟OCR引擎，接口兼容 Tesseract.js，
 * 替换为真实引擎只需实现 recognize() 方法即可
 */

class OcrEngine {
  constructor(language = 'chi_sim') {
    this.language = language;
    this.engineType = 'mock'; // mock | tesseract | baidu | tencent
    console.log(`[OCR] 引擎初始化，语言: ${language}，引擎: ${this.engineType}`);
  }

  /**
   * 识别图片中的文字
   * @param {string|Buffer} input - 图片路径或Buffer
   * @param {object} options - 识别选项
   * @returns {Promise<{text: string, words: string[], confidence: number}>}
   */
  async recognize(input, options = {}) {
    const imagePath = typeof input === 'string' ? input : '<buffer>';
    console.log(`[OCR] 正在识别: ${imagePath}`);

    const startTime = Date.now();

    // 模拟OCR处理延迟
    await this._delay(300 + Math.random() * 500);

    // 模拟返回结果 —— 实际应接入真实OCR
    const mockResult = this._getMockResult(imagePath);

    const elapsed = Date.now() - startTime;
    console.log(`[OCR] 识别完成，耗时 ${elapsed}ms，置信度: ${mockResult.confidence.toFixed(2)}`);
    return mockResult;
  }

  /**
   * 从课本图片中提取词语列表
   * @param {string|Buffer} input - 图片路径或Buffer
   * @param {object} options - { lesson, unit }
   * @returns {Promise<{words: string[], rawText: string}>}
   */
  async scanTextbook(input, options = {}) {
    console.log(`[OCR] 扫描课本页面...`);
    const result = await this.recognize(input, options);

    // 提取词语：按行分割，过滤空行和单字
    const words = this.extractWords(result.text);

    console.log(`[OCR] 课本扫描完成，提取 ${words.length} 个词语`);
    return {
      words,
      rawText: result.text,
      confidence: result.confidence,
      lesson: options.lesson || '',
      unit: options.unit || ''
    };
  }

  /**
   * 从识别文本中提取词语列表
   * @param {string} text - OCR识别的原始文本
   * @returns {string[]} 词语数组
   */
  extractWords(text) {
    if (!text || typeof text !== 'string') return [];

    const words = text
      // 按常见分隔符拆分：空格、逗号、顿号、换行等
      .split(/[\s,，、。；;！!？?\n\r\t]+/)
      .map(w => w.trim())
      // 过滤空串和单字（中文词语至少2字）
      .filter(w => w.length >= 2)
      // 去重
      .filter((w, i, arr) => arr.indexOf(w) === i);

    console.log(`[OCR] 提取到 ${words.length} 个词语: ${words.join(', ')}`);
    return words;
  }

  /**
   * 识别学生手写内容
   * @param {string|Buffer} input - 手写图片
   * @returns {Promise<{words: string[], rawText: string}>}
   */
  async recognizeHandwriting(input) {
    console.log(`[OCR] 识别手写内容...`);
    // 手写识别通常比印刷体置信度低
    const result = await this.recognize(input);
    const words = this.extractWords(result.text);

    console.log(`[OCR] 手写识别完成，识别 ${words.length} 个词语`);
    return {
      words,
      rawText: result.text,
      confidence: result.confidence * 0.9 // 手写折扣
    };
  }

  /** 设置识别语言 */
  setLanguage(lang) {
    this.language = lang;
    console.log(`[OCR] 语言切换为: ${lang}`);
  }

  /** 设置OCR引擎 */
  setEngine(type) {
    this.engineType = type;
    console.log(`[OCR] 引擎切换为: ${type}`);
  }

  /**
   * 模拟OCR结果（用于测试和演示）
   * 实际使用时替换此方法或接入真实引擎
   */
  _getMockResult(imagePath) {
    // 根据文件名返回不同的模拟结果，便于测试
    const filename = typeof imagePath === 'string' ? imagePath.toLowerCase() : '';

    if (filename.includes('lesson1') || filename.includes('第一课')) {
      return {
        text: '春天 花朵 阳光 小鸟 唱歌 温暖 发芽 开放',
        confidence: 0.96,
        words: ['春天', '花朵', '阳光', '小鸟', '唱歌', '温暖', '发芽', '开放']
      };
    }
    if (filename.includes('lesson2') || filename.includes('第二课')) {
      return {
        text: '读书 写字 认真 努力 学习 知识 聪明 勤奋',
        confidence: 0.94,
        words: ['读书', '写字', '认真', '努力', '学习', '知识', '聪明', '勤奋']
      };
    }
    if (filename.includes('handwrite') || filename.includes('手写')) {
      return {
        text: '春大 花朵 阳光 小鸟 长歌 温暖',
        confidence: 0.78, // 手写置信度较低
        words: ['春大', '花朵', '阳光', '小鸟', '长歌', '温暖']
      };
    }

    // 默认返回
    return {
      text: '春天 花朵 阳光 小鸟 读书 写字',
      confidence: 0.92,
      words: ['春天', '花朵', '阳光', '小鸟', '读书', '写字']
    };
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = OcrEngine;
