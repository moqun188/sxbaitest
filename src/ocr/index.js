/**
 * OCR识别模块
 * 开发者: 向博(A)
 * 任务: T-201 OCR模块骨架（模拟实现，后续接入 Tesseract.js）
 */

class OcrEngine {
  constructor(language = 'chi_sim') {
    this.language = language;
    console.log(`[OCR] 引擎初始化，语言: ${language}`);
  }

  /**
   * 识别图片中的文字
   * @param {string} imagePath - 图片路径
   * @returns {Promise<{text: string, words: string[]}>}
   */
  async recognize(imagePath) {
    console.log(`[OCR] 正在识别: ${imagePath}`);
    // 模拟OCR处理延迟
    await this._delay(500);

    // 模拟返回 —— 实际应接入 Tesseract.js
    const mockResult = {
      text: '模拟识别结果',
      confidence: 0.95,
      words: []
    };

    console.log(`[OCR] 识别完成，置信度: ${mockResult.confidence}`);
    return mockResult;
  }

  /**
   * 从识别文本中提取词语列表
   * @param {string} text - OCR识别的原始文本
   * @returns {string[]} 词语数组
   */
  extractWords(text) {
    if (!text || typeof text !== 'string') return [];

    // 按常见分隔符拆分
    const words = text
      .split(/[\s,，、。；;!\n\r]+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2); // 过滤单字

    console.log(`[OCR] 提取到 ${words.length} 个词语`);
    return words;
  }

  /** 设置识别语言 */
  setLanguage(lang) {
    this.language = lang;
    console.log(`[OCR] 语言切换为: ${lang}`);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = OcrEngine;
