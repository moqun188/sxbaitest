/**
 * 听写词语学习系统 - 入口文件
 * sxbaitest v1.0
 *
 * 已完成模块:
 *   [向博/A] T-102 配置管理, T-201 OCR骨架
 *   [陈总/B] T-103 数据存储, T-104 词语管理
 */

const config = require('./config');
const vocab = require('./vocabulary');
const OcrEngine = require('./ocr');

console.log('=================================');
console.log('  听写词语学习系统 sxbaitest v1.0');
console.log('=================================');
console.log('');

// 展示配置
const cfg = config.get();
console.log('📋 当前配置:');
console.log(`  朗读间隔: ${cfg.readInterval}ms`);
console.log(`  朗读次数: ${cfg.readRepeat}次`);
console.log(`  比对阈值: ${cfg.matchThreshold}`);
console.log('');

// 演示词语管理
console.log('📝 词语管理演示:');
const demoWords = ['春天', '花朵', '阳光', '小鸟', '读书', '写字', '认真', '努力', '快乐', '成长'];
const result = vocab.addWords(demoWords, { lesson: '第一课', unit: '第一单元' });
console.log(`  添加 ${result.added} 个词语, 跳过 ${result.skipped} 个`);
console.log(`  词库总数: ${vocab.count()}`);
console.log('');

// 演示随机取词（模拟听写）
console.log('🎲 随机听写词语:');
const randomWords = vocab.getRandomWords(5);
randomWords.forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word}`);
});
console.log('');

// OCR模块
const ocr = new OcrEngine(cfg.ocrLanguage);
console.log('🔍 OCR引擎就绪');
console.log('');

console.log('✅ 系统就绪 - Sprint 1 完成');
